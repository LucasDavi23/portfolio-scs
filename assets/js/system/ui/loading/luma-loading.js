// 🍃 Luma — Soldado de Elite do Loading (System/UI - ESModule)
// Nível: Adulta
//------------------------------------------------------------
// PT: UI global de loading reutilizável (DOM).
//     - spinner + label (Tailwind)
//     - loading em botão
//     - ensurePaint() para garantir render antes do fetch pesado
//
// EN: Global reusable loading UI (DOM).
//     - spinner + label (Tailwind)
//     - button loading state
//     - ensurePaint() to force paint before heavy fetch/render
//------------------------------------------------------------

// 🇧🇷 Garante 1 frame para o loading "pintar" antes do trabalho pesado.
// 🇺🇸 Ensures one paint frame so loading paints before heavy work.

export function ensurePaint() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

// 🇧🇷 Sanitiza label para evitar "undefined".
// 🇺🇸 Sanitizes label to avoid "undefined".
export function safeLabel(label, fallback = 'Loading...') {
  return typeof label === 'string' && label.trim() ? label : fallback;
}

// 🇧🇷 HTML do spinner minimalista (estilo escolhido).
// 🇺🇸 Minimal spinner HTML (chosen style).
export function spinnerHTML(label = 'loading...') {
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

// 🇧🇷 Renderiza loading dentro de um container (substitui conteúdo).
// 🇺🇸 Renders loading inside a container (replaces content).
export function renderLoading(containerEl, label) {
  if (!containerEl) return;
  containerEl.innerHTML = spinnerHTML(label);
}

// 🇧🇷 Limpa container.
// 🇺🇸 Clears container.
export function clearLoading(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = '';
}

// 🇧🇷 Alterna loading em botão, preservando o HTML original.
// 🇺🇸 Toggles loading on a button, preserving original HTML.
export function setButtonLoading(btnEl, isLoading, label = 'Loading...') {
  if (!btnEl) return;

  const on = !!isLoading;

  if (on) {
    // Salva HTML original (se ainda não salvo)
    if (!btnEl.dataset.originalHtml) btnEl.dataset.originalHtml = btnEl.innerHTML;
    btnEl.disabled = true;
    btnEl.classList.add('opacity-80', 'cursor-not-allowed');
    btnEl.innerHTML = spinnerHTML(label);
    btnEl.setAttribute('aria-busy', 'true');
  } else {
    // Restaura HTML original (se houver)
    btnEl.disabled = false;
    btnEl.classList.remove('opacity-80', 'cursor-not-allowed');

    const original = btnEl.dataset.originalHtml;
    if (original) btnEl.innerHTML = original;
    btnEl.removeAttribute('aria-busy');
  }
}

export const LumaLoading = {
  ensurePaint,
  safeLabel,
  spinnerHTML,
  renderLoading,
  clearLoading,
  setButtonLoading,
};

// ------------------------------------------------------------
// Fim do arquivo
// End of file
//------------------------------------------------------------
