/* -----------------------------------------------------------------------------*/
// 🪷 Dália — Image Helpers
//
// Nível / Level: Jovem / Young
//
// PT: Lógica pura de imagem: Drive/GAS, proxy, URLs e validação.
// EN: Pure image logic: Drive/GAS, proxy, URLs and validation.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// ImageEndpointConfig — Image Endpoint Configuration
// Fornece / Provides:
// - set(url)
// - get()
// - isOffline()
/* -----------------------------------------------------------------------------*/
import { ImageEndpointConfig } from '/assets/js/feedback/core/config/feedback-image-endpoint.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares internas para validação e montagem de URLs.
// EN: Internal helper functions for validation and URL building.
/* -----------------------------------------------------------------------------*/

// PT: Garante que existe um endpoint válido de imagem (não offline).
// EN: Ensures a valid image endpoint (non-offline).
function ensureImageEndpoint() {
  const endpoint = ImageEndpointConfig.get();

  if (ImageEndpointConfig.isOffline()) {
    throw new Error('Image endpoint is not configured (offline mode).');
  }

  return endpoint;
}

/* -----------------------------------------------------------------------------*/
// Drive Parsing
/* -----------------------------------------------------------------------------*/

// PT: Extrai { id, rk } de um valor do Drive.
// Aceita:
// - ID puro
// - links /file/d/<ID>
// - links com ?id=<ID>
// - links legados com id= ou image_id=
//
// EN: Extracts { id, rk } from a Drive value.
// Accepts:
// - pure ID
// - /file/d/<ID> links
// - links with ?id=<ID>
// - legacy links with id= or image_id=
function parseDrive(raw, item = {}) {
  const source = String(raw || '').trim();
  if (!source) return { id: '', rk: '' };

  if (/^[\w-]{10,}$/.test(source)) {
    const resourceKey = item.resourcekey || item.resourceKey || item.foto_resourcekey || '';
    return { id: source, rk: resourceKey || '' };
  }

  let match = source.match(/\/file\/d\/([-\w]{10,})/i);
  if (match) {
    const resourceKey = (source.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: match[1], rk: resourceKey };
  }

  match = source.match(/[?&]id=([-\w]{10,})/i);
  if (match) {
    const resourceKey = (source.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: match[1], rk: resourceKey };
  }

  match = source.match(/[?&](?:id|image_id)=([-\w]{10,})/i);
  if (match) {
    const resourceKey = (source.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: match[1], rk: resourceKey };
  }

  return { id: '', rk: '' };
}

/* -----------------------------------------------------------------------------*/
// Drive ID Helpers
/* -----------------------------------------------------------------------------*/

// PT: Valida se o valor parece ser um ID de Drive.
// EN: Validates whether the value looks like a Drive ID.
const isDriveId = (value) => /^[\w-]{10,}$/.test(String(value || '').trim());

// PT: Extrai um ID plausível de:
// - ID puro
// - links /file/d/<ID>
// - links com ?id=<ID>
// - fallback por padrão de ID
//
// EN: Extracts a plausible ID from:
// - pure ID
// - /file/d/<ID> links
// - links with ?id=<ID>
// - fallback ID pattern
function extractDriveId(anyUrlOrId) {
  if (!anyUrlOrId) return '';

  const source = String(anyUrlOrId).trim();

  if (/^[\w-]{20,}$/.test(source)) {
    return source;
  }

  const match =
    source.match(/\/file\/d\/([-\w]{10,})/i) ||
    source.match(/[?&]id=([-\w]{10,})/i) ||
    source.match(/([-\w]{20,})/);

  return match ? match[1] : '';
}

/* -----------------------------------------------------------------------------*/
// Proxy URL Builders
/* -----------------------------------------------------------------------------*/

// PT: Monta a URL do proxy de imagem no GAS a partir de um ID/link do Drive.
// EN: Builds the GAS image proxy URL from a Drive ID/link.
//
// Exemplo / Example:
// https://SEU_EXEC/exec?action=img&id=<ID>&v=<cacheBust>
function imgProxyUrl(anyUrlOrId, cacheBust = '') {
  const driveId = extractDriveId(anyUrlOrId);
  if (!driveId) return '';

  const cacheParam = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : '';

  const endpoint = ensureImageEndpoint();

  return `${endpoint}?action=img&id=${encodeURIComponent(driveId)}${cacheParam}`;
}

/* -----------------------------------------------------------------------------*/
// Drive URL Builders
/* -----------------------------------------------------------------------------*/

