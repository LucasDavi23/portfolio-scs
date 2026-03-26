/* -----------------------------------------------------------------------------*/
// 🪷 DÁLIA — Guardiã da Lógica de Imagem
//
// Nível / Level: Jovem / Young
//
// PT: Lógica pura de imagem: Drive/GAS, proxy, URLs, validação.
// EN: Pure image logic: Drive/GAS, proxy, URLs, validation.
/* -----------------------------------------------------------------------------*/

// EndpointConfig — Configuração do Endpoint (Camada de Infra)
// Fornece:
// - set(url)
// - get()
import { EndpointConfig } from '/assets/js/feedback/core/config/feedback-endpoint.js';

/* ------------------------------------------------------------
 * parseDrive(raw, item?)
 * ------------------------------------------------------------
 * Extrai { id, rk } (resourceKey) a partir de:
 *  - ID puro ("1AbC...")
 *  - Links do tipo /file/d/<ID>
 *  - Links com ?id=<ID>
 *  - Links legados (/thumbnail, /uc) que já contêm id=image_id
 *
 * Retorna sempre um objeto { id: string, rk: string }.
 * Se não achar, retorna { id: '', rk: '' }.
 */

export function parseDrive(raw, item = {}) {
  const s = String(raw || '').trim();
  if (!s) return { id: '', rk: '' };

  // Caso 1: já é um ID "puro"
  if (/^[\w-]{10,}$/.test(s)) {
    const rkGuess = item.resourcekey || item.resourceKey || item.foto_resourcekey || '';
    return { id: s, rk: rkGuess || '' };
  }

  // Caso 2: /file/d/<ID>
  let m = s.match(/\/file\/d\/([-\w]{10,})/i);
  if (m) {
    const rk = (s.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: m[1], rk };
  }

  // Caso 3: ...?id=<ID>
  m = s.match(/[?&]id=([-\w]{10,})/i);
  if (m) {
    const rk = (s.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: m[1], rk };
  }

  // Caso 4: endpoints legados com id/image_id na query
  m = s.match(/[?&](?:id|image_id)=([-\w]{10,})/i);
  if (m) {
    const rk = (s.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: m[1], rk };
  }

  return { id: '', rk: '' };
}

// -------------------------------------------------------------
// ID helpers
// -------------------------------------------------------------

// --- garantia & tentativa EN ---
// Validador simples de ID do Drive (mín. 10 chars alfanum/hífen/underscore)
// EN: simple Drive ID validator (min. 10 alphanum/hyphen/underscore chars)
export const isDriveId = (s) => /^[\w-]{10,}$/.test(String(s || '').trim());

/* ------------------------------------------------------------
 * extractDriveId(anyUrlOrId)
 * ------------------------------------------------------------
 * Extrai um ID plausível de:
 *  - ID puro
 *  - Links /file/d/<ID>
 *  - Links com ?id=<ID>
 *  - Fallback por padrão de “padrão de ID” ([-\w]{20,})
 */
/* EN: Extracts a plausible Drive ID from:
 *  - Pure ID
 *  - /file/d/<ID> links
 *  - Links with ?id=<ID>
 *  - Fallback by default “ID pattern” ([-\w]{20,})
 */
export function extractDriveId(anyUrlOrId) {
  if (!anyUrlOrId) return '';
  const s = String(anyUrlOrId).trim();

  // já é ID?
  if (/^[\w-]{20,}$/.test(s)) return s;

  // padrões comuns do Drive // common Drive patterns
  const m =
    s.match(/\/file\/d\/([-\w]{10,})/i) || s.match(/[?&]id=([-\w]{10,})/i) || s.match(/[-\w]{20,}/); // fallback
  return m ? m[1] : '';
}

/* ------------------------------------------------------------
 * imgProxyUrl(anyUrlOrId, cacheBust?)
 * ------------------------------------------------------------
 * Monta a URL do seu proxy de imagem no GAS a partir de um id/link do Drive.
 * Ex.: https://SEU_EXEC/exec?action=img&id=<ID>&v=<cacheBust>
 */
/* EN: Builds the URL of your image proxy on GAS from a Drive id/link.
 * Ex.: https://YOUR_EXEC/exec?action=img&id=<ID>&v=<cacheBust>
 */

export function imgProxyUrl(anyUrlOrId, cacheBust = '') {
  const id = extractDriveId(anyUrlOrId);
  if (!id) return '';
  const v = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : '';
  return `${EndpointConfig.get()}?action=img&id=${encodeURIComponent(id)}${v}`;
}

/* ------------------------------------------------------------
 * DRIVE_FULL / DRIVE_THUMB
 * ------------------------------------------------------------ */

// --- builders: preferir lh3 (binário); se não houver rk, cair para endpoints legados ---
// EN: builders: prefer lh3 (binary); if no rk, fall back to legacy endpoints

export function DRIVE_FULL(idOrUrl, rkIgnored = '') {
  const id = extractDriveId(idOrUrl);
  if (!id) return '';
  return imgProxyUrl(id); // sempre via GAS // always via GAS
}

