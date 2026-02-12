// /assets/js/feedback/board/main/selah-board-ui.js
// 🌿 Selah — Board de Avaliações (UI)
// PT: Simboliza contemplação. Exibe o Board de avaliações com transições suaves.
// EN: Symbolizes contemplation. Renders the review board with smooth transitions.
/* -----------------------------------------------------------------------------*/

// Imports / Dependências
// -----------------------------------------------------------------------------

// 🌿 Dalia — lógica de imagem (helpers)
// EN 🌿 Dalia — image logic (helpers)
// Fornece:
// - FALLBACK_IMG

import { DaliaImageHelpers } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

/* -----------------------------------------------------------------------------*/

// 🎨 Petra — UI da imagem (thumb + auto-recover)
// EN 🎨 Petra — Image UI (thumb + auto-recover)
// Fornece:
// - LoadThumbWithRetries,
// - smartAutoRecover,
// - markHasPhoto

import { PetraImageUI } from '/assets/js/feedback/board/image/petra-image-ui.js';
/* -----------------------------------------------------------------------------*/

// ✨ Elara — helpers do board (estrelas, datas, imagens)
// EN ✨ Elara — board helpers (stars, dates, images)
// Fornece:
//  - formatDate()
//  - skeletonLines()
//  - pickImagePair()
//  - NET (retry/backoff config)

import { ElaraBoardHelpers } from '/assets/js/feedback/board/main/elara-board-helpers.js';

// ------------------------------------------------------------
// ⭐ Zoe — rating UI do system (avaliações por estrelas)
// EN ⭐ Zoe — system rating UI (star-based ratings)
// Fornece:
//  - renderRating()
//  - normalizeRating()
//  - mountInput()

import { ZoeRating } from '/assets/js/system/ui/rating/zoe-rating.js';

// ------------------------------------------------------------

// Módulo do Board de feedbacks (Hero SCS + Shopee, ML, Google)
// Carrega apenas quando chamar FeedbackMural.init() (mantido por compat)
// Requer: window.FeedbackAPI.list(plat, page, limit) e window.FeedbackLista.open(plat)
// Hero e Cards mostram skeleton enquanto carregam.
// Em erro, exibem mensagem + botão “Tentar novamente”.
// Fazem autorretry em 5s quando online.
// Atualizam o Hero imediatamente quando o form dispara feedback:novo.
// Recarregam ao voltar a conexão (window.online).

const DEFAULTS = {
  hero: { plat: 'scs', page: 1, limit: 1 },
  cards: { perPlatform: 2 },
  selectors: {
    heroRoot: '[data-feedback-hero]',
    cardSCS: '[data-feedback-card="scs"]',
    cardShopee: '[data-feedback-card="shopee"]',
    cardML: '[data-feedback-card="ml"]',
    cardGoogle: '[data-feedback-card="google"]',
  },
};

let CFG = JSON.parse(JSON.stringify(DEFAULTS));
let _initSeq = 0;
let heroAutoRetryTimer = null;
let cardsAutoRetryTimer = null;

// --------------------------------------------------
// Realtime refresh (debounce) — internal state
// --------------------------------------------------
let committedRefreshTimer = null;
let lastCommittedClientRequestId = '';

// ---------- FEATURED REVIEW (Hero)
// PT: Renderiza UM único review em destaque no layout Hero.
//     Atualiza o conteúdo in-place (não recria HTML).
//     Não decide origem, ordem ou filtros.
// EN: Renders a SINGLE highlighted review into the Hero layout.
//     Uses in-place updates (no HTML recreation).
//     Does not decide source, order or filtering.
// ----------

function renderFeaturedReview(root, item) {
  if (!root) return;

  // --------------------------------------------------
  // Hero text fields (EN selectors)
  // --------------------------------------------------
  const elAuthor = root.querySelector('[data-h-author]');
  const elRating = root.querySelector('[data-h-rating]');
  const elDate = root.querySelector('[data-h-date]');
  const elText = root.querySelector('[data-h-text]');

  // --------------------------------------------------
  // Empty state
  // --------------------------------------------------
  if (!item) {
    if (elAuthor) elAuthor.textContent = '';
    if (elRating) elRating.innerHTML = '';
    if (elDate) elDate.textContent = '';
    if (elText) elText.textContent = '';
  } else {
    // --------------------------------------------------
    // Item (EN contract)
    // --------------------------------------------------
    const author = item.author ?? 'Customer';
    const rating = item.rating ?? item.stars ?? 0; // fallback, temporary
    const date = item.date ?? item.date_iso ?? item.dateIso ?? '';
    const text = item.text ?? item.comment ?? '';

    if (elAuthor) elAuthor.textContent = author;
    if (elRating) elRating.innerHTML = ZoeRating.renderRating(rating);
    if (elDate) elDate.textContent = ElaraBoardHelpers.formatDate(date);
    if (elText) elText.textContent = text;
  }

  // --------------------------------------------------
  // Hero thumb (clickable)
  // --------------------------------------------------
  const btnThumb = root.querySelector('.thumb-container');
  const img = btnThumb?.querySelector('img');

  if (btnThumb && img) {
    const { thumbUrl, fullUrl } = ElaraBoardHelpers.pickImagePair(item);

    // Reset state
    btnThumb.classList.add('hidden');
    btnThumb.classList.remove('js-open-modal');

    img.removeAttribute('data-full');
    btnThumb.removeAttribute('data-full');

    img.removeAttribute('srcset');
    img.removeAttribute('loading');

    img.onload = null;
    img.onerror = null;

    // IMPORTANT: reset retry flag when reusing the same img element
    img.removeAttribute('data-retried');

    if (thumbUrl) {
      img.onload = () => {
        btnThumb.classList.remove('hidden');
        btnThumb.classList.add('js-open-modal');
        img.setAttribute('data-full', fullUrl);
        btnThumb.setAttribute('data-full', fullUrl);
      };

      img.onerror = () => {
        const retried = img.getAttribute('data-retried') === '1';
        if (!retried && fullUrl && fullUrl !== thumbUrl) {
          img.setAttribute('data-retried', '1');
          img.src = fullUrl; // fallback
          return;
        }

        btnThumb.classList.add('hidden');
        btnThumb.classList.remove('js-open-modal');
        img.removeAttribute('src');
      };

      img.removeAttribute('src');
      img.src = thumbUrl;
    } else {
      img.removeAttribute('src');
    }
  }
}

