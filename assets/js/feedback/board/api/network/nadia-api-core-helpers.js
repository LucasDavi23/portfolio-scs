// 🧬 Nádia — Core da API (helpers)
//
// Nível / Level: Adulto / Adult
//
// PT: Especialista na camada de rede: rate limit, timeout, retry, cache em
//     memória e parse seguro de JSON. Não conhece “card”, “summary” ou
//     domínio algum – só garante chamadas estáveis.
// EN: Specialist in the network layer: rate limiting, timeout, retry,
//     in-memory cache and safe JSON parsing. It knows nothing about
//     “cards” or any domain – only stable API calls.
/* -----------------------------------------------------------------------------*/

// ========= Config padrão da Nádia =========
// DEFAULT_RETRIES → controla quantas vezes o
// sistema tenta novamente quando o Apps Script responde 503, 429 ou timeout.

// DEFAULT_TIMEOUT_MS → controla quanto tempo cada tentativa
// pode demorar antes de abortar.

// DEFAULT_TTL_MS → define quanto tempo o cache local (memória) é
// mantido antes de forçar nova leitura.

let DEFAULT_TIMEOUT_MS = 11_000; // timeout por tentativa
let DEFAULT_RETRIES = 3; // tentativas extras
let DEFAULT_TTL_MS = 60_000; // cache local (60s)

// ========= Controle de tráfego (anti-tempestade) =========
const _inflight = new Map(); // url -> Promise em andamento
let _lastCallTs = 0;
const MIN_GAP_MS = 180; // espaçamento mínimo entre fetches

function rateLimitedFetch(url, opts = {}) {
  const now = Date.now();
  const gap = now - _lastCallTs;

  if (gap < MIN_GAP_MS) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        _lastCallTs = Date.now();
        fetch(url, opts).then(resolve, reject);
      }, MIN_GAP_MS - gap);
    });
  }

  _lastCallTs = now;
  return fetch(url, opts);
}

// ========= Cache simples por URL =========
const _memCache = new Map(); // key -> { exp: number, data: any }

// ========= Helpers internos =========

// ========= Helpers de rede (JSON + Retry + Timeout) =========
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ========= Fetch com timeout, retry, cache e normalização =========
// Faz fetch com timeout customizado, abortável via signal,
// com retry em falhas temporárias (503, 429, timeout).
async function fetchWithTimeout(url, { timeoutMs, signal } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(new Error('Timeout')), timeoutMs);

  try {
    const finalSignal = signal
      ? AbortSignal.any
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal
      : controller.signal;

    const resp = await rateLimitedFetch(url, {
      method: 'GET',
      signal: finalSignal,
    });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

// Adiciona parâmetro anti-cache para evitar caches intermediários
function addBustParam(url) {
  try {
    const u = new URL(url, location.origin);
    u.searchParams.set('_bust', Date.now().toString());
    return u.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}_bust=${Date.now()}`;
  }
}

// ========= JSON & normalização =========

// Parse seguro de JSON, mesmo que o content-type esteja errado
// (Tenta analisar o texto como JSON de qualquer forma)
async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  const txt = await res.text();
  if (/application\/json/i.test(ct)) return JSON.parse(txt || '[]');
  try {
    return JSON.parse(txt || '[]');
  } catch {
    throw new Error('Resposta inválida da API');
  }
}

// ========= Retry + JSON =========
// Faz fetch com retry em falhas temporárias (503, 429, timeout),
async function fetchJsonWithRetry(
  url,
  { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, signal } = {}
) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Sem conexão. Tente novamente.');
  }

  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetchWithTimeout(url, { timeoutMs, signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await safeJson(resp);
      return data;
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err);
      const isTimeout = /abort|timeout|timed?out/i.test(msg);
      const isHTTP429 = /HTTP 429/.test(msg);
      const isHTTP503 = /HTTP 503/.test(msg);

      // última tentativa: normalize a mensagem
      if (attempt === retries) {
        if (isTimeout) throw new Error('Timeout ao chamar API');
        throw new Error(`Falha ao chamar API: ${msg}`);
      }

      // backoff com jitter (429 espera mais e NÃO faz cache-bust)
      const base = isHTTP429 ? 2000 : isHTTP503 ? 1200 : 600;
      const wait = base * Math.pow(2, attempt) + Math.floor(Math.random() * 200);

      await delay(wait);

      if (!isHTTP429) {
        url = addBustParam(url); // evita reuso de resposta intermediária
      }
      continue;
    }
  }
}

// ========= API pública da Nádia =========
export async function fetchJsonCached(
  url,
  {
    ttlMs = DEFAULT_TTL_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,

    // ✅ novos flags (vêm da Naomi via opts)
    nocache = false,
    force = false,
    cb,
  } = {}
) {
  const key = String(url);
  const now = Date.now();

  // ✅ decide bypass
  const bypass =
    nocache === true ||
    String(nocache) === '1' ||
    force === true ||
    String(force) === '1' ||
    (typeof cb !== 'undefined' && String(cb).length > 0);

  // ✅ se bypass, não usa cache e não coalesce (cada request é fresh)
  if (bypass) {
    return await fetchJsonWithRetry(key, { timeoutMs, retries });
  }

  // 1) cache em memória
  const hit = _memCache.get(key);
  if (hit && hit.exp > now) return hit.data;

  // 2) coalesce: se já existe chamada em andamento para o mesmo URL, espere ela
  if (_inflight.has(key)) {
    return _inflight.get(key);
  }

  // 3) dispara a chamada real com retry
  const runner = (async () => {
    try {
      const data = await fetchJsonWithRetry(key, { timeoutMs, retries });
      _memCache.set(key, { exp: now + ttlMs, data });
      return data;
    } finally {
      _inflight.delete(key);
    }
  })();

  _inflight.set(key, runner);
  return runner;
}

// Permite ajustar os valores padrão de timeout, retry e cache TTL
export function setTimeoutMs(ms) {
  if (ms > 0) DEFAULT_TIMEOUT_MS = ms;
}

// Ajusta o número de tentativas de retry
export function setRetries(n) {
  if (n >= 0) DEFAULT_RETRIES = n;
}

// Ajusta o TTL do cache em memória
export function setCacheTtl(ms) {
  if (ms >= 0) DEFAULT_TTL_MS = ms;
}

// -----------------------------------------------------------------------------
// 🧠 ApiCore — Pacote do Núcleo de Rede
// PT: Reúne as funções essenciais da Nádia (CORE) em um único objeto, facilitando
//     a importação e o uso. Funciona como uma “caixa de ferramentas” contendo
//     fetch com cache, timeout, retry e ajustes dinâmicos de configuração.
// EN: Groups Nadia’s core network functions into a single object, making it
//     easy to import and use. Works as a “toolbox”, providing cached fetch,
//     timeout, retry and dynamic configuration controls.
// -----------------------------------------------------------------------------
export const NadiaAPICore = {
  fetchJsonCached,
  setTimeoutMs,
  setRetries,
  setCacheTtl,
};
