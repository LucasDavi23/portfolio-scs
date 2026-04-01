// 🧬 Nádia — Core da API (helpers)
//
// Nível / Level: Adulto / Adult
//
// PT: Especialista na camada de rede: rate limit, timeout, retry, cache em
//     memória e parse seguro de JSON. Não conhece “card”, “summary” ou
//     qualquer domínio — apenas garante chamadas estáveis.
//
// EN: Specialist in the network layer: rate limiting, timeout, retry,
//     in-memory cache and safe JSON parsing. It knows nothing about
//     “cards”, “summary” or any domain — it only guarantees stable calls.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Default Config
//
// PT: Configurações padrão da Nádia.
//
// - DEFAULT_TIMEOUT_MS: tempo máximo por tentativa antes de abortar.
// - DEFAULT_RETRIES: quantas novas tentativas serão feitas em falhas temporárias.
// - DEFAULT_TTL_MS: duração do cache local em memória.
//
// EN: Nadia default settings.
//
// - DEFAULT_TIMEOUT_MS: maximum time per attempt before aborting.
// - DEFAULT_RETRIES: how many extra attempts will be made on temporary failures.
// - DEFAULT_TTL_MS: local in-memory cache duration.
/* -----------------------------------------------------------------------------*/

let DEFAULT_TIMEOUT_MS = 11_000;
let DEFAULT_RETRIES = 3;
let DEFAULT_TTL_MS = 60_000;

/* -----------------------------------------------------------------------------*/
// Traffic Control — Anti-storm protection
//
// PT: Evita excesso de chamadas em sequência e coalesce de requests iguais.
// EN: Prevents request bursts and coalesces identical in-flight requests.
/* -----------------------------------------------------------------------------*/

const _inflight = new Map(); // url -> running Promise
let _lastCallTs = 0;
const MIN_GAP_MS = 180;

/* -----------------------------------------------------------------------------*/
// Memory Cache
//
// PT: Cache simples por URL.
// EN: Simple URL-based memory cache.
/* -----------------------------------------------------------------------------*/

const _memCache = new Map(); // key -> { exp: number, data: any }

/* -----------------------------------------------------------------------------*/
// Internal Helpers
/* -----------------------------------------------------------------------------*/

// PT: Aguarda um tempo antes de continuar.
// EN: Waits for a period before continuing.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// PT: Aplica espaçamento mínimo entre fetches para evitar tempestade de requisições.
// EN: Applies a minimum gap between fetches to avoid request storms.
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

/* -----------------------------------------------------------------------------*/
// Network Helpers — Timeout
/* -----------------------------------------------------------------------------*/

// PT: Executa fetch com timeout e suporte opcional a signal externa.
// EN: Executes fetch with timeout and optional external signal support.
async function fetchWithTimeout(url, { timeoutMs, signal } = {}) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(new Error('Timeout')), timeoutMs);

  try {
    const finalSignal = signal
      ? AbortSignal.any
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal
      : controller.signal;

    return await rateLimitedFetch(url, {
      method: 'GET',
      signal: finalSignal,
    });
  } finally {
    clearTimeout(timerId);
  }
}

/* -----------------------------------------------------------------------------*/
// URL Helpers
/* -----------------------------------------------------------------------------*/

// PT: Adiciona um parâmetro anti-cache para evitar reaproveitamento
//     de respostas intermediárias.
// EN: Adds an anti-cache parameter to avoid reusing intermediate responses.
function addBustParam(url) {
  try {
    const base = typeof location !== 'undefined' ? location.origin : 'http://localhost';

    const parsedUrl = new URL(url, base);
    parsedUrl.searchParams.set('_bust', Date.now().toString());
    return parsedUrl.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_bust=${Date.now()}`;
  }
}

/* -----------------------------------------------------------------------------*/
// JSON Helpers
/* -----------------------------------------------------------------------------*/

// PT: Faz parse seguro de JSON, mesmo se o content-type vier incorreto.
// EN: Safely parses JSON, even when content-type is incorrect.
async function safeJson(response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (/application\/json/i.test(contentType)) {
    return JSON.parse(text || '[]');
  }

  try {
    return JSON.parse(text || '[]');
  } catch {
    throw new Error('Invalid API response');
  }
}

/* -----------------------------------------------------------------------------*/
// Retry + JSON
//
// PT: Faz fetch com retry em falhas temporárias como timeout, HTTP 429 e HTTP 503.
// EN: Performs fetch with retry for temporary failures such as timeout,
//     HTTP 429 and HTTP 503.
/* -----------------------------------------------------------------------------*/

async function fetchJsonWithRetry(
  url,
  { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, signal } = {}
) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('No connection. Please try again.');
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, { timeoutMs, signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await safeJson(response);
    } catch (error) {
      lastError = error;

      const message = String(error?.message || error);
      const isTimeout = /abort|timeout|timed?out/i.test(message);
      const isHTTP429 = /HTTP 429/.test(message);
      const isHTTP503 = /HTTP 503/.test(message);

      if (attempt === retries) {
        if (isTimeout) {
          throw new Error('Timeout while calling API');
        }

        throw new Error(`Failed to call API: ${message}`);
      }

      const baseDelay = isHTTP429 ? 2000 : isHTTP503 ? 1200 : 600;
      const waitTime = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 200);

      await delay(waitTime);

      if (!isHTTP429) {
        url = addBustParam(url);
      }
    }
  }

  throw lastError;
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Busca JSON com cache em memória, retry, timeout e coalesce.
// EN: Fetches JSON with memory cache, retry, timeout and request coalescing.
async function fetchJsonCached(
  url,
  {
    ttlMs = DEFAULT_TTL_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    nocache = false,
    force = false,
    cb, // PT: parâmetro anti-cache usado para forçar resposta nova / EN: cache-buster parameter used to force a fresh response
  } = {}
) {
  const key = String(url);
  const now = Date.now();

  const bypass =
    nocache === true ||
    String(nocache) === '1' ||
    force === true ||
    String(force) === '1' ||
    (typeof cb !== 'undefined' && String(cb).length > 0);

  // PT: Se houver bypass, a chamada será sempre nova.
  // EN: If bypass is enabled, the request will always be fresh.
  if (bypass) {
    return await fetchJsonWithRetry(key, { timeoutMs, retries });
  }

  // 1) PT: tenta cache em memória
  //    EN: tries memory cache first
  const cachedEntry = _memCache.get(key);
  if (cachedEntry && cachedEntry.exp > now) {
    return cachedEntry.data;
  }

  // 2) PT: se já existir requisição em andamento para a mesma URL, reutiliza
  //    EN: if an identical request is already running, reuse it
  if (_inflight.has(key)) {
    return _inflight.get(key);
  }

  // 3) PT: dispara chamada real e salva no cache
  //    EN: performs the real request and stores it in cache
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

/* -----------------------------------------------------------------------------*/
// Runtime Config
//
// PT: Permite ajustar os valores padrão da Nádia em tempo de execução.
// EN: Allows Nadia default values to be adjusted at runtime.
/* -----------------------------------------------------------------------------*/

function setTimeoutMs(ms) {
  if (ms > 0) {
    DEFAULT_TIMEOUT_MS = ms;
  }
}

function setRetries(retries) {
  if (retries >= 0) {
    DEFAULT_RETRIES = retries;
  }
}

function setCacheTtl(ms) {
  if (ms >= 0) {
    DEFAULT_TTL_MS = ms;
  }
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const NadiaAPICore = {
  fetchJsonCached,
  setTimeoutMs,
  setRetries,
  setCacheTtl,
};
