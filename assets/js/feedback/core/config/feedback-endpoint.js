/* -----------------------------------------------------------------------------*/
// 🌉 Ponteira — Endpoint Config (System Tool)
//
// PT: Ponteira centraliza a URL do endpoint do feedback.
//     Atua como camada de configuração da infraestrutura,
//     sem dependência de window e sem lógica de negócio.
//
// EN: Ponteira centralizes the feedback endpoint URL.
//     Acts as an infrastructure configuration layer,
//     with no window dependency and no business logic.
//
// Tipo / Type: Ferramenta (Tool)
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Constants
/* -----------------------------------------------------------------------------*/

// PT: Endpoint padrão usado como fallback seguro.
// EN: Default endpoint used as a safe fallback.
const DEFAULT_ENDPOINT = '/offline-mode';

/* -----------------------------------------------------------------------------*/
// Module State
/* -----------------------------------------------------------------------------*/

// PT: Mantém o endpoint atual em memória do módulo.
// EN: Stores the current endpoint in module memory.
let currentEndpoint = DEFAULT_ENDPOINT;

/* -----------------------------------------------------------------------------*/
// Validation
/* -----------------------------------------------------------------------------*/

// PT: Valida se a URL é HTTP/HTTPS válida ou rota local.
// EN: Validates whether the value is a valid HTTP/HTTPS URL or local route.
function isValidEndpoint(url) {
  if (typeof url !== 'string') return false;

  const value = url.trim();
  if (!value) return false;

  return /^https?:\/\//.test(value) || value.startsWith('/');
}

/* -----------------------------------------------------------------------------*/
// API
/* -----------------------------------------------------------------------------*/

// PT: Define dinamicamente o endpoint.
// Aceita URL HTTP/HTTPS válida ou rota local.
//
// EN: Dynamically sets the endpoint.
// Accepts a valid HTTP/HTTPS URL or local route.
function set(url) {
  if (!isValidEndpoint(url)) return false;

  currentEndpoint = url.trim();
  return true;
}

// PT: Retorna o endpoint atual com fallback seguro.
//
// EN: Returns the current endpoint with safe fallback.
function get() {
  return currentEndpoint || DEFAULT_ENDPOINT;
}

// PT: Informa se o endpoint atual está em modo offline.
// EN: Indicates whether the current endpoint is in offline mode.
function isOffline() {
  return get() === DEFAULT_ENDPOINT;
}

// PT: Restaura o endpoint padrão.
// EN: Resets the endpoint to the default value.
function reset() {
  currentEndpoint = DEFAULT_ENDPOINT;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const EndpointConfig = {
  get,
  set,
  reset,
  isOffline,
};
