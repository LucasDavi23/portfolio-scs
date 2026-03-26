// 👁️ Iris — Image Viewer
//
// Nível / Level: Jovem / Young
//
// PT: Gerencia o modal global de imagem.
// EN: Manages the global image modal.

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// ✨ Latch — Body Scroll Lock
// Fornece / Provides:
// - lockScroll()
// - unlockScroll()
/* -----------------------------------------------------------------------------*/
import { LatchRootScroll } from '/assets/js/system/utils/latch-root-scroll-lock.js';

/* -----------------------------------------------------------------------------*/
// 🪨 Onyx — Tap Guard
// Fornece / Provides:
// - createTapGuard()
/* -----------------------------------------------------------------------------*/
import { OnyxTapGuard } from '/assets/js/system/ui/gestures/onyx-tap-guard';

/* -----------------------------------------------------------------------------*/
// 🔊 Echo — Viewer Carousel
// Fornece / Provides:
// - createViewerSession()
/* -----------------------------------------------------------------------------*/
import { EchoViewerCarousel } from '/assets/js/layout/modal/echo-viewer-carousel.js';

/* -----------------------------------------------------------------------------*/
// 🕯️ Vela — Modal Motion
// Fornece / Provides:
// - openModalMotion()
// - closeModalMotion()
/* -----------------------------------------------------------------------------*/
import { VelaModalMotion } from '/assets/js/layout/modal/vela-modal-motion.js';

/* -----------------------------------------------------------------------------*/
// Image Viewer Setup
//
// PT: Inicializa o modal global e seus controles.
// EN: Initializes the global modal and its controls.
/* -----------------------------------------------------------------------------*/

// PT: Armazena a instância ativa do viewer de imagem.
// EN: Stores the active image viewer instance.
let viewerApi = null;

