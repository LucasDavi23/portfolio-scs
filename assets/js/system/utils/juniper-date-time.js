// /assets/js/system/utils/juniper-date-time.js
// 🌿 Juniper — Date/Time Utilities
// PT: Funções puras para interpretar e formatar data/hora com fallback seguro.
// EN: Pure utilities to parse and format date/time with safe fallbacks.

/* -------------------------------------------------- */
/** PT: Retorna Date válido ou null. EN: Returns a valid Date or null. */
function parseDateTime(input) {
  if (!input) return null;

  // Direct Date
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  // string/number -> Date
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** PT: Detecta se existe hora “real”. EN: Detects if there is meaningful time. */
function hasMeaningfulTime(date) {
  if (!date) return false;
  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
}

/** PT: Formata só a data. EN: Formats date only. */
function formatDate(date, locale = 'pt-BR') {
  if (!date) return '';
  return date.toLocaleDateString(locale);
}

/** PT: Formata só a hora (HH:MM). EN: Formats time only (HH:MM). */
function formatTime(date, locale = 'pt-BR') {
  if (!date) return '';
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/**
 * PT: Formata com fallback:
 * - se tiver data+hora → "DD/MM/AAAA · HH:MM"
 * - se tiver só data     → "DD/MM/AAAA"
 * - se inválido          → ""
 *
 * EN: Formats with fallback.
 */

function formatDateTime(input, { locale = 'pt-BR', separator = ' . ' } = {}) {
  const date = parseDateTime(input);
  if (!date) return '';

  const d = formatDate(date, locale);
  if (!hasMeaningfulTime(date)) return d;

  const t = formatTime(date, locale);
  return `${d}${separator}${t}`;
}

/* -------------------------------------------------- */
/** Export “facade” no padrão persona */
export const JuniperDateTime = {
  parseDateTime,
  hasMeaningfulTime,
  formatDate,
  formatTime,
  formatDateTime,

  // alias amigável (pra usar mais rápido no UI)
  format(input, option) {
    return formatDateTime(input, option);
  },

  isValid(input) {
    return !!parseDateTime(input);
  },
};
/* -------------------------------------------------- */
// Fim de /assets/js/system/utils/juniper-date-time.js
