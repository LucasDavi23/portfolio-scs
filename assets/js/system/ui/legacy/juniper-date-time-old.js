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

  // Numbers: timestamps (ms) or numeric strings
  if (typeof input === 'number' || (typeof input === 'string' && /^\d+$/.test(input.trim()))) {
    const n = Number(input);
    const d = new Date(n);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const s = String(input).trim();

  // ✅ BR format: "dd/MM/yyyy" or "dd/MM/yyyy HH:mm" or "dd/MM/yyyy HH:mm:ss"
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const dd = Number(m[1]);
    const MM = Number(m[2]);
    const yyyy = Number(m[3]);
    const hh = Number(m[4] || 0);
    const mm = Number(m[5] || 0);
    const ss = Number(m[6] || 0);

    const d = new Date(yyyy, MM - 1, dd, hh, mm, ss);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // ISO or other safe formats
  const d = new Date(s);
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
 * - se tiver só data   → "DD/MM/AAAA"
 * - se inválido        → ""
 *
 * EN: Formats with fallback.
 */
function formatDateTime(input, { locale = 'pt-BR', separator = ' · ' } = {}) {
  const date = parseDateTime(input);
  if (!date) return '';

  const d = formatDate(date, locale);
  if (!hasMeaningfulTime(date)) return d;

  const t = formatTime(date, locale);
  return `${d}${separator}${t}`;
}

/* -------------------------------------------------- */
/**
 * pickBestDateValue(item)
 * PT: Escolhe o melhor campo de data dentro do item (payload).
 * EN: Picks the best date field inside the item (payload).
 *
 * Ordem:
 * 1) date_ms (timestamp)
 * 2) date_br (string pronta)
 * 3) date_iso / dateIso
 * 4) date (legado)
 * 5) data / data_iso (legado PT)
 */
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

/**
 * formatFromItem(item)
 * PT: Atalho para UI: resolve a melhor data do item e formata.
 * EN: UI shortcut: resolves the best item date and formats it.
 */
function formatFromItem(item, options) {
  const v = pickBestDateValue(item);
  return formatDateTime(v, options);
}

/**
 * formatDateFromItem(item)
 * PT: Retorna apenas a data (sem hora).
 * EN: Returns only the date (no time).
 */
function formatDateFromItem(item, { locale = 'pt-BR' } = {}) {
  const v = pickBestDateValue(item);
  const d = parseDateTime(v);
  return formatDate(d, locale);
}

/* -------------------------------------------------- */
/** Export “facade” no padrão persona */
export const JuniperDateTime = {
  parseDateTime,
  hasMeaningfulTime,
  formatDate,
  formatTime,
  formatDateTime,

  // ✅ Novos (migração da lógica da Elara)
  pickBestDateValue,
  formatFromItem,
  formatDateFromItem,

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
