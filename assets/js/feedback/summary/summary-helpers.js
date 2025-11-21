// ✨ Athenais — Guardiã da Lógica do Summary (Helpers)
//
// PT: Athenais simboliza precisão e sabedoria técnica. Aqui, ela cuida apenas
//     da lógica “pura” do summary:
//       • cache local (snapshot e TTL),
//       • fetch ao Apps Script com timeout,
//       • retry automático com backoff,
//       • validação da resposta recebida,
//       • conversão dos dados brutos (items[]) para um objeto final de resumo.
//
// EN: Athenais represents precision and technical wisdom. Here she handles only
//     the “pure” logic of the summary:
//       • local cache (snapshot and TTL),
//       • fetch to Apps Script with timeout,
//       • automatic retry with backoff,
//       • validation of the received response,
//       • conversion of raw data (items[]) into the final summary object.

// import endpoint
import { obterEndpoint } from '/assets/js/feedback/feedback.base.js';

// ============================================================
// 1. CONFIGURAÇÕES INTERNAS (CACHE, TIMEOUT, RETRY)
// ============================================================

// PT: Chave usada no localStorage para guardar o resumo mais recente.
// EN: Key used in localStorage to store the latest summary snapshot.
const CACHE_KEY = 'scs_feedback_summary_scs';

// PT: Tempo máximo que o cache é considerado válido (60 segundos).
// EN: Maximum time the cache is considered valid (60 seconds).
const CACHE_TTL_MS = 60_000;

// PT: Timeout para cada requisição ao GAS (em milissegundos).
// EN: Timeout for each GAS request (in milliseconds).
const FETCH_TIMEOUT_MS = 4_000;

// PT: Quantas tentativas extras além da primeira (0 = só uma tentativa).
// EN: How many extra retries besides the first attempt (0 = only once).
const MAX_RETRIES = 1;

// ============================================================
// 2. CACHE HELPERS (localStorage)
// ============================================================

// PT: Tenta ler o resumo do cache e verifica se ainda está dentro da validade.
// EN: Tries to read the summary from cache and checks if it's still valid.
export function loadSummaryFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY); // PT: Lê do localStorage.
    if (!raw) return null; // PT: Sem cache.

    const parsed = JSON.parse(raw); // PT: Converte de JSON.
    const { timestamp, avg, total, buckets } = parsed || {}; // PT: Extrai dados.

    if (typeof timestamp !== 'number') return null; // PT: Timestamp inválido.

    const age = Date.now() - timestamp; // PT: Calcula idade do cache.
    if (age > CACHE_TTL_MS) {
      // PT: Cache expirado.
      // EN: Cache expired.
      return null;
    }

    if (typeof avg !== 'number' || typeof total !== 'number' || typeof buckets !== 'object') {
      return null; // PT: Dados inválidos.
    }

    return parsed; // PT: Retorna o resumo válido.
  } catch (err) {
    console.warn('summary.js: erro ao ler cache / error reading cache.', err);
    return null;
  }
}

// PT: Salva no cache o resumo atual junto com o timestamp.
// EN: Saves the current summary to cache along with a timestamp.
export function saveSummarytoCache(summary) {
  try {
    const payload = {
      // PT: Prepara o payload.
      avg: summary.avg, //  PT: Média das avaliações.
      total: summary.total, // PT: Total de avaliações.
      buckets: summary.buckets, // PT: Mapa de estrelas.
      timestamp: Date.now(), // PT: Marca o tempo atual.
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); // PT: Salva como JSON.
  } catch (err) {
    console.warn('summary.js: erro ao salvar cache / cache write error:', err);
  }
}

// ============================================================
// 3. REDE: FETCH COM TIMEOUT + RETRY
// ============================================================

// PT: Implementa um fetch com timeout manual usando Promise.race.
// EN: Implements fetch with manual timeout using Promise.race.

