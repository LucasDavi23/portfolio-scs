// /assets/js/feedback/board/api/card/naomi-card-api-helpers.js
// 🌸 Naomi — Card API (helpers)
// PT: Especialista em feedback cards: monta URLs específicas do Board,
//     chama o core da API (Nádia) e normaliza os itens em um formato
//     único de card.
// EN: Specialist in feedback cards: builds Board-specific URLs, calls
//     the API core (Nádia) and normalizes items into a unified card
//     format.
/* -----------------------------------------------------------------------------*/

// EndpointConfig — Configuração do Endpoint (Camada de Infra)
// Fornece:
// - set(url)
// - get()
import { EndpointConfig } from '/assets/js/feedback/core/config/feedback-endpoint.js';

/* -----------------------------------------------------------------------------*/

// 🧬 Dália — Image Helpers
import { toPublicImageUrl } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🧬 Nádia — Core da API (infra de rede)
// NadiaAPICore fornece:
// - fetchJsonCached()
// - setTimeoutMs()
// - setRetries()
// - setCacheTtl()
/* -----------------------------------------------------------------------------*/
import { NadiaAPICore } from '/assets/js/feedback/board/api/rede/nadia-api-core-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🔹 Helper interno: garante um endpoint válido para as operações da Naomi.
// PT: Centraliza a leitura segura do endpoint para uso nos cards.
// EN: Centralizes safe endpoint read for card operations.
/* -----------------------------------------------------------------------------*/

function ensureEndpoint() {
  const endpoint = EndpointConfig.get();
  if (!endpoint) {
    throw new error('FEEDBACK_ENDPOINT não definido.');
  }
  return endpoint;
}

// ========= Helpers de domínio (CARD) =========
// PT: Funções auxiliares específicas para o domínio dos cards.
// EN: Helper functions specific to the card domain.
/* -----------------------------------------------------------------------------*/
function toISO(d) {
  if (!d) return '';
  const m = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(m)) return m;

  const br = m.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;

  const date = new Date(m);
  return isNaN(date) ? m : date.toISOString().slice(0, 10);
}

function normalizeItem(x) {
  if (!x || typeof x !== 'object') return null;

  const pickStr = (v) => (typeof v === 'string' ? v.trim() : '');
  const rawFoto =
    [x.foto_url, x.image_url, x.photo_public_url, x.photo_url, x.image, x.link, x.url]
      .map(pickStr)
      .find(Boolean) || '';

  return {
    estrelas: Number(x.estrelas ?? x.rating ?? 0) || 0,
    data: toISO(x.data ?? x.date ?? ''),
    autor: (x.autor ?? x.author ?? '').toString().trim(),
    texto: (x.texto ?? x.comment ?? '').toString().trim(),
    url: pickStr(x.url) || undefined,
    foto_url: toPublicImageUrl(rawFoto) || undefined,
    plataforma: (x.plataforma ?? x.plat ?? '').toString().trim().toLowerCase() || undefined,
  };
}

function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
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

  if (opts && typeof opts === 'object') {
    Object.entries(opts).forEach(([k, v]) => url.searchParams.set(k, String(v)));
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
export const FeedbackCardAPI = {
  list,
  listMeta,
  latest,
  setTimeoutMs,
  setRetries,
  setCacheTtl,
};

// Compatibilidade com legado, se ainda tiver algo usando window.FeedbackAPI
if (typeof window !== 'undefined') {
  window.FeedbackAPI = FeedbackCardAPI;
}
