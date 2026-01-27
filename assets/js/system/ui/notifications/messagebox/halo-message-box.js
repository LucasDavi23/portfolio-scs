// ==================================================
// 🌟 Halo — Message Box (JS)
// Nível: Jovem
//
// File: halo-message-box.js
//
// PT: Componente global de mensagens flutuantes (toast-like).
//     Halo cria/remove a message box, controla tempo, animações
//     e alinhamento com o <main>. Não contém regras de negócio.
// EN: Global floating message box (toast-like).
//     Halo creates/removes the message box, controls timing, animations
//     and aligns to <main>. Contains no business rules.
// ==================================================

// ------------------------------
// Internal state (safe single instance)
// ------------------------------

let currentEl = null;
let currentTimer = null;

// ------------------------------
// Internal helpers
// ------------------------------

function clearTimer() {
  if (currentTimer) {
    clearTimeout(currentTimer);
    currentTimer = null;
  }
}

function removeCurrentImmediate() {
  clearTimer();

  if (currentEl) {
    currentEl.remove();
    currentEl = null;
  }
}

// PT: Calcula o centro horizontal do <main> (se existir)
// EN: Computes <main> horizontal center (if present)
function resolveMainCenterX() {
  const main = document.querySelector('main');
  if (!main) return '50%';

  const rect = main.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  return `${centerX}px`;
}

// PT: Aplica posicionamento fixo alinhado ao <main>
// EN: Applies fixed positioning aligned to <main>
function applyPosition(el, options = {}) {
  const top = Number.isFinite(options.top) ? options.top : 84;

  el.style.position = 'fixed';
  el.style.top = `${top}px`;
  el.style.left = resolveMainCenterX();
  el.style.transform = 'translateX(-50%)';
  el.style.zIndex = String(options.zIndex ?? 9999);
  el.style.maxWidth = '92vw';
}

// PT: Cria o elemento base e aplica classes (CSS: veil-message-box.css)
// EN: Creates base element and applies classes (CSS: veil-message-box.css)
function buildMessageEl({ message, type, customClass } = {}) {
  const el = document.createElement('div');

  // A11y
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  // Base classes (in CSS file)
  el.classList.add('message-box', String(type || 'success'));

  if (customClass) {
    String(customClass)
      .split(' ')
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => el.classList.add(c));
  }

  el.textContent = String(message ?? '');

  return el;
}

// PT: Faz fade-out usando a classe .fade-out (mesmo padrão do seu sistema)
// EN: Fades out using .fade-out class (same pattern as your system)
function fadeOutAndRemove(el, fadeMs = 500) {
  if (!el) return;

  el.classList.add('fade-out');

  setTimeout(() => {
    // PT: remove somente se ainda estiver no DOM
    // EN: remove only if still in DOM
    if (el.parentNode) el.remove();
  }, fadeMs);
}

// ------------------------------
// Public API (Halo)
// ------------------------------

/**
 * PT: Exibe uma mensagem e substitui qualquer mensagem anterior.
 * EN: Shows a message and replaces any previous one.
 *
 * @param {string} message
 * @param {'success'|'warning'|'error'|'info'} type
 * @param {Object} options
 * @param {number} [options.duration=3500] - ms (0 = sticky)
 * @param {string} [options.customClass] - extra classes
 * @param {Object} [options.style] - inline style overrides
 * @param {number} [options.top=84] - px
 * @param {number} [options.zIndex=9999]
 *
 * @returns {void}
 */
function show(message, type = 'success', options = {}) {
  // PT: remove mensagens existentes
  // EN: remove existing message(s)
  removeCurrentImmediate();

  const safeType = String(type || 'success');

  // PT: cria elemento
  // EN: create element
  const el = buildMessageEl({
    message,
    type: safeType,
    customClass: options.customClass,
  });

  // PT: posiciona e aplica estilos extras
  // EN: position and apply extra styles
  applyPosition(el, options);

  if (options.style && typeof options.style === 'object') {
    Object.assign(el.style, options.style);
  }

  document.body.appendChild(el);
  currentEl = el;

  // PT: duração padrão (ms). duration=0 mantém fixo (sticky).
  // EN: default duration (ms). duration=0 keeps it sticky.
  const duration = Number.isFinite(options.duration) ? options.duration : 3500;

  if (duration > 0) {
    currentTimer = setTimeout(() => {
      // PT: anima saída e remove
      // EN: animate exit and remove
      fadeOutAndRemove(currentEl, 500);
      currentEl = null;
      currentTimer = null;
    }, duration);
  }
}

/**
 * PT: Esconde imediatamente (sem esperar duration).
 * EN: Hides immediately (does not wait duration).
 */
function hide() {
  removeCurrentImmediate();
}

/**
 * PT: Atualiza o alinhamento caso o layout mude (ex: sidebar abre/fecha).
 * EN: Updates alignment if layout changes (e.g., sidebar toggles).
 */
function refreshPosition(options = {}) {
  if (!currentEl) return;
  applyPosition(currentEl, options);
}

/**
 * PT: Helper para modo "loading" (sticky).
 * EN: Helper for "loading" mode (sticky).
 */
function loading(message = 'Enviando...', options = {}) {
  show(message, 'info', { ...options, duration: 0 });
}

// ------------------------------
// Export pattern (system standard)
// Ordem de uso: show → (refreshPosition) → hide
// ------------------------------

export const HaloMessageBox = {
  show,
  hide,
  refreshPosition,
  loading,
};
