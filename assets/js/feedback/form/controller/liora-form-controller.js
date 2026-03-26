/* -----------------------------------------------------------------------------*/
// 🌙 Liora — Form Flow Conductor
//
// Nível / Level: Jovem / Young
//
// PT: Coordena o fluxo do formulário de feedback.
//     Conecta eventos do formulário (submit) e delega responsabilidades
//     para especialistas.
//     Não implementa regras de domínio nem chamadas de rede;
//     apenas garante a ordem e a coerência do processo.
//
// EN: Coordinates the feedback form flow.
//     Wires form events (submit) and delegates responsibilities
//     to specialists.
//     Does not implement domain rules or network calls;
//     it only ensures the correct order and coherence of the process.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🧠 Sofia — Form Validation & UX State Specialist
// Fornece / Provides:
// - elements
// - collectFormValues()
// - validateBasicRules()
// - lockSubmit()
// - showFormStatus()
// - resetFormUI()
// - getFieldElement()
// - markFieldError()
// - markRatingError()
// - clearRatingError()
// - scrollToField()
/* -----------------------------------------------------------------------------*/
import { SofiaFormValidationUI } from '/assets/js/feedback/form/validation/sofia-form-validation-ui.js';

/* -----------------------------------------------------------------------------*/
// 🧾 Selene — Feedback Submit Specialist (Flow)
// Fornece / Provides:
// - submitFeedback()
/* -----------------------------------------------------------------------------*/
import { SeleneSubmitFlow } from '/assets/js/feedback/form/submit/selene-submit-flow.js';

/* -----------------------------------------------------------------------------*/
// 💬 Halo — Message Box
// Fornece / Provides:
// - show()
/* -----------------------------------------------------------------------------*/
import { HaloMessageBox } from '/assets/js/system/ui/notifications/messagebox/halo-message-box.js';

/* -----------------------------------------------------------------------------*/
// ⭐ Ayla — Form Rating UI Specialist
// Fornece / Provides:
// - clearStarsUI()
/* -----------------------------------------------------------------------------*/
import { AylaRatingStarsUI } from '/assets/js/feedback/form/rating/ayla-rating-stars-ui.js';

/* -----------------------------------------------------------------------------*/
// 🍃 Luma — Loading Base
// Fornece / Provides:
// - ensurePaint()
/* -----------------------------------------------------------------------------*/
import { LumaLoading } from '/assets/js/system/ui/loading/luma-loading.js';

/* -----------------------------------------------------------------------------*/
// ⭐ Stella — Submit Overlay UI
// Fornece / Provides:
// - show()
// - hide()
/* -----------------------------------------------------------------------------*/
import { StellaSubmitOverlay } from '/assets/js/system/ui/loading/stella-submit-overlay.js';

/* -----------------------------------------------------------------------------*/
// 📘 Logger — System Observability Layer
// Fornece / Provides:
// - error()
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

/* -----------------------------------------------------------------------------*/
// 📡 App Events — System Tool
// Fornece / Provides:
// - emitAppEvent()
/* -----------------------------------------------------------------------------*/
import { AppEvents } from '/assets/js/system/events/appEvents.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Estado interno e funções auxiliares usadas neste controller.
// EN: Internal state and helper functions used by this controller.
/* -----------------------------------------------------------------------------*/

let isAttached = false;
let onFormSubmitRef = null;

// PT: Alterna o estado visual e semântico de "processando" no formulário.
// EN: Toggles the visual and semantic "processing" state on the form.
function setFormBusy(isBusy) {
  const formElement = SofiaFormValidationUI.elements?.form;

  if (!formElement) {
    return;
  }

  formElement.toggleAttribute('aria-busy', isBusy);
  formElement.classList.toggle('pointer-events-none', Boolean(isBusy));
  formElement.classList.toggle('opacity-95', Boolean(isBusy));
}

// PT: Coleta os valores do formulário e adiciona o arquivo da foto.
// EN: Collects form values and appends the selected photo file.
function collectFormValuesWithFile() {
  const values = SofiaFormValidationUI.collectFormValues();

  const photoInputElement =
    SofiaFormValidationUI.elements?.photoInput || document.getElementById('photo');

  return {
    ...values,
    file: photoInputElement?.files?.[0] || null,
  };
}

// PT: Marca o erro visualmente e guia o usuário até o campo inválido.
// EN: Marks the error visually and guides the user to the invalid field.
function showValidationError(validationResult) {
  const message = validationResult?.message || 'Verifique os dados e tente novamente.';

  if (validationResult?.field === 'rating') {
    SofiaFormValidationUI.markRatingError(message);
  } else {
    const fieldElement = SofiaFormValidationUI.getFieldElement(validationResult?.field);

    SofiaFormValidationUI.markFieldError(fieldElement, message);
  }

  SofiaFormValidationUI.scrollToField(validationResult?.field);
  SofiaFormValidationUI.showFormStatus(message, 'error');
}

