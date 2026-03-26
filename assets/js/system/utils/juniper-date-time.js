// 🌿 Juniper — Date Time Utils
//
// Nível / Level: Adulto / Adult
//
// PT: Interpreta e formata data/hora com fallback seguro.
// EN: Parses and formats date/time with safe fallbacks.

/* -----------------------------------------------------------------------------*/
// Parse Helpers
//
// PT: Converte valores em Date válido quando possível.
// EN: Converts values into a valid Date when possible.
/* -----------------------------------------------------------------------------*/

// PT: Retorna um Date válido ou null.
// EN: Returns a valid Date or null.
function parseDateTime(input) {
  if (!input) return null;

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'number' || (typeof input === 'string' && /^\d+$/.test(input.trim()))) {
    const numericValue = Number(input);
    const date = new Date(numericValue);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const source = String(input).trim();

  const brMatch = source.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);

  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]);
    const year = Number(brMatch[3]);
    const hours = Number(brMatch[4] || 0);
    const minutes = Number(brMatch[5] || 0);
    const seconds = Number(brMatch[6] || 0);

    const date = new Date(year, month - 1, day, hours, minutes, seconds);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(source);
  return Number.isNaN(date.getTime()) ? null : date;
}

// PT: Detecta se existe hora relevante.
// EN: Detects whether there is meaningful time.
function hasMeaningfulTime(date) {
  if (!date) return false;

  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
}

/* -----------------------------------------------------------------------------*/
// Format Helpers
//
// PT: Formata data e hora separadamente.
// EN: Formats date and time separately.
/* -----------------------------------------------------------------------------*/

// PT: Formata apenas a data.
// EN: Formats date only.
function formatDate(date, locale = 'pt-BR') {
  if (!date) return '';
  return date.toLocaleDateString(locale);
}

// PT: Formata apenas a hora.
// EN: Formats time only.
function formatTime(date, locale = 'pt-BR') {
  if (!date) return '';

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* -----------------------------------------------------------------------------*/
// Date Time Format
//
// PT: Formata data/hora com fallback seguro.
// EN: Formats date/time with safe fallback.
/* -----------------------------------------------------------------------------*/

// PT: Formata data e hora conforme o conteúdo disponível.
// EN: Formats date and time based on available content.
function formatDateTime(input, { locale = 'pt-BR', separator = ' · ' } = {}) {
  const date = parseDateTime(input);
  if (!date) return '';

  const formattedDate = formatDate(date, locale);
  if (!hasMeaningfulTime(date)) return formattedDate;

  const formattedTime = formatTime(date, locale);
  return `${formattedDate}${separator}${formattedTime}`;
}

/* -----------------------------------------------------------------------------*/
// Item Date Helpers
//
// PT: Resolve o melhor campo de data dentro de um item.
// EN: Resolves the best date field inside an item.
/* -----------------------------------------------------------------------------*/

// PT: Escolhe o melhor valor de data no payload.
// EN: Picks the best date value from the payload.
function pickBestDateValue(item) {
  if (!item || typeof item !== 'object') return null;

  if (item.date_ms != null && item.date_ms !== '') return item.date_ms;
  if (item.date_br) return String(item.date_br).trim();

  if (item.date_iso) return item.date_iso;
  if (item.dateIso) return item.dateIso;

  if (item.date != null && item.date !== '') return item.date;

  if (item.data != null && item.data !== '') return item.data;
  if (item.data_iso) return item.data_iso;

  return null;
}

// PT: Resolve e formata a melhor data do item.
// EN: Resolves and formats the best item date.
function formatFromItem(item, options) {
  const value = pickBestDateValue(item);
  return formatDateTime(value, options);
}

// PT: Retorna apenas a data do item.
// EN: Returns only the item date.
function formatDateFromItem(item, { locale = 'pt-BR' } = {}) {
  const value = pickBestDateValue(item);
  const date = parseDateTime(value);

  return formatDate(date, locale);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const JuniperDateTime = {
  parseDateTime,
  hasMeaningfulTime,
  formatDate,
  formatTime,
  formatDateTime,
  pickBestDateValue,
  formatFromItem,
  formatDateFromItem,

  format(input, options) {
    return formatDateTime(input, options);
  },

  isValid(input) {
    return !!parseDateTime(input);
  },
};
