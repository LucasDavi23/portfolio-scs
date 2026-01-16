// ==================================================
// 🌼 Clara — Guardiã do Nome
//
// Nível: Jovem
//
// Arquivo: clara-name-helpers.js
//
// PT: Mantém o campo de nome claro, legível e humano.
//     Aqui, Clara cuida da validação por profanidade (PT/pt-br),
//     normalizando o texto e garantindo que o filtro seja inicializado
//     com dicionário base + extras.
// EN: Keeps the name field clear, readable and human.
//     Here, Clara handles profanity validation (PT/pt-br),
//     normalizing text and ensuring the filter is initialized
//     with base dictionary + extras.
// ==================================================

import filter from 'leo-profanity';
import * as profs from 'profanities';

let isInitialized = false;

/**
 * PT: Normaliza texto para comparação (minúsculo + sem acentos).
 * EN: Normalizes text for comparison (lowercase + no diacritics).
 */
export function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * PT: Inicializa o filtro de profanidade (somente 1x).
 *     Carrega dicionário PT do leo-profanity e adiciona extras do pacote "profanities".
 * EN: Initializes the profanity filter (only once).
 *     Loads PT dictionary from leo-profanity and adds extra words from "profanities".
 */
export function initNameProfanityFilter() {
  if (isInitialized) return;

  // PT: limpa e carrega dicionário base (pt) | EN: reset and load base dictionary (pt)
  filter.clearList();
  filter.loadDictionary('pt');

  // PT: tenta várias chaves para PT/pt-br | EN: try multiple keys for PT/pt-br
  const extras = profs['pt-br'] || profs.pt_br || profs.pt || [];
  if (Array.isArray(extras) && extras.length) {
    filter.add(extras.map(normalizeText));
  }

  isInitialized = true;
}

/**
 * PT: Verifica se o nome é permitido (não contém profanidade).
 *     Observação: certifique-se de chamar initNameProfanityFilter() uma vez no boot do form.
 * EN: Checks whether a name is allowed (does not contain profanity).
 *     Note: make sure to call initNameProfanityFilter() once during form boot.
 */
export function isNameAllowed(name = '') {
  // PT: fallback seguro caso esqueçam o init | EN: safe fallback if init is forgotten
  if (!isInitialized) initNameProfanityFilter();

  return !filter.check(normalizeText(name));
}

export const ClaraNameHelpers = {
  normalizeText,
  initNameProfanityFilter,
  isNameAllowed,
};
