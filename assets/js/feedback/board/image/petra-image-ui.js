// 🪨 Petra — Image DOM Controller
//
// Nível / Level: Adulto / Adult
//
// PT: Responsável pelo comportamento visual das imagens no Board.
//     Aplica thumb/full, fallback visual e auto-recover diretamente
//     no DOM, utilizando a lógica pura fornecida pela Dália.
//
// EN: Responsible for the visual behavior of images in the Board.
//     Applies thumb/full images, visual fallback and auto-recover
//     directly in the DOM, using the pure logic provided by Dália.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🪷 Dália — Image Helpers
// Fornece / Provides:
// - fetchDataURL()
// - FALLBACK_IMG
// - isLikely1x1()
/* -----------------------------------------------------------------------------*/
import { DaliaImageHelpers } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

/* -----------------------------------------------------------------------------*/
// 📘 Logger — System Observability Layer
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

/* -----------------------------------------------------------------------------*/
// Image Retry Helpers
/* -----------------------------------------------------------------------------*/

// PT: Tenta carregar a imagem algumas vezes antes de aplicar fallback final.
// EN: Tries to load the image a few times before applying the final fallback.
async function applyImageWithFallback(imageElement, thumbButtonElement, proxyUrl, fullUrl) {
  try {
    const dataUrl = await DaliaImageHelpers.fetchDataURL(proxyUrl);

    if (DaliaImageHelpers.isLikely1x1(dataUrl)) {
      throw new Error('Invalid 1x1 image response');
    }

    imageElement.src = dataUrl;

    if (thumbButtonElement) {
      thumbButtonElement.classList.remove('hidden');
      thumbButtonElement.classList.add('js-open-modal');
      thumbButtonElement.setAttribute('data-full', fullUrl);
    }

    imageElement.setAttribute('data-full', fullUrl);
  } catch {
    imageElement.src = DaliaImageHelpers.FALLBACK_IMG;

    if (thumbButtonElement) {
      thumbButtonElement.classList.remove('js-open-modal');
    }
  }
}

/* -----------------------------------------------------------------------------*/
// Image Retry Helpers
/* -----------------------------------------------------------------------------*/

// PT: Tenta carregar a imagem algumas vezes antes de aplicar fallback final.
// EN: Tries to load the image a few times before applying the final fallback.
async function loadThumbWithRetries(
  imageElement,
  thumbButtonElement,
  proxyUrl,
  fullUrl,
  maxAttempts = 2
) {
  if (thumbButtonElement) {
    thumbButtonElement.classList.remove('js-open-modal');
  }
  let attempt = 0;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (attempt < maxAttempts) {
    try {
      attempt += 1;

      await applyImageWithFallback(imageElement, thumbButtonElement, proxyUrl, fullUrl);

      const currentSrc = imageElement.getAttribute('src') || '';
      const isFallback = currentSrc === DaliaImageHelpers.FALLBACK_IMG;

      if (!isFallback) {
        return;
      }
    } catch {}

    if (attempt < maxAttempts) {
      await delay(500);
    }
  }

  imageElement.src = DaliaImageHelpers.FALLBACK_IMG;
  thumbButtonElement.classList.remove('js-open-modal');

  Logger.warn('UI', 'Petra', 'thumb fallback applied after retry limit', {
    proxyUrl,
    maxAttempts,
  });
}

/* -----------------------------------------------------------------------------*/
// Smart Auto Recover
/* -----------------------------------------------------------------------------*/

// PT: Tenta recuperar a imagem em segundo plano por um período limitado.
// EN: Tries to recover the image in the background for a limited period.
function smartAutoRecover(imageElement, proxyUrl, totalMs = 60000, everyMs = 10000) {
  const startTime = Date.now();

  const tryReload = async () => {
    try {
      if (Date.now() - startTime > totalMs) return;

      const cacheBreaker = `${proxyUrl.includes('?') ? '&' : '?'}cb=${Date.now() % 1e7}`;
      const response = await fetch(proxyUrl + cacheBreaker);
      const dataUrlText = await response.text();

      if (!DaliaImageHelpers.isLikely1x1(dataUrlText)) {
        imageElement.src = dataUrlText;
        imageElement.dispatchEvent(new Event('load'));
        return;
      }
    } catch (error) {
      Logger.warn('UI', 'Petra', 'smart auto recover attempt failed', error);
    }

    setTimeout(tryReload, everyMs);
  };

  setTimeout(tryReload, everyMs);
}

/* -----------------------------------------------------------------------------*/
// Card State
/* -----------------------------------------------------------------------------*/

