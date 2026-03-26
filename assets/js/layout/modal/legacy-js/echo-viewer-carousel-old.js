// ==================================================
// 🔊 Echo — Viewer Carousel Assistant
//
// Nível: Aprendiz
//
// PT: Auxilia a Iris quando o modal de imagem precisa operar
//     como galeria. Echo gerencia lista de imagens, índice atual
//     e navegação (next/prev, swipe e teclado), notificando a Iris
//     sempre que a imagem muda.
//     Echo não abre/fecha modal, não controla scroll e não altera UI.
//
// EN: Assists Iris when the image modal needs to operate as a gallery.
//     Echo manages the image list, current index and navigation
//     (next/prev, swipe and keyboard), notifying Iris whenever
//     the image changes.
//     Echo does not open/close the modal, handle scroll, or alter UI.
// --------------------------------------------------

// -----------------------------------------------------------------------------
// Internal helpers (pure)
// -----------------------------------------------------------------------------

// PT: Garante que o número fique dentro dos limites.
// EN: Ensures a number stays within bounds.
function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// PT: Normaliza a lista de imagens para { src, alt }.
// EN: Normalizes the image list to { src, alt }.
function normalizeImageList(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((item) => {
      if (!item) return null;

      if (typeof item === 'string') {
        return { src: item, alt: '' };
      }

      if (typeof item === 'object') {
        const src = item.src || item.url || '';
        const alt = item.alt || '';
        if (!src) return null;
        return { src, alt };
      }

      return null;
    })
    .filter(Boolean);
}

