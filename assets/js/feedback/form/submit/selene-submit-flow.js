// 🧾 Selene — Feedback Submit Flow
//
// Nível / Level: Adulta / Adult
//
// PT: Executa o fluxo completo de envio do feedback.
//     Monta o payload final, resolve o rating com Zaya,
//     processa o upload opcional de imagem com Athena e Lyra,
//     cria o feedback com Elis e integra a outbox com Alma e Noah.
//     Não manipula UI e não decide eventos.
//     Apenas retorna um resultado padronizado do submit.
//
// EN: Executes the full feedback submission flow.
//     Builds the final payload, resolves the rating with Zaya,
//     processes optional image upload with Athena and Lyra,
//     creates the feedback with Elis and integrates the outbox with Alma and Noah.
//     Does not manipulate UI and does not decide events.
//     Only returns a standardized submit result.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// ⭐ Zaya — Rating Helpers
// Fornece / Provides:
// - getRatingFromDOM()
// - isValidRating()
/* -----------------------------------------------------------------------------*/
import { ZayaRatingHelpers } from '/assets/js/feedback/form/rating/zaya-rating-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🌼 Clara — Name Helpers
// Fornece / Provides:
// - isNameAllowed()
// - normalizeText()
/* -----------------------------------------------------------------------------*/
import { ClaraNameHelpers } from '/assets/js/feedback/form/fields/name/clara-name-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🧠 Athena — Image Processing
// Fornece / Provides:
// - validateFile()
// - generateUniqueFileName()
// - convertToWebp()
/* -----------------------------------------------------------------------------*/
import { AthenaImageProcessing } from '/assets/js/feedback/form/image/athena-image-processing.js';

/* -----------------------------------------------------------------------------*/
// 📤 Lyra — Upload API Helpers
// Fornece / Provides:
// - uploadPhotoBase64()
// - sendPhotoBase64()
// - enviarFotoBase64()
/* -----------------------------------------------------------------------------*/
import { LyraUploadApiHelpers } from '/assets/js/feedback/form/api/submit/upload/lyra-upload-api-helpers.js';

/* -----------------------------------------------------------------------------*/
// 📝 Elis — Feedback API Helpers
// Fornece / Provides:
// - submitFeedbackAction()
/* -----------------------------------------------------------------------------*/
import { ElisFeedbackApiHelpers } from '/assets/js/feedback/form/api/submit/feedback/elis-feedback-api-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🧠 Alma — Submit Queue
// Fornece / Provides:
// - enqueue()

/* -----------------------------------------------------------------------------*/
import { AlmaOutboxQueue } from '/assets/js/feedback/form/submit/outbox/alma-outbox-queue.js';

/* -----------------------------------------------------------------------------*/
// 🧱 Noah — Outbox Processor
// Fornece / Provides:
// - setSender()
// - setHooks()
// - start()
// - nudge()
/* -----------------------------------------------------------------------------*/
import { NoahOutboxProcessor } from '/assets/js/feedback/form/submit/outbox/noah-outbox-processor.js';

/* -----------------------------------------------------------------------------*/
// 📡 App Events — System Tool
// Fornece / Provides:
// - emitAppEvent()
/* -----------------------------------------------------------------------------*/
import { AppEvents } from '/assets/js/system/events/appEvents.js';

/* -----------------------------------------------------------------------------*/
// 📟 UUID — Unique Identifier Generator
// Fornece / Provides:
// - generateUUID()
/* -----------------------------------------------------------------------------*/
import { generateUUID } from '/assets/js/system/utils/uuid.js';

/* -----------------------------------------------------------------------------*/
// 📘 Logger — System Observability Layer
// Fornece / Provides:
// - Logger.info()
// - Logger.warn()
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

/* -----------------------------------------------------------------------------*/
// Internal Helpers
//
// PT: Funções auxiliares usadas internamente no fluxo de submit.
// EN: Helper functions used internally in the submit flow.
/* -----------------------------------------------------------------------------*/

// PT: Normaliza string com trim seguro.
// EN: Normalizes string with safe trim.
function normalizeText(value) {
  return String(value ?? '').trim();
}