// ---------- FEATURED REVIEW (Hero) — Loading State
// PT: Renderiza o estado de carregamento do review em destaque.
//     Aplica skeletons no layout Hero existente.
// EN: Renders the loading state for the featured review.
//     Applies skeleton placeholders to the existing Hero layout.
// ----------

function renderFeaturedReviewLoading(root) {
  const elText = root?.querySelector('[data-h-text]');
  const elRating = root?.querySelector('[data-h-rating]');
  const elAuthor = root?.querySelector('[data-h-author]');
  const elDate = root?.querySelector('[data-h-date]');

  if (elRating) elRating.innerHTML = ElaraBoardHelpers.skeletonLines(1);
  if (elAuthor) elAuthor.textContent = '';
  if (elDate) elDate.textContent = '';
  if (elText) elText.innerHTML = ElaraBoardHelpers.skeletonLines(3);
}

// ---------- FEATURED REVIEW (Hero) — Error State
// PT: Renderiza o estado de erro do review em destaque.
//     Exibe uma mensagem de erro inline e uma ação opcional de retry
//     dentro do layout Hero existente.
// EN: Renders the error state for the featured review.
//     Displays an inline error message and an optional retry action
//     inside the existing Hero layout.
// ----------

function renderFeaturedReviewError(root, msg, onRetry) {
  const elText = root?.querySelector('[data-h-text]');
  const elRating = root?.querySelector('[data-h-rating]');
  const elAuthor = root?.querySelector('[data-h-author]');
  const elDate = root?.querySelector('[data-h-date]');
  if (elRating) elRating.innerHTML = '';
  if (elAuthor) elAuthor.textContent = '';
  if (elDate) elDate.textContent = '';
  if (elText) {
    elText.innerHTML = `
        <div class="rounded-lg border p-3">
          <p class="text-sm text-red-600 mb-2">${msg || 'Falha ao carregar.'}</p>
          <button type="button" class="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm" data-h-retry>
            Tentar novamente
          </button>
        </div>`;
    elText.querySelector('[data-h-retry]')?.addEventListener('click', () => onRetry && onRetry());
  }
}

// -----------------------------------------------------------------------------
// ⭐ Featured Review Loader (Hero Slot)
//
// PT: Carrega 1 review para o bloco "Featured" (slot Hero).
//     - Renderiza skeleton (loading) quando não está em modo silent
//     - Busca via FeedbackAPI (fast=1) e faz fallback para fast=0 se vier vazio
//     - Protege contra concorrência usando "seq" (se outra rodada iniciou, não pinta)
//     - Em erro, renderiza estado de erro com botão de retry
//     - Se estiver online, agenda auto-retry (silent) após X ms
//
// EN: Loads 1 review into the "Featured" area (Hero slot).
//     - Renders skeleton (loading) when not in silent mode
//     - Fetches via FeedbackAPI (fast=1) and falls back to fast=0 if empty
//     - Prevents race conditions using "seq" (if a new run started, skip rendering)
//     - On error, renders an error state with a retry button
//     - If online, schedules an auto-retry (silent) after X ms
// -----------------------------------------------------------------------------
async function loadFeaturedReview(seq, { silent = false } = {}) {
  const root = document.querySelector(CFG.selectors.heroRoot);
  if (!root) return;

  clearTimeout(heroAutoRetryTimer);

  // Loading state (unless silent)
  if (!silent) renderFeaturedReviewLoading(root);

  try {
    // 1) Fast path (cache-friendly)
    let list = await window.FeedbackAPI.list(CFG.hero.plat, CFG.hero.page, CFG.hero.limit, {
      fast: 1,
    });

    // 2) Fallback: if empty, try full mode (cache may be stale)
    if (!Array.isArray(list) || !list.length) {
      list = await window.FeedbackAPI.list(CFG.hero.plat, CFG.hero.page, CFG.hero.limit, {
        fast: 0,
      });
    }

    console.log('[loadFeaturedReview] items loaded', {
      count: list?.length,
      list,
    });

    // If another run started, do not render
    if (seq !== _initSeq) return;

    const review = Array.isArray(list) && list[0] ? list[0] : null;
    if (!review) throw new Error('No data to display.');

    renderFeaturedReview(root, review);
  } catch (err) {
    console.warn('[feedbackMural] Featured load error:', err);

    const offline = typeof navigator !== 'undefined' && !navigator.onLine;

    const message = offline
      ? 'Sem conexão. Verifique sua internet.'
      : err?.message || 'Falha ao carregar.';

    renderFeaturedReviewError(root, message, () => loadFeaturedReview(_initSeq, { silent: false }));

    // Auto-retry (only if online)
    if (!offline) {
      heroAutoRetryTimer = setTimeout(
        () => loadFeaturedReview(_initSeq, { silent: true }),
        ElaraBoardHelpers.NET.autoRetryAfterMs
      );
    }
  }
}

