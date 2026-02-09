// /js/layout/modal/iris-image-viewer.js
// 👁️ Iris — Image Viewer (Modal de Imagem Global)
// Nível: Jovem
// PT: Gerencia o modal global de imagem: abre a imagem em destaque,
//     bloqueia o scroll de fundo e fecha por botão, backdrop ou ESC.
// EN: Manages the global image modal: shows the image in focus, locks
//     background scroll and closes via button, backdrop or ESC.
// -------------------------------------------------------------------------------------
//
// Imports
// -------------------------------------------------------------------------------------
// ✨ Latch — Body Scroll Lock (System Utils)
// Provides:
//  - lockBodyScroll()
//  - unlockBodyScroll()
//  - getScrollLockCount()
import { LatchRootScroll } from '/assets/js/system/utils/latch-root-scroll-lock.js';
//
// -------------------------------------------------------------------------------------
// 🪨 Onyx PT: Tap Guard EN: Tap Guard
// Provides:
// createTapGuard()
import { OnyxTapGuard } from '/assets/js/system/ui/gestures/onyx-tap-guard';

// -------------------------------------------------------------------------------------
//
// 🔊 Echo — Viewer Carousel Assistant
// Provides:
//  - EchoViewerCarousel
import { EchoViewerCarousel } from '/assets/js/layout/modal/echo-viewer-carousel.js';

// -------------------------------------------------------------------------------------
// 🕯️ Vela — Modal Motion (System Utils)
// Provides:
// openModalMotion,
// closeModalMotion,

import { VelaModalMotion } from '/assets/js/layout/modal/vela-modal-motion.js';

// -------------------------------------------------------------------------------------

