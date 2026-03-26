/* -----------------------------------------------------------------------------*/
// 🖼️ Image Endpoint Config — System Tool
//
// PT: Centraliza a URL do endpoint de imagens do feedback.
//     Atua como camada de configuração da infraestrutura,
//     sem dependência de window e sem lógica de negócio.
//
// EN: Centralizes the feedback image endpoint URL.
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
const DEFAULT_IMAGE_ENDPOINT = '/offline-image-mode';

/* -----------------------------------------------------------------------------*/
// Module State
/* -----------------------------------------------------------------------------*/

// PT: Mantém o endpoint atual de imagem em memória do módulo.
// EN: Stores the current image endpoint in module memory.
let currentImageEndpoint = DEFAULT_IMAGE_ENDPOINT;

/* -----------------------------------------------------------------------------*/
// Validation
/* -----------------------------------------------------------------------------*/

// PT: Valida se o valor é uma URL HTTP/HTTPS válida ou rota local.
// EN: Validates whether the value is a valid HTTP/HTTPS URL or local route.
function isValidImageEndpoint(url) {
  if (typeof url !== 'string') return false;

  const value = url.trim();
  if (!value) return false;

  return /^https?:\/\//.test(value) || value.startsWith('/');
}

/* -----------------------------------------------------------------------------*/
// API
/* -----------------------------------------------------------------------------*/

// PT: Define dinamicamente o endpoint de imagem.
// Aceita URL HTTP/HTTPS válida ou rota local.
//
// EN: Dynamically sets the image endpoint.
// Accepts a valid HTTP/HTTPS URL or local route.
function set(url) {
  if (!isValidImageEndpoint(url)) return false;

  currentImageEndpoint = url.trim();
  return true;
}

// PT: Retorna o endpoint atual de imagem com fallback seguro.
//
// EN: Returns the current image endpoint with safe fallback.
function get() {
  return currentImageEndpoint || DEFAULT_IMAGE_ENDPOINT;
}

// PT: Informa se o endpoint atual de imagem está em modo offline.
// EN: Indicates whether the current image endpoint is in offline mode.
function isOffline() {
  return get() === DEFAULT_IMAGE_ENDPOINT;
}

// PT: Restaura o endpoint de imagem padrão.
// EN: Resets the image endpoint to the default value.
function reset() {
  currentImageEndpoint = DEFAULT_IMAGE_ENDPOINT;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const ImageEndpointConfig = {
  get,
  set,
  reset,
  isOffline,
};
