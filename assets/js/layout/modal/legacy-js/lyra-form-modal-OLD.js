// ------------------------------------------------------------
// Lyra — Form Modal Controller (Layout)
// Nível: Adulta
// ------------------------------------------------------------
// PT: Controla abertura/fechamento de modais de formulário.
//     Overlay, foco, ESC e scroll lock.
// EN: Controls form modals open/close.
//     Overlay, focus, ESC and scroll lock.
// ------------------------------------------------------------

// Imports
// -----------------------------------------------------------------------------
// ✨ Latch — Body Scroll Lock (System Utils)
// Provides:
//  - lockBodyScroll()
//  - unlockBodyScroll()
//  - getScrollLockCount()

import { LatchBodyScroll } from '/assets/js/system/utils/latch-body-scroll-lock.js';

const MODAL_ID = 'feedback-modal';
const OPEN_SELECTOR = '[data-open-feedback]';
const BACKDROP_SELECTOR = '[data-feedback-backdrop]';
const CLOSE_BTN_SELECTOR = '[data-feedback-close]';

let modal;
let dialog;
let openButtons;

/**
 * PT: Trava o scroll da página
 * EN: Locks page scroll
 */
function lockScroll() {
  document.documentElement.classList.add('no-scroll');
}

/**
 * PT: Libera o scroll da página
 * EN: Unlocks page scroll
 */
function unlockScroll() {
  document.documentElement.classList.remove('no-scroll');
}

/**
 * PT: Abre o modal
 * EN: Opens the modal
 */
function openModal() {
  if (!modal) return;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  lockScroll();

  // foco inicial (acessibilidade)
  requestAnimationFrame(() => {
    dialog?.focus();
  });
}

/**
 * PT: Fecha o modal
 * EN: Closes the modal
 */
function closeModal() {
  if (!modal) return;

  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  unlockScroll();
}

/**
 * PT: Inicializa o modal de formulário
 * EN: Initializes form modal
 */
export function initLyraFormModal() {
  modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  dialog = modal.querySelector('[role="dialog"]');
  openButtons = document.querySelectorAll(OPEN_SELECTOR);

  // Abrir
  openButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Fechar (backdrop ou botão)
  modal.addEventListener('click', (e) => {
    const clickedBackdrop = e.target.closest(BACKDROP_SELECTOR);
    const clickedCloseBtn = e.target.closest(CLOSE_BTN_SELECTOR);
    if (clickedBackdrop || clickedCloseBtn) {
      closeModal();
    }
  });

  // ESC fecha
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

export const LyraFormModal = {
  initLyraFormModal,
};
