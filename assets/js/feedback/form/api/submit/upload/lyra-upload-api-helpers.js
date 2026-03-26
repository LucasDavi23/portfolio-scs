/* -----------------------------------------------------------------------------*/
// 🪷 Lyra — Upload Photo API (helpers)
//
// Nível / Level: Adulto / Adult
//
// PT: Especialista no envio de imagens do FORM.
//     Responsável pelo contrato de upload (base64, mime, filename,
//     original_name), chama o core de rede (Vesper) via action "uploadPhoto"
//     e retorna a resposta normalizada.
//
// EN: Specialist in FORM image uploading.
//     Owns the upload contract (base64, mime, filename, original_name),
//     calls the network core (Vesper) via "uploadPhoto" action
//     and returns a normalized response.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🧬 Vesper — Form API Core Helpers
// Fornece / Provides:
// - postJsonAction()
/* -----------------------------------------------------------------------------*/
import { VesperFormApiCoreHelpers } from '/assets/js/feedback/form/api/network/vesper-form-api-core-helpers.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares usadas internamente neste módulo.
// EN: Helper functions used internally in this module.
/* -----------------------------------------------------------------------------*/

// PT: Monta o payload no formato esperado pelo backend (snake_case).
// EN: Builds payload in backend-expected format (snake_case).
function buildUploadPayload({ base64, mime, filename, originalName }) {
  return {
    base64,
    mime,
    filename,
    original_name: originalName, // 🔁 camelCase → snake_case (GAS)
  };
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Envia uma imagem em base64 para o Apps Script.
// EN: Uploads a base64 image to Apps Script.
async function uploadPhotoBase64({ base64, mime, filename, originalName }) {
  const payload = buildUploadPayload({
    base64,
    mime,
    filename,
    originalName,
  });

  return VesperFormApiCoreHelpers.postJsonAction('uploadPhoto', payload);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const LyraUploadApiHelpers = {
  uploadPhotoBase64,
};
