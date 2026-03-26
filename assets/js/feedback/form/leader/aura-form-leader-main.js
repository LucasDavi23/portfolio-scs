/* -----------------------------------------------------------------------------*/
// 🌙 Aura — Feedback FORM Leader
//
// Nível / Level: Adulta / Adult
//
// PT: Aura coordena o setor FORM do feedback.
//     Não implementa UI, não valida domínio profundo,
//     não processa imagem e não chama rede diretamente.
//     Sua função é garantir que cada especialista do FORM execute seu papel
//     no momento certo, mantendo o formulário estável,
//     previsível e fácil de manter.
//
// EN: Aura coordinates the Feedback FORM sector.
//     She does not implement UI, does not run deep domain validation,
//     does not process images and does not call network APIs directly.
//     Her role is to ensure each FORM specialist runs at the right time,
//     keeping the form stable, predictable and maintainable.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🌙 Liora — Form Flow Conductor
// Fornece / Provides:
// - attachFormController()
/* -----------------------------------------------------------------------------*/
import { LioraFormController } from '/assets/js/feedback/form/controller/liora-form-controller.js';

/* -----------------------------------------------------------------------------*/
// ⭐ Ayla — Form Rating UI Specialist
// Fornece / Provides:
// - attachStarsUI()
/* -----------------------------------------------------------------------------*/
import { AylaRatingStarsUI } from '/assets/js/feedback/form/rating/ayla-rating-stars-ui.js';

/* -----------------------------------------------------------------------------*/
// 📷 Daphne — Photo UI Specialist
// Fornece / Provides:
// - attachPhotoUI()
/* -----------------------------------------------------------------------------*/
import { DaphnePhotoUI } from '/assets/js/feedback/form/image/daphne-photo-ui.js';

/* -----------------------------------------------------------------------------*/
// ✨ Irene — Photo Preview UX
// Fornece / Provides:
// - attachPhotoPreviewUX()
/* -----------------------------------------------------------------------------*/
import { IrenePhotoPreviewUX } from '/assets/js/feedback/form/ux/irene-photo-preview-ux.js';

/* -----------------------------------------------------------------------------*/
// 🧮 Mina — Comment Counter UX
// Fornece / Provides:
// - attachCommentCounterUX()
/* -----------------------------------------------------------------------------*/
import { MinaCommentCounterUX } from '/assets/js/feedback/form/ux/mina-comment-counter-ux.js';

/* -----------------------------------------------------------------------------*/
// 🧠 Sofia — Form Validation & UX State Specialist
// Fornece / Provides:
// - attachAutoClearFieldErrors()
/* -----------------------------------------------------------------------------*/
import { SofiaFormValidationUI } from '/assets/js/feedback/form/validation/sofia-form-validation-ui.js';

/* -----------------------------------------------------------------------------*/
// 📘 Logger — System Observability Layer
// Fornece / Provides:
// - warn()
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares usadas internamente pela Aura.
// EN: Helper functions used internally by Aura.
/* -----------------------------------------------------------------------------*/

// PT: Executa uma função quando o DOM estiver pronto.
// EN: Runs a function once the DOM is ready.
function onDomReady(callback) {
  if (document.readyState !== 'loading') {
    callback();
    return;
  }

  document.addEventListener('DOMContentLoaded', callback, { once: true });
}

// PT: Executa uma etapa de inicialização com proteção de erro.
// EN: Runs an initialization step with safe error protection.
function runInitStep(stepName, callback) {
  try {
    callback();
  } catch (error) {
    Logger.warn('FORM', 'Aura', `Failed to initialize ${stepName}`, error);
  }
}

// PT: Inicializa a UX de preview da foto.
// EN: Initializes the photo preview UX.
function initIrenePhotoPreviewUX() {
  runInitStep('IrenePhotoPreviewUX', () => {
    IrenePhotoPreviewUX.attachPhotoPreviewUX();
  });
}

// PT: Inicializa o contador de caracteres do comentário.
// EN: Initializes the comment character counter.
function initMinaCommentCounterUX() {
  runInitStep('MinaCommentCounterUX', () => {
    MinaCommentCounterUX.attachCommentCounterUX();
  });
}

// PT: Inicializa a UI base da foto.
// EN: Initializes the base photo UI.
function initDaphnePhotoUI() {
  runInitStep('DaphnePhotoUI', () => {
    DaphnePhotoUI.attachPhotoUI();
  });
}

// PT: Inicializa a UI das estrelas de avaliação.
// EN: Initializes the rating stars UI.
function initAylaRatingStarsUI() {
  runInitStep('AylaRatingStarsUI', () => {
    AylaRatingStarsUI.attachStarsUI();
  });
}

// PT: Inicializa o auto-clear de erros do formulário.
// EN: Initializes the form error auto-clear behavior.
function initSofiaFormValidationUI() {
  runInitStep('SofiaFormValidationUI', () => {
    SofiaFormValidationUI.attachAutoClearFieldErrors();
  });
}

// PT: Inicializa o controller do formulário.
// EN: Initializes the form controller.
function initLioraFormController() {
  runInitStep('LioraFormController', () => {
    LioraFormController.attachFormController();
  });
}

// PT: Amarra todas as etapas de inicialização do FORM.
// EN: Wires all FORM initialization steps.
function bootstrapForm() {
  initIrenePhotoPreviewUX();
  initMinaCommentCounterUX();
  initDaphnePhotoUI();
  initAylaRatingStarsUI();
  initSofiaFormValidationUI();
  initLioraFormController();
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const AuraFormLeader = {
  // PT: Inicializa o setor FORM do feedback.
  // EN: Initializes the feedback FORM sector.
  initForm() {
    onDomReady(bootstrapForm);
  },

  // PT: Exposto para debug e uso controlado.
  // EN: Exposed for debug and controlled use.
  bootstrapForm,
};
