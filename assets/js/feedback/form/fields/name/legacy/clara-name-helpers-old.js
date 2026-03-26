/* -----------------------------------------------------------------------------*/
// 🌼 Clara — Guardiã do Nome
//
// Nível / Level: Jovem / Young
//
// PT: Mantém o campo de nome claro, legível e humano.
//     Responsável pela validação de profanidade (PT/pt-br),
//     normalização do texto e inicialização do filtro com
//     dicionário base + extras.
//
// EN: Keeps the name field clear, readable and human.
//     Responsible for profanity validation (PT/pt-br),
//     text normalization and filter initialization with
//     base dictionary + extras.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 📦 leo-profanity — Profanity Filter Core
// Fornece / Provides:
// - clearList()
// - loadDictionary()
// - add()
// - check()
/* -----------------------------------------------------------------------------*/
import filter from 'leo-profanity';

/* -----------------------------------------------------------------------------*/
// 📦 profanities — Extra Word Lists
// Fornece / Provides:
// - pt
// - pt_br
// - pt-br
/* -----------------------------------------------------------------------------*/
import * as profs from 'profanities';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Estado interno e funções auxiliares de normalização e filtro.
// EN: Internal state and helper functions for normalization and filtering.
/* -----------------------------------------------------------------------------*/

let isInitialized = false;

// PT: Normaliza texto para comparação (minúsculo + sem acentos).
// EN: Normalizes text for comparison (lowercase + no diacritics).
export function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// PT: Retorna lista de palavras extras (PT/pt-br).
// EN: Returns extra profanity words (PT/pt-br).
function getExtraProfanityList() {
  return profs['pt-br'] || profs.pt_br || profs.pt || [];
}

// PT: Inicializa o filtro de profanidade (executa apenas uma vez).
// EN: Initializes the profanity filter (runs only once).
export function initNameProfanityFilter() {
  if (isInitialized) {
    return;
  }

  filter.clearList();
  filter.loadDictionary('pt');

  const extras = getExtraProfanityList();

  if (Array.isArray(extras) && extras.length > 0) {
    filter.add(extras.map(normalizeText));
  }

  isInitialized = true;
}

// PT: Verifica se o nome é permitido (sem profanidade).
// EN: Checks if the name is allowed (no profanity).
export function isNameAllowed(name = '') {
  if (!isInitialized) {
    initNameProfanityFilter();
  }

  return !filter.check(normalizeText(name));
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const ClaraNameHelpers = {
  normalizeText,
  initNameProfanityFilter,
  isNameAllowed,
};
