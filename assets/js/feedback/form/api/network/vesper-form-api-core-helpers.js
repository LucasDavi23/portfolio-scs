/* -----------------------------------------------------------------------------*/
// 🧬 Vesper — Form API Core Helpers
//
// Nível / Level: Adulto / Adult
//
// PT: Especialista na camada de rede do FORM. Resolve o endpoint,
//     executa requisições GET/POST, faz parse seguro da resposta
//     e normaliza o retorno do GAS sem conhecer regras de domínio.
//
// EN: Specialist in the FORM network layer. Resolves the endpoint,
//     performs GET/POST requests, safely parses responses,
//     and normalizes GAS output without knowing domain rules.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// EndpointConfig — Feedback Endpoint Configuration
// Fornece / Provides:
// - set(url)
// - get()
// - isOffline()
/* -----------------------------------------------------------------------------*/
import { EndpointConfig } from '/assets/js/feedback/core/config/feedback-data-endpoint.js';

/* -----------------------------------------------------------------------------*/
// Endpoint Resolver
//
// PT: Retorna o endpoint principal do feedback já registrado pela
//     infraestrutura do sistema.
//
// EN: Returns the main feedback endpoint already registered by the
//     system infrastructure.
/* -----------------------------------------------------------------------------*/
function getFeedbackEndpoint() {
  const endpoint = EndpointConfig.get();

  if (EndpointConfig.isOffline()) {
    throw new Error('Feedback endpoint is not configured (offline mode).');
  }

  return endpoint;
}

/* -----------------------------------------------------------------------------*/
// GAS Response Normalizer
//
// PT: Normaliza a resposta bruta do GAS em um formato estável
//     para consumo pelas demais personas do FORM.
//
// EN: Normalizes the raw GAS response into a stable shape
//     for consumption by other FORM personas.
/* -----------------------------------------------------------------------------*/
function normalizeGasResponse(rawResponse) {
  return {
    success: !!(rawResponse?.success ?? rawResponse?.ok ?? rawResponse?.status === 'ok'),
    message: rawResponse?.message || rawResponse?.error || '',
    data: rawResponse?.data || rawResponse,
    item: rawResponse?.item || null,
    raw: rawResponse,
  };
}

/* -----------------------------------------------------------------------------*/
// JSON POST Action
//
// PT: Envia uma ação POST ao Apps Script usando "text/plain"
//     para evitar preflight em cenários comuns.
//
// EN: Sends a POST action to Apps Script using "text/plain"
//     to avoid preflight in common scenarios.
/* -----------------------------------------------------------------------------*/
async function postJsonAction(action, body) {
  const baseUrl = getFeedbackEndpoint();
  const requestUrl = `${baseUrl}?action=${encodeURIComponent(action)}`;

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
    body: JSON.stringify(body),
    mode: 'cors',
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseText || '(empty body)'}`);
  }

  let rawResponse;

  try {
    rawResponse = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid GAS JSON: ${responseText.slice(0, 300)}`);
  }

  return normalizeGasResponse(rawResponse);
}

/* -----------------------------------------------------------------------------*/
// JSON GET Request
//
// PT: Executa uma requisição GET simples ao GAS sem headers customizados.
//
// EN: Performs a simple GET request to GAS without custom headers.
/* -----------------------------------------------------------------------------*/
async function getJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/
export const VesperFormApiCoreHelpers = {
  getFeedbackEndpoint,
  normalizeGasResponse,
  postJsonAction,
  getJson,
};