export function DRIVE_THUMB(idOrUrl, rkIgnored = '', w = 256) {
  const id = extractDriveId(idOrUrl);
  if (!id) return '';
  // Mesma URL do proxy (o back retorna a imagem original);
  // Se quiser gerar thumbs menores “de verdade”, teria que tratar no GAS.
  // EN: Same proxy URL (the backend returns the original image);
  // If you want to generate smaller “real” thumbs, you would have to handle it in GAS.
  return imgProxyUrl(id);
}

/* ------------------------------------------------------------
 * ensureDriveUrl(raw, item, kind='thumb')
 * ------------------------------------------------------------
 * Garante a construção da URL do proxy a partir de qualquer texto/ID plausível.
 * - Extrai o ID
 * - Aplica um cache-buster leve (data/timestamp) para evitar cache teimoso
 * - Devolve a URL do proxy (mesma para full/thumb no seu modelo atual)
 */
/* EN: Ensures the construction of the proxy URL from any plausible text/ID.
 * - Extracts the ID
 * - Applies a light cache-buster (date/timestamp) to avoid stubborn cache
 * - Returns the proxy URL (same for full/thumb in your current model)
 */
export function ensureDriveUrl(raw, item, kind = 'thumb') {
  if (!raw) return '';
  const id = extractDriveId(raw);
  if (!id) return '';
  const bust = item?.data || item?.timestamp || ''; // cache-buster leve (opcional)
  return kind === 'full' ? imgProxyUrl(id, bust) : imgProxyUrl(id, bust);
}

/* ------------------------------------------------------------
 * tryBestDriveThumb(idOrUrl, rkIgnored, item)
 * ------------------------------------------------------------
 * Antes: tentava variações do Drive (lh3/uc). Agora:
 * - Sempre monta o proxy do GAS (evita ORB)
 * - Faz um preload “best effort” (não impacta o fluxo do card)
 */

/* EN: Before: tried Drive variations (lh3/uc). Now:
 * - Always builds the GAS proxy (avoids CORS)
 * - Does a “best effort” preload (does not impact the card flow)
 */

export function tryBestDriveThumb(idOrUrl, rkIgnored = '', item = {}) {
  const thumb = ensureDriveUrl(idOrUrl, item, 'thumb');
  const full = ensureDriveUrl(idOrUrl, item, 'full');
  preloadImage(thumb).then((ok) => {
    if (!ok) preloadImage(full);
  });
  return thumb || full || '';
}

/* ------------------------------------------------------------
 * preloadImage(src)
 * ------------------------------------------------------------
 * Faz um pré-carregamento “fire-and-forget” de uma URL de imagem.
 * Nunca rejeita: resolve(true) se onload, resolve(false) se onerror.
 * Adiciona um cb (cache-buster) para evitar reuso de cache incorreto.
 */
/* EN: Does a “fire-and-forget” preloading of an image URL.
 * Never rejects: resolves(true) if onload, resolves(false) if onerror.
 * Adds a cb (cache-buster) to avoid incorrect cache reuse.
 */

export function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    const url = src + (src.includes('?') ? '&' : '?') + 'cb=' + (Date.now() % 1e7);
    img.src = url;
  });
}

/* ------------------------------------------------------------
 * sanitizeUrl(u)
 * ------------------------------------------------------------
 * Sanitização básica de URLs externas:
 * - Bloqueia "javascript:"
 * - Aceita apenas http/https (💡 dica: se você começar a usar dataURL,
 *   pode ampliar para aceitar /^data:/ também.)
 */
/* EN: Basic sanitization of external URLs:
 * - Blocks "javascript:"
 * - Accepts only http/https (💡 tip: if you start using dataURL,
 *   you can expand to accept /^data:/ as well.)
 */

