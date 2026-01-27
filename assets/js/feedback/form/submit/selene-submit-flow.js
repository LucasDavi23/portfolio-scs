// ==================================================
// 🧾 Selene — Feedback Submit Specialist
//
// Nível: Adulta
//
// File: selene-submit-flow.js
//
// PT: Executa o fluxo de envio do feedback.
//     Selene monta o payload final, resolve rating (via Zaya),
//     faz upload opcional de imagem (via Lyra/Daphne) e cria o feedback
//     (via Elis). Ela não manipula UI e não decide eventos — apenas
//     retorna um resultado padronizado.
//
// EN: Runs the feedback submission flow.
//     Selene builds the final payload, resolves rating (via Zaya),
//     optionally uploads an image (via Lyra/Daphne) and creates the feedback
//     (via Elis). She does not manipulate UI and does not decide events —
//     she only returns a standardized result.
// --------------------------------------------------------------------------

// ⭐ Zaya PT: Helpers para rating EN: Rating Helpers .
// Provides:
// getRatingFromDOM()
import { ZayaRatingHelpers } from '/assets/js/feedback/form/rating/zaya-rating-helpers.js';

// --------------------------------------------------------------------------------------------

// 🌼 Clara PT: Helpers para validação de nome EN: Name validation helpers.
// Provides:
// initNameProfanityFilter()
// isNameAllowed()
// normalizeText()
import { ClaraNameHelpers } from '/assets/js/feedback/form/fields/name/clara-name-helpers.js';

// --------------------------------------------------------------------------------------------

// 🧠 Athena PT: Processamento de imagem EN: Image processing helpers.
// Provides:
// validateFile()
// generateUniqueFileName()
// convertToWebp()

import { AthenaImageProcessing } from '/assets/js/feedback/form/image/athena-image-processing.js';

// --------------------------------------------------------------------------------------------

// 📤 Lyra PT: Helpers para upload EN: Upload API helpers
// Provides:
// uploadPhotoBase64() | sendPhotoBase64() | enviarFotoBase64()
import { LyraUploadApiHelpers } from '/assets/js/feedback/form/api/submit/upload/lyra-upload-api-helpers.js';

// --------------------------------------------------------------------------------------------

// 📝 Elis PT: Helpers para API de feedback EN: Feedback API helpers
// Provides:
// submitFeedbackAction() | criarFeedback()

import { ElisFeedbackApiHelpers } from '/assets/js/feedback/form/api/submit/feedback/elis-feedback-api-helpers.js';

// --------------------------------------------------------------------------------------------
// 🧠 Alma — Submit Queue
// Provides:
// - enqueue,
// - peek,
// - dequeue,
// - removeById,
// - clearQueue,
// - getQueueSize,
import { AlmaOutboxQueue } from '/assets/js/feedback/form/submit/outbox/alma-outbox-queue.js';

// --------------------------------------------------------------------------------------------

// 🧱 Noah PT: Outbox Processor EN: Outbox Processor
// setSender,
// configure,
// start,
// stop,
// nudge,
// getState,

import { NoahOutboxProcessor } from '/assets/js/feedback/form/submit/outbox/noah-outbox-processor.js';

// --------------------------------------------------------------------------------------------

// 📟 Logger PT: Camada de logging EN: Logging layer
// Provides:
// Logger.debug(), Logger.info(), Logger.warn(), Logger.error()
import { Logger } from '/assets/js/system/core/logger.js';

// --------------------------------------------------------------------------------------------

/**
 * PT: Normaliza string (trim seguro).
 * EN: Safe string normalize (trim).
 */
function normalizeText(value) {
  return String(value ?? '').trim();
}

/**
 * PT: Cria um ISO timestamp do client.
 * EN: Creates a client ISO timestamp.
 */
function createClientTimestamp(now = new Date()) {
  return now.toISOString();
}

/**
 * PT: Calcula URL pública preferida.
 * EN: Computes preferred public URL.
 */
function pickPreferredPhotoUrl({ photoPublicUrl = '', photoUrl = '' } = {}) {
  return photoPublicUrl || photoUrl || '';
}

/**
 * PT: Validação mínima do rating (1..5).
 * EN: Minimal rating validation (1..5).
 */
