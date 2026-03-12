// 👨 Gael — Feedback Sender
//
// Nível: Jovem
//
// PT: Especialista no envio do feedback para o Apps Script.
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

// 🌿 Elis — Feedback Create Action (Gateway)
// Provides:
// - submitFeedbackAction

import { ElisFeedbackApiHelpers } from '/assets/js/feedback/form/api/submit/feedback/elis-feedback-api-helpers.js';

// --------------------------------------------------
// Types
// --------------------------------------------------
/**
 * @typedef {'timeout'|'network'|'server'|'invalid_response'|'unknown'} FeedbackSendErrorType
 */

/**
 * PT: Envia feedback via Elis e retorna um resultado semântico (ok / errorType).
 * EN: Sends feedback through Elis and returns a semantic result (ok / errorType).
 *
 * @param {Object} payload - PT: payload pronto do form | EN: ready form payload
 * @param {Object} [options]
 * @param {number} [options.timeoutMs] - PT/EN: timeout lógico (se suportado pelo core)
 * @returns {Promise<{ok:boolean, message:string, item:any, data:any, raw:any, errorType:FeedbackSendErrorType}>}
 */

// --------------------------------------------------
// Internal handlers
// --------------------------------------------------

/**
 * PT: Encapsula a chamada da Elis para não “vazar” detalhes.
 * EN: Encapsulates Elis call to avoid leaking details.
 */
async function sendThroughElis(payload, options) {
  // PT: Se você quiser passar timeout por options, só funciona se a Elis/Vesper aceitarem.
  // EN: If you want to pass timeout via options, it works only if Elis/Vesper support it.
  //
  // Mantemos simples: chama a action e pronto.
  // Se no futuro a Elis aceitar {timeoutMs}, você pluga aqui.
  void options;

  if (
    !ElisFeedbackApiHelpers ||
    typeof ElisFeedbackApiHelpers.submitFeedbackAction !== 'function'
  ) {
    // PT: Erro de integração (import errado / nome mudou).
    // EN: Integration error (wrong import / renamed function).
    throw new Error('ElisFeedbackApiHelpers.submitFeedbackAction não está disponível.');
  }
  return ElisFeedbackApiHelpers.submitFeedbackAction(payload);
}

// --------------------------------------------------
// Internal utils
// --------------------------------------------------

/**
 * PT: Extrai campos padrão do retorno da Elis/Vesper.
 * EN: Extracts standard fields from Elis/Vesper return.
 */

function normalizeElisResponse(res) {
  // Esperado do Vesper (pelo seu JSDoc):
  // { success:boolean, message:string, data:any, item:any, raw:any }
  const success = Boolean(res && res.success === true);
  const message = res && typeof res.message === 'string' ? res.message : '';
  const data = res && 'data' in res ? res.data : null;
  const item = res && 'item' in res ? res.item : null;
  const raw = res && 'raw' in res ? res.raw : res;

  return { success, message, data, item, raw };
}

/**
 * PT: Classifica falha quando veio resposta (success=false).
 * EN: Classifies failure when response arrived (success=false).
 *
 * @returns {FeedbackSendErrorType}
 */

function classifyFailureFromResponse(normalized) {
  // PT: Se temos resposta, geralmente é "server" ou "invalid_response".
  // EN: If we have a response, it's usually "server" or "invalid_response".
  if (!normalized) return 'invalid_response';

  // PT: Se o shape está muito estranho, assume invalid_response.
  // EN: If shape is too strange, assume invalid_response.
  if (typeof normalized.success !== 'boolean') return 'invalid_response';

  // PT: success=false com message do backend → "server" (regra simples).
  // EN: success=false with backend message → "server" (simple rule).
  return 'server';
}

function classifyFailureFromError(err) {
  // PT: AbortError é o sinal mais comum de timeout (fetch abort).
  // EN: AbortError is the most common timeout signal (fetch abort).
  if (err && typeof err === 'object') {
    const name = String(err.name || '');
    const msg = extractErrorMessage(err).toLowerCase();

    if (name === 'AbortError') return 'timeout';

    // PT: Heurísticas simples (sem exagero).
    // EN: Simple heuristics (no over-engineering).
    if (msg.includes('timeout') || msg.includes('timed out')) return 'timeout';
    if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network'))
      return 'network';

    // PT: Alguns ambientes retornam TypeError em falha de rede.
    // EN: Some environments return TypeError on network failure.
    if (err instanceof TypeError && (msg.includes('fetch') || msg.includes('network')))
      return 'network';
  }

  return 'unknown';
}

/**
 * PT: Extrai mensagem humana de erro.
 * EN: Extracts a human-readable error message.
 */
function extractErrorMessage(err) {
  if (!err) return '';
  if (typeof err === 'string') return err;

  if (typeof err === 'object') {
    if (typeof err.message === 'string') return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  return String(err);
}

// --------------------------------------------------
// Public API (Gael)
// --------------------------------------------------
export async function sendFeedback(payload = {}, options = {}) {
  // PT: Resultado padrão (evita undefined no fluxo).
  // EN: Default result (avoids undefined in the flow).
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
    // PT: Elis executa a action no backend (Vesper faz a rede).
    // EN: Elis executes the backend action (Vesper handles the network).
    const response = await sendThroughElis(payload, options);

    // PT: Normaliza resposta técnica.
    // EN: Normalizes technical response.
    const normalized = normalizeElisResponse(response);

    // PT: Se o backend disse sucesso, ok.
    // EN: If the backend said success, ok.
    if (normalized.success === true) {
      return {
        ok: true,
        message: normalized.message || 'OK',
        item: normalized.item ?? null,
        data: normalized.data ?? null,
        raw: normalized.raw ?? response ?? null,
        errorType: 'unknown',
      };
    }

    // PT: Sucesso falso: classificar como falha semântica (servidor / invalido).
    // EN: False success: classify as semantic failure (server / invalid).
    const errorType = classifyFailureFromResponse(normalized);
    return {
      ...baseResult,
      message: normalized.message || 'Falha ao enviar feedback.',
      item: normalized.item ?? null,
      data: normalized.data ?? null,
      raw: normalized.raw ?? response ?? null,
      errorType,
    };
  } catch (err) {
    // PT: Exceções/erros de rede/timeout/etc.
    // EN: Exceptions/network errors/timeout/etc.
    const errorType = classifyFailureFromError(err);
    const message = extractErrorMessage(err) || 'Erro inesperado ao enviar feedback.';

    return {
      ...baseResult,
      message,
      errorType,
    };
  }
}

// --------------------------------------------------
// Persona export
// --------------------------------------------------

export const GaelFeedbackSender = {
  sendFeedback,
};
