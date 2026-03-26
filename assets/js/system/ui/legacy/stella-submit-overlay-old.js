// ==================================================
// ⭐ Stella — Submit Overlay UI Specialist (System/UI)
// Nível: Jovem
// --------------------------------------------------
// PT: Overlay reutilizável de "processando" para submits.
//     Bloqueia interação e comunica estado usando o spinner da Luma.
// EN: Reusable "processing" overlay for submits.
//     Blocks interaction and communicates state using Luma's spinner.
// ==================================================

// 🍃 Luma — Loading Base (System/UI)
// provides:
// ensurePaint,
// safeLabel,
// spinnerHTML,
// renderLoading,
// clearLoading,
// setButtonLoading,

import { LumaLoading } from '/assets/js/system/ui/loading/luma-loading';

// ---------------------------------------------------------------------

function ensureOverlay(containerEl) {
  if (!containerEl) return null;

  // Evita duplicar
  let overlay = containerEl.querySelector('[data-stella-submit-overlay="true"]');
  if (overlay) return overlay;

  // Garante contexto de posicionamento
  const style = getComputedStyle(containerEl);
  if (style.position === 'static') containerEl.classList.add('relative');

  // cria overlay
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

function show(containerEl, label = 'Enviando...', options = {}) {
  const overlay = ensureOverlay(containerEl);
  if (!overlay) return;

  const { subtext = 'Aguarde só um instante.' } = options;

  const content = overlay.querySelector('[data-stella-overlay-content]');
  if (content) content.innerHTML = LumaLoading.spinnerHTML(label);

  const sub = overlay.querySelector('[data-stella-overlay-sub]');
  if (sub) sub.textContent = subtext;

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  containerEl.setAttribute('aria-busy', 'true');
}

function hide(containerEl) {
  if (!containerEl) return;

  const overlay = containerEl.querySelector('[data-stella-submit-overlay="true"]');
  if (!overlay) return;

  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
  containerEl.removeAttribute('aria-busy');
}

export const StellaSubmitOverlay = {
  show,
  hide,
};
