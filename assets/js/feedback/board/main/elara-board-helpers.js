// /assets/js/feedback/board/main/elara-board-helpers.js
// 🌿 Elara — Helpers do Board
// PT: Simboliza precisão silenciosa. Processa os dados do Board: normalização,
//     seleção de imagens e paginação antes da renderização pela Selah.
// EN: Symbolizes quiet precision. Processes the Board data: normalization,
//     image selection and pagination before Selah renders the UI.
/* -----------------------------------------------------------------------------*/

// 🌿 Dalia — lógica de imagem (helpers)
// EN 🌿 Dalia — image logic (helpers)
import {
  sanitizeUrl,
  imgProxyUrl,
  extractDriveId,
} from '/assets/js/feedback/board/image/dalia-image-helpers.js';

// ------------------------------------------------------------
// Config de resiliência de rede (compartilhada)
// ------------------------------------------------------------
export const NET = {
  timeoutMs: 9000, // só referência para mensagens
  retryDelayBase: 600, // 600ms, 1200ms, 2400ms (com jitter)
  retryMaxAttempts: 2, // 1 tentativa + 2 retries = 3 no total (combina com FeedbackAPI)
  autoRetryAfterMs: 5000, // se online, tenta sozinho após 5s
};

// ------------------------------------------------------------
// Estrelas (rating)
// ------------------------------------------------------------
export function renderEstrelas(n = 0) {
  const val = Math.max(0, Math.min(+n || 0, 5));
  return `
      <span class="inline-flex items-center gap-1" aria-label="${val} de 5 estrelas">
        <span class="text-yellow-500 text-sm">${'★'.repeat(Math.round(val))}</span>
        <span class="text-neutral-800 font-semibold text-sm">${val.toFixed(1)}</span>
      </span>
    `;
}

// ------------------------------------------------------------
// Formata data ISO para dd/mm/aaaa
// ------------------------------------------------------------
export function formatarData(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d)) return isoStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

// ------------------------------------------------------------
// Skeleton de loading (linhas texto)
// ------------------------------------------------------------
// gera linhas de esqueleto (skeleton) para loading
export function skeletonLines(lines = 3) {
  let out = '<div class="animate-pulse">';
  for (let i = 0; i < lines; i++) {
    const w = i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full';
    out += `<div class="h-4 bg-neutral-200 rounded ${w} mb-2"></div>`;
  }
  out += '</div>';
  return out;
}

// ------------------------------------------------------------
// Backoff com jitter (caso queira usar no futuro)
// ------------------------------------------------------------
// simples backoff com jitter (600, 1200, 2400… + 0–200ms)
export function backoff(attempt) {
  return NET.retryDelayBase * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
}

/* ------------------------------------------------------------
 * pickImagePair(item)
 * ------------------------------------------------------------
 * 🇧🇷 Escolhe a melhor fonte de imagem do objeto `item` e
 * retorna { thumbUrl, fullUrl } já normalizados:
 * - Se for Google Drive (link ou ID), converte para proxy do GAS (imgProxyUrl).
 * - Se for http(s) comum (jpg/png/etc.), usa direto.
 * - Se já for o próprio proxy do GAS, mantém (não duplica).
 *
 * 🇺🇸 Picks the best image source from `item` and returns
 * { thumbUrl, fullUrl } normalized:
 * - Google Drive → proxied via GAS.
 * - Regular http(s) → used as-is.
 * - Already proxied → kept untouched.
 */
export function pickImagePair(item) {
  // 🔹 Proteção: se item não for objeto, retorna vazio
  if (!item || typeof item !== 'object') return { thumbUrl: '', fullUrl: '' };

  // ----------------------------------------------------------
  // Normalizador de valores (string/obj):
  // - Converte possíveis formatos (string direta, {url}, {href}, {id})
  // - Mantém só string "limpa" (trim)
  // ----------------------------------------------------------
  const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    if (typeof v === 'object') {
      if (typeof v.url === 'string') return v.url.trim();
      if (typeof v.href === 'string') return v.href.trim();
      if (typeof v.id === 'string') return v.id.trim();
    }
    return '';
  };

  // ----------------------------------------------------------
  // Filtro de "lixo" comum de planilha:
  // - Remove valores vazios, placeholders e "[object Object]"
  // ----------------------------------------------------------
  const isGarbage = (s) => {
    const t = String(s || '').trim();
    if (!t) return true;
    if (t === '[object Object]') return true;
    const lower = t.toLowerCase();
    return ['n/a', 'na', 'null', 'undefined', '#', '...', '…', '-', '—'].includes(lower);
  };

  // ----------------------------------------------------------
  // Heurística de plausibilidade:
  // - Aceita http(s), links do Drive ou um ID "parecido com Drive"
  // ----------------------------------------------------------
  const isPlausible = (s) =>
    /^https?:\/\//i.test(s) || /drive\.google\.com/i.test(s) || /^[\w-]{10,}$/.test(s);

  // ----------------------------------------------------------
  // Coleta de candidatos:
  // 🇧🇷 "candidates" varre os campos mais comuns e retorna o primeiro válido.
  // 🇺🇸 "candidates" scans common fields and keeps the first valid one.
  // (não precisamos detalhar cada campo aqui; ideia: "tudo que pode conter imagem")
  // ----------------------------------------------------------
  const candidates = [
    item.foto_url,
    item.image_url,
    item.image,
    item.url,
    item.foto,
    item.link,
    item.image_id,
    item.foto_id,
  ]
    .map(toStr) // normaliza valores diversos para string
    .filter((s) => !isGarbage(s)); // remove lixo

  // ----------------------------------------------------------
  // Pega o primeiro candidato plausível
  // ----------------------------------------------------------
  const raw = candidates.find(isPlausible) || '';
  if (!raw) return { thumbUrl: '', fullUrl: '' };

  // ----------------------------------------------------------
  // Hint de cache (opcional):
  // 🇧🇷 let aqui porque pode evoluir (ex.: trocar fonte do hint no futuro)
  // 🇺🇸 let because you might change the source later (e.g., updated_at)
  // ----------------------------------------------------------
  let cacheHint = item?.data || item?.timestamp || '';

  // ----------------------------------------------------------
  // Caso 2: é Drive (link/ID) → sempre usar o proxy do GAS
  // - extractDriveId: aceita formatos diversos (/file/d/ID, ?id=ID, ID puro…)
  // - imgProxyUrl: gera …/exec?action=img&id=<ID>&v=<cacheHint>
  // ----------------------------------------------------------

  const driveId = extractDriveId(raw);
  if (driveId) {
    const proxied = imgProxyUrl(driveId, cacheHint);
    const safe = sanitizeUrl(proxied);
    return { thumbUrl: safe, fullUrl: safe };
  }

  // ----------------------------------------------------------
  // Caso 3: http(s) comum → usar direto como thumb e full
  // - Ex.: CDN própria, imagens absolutas do site, etc.
  // ----------------------------------------------------------
  const httpSafe = sanitizeUrl(raw);
  return { thumbUrl: httpSafe, fullUrl: httpSafe };
}
