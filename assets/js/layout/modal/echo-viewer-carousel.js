// 🔊 Echo — Viewer Carousel
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Gerencia navegação de imagens em modo galeria.
// EN: Manages image navigation in gallery mode.

/* -----------------------------------------------------------------------------*/
// Helpers (Pure)
//
// PT: Funções puras de apoio.
// EN: Pure helper functions.
/* -----------------------------------------------------------------------------*/

// PT: Mantém número dentro do limite.
// EN: Keeps number within bounds.
function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// PT: Normaliza lista de imagens.
// EN: Normalizes image list.
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

// PT: Verifica se é campo de formulário.
// EN: Checks if element is a form control.
function isFormControlElement(element) {
  const tagName = element?.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

/* -----------------------------------------------------------------------------*/
// Session Helpers
//
// PT: Controle interno da sessão.
// EN: Internal session control.
/* -----------------------------------------------------------------------------*/

// PT: Notifica mudança de imagem.
// EN: Notifies image change.
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

// PT: Verifica se pode avançar.
// EN: Checks if can go next.
function canGoToNext(sessionState) {
  return sessionState.currentIndex < sessionState.imageList.length - 1;
}

// PT: Verifica se pode voltar.
// EN: Checks if can go previous.
function canGoToPrevious(sessionState) {
  return sessionState.currentIndex > 0;
}

// PT: Vai para índice específico.
// EN: Navigates to specific index.
function goToIndex(sessionState, targetIndex, reason) {
  if (sessionState.isDestroyed) return false;
  if (!sessionState.imageList.length) return false;

  const nextIndex = clampNumber(Number(targetIndex), 0, sessionState.imageList.length - 1);

  if (nextIndex === sessionState.currentIndex) return false;

  sessionState.currentIndex = nextIndex;
  notifySessionChange(sessionState, reason);
  return true;
}

// PT: Avança imagem.
// EN: Goes to next image.
function goToNext(sessionState, reason) {
  if (!canGoToNext(sessionState)) return false;
  return goToIndex(sessionState, sessionState.currentIndex + 1, reason);
}

// PT: Volta imagem.
// EN: Goes to previous image.
function goToPrevious(sessionState, reason) {
  if (!canGoToPrevious(sessionState)) return false;
  return goToIndex(sessionState, sessionState.currentIndex - 1, reason);
}

/* -----------------------------------------------------------------------------*/
// Handlers
//
// PT: Manipuladores de eventos.
// EN: Event handlers.
/* -----------------------------------------------------------------------------*/

// PT: Cria handler de teclado.
// EN: Creates keyboard handler.
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

// PT: Cria handlers de swipe.
// EN: Creates swipe handlers.
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

/* -----------------------------------------------------------------------------*/
// Public API
//
// PT: Cria sessão do viewer.
// EN: Creates viewer session.
/* -----------------------------------------------------------------------------*/

// PT: Inicializa sessão de galeria.
// EN: Initializes gallery session.
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
    imageList,
    currentIndex: clampNumber(Number(startIndex) || 0, 0, Math.max(0, imageList.length - 1)),
    onChange,
    isDestroyed: false,
    swipeMinimumDistancePixels,
    swipeDominanceRatio,
    swipeFastVelocityThreshold,
  };

  const keyboardHandler = enableKeyboardNavigation ? createKeyboardHandler(sessionState) : null;
  const swipeHandlers = enableSwipeNavigation ? createSwipeHandlers(sessionState) : null;

  if (keyboardHandler) {
    addEventListener('keydown', keyboardHandler);
  }

  if (swipeHandlers && swipeRootElement) {
    swipeRootElement.addEventListener('touchstart', swipeHandlers.handleTouchStart, {
      passive: true,
    });
    swipeRootElement.addEventListener('touchend', swipeHandlers.handleTouchEnd, {
      passive: true,
    });
  }

  notifySessionChange(sessionState, 'init');

  return {
    getIndex() {
      return sessionState.currentIndex;
    },
    getImages() {
      return sessionState.imageList;
    },
    next() {
      return goToNext(sessionState);
    },
    prev() {
      return goToPrevious(sessionState);
    },
    goTo(targetIndex) {
      return goToIndex(sessionState, targetIndex, 'goTo');
    },
    destroy() {
      sessionState.isDestroyed = true;

      if (keyboardHandler) {
        removeEventListener('keydown', keyboardHandler);
      }

      if (swipeHandlers && swipeRootElement) {
        swipeRootElement.removeEventListener('touchstart', swipeHandlers.handleTouchStart);
        swipeRootElement.removeEventListener('touchend', swipeHandlers.handleTouchEnd);
      }
    },
  };
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const EchoViewerCarousel = {
  createViewerSession,
};
