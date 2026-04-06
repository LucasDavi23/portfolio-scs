/* -----------------------------------------------------------------------------*/
// 🌿 Selah — Board UI Controller
//
// Nível / Level: Adulto / Adult
//
// PT: Controladora da interface do mural de avaliações.
//     Renderiza o Hero, os cards por plataforma e gerencia refresh,
//     loading, erros e atualizações em tempo real.
//
// EN: UI controller for the review board.
//     Renders the Hero, platform cards and manages refresh,
//     loading states, errors and real-time updates.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🧬 Naomi — Card API Helpers
// Fornece / Provides:
// - list()
// - listMeta()
/* -----------------------------------------------------------------------------*/
import { NaomiFeedbackCardAPI } from '/assets/js/feedback/board/api/card/naomi-card-api-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🌿 Dália — Image Helpers
// Fornece / Provides:
// - FALLBACK_IMG
// - pickImagePair()
/* -----------------------------------------------------------------------------*/
import { DaliaImageHelpers } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🎨 Petra — Image UI
// Fornece / Provides:
// - loadThumbWithRetries()
// - smartAutoRecover()
// - markHasPhoto()
/* -----------------------------------------------------------------------------*/
import { PetraImageUI } from '/assets/js/feedback/board/image/petra-image-ui.js';

/* -----------------------------------------------------------------------------*/
// ✨ Elara — Board Helpers
// Fornece / Provides:
// - skeletonLines()
// - NET
/* -----------------------------------------------------------------------------*/
import { ElaraBoardHelpers } from '/assets/js/feedback/board/main/elara-board-helpers.js';

/* -----------------------------------------------------------------------------*/
// ⭐ Zoe — Rating UI
// Fornece / Provides:
// - renderRating()
/* -----------------------------------------------------------------------------*/
import { ZoeRating } from '/assets/js/system/ui/rating/zoe-rating.js';

/* -----------------------------------------------------------------------------*/
// 🕰️ Juniper — Date/Time Utilities
// Fornece / Provides:
// - formatFromItem()
/* -----------------------------------------------------------------------------*/
import { JuniperDateTime } from '/assets/js/system/utils/juniper-date-time.js';

/* -----------------------------------------------------------------------------*/
// 📡 App Events — System Tool
// Fornece / Provides:
// - onAppEvent()
/* -----------------------------------------------------------------------------*/
import { AppEvents } from '/assets/js/system/events/appEvents.js';

/* -----------------------------------------------------------------------------*/
// Defaults
//
// PT: Configuração padrão do Hero, cards e seletores do Board.
// EN: Default configuration for the Hero, cards and Board selectors.
/* -----------------------------------------------------------------------------*/
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

let CFG = {
  hero: { ...DEFAULTS.hero },
  cards: { ...DEFAULTS.cards },
  selectors: { ...DEFAULTS.selectors },
};
let initSequence = 0;
let heroAutoRetryTimer = null;
let cardsAutoRetryTimer = null;

/* -----------------------------------------------------------------------------*/
// Refresh State
//
// PT: Estado interno usado para debounce e controle de refresh.
// EN: Internal state used for debounce and refresh control.
/* -----------------------------------------------------------------------------*/
let committedRefreshTimer = null;
let lastCommittedClientRequestId = '';

const lastSignatureByPlat = Object.create(null);