// PT: Cria timestamp ISO do cliente.
// EN: Creates client ISO timestamp.
function createClientTimestamp(now = new Date()) {
  return now.toISOString();
}

// PT: Retorna a URL pública preferida da foto.
// EN: Returns the preferred public photo URL.
function pickPreferredPhotoUrl({ photoPublicUrl = '', photoUrl = '' } = {}) {
  return photoPublicUrl || photoUrl || '';
}

// PT: Valida se o rating está no intervalo permitido.
// EN: Validates whether the rating is within the allowed range.
function ensureValidRating(rating) {
  if (!ZayaRatingHelpers.isValidRating(rating)) {
    const error = new Error('Selecione de 1 a 5 estrelas.');
    error.code = 'INVALID_RATING';
    throw error;
  }
}

/* -----------------------------------------------------------------------------*/
// Photo Upload Pipeline
//
// PT: Processa o upload opcional de imagem com validação, conversão e envio.
// EN: Processes optional image upload with validation, conversion, and upload.
/* -----------------------------------------------------------------------------*/

/**
 * PT: Executa o pipeline opcional de upload de foto, com compatibilidade
 *     entre helpers e contratos de upload.
 *
 * EN: Executes the optional photo upload pipeline, with compatibility
 *     across helpers and upload contracts.
 *
 * @returns {Object} { photo_id, photo_url, photo_public_url, photo_name, photo_name_original }
 */
async function uploadPhotoIfAny({
  file = null,
  photoHelpers = null,
  uploadApi = null,
  maxSide = 1280,
  quality = 0.8,
  maxSizeMB = 2,
} = {}) {
  // PT: Sem arquivo, retorna metadados vazios.
  // EN: Without a file, returns empty metadata.
  if (!file) {
    return {
      photo_id: '',
      photo_url: '',
      photo_public_url: '',
      photo_name: '',
      photo_name_original: '',
    };
  }

  // PT: Verifica se os helpers de imagem foram conectados corretamente.
  // EN: Verifies whether image helpers were connected correctly.
  if (!photoHelpers) {
    const error = new Error('Photo helpers not connected (AthenaImageProcessing).');
    error.code = 'PHOTO_HELPERS_MISSING';
    throw error;
  }

  if (typeof photoHelpers.validateFile !== 'function') {
    const error = new Error('Athena.validateFile is missing.');
    error.code = 'ATHENA_VALIDATE_MISSING';
    throw error;
  }

  if (typeof photoHelpers.convertToWebp !== 'function') {
    const error = new Error('Athena.convertToWebp is missing.');
    error.code = 'ATHENA_CONVERT_MISSING';
    throw error;
  }

  if (typeof photoHelpers.generateUniqueFileName !== 'function') {
    const error = new Error('Athena.generateUniqueFileName is missing.');
    error.code = 'ATHENA_NAME_MISSING';
    throw error;
  }

  // PT: Verifica se a API de upload foi conectada corretamente.
  // EN: Verifies whether the upload API was connected correctly.
  if (!uploadApi) {
    const error = new Error('Upload API not connected (LyraUploadApiHelpers).');
    error.code = 'UPLOAD_API_MISSING';
    throw error;
  }

  const uploadFunction =
    uploadApi.uploadPhotoBase64 || uploadApi.sendPhotoBase64 || uploadApi.enviarFotoBase64;

  if (typeof uploadFunction !== 'function') {
    const error = new Error('Upload function not found on uploadApi (Lyra).');
    error.code = 'UPLOAD_FN_MISSING';
    throw error;
  }

  // PT: Valida o arquivo original antes da conversão.
  // EN: Validates the original file before conversion.
  const validation = photoHelpers.validateFile(file);
  if (validation.ok === false) {
    const error = new Error(validation.message || 'Invalid image file.');
    error.code = 'INVALID_PHOTO';
    throw error;
  }

  const photoNameOriginal = file.name || '';

  // PT: Gera nome único do arquivo com Athena.
  // EN: Generates a unique file name with Athena.
  const photoName = photoHelpers.generateUniqueFileName(file);

  // PT: Converte para WebP em base64.
  // EN: Converts to WebP in base64.
  const converted = await photoHelpers.convertToWebp(file, {
    maxSide,
    quality,
    maxSizeMB,
  });

  if (!converted || typeof converted.base64 !== 'string' || !converted.base64) {
    const error = new Error('Image conversion failed (missing base64).');
    error.code = 'PHOTO_CONVERT_FAILED';
    throw error;
  }

  if (!converted.mime) {
    const error = new Error('Image conversion failed (missing mime).');
    error.code = 'PHOTO_CONVERT_FAILED';
    throw error;
  }

  // PT: Envia o arquivo convertido usando o contrato disponível da Lyra.
  // EN: Uploads the converted file using the available Lyra contract.
  const uploadResult = await uploadFunction({
    base64: converted.base64,
    mime: converted.mime,
    filename: photoName,
    original_name: photoNameOriginal,
  });

  // PT: Compatibilidade entre resposta com success ou ok.
  // EN: Compatibility between responses using success or ok.
  const isSuccessful = uploadResult?.success ?? uploadResult?.ok ?? false;
  if (!isSuccessful) {
    const error = new Error(uploadResult?.message || 'Falha ao enviar a imagem.');
    error.code = 'UPLOAD_FAILED';
    throw error;
  }

  const uploadData = uploadResult?.data || uploadResult;

  const photoId = uploadData?.photo_id || '';
  const photoUrl = uploadData?.photo_url || '';

  // PT: Usa a URL pública do backend ou deriva pela ID do Drive.
  // EN: Uses backend public URL or derives it from the Drive ID.
  const photoPublicUrl =
    uploadData?.photo_public_url ||
    (photoId ? `https://drive.google.com/uc?export=view&id=${photoId}` : '');

  return {
    photo_id: photoId,
    photo_url: photoUrl,
    photo_public_url: photoPublicUrl,
    photo_name: photoName,
    photo_name_original: photoNameOriginal,
  };
}

