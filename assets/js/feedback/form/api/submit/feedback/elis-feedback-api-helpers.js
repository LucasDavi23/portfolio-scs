/* -----------------------------------------------------------------------------*/
// 🌿 Elis — Feedback Create Action (Gateway)
//
// Nível / Level: Jovem / Junior
//
// PT: Camada de entrada para criação de feedback no FORM.
//     Recebe o payload pronto e encaminha para o Apps Script via Vesper,
//     utilizando a action "submitFeedbackAction".
//     Retorna a resposta técnica já normalizada.
//     Não executa validações nem regras de negócio.
//
// EN: Entry layer for feedback creation in the FORM.
//     Receives a ready payload and forwards it to Apps Script via Vesper,
//     using the "submitFeedbackAction" action.
//     Returns the already normalized technical response.
//     Performs no validation or business rules.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
//
// 🧬 Vesper — Form API Core Helpers
// Fornece / Provides:
// - postJsonAction(...)
/* -----------------------------------------------------------------------------*/
import { VesperFormApiCoreHelpers } from '/assets/js/feedback/form/api/network/vesper-form-api-core-helpers.js';

/* -----------------------------------------------------------------------------*/
// Submit Feedback Action
//
// PT: Envia o payload de feedback para o Apps Script utilizando a Vesper.
// EN: Sends the feedback payload to Apps Script using Vesper.
/* -----------------------------------------------------------------------------*/
async function submitFeedbackAction(payload = {}) {
  return VesperFormApiCoreHelpers.postJsonAction('submitFeedbackAction', payload);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/
export const ElisFeedbackApiHelpers = {
  submitFeedbackAction,
};