/* -----------------------------------------------------------------------------*/
// Featured Review Renderer
//
// PT: Renderiza um único review em destaque no Hero.
// EN: Renders a single featured review into the Hero.
/* -----------------------------------------------------------------------------*/
function renderFeaturedReview(root, item) {
  if (!root) return;

  const authorElement = root.querySelector('[data-h-author]');
  const ratingElement = root.querySelector('[data-h-rating]');
  const dateElement = root.querySelector('[data-h-date]');
  const textElement = root.querySelector('[data-h-text]');

  if (!item) {
    if (authorElement) authorElement.textContent = '';
    if (ratingElement) ratingElement.innerHTML = '';
    if (dateElement) dateElement.textContent = '';
    if (textElement) textElement.textContent = '';
  } else {
    const author = item.author ?? 'Customer';
    const rating = item.rating ?? item.stars ?? 0;
    const dateLabel = JuniperDateTime.formatFromItem(item);
    const text = item.text ?? item.comment ?? '';

    if (authorElement) authorElement.textContent = author;
    if (ratingElement) ratingElement.innerHTML = ZoeRating.renderRating(rating);
    if (dateElement) dateElement.textContent = dateLabel;
    if (textElement) textElement.textContent = text;
  }

  const thumbButtonElement = root.querySelector('.thumb-container');
  const imageElement = thumbButtonElement?.querySelector('img');

  if (thumbButtonElement && imageElement) {
    const { thumbUrl, fullUrl } = DaliaImageHelpers.pickImagePair(item);

    thumbButtonElement.classList.add('hidden');
    thumbButtonElement.classList.remove('js-open-modal');

    imageElement.removeAttribute('data-full');
    thumbButtonElement.removeAttribute('data-full');

    imageElement.removeAttribute('srcset');
    imageElement.removeAttribute('loading');

    imageElement.onload = null;
    imageElement.onerror = null;
    imageElement.removeAttribute('data-retried');

    if (thumbUrl) {
      imageElement.onload = () => {
        thumbButtonElement.classList.remove('hidden');
        thumbButtonElement.classList.add('js-open-modal');
        imageElement.setAttribute('data-full', fullUrl);
        thumbButtonElement.setAttribute('data-full', fullUrl);
      };

      imageElement.onerror = () => {
        const hasRetried = imageElement.getAttribute('data-retried') === '1';

        if (!hasRetried && fullUrl && fullUrl !== thumbUrl) {
          imageElement.setAttribute('data-retried', '1');
          imageElement.src = fullUrl;
          return;
        }

        thumbButtonElement.classList.add('hidden');
        thumbButtonElement.classList.remove('js-open-modal');
        imageElement.removeAttribute('src');
      };

      imageElement.removeAttribute('src');
      imageElement.src = thumbUrl;
    } else {
      imageElement.removeAttribute('src');
    }
  }
}

/* -----------------------------------------------------------------------------*/
// Featured Review Loading
//
// PT: Renderiza o estado de carregamento do Hero.
// EN: Renders the Hero loading state.
/* -----------------------------------------------------------------------------*/
function renderFeaturedReviewLoading(root) {
  const textElement = root?.querySelector('[data-h-text]');
  const ratingElement = root?.querySelector('[data-h-rating]');
  const authorElement = root?.querySelector('[data-h-author]');
  const dateElement = root?.querySelector('[data-h-date]');

  if (ratingElement) ratingElement.innerHTML = ElaraBoardHelpers.skeletonLines(1);
  if (authorElement) authorElement.textContent = '';
  if (dateElement) dateElement.textContent = '';
  if (textElement) textElement.innerHTML = ElaraBoardHelpers.skeletonLines(3);
}

/* -----------------------------------------------------------------------------*/
// Featured Review Error
//
// PT: Renderiza o estado de erro do Hero com ação opcional de retry.
// EN: Renders the Hero error state with an optional retry action.
/* -----------------------------------------------------------------------------*/
function renderFeaturedReviewError(root, message, onRetry) {
  const textElement = root?.querySelector('[data-h-text]');
  const ratingElement = root?.querySelector('[data-h-rating]');
  const authorElement = root?.querySelector('[data-h-author]');
  const dateElement = root?.querySelector('[data-h-date]');

  if (ratingElement) ratingElement.innerHTML = '';
  if (authorElement) authorElement.textContent = '';
  if (dateElement) dateElement.textContent = '';

  if (textElement) {
    textElement.innerHTML = `
      <div class="rounded-lg border p-3">
        <p class="text-sm text-red-600 mb-2">${message || 'Falha ao carregar.'}</p>
        <button type="button" class="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm" data-h-retry>
          Tentar novamente
        </button>
      </div>
    `;

    textElement
      .querySelector('[data-h-retry]')
      ?.addEventListener('click', () => onRetry && onRetry());
  }
}