/* -----------------------------------------------------------------------------*/
// Outbox Bootstrap
//
// PT: Conecta Selene com Noah para processar a outbox.
// EN: Connects Selene with Noah to process the outbox.
/* -----------------------------------------------------------------------------*/

let outboxInitialized = false;

// PT: Inicializa Noah para processar a outbox uma única vez.
// EN: Initializes Noah to process the outbox only once.
function initOutboxProcessing() {
  if (outboxInitialized) return;

  // PT: Noah precisa de um sender. Aqui Elis envia o payload final.
  // EN: Noah needs a sender. Here Elis sends the final payload.
  NoahOutboxProcessor.setSender(async (payload) => {
    const response = await ElisFeedbackApiHelpers.submitFeedbackAction(payload);

    const isSuccessful = response?.ok ?? response?.success ?? false;
    if (isSuccessful) {
      return { ok: true, data: response };
    }

    return {
      ok: false,
      error: response?.message || response?.error || 'CREATE_FAILED',
      status: response?.status,
    };
  });

  NoahOutboxProcessor.setHooks({
    onCommitted: (queueItem, result) => {
      Logger.info('feedback.outbox.committed', '[Noah] outbox item committed after retry', {
        source: 'outbox',
        clientRequestId: queueItem?.payload?.clientRequestId || queueItem?.id || '',
        attempts: queueItem?.meta?.attempts,
      });

      AppEvents.emitAppEvent('feedback:committed', {
        source: 'outbox',
        clientRequestId: queueItem?.payload?.clientRequestId || queueItem?.id || '',
        payload: queueItem?.payload || null,
        item: result?.data?.item || result?.data?.data || result?.data || null,
      });
    },
  });

  NoahOutboxProcessor.start();
  outboxInitialized = true;
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

/**
 * PT: Executa o submit completo e retorna um resultado padronizado.
 * EN: Executes the full submit and returns a standardized result.
 *
 * @param {Object} formData
 * @param {Object} options
 * @returns {Object} { ok, data, error, meta }
 */
async function submitFeedback(formData = {}, options = {}) {
  Logger.info('feedback.submit.start', 'submit started', {
    hasFile: !!(formData?.file || formData?.foto || formData?.arquivo),
  });

  const {
    platform = 'scs',
    origin = 'portfolio_scs',
    now = new Date(),
    ratingOptions = undefined,
  } = options;

  // PT: Identidade única do request de submit.
  // EN: Unique identity for the submit request.
  const clientRequestId = generateUUID();

  try {
    const name = normalizeText(formData.name ?? formData.nome);
    const comment = normalizeText(formData.comment ?? formData.comentario);
    const order = normalizeText(formData.order ?? formData.pedido);
    const contact = normalizeText(formData.contact ?? formData.contato);

    const file = formData.file ?? formData.foto ?? formData.arquivo ?? null;

    if (!ClaraNameHelpers.isNameAllowed(name)) {
      const error = new Error('Por favor, use um nome apropriado (sem ofensas).');
      error.code = 'INVALID_NAME';
      throw error;
    }

    // PT: Resolve o rating com Zaya.
    // EN: Resolves the rating with Zaya.
    const rating = ZayaRatingHelpers.getRatingFromDOM(ratingOptions);
    ensureValidRating(rating);

    // PT: Processa foto opcional com Athena e Lyra.
    // EN: Processes optional photo with Athena and Lyra.
    const photoMeta = await uploadPhotoIfAny({
      file,
      photoHelpers: AthenaImageProcessing,
      uploadApi: LyraUploadApiHelpers,
    });

    const payload = {
      clientRequestId,
      plataforma: platform,
      rating,
      nome: name,
      comentario: comment,
      pedido: order,
      contato: contact,
      origem: origin,
      timestamp_cliente: createClientTimestamp(now),

      photo_id: photoMeta.photo_id,
      photo_url: photoMeta.photo_url,
      photo_public_url: photoMeta.photo_public_url,
      photo_name: photoMeta.photo_name,
      photo_name_original: photoMeta.photo_name_original,
    };

    // PT: Cria o feedback com Elis.
    // EN: Creates the feedback with Elis.
    const response = await ElisFeedbackApiHelpers.submitFeedbackAction(payload);

    const isSuccessful = response?.ok ?? response?.success ?? false;
    if (!isSuccessful) {
      // PT: Garante que Noah está pronto para processar a outbox.
      // EN: Ensures Noah is ready to process the outbox.
      initOutboxProcessing();

      // PT: Enfileira o payload na outbox para retry posterior.
      // EN: Enqueues the payload into the outbox for later retry.
      AlmaOutboxQueue.enqueue(payload, {
        reason: 'create_failed',
        source: 'selene',
        createdAt: createClientTimestamp(now),
      });

      // PT: Acorda Noah para tentar o processamento imediatamente.
      // EN: Nudges Noah to try processing immediately.
      NoahOutboxProcessor.nudge();

      const error = new Error(response?.message || response?.error || 'Erro ao salvar feedback.');
      error.code = 'CREATE_FAILED';
      throw error;
    }

    const item = response?.item || response?.data || null;

    AppEvents.emitAppEvent('feedback:committed', {
      source: 'submit',
      clientRequestId: payload.clientRequestId || '',
      payload,
      item,
    });

    return {
      ok: true,
      data: {
        payload,
        item,
        rating,
        preferredPhotoUrl: pickPreferredPhotoUrl({
          photoPublicUrl: photoMeta.photo_public_url,
          photoUrl: photoMeta.photo_url,
        }),
      },
      error: null,
      meta: { platform, origin, hasPhoto: !!file },
    };
  } catch (error) {
    Logger.warn('feedback.submit.failed', 'submit failed', {
      code: error?.code || 'SUBMIT_FAILED',
      message: error?.message,
      hasPhoto: !!(formData?.file || formData?.foto || formData?.arquivo),
      fileType: (formData?.file || formData?.foto || formData?.arquivo)?.type,
      fileSizeMB:
        formData?.file || formData?.foto || formData?.arquivo
          ? Number(
              ((formData.file || formData.foto || formData.arquivo).size / (1024 * 1024)).toFixed(2)
            )
          : null,
    });

    return {
      ok: false,
      data: null,
      error: {
        message: error?.message || 'Falha no envio.',
        code: error?.code || 'SUBMIT_FAILED',
      },
      meta: null,
    };
  }
}

export const SeleneSubmitFlow = {
  submitFeedback,
  uploadPhotoIfAny,
  initOutboxProcessing,
};
