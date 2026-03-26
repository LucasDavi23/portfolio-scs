// 📝 Lyra — Form Modal
//
// Nível / Level: Adulta / Adult
//
// PT: Controla abertura e fechamento de modais de formulário.
// EN: Controls form modal open and close.

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
// 🕯️ Vela — Modal Motion
// Fornece / Provides:
// - openModalMotion()
// - closeModalMotion()
/* -----------------------------------------------------------------------------*/
import { VelaModalMotion } from '/assets/js/layout/modal/vela-modal-motion.js';

/* -----------------------------------------------------------------------------*/
// Constants
//
// PT: Seletores e IDs do modal.
// EN: Modal selectors and IDs.
/* -----------------------------------------------------------------------------*/

const MODAL_ID = 'feedback-modal';
const OPEN_SELECTOR = '[data-open-feedback]';
const BACKDROP_SELECTOR = '[data-feedback-backdrop]';
const CLOSE_BTN_SELECTOR = '[data-feedback-close]';

/* -----------------------------------------------------------------------------*/
// State
//
// PT: Referências do modal.
// EN: Modal references.
/* -----------------------------------------------------------------------------*/

let modal;
let dialog;
let backdrop;
let openButtons;

let isClosing = false;

/* -----------------------------------------------------------------------------*/
// Modal Actions
//
// PT: Controla abertura e fechamento do modal.
// EN: Controls modal open and close.
/* -----------------------------------------------------------------------------*/

// PT: Abre o modal.
// EN: Opens the modal.
function openModal() {
  if (!modal || !dialog || !backdrop) return;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  LatchRootScroll.lockScroll();

  VelaModalMotion.openModalMotion({
    rootEl: backdrop,
    panelEl: dialog,
    enablePanelTranslate: false,
    timings: { openMs: 360, closeMs: 450 },
  });

  // PT: Foco inicial para acessibilidade.
  // EN: Initial focus for accessibility.
  requestAnimationFrame(() => {
    dialog?.focus();
  });
}

// PT: Fecha o modal.
// EN: Closes the modal.
async function closeModal() {
  if (!modal || !dialog || !backdrop || isClosing) return;

  isClosing = true;

  await VelaModalMotion.closeModalMotion({
    rootEl: backdrop,
    panelEl: dialog,
    enablePanelTranslate: false,
    timings: { openMs: 360, closeMs: 450 },
  });

  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');

  LatchRootScroll.unlockScroll();

  isClosing = false;
}

/* -----------------------------------------------------------------------------*/
// Initialization
//
// PT: Inicializa eventos do modal.
// EN: Initializes modal events.
/* -----------------------------------------------------------------------------*/

// PT: Inicializa o modal de formulário.
// EN: Initializes form modal.
function initLyraFormModal() {
  modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  dialog = modal.querySelector('[role="dialog"]');
  backdrop = modal.querySelector(BACKDROP_SELECTOR);
  openButtons = document.querySelectorAll(OPEN_SELECTOR);

  // PT: Abertura do modal.
  // EN: Opens modal.
  openButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openModal();
    });
  });

  // PT: Fecha via backdrop ou botão.
  // EN: Closes via backdrop or button.
  modal.addEventListener('click', (event) => {
    const clickedBackdrop = event.target.closest(BACKDROP_SELECTOR);
    const clickedCloseBtn = event.target.closest(CLOSE_BTN_SELECTOR);

    if (clickedBackdrop || clickedCloseBtn) {
      event.stopPropagation();
      closeModal();
    }
  });

  // PT: Fecha via ESC.
  // EN: Closes via ESC.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const LyraFormModal = {
  initLyraFormModal,
};