/* -----------------------------------------------------------------------------*/
// Featured Review Loader
//
// PT: Carrega 1 review para o Hero com fallback e auto-retry.
// EN: Loads 1 review into the Hero with fallback and auto-retry.
/* -----------------------------------------------------------------------------*/
async function loadFeaturedReview(seq, { silent = false } = {}) {
  const root = document.querySelector(CFG.selectors.heroRoot);
  if (!root) return;

  clearTimeout(heroAutoRetryTimer);

  if (!silent) renderFeaturedReviewLoading(root);

  try {
    let list = await NaomiFeedbackCardAPI.list(CFG.hero.plat, CFG.hero.page, CFG.hero.limit, {
      fast: 1,
    });

    if (!Array.isArray(list) || !list.length) {
      list = await NaomiFeedbackCardAPI.list(CFG.hero.plat, CFG.hero.page, CFG.hero.limit, {
        fast: 0,
      });
    }

    if (seq !== initSequence) return;

    const review = Array.isArray(list) && list[0] ? list[0] : null;
    if (!review) throw new Error('No data to display.');

    renderFeaturedReview(root, review);
  } catch (error) {
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;

    const message = offline
      ? 'Sem conexão. Verifique sua internet.'
      : error?.message || 'Falha ao carregar.';

    renderFeaturedReviewError(root, message, () =>
      loadFeaturedReview(initSequence, { silent: false })
    );

    if (!offline) {
      heroAutoRetryTimer = setTimeout(
        () => loadFeaturedReview(initSequence, { silent: true }),
        ElaraBoardHelpers.NET.autoRetryAfterMs
      );
    }
  }
}

