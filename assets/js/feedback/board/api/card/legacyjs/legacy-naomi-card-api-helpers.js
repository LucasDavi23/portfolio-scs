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

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

// EndpointConfig — Configuração do Endpoint (Camada de Infra)
// Fornece / Provides:
// - set(url)
// - get()
import { EndpointConfig } from '/assets/js/feedback/core/config/feedback-endpoint.js';

/* -----------------------------------------------------------------------------*/

// 🧬 Dália — Image Helpers
// Fornece / Provides:
// - toPublicImageUrl(url)

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
import { Logger } from '/assets/js/system/utils/logger.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares usadas internamente neste módulo.
// EN: Helper functions used internally in this module.
/* -----------------------------------------------------------------------------*/

// PT: Garante que existe um endpoint configurado.
// EN: Ensures an endpoint is configured before making requests.

function ensureEndpoint() {
  const endpoint = EndpointConfig.get();
  if (!endpoint) {
    throw new Error('FEEDBACK_ENDPOINT não definido.');
  }
  return endpoint;
}

// PT: Aplica opções da requisição na querystring.
// EN: Applies request options into the querystring.

function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

// ========= Helpers de domínio (CARD) =========
// PT: Funções auxiliares específicas para o domínio dos cards.
// EN: Helper functions specific to the card domain.
/* -----------------------------------------------------------------------------*/

function normalizeItem(x) {
  if (!x || typeof x !== 'object') return null;

  const pickStr = (v) => (typeof v === 'string' ? v.trim() : '');
  const rawFoto =
    [x.foto_url, x.image_url, x.photo_public_url, x.photo_url, x.image, x.link, x.url]
      .map(pickStr)
      .find(Boolean) || '';

  return {
    platform: String(x.platform || '').toLowerCase(),
    rating: Number(x.rating || 0),
    // ✅ mantém os campos novos do GAS (Selah/Elara já sabem ler isso)
    date_br: String(x.date_br || '').trim(),
    date_ms: x.date_ms != null && x.date_ms !== '' ? Number(x.date_ms) : null,
    author: String(x.author || '').trim(),
    text: String(x.text || '').trim(),
    url: String(x.url || '').trim(),
    photo_url: DaliaImageHelpers.toPublicImageUrl(x.photo_url || ''),
  };
}

// ========= API pública da Naomi (CARD) =========
export async function list(plat, page = 1, limit = 1, opts = { fast: 1 }) {
  if (!plat) throw new Error('plat é obrigatório (scs|shopee|ml|google)');

  const pg = clampInt(page, 1, 1_000_000, 1);
  const lim = clampInt(limit, 1, 50, 1);

  const endpoint = ensureEndpoint();
  if (!endpoint) throw new Error('FEEDBACK_ENDPOINT não definido.');

  const url = new URL(endpoint);
  url.searchParams.set('mode', 'list');
  url.searchParams.set('plat', plat);
  url.searchParams.set('page', String(pg));
  url.searchParams.set('limit', String(lim));

  // ---------------------------------------------
  // ✅ nocache support (GAS + client cache bust)
  // ---------------------------------------------
  const isObj = opts && typeof opts === 'object';
  const nocache =
    isObj && (opts.nocache === true || String(opts.nocache) === '1' || opts.force === true);

  if (nocache) {
    url.searchParams.set('nocache', '1');
    url.searchParams.set('cb', String(Date.now())); // cache buster
  }

  // adiciona opts como querystring, mas SEM duplicar nocache/cb
  if (isObj) {
    Object.entries(opts).forEach(([k, v]) => {
      if (k === 'nocache' || k === 'cb' || k === 'force') return;
      url.searchParams.set(k, String(v));
    });

    // garante fast padrão se não vier
    if (!url.searchParams.has('fast')) url.searchParams.set('fast', '1');
  } else {
    url.searchParams.set('fast', '1');
  }

  const data = await NadiaAPICore.fetchJsonCached(url.toString(), opts);
  const arr = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];

  return arr.map(normalizeItem).filter(Boolean);
}

export async function listMeta(plat, page = 1, limit = 5, opts = { fast: 1 }) {
  if (!plat) throw new Error('plat é obrigatório (scs|shopee|ml|google)');

  const pg = clampInt(page, 1, 1_000_000, 1);
  const lim = clampInt(limit, 1, 50, 5);

  const endpoint = ensureEndpoint();
  if (!endpoint) throw new Error('FEEDBACK_ENDPOINT não definido.');

  const url = new URL(endpoint);
  url.searchParams.set('mode', 'list');
  url.searchParams.set('plat', plat);
  url.searchParams.set('page', String(pg));
  url.searchParams.set('limit', String(lim));

  const isObj = opts && typeof opts === 'object';
  const nocache =
    isObj && (opts.nocache === true || String(opts.nocache) === '1' || opts.force === true);

  if (nocache) {
    url.searchParams.set('nocache', '1');
    url.searchParams.set('cb', String(Date.now()));
  }

  if (isObj) {
    Object.entries(opts).forEach(([k, v]) => {
      if (k === 'nocache' || k === 'cb' || k === 'force') return;
      url.searchParams.set(k, String(v));
    });
    if (!url.searchParams.has('fast')) url.searchParams.set('fast', '1');
  } else {
    url.searchParams.set('fast', '1');
  }

  const data = await NadiaAPICore.fetchJsonCached(url.toString(), opts);

  const itemsArr = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
  const items = itemsArr.map(normalizeItem).filter(Boolean);

  const hasMore = typeof data?.hasMore === 'boolean' ? data.hasMore : items.length === lim;
  const total = typeof data?.total === 'number' ? data.total : undefined;

  return { items, hasMore, total };
}

export async function latest(plat, limit = 1) {
  const items = await list(plat, 1, limit, { fast: 1 });
  return items.slice(0, limit);
}

// ========= Proxy de config (Naomi → Nádia) =========
export function setTimeoutMs(ms) {
  NadiaAPICore.setTimeoutMs(ms);
}

export function setRetries(n) {
  NadiaAPICore.setRetries(n);
}

export function setCacheTtl(ms) {
  NadiaAPICore.setCacheTtl(ms);
}

// ========= Agregador do import =========
export const NaomiFeedbackCardAPI = {
  list,
  listMeta,
  latest,
  setTimeoutMs,
  setRetries,
  setCacheTtl,
};

// Compatibilidade com legado, se ainda tiver algo usando window.FeedbackAPI
if (typeof window !== 'undefined') {
  window.FeedbackAPI = NaomiFeedbackCardAPI;
}