// ---------- CARD (Fixed Slot) — In-place Render
// PT: Preenche um card fixo com 1 item (texto/autor/data/rating + thumb).
//     Mantém o layout existente e respeita variants (ex.: "media").
// EN: Renders a fixed card with 1 item (text/author/date/rating + thumb).
//     Updates in-place and respects layout variants (e.g., "media").
// ----------

async function fillCardFixed(root, item) {
  const listEl = root.querySelector('[data-c-list]');
  if (!listEl) return;

  // ✅ 1) Detect if this card uses the "media" layout variant (SCS style)
  // PT: Verifica se o card é do tipo mídia (layout especial da SCS)
  // EN: Checks whether the card uses the media layout variant
  const isMediaLayout =
    root.getAttribute('data-variant') === 'media' || !!listEl.querySelector('.media-row');

  // ✅ 2) Only rewrite the inner markup if NOT using media layout
  // PT: Reescreve o conteúdo interno apenas se NÃO for layout mídia
  // EN: Rewrites inner content only when not using the media layout
  if (!isMediaLayout) {
    listEl.innerHTML = `
    <div class="grid grid-cols-[3.5rem_1fr_auto] items-start gap-3">
      
      <button
        type="button"
        class="thumb-container hidden relative w-[84px] aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50 p-1 shrink-0"
        aria-label="Ver foto"
      >
        <img
          alt=""
          class="w-full h-full object-cover object-center"
        />
      </button>

      <div class="min-w-0">
        <p
          class="text-gray-800 leading-6 line-clamp-2"
          data-c-text
        ></p>
        <p
          class="mt-1 text-[12px] text-gray-600 font-medium tracking-wide"
          data-c-author
        ></p>
      </div>

      <time
        class="text-[11px] text-gray-500 whitespace-nowrap"
        data-c-date
      ></time>
    </div>
  `;
  }

  // ⭐ Rating (stars)
  // PT: Renderiza as estrelas principais do card
  // EN: Renders the main rating stars for the card
  const headerRatingEl = root.querySelector('[data-c-rating]');
  const ratingValue = Number(item.rating ?? item.estrelas) || 0;

  if (headerRatingEl) {
    headerRatingEl.innerHTML = ZoeRating.renderRating(ratingValue);
  }

  // ⭐ Mini stars (compact textual fallback)
  // PT: Versão compacta em texto (★★★★★) usada em layouts específicos
  // EN: Compact textual stars (★★★★★) used in specific layouts
  const miniStarsEl = listEl.querySelector('[data-c-item-stars]');
  if (miniStarsEl) {
    const v = Math.max(0, Math.min(ratingValue, 5));
    miniStarsEl.textContent = '★★★★★'.slice(0, Math.max(1, Math.round(v)));
  }

  // 📅 Date / 💬 Text / 👤 Author
  // PT: Mapeia campos com aliases para manter compatibilidade
  // EN: Maps fields with aliases to keep backward compatibility
  const dateEl = listEl.querySelector('[data-c-date]');
  const textEl = listEl.querySelector('[data-c-text]');
  const authorEl = listEl.querySelector('[data-c-author]');

  const dateISO = item.date ?? item.data ?? item.data_iso;
  const text = item.text ?? item.texto ?? item.comentario ?? '';
  const author = item.author ?? item.autor ?? item.nome ?? '';

  if (dateEl) {
    dateEl.textContent = ElaraBoardHelpers.formatDate(dateISO);
  }
  if (textEl) {
    textEl.textContent = text;
  }
  if (authorEl) {
    authorEl.textContent = author ? `— ${author}` : '';
  }

  // 🖼️ Photo sanity check (defensive)
  // PT: Evita casos onde foto_url vem como objeto serializado incorretamente
  // EN: Guards against invalid serialized photo_url values
  if (typeof item.photo_url === 'string' && item.photo_url.trim() === '[object Object]') {
    console.warn('[invalid photo_url detected]', { item });
  }

  /* ------------------------------------------------------------
   * 🖼️ Card Thumbnail (Proxy → Retries → Modal)
   * ------------------------------------------------------------
   * PT: Carrega a thumb via pipeline (proxy + retries + auto-recover) e
   *     prepara o modal usando a SRC final que o navegador conseguiu exibir.
   * EN: Loads the thumbnail via pipeline (proxy + retries + auto-recover) and
   *     prepares the modal using the final SRC that the browser could render.
   * ------------------------------------------------------------ */
  {
    const thumbBtnEl = listEl.querySelector('.thumb-container'); // clickable area (opens modal)
    const thumbImgEl = thumbBtnEl?.querySelector('img'); // image node

    if (!thumbBtnEl || !thumbImgEl) {
      console.warn('[thumb] nós não encontrados', {
        btnThumb: !!thumbBtnEl,
        img: !!thumbImgEl,
        root,
      });
    } else {
      // URLs normalizadas (proxy p/ Drive; http normal como está)
      const { thumbUrl, fullUrl } = ElaraBoardHelpers.pickImagePair(item);

      /*  
          PT: sourceForThumb = URL usada para tentar carregar a imagem da thumb.
              Essa URL entra no "moedor" (proxy + retries + base64).

          EN: sourceForThumb = the URL we try to load through the proxy pipeline.
        */
      const thumbSourceUrl = thumbUrl || fullUrl || '';

      /*  
          PT: rawBigUrl = URL original maior (caso queira futuro HD).
              Ela NÃO é usada no modal atualmente, somente guardada.

          EN: rawBigUrl = original bigger image URL (kept for future use only).
        */
      const rawFullUrl = fullUrl || thumbUrl || '';

      // PT: garante um root consistente do card (pra marcar hasPhoto)
      // EN: ensures a consistent card root (to mark hasPhoto)
      const cardRootEl = root || listEl.closest('section[data-feedback-card]');

      // PT/EN: default state = no photo
      PetraImageUI.markHasPhoto(cardRootEl, false);

      // PT:Reset de estado visual e atributos
      // EN: reset visual state + attributes
      thumbBtnEl.classList.add('hidden');
      thumbBtnEl.classList.remove('js-open-modal');

      thumbImgEl.onload = null;
      thumbImgEl.onerror = null;

      thumbImgEl.removeAttribute('data-full');
      thumbBtnEl.removeAttribute('data-full');

      thumbImgEl.removeAttribute('src');
      thumbImgEl.referrerPolicy = 'no-referrer';
      thumbImgEl.decoding = 'async';
      thumbImgEl.setAttribute('loading', 'eager');

      if (!thumbSourceUrl) {
        console.log('[thumb] no valid URL — keeping hidden');
        PetraImageUI.markHasPhoto(cardRootEl, false);
      } else {
        try {
          // PT/EN: short retries (doesn't block card rendering)
          let maxAttempts = 2;

          await PetraImageUI.loadThumbWithRetries(
            thumbImgEl,
            thumbBtnEl,
            thumbSourceUrl,
            rawFullUrl,
            maxAttempts
          );

          // If it loaded, button should no longer be hidden
          const isVisible = !thumbBtnEl.classList.contains('hidden');
          PetraImageUI.markHasPhoto(cardRootEl, isVisible);

          // PT: usa a SRC FINAL (já renderizável) como fonte do modal
          // EN: use the FINAL SRC (already renderable) as modal source
          const modalSrcUrl = thumbImgEl.src;

          if (modalSrcUrl && isVisible) {
            thumbImgEl.dataset.full = modalSrcUrl;
            thumbBtnEl.dataset.full = modalSrcUrl;

            thumbBtnEl.classList.add('js-open-modal');
            thumbBtnEl.setAttribute('role', 'button');
            thumbBtnEl.setAttribute('tabindex', '0');
          }

          // PT/EN: background auto-recover (proxy may "wake up" later)
          PetraImageUI.smartAutoRecover(thumbImgEl, thumbSourceUrl, 60000, 10000);
        } catch (err) {
          console.warn('[thumb] failed after retries → fallback + auto-recover', err);

          thumbImgEl.src = DaliaImageHelpers.FALLBACK_IMG;
          thumbBtnEl.classList.remove('js-open-modal');

          PetraImageUI.smartAutoRecover(thumbImgEl, thumbSourceUrl, 60000, 10000);
          PetraImageUI.markHasPhoto(cardRootEl, false);
        }
      }
    }
  }

  /* ------------------------------------------------------------
   * 🔗 Card Actions (Platform link + "View more")
   * ------------------------------------------------------------
   * PT: Controla ações auxiliares do card:
   *     - Oculta o link da plataforma (quando presente no markup)
   *     - Liga o botão "Ver mais" ao modal/lista completa
   *
   * EN: Handles auxiliary card actions:
   *     - Hides the platform link (when present in markup)
   *     - Wires the "View more" button to the full list/modal
   * ------------------------------------------------------------ */

  // Hide platform link (if present in markup)
  const platformLinkEl = root.querySelector('[data-c-link-plat]');
  if (platformLinkEl) {
    platformLinkEl.classList.add('hidden');
    platformLinkEl.removeAttribute('href');
  }

  // "View more" button (bind once)
  const viewMoreBtnEl = root.querySelector('[data-c-view-more]');
  if (viewMoreBtnEl && !viewMoreBtnEl._bound) {
    viewMoreBtnEl.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        window.FeedbackLista?.open?.(root.getAttribute('data-feedback-card'));
      },
      { once: true }
    );

    // PT/EN: mark as bound to avoid duplicate listeners
    viewMoreBtnEl._bound = true;
  }
}

