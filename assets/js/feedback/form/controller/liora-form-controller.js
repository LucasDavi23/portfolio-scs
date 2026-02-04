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
// - attachStarsUI,
// - setStarsValue,
// - getStarsValue,
// - clearStarsUI,
// - detachStarsUI
import { AylaRatingStarsUI } from '/assets/js/feedback/form/rating/ayla-rating-stars-ui.js';

// --------------------------------------------------

// 🍃 Luma — Loading Base (System/UI)
// provides:
// ensurePaint,
// safeLabel,
// spinnerHTML,
// renderLoading,
// clearLoading,
// setButtonLoading,

import { LumaLoading } from '/assets/js/system/ui/loading/luma-loading.js';

// --------------------------------------------------
// ⭐ Stella — Submit Overlay UI (System/UI)
// provides:
// show,
// hide

import { StellaSubmitOverlay } from '/assets/js/system/ui/loading/stella-submit-overlay.js';

// --------------------------------------------------
// Logger — System Observability Layer
// Provides logging capabilities for debugging and monitoring.
// Provides:
//  - Logger.debug()
//  - Logger.info()
//  - Logger.warn()
//  - Logger.error()
import { Logger } from '/assets/js/system/core/logger.js';

// --------------------------------------------------
// Internal state (avoid double-binding)
// --------------------------------------------------
let isAttached = false;
let onFormSubmitRef = null;

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function setFormBusy(isBusy) {
  const formEl = SofiaFormValidationUI.elements?.form;
  if (!formEl) return;

  // PT: Ajuda leitores de tela e dá semântica de “processando”
  // EN: Helps screen readers and communicates “processing” state
  formEl.toggleAttribute('aria-busy', isBusy);

  // PT: Opcional — evita interações durante envio (além do lock do submit)
  // EN: Optional — prevents interactions during submit (besides submit lock)
  formEl.classList.toggle('pointer-events-none', !!isBusy);
  formEl.classList.toggle('opacity-95', !!isBusy);
}

// --------------------------------------------------
// Internal handlers
// --------------------------------------------------

/**
 * PT: Handler do submit do form.
 * EN: Form submit handler.
 */
async function handleSubmit(event) {
  event.preventDefault();

  const modalEl = document.getElementById('feedback-modal');

  try {
    SofiaFormValidationUI.lockSubmit(true);
    setFormBusy(true);

    // ⭐ Stella: bloqueia o form e comunica "enviando"
    // PT: overlay cobre o form e impede o usuário de fuçar
    // EN: overlay covers the form and prevents interactions
    StellaSubmitOverlay.show(modalEl, 'Enviando seu feedback…', {
      subtext: 'Aguarde só um instante.',
    });

    // 🍃 Luma: garante 1 frame para o overlay "pintar" antes do trabalho pesado
    // PT: evita sensação de clique sem resposta
    // EN: avoids "no response" feeling before heavy work
    await LumaLoading.ensurePaint();

    // ✅ UX: início do envio (loading persistente)
    SofiaFormValidationUI.showFormStatus('Enviando seu feedback…', 'info');

    const values = SofiaFormValidationUI.collectFormValues();

    // ✅ Adapta coleta de foto (compatibilidade)
    const photoInput =
      SofiaFormValidationUI.elements?.photoInput || document.getElementById('photo');
    values.file = photoInput?.files?.[0] || null;

    const basic = SofiaFormValidationUI.validateBasicRules(values);

    if (!basic.ok) {
      // PT: validação é UX do usuário -> sem Halo
      // EN: validation is user UX -> no Halo
      StellaSubmitOverlay.hide(modalEl);

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
      StellaSubmitOverlay.hide(modalEl);

      // PT: erro do sistema -> Halo error (persistente)
      // EN: system error -> Halo error (persistent)
      HaloMessageBox.show(result?.error?.message || 'Falha no envio. Tente novamente.', 'error', {
        duration: 0,
      });

      SofiaFormValidationUI.showFormStatus(
        result?.error?.message || 'Falha no envio. Tente novamente.',
        'error'
      );
      return;
    }

    // PT: pode esconder overlay agora e mostrar o toast
    // EN: can hide overlay now and show toast
    StellaSubmitOverlay.hide(modalEl);

    HaloMessageBox.show('Feedback enviado com sucesso! ✨', 'success', { duration: 1400 });
    SofiaFormValidationUI.showFormStatus('Feedback enviado com sucesso. Obrigado! ✨', 'success');

    setTimeout(() => {
      // PT: reset geral do form
      // EN: general form reset
      SofiaFormValidationUI.resetFormUI();

      // ⭐ Ayla: reset visual do rating (estrelas + hidden + badge)
      // EN: rating visual reset (stars + hidden + badge)
      AylaRatingStarsUI.clearStarsUI();

      // 🧠 Sofia: remove ring/hint do rating
      // EN: removes rating error ring/hint
      SofiaFormValidationUI.clearRatingError();

      // 📷 Daphne/Irene: limpa foto via evento global
      // EN: clears photo via global event
      window.dispatchEvent(new CustomEvent('feedback:photo:clear-request'));
    }, 800);
  } catch (error) {
    StellaSubmitOverlay.hide(modalEl);

    Logger.error('liora', 'Unhandled submit exception', error);

    HaloMessageBox.show(error?.message || 'Erro inesperado ao enviar.', 'error', { duration: 0 });
    SofiaFormValidationUI.showFormStatus(error?.message || 'Erro inesperado ao enviar.', 'error');
  } finally {
    setFormBusy(false);
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
