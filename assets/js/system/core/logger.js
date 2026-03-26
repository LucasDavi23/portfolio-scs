// 🧾 Logger — System Logs
//
// Nível / Level: Adulta / Adult
//
// PT: Centraliza logs do sistema com padrão consistente.
// EN: Centralizes system logs with a consistent pattern.

/* -----------------------------------------------------------------------------*/
// Levels
//
// PT: Define níveis de log.
// EN: Defines log levels.
/* -----------------------------------------------------------------------------*/

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/* -----------------------------------------------------------------------------*/
// Environment Detection
//
// PT: Detecta o ambiente atual.
// EN: Detects current environment.
/* -----------------------------------------------------------------------------*/

function detectEnvMode() {
  try {
    if (typeof window !== 'undefined' && window.location?.search) {
      const qs = new URLSearchParams(window.location.search);
      const forcedMode = qs.get('log');

      if (forcedMode === 'debug') return 'development';
      if (forcedMode === 'prod') return 'production';
    }

    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.MODE) return String(import.meta.env.MODE);
      if (import.meta.env.DEV === true) return 'development';
      if (import.meta.env.PROD === true) return 'production';
    }
  } catch (_) {}

  const hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : '';

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

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares internas.
// EN: Internal helper functions.
/* -----------------------------------------------------------------------------*/

function normalizeSector(sector) {
  const value = String(sector ?? 'System').trim();
  return value || 'System';
}

function normalizePersona(persona) {
  if (persona == null) return null;

  const value = String(persona).trim();
  return value || null;
}

function buildPrefix(sector, persona) {
  const normalizedSector = normalizeSector(sector);
  const normalizedPersona = normalizePersona(persona);

  return normalizedPersona
    ? `[${normalizedSector}][${normalizedPersona}]`
    : `[${normalizedSector}]`;
}

function pickConsoleMethod(level) {
  if (level === 'debug') return console.log;
  if (level === 'info') return console.info ?? console.log;
  if (level === 'warn') return console.warn ?? console.log;
  return console.error ?? console.log;
}

function toErrorLike(error) {
  if (!error) return null;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

/* -----------------------------------------------------------------------------*/
// State
//
// PT: Estado interno do logger.
// EN: Internal logger state.
/* -----------------------------------------------------------------------------*/

const state = {
  mode: detectEnvMode(),
  level: LEVELS.info,
  enabled: true,
  onceKeys: new Set(),
};

/* -----------------------------------------------------------------------------*/
// Core
//
// PT: Controle de emissão de logs.
// EN: Log emission control.
/* -----------------------------------------------------------------------------*/

function shouldLog(level) {
  if (!state.enabled) return false;

  const currentLevel = LEVELS[level] ?? LEVELS.info;
  return currentLevel >= state.level;
}

function emit(level, sector, persona, message, data) {
  if (!shouldLog(level)) return;

  const prefix = buildPrefix(sector, persona);
  const log = pickConsoleMethod(level);
  const text = `${prefix} ${String(message ?? '')}`;

  if (typeof data === 'undefined') {
    log(text);
    return;
  }

  log(text, data);
}

/* -----------------------------------------------------------------------------*/
// Public API
//
// PT: Métodos públicos do logger.
// EN: Public logger methods.
/* -----------------------------------------------------------------------------*/

function setLevel(level) {
  const normalizedLevel = String(level ?? 'info')
    .trim()
    .toLowerCase();
  state.level = LEVELS[normalizedLevel] ?? LEVELS.info;
}

function setEnabled(enabled) {
  state.enabled = Boolean(enabled);
}

function setMode(mode) {
  state.mode = String(mode ?? state.mode);
}

function getMode() {
  return state.mode;
}

function resetOnce() {
  state.onceKeys.clear();
}

function debug(sector, persona, message, data) {
  emit('debug', sector, persona, message, data);
}

function info(sector, persona, message, data) {
  emit('info', sector, persona, message, data);
}

function warn(sector, persona, message, data) {
  emit('warn', sector, persona, message, data);
}

function error(sector, persona, message, err) {
  emit('error', sector, persona, message, toErrorLike(err));
}

function once(level, sector, persona, key, message, data) {
  const prefix = buildPrefix(sector, persona);
  const onceKey = `${prefix}::${String(key ?? '')}`;

  if (state.onceKeys.has(onceKey)) return;
  state.onceKeys.add(onceKey);

  if (level === 'debug') return debug(sector, persona, message, data);
  if (level === 'info') return info(sector, persona, message, data);
  if (level === 'warn') return warn(sector, persona, message, data);
  return error(sector, persona, message, data);
}

function time(sector, persona, label = 'time') {
  const start =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();

  return function end(extraData) {
    const endAt =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();

    const duration = Math.round((endAt - start) * 100) / 100;

    debug(sector, persona, `${label}: ${duration}ms`, extraData);
  };
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const Logger = {
  setLevel,
  setEnabled,
  setMode,
  getMode,
  resetOnce,
  debug,
  info,
  warn,
  error,
  once,
  time,
};

/* -----------------------------------------------------------------------------*/
// Defaults
/* -----------------------------------------------------------------------------*/

setLevel('info');

if (typeof window !== 'undefined' && window.location?.search) {
  const qs = new URLSearchParams(window.location.search);
  const forcedMode = qs.get('log');

  if (forcedMode === 'debug') {
    setLevel('debug');
  }
}
