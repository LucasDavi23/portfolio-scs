/* -----------------------------------------------------------------------------*/
// ⭐ Zaya — Guardiã da Nota
//
// Nível / Level: Jovem / Young
//
// PT: Mantém a nota (rating) consistente e válida.
//     Resolve a nota final conciliando diferentes fontes
//     (ex: input hidden e radio button), garantindo um valor
//     numérico entre 1 e 5.
//     Não renderiza estrelas e não altera UI — apenas
//     normaliza, resolve e valida o valor.
//
// EN: Keeps the rating consistent and valid.
//     Resolves the final feedback rating by reconciling different
//     sources (e.g., hidden input and radio button), ensuring
//     a numeric value between 1 and 5.
//     Does not render stars and does not change UI — only
//     normalizes, resolves and validates the value.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/
// (nenhum necessário / none needed)

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares para normalização e leitura da nota.
// EN: Helper functions for rating normalization and reading.
/* -----------------------------------------------------------------------------*/

// PT: Converte valores variados para inteiro seguro.
// EN: Converts mixed values into a safe integer.
function toInt(value) {
  const parsedNumber = Number(value);

  if (!Number.isFinite(parsedNumber)) {
    return 0;
  }

  return Math.trunc(parsedNumber);
}

// PT: Verifica se a nota está dentro do intervalo permitido.
// EN: Checks whether the rating is within the allowed range.
function isValidRating(rating) {
  const normalizedRating = toInt(rating);

  return normalizedRating >= 1 && normalizedRating <= 5;
}

// PT: Resolve a nota final conciliando as fontes hidden e radio.
//     Se o hidden for válido, ele tem prioridade.
// EN: Resolves the final rating by reconciling hidden and radio sources.
//     If the hidden value is valid, it takes priority.
function resolveRating({ hiddenValue = 0, radioValue = 0 } = {}) {
  const hiddenRating = toInt(hiddenValue);
  const radioRating = toInt(radioValue);

  if (isValidRating(hiddenRating)) {
    return hiddenRating;
  }

  if (isValidRating(radioRating)) {
    return radioRating;
  }

  return 0;
}

// PT: Lê do DOM as fontes mais comuns da nota.
// EN: Reads the most common rating sources from the DOM.
function readRatingSourcesFromDOM({
  hiddenSelector = '#rating',
  radioSelector = 'input[name="rating_star"]:checked',
  root = document,
} = {}) {
  const hiddenElement = root?.querySelector?.(hiddenSelector) || null;
  const radioElement = root?.querySelector?.(radioSelector) || null;

  return {
    hiddenValue: hiddenElement?.value ?? 0,
    radioValue: radioElement?.value ?? 0,
  };
}

// PT: Obtém a nota final diretamente do DOM.
// EN: Gets the final rating directly from the DOM.
function getRatingFromDOM(options = {}) {
  const ratingSources = readRatingSourcesFromDOM(options);

  return resolveRating(ratingSources);
}

// PT: Retorna um snapshot simples para inspeção da nota.
// EN: Returns a simple snapshot for rating inspection.
function getRatingDebugSnapshot(options = {}) {
  const ratingSources = readRatingSourcesFromDOM(options);
  const finalRating = resolveRating(ratingSources);

  return {
    hiddenValue: toInt(ratingSources.hiddenValue),
    radioValue: toInt(ratingSources.radioValue),
    finalRating,
    isValid: isValidRating(finalRating),
  };
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const ZayaRatingHelpers = {
  toInt,
  isValidRating,
  resolveRating,
  readRatingSourcesFromDOM,
  getRatingFromDOM,
  getRatingDebugSnapshot,
};