// PT: Marca visualmente se o card possui foto.
// EN: Visually marks whether the card has a photo.
function markHasPhoto(rootCard, hasPhoto) {
  if (!rootCard) return;

  rootCard.classList.toggle('has-photo', !!hasPhoto);
  rootCard.classList.toggle('no-photo', !hasPhoto);
}

/* -----------------------------------------------------------------------------*/
// Modal Context Helpers
/* -----------------------------------------------------------------------------*/

// PT: Verifica se o elemento está dentro do modal de feedback.
// EN: Checks whether the element is inside the feedback modal.
function isInFeedbackModal(element) {
  return !!element?.closest?.('#modalFeedback');
}

// PT: Normaliza opções de hidratação.
// EN: Normalizes hydration options.
function normalizeOptions(options) {
  return {
    allowModal: !!options?.allowModal,
  };
}

/* -----------------------------------------------------------------------------*/
// Thumb Validation
/* -----------------------------------------------------------------------------*/

// PT: Valida um src básico de imagem.
// EN: Validates a basic image src.
function isValidSrc(value) {
  if (!value) return false;

  const cleanedValue = String(value).trim();
  if (!cleanedValue || cleanedValue === '#' || cleanedValue === 'about:blank') {
    return false;
  }

  return true;
}

/* -----------------------------------------------------------------------------*/
// Thumb DOM Apply
/* -----------------------------------------------------------------------------*/

// PT: Aplica a lógica de visibilidade e data-full em um thumb-container.
// EN: Applies visibility and data-full logic to a thumb container.
function applyThumb(container, options) {
  const normalizedOptions = normalizeOptions(options);

  if (!container) return;
  if (!normalizedOptions.allowModal && isInFeedbackModal(container)) return;

  const cardElement = container.closest('[data-feedback-card]');
  const imageElement = container.querySelector('img');

  if (!imageElement) {
    container.classList.add('hidden');
    container.classList.remove('js-open-modal');
    markHasPhoto(cardElement, false);
    return;
  }

  const thumbSrc = imageElement.getAttribute('src');
  let fullSrc = imageElement.getAttribute('data-full') || container.getAttribute('data-full');

  if (isValidSrc(thumbSrc) && !isValidSrc(fullSrc)) {
    fullSrc = thumbSrc;
    imageElement.setAttribute('data-full', fullSrc);
    container.setAttribute('data-full', fullSrc);
  }

  const hasPhoto = isValidSrc(thumbSrc);

  if (hasPhoto) {
    container.classList.remove('hidden');
    container.classList.add('js-open-modal');
  } else {
    container.classList.add('hidden');
    container.classList.remove('js-open-modal');
  }

  markHasPhoto(cardElement, hasPhoto);
}

/* -----------------------------------------------------------------------------*/
// Thumb Scan
/* -----------------------------------------------------------------------------*/

// PT: Escaneia um root em busca de ".thumb-container".
// EN: Scans a root for ".thumb-container".
function scanThumbs(root = document, options) {
  const normalizedOptions = normalizeOptions(options);

  root.querySelectorAll('.thumb-container').forEach((element) => {
    applyThumb(element, normalizedOptions);
  });
}

/* -----------------------------------------------------------------------------*/
// Thumb Observer
/* -----------------------------------------------------------------------------*/

// PT: Observa o DOM e hidrata thumbs criados dinamicamente.
// EN: Observes the DOM and hydrates dynamically added thumbs.
function observeThumbs(root = document, options) {
  const normalizedOptions = normalizeOptions(options);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        if (node.matches?.('.thumb-container')) {
          applyThumb(node, normalizedOptions);
        }

        node.querySelectorAll?.('.thumb-container').forEach((element) => {
          applyThumb(element, normalizedOptions);
        });

        node.querySelectorAll?.('.thumb-container img').forEach((imageElement) => {
          const container = imageElement.closest('.thumb-container');
          if (!container) return;

          new MutationObserver(() => applyThumb(container, normalizedOptions)).observe(
            imageElement,
            {
              attributes: true,
              attributeFilter: ['src', 'data-full'],
            }
          );
        });
      });
    }
  });

  observer.observe(root.body || root, { childList: true, subtree: true });
  return observer;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const PetraImageUI = {
  // Image application
  applyImageWithFallback,
  loadThumbWithRetries,
  smartAutoRecover,
  markHasPhoto,

  // Thumb DOM control
  applyThumb,
  scanThumbs,
  observeThumbs,

  // PT: Inicializa o sistema de thumbs da Petra.
  // EN: Initializes Petra's thumb system.
  initThumbSystem(root = document) {
    scanThumbs(root);
    observeThumbs(root);
  },
};