/* ------------------------------------------------------------
 * 🧩 Card Fallback Renderer
 * ------------------------------------------------------------
 * PT: Render simples (fallback) quando o card não usa o layout normal
 *     ou quando precisamos mostrar 1 item sem montar o template completo.
 * EN: Simple fallback renderer when the card isn't using the normal layout
 *     or when we need to display a single item without the full template.
 * ------------------------------------------------------------ */
function renderCardFallback(root, items) {
  const listEl = root.querySelector('[data-c-list]');
  if (!listEl) return;

  if (!items?.length) {
    listEl.innerHTML = `<div class="text-sm text-neutral-500">Ainda não há avaliações aprovadas aqui.</div>`;
    return;
  }

  const first = items[0];

  // PT/EN: keep aliases for backward compatibility
  const author = first.author ?? first.autor ?? first.nome ?? 'Cliente';
  const dateISO = first.date ?? first.data ?? first.data_iso ?? '';
  const text = first.text ?? first.texto ?? first.comentario ?? '';
  const ratingValue = Number(first.rating ?? first.estrelas) || 0;

  listEl.innerHTML = `
    <article class="p-3 border rounded-lg bg-white">
      <div class="flex items-center justify-between gap-3 mb-1">
        <div class="font-medium truncate">${author}</div>
        <div class="text-xs text-neutral-500">${ElaraBoardHelpers.formatDate(dateISO)}</div>
      </div>

      <div class="mb-1">
        ${ZoeRating.renderRating(ratingValue, { size: 'text-sm sm:text-base' })}
      </div>

      <p class="text-sm text-neutral-700 line-clamp-3">${text}</p>
    </article>
  `;
}

