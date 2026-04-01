/* -----------------------------------------------------------------------------*/
// 🌉 Ponteira — Endpoint Config (System Tool)
//
// PT: Ponteira centraliza a URL do endpoint do feedback.
//     Atua como camada de armazenamento da configuração,
//     sendo inicializada externamente (ex: via Kendra),
//     sem dependência de window e sem lógica de negócio.
//
// EN: Ponteira centralizes the feedback endpoint URL.
//     Acts as a configuration storage layer,
//     initialized externally (e.g., via Kendra),
//     with no window dependency and no business logic.
//
// Tipo / Type: Ferramenta (Tool)
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Constants
/* -----------------------------------------------------------------------------*/

// PT: Endpoint usado como fallback em modo offline.
// EN: Endpoint used as fallback in offline mode.
const OFFLINE_ENDPOINT = '/offline-mode';

/* -----------------------------------------------------------------------------*/
// Module State
/* -----------------------------------------------------------------------------*/

// PT: Mantém o endpoint atual em memória do módulo.
// Inicializa em modo offline até ser definido.
//
// EN: Stores the current endpoint in module memory.
// Initializes in offline mode until set externally.
let currentEndpoint = OFFLINE_ENDPOINT;

/* -----------------------------------------------------------------------------*/
// Validation
/* -----------------------------------------------------------------------------*/

function isValidEndpoint(url) {
  if (typeof url !== 'string') return false; // invalid endpoint

  const value = url.trim();
  if (!value) return false;

  return /^https?:\/\//.test(value) || value.startsWith('/');
}

/* -----------------------------------------------------------------------------*/
// API
/* -----------------------------------------------------------------------------*/
function set(url) {
  if (!isValidEndpoint(url)) return false;

  currentEndpoint = url.trim();
  return true;
}

function get() {
  return currentEndpoint || OFFLINE_ENDPOINT;
}

function isOffline() {
  return currentEndpoint === OFFLINE_ENDPOINT;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const EndpointConfig = {
  get,
  set,
  isOffline,
};
