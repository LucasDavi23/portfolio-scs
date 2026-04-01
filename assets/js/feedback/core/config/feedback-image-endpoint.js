/* -----------------------------------------------------------------------------*/
// 🖼️ Image Endpoint Config — System Tool
//
// PT: Centraliza a URL do endpoint de imagens do feedback.
//     Atua como fonte única de configuração da infraestrutura,
//     já inicializada com o endpoint principal de imagens do sistema,
//     sem dependência de window e sem lógica de negócio.
//
// EN: Centralizes the feedback image endpoint URL.
//     Acts as a single source of infrastructure configuration,
//     already initialized with the system's primary image endpoint,
//     with no window dependency and no business logic.
//
// Tipo / Type: Ferramenta (Tool)
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Constants
/* -----------------------------------------------------------------------------*/

// PT: Endpoint usado como fallback em modo offline.
// EN: Endpoint used as fallback in offline mode.
const OFFLINE_IMAGE_ENDPOINT = '/offline-image-mode';

/* -----------------------------------------------------------------------------*/
// Module State
/* -----------------------------------------------------------------------------*/

// PT: Mantém o endpoint atual de imagem em memória do módulo.
// Inicializa em modo offline até ser definido.
//
// EN: Stores the current image endpoint in module memory.
// Initializes in offline mode until set externally.
let currentImageEndpoint = OFFLINE_IMAGE_ENDPOINT;

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

// PT: Retorna o endpoint atual de imagem.
// Caso não exista, utiliza o fallback offline.
//
// EN: Returns the current image endpoint.
// Falls back to offline endpoint if undefined.
function get() {
  return currentImageEndpoint || OFFLINE_IMAGE_ENDPOINT;
}

// PT: Informa se o sistema está em modo offline para imagens.
// EN: Indicates whether the system is in offline mode for images.
function isOffline() {
  return currentImageEndpoint === OFFLINE_IMAGE_ENDPOINT;
}
/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const ImageEndpointConfig = {
  get,
  set,
  isOffline,
};