/* ------------------------------------------------------------
 * 🧩 Card Loading Renderer
 * ------------------------------------------------------------
 * PT: Renderiza o estado de carregamento (skeleton) do card.
 *     Não altera o DOM quando o layout é do tipo "media" (SCS),
 *     preservando o HTML original desse variant.
 *
 * EN: Renders the loading (skeleton) state for a feedback card.
 *     Does not touch the DOM when using the "media" layout (SCS),
 *     preserving the original markup for that variant.
 * ------------------------------------------------------------ */
function renderCardLoading(root) {
  const isMedia =
    root.getAttribute('data-variant') === 'media' ||
    !!root.querySelector('[data-c-list] .media-row');

  if (isMedia) return; // PT/EN: do not replace SCS media layout DOM

  const listEl = root.querySelector('[data-c-list]');
  if (listEl) {
    listEl.innerHTML = ElaraBoardHelpers.skeletonLines(3);
  }
}

/* ------------------------------------------------------------
 * 🧩 Card Error Renderer
 * ------------------------------------------------------------
 * PT: Renderiza o estado de erro do card.
 *     Exibe uma mensagem inline e um botão opcional de retry
 *     dentro do container existente do card.
 *
 * EN: Renders the error state for a feedback card.
 *     Displays an inline error message and an optional retry
 *     action inside the existing card container.
 * ------------------------------------------------------------ */
function renderCardError(root, message, onRetry) {
  const listEl = root.querySelector('[data-c-list]');
  if (!listEl) return;

  listEl.innerHTML = `
    <div class="rounded-lg border p-3">
      <p class="text-sm text-red-600 mb-2">
        ${message || 'Falha ao carregar.'}
      </p>
      <button
        type="button"
        class="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm"
        data-c-retry
      >
        Tentar novamente
      </button>
    </div>
  `;

  listEl.querySelector('[data-c-retry]')?.addEventListener('click', () => onRetry && onRetry());
}

/* ------------------------------------------------------------
 * 🧱 Platform Card Loader (per-platform)
 * ------------------------------------------------------------
 * PT: Carrega e renderiza o card de uma plataforma (scs/shopee/ml/google).
 *     - Usa FeedbackAPI.list() com fast-mode (cache) e fallback sem fast
 *     - Evita "pintar" rodadas antigas (seq vs _initSeq)
 *     - Para SCS: evita repintar o mesmo item (signature) e tenta avançar
 *       quando o topo ainda é o mesmo (via avoidSignature/lastSignatureByPlat)
 *     - Renderiza: loading → fillCardFixed (in-place) → fallback/error
 *
 * EN: Loads and renders a per-platform feedback card (scs/shopee/ml/google).
 *     - Uses FeedbackAPI.list() with fast-mode (cache) + non-fast fallback
 *     - Prevents stale renders (seq vs _initSeq)
 *     - For SCS: avoids repainting the same item (signature) and tries to
 *       advance when the top item is unchanged (avoidSignature/lastSignatureByPlat)
 *     - Renders: loading → fillCardFixed (in-place) → fallback/error
 * ------------------------------------------------------------ */
