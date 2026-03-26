// 🧮 Mina — Comment Counter UX
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Responsável pela experiência do contador de caracteres do comentário.
//     Observa o textarea do comentário, atualiza o contador em tempo real
//     e sincroniza o estado inicial ao anexar.
//     Não valida limites, não controla envio e não interage com outras
//     partes do formulário.
//
// EN: Responsible for the comment character counter experience.
//     Observes the comment textarea, updates the counter in real time,
//     and syncs the initial state on attach.
//     Does not validate limits, does not control submission,
//     and does not interact with other parts of the form.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/
// (nenhum necessário / none needed)

/* -----------------------------------------------------------------------------*/
// Internal State
/* -----------------------------------------------------------------------------*/

let commentElement = null;
let counterElement = null;

let onInputHandler = null;

/* -----------------------------------------------------------------------------*/
// Internal Helpers
//
// PT: Funções auxiliares para atualização visual do contador.
// EN: Helper functions for visual counter updates.
/* -----------------------------------------------------------------------------*/

// PT: Atualiza o texto do contador com base no tamanho atual do comentário.
// EN: Updates the counter text based on the current comment length.
function updateCounterText() {
  if (!commentElement || !counterElement) return;

  counterElement.textContent = String(commentElement.value.length);
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Anexa a UX do contador de comentário.
// EN: Attaches the comment counter UX.
function attachCommentCounterUX(options = {}) {
  const { commentId = 'commentInput', counterId = 'counter-comment' } = options;

  commentElement = document.getElementById(commentId);
  counterElement = document.getElementById(counterId);

  if (!commentElement || !counterElement) return;

  onInputHandler = () => updateCounterText();
  commentElement.addEventListener('input', onInputHandler);

  // PT: Sincroniza o estado inicial do contador.
  // EN: Syncs the initial counter state.
  updateCounterText();
}

// PT: Remove a UX do contador e limpa referências.
// EN: Detaches the counter UX and clears references.
function detachCommentCounterUX() {
  if (commentElement && onInputHandler) {
    commentElement.removeEventListener('input', onInputHandler);
  }

  onInputHandler = null;
  commentElement = null;
  counterElement = null;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const MinaCommentCounterUX = {
  attachCommentCounterUX,
  detachCommentCounterUX,
};