export function fetchWithTimeout(url, timeoutMs) {
  // PT: Retorna uma Promise.
  return Promise.race([
    // PT: Competição entre:
    fetch(url), // PT: A promessa do fetch.
    new Promise((_, reject) => {
      // PT: E uma promessa que rejeita após timeout.
      const id = setTimeout(() => {
        // PT: Timeout atingido.
        clearTimeout(id); // PT: Limpa o timeout.
        reject(new Error('Timeout na requisição / Request timed out')); // PT: Rejeita a promessa.
      }, timeoutMs);
    }),
  ]);
}

// PT: Faz a requisição ao GAS com tentativas extras (retry).
// EN: Performs the request to GAS with extra retries.
export async function fetchSummaryWithRetry() {
  // ENDPOINT oficial do sistema — obtido via módulo base
  const ENDPOINT = obterEndpoint();

  if (!ENDPOINT) {
    console.warn('summary-helpers.js: FEEDBACK_ENDPOINT não definido / not defined.');
    return;
  }

  // PT: Retorna uma Promise.
  const url = `${ENDPOINT}?mode=list&plat=scs&limit=200&page=1`; // PT: URL do endpoint.

  let attempt = 0; // PT: Contador de tentativas.
  let lastError = null; // PT: Último erro ocorrido.

  while (attempt <= MAX_RETRIES) {
    // PT: Enquanto não excedeu tentativas.
    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS); // PT: Tenta buscar com timeout.
      if (!res.ok) {
        // PT: Resposta inválida?
        throw new Error('Resposta não OK do servidor / Server response not OK: ' + res.status);
      }

      const data = await res.json(); // PT: Converte resposta em JSON.
      return data; // PT: se deu certo, retornamos os dados imediatamente.
    } catch (err) {
      lastError = err; // PT: Guarda o erro.
      attempt += 1; // PT: Incrementa tentativas.
      console.warn(`summary.js: tentativa ${attempt} falhou / attempt failed:`, err);

      // PT: Se ainda temos retries disponíveis, o loop continua.
      // EN: If we still have retries available, the loop continues.
    }
  }

  // PT: Se chegamos aqui, todas as tentativas falharam.
  // EN: If we reach here, all attempts failed.
  throw lastError || new Error('Falha ao buscar summary / Failed to fetch summary.');
}

// ============================================================
// 4. PARSE DOS DADOS: LISTA -> SUMMARY
// ============================================================

// PT: Converte a resposta do GAS em um objeto “summary” com:
//     { avg, total, buckets: {1,2,3,4,5} }
// EN: Converts GAS response into a “summary” object:
//     { avg, total, buckets: {1,2,3,4,5} }
export function buildSummaryFromResponse(data) {
  // PT: Recebe dados brutos da API.
  // PT: Aceitamos tanto { items: [...] } quanto [...] direto.
  // EN: We accept both { items: [...] } and [...] directly.
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

  const ratings = items
    .map((item) => {
      // PT: Mapeia para extrair avaliações.
      const raw = item.rating ?? item.stars ?? item.estrelas ?? item.nota ?? item.rate; // PT: Vários nomes possíveis.

      const n = Number(raw); // PT: Converte para número. "aqui o n deve ser Number ou numero em pt"
      return Number.isFinite(n) ? n : null; // PT: Retorna número ou null.
    })
    .filter((n) => n !== null); // PT: Filtra nulos.

  const total = ratings.length; // PT: Total de avaliações.

  if (!total) {
    // PT: Sem avaliações válidas ainda.
    // EN: No valid ratings yet.

    return {
      avg: 0, // PT: Média das avaliações.
      total: 0, // PT: Total de avaliações.
      buckets: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // PT: Mapa vazio.
    };
  }

  const sum = ratings.reduce((acc, n) => acc + n, 0); // PT: Soma todas as avaliações.
  const avg = sum / total; // PT: Calcula a média.

  const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; // PT: Inicializa contadores.
  ratings.forEach((r) => {
    // PT: Conta cada avaliação. o que seria o (r) ? acho que rating
    let star = Math.round(r); // PT: Arredonda para a estrela mais próxima.
    if (star < 1) star = 1;
    if (star > 5) star = 5;
    buckets[star] += 1;
  });

  return { avg, total, buckets }; // PT: Retorna o resumo.
}