/* -----------------------------------------------------------------------------*/
// Fixed Card Renderer
//
// PT: Preenche um card fixo in-place e respeita variants como "media".
// EN: Fills a fixed card in-place and respects variants such as "media".
/* -----------------------------------------------------------------------------*/
async function fillCardFixed(root, item) {
  const listElement = root.querySelector('[data-c-list]');
  if (!listElement) return;

  const isMediaLayout =
    root.getAttribute('data-variant') === 'media' || !!listElement.querySelector('.media-row');

  if (!isMediaLayout) {
    listElement.innerHTML = `
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

  const headerRatingElement = root.querySelector('[data-c-rating]');
  const ratingValue = Number(item.rating ?? item.estrelas) || 0;

  if (headerRatingElement) {
    headerRatingElement.innerHTML = ZoeRating.renderRating(ratingValue);
  }

  const miniStarsElement = listElement.querySelector('[data-c-item-stars]');
  if (miniStarsElement) {
    const normalizedValue = Math.max(0, Math.min(ratingValue, 5));
    miniStarsElement.textContent = '★★★★★'.slice(0, Math.max(1, Math.round(normalizedValue)));
  }

  const dateElement = listElement.querySelector('[data-c-date]');
  const textElement = listElement.querySelector('[data-c-text]');
  const authorElement = listElement.querySelector('[data-c-author]');

  const text = item.text ?? item.texto ?? item.comment ?? item.comentario ?? '';
  const author = item.author ?? item.autor ?? item.name ?? item.nome ?? '';

  if (dateElement) {
    dateElement.textContent = JuniperDateTime.formatFromItem(item);
  }

  if (textElement) {
    textElement.textContent = text;
  }

  if (authorElement) {
    authorElement.textContent = author ? `— ${author}` : '';
  }

  {
    const thumbButtonElement = listElement.querySelector('.thumb-container');
    const thumbImageElement = thumbButtonElement?.querySelector('img');

    if (thumbButtonElement && thumbImageElement) {
      const { thumbUrl, fullUrl } = DaliaImageHelpers.pickImagePair(item);

      const thumbSourceUrl = thumbUrl || fullUrl || '';
      const rawFullUrl = fullUrl || thumbUrl || '';
      const cardRootElement = root || listElement.closest('section[data-feedback-card]');

      PetraImageUI.markHasPhoto(cardRootElement, false);

      thumbButtonElement.classList.add('hidden');
      thumbButtonElement.classList.remove('js-open-modal');

      thumbImageElement.onload = null;
      thumbImageElement.onerror = null;

      thumbImageElement.removeAttribute('data-full');
      thumbButtonElement.removeAttribute('data-full');

      thumbImageElement.removeAttribute('src');
      thumbImageElement.referrerPolicy = 'no-referrer';
      thumbImageElement.decoding = 'async';
      thumbImageElement.setAttribute('loading', 'eager');

      if (!thumbSourceUrl) {
        PetraImageUI.markHasPhoto(cardRootElement, false);
      } else {
        try {
          const maxAttempts = 2;

          await PetraImageUI.loadThumbWithRetries(
            thumbImageElement,
            thumbButtonElement,
            thumbSourceUrl,
            rawFullUrl,
            maxAttempts
          );

          const isVisible = !thumbButtonElement.classList.contains('hidden');
          PetraImageUI.markHasPhoto(cardRootElement, isVisible);

          const modalSourceUrl = thumbImageElement.src;

          if (modalSourceUrl && isVisible) {
            thumbImageElement.dataset.full = modalSourceUrl;
            thumbButtonElement.dataset.full = modalSourceUrl;

            thumbButtonElement.classList.add('js-open-modal');
            thumbButtonElement.setAttribute('role', 'button');
            thumbButtonElement.setAttribute('tabindex', '0');
          }

          PetraImageUI.smartAutoRecover(thumbImageElement, thumbSourceUrl, 60000, 10000);
        } catch {
          thumbImageElement.src = DaliaImageHelpers.FALLBACK_IMG;
          thumbButtonElement.classList.remove('js-open-modal');

          PetraImageUI.smartAutoRecover(thumbImageElement, thumbSourceUrl, 60000, 10000);
          PetraImageUI.markHasPhoto(cardRootElement, false);
        }
      }
    }
  }

  const platformLinkElement = root.querySelector('[data-c-link-plat]');
  if (platformLinkElement) {
    platformLinkElement.classList.add('hidden');
    platformLinkElement.removeAttribute('href');
  }
}

/* -----------------------------------------------------------------------------*/
// Card Fallback Renderer
//
// PT: Render simples quando o card não usa o layout normal.
// EN: Simple renderer when the card does not use the normal layout.
/* -----------------------------------------------------------------------------*/
function renderCardFallback(root, items) {
  const listElement = root.querySelector('[data-c-list]');
  if (!listElement) return;

  if (!items?.length) {
    const isMediaLayout = root.getAttribute('data-variant') === 'media';

    if (isMediaLayout) {
      listElement.innerHTML = `
      <div class="media-grid">
        <div class="meta-row flex items-center justify-between gap-2">
          <span class="header-author truncate" data-c-author></span>
          <time class="header-date" data-c-date></time>
        </div>

        <div class="text-wrap">
          <p
            class="text-gray-500 leading-5 break-words hyphens-auto line-clamp-none"
            data-c-text
          >Ainda não há avaliações aprovadas aqui.</p>
        </div>

        <div class="photo-sep"></div>

        <figure class="photo-wrap">
          <button
            type="button"
            class="thumb-container group relative rounded-xl overflow-hidden border border-gray-200 bg-white js-open-modal hidden"
            aria-label="Ver foto em tela cheia"
          >
            <img
              src=""
              data-full=""
              alt=""
              class="transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <span class="badge-ghost">Ver foto</span>
          </button>

          <div
            class="thumb-fallback hidden rounded-xl border border-dashed grid place-items-center bg-white text-[10px] text-gray-400"
          >
            sem foto
          </div>
        </figure>
      </div>
    `;
    } else {
      listElement.innerHTML = `<div class="text-sm text-neutral-500">Ainda não há avaliações aprovadas aqui.</div>`;
    }

    return;
  }

  const firstItem = items[0];
  const author = firstItem.author ?? firstItem.autor ?? firstItem.nome ?? 'Cliente';
  const dateLabel = JuniperDateTime.formatFromItem(firstItem);
  const text = firstItem.text ?? firstItem.texto ?? firstItem.comentario ?? '';
  const ratingValue = Number(firstItem.rating ?? firstItem.estrelas) || 0;

  listElement.innerHTML = `
    <article class="p-3 border rounded-lg bg-white">
      <div class="flex items-center justify-between gap-3 mb-1">
        <div class="font-medium truncate">${author}</div>
        <div class="text-xs text-neutral-500">${dateLabel}</div>
      </div>

      <div class="mb-1">
        ${ZoeRating.renderRating(ratingValue, { size: 'text-sm sm:text-base' })}
      </div>

      <p class="text-sm text-neutral-700 line-clamp-3">${text}</p>
    </article>
  `;
}

/* -----------------------------------------------------------------------------*/
// Card Loading Renderer
//
// PT: Renderiza o loading do card sem alterar o variant "media".
// EN: Renders the card loading state without changing the "media" variant.
/* -----------------------------------------------------------------------------*/
function renderCardLoading(root) {
  const isMediaLayout =
    root.getAttribute('data-variant') === 'media' ||
    !!root.querySelector('[data-c-list] .media-row');

  if (isMediaLayout) return;

  const listElement = root.querySelector('[data-c-list]');
  if (listElement) {
    listElement.innerHTML = ElaraBoardHelpers.skeletonLines(3);
  }
}

/* -----------------------------------------------------------------------------*/
// Card Error Renderer
//
// PT: Renderiza o estado de erro do card com retry opcional.
// EN: Renders the card error state with optional retry.
/* -----------------------------------------------------------------------------*/
function renderCardError(root, message, onRetry) {
  const listElement = root.querySelector('[data-c-list]');
  if (!listElement) return;

  listElement.innerHTML = `
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

  listElement
    .querySelector('[data-c-retry]')
    ?.addEventListener('click', () => onRetry && onRetry());
}

/* -----------------------------------------------------------------------------*/
// Platform Card Loader
//
// PT: Carrega e renderiza o card de uma plataforma.
// EN: Loads and renders the card for a given platform.
/* -----------------------------------------------------------------------------*/
async function loadPlatformCard(
  selector,
  platform,
  seq,
  { silent = false, forceFresh = false, avoidSignature = '' } = {}
) {
  const root = document.querySelector(selector);
  if (!root) {
    return { ok: false, plat: platform, hasPhotoUrl: false, signature: '', item: null };
  }

  clearTimeout(cardsAutoRetryTimer);

  if (!silent) {
    renderCardLoading(root);
  }

  const fastMode = forceFresh ? 0 : 1;
  const limit = platform === 'scs' ? 3 : CFG.cards.perPlatform;

  try {
    let items = await NaomiFeedbackCardAPI.list(platform, 1, limit, {
      fast: fastMode,
      nocache: forceFresh,
    });

    if ((!Array.isArray(items) || !items.length) && !forceFresh) {
      items = await NaomiFeedbackCardAPI.list(platform, 1, limit, {
        fast: 0,
        nocache: true,
      });
    }

    if (seq !== initSequence) {
      return { ok: false, plat: platform, hasPhotoUrl: false, signature: '', item: null };
    }

    const candidates = Array.isArray(items) ? items : [];

    function getSignature(value) {
      const date =
        value?.date_ms ??
        value?.date_br ??
        value?.date_iso ??
        value?.dateIso ??
        value?.date ??
        value?.data_iso ??
        value?.data ??
        '';

      const author = value?.author || value?.autor || value?.name || value?.nome || '';
      const text = value?.text || value?.texto || value?.comment || value?.comentario || '';

      return `${date}|${author}|${text.slice(0, 40)}`;
    }

    const blockedSignature = (avoidSignature || lastSignatureByPlat[platform] || '').trim();
    const topSignatures = candidates.map(getSignature);

    if (platform === 'scs' && blockedSignature) {
      const index = topSignatures.indexOf(blockedSignature);

      if (index === -1) {
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

      if (index === 0) {
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
    }

    const item = candidates[0] || null;

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
    const listElement = root.querySelector('[data-c-list]');

    if (listElement) {
      if (platform === 'scs' && lastSignatureByPlat[platform] === signature) {
        return {
          ok: true,
          plat: platform,
          hasPhotoUrl: Boolean(item?.photo_url),
          signature,
          item,
        };
      }

      await fillCardFixed(root, item);
      lastSignatureByPlat[platform] = signature;
    } else {
      const isMediaLayout = root.getAttribute('data-variant') === 'media';

      if (isMediaLayout) {
        await fillCardFixed(root, item);
      } else {
        renderCardFallback(root, [item]);
      }

      lastSignatureByPlat[platform] = signature;
    }

    return {
      ok: true,
      plat: platform,
      hasPhotoUrl: Boolean(item?.photo_url),
      signature,
      topSigs: topSignatures,
      item,
    };
  } catch (error) {
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    const message = offline
      ? 'Sem conexão. Verifique sua internet.'
      : error?.message || 'Falha ao carregar.';

    renderCardError(root, message, () =>
      loadPlatformCard(selector, platform, initSequence, { silent: false, forceFresh })
    );

    if (!offline) {
      cardsAutoRetryTimer = setTimeout(
        () => loadPlatformCard(selector, platform, initSequence, { silent: true, forceFresh }),
        ElaraBoardHelpers.NET.autoRetryAfterMs
      );
    }

    return { ok: false, plat: platform, hasPhotoUrl: false, signature: '', item: null };
  }
}

/* -----------------------------------------------------------------------------*/
// Board Refresh Scheduler
//
// PT: Agenda o refresh do Board após um feedback confirmado.
// EN: Schedules the Board refresh after a committed feedback.
/* -----------------------------------------------------------------------------*/
function scheduleBoardRefreshFromCommitted(detail) {
  const clientRequestId = String(detail?.clientRequestId || '');
  if (!clientRequestId) return;
  if (clientRequestId === lastCommittedClientRequestId) return;

  lastCommittedClientRequestId = clientRequestId;

  clearTimeout(committedRefreshTimer);

  committedRefreshTimer = setTimeout(() => {
    const seq = ++initSequence;
    const previousSignature = lastSignatureByPlat.scs || '';

    refreshSCSWithBackoff(seq, { expectPhoto: true, previousSig: previousSignature });
  }, 250);
}

/* -----------------------------------------------------------------------------*/
// SCS Refresh Backoff
//
// PT: Após um committed, tenta atualizar o card SCS com backoff curto.
// EN: After a committed event, retries the SCS card refresh with short backoff.
/* -----------------------------------------------------------------------------*/
async function refreshSCSWithBackoff(seq, { expectPhoto = true, previousSig = '' } = {}) {
  const delaysMs = [0, 1200, 3200];
  const isFirstEntry = !previousSig;

  for (let attemptIndex = 0; attemptIndex < delaysMs.length; attemptIndex++) {
    const delayMs = delaysMs[attemptIndex];

    if (delayMs) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (seq !== initSequence) return;

    const result = await loadPlatformCard(CFG.selectors.cardSCS, 'scs', seq, {
      silent: true,
      forceFresh: true,
      avoidSignature: previousSig,
    });

    if (seq !== initSequence) return;
    if (!result?.ok) continue;

    if (result.advanced === false) continue;

    const topSignatures = Array.isArray(result.topSigs) ? result.topSigs : [];
    const hasPreviousInList = !previousSig || topSignatures.includes(previousSig);
    const isNewItem = !!result.signature && result.signature !== previousSig;

    if (previousSig && !hasPreviousInList) continue;

    // PT: Primeiro feedback saindo do estado vazio.
    // EN: First feedback leaving the empty state.
    if (isFirstEntry) {
      if (!result.signature) continue;
      if (!expectPhoto) return;
      if (result.hasPhotoUrl) return;
      continue;
    }

    if (isNewItem) {
      if (!expectPhoto) return;
      if (result.hasPhotoUrl) return;
      continue;
    }
  }
}

/* -----------------------------------------------------------------------------*/
// Public API
//
// PT: API pública do Board.
// EN: Public API for the Board.
/* -----------------------------------------------------------------------------*/
const SelahBoardUI = {
  async init(options = {}) {
    CFG = {
      hero: { ...DEFAULTS.hero, ...(options.hero || {}) },
      cards: { ...DEFAULTS.cards, ...(options.cards || {}) },
      selectors: { ...DEFAULTS.selectors, ...(options.selectors || {}) },
    };

    if (!NaomiFeedbackCardAPI.list) {
      return;
    }

    const runSeq = ++initSequence;

    await loadFeaturedReview(runSeq);

    await Promise.allSettled([
      loadPlatformCard(CFG.selectors.cardSCS, 'scs', runSeq),
      loadPlatformCard(CFG.selectors.cardShopee, 'shopee', runSeq),

      (async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return loadPlatformCard(CFG.selectors.cardML, 'ml', runSeq);
      })(),

      (async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return loadPlatformCard(CFG.selectors.cardGoogle, 'google', runSeq);
      })(),
    ]);
  },

  async refresh() {
    if (!NaomiFeedbackCardAPI.list) return;

    const runSeq = ++initSequence;

    await Promise.allSettled([
      loadPlatformCard(CFG.selectors.cardSCS, 'scs', runSeq, { silent: true }),
      loadPlatformCard(CFG.selectors.cardShopee, 'shopee', runSeq, { silent: true }),
      loadPlatformCard(CFG.selectors.cardML, 'ml', runSeq, { silent: true }),
      loadPlatformCard(CFG.selectors.cardGoogle, 'google', runSeq, { silent: true }),
    ]);
  },
};

/* -----------------------------------------------------------------------------*/
// New Feedback Listener
//
// PT: Atualiza o Hero imediatamente quando um novo feedback é enviado.
// EN: Updates the Hero immediately when a new feedback is submitted.
/* -----------------------------------------------------------------------------*/
AppEvents.onAppEvent('feedback:new', (event) => {
  const detail = event?.detail || {};
  if (detail?.avaliacao?.plataforma !== 'scs') return;

  const root = document.querySelector(CFG.selectors.heroRoot);
  if (!root) return;

  if (detail.item) {
    renderFeaturedReview(root, {
      rating: detail.item.rating,
      author: detail.item.author ?? detail.item.name,
      text: detail.item.text ?? detail.item.comment,
      date_br: detail.item.date_br,
      date_ms: detail.item.date_ms,
      date_iso: detail.item.date_iso ?? detail.item.dateIso,
      photo_url: detail.item.photo_url,
    });
  } else {
    loadFeaturedReview(initSequence, { silent: false });
  }
});

/* -----------------------------------------------------------------------------*/
// Online Listener
//
// PT: Recarrega os cards em modo silencioso quando a conexão volta.
// EN: Reloads cards in silent mode when the connection is restored.
/* -----------------------------------------------------------------------------*/
AppEvents.onAppEvent('online', () => {
  const seq = ++initSequence;

  loadPlatformCard(CFG.selectors.cardSCS, 'scs', seq, { silent: true });
  loadPlatformCard(CFG.selectors.cardShopee, 'shopee', seq, { silent: true });
  loadPlatformCard(CFG.selectors.cardML, 'ml', seq, { silent: true });
  loadPlatformCard(CFG.selectors.cardGoogle, 'google', seq, { silent: true });
});

/* -----------------------------------------------------------------------------*/
// Committed Feedback Listener
//
// PT: Agenda refresh do Board quando o feedback é confirmado.
// EN: Schedules a Board refresh when the feedback is committed.
/* -----------------------------------------------------------------------------*/
AppEvents.onAppEvent('feedback:committed', (event) => {
  const detail = event?.detail || null;
  if (!detail) return;

  scheduleBoardRefreshFromCommitted(detail);
});

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/
export { SelahBoardUI };

/* -----------------------------------------------------------------------------*/
// 🧪 DEV TOOLS (optional)
//
// PT: Ferramentas de diagnóstico. Usar apenas em desenvolvimento.
// EN: Diagnostic tools. Use only in development.
/* -----------------------------------------------------------------------------*/

// 🧪 Performance Probe
// PT: Descomente para medir o tempo de resposta da API (GAS).
// EN: Uncomment to measure API response time.

// if (import.meta.env.DEV) {
//   import('/assets/js/feedback/dev/performance-probe.js')
//     .then(({ runPerformanceProbe }) => {
//       runPerformanceProbe(NaomiFeedbackCardAPI);
//     });
// }