// PT: Exibe os estados de início do envio.
// EN: Displays the submit-start UI states.
async function showSubmittingState(modalElement) {
  SofiaFormValidationUI.lockSubmit(true);
  setFormBusy(true);

  StellaSubmitOverlay.show(modalElement, 'Enviando seu feedback…', {
    subtext: 'Aguarde só um instante.',
  });

  await LumaLoading.ensurePaint();
  SofiaFormValidationUI.showFormStatus('Enviando seu feedback…', 'info');
}

// PT: Trata erro de resultado sem sucesso.
// EN: Handles an unsuccessful result response.
function handleFailedSubmitResult(result, modalElement) {
  const message = result?.error?.message || 'Falha no envio. Tente novamente.';

  StellaSubmitOverlay.hide(modalElement);

  HaloMessageBox.show(message, 'error', {
    duration: 0,
  });

  SofiaFormValidationUI.showFormStatus(message, 'error');
}

// PT: Trata sucesso do envio.
// EN: Handles successful submission.
function handleSuccessfulSubmit(modalElement) {
  StellaSubmitOverlay.hide(modalElement);

  HaloMessageBox.show('Feedback enviado com sucesso! ✨', 'success', {
    duration: 1400,
  });

  SofiaFormValidationUI.showFormStatus('Feedback enviado com sucesso. Obrigado! ✨', 'success');
}

// PT: Executa a limpeza visual após envio bem-sucedido.
// EN: Executes post-success visual cleanup.
function scheduleSuccessCleanup() {
  setTimeout(() => {
    SofiaFormValidationUI.resetFormUI();
    AylaRatingStarsUI.clearStarsUI();
    SofiaFormValidationUI.clearRatingError();

    AppEvents.emitAppEvent('feedback:photo:clear-request');
  }, 800);
}

// PT: Libera sempre o estado de envio.
// EN: Always releases the submit state.
function releaseSubmitState() {
  setFormBusy(false);
  SofiaFormValidationUI.lockSubmit(false);
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Handler principal do submit do formulário.
// EN: Main submit handler for the form.
async function handleSubmit(event) {
  event.preventDefault();

  const modalElement = document.getElementById('feedback-modal');
  const values = collectFormValuesWithFile();

  const validationResult = SofiaFormValidationUI.validateBasicRules(values);

  if (!validationResult.ok) {
    StellaSubmitOverlay.hide(modalElement);
    showValidationError(validationResult);
    return;
  }

  try {
    await showSubmittingState(modalElement);

    const result = await SeleneSubmitFlow.submitFeedback(values);

    if (!result?.ok) {
      handleFailedSubmitResult(result, modalElement);
      return;
    }

    handleSuccessfulSubmit(modalElement);
    scheduleSuccessCleanup();
  } catch (error) {
    StellaSubmitOverlay.hide(modalElement);

    Logger.error('FORM', 'Liora', 'Unhandled submit exception', error);

    const message = error?.message || 'Erro inesperado ao enviar.';

    HaloMessageBox.show(message, 'error', {
      duration: 0,
    });

    SofiaFormValidationUI.showFormStatus(message, 'error');
  } finally {
    releaseSubmitState();
  }
}

// PT: Anexa o controller ao formulário.
// EN: Attaches the controller to the form.
function attachFormController() {
  const formElement = SofiaFormValidationUI.elements?.form;

  if (!formElement) {
    return;
  }

  if (isAttached) {
    return;
  }

  isAttached = true;
  onFormSubmitRef = handleSubmit;

  formElement.addEventListener('submit', onFormSubmitRef);
}

// PT: Remove os listeners do controller.
// EN: Removes the controller listeners.
function detachFormController() {
  const formElement = SofiaFormValidationUI.elements?.form;

  if (!formElement) {
    return;
  }

  if (!isAttached) {
    return;
  }

  isAttached = false;

  if (onFormSubmitRef) {
    formElement.removeEventListener('submit', onFormSubmitRef);
  }

  onFormSubmitRef = null;
}

/* -----------------------------------------------------------------------------*/
// Compatibility Aliases
//
// PT: Mantém nomes antigos enquanto outros módulos são migrados.
// EN: Keeps old names while other modules are being migrated.
/* -----------------------------------------------------------------------------*/

const initFormController = attachFormController;
const destroyFormController = detachFormController;

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const LioraFormController = {
  attachFormController,
  detachFormController,
  initFormController,
  destroyFormController,
};