async function loadPlatformCard(
  selector,
  platform,
  seq,
  { silent = false, forceFresh = false, avoidSignature = '' } = {}
) {
  console.log('[loadPlatformCard] ENTER', { selector, platform, seq, _initSeq });

  const root = document.querySelector(selector);
  if (!root) {
    console.warn('[loadPlatformCard] root NOT found for', selector);
    return { ok: false, plat: platform, hasPhotoUrl: false, signature: '', item: null };
  }

  clearTimeout(cardsAutoRetryTimer);
  if (!silent) renderCardLoading(root);

  const fastMode = forceFresh ? 0 : 1;

  // PT/EN: decide how many items to request per platform
  const limit = platform === 'scs' ? 3 : CFG.cards.perPlatform;

  try {
    let items = await window.FeedbackAPI.list(platform, 1, limit, {
      fast: fastMode,
      nocache: forceFresh,
    });

    if ((!Array.isArray(items) || !items.length) && !forceFresh) {
      items = await window.FeedbackAPI.list(platform, 1, limit, { fast: 0, nocache: true });
    }

    console.log('[loadPlatformCard] items loaded', {
      platform,
      count: items?.length,
      items,
    });

    // PT/EN: avoid painting stale rounds
    if (seq !== _initSeq) {
      console.warn('[loadPlatformCard] ABORT seq mismatch', { seq, _initSeq });
      return { ok: false, plat: platform, hasPhotoUrl: false, signature: '', item: null };
    }

    // PT/EN: normalize candidates
    const candidates = Array.isArray(items) ? items : [];

    function getSignature(x) {
      const date = x?.date_iso || x?.date || x?.data_iso || x?.data || '';
      const author = x?.author || x?.autor || x?.name || x?.nome || '';
      const text = x?.text || x?.texto || x?.comment || x?.comentario || '';
      return `${date}|${author}|${text.slice(0, 40)}`;
    }

    // PT/EN: "blocked" signature comes from backoff or last painted signature
    const blockedSignature = (avoidSignature || lastSignatureByPlat[platform] || '').trim();

    const topSignatures = candidates.map(getSignature);
    console.log('[loadPlatformCard] top signatures', { platform, topSignatures });

    // DEBUG (can keep for now)
    if (platform === 'scs') {
      console.log('[SCS top signatures]', topSignatures);
      console.log('[SCS blockedSignature]', blockedSignature);
    }

    if (platform === 'scs' && blockedSignature) {
      const idx = topSignatures.indexOf(blockedSignature);

      // A) stale response: does not contain what is currently on screen
      if (idx === -1) {
        return {
          ok: false,
          plat: platform,
          hasPhotoUrl: false,
          signature: '',
          item: null,
          topSigs: topSignatures,
          advanced: false,
        };
      }

      // B) not advanced yet: top item is still the one on screen
      if (idx === 0) {
        return {
          ok: true,
          plat: platform,
          hasPhotoUrl: false,
          signature: blockedSignature,
          item: null,
          topSigs: topSignatures,
          advanced: false,
        };
      }

      // C) advanced: blockedSignature exists but is no longer top (carry on)
    }

    let item = candidates[0] || null;

    if (!item) {
      renderCardFallback(root, []);
      return {
        ok: false,
        plat: platform,
        hasPhotoUrl: false,
        signature: '',
        item: null,
        topSigs: topSignatures,
        advanced: false,
      };
    }

    const signature = getSignature(item);

    console.log('[loadPlatformCard] first item snapshot', {
      platform,
      author: item?.autor ?? item?.nome,
      date: item?.data ?? item?.data_iso,
      text: (item?.texto ?? item?.comentario ?? '').slice(0, 60),
      signature,
    });

    // PT/EN: check if this is a fixed card (has [data-c-list])
    const listEl = root.querySelector('[data-c-list]');
    console.log('[loadPlatformCard] list exists?', !!listEl);

    // 👉 always uses fillCardFixed for fixed cards; it builds the inner structure
    if (listEl) {
      // PT/EN: SCS guard — avoid repainting the same signature
      if (platform === 'scs' && lastSignatureByPlat[platform] === signature) {
        return {
          ok: true,
          plat: platform,
          hasPhotoUrl: Boolean(item?.foto_url),
          signature,
          item,
        };
      }

      console.log('[loadPlatformCard] calling fillCardFixed...');
      await fillCardFixed(root, item);

      // ✅ PT/EN: store the last actually painted item signature
      lastSignatureByPlat[platform] = signature;
    } else {
      console.log('[loadPlatformCard] missing [data-c-list] -> fallback');
      renderCardFallback(root, [item]);
    }

    return {
      ok: true,
      plat: platform,
      hasPhotoUrl: Boolean(item?.foto_url),
      signature,
      topSigs: topSignatures,
      item,
    };
  } catch (e) {
    console.error(`[feedbackMural] Card error ${platform}:`, e);

    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    const message = offline
      ? 'Sem conexão. Verifique sua internet.'
      : e?.message || 'Falha ao carregar.';

    renderCardError(root, message, () =>
      loadPlatformCard(selector, platform, _initSeq, { silent: false, forceFresh })
    );

    if (!offline) {
      cardsAutoRetryTimer = setTimeout(
        () => loadPlatformCard(selector, platform, _initSeq, { silent: true, forceFresh }),
        ElaraBoardHelpers.NET.autoRetryAfterMs
      );
    }

    return { ok: false, plat: platform, hasPhotoUrl: false, signature: '', item: null };
  }
}