function ensureValidRating(rating) {
  if (!ZayaRatingHelpers.isValidRating(rating)) {
    const err = new Error('Selecione de 1 a 5 estrelas.');
    err.code = 'INVALID_RATING';
    throw err;
  }
}

/**
 * PT: Upload opcional de foto (pipeline), com compatibilidade.
 * EN: Optional photo upload (pipeline), with compatibility.
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
  // PT: sem arquivo, retorna meta vazio (comportamento esperado)
  // EN: no file, return empty meta (expected behavior)
  if (!file) {
    return {
      photo_id: '',
      photo_url: '',
      photo_public_url: '',
      photo_name: '',
      photo_name_original: '',
    };
  }

  // PT: asserts de contrato (sem optional chaining)
  // EN: contract asserts (no optional chaining)
  if (!photoHelpers) {
    const err = new Error('Photo helpers not connected (AthenaImageProcessing).');
    err.code = 'PHOTO_HELPERS_MISSING';
    throw err;
  }

  if (typeof photoHelpers.validateFile !== 'function') {
    const err = new Error('Athena.convertToWebp is missing.');
    err.code = 'ATHENA_CONVERT_MISSING';
    throw err;
  }

  if (typeof photoHelpers.convertToWebp !== 'function') {
    const err = new Error('Athena.convertToWebp is missing.');
    err.code = 'ATHENA_CONVERT_MISSING';
    throw err;
  }

  if (typeof photoHelpers.generateUniqueFileName !== 'function') {
    const err = new Error('Athena.generateUniqueFileName is missing.');
    err.code = 'ATHENA_NAME_MISSING';
    throw err;
  }

  if (!uploadApi) {
    const err = new Error('Upload API not connected (LyraUploadApiHelpers).');
    err.code = 'UPLOAD_API_MISSING';
    throw err;
  }

  const uploadFn =
    uploadApi.uploadPhotoBase64 || uploadApi.sendPhotoBase64 || uploadApi.enviarFotoBase64;

  if (typeof uploadFn !== 'function') {
    const err = new Error('Upload function not found on uploadApi (Lyra).');
    err.code = 'UPLOAD_FN_MISSING';
    throw err;
  }

  // ------------------------------
  // Validate original file
  // ------------------------------
  const validation = photoHelpers.validateFile(file);
  if (validation.ok === false) {
    const err = new Error(validation.message || 'Invalid image file.');
    err.code = 'INVALID_PHOTO';
    throw err;
  }

  const photo_name_original = file.name || '';

  // PT: filename único (baseado em Athena)
  // EN: unique filename (via Athena)
  const photo_name = photoHelpers.generateUniqueFileName(file);

  // Convert to webp (base64 + mime)
  const converted = await photoHelpers.convertToWebp(file, {
    maxSide,
    quality,
    maxSizeMB,
  });

  if (!converted || typeof converted.base64 !== 'string' || !converted.base64) {
    const err = new Error('Image conversion failed (missing base64).');
    err.code = 'PHOTO_CONVERT_FAILED';
    throw err;
  }

  if (!converted.mime) {
    const err = new Error('Image conversion failed (missing mime).');
    err.code = 'PHOTO_CONVERT_FAILED';
    throw err;
  }

  // Upload (Lyra contract)

  const up = await uploadFn({
    base64: converted.base64,
    mime: converted.mime,
    filename: photo_name,
    original_name: photo_name_original,
  });

  // Compatibility: up.ok or up.success
  const ok = up?.success ?? up?.ok ?? false;
  if (!ok) {
    const err = new Error(up?.message || 'Falha ao enviar a imagem.');
    err.code = 'UPLOAD_FAILED';
    throw err;
  }

  const data = up?.data || up;

  const photo_id = data?.photo_id || '';
  const photo_url = data?.photo_url || '';

  // If backend provides public url, use it; else derive from id (Drive UC)
  const photo_public_url =
    data?.photo_public_url ||
    (photo_id ? `https://drive.google.com/uc?export=view&id=${photo_id}` : '');

  return {
    photo_id,
    photo_url,
    photo_public_url,
    photo_name,
    photo_name_original,
  };
}

// --------------------------------------------------
// Outbox bootstrap (Selene -> Noah)
// --------------------------------------------------
let outboxInitialized = false;

/**
 * PT: Inicializa Noah para processar a outbox (1x).
 * EN: Initializes Noah to process the outbox (1x).
 */
