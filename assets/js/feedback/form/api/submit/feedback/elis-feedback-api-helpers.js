// 🌿 Elis — Feedback Create Action (Gateway)
//
// Nível: Jovem
//
// File: elis-feedback-api-helpers.js
//
// PT: Camada de atendimento da criação de feedback do FORM.
//     Recebe o payload pronto, encaminha ao Apps Script via Vesper
//     (action "submitFeedbackAction") e devolve a resposta técnica normalizada.
//     Não executa validações nem decisões de negócio.
//
// EN: Feedback creation gateway layer for the FORM.
//     Receives a ready payload, forwards it to Apps Script via Vesper
//     ("submitFeedbackAction" action) and returns a technically normalized response.
//     Performs no business decisions.
// ==================================================
// Vesper — Core de Rede (helpers)
// Provides:
// - getFeedbackEndpoint
// - postJsonAction
// ==================================================

import { VesperFormApiCoreHelpers } from '/assets/js/feedback/form/api/rede/vesper-form-api-core-helpers.js';

/**
 * PT: Envia o payload de feedback para o Apps Script.
 * EN: Sends feedback payload to Apps Script.
 *
 * @param {Object} payload - PT: dados prontos do form | EN: ready form data
 * @returns {Promise<{success:boolean,message:string,data:any,item:any,raw:any}>}
 */
export async function submitFeedbackAction(payload = {}) {
  return VesperFormApiCoreHelpers.postJsonAction('submitFeedbackAction', payload);
}

export const ElisFeedbackApiHelpers = {
  submitFeedbackAction,
};
