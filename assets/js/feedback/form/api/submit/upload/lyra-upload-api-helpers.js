// ==================================================
// 🪷 Lyra — Upload Photo API (helpers) —
//
// Nível: Adulta
//
// File: lyra-upload-api-helpers.js
//
// PT: Especialista no envio de imagens do FORM. Responsável pelo contrato
//     de upload (base64, mime, filename, original_name), chama o core de rede
//     (Vesper) via action "uploadPhoto" e retorna a resposta normalizada.
// EN: Specialist in FORM image uploading. Owns the upload contract
//     (base64, mime, filename, original_name), calls the network core
//     (Vesper) via "uploadPhoto" action and returns a normalized response.
// ==================================================

// Vesper — Core de Rede (helpers) — Nível: Adulta
// Fornece:
// - getFeedbackEndpoint
// - postJsonAction
import { VesperFormApiCoreHelpers } from '/assets/js/feedback/form/api/rede/vesper-form-api-core-helpers.js';

/**
 * PT: Envia uma imagem em base64 para o Apps Script.
 * EN: Uploads a base64 image to Apps Script.
 *
 * @param {Object} params
 * @param {string} params.base64 - PT: conteúdo base64 da imagem | EN: image base64 content
 * @param {string} params.mime - PT: mime type da imagem | EN: image mime type
 * @param {string} params.filename - PT: nome do arquivo salvo | EN: stored filename
 * @param {string} params.originalName - PT: nome original do arquivo | EN: original file name
 *
 * @returns {Promise<{success:boolean,message:string,data:any,item:any,raw:any}>}
 */
export async function uploadPhotoBase64({ base64, mime, filename, originalName }) {
  return VesperFormApiCoreHelpers.postJsonAction('uploadPhoto', {
    base64,
    mime,
    filename,
    original_name: originalName,
  });
}

export const LyraUploadApiHelpers = {
  uploadPhotoBase64,
};
