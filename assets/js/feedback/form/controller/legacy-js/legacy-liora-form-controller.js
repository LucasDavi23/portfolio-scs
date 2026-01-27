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
// Halo — Message-box
// provides:
// - show,
// - hide,
// - refreshPosition,
// - loading
import { HaloMessageBox } from '/assets/js/system/ui/notifications/messagebox/halo-message-box.js';

// --------------------------------------------------
// ⭐ Ayla — Form Rating UI Specialist
// provides:
// - initStarRatingUI,
// - destroyStarRatingUI
import { AylaRatingStarsUI } from '/assets/js/feedback/form/rating/ayla-rating-stars-ui.js';

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

  try {
    SofiaFormValidationUI.lockSubmit(true);

    // ✅ UX: início do envio (loading persistente)
    SofiaFormValidationUI.showFormStatus('Enviando seu feedback…', 'info');

    const values = SofiaFormValidationUI.collectFormValues();

    // ✅ Adapta coleta de foto (compatibilidade)
    const photoInput =
      SofiaFormValidationUI.elements?.photoInput || document.getElementById('photo');
    values.file = photoInput?.files?.[0] || null;

    const basic = SofiaFormValidationUI.validateBasicRules(values);

    if (!basic.ok) {
      const message = basic.message || 'Verifique os dados e tente novamente.';

      // ✅ Marca o campo certo (sem heurística)
      if (basic.field === 'rating') {
        SofiaFormValidationUI.markRatingError(message);
      } else {
        const fieldEl = SofiaFormValidationUI.getFieldElement(basic.field);
        SofiaFormValidationUI.markFieldError(fieldEl, message);
      }

      SofiaFormValidationUI.showFormStatus(message, 'error');
      return;
    }

    const result = await SeleneSubmitFlow.submitFeedback(values);

    if (!result?.ok) {
      SofiaFormValidationUI.showFormStatus(
        result?.error?.message || 'Falha no envio. Tente novamente.',
        'error'
      );
      return;
    }

    // ✅ Sucesso
    // ✅ Sucesso
    SofiaFormValidationUI.showFormStatus('Feedback enviado com sucesso. Obrigado! ✨', 'success');

    setTimeout(() => {
      // PT: Reset central do form (inputs/estados gerais)
      // EN: Central form reset (inputs/general states)
      SofiaFormValidationUI.resetFormUI();

      // PT: Reset visual do rating (estrelas + hidden + badge)
      // EN: Rating visual reset (stars + hidden + badge)
      AylaRatingStarsUI.clearStarsUI();

      // PT: Garante que o erro visual do rating também seja limpo
      // EN: Ensures rating error UI is cleared as well
      SofiaFormValidationUI.clearRatingError?.();

      // PT: Limpa foto via evento (Daphne/Irene)
      // EN: Clears photo via event (Daphne/Irene)
      window.dispatchEvent(new CustomEvent('feedback:photo:clear-request'));
    }, 800);
  } catch (error) {
    Logger.error('liora', 'Unhandled submit exception', error);
    SofiaFormValidationUI.showFormStatus(error?.message || 'Erro inesperado ao enviar.', 'error');
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