export function ImageViewer() {
  const modalPanel = document.getElementById('modalImgPanel');
  const modal = document.getElementById('modalImg');
  const modalImg = document.getElementById('modalImgSrc');
  const btnClose = document.getElementById('modalClose');

  if (!modal || !modalPanel || !modalImg || !btnClose) return;

  // ------------------------------------------------------------------
  // PT: garante estado fechado inicial do modal (compat com animação)
  // EN: ensures initial closed state (animation-safe)
  // ------------------------------------------------------------------
  modal.classList.add('opacity-0');
  modal.classList.remove('opacity-100');

  // 🪨 Onyx PT: Guardião de TAP (evita abrir modal ao rolar no mobile)
  // EN: Tap guard (prevents opening modal while scrolling on mobile)
  const tapGuard = OnyxTapGuard.createTapGuard({
    movementThresholdPixels: 10,
    maximumTapDurationMs: 350,
    ghostClickBlockDurationMs: 450,
  });

  let activeOpenerElement = null;

  let echoSession = null;

  function destroyEchoSession() {
    try {
      echoSession?.destroy?.();
    } catch {}
    echoSession = null;
  }

  // ------------------------------------------------------------------
  // 🎛️ Viewer Controls Elements (Echo mode)
  // ------------------------------------------------------------------
  const viewerControls = document.getElementById('modalViewerControls');
  const viewerPrev = document.getElementById('modalViewerPrev');
  const viewerNext = document.getElementById('modalViewerNext');
  const viewerCounter = document.getElementById('modalViewerCounter');

  // PT: controles são opcionais, mas recomendados.
  // EN: controls are optional, but recommended.
  const hasViewerControls = !!(viewerControls && viewerPrev && viewerNext && viewerCounter);

  // ------------------------------------------------------------------
  // 🔒 Close Shield — evita click-through após fechar o modal
  // ------------------------------------------------------------------
  let closeShieldUntil = 0;

  function armCloseShield(ms = 450) {
    closeShieldUntil = performance.now() + ms;
  }

  function isCloseShieldActive() {
    return performance.now() < closeShieldUntil;
  }

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  // ------------------------------------------------------------------
  // 🔎 Carousel Context Resolver
  // ------------------------------------------------------------------
  function resolveImageDataFromOpener(opener) {
    let src = '';
    let altText = '';

    // 1) data-full no opener
    src = opener.dataset.full || '';

    // 2) fallback: img interna
    if (!src) {
      const innerImg = opener.querySelector('img');
      if (innerImg) {
        src = innerImg.dataset.full || innerImg.src || '';
        altText = innerImg.alt || '';
      }
    }

    // 3) se o opener em si é IMG
    if (!src && opener.tagName === 'IMG') {
      src = opener.src || '';
      altText = opener.alt || '';
    }

    // 4) fallback alt
    if (!altText) {
      altText = opener.getAttribute('aria-label') || '';
    }

    return { src, altText };
  }

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

  // ------------------------------------------------------------------
  // 🎛️ Viewer UI Helpers (Echo mode)
  // ------------------------------------------------------------------
  function hideViewerControls() {
    if (!hasViewerControls) return;
    viewerControls.classList.add('hidden');
    viewerControls.setAttribute('aria-hidden', 'true');
  }

  function showViewerControls() {
    if (!hasViewerControls) return;
    viewerControls.classList.remove('hidden');
    viewerControls.setAttribute('aria-hidden', 'false');
  }

  function updateViewerCounter(currentIndex, total) {
    if (!hasViewerControls) return;

    const safeTotal = Math.max(1, Number(total) || 1);
    const safeIndex = Math.max(0, Number(currentIndex) || 0);

    viewerCounter.textContent = `${safeIndex + 1} / ${safeTotal}`;
  }

  function updateViewerArrowState(currentIndex, total) {
    if (!hasViewerControls) return;

    const safeTotal = Math.max(1, Number(total) || 1);
    const lastIndex = Math.max(0, safeTotal - 1);
    const idx = Math.max(0, Number(currentIndex) || 0);

    const disablePrev = idx <= 0;
    const disableNext = idx >= lastIndex;

    const setDisabled = (btn, disabled) => {
      btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      btn.classList.toggle('opacity-40', disabled);
      btn.classList.toggle('cursor-not-allowed', disabled);
    };

    setDisabled(viewerPrev, disablePrev);
    setDisabled(viewerNext, disableNext);
  }

  function openModal(src, altText = '') {
    if (!src) return;

    modalImg.src = src;
    modalImg.alt = altText;

    // PT: garante layout base antes de animar
    // EN: ensure base layout before animating
    modal.classList.remove('hidden');
    modal.classList.add('grid'); // mesmo se já tiver no HTML, não faz mal
    modal.setAttribute('aria-hidden', 'false');

    // PT: sempre começa do estado "fechado"
    // EN: always start from the "closed" state
    modal.classList.add('opacity-0');

    // PT: força o browser a reconhecer o estado inicial
    // EN: force browser to commit initial state
    void modal.offsetHeight;

    LatchRootScroll.lockScroll();

    // 🎞️ Motion premium (Iris)
    VelaModalMotion.openModalMotion({
      rootEl: modal, // overlay fade
      panelEl: modalPanel, // panel fade/scale
      enablePanelTranslate: false, // imagem fica melhor sem slide
      timings: { openMs: 360, closeMs: 520 },
    });
  }

  let isClosing = false; // flag para evitar múltiplos closes

  async function closeModal() {
    if (isClosing) return;
    isClosing = true;

    // PT: arma escudo para bloquear eventos vazando após fechar
    // EN: arms shield to block events leaking after close
    armCloseShield(450);

    // PT: limpa opener ativo
    // EN: clears active opener
    activeOpenerElement = null;

    destroyEchoSession();
    hideViewerControls();

    await VelaModalMotion.closeModalMotion({
      rootEl: modal,
      panelEl: modalPanel,
      enablePanelTranslate: false,
      timings: { openMs: 360, closeMs: 520 },
    });

    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');

    // PT: limpa imagem depois de esconder (evita flicker)
    // EN: clear image after hiding (prevents flicker)
    modalImg.src = '';
    modalImg.alt = '';

    LatchRootScroll.unlockScroll();

    isClosing = false;
  }

  // --------------------------------------------------
  // Open modal (tap-safe via Onyx)
  // --------------------------------------------------
  document.addEventListener(
    'pointerdown',
    (e) => {
      // PT: se modal aberto, não processa openers
      // EN: if modal is open, ignore openers
      if (!modal.classList.contains('hidden')) return;

      const opener = e.target.closest('.js-open-modal');
      if (!opener) return;

      // PT: evita navegação (ex: <a href="#">) e evita "click-through"
      // EN: prevents navigation (e.g., <a href="#">) and click-through
      e.preventDefault();
      e.stopPropagation();

      activeOpenerElement = opener;

      // Inicia o tracking do tap guard
      tapGuard.capturePointerDown(e, opener);
    },
    true // capture: pega antes de handlers/navegação
  );

  document.addEventListener(
    'pointermove',
    (e) => {
      tapGuard.trackPointerMove(e);
    },
    true
  );

  document.addEventListener(
    'pointerup',
    (e) => {
      // PT: bloqueia pointerup logo após fechar o modal
      // EN: blocks pointerup right after closing the modal
      if (isCloseShieldActive()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (!activeOpenerElement) return;

      const opener = activeOpenerElement;
      activeOpenerElement = null;

      const evaluation = tapGuard.evaluatePointerUp(e);
      if (!evaluation.ok) return;

      const { src, altText } = resolveImageDataFromOpener(opener);
      if (!src) {
        console.warn('[Iris] src não encontrado, não vou abrir a imagem.');
        return;
      }

      const carouselContext = resolveCarouselContextFromOpener(opener);

      if (carouselContext) {
        destroyEchoSession();

        // Abre o modal já com a imagem inicial do carrossel
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

        // ✅ init do UI no primeiro frame (antes do 1º onChange)
        showViewerControls();
        updateViewerCounter(carouselContext.startIndex, carouselContext.images.length);
        updateViewerArrowState(carouselContext.startIndex, carouselContext.images.length);

        return; // 👈 importante: não cair no openModal simples
      }
      // PT: se não tem contexto de carrossel, abre modal simples (comportamento atual)
      hideViewerControls();
      // Fallback: imagem única (comportamento atual)
      openModal(src, altText);
    },
    true
  );

  // PT: bloqueia click fantasma após drag/scroll
  // EN: blocks ghost click after drag/scroll
  document.addEventListener(
    'click',
    (e) => {
      // PT: bloqueia click vazando após close
      // EN: blocks click leaking after close
      if (isCloseShieldActive()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const opener = e.target.closest('.js-open-modal');
      if (!opener) return;
      tapGuard.blockGhostClick(e);
    },
    true
  );

  // --------------------------------------------------
  // Viewer controls handlers (Echo mode)
  // --------------------------------------------------
  if (hasViewerControls) {
    viewerPrev.addEventListener(
      'click',
      (e) => {
        if (viewerPrev.getAttribute('aria-disabled') === 'true') {
          e.preventDefault();
          return;
        }
        echoSession?.prev?.();
      },
      true
    );

    viewerNext.addEventListener(
      'click',
      (e) => {
        if (viewerNext.getAttribute('aria-disabled') === 'true') {
          e.preventDefault();
          return;
        }
        echoSession?.next?.();
      },
      true
    );
  }

  // --------------------------------------------------
  // Close handlers
  // --------------------------------------------------

  btnClose.addEventListener(
    'pointerdown',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    },
    true
  );

  // PT: fecha no pointerdown (antes do click) para evitar "click-through"
  // EN: close on pointerdown (before click) to avoid click-through
  modal.addEventListener(
    'pointerdown',
    (e) => {
      // só fecha se clicou no overlay (fora do conteúdo)
      if (e.target !== modal) return;

      e.preventDefault();
      e.stopPropagation();

      closeModal();
    },
    true // capture: pega antes do restante
  );

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

export const IrisImageViewer = {
  ImageViewer,

  initImageViewer() {
    this.ImageViewer();
  },
};