export function sanitizeUrl(u) {
  const s = typeof u === 'string' ? u.trim() : '';
  if (!s) return '';
  if (/^javascript:/i.test(s)) return '';
  if (!/^https?:\/\//i.test(s)) return '';
  try {
    const url = new URL(s);
    return url.toString();
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------
 * toPublicImageUrl(u)
 * ------------------------------------------------------------
 * Compatibilidade legada para “publicar” uma URL de imagem a partir
 * de um link/ID de Drive. Hoje redireciona para o proxy FULL (GAS).
 */
/* EN: Legacy compatibility to “publish” an image URL from
 * a Drive link/ID. Today redirects to the FULL proxy (GAS).
 */

export function toPublicImageUrl(u) {
  const { id, rk } = parseDrive(u || '');
  if (!id) return String(u || '');
  return DRIVE_FULL(id, rk);
}

/* ============================================================
   [NOVO BLOCO] HELPERS DE IMAGEM (PROXY + DATAURL + RETRIES)
   ------------------------------------------------------------
   Objetivo:
   - Lidar com o carregamento das imagens do Drive via seu proxy do GAS.
   - O proxy responde uma dataURL (texto base64 da imagem).
   - Estes helpers cuidam de:
     → fazer o fetch da dataURL,
     → testar se é válida,
     → tentar recarregar algumas vezes,
     → aplicar fallback visual quando falha tudo.
   ============================================================ */
/* EN:
   [NEW BLOCK] IMAGE HELPERS (PROXY + DATAURL + RETRIES)
   ------------------------------------------------------------
   Goal:
   - Handle loading Drive images via your GAS proxy.
   - The proxy responds with a dataURL (base64 text of the image).
   - These helpers take care of:
     → fetching the dataURL,
     → testing if it's valid,
     → trying to reload a few times,
     → applying visual fallback when everything fails.
   ============================================================ */

/* ------------------------------------------------------------
 * FALLBACK_IMG
 * ------------------------------------------------------------
 * Caminho local da imagem padrão que aparece quando
 * o carregamento da foto falha completamente.
 * Pode ser um arquivo PNG leve ou SVG.
 */

/* EN: Local path of the default image that appears when
 * the photo loading completely fails.
 * It can be a lightweight PNG file or SVG.
 */

// Caminho local do fallback quando tudo falha
export const FALLBACK_IMG = '/assets/img/no-photo.png';

/* ------------------------------------------------------------
 * fetchDataURL(url)
 * ------------------------------------------------------------
 * 🇧🇷 Faz a requisição para a URL do proxy (GAS)
 * e devolve o TEXTO retornado (dataURL em Base64).
 * Adiciona um “cache-buster” (?cb=…) para evitar reuso de cache.
 *
 * 🇺🇸 Fetches the proxy (GAS) URL and returns the response text
 * as a Base64 dataURL. Adds a "cache-buster" (?cb=…) to bypass cache.
 */

export async function fetchDataURL(url) {
  // 🔹 1) Gerar um "cache breaker" (também chamado cache-buster)
  // Serve para forçar o navegador a buscar uma nova versão da imagem,
  // evitando que ele use uma cópia antiga do cache.
  // (if the URL already has ?, we use &, otherwise we use ?)
  const cacheBreaker = (url.includes('?') ? '&' : '?') + 'cb=' + (Date.now() % 1e7);

  // 🔹 2) Enviar a requisição HTTP para o proxy (GAS)
  // "await" significa: espera o servidor responder.
  // fetch() returns a "Response" object that contains the full HTTP response.
  const response = await fetch(url + cacheBreaker);

  // 🔹 3) Ler o corpo da resposta (response body)
  // Aqui pegamos o conteúdo da imagem como texto (string Base64).
  // r.text() → reads the entire response body as text
  const dataURLText = await response.text();

  // 🔹 4) Retornar o texto (imagem em formato DataURL)
  // This will look like: "data:image/png;base64,AAAA...."
  return dataURLText;
}

/* ------------------------------------------------------------
 * isLikely1x1(dataUrl)
 * ------------------------------------------------------------
 * 🇧🇷 Detecta quando a resposta do proxy provavelmente
 * é o PNG 1×1 transparente usado como “erro”.
 *
 * Se a string NÃO começar com "data:image/..." ou
 * for muito pequena (<200 caracteres),
 * consideramos inválida e tratamos como imagem vazia.
 *
 * 🇺🇸 Detects when the proxy response is probably
 * the transparent 1×1 PNG used as an “error image”.
 *
 * If the string does NOT start with "data:image/..."
 * or is too small (<200 characters),
 * we treat it as invalid (empty image).
 */

export function isLikely1x1(dataUrl) {
  // 🔹 Verifica se começa com "data:image/"
  // ^data:image/  → "^" significa "começa com"
  // o "i" no final (flag) significa "ignore case"
  // ou seja: aceita "data:image/" ou "DATA:IMAGE/"
  // test() → método que verifica se a expressão regular bate com a string
  if (!/^data:image\//i.test(dataUrl)) return true; // não é imagem válida

  // 🔹 Se for muito curta, provavelmente é o PNG 1x1 de erro
  // (um base64 curtinho, tipo 100 caracteres)
  return dataUrl.length < 200; // pequena demais → 1x1
}

export const DaliaImageHelpers = {
  // ----------------------------------------------------------
  // 🔹 1. Parsers & Extractors
  // ----------------------------------------------------------
  parseDrive, // extrai {id, rk} de qualquer link/ID
  isDriveId, // valida ID puro
  extractDriveId, // extrai ID plausível de URL ou ID

  // ----------------------------------------------------------
  // 🔹 2. URL Builders (Drive → Proxy GAS)
  // ----------------------------------------------------------
  imgProxyUrl, // constrói URL do proxy
  ensureDriveUrl, // força conversão confiável
  DRIVE_FULL, // proxy versão "full"
  DRIVE_THUMB, // proxy versão "thumb"

  // ----------------------------------------------------------
  // 🔹 3. Heurísticas & Pré-Carregamento
  // ----------------------------------------------------------
  tryBestDriveThumb, // tenta melhor miniatura
  preloadImage, // pré-carrega imagem
  sanitizeUrl, // sanitização básica
  toPublicImageUrl, // compatibilidade legada

  // ----------------------------------------------------------
  // 🔹 4. Proxy GAS: DataURL Helpers (Base64)
  // ----------------------------------------------------------
  FALLBACK_IMG, // imagem padrão quando falha tudo
  fetchDataURL, // busca DataURL no GAS
  isLikely1x1, // detecta 1x1 transparente (erro)
};
