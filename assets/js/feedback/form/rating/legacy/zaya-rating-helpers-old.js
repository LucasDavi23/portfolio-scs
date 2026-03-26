// ==================================================
// ⭐ Zaya — Guardiã da Nota
//
// Nível: Jovem
//
// File: zaya-rating-helpers.js
//
// PT: Mantém a nota (rating) consistente e válida.
//     Zaya resolve a nota final do feedback conciliando
//     diferentes fontes (ex: input hidden e radio button),
//     garantindo um valor numérico entre 1 e 5.
//     Ela não renderiza estrelas e não altera UI — apenas
//     normaliza, resolve e valida o valor.
//
// EN: Keeps the rating consistent and valid.
//     Zaya resolves the final feedback rating by reconciling
//     different sources (e.g., hidden input and radio button),
//     ensuring a numeric value between 1 and 5.
//     She does not render stars and does not change UI — she only
//     normalizes, resolves and validates the value.
// ==================================================

/**
 * PT: Converte valores variados para número inteiro seguro.
 * EN: Converts mixed inputs into a safe integer number.
 */
function toInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

/**
 * PT: Valida se o rating está no intervalo permitido (1..5).
 * EN: Validates whether rating is within allowed range (1..5).
 */
function isValidRating(rating) {
  const r = toInt(rating);
  return r >= 1 && r <= 5;
}

/**
 * PT: Resolve a nota final conciliando duas fontes:
 *     - hidden (ex: #rating)
 *     - radio (ex: input[name="rating_star"]:checked)
 *     Regra: se hidden for válido, ele vence; senão usa radio.
 *
 * EN: Resolves final rating by reconciling two sources:
 *     - hidden (e.g., #rating)
 *     - radio (e.g., input[name="rating_star"]:checked)
 *     Rule: if hidden is valid, it wins; otherwise use radio.
 */
function resolveRating({ hiddenValue = 0, radioValue = 0 } = {}) {
  const hidden = toInt(hiddenValue);
  const radio = toInt(radioValue);

  if (isValidRating(hidden)) return hidden;
  if (isValidRating(radio)) return radio;

  return 0; // PT/EN: invalid or not selected
}

/**
 * PT: Lê do DOM as duas fontes mais comuns (hidden e radio)
 *     e devolve { hiddenValue, radioValue }.
 * EN: Reads the two most common sources from the DOM (hidden and radio)
 *     and returns { hiddenValue, radioValue }.
 */
function readRatingSourcesFromDOM({
  hiddenSelector = '#rating',
  radioSelector = 'input[name="rating_star"]:checked',
  root = document,
} = {}) {
  const hiddenEl = root?.querySelector?.(hiddenSelector) || null;
  const radioEl = root?.querySelector?.(radioSelector) || null;

  return {
    hiddenValue: hiddenEl?.value ?? 0,
    radioValue: radioEl?.value ?? 0,
  };
}

/**
 * PT: Obtém a nota final diretamente do DOM (com fallback automático).
 * EN: Gets final rating directly from the DOM (with automatic fallback).
 */
function getRatingFromDOM(options = {}) {
  const sources = readRatingSourcesFromDOM(options);
  return resolveRating(sources);
}

/**
 * PT: Utilitário opcional para debug (não altera UI).
 * EN: Optional debug helper (does not change UI).
 */
function getRatingDebugSnapshot(options = {}) {
  const sources = readRatingSourcesFromDOM(options);
  const finalRating = resolveRating(sources);

  return {
    hiddenValue: toInt(sources.hiddenValue),
    radioValue: toInt(sources.radioValue),
    finalRating,
    isValid: isValidRating(finalRating),
  };
}

export const ZayaRatingHelpers = {
  toInt,
  isValidRating,
  resolveRating,
  readRatingSourcesFromDOM,
  getRatingFromDOM,
  getRatingDebugSnapshot,
};
