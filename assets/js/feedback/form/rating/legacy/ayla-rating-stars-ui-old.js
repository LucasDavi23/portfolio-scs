// ==================================================
// ⭐ Ayla — Form Rating UI Specialist
//
// Nível: Aprendiz
//
// File: ayla-rating-stars-ui.js
//
// PT: Controla a interface de avaliação por estrelas
//     dentro do formulário de feedback.
//     Ayla é responsável apenas pela interação visual:
//     clique, toggle das estrelas, sincronização com
//     input oculto, badge de status e reset visual.
//     Ela não calcula o valor final, não emite eventos
//     e não executa envio — UI apenas.
//
// EN: Controls the star-based rating interface
//     inside the feedback form.
//     Ayla is responsible only for visual interaction:
//     click handling, star toggling, hidden input
//     synchronization, status badge and visual reset.
//     She does not calculate the final value, does not
//     emit events, and does not submit data — UI only.
// ==================================================

// ------------------------------
// Internal state (module scope)
// ------------------------------
let groupEl = null;
let radioEls = [];
let labelEls = [];
let hiddenInputEl = null;
let badgeEl = null;

let isAttached = false;

// Keep references to handlers so we can remove them on unmount
let labelClickHandlers = [];
let radioChangeHandlers = [];

// ------------------------------
// Internal helpers (UI only)
// ------------------------------

function paintStars(quantity) {
  // PT: Mantém a classe original do projeto ("star--ativa")
  // EN: Keeps the project's original class name ("star--ativa")
  labelEls.forEach((label, index) => {
    label.classList.toggle('star--ativa', index < quantity);
  });
}

function updateBadge(quantity) {
  if (!badgeEl) return;

  if (quantity > 0) {
    badgeEl.textContent = `${quantity}/5`;
    badgeEl.classList.remove('hidden');
  } else {
    badgeEl.classList.add('hidden');
  }
}

function getCurrentRatingValue() {
  return parseInt(hiddenInputEl?.value || '0', 10) || 0;
}

function applyRatingValue(quantity) {
  const normalized = Number(quantity) || 0;

  const radio = radioEls.find((r) => parseInt(r.value, 10) === normalized);

  if (radio) radio.checked = true;
  if (hiddenInputEl) hiddenInputEl.value = String(normalized);

  paintStars(normalized);
  updateBadge(normalized);
}

function clearRatingValue() {
  radioEls.forEach((radio) => (radio.checked = false));
  if (hiddenInputEl) hiddenInputEl.value = '';

  paintStars(0);
  updateBadge(0);
}

// ------------------------------
// Public API (Ayla)
// ------------------------------

/**
 * PT: Anexa a UI de estrelas (eventos + sync visual).
 * EN: Attaches the stars UI (events + visual sync).
 */
function attachStarsUI(options = {}) {
  if (isAttached) return;

  const {
    groupId = 'rating-group',
    radioName = 'rating_star',
    hiddenInputId = 'rating',
    badgeId = 'rating-badge',
  } = options;

  groupEl = document.getElementById(groupId);
  if (!groupEl) return;

  radioEls = Array.from(document.querySelectorAll(`input[name="${radioName}"]`));

  // PT: Aceita label.star ou label normal (compat com HTML legado)
  // EN: Accepts label.star or plain label (legacy HTML compatible)
  labelEls = Array.from(groupEl.querySelectorAll('label.star, label'));

  hiddenInputEl = document.getElementById(hiddenInputId);
  badgeEl = document.getElementById(badgeId);

  // ------------------------------
  // Bind events
  // ------------------------------

  labelClickHandlers = labelEls.map((label) => {
    const handler = (event) => {
      event.preventDefault();

      const forId = label.getAttribute('for');
      const radio = forId ? document.getElementById(forId) : null;

      const clickedValue = radio ? parseInt(radio.value, 10) : 0;
      const currentValue = getCurrentRatingValue();

      if (clickedValue === currentValue) {
        clearRatingValue(); // toggle off (same star clicked)
      } else {
        applyRatingValue(clickedValue);
      }
    };

    label.addEventListener('click', handler);
    return handler;
  });

  radioChangeHandlers = radioEls.map((radio) => {
    const handler = () => {
      applyRatingValue(parseInt(radio.value, 10));
    };

    radio.addEventListener('change', handler);
    return handler;
  });

  // ------------------------------
  // Initial state
  // ------------------------------
  const preChecked = radioEls.find((r) => r.checked);
  applyRatingValue(preChecked ? parseInt(preChecked.value, 10) : 0);

  isAttached = true;
}

/**
 * PT: Remove listeners e limpa refs (detach seguro).
 * EN: Removes listeners and clears refs (safe detach).
 */

function detachStarsUI() {
  if (!isAttached) return;

  // Remove label listeners
  labelEls.forEach((label, index) => {
    const handler = labelClickHandlers[index];
    if (handler) label.removeEventListener('click', handler);
  });

  // Remove radio listeners
  radioEls.forEach((radio, index) => {
    const handler = radioChangeHandlers[index];
    if (handler) radio.removeEventListener('change', handler);
  });

  // Reset internal references
  groupEl = null;
  radioEls = [];
  labelEls = [];
  hiddenInputEl = null;
  badgeEl = null;

  labelClickHandlers = [];
  radioChangeHandlers = [];

  isAttached = false;
}

/**
 * PT: Define o valor das estrelas e sincroniza UI/hidden input.
 * EN: Sets the stars value and syncs UI/hidden input.
 */

function setStarsValue(value) {
  applyRatingValue(value);
}

/**
 * PT: Retorna o valor atual (lido do hidden input).
 * EN: Returns current value (read from hidden input).
 */

function getStarsValue() {
  return getCurrentRatingValue();
}

/**
 * PT: Limpa a seleção (UI + hidden input).
 * EN: Clears selection (UI + hidden input).
 */
function clearStarsUI() {
  clearRatingValue();
}

// ------------------------------
// Export pattern (project standard)
// PT: Ordem "mais fácil" de ler/usar (montar → usar → limpar → desmontar)
// EN: "Easiest" order to read/use (mount → use → clear → unmount)
// ------------------------------
export const AylaRatingStarsUI = {
  attachStarsUI,
  setStarsValue,
  getStarsValue,
  clearStarsUI,
  detachStarsUI,
};
