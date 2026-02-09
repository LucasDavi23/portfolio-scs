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
// ----------------------------------------------------------------------------------
// ✨ Latch — Body Scroll Lock (System Utils)
// Provides:
//  - lockBodyScroll()
//  - unlockBodyScroll()
//  - getScrollLockCount()

import { LatchRootScroll } from '/assets/js/system/utils/latch-root-scroll-lock.js';

// ----------------------------------------------------------------------------------
// 🕯️ Vela — Modal Motion (System Utils)
// Provides:
// openModalMotion,
// closeModalMotion,

import { VelaModalMotion } from '/assets/js/layout/modal/vela-modal-motion.js';

// ----------------------------------------------------------------------------------

const MODAL_ID = 'feedback-modal';
const OPEN_SELECTOR = '[data-open-feedback]';
const BACKDROP_SELECTOR = '[data-feedback-backdrop]';
const CLOSE_BTN_SELECTOR = '[data-feedback-close]';

let modal;
let dialog;
let backdrop;
let openButtons;

/**
 * PT: Abre o modal
 * EN: Opens the modal
 */
function openModal() {
  if (!modal || !dialog || !backdrop) return;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  LatchRootScroll.lockScroll();

  // 🎞️ Motion premium (Lyra)
  VelaModalMotion.openModalMotion({
    rootEl: backdrop,
    panelEl: dialog,
    enablePanelTranslate: false,
    timings: { openMs: 360, closeMs: 520 },
  });

  // foco inicial (acessibilidade)
  requestAnimationFrame(() => {
    dialog?.focus();
  });
}

/**
 * PT: Fecha o modal
 * EN: Closes the modal
 */
let isClosing = false; // flag para evitar múltiplos closes

async function closeModal() {
  if (!modal || !dialog || !backdrop || isClosing) return;
  isClosing = true;

  await VelaModalMotion.closeModalMotion({
    rootEl: backdrop,
    panelEl: dialog,
    enablePanelTranslate: false,
    timings: { openMs: 360, closeMs: 520 },
  });

  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  LatchRootScroll.unlockScroll();

  isClosing = false;
}

/**
 * PT: Inicializa o modal de formulário
 * EN: Initializes form modal
 */
export function initLyraFormModal() {
  modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  dialog = modal.querySelector('[role="dialog"]');
  backdrop = modal.querySelector(BACKDROP_SELECTOR);
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
      e.stopPropagation();
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
