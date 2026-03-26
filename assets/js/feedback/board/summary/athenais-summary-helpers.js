/* -----------------------------------------------------------------------------*/
// ✨ Athenais — Summary Helpers
//
// Nível / Level: Jovem / Young
//
// PT: Athenais cuida da lógica pura do summary com precisão:
// - cache local,
// - requisições ao GAS com timeout,
// - retry com backoff,
// - validação,
// - transformação dos dados em resumo final.
//
// EN: Athenais handles the pure summary logic with precision:
// - local cache,
// - GAS requests with timeout,
// - retry with backoff,
// - validation,
// - transforming raw data into the final summary.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// EndpointConfig — Endpoint Configuration
// Fornece / Provides:
// - set(url)
// - get()
/* -----------------------------------------------------------------------------*/
import { EndpointConfig } from '/assets/js/feedback/core/config/feedback-endpoint.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares usadas internamente neste módulo.
// EN: Helper functions used internally in this module.
/* -----------------------------------------------------------------------------*/

// PT: Cria URL absoluta para endpoint local ou remoto.
// EN: Creates absolute URL for local or remote endpoint.
function createEndpointUrl(endpoint) {
  return endpoint.startsWith('http')
    ? new URL(endpoint)
    : new URL(endpoint, window.location.origin);
}

// PT: Garante que existe um endpoint válido (não offline).
// EN: Ensures a valid (non-offline) endpoint is configured.
function ensureEndpoint() {
  const endpoint = EndpointConfig.get();

  if (EndpointConfig.isOffline()) {
    throw new Error('Feedback endpoint is not configured (offline mode).');
  }

  return endpoint;
}

/* -----------------------------------------------------------------------------*/
// Internal Settings
/* -----------------------------------------------------------------------------*/

// PT: Chave do localStorage para o resumo da plataforma (ex: SCS).
// ⚠️ Personalize esse valor caso utilize múltiplas fontes (SCS, Shopee, ML, etc).
// Ex: 'shopee_feedback_summary', 'ml_feedback_summary'
//
// EN: localStorage key for the platform summary (e.g., SCS).
// ⚠️ Customize this value if using multiple data sources (SCS, Shopee, ML, etc).
// Example: 'shopee_feedback_summary', 'ml_feedback_summary'
const CACHE_KEY = 'scs_feedback_summary_scs';

// PT: Tempo de validade do cache local (TTL = Time To Live).
// Após esse período, o cache é considerado expirado.
//
// EN: Local cache validity time (TTL = Time To Live).
// After this period, the cache is considered expired.
const CACHE_TTL_MS = 60_000;

// PT: Timeout de cada requisição.
// EN: Timeout for each request.
const FETCH_TIMEOUT_MS = 8_000;

// PT: Quantidade de retries além da primeira tentativa.
// EN: Number of retries besides the first attempt.
const MAX_RETRIES = 1;

// PT: Espera base entre tentativas.
// EN: Base wait time between attempts.
const RETRY_DELAY_MS = 500;

/* -----------------------------------------------------------------------------*/
// Cache Helpers
/* -----------------------------------------------------------------------------*/

// PT: Valida se o objeto tem formato básico de summary.
// EN: Validates whether the object has the basic summary shape.
function isValidSummaryShape(summary) {
  return (
    summary &&
    typeof summary === 'object' &&
    typeof summary.avg === 'number' &&
    typeof summary.total === 'number' &&
    typeof summary.buckets === 'object' &&
    summary.buckets !== null
  );
}

// PT: Lê o cache válido dentro do TTL.
// EN: Reads valid cache data within TTL.
function loadSummaryFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidSummaryShape(parsed)) return null;
    if (typeof parsed.timestamp !== 'number') return null;

    const cacheAge = Date.now() - parsed.timestamp;
    if (cacheAge > CACHE_TTL_MS) return null;

    return parsed;
  } catch {
    return null;
  }
}

