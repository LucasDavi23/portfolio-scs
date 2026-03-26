// 🌸 Naomi — Card API (helpers)
//
// Nível / Level: Jovem / Young
//
// PT: Especialista em feedback cards: monta URLs específicas do Board,
//     chama o core da API (Nádia) e normaliza os itens em um formato
//     único de card.
// EN: Specialist in feedback cards: builds Board-specific URLs, calls
//     the API core (Nádia) and normalizes items into a unified card
//     format.

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// EndpointConfig — Configuração do Endpoint (Camada de Infra)
// Fornece / Provides:
// - set(url)
// - get()
// - isOffline()
import { EndpointConfig } from '/assets/js/feedback/core/config/feedback-endpoint.js';

/* -----------------------------------------------------------------------------*/
// 🧬 Dália — Image Helpers
// Fornece / Provides:
// - resolveDriveImageUrl()
import { DaliaImageHelpers } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🧬 Nádia — Core da API (infra de rede)
// Fornece / Provides:
// - fetchJsonCached()
// - setTimeoutMs()
// - setRetries()
// - setCacheTtl()
/* -----------------------------------------------------------------------------*/
import { NadiaAPICore } from '/assets/js/feedback/board/api/network/nadia-api-core-helpers.js';

/* -----------------------------------------------------------------------------*/
// 📘 Logger — System Observability Layer
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

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

// PT: Evita valores inválidos para page/limit.
// EN: Prevents invalid page/limit values
function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

// PT: Aplica opções da requisição na querystring.
// EN: Applies request options into the querystring.
function applyRequestOptions(url, opts) {
  const isObject = opts && typeof opts === 'object';

  const noCache =
    isObject && (opts.nocache === true || String(opts.nocache) === '1' || opts.force === true);

  if (noCache) {
    url.searchParams.set('nocache', '1');
    url.searchParams.set('cb', String(Date.now()));
  }

  if (isObject) {
    Object.entries(opts).forEach(([key, value]) => {
      if (key === 'nocache' || key === 'cb' || key === 'force') return;

      url.searchParams.set(key, String(value));
    });
  }

  if (!url.searchParams.has('fast')) {
    url.searchParams.set('fast', '1');
  }
}

// PT: Monta a URL de listagem da API.
// EN: Builds the API list URL with pagination and options.
function buildListUrl(plat, page, limit, opts) {
  if (!plat) {
    throw new Error('plat is required (scs|shopee|ml|google)');
  }

  const endpoint = ensureEndpoint();

  const safePage = clampInt(page, 1, 1_000_000, 1);
  const safeLimit = clampInt(limit, 1, 50, 1);

  const url = createEndpointUrl(endpoint);

  url.searchParams.set('mode', 'list');
  url.searchParams.set('plat', plat);
  url.searchParams.set('page', String(safePage));
  url.searchParams.set('limit', String(safeLimit));

  applyRequestOptions(url, opts);

  return {
    url,
    page: safePage,
    limit: safeLimit,
  };
}

/* -----------------------------------------------------------------------------*/
// Domain Helpers — Card normalization
//
// PT: Converte os dados da API para o formato padrão de card.
// EN: Converts API payload into the standard card format.
/* -----------------------------------------------------------------------------*/

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null;

  const rawPhotoSource =
    item.photo_url ||
    item.foto_url ||
    item.image_url ||
    item.image ||
    item.foto ||
    item.image_id ||
    item.foto_id ||
    '';

  return {
    platform: String(item.platform || '').toLowerCase(),

    rating: Number(item.rating || 0),

    date_br: String(item.date_br || '').trim(),

    date_ms: item.date_ms != null && item.date_ms !== '' ? Number(item.date_ms) : null,

    author: String(item.author || '').trim(),

    text: String(item.text || '').trim(),

    url: String(item.url || '').trim(),

    photo_url: DaliaImageHelpers.resolveDriveImageUrl(rawPhotoSource),
  };
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Retorna uma lista de cards normalizados da plataforma.
// EN: Returns a list of normalized feedback cards for a platform.
async function list(plat, page = 1, limit = 1, opts = { fast: 1 }) {
  const { url } = buildListUrl(plat, page, limit, opts);
  try {
    const data = await NadiaAPICore.fetchJsonCached(url.toString(), opts);

    const rawItems = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

    const items = rawItems.map(normalizeItem).filter(Boolean);

    return items;
  } catch (error) {
    Logger.error('API', 'Naomi', 'list request failed', error);
    throw error;
  }
}

// PT: Retorna cards normalizados junto com metadados de paginação.
// EN: Returns normalized cards with pagination metadata.
async function listMeta(plat, page = 1, limit = 5, opts = { fast: 1 }) {
  const { url, limit: safeLimit } = buildListUrl(plat, page, limit, opts);

  try {
    const data = await NadiaAPICore.fetchJsonCached(url.toString(), opts);

    const rawItems = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

    const items = rawItems.map(normalizeItem).filter(Boolean);

    const hasMore = typeof data?.hasMore === 'boolean' ? data.hasMore : items.length === safeLimit;

    const total = typeof data?.total === 'number' ? data.total : undefined;

    return { items, hasMore, total };
  } catch (error) {
    Logger.error('API', 'Naomi', 'listMeta request failed', error);

    throw error;
  }
}

// PT: Retorna apenas os itens mais recentes.
// EN: Returns only the most recent items.
async function latest(plat, limit = 1) {
  const items = await list(plat, 1, limit, { fast: 1 });

  return items.slice(0, limit);
}

/* -----------------------------------------------------------------------------*/
// Config Proxy — Naomi → Nádia
/* -----------------------------------------------------------------------------*/

function setTimeoutMs(ms) {
  NadiaAPICore.setTimeoutMs(ms);
}

function setRetries(n) {
  NadiaAPICore.setRetries(n);
}

function setCacheTtl(ms) {
  NadiaAPICore.setCacheTtl(ms);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const NaomiFeedbackCardAPI = {
  list,
  listMeta,
  latest,
  setTimeoutMs,
  setRetries,
  setCacheTtl,
};