// PT: Evita capturar teclado quando o foco está em campos de formulário.
// EN: Avoids capturing keys while focus is on form controls.
function isFormControlElement(element) {
  const tagName = element?.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

// -----------------------------------------------------------------------------
// Internal helpers (session-specific)
// -----------------------------------------------------------------------------

function notifySessionChange(sessionState, reason) {
  const { onChange, currentIndex, imageList, isDestroyed } = sessionState;
  if (isDestroyed) return;
  if (typeof onChange !== 'function') return;

  onChange({
    index: currentIndex,
    image: imageList[currentIndex] || null,
    images: imageList,
    reason,
  });
}

function canGoToNext(sessionState) {
  return sessionState.currentIndex < sessionState.imageList.length - 1;
}

function canGoToPrevious(sessionState) {
  return sessionState.currentIndex > 0;
}

function goToIndex(sessionState, targetIndex, reason) {
  if (sessionState.isDestroyed) return false;
  if (!sessionState.imageList.length) return false;

  const nextIndex = clampNumber(Number(targetIndex), 0, sessionState.imageList.length - 1);

  if (nextIndex === sessionState.currentIndex) return false;

  sessionState.currentIndex = nextIndex;
  notifySessionChange(sessionState, reason);
  return true;
}

function goToNext(sessionState, reason) {
  if (!canGoToNext(sessionState)) return false;
  return goToIndex(sessionState, sessionState.currentIndex + 1, reason);
}

function goToPrevious(sessionState, reason) {
  if (!canGoToPrevious(sessionState)) return false;
  return goToIndex(sessionState, sessionState.currentIndex - 1, reason);
}
// -----------------------------------------------------------------------------
// Handler factories (keep outside createViewerSession)
// -----------------------------------------------------------------------------

// PT: Cria manipulador de teclado para navegação.
// EN: Creates keyboard handler for navigation.
function createKeyboardHandler(sessionState) {
  return function handleKeyDown(event) {
    if (sessionState.isDestroyed) return;
    if (isFormControlElement(event.target)) return;

    if (event.key === 'ArrowRight' && canGoToNext(sessionState)) {
      event.preventDefault();
      goToNext(sessionState, 'keyboard');
    }

    if (event.key === 'ArrowLeft' && canGoToPrevious(sessionState)) {
      event.preventDefault();
      goToPrevious(sessionState, 'keyboard');
    }
  };
}

function createSwipeHandlers(sessionState) {
  let touchStartClientX = 0;
  let touchStartClientY = 0;
  let touchStartTimestampMs = 0;

  function handleTouchStart(event) {
    if (sessionState.isDestroyed) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    touchStartClientX = touch.clientX;
    touchStartClientY = touch.clientY;
    touchStartTimestampMs = performance.now();
  }

  function handleTouchEnd(event) {
    if (sessionState.isDestroyed) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartClientX;
    const deltaY = touch.clientY - touchStartClientY;

    // PT: ignora swipe vertical dominante
    // EN: ignore vertically dominant swipes
    if (Math.abs(deltaY) * sessionState.swipeDominanceRatio > Math.abs(deltaX)) return;

    const elapsedTimeMs = Math.max(1, performance.now() - touchStartTimestampMs);
    const swipeVelocity = Math.abs(deltaX) / elapsedTimeMs;

    const isSwipeStrongEnough =
      Math.abs(deltaX) >= sessionState.swipeMinimumDistancePixels ||
      swipeVelocity >= sessionState.swipeFastVelocityThreshold;

    if (!isSwipeStrongEnough) return;

    if (deltaX < 0 && canGoToNext(sessionState)) {
      goToNext(sessionState, 'swipe');
    }

    if (deltaX > 0 && canGoToPrevious(sessionState)) {
      goToPrevious(sessionState, 'swipe');
    }
  }

  return { handleTouchStart, handleTouchEnd };
}

// -----------------------------------------------------------------------------
// Public API (🔊 Echo — Viewer Carousel Session)
// -----------------------------------------------------------------------------

function createViewerSession(options = {}) {
  const {
    images = [],
    startIndex = 0,
    onChange = null,

    enableKeyboardNavigation = false,

    enableSwipeNavigation = false,
    swipeRootElement = null,

    swipeMinimumDistancePixels = 45,
    swipeDominanceRatio = 1.25,
    swipeFastVelocityThreshold = 0.55,
  } = options;

  const imageList = normalizeImageList(images);

  const sessionState = {
    // PT/EN: core
    imageList,
    currentIndex: clampNumber(Number(startIndex) || 0, 0, Math.max(0, imageList.length - 1)),
    onChange,
    isDestroyed: false,

    // PT/EN: swipe config
    swipeMinimumDistancePixels,
    swipeDominanceRatio,
    swipeFastVelocityThreshold,
  };

  // Create handlers (stable refs for removeEventListener)
  const keyboardHandler = enableKeyboardNavigation ? createKeyboardHandler(sessionState) : null;

  const swipeHandlers = enableSwipeNavigation ? createSwipeHandlers(sessionState) : null;

  // Bind listeners
  if (keyboardHandler) {
    window.addEventListener('keydown', keyboardHandler);
  }

  if (swipeHandlers && swipeRootElement) {
    swipeRootElement.addEventListener('touchstart', swipeHandlers.handleTouchStart, {
      passive: true,
    });
    swipeRootElement.addEventListener('touchend', swipeHandlers.handleTouchEnd, {
      passive: true,
    });
  }

  // Initial emit
  notifySessionChange(sessionState, 'init');

  // Return controller to Iris
  return {
    // PT/EN: getters
    getIndex() {
      return sessionState.currentIndex;
    },
    getImages() {
      return sessionState.imageList;
    },

    // PT/EN: navigation
    next() {
      return goToNext(sessionState);
    },
    prev() {
      return goToPrevious(sessionState);
    },
    goTo(targetIndex) {
      return goToIndex(sessionState, targetIndex, 'goTo');
    },

    // PT/EN: teardown
    destroy() {
      sessionState.isDestroyed = true;

      if (keyboardHandler) {
        window.removeEventListener('keydown', keyboardHandler);
      }

      if (swipeHandlers && swipeRootElement) {
        swipeRootElement.removeEventListener('touchstart', swipeHandlers.handleTouchStart);
        swipeRootElement.removeEventListener('touchend', swipeHandlers.handleTouchEnd);
      }
    },
  };
}

// ------------------------------
// Export pattern (project standard)
// ------------------------------
export const EchoViewerCarousel = {
  createViewerSession,
};
