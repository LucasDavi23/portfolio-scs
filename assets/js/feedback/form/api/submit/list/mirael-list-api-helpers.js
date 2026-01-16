// ==================================================
// 🌸 Mirael — Feedback List API (helpers) — Nível: Aprendiz
//
// Nível: Jovem
//
// File: mirael-list-api-helpers.js
//
// PT: Especialista na listagem de feedbacks do FORM. Responsável apenas
//     por montar a querystring do GAS (mode=list) e buscar os dados via GET.
//     Não envia payload, não conhece UI e não executa lógica de negócio.
// EN: Specialist in FORM feedback listing. Responsible only for building
//     the GAS querystring (mode=list) and fetching data via GET.
//     Sends no payload, knows no UI and runs no business logic.
// ==================================================
//
// Vesper — Core de Rede (helpers) — Nível: Adulta
// Fornece:
// - getFeedbackEndpoint
// - postJsonAction
//

import { VesperFormApiCoreHelpers } from '/assets/js/feedback/form/api/rede/vesper-form-api-core-helpers.js';

/**
 * PT: Lista feedbacks via Apps Script (modo list).
 * EN: Lists feedbacks via Apps Script (list mode).
 *
 * @param {Object} options
 * @param {string} options.platform - PT: plataforma (ex: scs) | EN: platform (e.g. scs)
 * @param {number} options.limit - PT: quantidade por página | EN: items per page
 * @param {number} options.page - PT: página atual | EN: current page
 *
 * @returns {Promise<any>} PT: resposta JSON do GAS | EN: GAS JSON response
 */
export async function listFeedbacks({ platform = 'scs', limit = 5, page = 1 } = {}) {
  const base = VesperFormApiCoreHelpers.getFeedbackEndpoint();
  const url = `${base}?mode=list&plat=${encodeURIComponent(platform)}&limit=${encodeURIComponent(
    limit
  )}&page=${encodeURIComponent(page)}`;

  return VesperFormApiCoreHelpers.getJson(url);
}

export const MiraelListApiHelpers = {
  listFeedbacks,
};
