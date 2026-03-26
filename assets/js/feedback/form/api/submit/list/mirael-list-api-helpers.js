/* -----------------------------------------------------------------------------*/
// 🌸 Mirael — Feedback List API (helpers)
//
// Nível / Level: Jovem / Young
//
// PT: Especialista na listagem de feedbacks do FORM.
//     Responsável por montar a querystring do Apps Script (mode=list)
//     e buscar os dados via GET.
//     Não envia payload, não conhece UI e não executa lógica de negócio.
//
// EN: Specialist in FORM feedback listing.
//     Responsible for building the Apps Script querystring (mode=list)
//     and fetching data via GET.
//     Sends no payload, knows no UI and runs no business logic.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🧬 Vesper — Form API Core Helpers
// Fornece / Provides:
// - getFeedbackEndpoint()
// - getJson()
/* -----------------------------------------------------------------------------*/
import { VesperFormApiCoreHelpers } from '/assets/js/feedback/form/api/rede/vesper-form-api-core-helpers.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares usadas internamente neste módulo.
// EN: Helper functions used internally in this module.
/* -----------------------------------------------------------------------------*/

// PT: Monta a URL de listagem de forma segura.
// EN: Builds the list URL in a safe and readable way.
function buildListUrl({ platform, limit, page }) {
  const base = VesperFormApiCoreHelpers.getFeedbackEndpoint();

  const url = new URL(base);

  url.searchParams.set('mode', 'list');
  url.searchParams.set('plat', platform);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('page', String(page));

  return url.toString();
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Lista feedbacks via Apps Script (modo list).
// EN: Lists feedbacks via Apps Script (list mode).
async function listFeedbacks({ platform = 'scs', limit = 5, page = 1 } = {}) {
  const url = buildListUrl({ platform, limit, page });

  return VesperFormApiCoreHelpers.getJson(url);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const MiraelListApiHelpers = {
  listFeedbacks,
};
