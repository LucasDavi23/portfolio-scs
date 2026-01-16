// ==================================================
// 🌙 Liora — Form Flow Conductor
//
// Nível: Jovem
//
// File: liora-form-controller.js
//
// PT: Coordena o fluxo do formulário de feedback.
//     Liora conecta eventos do formulário (submit),
//     delegando responsabilidades para especialistas.
//     Ela não implementa regras de domínio nem chamadas de rede;
//     apenas garante a ordem e a coerência do processo.
//
// EN: Coordinates the feedback form flow.
//     Liora wires form events (submit),
//     delegating responsibilities to specialists.
//     She does not implement domain rules or network calls;
//     she only ensures the correct order and coherence of the process.
// ==================================================

// --------------------------------------------------
// 🧠 Sofia — Form Validation & UX State Specialist
// --------------------------------------------------
import { SofiaFormValidationUI } from '/assets/js/feedback/form/validation/sofia-form-validation-ui.js';

// --------------------------------------------------
// 🧾 Selene — Feedback Submit Specialist (Flow)
// PT: Executa o fluxo de envio do feedback (pipeline).
// EN: Runs the feedback submission pipeline.
// Provides:
//  - submitFeedback(values)
// --------------------------------------------------
import { SeleneSubmitFlow } from '/assets/js/feedback/form/submit/selene-submit-flow.js';

// --------------------------------------------------
// Internal state (avoid double-binding)
// --------------------------------------------------
let isAttached = false;
let onFormSubmitRef = null;

// --------------------------------------------------
// Internal handlers
// --------------------------------------------------

/**
 * PT: Handler do submit do form.
 * EN: Form submit handler.
 */
async function handleSubmit(event) {
  event.preventDefault();

  // PT: UI/UX (Sofia) cuida de lock/status/erros.
  // EN: UI/UX (Sofia) handles lock/status/errors.
  try {
    SofiaFormValidationUI.lockSubmit(true);
    SofiaFormValidationUI.showFormStatus('Sending your feedback…', 'info');

    // PT: Coleta dados básicos (Sofia é dona disso).
    // EN: Collect basic values (Sofia owns this).
    const values = SofiaFormValidationUI.collectFormValues();

    // PT: Validação básica de UX antes do flow.
    // EN: Basic UX validation before flow.
    const basic = SofiaFormValidationUI.validateBasicRules(values);

    if (!basic.ok) {
      // PT: Se o erro for relacionado ao nome, marca o campo (opcional).
      // EN: If error is name-related, mark the field (optional).
      if (
        SofiaFormValidationUI.elements?.nameInput &&
        typeof basic.message === 'string' &&
        basic.message.toLowerCase().includes('name')
      ) {
        SofiaFormValidationUI.markFieldError(
          SofiaFormValidationUI.elements.nameInput,
          basic.message
        );
      }

      SofiaFormValidationUI.showFormStatus(basic.message, 'error');
      return;
    }

    // PT: Delegação do envio para Selene (pipeline completo).
    // EN: Delegate submission to Selene (full pipeline).
    const result = await SeleneSubmitFlow.submitFeedback(values);

    if (!result?.ok) {
      SofiaFormValidationUI.showFormStatus(result?.error || 'Failed to send feedback.', 'error');
      return;
    }

    // PT: Sucesso.
    // EN: Success.
    SofiaFormValidationUI.showFormStatus('Feedback sent successfully. Thank you!', 'success');

    // PT: Reset do formulário (limpa inputs e file).
    // EN: Reset the form (clears inputs and file).
    SofiaFormValidationUI.elements?.form?.reset();

    // PT: Se você usa hint de erro no nome, limpa após sucesso.
    // EN: If you use name error hints, clear after success.
    if (SofiaFormValidationUI.elements?.nameInput) {
      SofiaFormValidationUI.clearFieldError(SofiaFormValidationUI.elements.nameInput);
    }
  } catch (error) {
    console.error(error);
    SofiaFormValidationUI.showFormStatus(error?.message || 'Failed to send feedback.', 'error');
  } finally {
    SofiaFormValidationUI.lockSubmit(false);
  }
}

// --------------------------------------------------
// Public API (Liora)
// --------------------------------------------------

/**
 * PT: Anexa o controller do formulário.
 * EN: Attaches the form controller.
 */
function attachFormController() {
  // PT: Se o form não existir, Liora não atua.
  // EN: If the form does not exist, Liora stays idle.
  const formEl = SofiaFormValidationUI.elements?.form;
  if (!formEl) return;

  // PT: Evita bind duplicado.
  // EN: Prevent double-binding.
  if (isAttached) return;
  isAttached = true;

  onFormSubmitRef = handleSubmit;

  // PT: Liora cuida apenas do submit (UI ativa de foto/estrelas já é iniciada pela Aura).
  // EN: Liora only wires submit (photo/stars active UI is initialized by Aura).
  formEl.addEventListener('submit', onFormSubmitRef);
}

/**
 * PT: Remove listeners (SPA / modal).
 * EN: Removes listeners (SPA / modal usage).
 */
function detachFormController() {
  const formEl = SofiaFormValidationUI.elements?.form;
  if (!formEl) return;

  if (!isAttached) return;

  isAttached = false;

  if (onFormSubmitRef) {
    formEl.removeEventListener('submit', onFormSubmitRef);
  }

  onFormSubmitRef = null;
}

// --------------------------------------------------
// Compatibility aliases (optional)
// PT: Mantém nomes antigos enquanto você migra a Aura.
// EN: Keeps old names while you migrate Aura.
// --------------------------------------------------
const initFormController = attachFormController;
const destroyFormController = detachFormController;

// --------------------------------------------------
// Export pattern (project standard)
// Ordem de uso: attach → detach
// --------------------------------------------------
export const LioraFormController = {
  // Preferred (semantic)
  attachFormController,
  detachFormController,

  // Backward-compatible
  initFormController,
  destroyFormController,
};
