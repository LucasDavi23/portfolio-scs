// ⭐ Stella — Submit Overlay
//
// Nível / Level: Jovem / Young
//
// PT: Exibe overlay de carregamento em submits.
// EN: Displays loading overlay during submits.

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🍃 Luma — Loading UI
// Fornece / Provides:
// - spinnerHTML()
/* -----------------------------------------------------------------------------*/
import { LumaLoading } from '/assets/js/system/ui/loading/luma-loading';

/* -----------------------------------------------------------------------------*/
// Overlay Helpers
//
// PT: Cria e gerencia o overlay de submit.
// EN: Creates and manages the submit overlay.
/* -----------------------------------------------------------------------------*/

// PT: Garante que o overlay exista no container.
// EN: Ensures the overlay exists in the container.
function ensureOverlay(containerEl) {
  if (!containerEl) return null;

  let overlay = containerEl.querySelector('[data-stella-submit-overlay="true"]');
  if (overlay) return overlay;

  const style = getComputedStyle(containerEl);

  // PT: Garante contexto de posicionamento.
  // EN: Ensures positioning context.
  if (style.position === 'static') {
    containerEl.classList.add('relative');
  }

  overlay = document.createElement('div');
  overlay.setAttribute('data-stella-submit-overlay', 'true');

  overlay.className =
    'absolute inset-0 z-50 hidden items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm';

  overlay.innerHTML = `
    <div class="rounded-xl bg-white px-5 py-4 shadow-lg">
      <div data-stella-overlay-content></div>
      <p class="mt-2 text-center text-xs text-slate-500" data-stella-overlay-sub>
        Aguarde só um instante.
      </p>
    </div>
  `;

  containerEl.appendChild(overlay);
  return overlay;
}

/* -----------------------------------------------------------------------------*/
// Overlay Actions
//
// PT: Controla exibição e ocultação do overlay.
// EN: Controls overlay visibility.
/* -----------------------------------------------------------------------------*/

// PT: Exibe o overlay.
// EN: Shows the overlay.
function show(containerEl, label = 'Enviando...', options = {}) {
  const overlay = ensureOverlay(containerEl);
  if (!overlay) return;

  const { subtext = 'Aguarde só um instante.' } = options;

  const content = overlay.querySelector('[data-stella-overlay-content]');
  if (content) {
    content.innerHTML = LumaLoading.spinnerHTML(label);
  }

  const sub = overlay.querySelector('[data-stella-overlay-sub]');
  if (sub) {
    sub.textContent = subtext;
  }

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');

  containerEl.setAttribute('aria-busy', 'true');
}

// PT: Oculta o overlay.
// EN: Hides the overlay.
function hide(containerEl) {
  if (!containerEl) return;

  const overlay = containerEl.querySelector('[data-stella-submit-overlay="true"]');
  if (!overlay) return;

  overlay.classList.add('hidden');
  overlay.classList.remove('flex');

  containerEl.removeAttribute('aria-busy');
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const StellaSubmitOverlay = {
  show,
  hide,
};
