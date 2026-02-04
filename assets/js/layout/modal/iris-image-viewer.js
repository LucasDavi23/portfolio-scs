// /js/layout/modal/iris-image-viewer.js
// 👁️ Iris — Image Viewer (Modal de Imagem Global)
// Nível: Jovem
// PT: Gerencia o modal global de imagem: abre a imagem em destaque,
//     bloqueia o scroll de fundo e fecha por botão, backdrop ou ESC.
// EN: Manages the global image modal: shows the image in focus, locks
//     background scroll and closes via button, backdrop or ESC.
// -----------------------------------------------------------------------------
//
// Imports
// -----------------------------------------------------------------------------
// ✨ Latch — Body Scroll Lock (System Utils)
// Provides:
//  - lockBodyScroll()
//  - unlockBodyScroll()
//  - getScrollLockCount()
import { LatchRootScroll } from '/assets/js/system/utils/latch-root-scroll-lock.js';
//
// -----------------------------------------------------------------------------
// 🪨 Onyx PT: Tap Guard EN: Tap Guard
// Provides:
// createTapGuard()
import { OnyxTapGuard } from '/assets/js/system/ui/gestures/onyx-tap-guard';

// -----------------------------------------------------------------------------

export function ImageViewer() {
  const modal = document.getElementById('modalImg');
  const modalImg = document.getElementById('modalImgSrc');
  const btnClose = document.getElementById('modalClose');

  if (!modal || !modalImg || !btnClose) return;

  // 🪨 Onyx PT: Guardião de TAP (evita abrir modal ao rolar no mobile)
  // EN: Tap guard (prevents opening modal while scrolling on mobile)
  const tapGuard = OnyxTapGuard.createTapGuard({
    movementThresholdPixels: 10,
    maximumTapDurationMs: 350,
    ghostClickBlockDurationMs: 450,
  });

  let activeOpenerElement = null;

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
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

  function openModal(src, altText = '') {
    if (!src) {
      console.warn('[Iris] src vazio, não vou abrir a imagem.');
      return;
    }

    modalImg.src = src;
    modalImg.alt = altText;
    modal.classList.remove('hidden');
    modal.classList.add('grid');
    modal.setAttribute('aria-hidden', 'false');
    LatchRootScroll.lockScroll();
  }

  function closeModal() {
    modal.classList.remove('grid');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');

    // PT/EN: deixa o DOM aplicar hidden primeiro
    requestAnimationFrame(() => {
      LatchRootScroll.unlockScroll();
      modalImg.src = '';
      modalImg.alt = '';
    });
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

      openModal(src, altText);
    },
    true
  );

  // PT: bloqueia click fantasma após drag/scroll
  // EN: blocks ghost click after drag/scroll
  document.addEventListener(
    'click',
    (e) => {
      const opener = e.target.closest('.js-open-modal');
      if (!opener) return;
      tapGuard.blockGhostClick(e);
    },
    true
  );

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