function initOutboxProcessing() {
  if (outboxInitialized) return;
  // PT: Noah precisa de um sender. Aqui usamos Elis como "sender" do payload final.
  // EN: Noah needs a sender. Here we use Elis as the sender for the final payload.
  NoahOutboxProcessor.setSender(async (payload) => {
    const ret = await ElisFeedbackApiHelpers.submitFeedbackAction(payload);

    const ok = ret?.ok ?? ret?.success ?? false;
    if (ok) return { ok: true, data: ret };

    return {
      ok: false,
      error: ret?.message || ret?.error || 'CREATE_FAILED',
      status: ret?.status,
    };
  });

  NoahOutboxProcessor.setHooks({
    onCommitted: (queueItem, result) => {
      Logger.info('feedback.outbox.committed', '[Noah] outbox item committed after retry', {
        source: 'outbox',
        clientRequestId: queueItem?.payload?.clientRequestId || queueItem?.id || '',
        attempts: queueItem?.meta?.attempts,
      });
      try {
        window.dispatchEvent(
          new CustomEvent('feedback:committed', {
            detail: {
              source: 'outbox',
              clientRequestId: queueItem?.payload?.clientRequestId || queueItem?.id || '',
              payload: queueItem?.payload || null,
              item: result?.data?.item || result?.data?.data || result?.data || null,
            },
          })
        );
      } catch (_) {}
    },
  });

  NoahOutboxProcessor.start();
  outboxInitialized = true;
}

/**
 * PT: Executa o submit completo e retorna um resultado padronizado.
 * EN: Runs full submit and returns a standardized result.
 *
 * @param {Object} args
 * @param {Object} args.formData - collected by UI (name/comment/order/contact/file, etc.)
 * @param {Object} args.deps - injected specialists/APIs
 * @param {string} args.platform - default "scs"
 * @param {string} args.origin - e.g. "portfolio_scs"
 *
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
    ratingOptions = undefined, // opcional, se Zaya precisar
  } = options;

  // --------------------------------------------------
  // 🧾 Client Request Identity (per submit attempt)
  // --------------------------------------------------
  const clientRequestId = crypto.randomUUID();

  try {
    const name = normalizeText(formData.name ?? formData.nome);
    const comment = normalizeText(formData.comment ?? formData.comentario);
    const order = normalizeText(formData.order ?? formData.pedido);
    const contact = normalizeText(formData.contact ?? formData.contato);

    const file = formData.file ?? formData.foto ?? formData.arquivo ?? null;

    if (!ClaraNameHelpers.isNameAllowed(name)) {
      const err = new Error('Por favor, use um nome apropriado (sem ofensas).');
      err.code = 'INVALID_NAME';
      throw err;
    }

    // ✅ Zaya (rating)
    const rating = ZayaRatingHelpers.getRatingFromDOM(ratingOptions);
    ensureValidRating(rating);

    // ✅ Athena + Lyra (foto opcional)
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

    // ✅ Elis (criar feedback)
    const ret = await ElisFeedbackApiHelpers.submitFeedbackAction(payload);

    const success = ret?.ok ?? ret?.success ?? false;
    if (!success) {
      // PT/EN: ensure Noah is ready
      initOutboxProcessing();

      // PT: envia para a Outbox (Alma) para retry
      // EN: enqueue into Outbox (Alma) for retry
      AlmaOutboxQueue.enqueue(payload, {
        reason: 'create_failed',
        source: 'selene',
        createdAt: createClientTimestamp(now),
      });

      // PT/EN: wake Noah up to try immediately
      NoahOutboxProcessor.nudge();

      const err = new Error(ret?.message || ret?.error || 'Erro ao salvar feedback.');
      err.code = 'CREATE_FAILED';
      throw err;
    }

    const item = ret?.item || ret?.data || null;

    try {
      window.dispatchEvent(
        new CustomEvent('feedback:committed', {
          detail: {
            source: 'submit',
            clientRequestId: payload.clientRequestId || '',
            payload,
            item,
          },
        })
      );
    } catch (_) {
      /* ignore */
    }

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
