// 🌿 Elis — Feedback Create API (helpers) — Nível: Jovem
//
// Nível: Jovem
//
// File: elis-feedback-api-helpers.js
//
// PT: Especialista na criação do feedback do FORM: recebe o payload já pronto
//     (nome, rating, comentário, foto opcional), chama o core de rede (Vesper)
//     via action "createFeedback" e devolve uma resposta normalizada.
// EN: Specialist in FORM feedback creation: receives a ready payload
//     (name, rating, comment, optional photo), calls the network core (Vesper)
//     via "createFeedback" action and returns a normalized response.

// ==================================================
// Vesper — Core de Rede (helpers) — Nível: Adulta
// Fornece:
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
export async function createFeedback(payload = {}) {
  return VesperFormApiCoreHelpers.postJsonAction('createFeedback', payload);
}

export const ElisFeedbackApiHelpers = {
  createFeedback,
};
