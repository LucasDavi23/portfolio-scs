/**
 * Logger — System Observability Layer
 *
 * PT:
 * Camada de observação e padronização de logs do sistema.
 * Centraliza console.* e define níveis, tags e anti-spam.
 *
 * EN:
 * Observability and standardized logging layer.
 * Centralizes console.* and supports levels, tags and spam guard.
 */

/* ---------------------------------------------
 * Levels / Níveis
 * -------------------------------------------- */
const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/* ---------------------------------------------
 * Environment detection / Detecção de ambiente
 * -------------------------------------------- */
function detectEnvMode() {
  try {
    // --------------------------------------------------
    // PT: Override manual por querystring (?log=debug|prod)
    // EN: Manual override via querystring (?log=debug|prod)
    // --------------------------------------------------
    if (typeof window !== 'undefined' && window.location?.search) {
      const qs = new URLSearchParams(window.location.search);
      const force = qs.get('log');
      if (force === 'debug') return 'development';
      if (force === 'prod') return 'production';
    }

    // --------------------------------------------------
    // PT: Vite / bundler env detection
    // EN: Vite / bundler env detection
    // --------------------------------------------------
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.MODE) return String(import.meta.env.MODE);
      if (import.meta.env.DEV === true) return 'development';
      if (import.meta.env.PROD === true) return 'production';
    }
  } catch (_) {}

  // --------------------------------------------------
  // PT: Fallback por hostname (browser)
  // EN: Hostname-based fallback (browser)
  // --------------------------------------------------
  const hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : '';

  // PT/EN: Common local network IP ranges
  const isLocalIP =
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);

  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    isLocalIP ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.test');

  return isLocal ? 'development' : 'production';
}

/* ---------------------------------------------
 * Helpers
 * -------------------------------------------- */
function normalizeTag(tag) {
  const normalizedTag = (tag ?? 'APP').toString().trim();
  return normalizedTag.length ? normalizedTag : 'APP';
}

function toErrorLike(err) {
  if (!err) return null;
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return err;
}

function pickConsoleMethod(level) {
  if (level === 'debug') return console.debug ?? console.log;
  if (level === 'info') return console.info ?? console.log;
  if (level === 'warn') return console.warn;
  return console.error;
}

function levelIcon(level) {
  if (level === 'debug') return '🐞';
  if (level === 'info') return 'ℹ️';
  if (level === 'warn') return '⚠️';
  return '❌';
}

/* ---------------------------------------------
 * Internal state / Estado interno
 * -------------------------------------------- */
const state = {
  mode: detectEnvMode(),
  level: LEVELS.info,
  enabled: true,
  allowTags: null,
  blockTags: new Set(),
  onceKeys: new Set(),
};

/* ---------------------------------------------
 * Core
 * -------------------------------------------- */
function shouldLog(level, tag) {
  if (!state.enabled) return false;

  const levelNumber = LEVELS[level] ?? LEVELS.info;
  if (levelNumber < state.level) return false;

  const normalizedTag = normalizeTag(tag);
  if (state.blockTags.has(normalizedTag)) return false;
  if (state.allowTags && !state.allowTags.has(normalizedTag)) return false;

  return true;
}

function emit(level, tag, message, data) {
  const normalizedTag = normalizeTag(tag);
  if (!shouldLog(level, normalizedTag)) return;

  const prefix = `${levelIcon(level)} [${normalizedTag}]`;
  const log = pickConsoleMethod(level);

  if (typeof data === 'undefined') {
    log(`${prefix} ${String(message ?? '')}`);
  } else {
    log(`${prefix} ${String(message ?? '')}`, data);
  }
}

/* ---------------------------------------------
 * Public functions (talentos)
 * -------------------------------------------- */
function setLevel(level) {
  const key = String(level || 'info');
  state.level = LEVELS[key] ?? LEVELS.info;
}

function setEnabled(enabled) {
  state.enabled = Boolean(enabled);
}

function setMode(mode) {
  state.mode = String(mode || state.mode);
}

function getMode() {
  return state.mode;
}

function allowOnlyTags(tags) {
  if (!tags || tags.length === 0) {
    state.allowTags = null;
    return;
  }
  state.allowTags = new Set(tags.map(normalizeTag));
}

function blockTags(tags) {
  if (!tags) return;
  tags.forEach((t) => state.blockTags.add(normalizeTag(t)));
}

function unblockTags(tags) {
  if (!tags) return;
  tags.forEach((t) => state.blockTags.delete(normalizeTag(t)));
}

function resetOnce() {
  state.onceKeys.clear();
}

function debug(tag, message, data) {
  if (state.mode === 'production') return;
  emit('debug', tag, message, data);
}

function info(tag, message, data) {
  emit('info', tag, message, data);
}

function warn(tag, message, data) {
  emit('warn', tag, message, data);
}

function error(tag, message, err) {
  emit('error', tag, message, toErrorLike(err));
}

function once(level, tag, key, message, data) {
  const normalizedTag = normalizeTag(tag);
  const onceKey = `${normalizedTag}::${String(key ?? '')}`;

  if (state.onceKeys.has(onceKey)) return;
  state.onceKeys.add(onceKey);

  if (level === 'debug') return debug(tag, message, data);
  if (level === 'info') return info(tag, message, data);
  if (level === 'warn') return warn(tag, message, data);
  return error(tag, message, data);
}

function time(tag, label) {
  const normalizedTag = normalizeTag(tag);
  const timerLabel = String(label || 'time');
  const start = performance?.now?.() ?? Date.now();

  return function end(extraData) {
    const endAt = performance?.now?.() ?? Date.now();
    const ms = Math.round((endAt - start) * 100) / 100;
    debug(normalizedTag, `⏱ ${timerLabel} = ${ms}ms`, extraData);
  };
}

/* ---------------------------------------------
 * Export pattern (system standard)
 * -------------------------------------------- */
export const Logger = {
  setLevel,
  setEnabled,
  setMode,
  getMode,
  allowOnlyTags,
  blockTags,
  unblockTags,
  resetOnce,
  debug,
  info,
  warn,
  error,
  once,
  time,
};

/* ---------------------------------------------
 * Defaults
 * -------------------------------------------- */
setLevel(state.mode === 'development' ? 'debug' : 'info');