// PT: Lê o snapshot salvo, sem validar TTL.
// EN: Reads the saved snapshot without TTL validation.
function loadSummarySnapshot() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return isValidSummaryShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// PT: Salva o summary atual no cache com timestamp.
// EN: Saves the current summary to cache with a timestamp.
function saveSummaryToCache(summary) {
  try {
    const payload = {
      avg: summary.avg,
      total: summary.total,
      buckets: summary.buckets,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // PT: Falha de cache não deve quebrar o fluxo.
    // EN: Cache failure should not break the flow.
  }
}

/* -----------------------------------------------------------------------------*/
// Network Helpers
/* -----------------------------------------------------------------------------*/

// PT: Aguarda alguns milissegundos.
// EN: Waits for a few milliseconds.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// PT: Faz fetch com timeout manual.
// EN: Performs fetch with a manual timeout.
function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout na requisição / Request timed out'));
    }, timeoutMs);

    fetch(url)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// PT: Faz fetch JSON com retry simples e backoff.
// EN: Performs JSON fetch with simple retry and backoff.
async function fetchJsonWithRetry(url) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= MAX_RETRIES) {
    try {
      const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);

      if (!response.ok) {
        throw new Error(`Resposta não OK do servidor / Server response not OK: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES) {
        const retryDelay = RETRY_DELAY_MS * (attempt + 1);
        await delay(retryDelay);
      }

      attempt += 1;
    }
  }

  throw lastError || new Error('Falha ao buscar summary / Failed to fetch summary.');
}

/* -----------------------------------------------------------------------------*/
// Summary Fetch
/* -----------------------------------------------------------------------------*/

// PT: Busca o summary via lista completa.
// EN: Fetches the summary through the full list endpoint.
async function fetchSummaryWithRetry() {
  const endpointUrl = ensureEndpoint();

  const url = createEndpointUrl(endpointUrl);
  url.searchParams.set('mode', 'list');
  url.searchParams.set('plat', 'scs');
  url.searchParams.set('limit', '200');
  url.searchParams.set('page', '1');

  return fetchJsonWithRetry(url.toString());
}

// PT: Busca o summary agregado via endpoint META.
// EN: Fetches the aggregated summary through the META endpoint.
async function fetchSummaryMetaWithRetry({ forceFresh = false } = {}) {
  const endpointUrl = ensureEndpoint(); // 👈 obrigatório

  const url = createEndpointUrl(endpointUrl);
  url.searchParams.set('mode', 'meta');
  url.searchParams.set('plat', 'scs');

  if (forceFresh) {
    url.searchParams.set('nocache', '1');
    url.searchParams.set('cb', String(Date.now()));
  }

  return fetchJsonWithRetry(url.toString());
}

/* -----------------------------------------------------------------------------*/
// Summary Parser
/* -----------------------------------------------------------------------------*/

// PT: Estrutura vazia padrão do summary.
// EN: Default empty summary structure.
function createEmptySummary() {
  return {
    avg: 0,
    total: 0,
    buckets: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

// PT: Converte resposta da API em objeto final de summary.
// EN: Converts the API response into the final summary object.
function buildSummaryFromResponse(data) {
  // PT: Atalho para resposta já agregada no formato META.
  // EN: Shortcut for already aggregated META-shaped responses.
  if (isValidSummaryShape(data)) {
    return {
      avg: data.avg,
      total: data.total,
      buckets: data.buckets,
    };
  }

  // PT: Aceita tanto { items: [] } quanto [] direto.
  // EN: Accepts both { items: [] } and direct [] input.
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

  const ratings = items
    .map((item) => {
      const rawRating = item.rating ?? item.stars ?? item.estrelas ?? item.nota ?? item.rate;
      const numericRating = Number(rawRating);

      return Number.isFinite(numericRating) ? numericRating : null;
    })
    .filter((numericRating) => numericRating !== null);

  const total = ratings.length;
  if (!total) return createEmptySummary();

  const ratingSum = ratings.reduce((accumulator, numericRating) => accumulator + numericRating, 0);
  const avg = ratingSum / total;

  const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  ratings.forEach((rating) => {
    let star = Math.round(rating);

    if (star < 1) star = 1;
    if (star > 5) star = 5;

    buckets[star] += 1;
  });

  return { avg, total, buckets };
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const AthenaisSummaryHelpers = {
  loadSummaryFromCache,
  loadSummarySnapshot,
  saveSummaryToCache,
  fetchWithTimeout,
  fetchSummaryWithRetry,
  fetchSummaryMetaWithRetry,
  buildSummaryFromResponse,
};