/* ------------------------------------------------------------
 * 🔁 Board Refresh Scheduler (after "feedback:committed")
 * ------------------------------------------------------------
 * PT: Agenda um refresh do board quando um feedback foi confirmado (committed),
 *     evitando duplicar refresh para o mesmo clientRequestId.
 *     No momento do refresh, captura a signature atual do card SCS (previousSignature)
 *     para permitir backoff/advance sem “voltar” visualmente.
 *
 * EN: Schedules a board refresh after a feedback commit event,
 *     deduping refreshes by clientRequestId.
 *     At refresh time, captures the current SCS card signature (previousSignature)
 *     to support backoff/advance without visually rolling back.
 * ------------------------------------------------------------ */
function scheduleBoardRefreshFromCommitted(detail) {
  const clientRequestId = String(detail?.clientRequestId || '');
  if (!clientRequestId) return;
  if (clientRequestId === lastCommittedClientRequestId) return;
  lastCommittedClientRequestId = clientRequestId;

  clearTimeout(committedRefreshTimer);
  committedRefreshTimer = setTimeout(() => {
    const seq = ++_initSeq;

    // ✅ PT: captura no momento do refresh (sempre o que está na tela agora)
    // ✅ EN: capture at refresh time (always what is currently on screen)
    const previousSignature = lastSignatureByPlat['scs'] || '';

    console.log('[Selah] previousSignature before refresh', { previousSignature, seq, _initSeq });

    refreshSCSWithBackoff(seq, { expectPhoto: true, previousSig: previousSignature });
  }, 250);
}

const lastSignatureByPlat = Object.create(null);

// ------------------------------------------------------------
// 🔁 SCS Refresh Backoff (force-fresh + photo consolidation)
// PT: Após um "committed" (envio confirmado), tenta atualizar o card SCS com
//     backoff curto para evitar snapshot atrasado do cache e garantir que a foto
//     já esteja consolidada (quando esperado).
//
// EN: After a "committed" event, retries the SCS card refresh with a short
//     backoff to avoid stale cache snapshots and ensure the photo is consolidated
//     (when expected).
//
// Notes:
// - Uses forceFresh=true and avoidSignature to prevent repainting the same item.
// - Stops early when a new item is confirmed (and photo is present, if required).
// ------------------------------------------------------------
async function refreshSCSWithBackoff(seq, { expectPhoto = true, previousSig = '' } = {}) {
  const delaysMs = [0, 1200, 3200];

  for (let attemptIndex = 0; attemptIndex < delaysMs.length; attemptIndex++) {
    const delayMs = delaysMs[attemptIndex];

    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    if (seq !== _initSeq) return;

    const res = await loadPlatformCard(CFG.selectors.cardSCS, 'scs', seq, {
      silent: true,
      forceFresh: true,
      avoidSignature: previousSig, // ✅ IMPORTANT: prevents repainting the same item
    });

    if (seq !== _initSeq) return;
    if (!res?.ok) continue;

    // ✅ New contract: if it hasn't advanced yet, keep trying
    if (res.advanced === false) {
      console.log('[SCS backoff] not advanced yet', { attempt: attemptIndex + 1, previousSig });
      continue;
    }

    const topSigs = Array.isArray(res.topSigs) ? res.topSigs : [];
    const hasPreviousInList = !previousSig || topSigs.includes(previousSig);
    const isNewItem = !!res.signature && res.signature !== previousSig;

    console.log('[SCS backoff] result', {
      attempt: attemptIndex + 1,
      previousSig,
      hasPreviousInList,
      isNewItem,
      hasPhotoUrl: !!res.hasPhotoUrl,
      signature: res.signature,
    });

    // Stale/inconsistent snapshot → try again
    if (previousSig && !hasPreviousInList) continue;

    if (isNewItem) {
      if (!expectPhoto) return;
      if (res.hasPhotoUrl) return;

      // New item but photo not consolidated yet → retry
      continue;
    }
  }
}