// PT: No modelo atual, full sempre usa o proxy GAS.
// EN: In the current model, full always uses the GAS proxy.
function DRIVE_FULL(idOrUrl, rkIgnored = '') {
  const driveId = extractDriveId(idOrUrl);
  if (!driveId) return '';

  return imgProxyUrl(driveId);
}

// PT: No modelo atual, thumb usa a mesma URL do proxy.
// Se quiser thumbs reais menores, isso deve ser tratado no GAS.
//
// EN: In the current model, thumb uses the same proxy URL.
// If you want smaller real thumbnails, this should be handled in GAS.
function DRIVE_THUMB(idOrUrl, rkIgnored = '', width = 256) {
  // rkIgnored, width
  // PT: Parâmetros mantidos para compatibilidade futura (não usados atualmente).
  // EN: Parameters kept for future compatibility (currently unused).
  const driveId = extractDriveId(idOrUrl);
  if (!driveId) return '';

  return imgProxyUrl(driveId);
}

/* -----------------------------------------------------------------------------*/
// Drive URL Safety
/* -----------------------------------------------------------------------------*/

// PT: Garante a construção da URL do proxy a partir de um texto/ID plausível.
// Aplica um cache-buster leve com data/timestamp quando disponível.
//
// EN: Ensures proxy URL construction from a plausible text/ID.
// Applies a light cache-buster using date/timestamp when available.
function ensureDriveUrl(raw, item) {
  if (!raw) return '';

  const driveId = extractDriveId(raw);
  if (!driveId) return '';

  const cacheBust = item?.data || item?.timestamp || '';
  return imgProxyUrl(driveId, cacheBust);
}

/* -----------------------------------------------------------------------------*/
// Preload Helpers
/* -----------------------------------------------------------------------------*/

// PT: Hoje sempre prioriza o proxy GAS e faz preload em best effort.
// EN: Today it always prioritizes the GAS proxy and preloads in best effort mode.
function tryBestDriveThumb(idOrUrl, item = {}) {
  const imageUrl = ensureDriveUrl(idOrUrl, item);

  preloadImage(imageUrl);

  return imageUrl || '';
}

// PT: Faz preload fire-and-forget.
// Resolve true em load e false em error, sem rejeitar.
//
// EN: Performs fire-and-forget preloading.
// Resolves true on load and false on error, never rejects.
function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(false);

    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);

    const cacheBreaker = `${src}${src.includes('?') ? '&' : '?'}cb=${Date.now() % 1e7}`;
    image.src = cacheBreaker;
  });
}

/* -----------------------------------------------------------------------------*/
// URL Sanitization
/* -----------------------------------------------------------------------------*/