// PT: Controla o modal global de imagem.
// EN: Controls the global image modal.
function ImageViewer() {
  const modalPanel = document.getElementById('modalImgPanel');
  const modal = document.getElementById('modalImg');
  const modalImg = document.getElementById('modalImgSrc');
  const btnClose = document.getElementById('modalClose');

  if (!modal || !modalPanel || !modalImg || !btnClose) return;

  modal.classList.add('opacity-0');
  modal.classList.remove('opacity-100');

  const tapGuard = OnyxTapGuard.createTapGuard({
    movementThresholdPixels: 10,
    maximumTapDurationMs: 350,
    ghostClickBlockDurationMs: 450,
  });

  let activeOpenerElement = null;
  let echoSession = null;

  /* -----------------------------------------------------------------------------*/
  // Viewer Controls
  //
  // PT: Elementos do modo galeria.
  // EN: Gallery mode elements.
  /* -----------------------------------------------------------------------------*/

  const viewerControls = document.getElementById('modalViewerControls');
  const viewerPrev = document.getElementById('modalViewerPrev');
  const viewerNext = document.getElementById('modalViewerNext');
  const viewerCounter = document.getElementById('modalViewerCounter');

  const hasViewerControls = !!(viewerControls && viewerPrev && viewerNext && viewerCounter);

  /* -----------------------------------------------------------------------------*/
  // Close Shield
  //
  // PT: Evita eventos vazando logo após fechar o modal.
  // EN: Prevents events from leaking right after closing the modal.
  /* -----------------------------------------------------------------------------*/

  let closeShieldUntil = 0;

  // PT: Ativa o escudo temporário de fechamento.
  // EN: Arms the temporary close shield.
  function armCloseShield(ms = 450) {
    closeShieldUntil = performance.now() + ms;
  }

  // PT: Verifica se o escudo ainda está ativo.
  // EN: Checks whether the close shield is still active.
  function isCloseShieldActive() {
    return performance.now() < closeShieldUntil;
  }

  /* -----------------------------------------------------------------------------*/
  // Session Helpers
  //
  // PT: Controle da sessão do viewer.
  // EN: Viewer session control.
  /* -----------------------------------------------------------------------------*/

  // PT: Encerra a sessão atual do Echo.
  // EN: Destroys the current Echo session.
  function destroyEchoSession() {
    try {
      echoSession?.destroy?.();
    } catch {}
    echoSession = null;
  }

  /* -----------------------------------------------------------------------------*/
  // Image Context Helpers
  //
  // PT: Resolve dados da imagem e contexto do carrossel.
  // EN: Resolves image data and carousel context.
  /* -----------------------------------------------------------------------------*/

  // PT: Resolve imagem e texto alternativo a partir do opener.
  // EN: Resolves image and alt text from the opener.
  function resolveImageDataFromOpener(opener) {
    let src = '';
    let altText = '';

    src = opener.dataset.full || '';

    if (!src) {
      const innerImg = opener.querySelector('img');
      if (innerImg) {
        src = innerImg.dataset.full || innerImg.src || '';
        altText = innerImg.alt || '';
      }
    }

    if (!src && opener.tagName === 'IMG') {
      src = opener.src || '';
      altText = opener.alt || '';
    }

    if (!altText) {
      altText = opener.getAttribute('aria-label') || '';
    }

    return { src, altText };
  }

  // PT: Resolve o contexto de galeria a partir do opener.
  // EN: Resolves gallery context from the opener.
  function resolveCarouselContextFromOpener(opener) {
    const groupName = opener.dataset.viewerGroup || '';
    const indexStr = opener.dataset.viewerIndex || '';
    const startIndex = parseInt(indexStr, 10);

    if (!groupName || Number.isNaN(startIndex)) return null;

    const groupRoot = document.querySelector(
      `[data-viewer-group="${groupName}"][data-viewer-images]`
    );
    if (!groupRoot) return null;

    let images = [];
    try {
      images = JSON.parse(groupRoot.dataset.viewerImages || '[]');
    } catch {
      return null;
    }

    if (!Array.isArray(images) || images.length === 0) return null;

    return { images, startIndex };
  }

  /* -----------------------------------------------------------------------------*/
  // Viewer UI Helpers
  //
  // PT: Atualiza os controles visuais do modo galeria.
  // EN: Updates gallery mode visual controls.
  /* -----------------------------------------------------------------------------*/

  // PT: Esconde os controles do viewer.
  // EN: Hides viewer controls.
  function hideViewerControls() {
    if (!hasViewerControls) return;
    viewerControls.classList.add('hidden');
    viewerControls.setAttribute('aria-hidden', 'true');
  }

  // PT: Exibe os controles do viewer.
  // EN: Shows viewer controls.
  function showViewerControls() {
    if (!hasViewerControls) return;
    viewerControls.classList.remove('hidden');
    viewerControls.setAttribute('aria-hidden', 'false');
  }

  // PT: Atualiza o contador do viewer.
  // EN: Updates viewer counter.
  function updateViewerCounter(currentIndex, total) {
    if (!hasViewerControls) return;

    const safeTotal = Math.max(1, Number(total) || 1);
    const safeIndex = Math.max(0, Number(currentIndex) || 0);

    viewerCounter.textContent = `${safeIndex + 1} / ${safeTotal}`;
  }

  // PT: Atualiza o estado das setas do viewer.
  // EN: Updates viewer arrow state.
  function updateViewerArrowState(currentIndex, total) {
    if (!hasViewerControls) return;

    const safeTotal = Math.max(1, Number(total) || 1);
    const lastIndex = Math.max(0, safeTotal - 1);
    const idx = Math.max(0, Number(currentIndex) || 0);

    const disablePrev = idx <= 0;
    const disableNext = idx >= lastIndex;

    const setDisabled = (button, disabled) => {
      button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      button.classList.toggle('opacity-40', disabled);
      button.classList.toggle('cursor-not-allowed', disabled);
    };

    setDisabled(viewerPrev, disablePrev);
    setDisabled(viewerNext, disableNext);
  }

  /* -----------------------------------------------------------------------------*/
  // Modal Actions
  //
  // PT: Controla abertura e fechamento do modal.
  // EN: Controls modal opening and closing.
  /* -----------------------------------------------------------------------------*/

  // PT: Abre o modal com a imagem informada.
  // EN: Opens the modal with the provided image.
  function openModal(src, altText = '') {
    if (!src) return;

    modalImg.src = src;
    modalImg.alt = altText;

    modal.classList.remove('hidden');
    modal.classList.add('grid');
    modal.setAttribute('aria-hidden', 'false');

    modal.classList.add('opacity-0');

    // PT: Força o browser a reconhecer o estado inicial.
    // EN: Forces the browser to recognize the initial state.
    void modal.offsetHeight;

    LatchRootScroll.lockScroll();

    VelaModalMotion.openModalMotion({
      rootEl: modal,
      panelEl: modalPanel,
      enablePanelTranslate: false,
      timings: { openMs: 360, closeMs: 450 },
    });
  }

  let isClosing = false;

  // PT: Fecha o modal atual.
  // EN: Closes the current modal.
  async function closeModal() {
    if (isClosing) return;
    isClosing = true;

    armCloseShield(450);
    activeOpenerElement = null;

    destroyEchoSession();
    hideViewerControls();

    await VelaModalMotion.closeModalMotion({
      rootEl: modal,
      panelEl: modalPanel,
      enablePanelTranslate: false,
      timings: { openMs: 360, closeMs: 450 },
    });

    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');

    modalImg.src = '';
    modalImg.alt = '';

    LatchRootScroll.unlockScroll();

    isClosing = false;
  }

  /* -----------------------------------------------------------------------------*/
  // Open Handlers
  //
  // PT: Captura o fluxo de abertura via tap seguro.
  // EN: Captures the safe-tap opening flow.
  /* -----------------------------------------------------------------------------*/

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (!modal.classList.contains('hidden')) return;

      const opener = event.target.closest('.js-open-modal');
      if (!opener) return;

      event.preventDefault();
      event.stopPropagation();

      activeOpenerElement = opener;
      tapGuard.capturePointerDown(event, opener);
    },
    true
  );

  document.addEventListener(
    'pointermove',
    (event) => {
      tapGuard.trackPointerMove(event);
    },
    true
  );

  document.addEventListener(
    'pointerup',
    (event) => {
      if (isCloseShieldActive()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (!activeOpenerElement) return;

      const opener = activeOpenerElement;
      activeOpenerElement = null;

      const evaluation = tapGuard.evaluatePointerUp(event);
      if (!evaluation.ok) return;

      const { src, altText } = resolveImageDataFromOpener(opener);
      if (!src) {
        console.warn('[Iris] src não encontrado, não vou abrir a imagem.');
        return;
      }

      const carouselContext = resolveCarouselContextFromOpener(opener);

      if (carouselContext) {
        destroyEchoSession();

        openModal(carouselContext.images[carouselContext.startIndex], altText);

        echoSession = EchoViewerCarousel.createViewerSession({
          images: carouselContext.images,
          startIndex: carouselContext.startIndex,
          enableKeyboardNavigation: true,
          enableSwipeNavigation: true,
          swipeRootElement: modal,
          onChange: ({ index, images, image }) => {
            if (!image?.src) return;

            modalImg.src = image.src;
            modalImg.alt = image.alt || altText || '';

            showViewerControls();
            updateViewerCounter(index, images.length);
            updateViewerArrowState(index, images.length);
          },
        });

        showViewerControls();
        updateViewerCounter(carouselContext.startIndex, carouselContext.images.length);
        updateViewerArrowState(carouselContext.startIndex, carouselContext.images.length);

        return;
      }

      hideViewerControls();
      openModal(src, altText);
    },
    true
  );

  document.addEventListener(
    'click',
    (event) => {
      if (isCloseShieldActive()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const opener = event.target.closest('.js-open-modal');
      if (!opener) return;

      tapGuard.blockGhostClick(event);
    },
    true
  );

  // PT: Abre o modal de imagem de forma programática (ex: preview do formulário).
  // EN: Opens the image modal programmatically (e.g., form preview).
  function openImageViewer({ src, alt = '' }) {
    if (!src) return;

    openModal(src, alt);
  }

  /* -----------------------------------------------------------------------------*/
  // Viewer Control Handlers
  //
  // PT: Eventos dos controles do modo galeria.
  // EN: Gallery mode control events.
  /* -----------------------------------------------------------------------------*/

  if (hasViewerControls) {
    viewerPrev.addEventListener(
      'click',
      (event) => {
        if (viewerPrev.getAttribute('aria-disabled') === 'true') {
          event.preventDefault();
          return;
        }

        echoSession?.prev?.();
      },
      true
    );

    viewerNext.addEventListener(
      'click',
      (event) => {
        if (viewerNext.getAttribute('aria-disabled') === 'true') {
          event.preventDefault();
          return;
        }

        echoSession?.next?.();
      },
      true
    );
  }

  /* -----------------------------------------------------------------------------*/
  // Close Handlers
  //
  // PT: Eventos de fechamento do modal.
  // EN: Modal close events.
  /* -----------------------------------------------------------------------------*/

  btnClose.addEventListener(
    'pointerdown',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
    },
    true
  );

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.target !== modal) return;

      event.preventDefault();
      event.stopPropagation();

      closeModal();
    },
    true
  );

  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  return {
    openImageViewer,
  };
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const IrisImageViewer = {
  ImageViewer,

  initImageViewer() {
    viewerApi = this.ImageViewer();
  },

  openImageViewer({ src, alt = '' }) {
    viewerApi?.openImageViewer?.({ src, alt });
  },
};