// ------------------------------------------------------------
// 🌟 Selah — Public API (modern)
// PT: API pública do mural. Inicializa o Featured Review (Hero) + cards fixos
//     por plataforma e expõe refresh manual.
// EN: Public board API. Initializes the featured review (Hero) + fixed cards
//     per platform and exposes a manual refresh method.
// ------------------------------------------------------------
const SelahBoardUI = {
  // ----------------------------------------------------------
  // ✅ init()
  // PT: Monta CFG com defaults + overrides e carrega Hero + cards.
  //     Usa _initSeq para evitar “pintar” respostas antigas.
  // EN: Builds CFG from defaults + overrides and loads Hero + cards.
  //     Uses _initSeq to prevent rendering stale responses.
  // ----------------------------------------------------------
  async init(opts = {}) {
    CFG = {
      hero: { ...DEFAULTS.hero, ...(opts.hero || {}) },
      cards: { ...DEFAULTS.cards, ...(opts.cards || {}) },
      selectors: { ...DEFAULTS.selectors, ...(opts.selectors || {}) },
    };

    if (!window.FeedbackAPI?.list) {
      console.warn('[feedbackMural] FeedbackAPI.list not found.');
      return;
    }

    const runSeq = ++_initSeq;

    // Featured review (Hero)
    await loadFeaturedReview(runSeq);

    // Fixed cards by platform (staggered for smoother paint)
    await Promise.allSettled([
      loadPlatformCard(CFG.selectors.cardSCS, 'scs', runSeq),
      loadPlatformCard(CFG.selectors.cardShopee, 'shopee', runSeq),

      (async () => {
        await new Promise((r) => setTimeout(r, 200));
        return loadPlatformCard(CFG.selectors.cardML, 'ml', runSeq);
      })(),

      (async () => {
        await new Promise((r) => setTimeout(r, 400));
        return loadPlatformCard(CFG.selectors.cardGoogle, 'google', runSeq);
      })(),
    ]);
  },

  // ----------------------------------------------------------
  // 🔄 refresh()
  // PT: Recarrega os cards em modo silencioso (sem skeleton).
  // EN: Reloads cards in silent mode (no skeleton placeholders).
  // ----------------------------------------------------------
  async refresh() {
    if (!window.FeedbackAPI?.list) return;

    const runSeq = ++_initSeq;

    await Promise.allSettled([
      loadPlatformCard(CFG.selectors.cardSCS, 'scs', runSeq, { silent: true }),
      loadPlatformCard(CFG.selectors.cardShopee, 'shopee', runSeq, { silent: true }),
      loadPlatformCard(CFG.selectors.cardML, 'ml', runSeq, { silent: true }),
      loadPlatformCard(CFG.selectors.cardGoogle, 'google', runSeq, { silent: true }),
    ]);
  },
};

// ------------------------------------------------------------
// 🔔 Realtime — Immediate Hero update on new feedback (form)
// ------------------------------------------------------------
// PT: Quando um novo feedback é enviado pelo formulário,
//     atualiza o Featured Review (Hero) imediatamente,
//     sem aguardar refresh completo.
// EN: When a new feedback is submitted via form,
//     immediately updates the Featured Review (Hero),
//     without waiting for a full board refresh.
// ------------------------------------------------------------
window.addEventListener('feedback:novo', (ev) => {
  const detail = ev?.detail || {};
  if (detail?.avaliacao?.plataforma !== 'scs') return;

  const root = document.querySelector(CFG.selectors.heroRoot);
  if (!root) return;

  if (detail.item) {
    // In-place render using the Hero contract (English-only)
    renderFeaturedReview(root, {
      rating: detail.item.rating,
      author: detail.item.author ?? detail.item.name,
      text: detail.item.text ?? detail.item.comment,
      date_iso: detail.item.date_iso,
      photo_url: detail.item.photo_url,
    });
  } else {
    // ⚠️ Mantido como estava para preservar o comportamento atual
    // ⚠️ Kept as-is to avoid changing existing behavior
    loadFeaturedReview(_initSeq, { silent: false });
  }
});

// ------------------------------------------------------------
// 🌐 Network — Reload when connection is restored
// ------------------------------------------------------------
// PT: Quando a conexão volta, recarrega os cards em modo silencioso.
// EN: When the connection is restored, reloads cards in silent mode.
// ------------------------------------------------------------
window.addEventListener('online', () => {
  const seq = ++_initSeq;

  loadPlatformCard(CFG.selectors.cardSCS, 'scs', seq, { silent: true });
  loadPlatformCard(CFG.selectors.cardShopee, 'shopee', seq, { silent: true });
  loadPlatformCard(CFG.selectors.cardML, 'ml', seq, { silent: true });
  loadPlatformCard(CFG.selectors.cardGoogle, 'google', seq, { silent: true });
});

// ------------------------------------------------------------
// 🔄 Realtime — Board refresh after committed feedback
// ------------------------------------------------------------
// PT: Disparado quando um feedback é confirmado
//     (submit direto OU via outbox).
// EN: Fired when a feedback is committed
//     (direct submit OR outbox processing).
// ------------------------------------------------------------
window.addEventListener('feedback:committed', (ev) => {
  const detail = ev?.detail || null;
  if (!detail) return;

  // Log opcional (pode remover depois)
  console.log('[Selah] feedback:committed -> refresh', {
    source: detail.source,
    clientRequestId: detail.clientRequestId,
  });

  scheduleBoardRefreshFromCommitted(detail);
});

// Compatibilidade com legado
window.FeedbackMural = SelahBoardUI;

// Export moderno para o bootstrap
export { SelahBoardUI };
