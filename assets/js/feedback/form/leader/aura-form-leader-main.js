// ==================================================
// 🌙 Aura — Feedback FORM Leader
// Nível: Adulta
//
// File: aura-form-leader.js
//
// PT: Aura coordena o setor FORM do feedback. Ela não implementa UI,
//     não valida domínio profundo, não processa imagem e não chama rede diretamente.
//     Sua função é garantir que cada especialista do FORM execute seu papel
//     no momento certo, mantendo o formulário estável, previsível e fácil de manter.
//
// EN: Aura coordinates the Feedback FORM sector. She does not implement UI,
//     does not run deep domain validation, does not process images and does not call
//     network APIs directly. Her role is to ensure each FORM specialist runs
//     at the right time, keeping the form stable, predictable and maintainable.
// ==================================================

/* ------------------------------------------------------------------
 * Imports (organized by responsibility)
 * ------------------------------------------------------------------ */

/* --------------------------------------------------
 * 🌙 Liora — Form Controller
 * PT: Conecta listeners do form e delega para especialistas.
 * EN: Wires form listeners and delegates to specialists.
 * Provides:
 *  - initController()
 * -------------------------------------------------- */
import { LioraFormController } from '/assets/js/feedback/form/controller/liora-form-controller.js';

/* --------------------------------------------------
 * 🧾 Selene — Submit Flow
 * PT: Executa o pipeline de envio (rating -> validação -> imagem -> API).
 * EN: Runs the submit pipeline (rating -> validation -> image -> API).
 * Provides:
 *  - submitFeedback()
 * -------------------------------------------------- */
import { SeleneSubmitFlow } from '/assets/js/feedback/form/submit/selene-submit-flow.js';

/* --------------------------------------------------
 * ✨ Ayla — Rating Stars UI
 * PT: UI das estrelas (clique/toggle/limpar) e sincronização com hidden.
 * EN: Stars UI (click/toggle/clear) and sync with hidden input.
 * Provides:
 *  - attachStarsUI()
 *  - resetStars()
 * -------------------------------------------------- */
import { AylaRatingStarsUI } from '/assets/js/feedback/form/rating/ayla-rating-stars-ui.js';

/* --------------------------------------------------
 * 📷 Daphne — Photo Label UI
 * PT: Atualiza label do input file, cria thumb e dispara evento do modal.
 * EN: Updates file label, builds thumb and dispatches modal event.
 * Provides:
 *  - attachPhotoLabelUI()
 * -------------------------------------------------- */
import { DaphnePhotoUI } from '/assets/js/feedback/form/image/daphne-photo-ui.js';

/* --------------------------------------------------
 * ✨ Irene — Photo Preview UX
 * PT: Padroniza preview como card e abre modal ao clicar/teclar.
 * EN: Styles preview as a card and opens modal on click/keyboard.
 * Provides:
 *  - attachPhotoPreviewUX()
 * -------------------------------------------------- */
import { IrenePhotoPreviewUX } from '/assets/js/feedback/form/ux/irene-photo-preview-ux.js';

/* --------------------------------------------------
 * 🧮 Mina — Comment Counter UX
 * PT: Atualiza contador de caracteres do comentário.
 * EN: Updates the comment character counter.
 * Provides:
 *  - attachCommentCounterUX()
 * -------------------------------------------------- */
import { MinaCommentCounterUX } from '/assets/js/feedback/form/ux/mina-comment-counter-ux.js';

/* ------------------------------------------------------------------
 * Small runtime helper
 * ------------------------------------------------------------------ */

/**
 * PT: Helper simples para rodar algo quando o DOM estiver pronto.
 * EN: Small helper to run a callback when DOM is ready.
 */
function onDomReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }
}

/* ------------------------------------------------------------------
 * Init steps (Aura only wires; specialists do the work)
 * ------------------------------------------------------------------ */

/**
 * PT: Irene — UX do preview (card + abrir modal).
 * EN: Irene — photo preview UX (card + open modal).
 */
function initIrenePhotoPreviewUX() {
  console.log('[Aura] initIrenePhotoPreviewUX: calling attach...');

  try {
    IrenePhotoPreviewUX.attachPhotoPreviewUX();
    console.log('[Aura] initIrenePhotoPreviewUX: attach called');
  } catch (err) {
    console.warn('[Aura] Error initializing IrenePhotoPreviewUX:', err);
  }
}

/**
 * PT: Mina — UX do contador de caracteres do comentário.
 * EN: Mina — comment character counter UX.
 */
function initMinaCommentCounterUX() {
  try {
    MinaCommentCounterUX.attachCommentCounterUX();
  } catch (err) {
    console.warn('[Aura] Error initializing MinaCommentCounterUX:', err);
  }
}

/**
 * PT: Daphne — UI do label + thumb/preview base da foto.
 * EN: Daphne — file label + thumb/base preview UI.
 */
function initDaphnePhotoUI() {
  try {
    DaphnePhotoUI.attachPhotoUI();
  } catch (err) {
    console.warn('[Aura] Error initializing DaphnePhotoUI:', err);
  }
}

/**
 * PT: Ayla — UI das estrelas (rating).
 * EN: Ayla — rating stars UI.
 */
function initAylaRatingStarsUI() {
  try {
    AylaRatingStarsUI.attachStarsUI();
  } catch (err) {
    console.warn('[Aura] Error initializing AylaRatingStarsUI:', err);
  }
}

/**
 * PT: Liora — Controller do FORM (apenas eventos).
 *     Liora não "controla" especialistas. Ela apenas liga o submit
 *     e delega para Selene (submit flow).
 * EN: Liora — FORM controller (events only).
 *     Liora does not "control" specialists. She only wires submit
 *     and delegates to Selene (submit flow).
 */
function initLioraController() {
  try {
    LioraFormController.attachFormController(); // sem options
  } catch (err) {
    console.warn('[Aura] Error initializing LioraFormController:', err);
  }
}

/**
 * PT: Função principal da Aura: é aqui que todo o FORM é amarrado
 *     quando o DOM estiver pronto.
 * EN: Aura main function: this is where the entire FORM is wired
 *     once the DOM is ready.
 */
function bootstrapForm() {
  // 1) Irene — UX do preview (card + modal)
  initIrenePhotoPreviewUX();

  // 2) Mina — UX do contador de comentário
  initMinaCommentCounterUX();

  // 3) Daphne — UI do label + thumb/preview base da foto
  initDaphnePhotoUI();

  // 4) Ayla — UI das estrelas (rating)
  initAylaRatingStarsUI();

  // 5) Liora — controller (apenas eventos + submit)
  initLioraController();
}

/* ------------------------------------------------------------------
 * Public Leader API
 * ------------------------------------------------------------------ */

export const AuraFormLeader = {
  /**
   * PT: Inicializa o setor FORM do feedback. Deve ser chamada pela Morgana.
   * EN: Initializes the feedback FORM sector. Should be called by Morgana.
   */
  initForm(root = document) {
    onDomReady(() => bootstrapForm(root));
  },

  // Optional: expose raw bootstrap for debugging
  bootstrapForm,
};
