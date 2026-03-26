// 🍃 Luma — Loading UI
//
// Nível / Level: Adulta / Adult
//
// PT: Controla o loading visual de containers e botões.
// EN: Controls visual loading for containers and buttons.

/* -----------------------------------------------------------------------------*/
// Paint Helpers
//
// PT: Garante renderização antes de tarefas pesadas.
// EN: Ensures rendering before heavy tasks.
/* -----------------------------------------------------------------------------*/

// PT: Aguarda um frame para o loading aparecer.
// EN: Waits one frame so loading can render.
function ensurePaint() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/* -----------------------------------------------------------------------------*/
// Label Helpers
//
// PT: Normaliza textos usados no loading.
// EN: Normalizes loading text labels.
/* -----------------------------------------------------------------------------*/

// PT: Garante uma label válida.
// EN: Ensures a valid label.
function safeLabel(label, fallback = 'Loading...') {
  return typeof label === 'string' && label.trim() ? label : fallback;
}

/* -----------------------------------------------------------------------------*/
// Spinner Markup
//
// PT: Gera o HTML do spinner.
// EN: Generates spinner HTML.
/* -----------------------------------------------------------------------------*/

// PT: Retorna o HTML do spinner.
// EN: Returns spinner HTML.
function spinnerHTML(label = 'Loading...') {
  const safe = safeLabel(label);

  return `
    <div class="inline-flex items-center gap-2 text-sm text-slate-600">
      <svg aria-hidden="true"
           class="h-4 w-4 animate-spin text-slate-300 fill-slate-700"
           viewBox="0 0 100 101" fill="none">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591
                 50 100.591C22.3858 100.591 0 78.2051 0
                 50.5908C0 22.9766 22.3858 0.59082 50
                 0.59082C77.6142 0.59082 100 22.9766 100
                 50.5908ZM9.08144 50.5908C9.08144 73.1895
                 27.4013 91.5094 50 91.5094C72.5987 91.5094
                 90.9186 73.1895 90.9186 50.5908C90.9186
                 27.9921 72.5987 9.67226 50 9.67226C27.4013
                 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038
                 97.8624 35.9116 97.0079 33.5539C95.2932
                 28.8227 92.871 24.3692 89.8167 20.348
                 C85.8452 15.1192 80.8826 10.7238 75.2124
                 7.41289C69.5422 4.10194 63.2754 1.94025
                 56.7698 1.05124C51.7666 0.367541 46.6976
                 0.446843 41.7345 1.27873C39.2613 1.69328
                 37.813 4.19778 38.4501 6.62326C39.0873
                 9.04874 41.5694 10.4717 44.0505 10.1071
                 C47.8511 9.54855 51.7191 9.52689 55.5402
                 10.0491C60.8642 10.7766 65.9928 12.5457
                 70.6331 15.2552C75.2735 17.9648 79.3347
                 21.5619 82.5849 25.841C84.9175 28.9121
                 86.7997 32.2913 88.1811 35.8758C89.083
                 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"/>
      </svg>
      <span>${safe}</span>
    </div>
  `;
}

/* -----------------------------------------------------------------------------*/
// Container Loading
//
// PT: Controla loading em containers.
// EN: Controls loading in containers.
/* -----------------------------------------------------------------------------*/

// PT: Renderiza loading no container.
// EN: Renders loading inside the container.
function renderLoading(containerEl, label) {
  if (!containerEl) return;
  containerEl.innerHTML = spinnerHTML(label);
}

// PT: Limpa o loading do container.
// EN: Clears container loading.
function clearLoading(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = '';
}

/* -----------------------------------------------------------------------------*/
// Button Loading
//
// PT: Controla loading visual em botões.
// EN: Controls visual loading in buttons.
/* -----------------------------------------------------------------------------*/

// PT: Ativa ou desativa loading no botão.
// EN: Toggles loading state on the button.
function setButtonLoading(buttonEl, isLoading, label = 'Loading...') {
  if (!buttonEl) return;

  const isActive = !!isLoading;

  if (isActive) {
    if (!buttonEl.dataset.originalHtml) {
      buttonEl.dataset.originalHtml = buttonEl.innerHTML;
    }

    buttonEl.disabled = true;
    buttonEl.classList.add('opacity-80', 'cursor-not-allowed');
    buttonEl.innerHTML = spinnerHTML(label);
    buttonEl.setAttribute('aria-busy', 'true');
  } else {
    buttonEl.disabled = false;
    buttonEl.classList.remove('opacity-80', 'cursor-not-allowed');

    const originalHtml = buttonEl.dataset.originalHtml;
    if (originalHtml) {
      buttonEl.innerHTML = originalHtml;
    }

    buttonEl.removeAttribute('aria-busy');
  }
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const LumaLoading = {
  ensurePaint,
  safeLabel,
  spinnerHTML,
  renderLoading,
  clearLoading,
  setButtonLoading,
};
