// ==================================================
// 🧮 Mina — Comment Counter UX Specialist
//
// Nível: Aprendiz
//
// File: mina-comment-counter-ux.js
//
// PT: Mina cuida da experiência (UX) do contador de caracteres do comentário.
//     Ela:
//     - observa o textarea de comentário
//     - atualiza o contador em tempo real (input)
//     - sincroniza o estado inicial ao anexar
//     Mina não valida limites (isso é Sofia), não mexe em envio (Selene)
//     e não toca em outras partes do formulário.
//
// EN: Mina handles the comment character counter UX.
//     She:
//     - watches the comment textarea
//     - updates the counter in real time (input event)
//     - syncs the initial state on attach
//     Mina does not validate limits (Sofia does), does not handle submit (Selene),
//     and does not touch other parts of the form.
// ==================================================

let commentEl = null;
let counterEl = null;

let onInputRef = null;

// ------------------------------
// Internal helpers (UX only)
// ------------------------------

function updateCounterText() {
  if (!commentEl || !counterEl) return;
  counterEl.textContent = String(commentEl.value.length);
}

// ------------------------------
// Public API (Mina)
// ------------------------------

function attachCommentCounterUX(options = {}) {
  const { commentId = 'comentario', counterId = 'contador-comentario' } = options;

  commentEl = document.getElementById(commentId);
  counterEl = document.getElementById(counterId);

  if (!commentEl || !counterEl) return;

  onInputRef = () => updateCounterText();
  commentEl.addEventListener('input', onInputRef);

  // PT: Estado inicial
  // EN: Initial state
  updateCounterText();
}

function detachCommentCounterUX() {
  if (commentEl && onInputRef) {
    commentEl.removeEventListener('input', onInputRef);
  }

  onInputRef = null;
  commentEl = null;
  counterEl = null;
}

// ------------------------------
// Export pattern (project standard)
// Ordem de uso: attach → detach
// ------------------------------

export const MinaCommentCounterUX = {
  attachCommentCounterUX,
  detachCommentCounterUX,
};
