/* -----------------------------------------------------------------------------*/
// 👨 Gael — Feedback Sender
//
// Nível / Level: Jovem / Young
//
// PT: Especialista no envio de feedback para o Apps Script.
//     Atua como camada de proteção do envio: chama a API (Elis),
//     interpreta respostas técnicas, classifica falhas
//     (timeout, rede, servidor) e devolve um resultado semântico
//     para o fluxo.
//
// EN: Specialist in feedback sending to Apps Script.
//     Acts as a protective sending layer: calls the API (Elis),
//     interprets technical responses, classifies failures
//     (timeout, network, server) and returns a semantic result
//     to the flow.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🌿 Elis — Feedback Create Action (Gateway)
// Fornece / Provides:
// - submitFeedbackAction()
/* -----------------------------------------------------------------------------*/
import { ElisFeedbackApiHelpers } from '/assets/js/feedback/form/api/submit/feedback/elis-feedback-api-helpers.js';

/* -----------------------------------------------------------------------------*/
// Types
/* -----------------------------------------------------------------------------*/

/**
 * @typedef {'timeout'|'network'|'server'|'invalid_response'|'unknown'} FeedbackSendErrorType
 */

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares usadas internamente neste módulo.
// EN: Helper functions used internally in this module.
/* -----------------------------------------------------------------------------*/

// PT: Encapsula a chamada da Elis para não expor detalhes externos.
// EN: Encapsulates the Elis call to avoid exposing external details.
async function sendThroughElis(payload, options) {
  void options;

  if (
    !ElisFeedbackApiHelpers ||
    typeof ElisFeedbackApiHelpers.submitFeedbackAction !== 'function'
  ) {
    throw new Error('ElisFeedbackApiHelpers.submitFeedbackAction is not available.');
  }

  return ElisFeedbackApiHelpers.submitFeedbackAction(payload);
}

// PT: Extrai campos padrão do retorno da Elis/Vesper.
// EN: Extracts standard fields from Elis/Vesper response.
function normalizeElisResponse(response) {
  const success = Boolean(response && response.success === true);
  const message = response && typeof response.message === 'string' ? response.message : '';
  const data = response && 'data' in response ? response.data : null;
  const item = response && 'item' in response ? response.item : null;
  const raw = response && 'raw' in response ? response.raw : response;

  return {
    success,
    message,
    data,
    item,
    raw,
  };
}

// PT: Classifica falha quando houve resposta técnica com success=false.
// EN: Classifies failure when a technical response arrived with success=false.
function classifyFailureFromResponse(normalizedResponse) {
  if (!normalizedResponse) {
    return 'invalid_response';
  }

  if (typeof normalizedResponse.success !== 'boolean') {
    return 'invalid_response';
  }

  return 'server';
}

// PT: Classifica falha a partir de exceções e erros de transporte.
// EN: Classifies failure from exceptions and transport-level errors.
function classifyFailureFromError(error) {
  if (error && typeof error === 'object') {
    const errorName = String(error.name || '');
    const errorMessage = extractErrorMessage(error).toLowerCase();

    if (errorName === 'AbortError') {
      return 'timeout';
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return 'timeout';
    }

    if (
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('networkerror') ||
      errorMessage.includes('network')
    ) {
      return 'network';
    }

    if (
      error instanceof TypeError &&
      (errorMessage.includes('fetch') || errorMessage.includes('network'))
    ) {
      return 'network';
    }
  }

  return 'unknown';
}

// PT: Extrai uma mensagem legível de erro.
// EN: Extracts a readable error message.
function extractErrorMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;

  if (typeof error === 'object') {
    if (typeof error.message === 'string') {
      return error.message;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Envia feedback via Elis e retorna um resultado semântico.
// EN: Sends feedback through Elis and returns a semantic result.
async function sendFeedback(payload = {}, options = {}) {
  const baseResult = {
    ok: false,
    message: '',
    item: null,
    data: null,
    raw: null,
    /** @type {FeedbackSendErrorType} */
    errorType: 'unknown',
  };

  try {
    const response = await sendThroughElis(payload, options);
    const normalizedResponse = normalizeElisResponse(response);

    if (normalizedResponse.success === true) {
      return {
        ok: true,
        message: normalizedResponse.message || 'OK',
        item: normalizedResponse.item ?? null,
        data: normalizedResponse.data ?? null,
        raw: normalizedResponse.raw ?? response ?? null,
        errorType: 'unknown',
      };
    }

    const errorType = classifyFailureFromResponse(normalizedResponse);

    return {
      ...baseResult,
      message: normalizedResponse.message || 'Falha ao enviar feedback.',
      item: normalizedResponse.item ?? null,
      data: normalizedResponse.data ?? null,
      raw: normalizedResponse.raw ?? response ?? null,
      errorType,
    };
  } catch (error) {
    const errorType = classifyFailureFromError(error);
    const message = extractErrorMessage(error) || 'Erro inesperado ao enviar feedback.';

    return {
      ...baseResult,
      message,
      errorType,
    };
  }
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const GaelFeedbackSender = {
  sendFeedback,
};
