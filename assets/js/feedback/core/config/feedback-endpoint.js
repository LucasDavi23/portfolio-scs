// /assets/js/feedback/feedback-endpoint.js

// 🌉 Ponteira — Guardiã do Endpoint (Infra do Feedback)
// PT: Centraliza a URL base (endpoint) usada para falar com o Google Apps Script.
// EN: Centralizes the base URL (endpoint) used to talk to the Google Apps Script backend.

// Valor default quando nada foi definido
const DEFAULT_ENDPOINT = '/offline-mode';
// Mantém um valor local privado ao módulo
let endpoint = window.FEEDBACK_ENDPOINT || DEFAULT_ENDPOINT;

// Sincroniza imediatamente com o global
window.FEEDBACK_ENDPOINT = endpoint;

/**
 * Define dinamicamente o endpoint do GAS.
 *
 * @param {string} url
 */
export function set(url) {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) {
    endpoint = url;
    window.FEEDBACK_ENDPOINT = url;
  }
}

/**
 * Obtém o endpoint atual com fallback seguro.
 *
 * @returns {string}
 */
export function get() {
  return endpoint || window.FEEDBACK_ENDPOINT || DEFAULT_ENDPOINT;
}

export const EndpointConfig = {
  get,
  set,
};