// PT: Sanitização básica de URLs externas e rotas locais.
// - bloqueia javascript:
// - aceita http/https
// - aceita rotas locais iniciando com /
//
// EN: Basic sanitization for external URLs and local routes.
// - blocks javascript:
// - accepts http/https
// - accepts local routes starting with /
function sanitizeUrl(urlValue) {
  const source = typeof urlValue === 'string' ? urlValue.trim() : '';
  if (!source) return '';

  if (/^javascript:/i.test(source)) return '';

  if (source.startsWith('/')) {
    return source;
  }

  if (!/^https?:\/\//i.test(source)) return '';

  try {
    const parsedUrl = new URL(source);
    return parsedUrl.toString();
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------
 * resolveDriveImageUrl(urlValue)
 * ------------------------------------------------------------
 * PT: Resolve uma URL de imagem válida a partir de um ID ou link
 * do Google Drive, redirecionando para o proxy de imagem (GAS).
 *
 * EN: Resolves a valid image URL from a Google Drive ID or link,
 * redirecting it to the image proxy (GAS).
 */

function resolveDriveImageUrl(urlValue) {
  const { id, rk } = parseDrive(urlValue || '');
  if (!id) return String(urlValue || '');
  return DRIVE_FULL(id, rk);
}
/* -----------------------------------------------------------------------------*/
// Fallback Image
//
// PT: Caminho local da imagem padrão quando o carregamento falha.
// EN: Local path of the default image when loading fails.
/* -----------------------------------------------------------------------------*/

const FALLBACK_IMG = '/assets/img/no-photo.png';

/* -----------------------------------------------------------------------------*/
// DataURL Helpers
/* -----------------------------------------------------------------------------*/

// PT: Faz a requisição ao proxy GAS e devolve o texto retornado,
// que normalmente será uma dataURL Base64.
//
// EN: Fetches the GAS proxy and returns the response text,
// which is usually a Base64 dataURL.
async function fetchDataURL(url) {
  const cacheBreaker = `${url.includes('?') ? '&' : '?'}cb=${Date.now() % 1e7}`;
  const response = await fetch(url + cacheBreaker);
  const dataURLText = await response.text();

  return dataURLText;
}

// PT: Detecta quando a resposta parece ser uma imagem inválida,
// como um PNG 1x1 transparente de erro.
//
// EN: Detects when the response looks like an invalid image,
// such as a transparent 1x1 error PNG.
function isLikely1x1(dataUrl) {
  if (!/^data:image\//i.test(dataUrl)) return true;

  return dataUrl.length < 200;
}

/* -----------------------------------------------------------------------------*/
// Image Source Selection
//
// PT: Escolhe a melhor imagem do item e retorna { thumbUrl, fullUrl }.
// EN: Picks the best image from the item and returns { thumbUrl, fullUrl }.
/* -----------------------------------------------------------------------------*/
function pickImagePair(item) {
  if (!item || typeof item !== 'object') {
    return { thumbUrl: '', fullUrl: '' };
  }

  // PT: Normaliza possíveis formatos para string.
  // EN: Normalizes possible value formats into a string.
  const toStringValue = (value) => {
    if (!value) return '';

    if (typeof value === 'string') return value.trim();

    if (typeof value === 'object') {
      if (typeof value.url === 'string') return value.url.trim();
      if (typeof value.href === 'string') return value.href.trim();
      if (typeof value.id === 'string') return value.id.trim();
    }

    return '';
  };

  // PT: Filtra valores vazios, placeholders e lixo comum.
  // EN: Filters empty values, placeholders and common garbage.
  const isGarbageValue = (value) => {
    const text = String(value || '').trim();
    if (!text) return true;
    if (text === '[object Object]') return true;

    const lowerText = text.toLowerCase();
    return ['n/a', 'na', 'null', 'undefined', '#', '...', '…', '-', '—'].includes(lowerText);
  };

  // PT: Aceita URL comum, link do Drive ou ID plausível.
  // EN: Accepts regular URL, Drive link or plausible ID.
  const isPlausibleImageSource = (value) =>
    /^https?:\/\//i.test(value) || /drive\.google\.com/i.test(value) || /^[\w-]{10,}$/.test(value);

  const candidates = [
    item.photo_url,
    item.foto_url,
    item.image_url,
    item.image,
    item.url,
    item.foto,
    item.image_id,
    item.foto_id,
  ]
    .map(toStringValue)
    .filter((value) => !isGarbageValue(value));

  const rawSource = candidates.find(isPlausibleImageSource) || '';

  if (!rawSource) {
    return { thumbUrl: '', fullUrl: '' };
  }

  // PT: Usa data/timestamp como hint leve para cache-busting.
  // EN: Uses date/timestamp as a light cache-busting hint.
  const cacheHint = item?.date_ms ?? item?.date_br ?? item?.date ?? item?.timestamp ?? '';

  const driveId = DaliaImageHelpers.extractDriveId(rawSource);

  if (driveId) {
    const proxiedUrl = DaliaImageHelpers.imgProxyUrl(driveId, cacheHint);
    const safeUrl = DaliaImageHelpers.sanitizeUrl(proxiedUrl);
    return { thumbUrl: safeUrl, fullUrl: safeUrl };
  }

  const safeHttpUrl = DaliaImageHelpers.sanitizeUrl(rawSource);
  return { thumbUrl: safeHttpUrl, fullUrl: safeHttpUrl };
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const DaliaImageHelpers = {
  // ----------------------------------------------------------
  // 1. Drive Parsing
  // ----------------------------------------------------------
  parseDrive,
  isDriveId,
  extractDriveId,

  // ----------------------------------------------------------
  // 2. Proxy URL Builders
  // ----------------------------------------------------------
  imgProxyUrl,
  ensureDriveUrl,
  DRIVE_FULL,
  DRIVE_THUMB,

  // ----------------------------------------------------------
  // 3. Image Loading & Heuristics
  // ----------------------------------------------------------
  tryBestDriveThumb,
  preloadImage,
  sanitizeUrl,
  resolveDriveImageUrl,

  // ----------------------------------------------------------
  // 4. DataURL Helpers (GAS Proxy)
  // ----------------------------------------------------------
  FALLBACK_IMG,
  fetchDataURL,
  isLikely1x1,

  // ----------------------------------------------------------
  // 5. Image Source Selection
  // ----------------------------------------------------------
  pickImagePair,
};
