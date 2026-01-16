// ==================================================
// ✨ Irene — Photo Preview UX Specialist
//
// Nível: Aprendiz
//
// File: irene-photo-preview-ux.js
//
// PT: Irene cuida da experiência (UX) do preview de foto no formulário.
//     Ela:
//     - padroniza o container do preview como um "card"
//     - ajusta automaticamente a <img> inserida no preview (MutationObserver)
//     - controla overlay (mostra/esconde) quando há imagem
//     - abre a imagem em um modal ao clicar/teclar (Enter/Espaço)
//       usando o modal padrão do sistema se existir; caso contrário,
//       usa um fallback simples com <dialog>.
//     Irene não valida inputs (Sofia), não processa imagem (Athena),
//     não controla input/label do arquivo (Daphne) e não chama API/Flow.
//
// EN: Irene handles the photo preview UX in the form.
//     She:
//     - styles the preview container as a "card"
//     - auto-tunes the <img> inserted into the preview (MutationObserver)
//     - controls overlay visibility when an image is present
//     - opens the image in a modal on click/keyboard (Enter/Space)
//       using the system modal if available; otherwise falls back to <dialog>.
//     Irene does not validate inputs (Sofia), does not process images (Athena),
//     does not handle file input/label UI (Daphne) and does not call API/Flow.
// ==================================================

// ------------------------------
// Module state (Irene)
// ------------------------------

// PT: referências principais do DOM
// EN: main DOM references
let previewEl = null;
let overlayEl = null;

// PT: observer do preview (img insert/remove)
// EN: preview observer (img insert/remove)
let observerRef = null;

// PT: handlers do preview (abrir modal)
// EN: preview handlers (open modal)
let onPreviewClickRef = null;
let onPreviewKeydownRef = null;

// PT: botão X (remoção de foto no preview)
// EN: remove photo button (preview)
let removeBtnEl = null;
let onRemoveClickRef = null;
let onRemoveKeydownRef = null;

// ------------------------------
// Internal helpers (UX only)
// ------------------------------

// PT: Aplica estilos de card ao container do preview
// EN: Applies card styles to the preview container
function applyPreviewCardStyles() {
  if (!previewEl) return;

  // PT: Mantém o preview no tamanho de card sem depender de runtime Tailwind
  // EN: Keeps the preview in card size without relying on Tailwind runtime
  previewEl.classList.add(
    'w-full',
    'max-w-sm',
    'h-24',
    'overflow-hidden',
    'rounded-lg',
    'border',
    'border-gray-200',
    'bg-white',
    'shadow-sm'
  );
}

// PT: Sincroniza estado do preview (com ou sem imagem)
// EN: Syncs preview state (with or without image)
function syncPreviewState() {
  if (!previewEl) return;

  const img = previewEl.querySelector('img');

  if (!img) {
    previewEl.classList.remove('has-image');
    if (overlayEl) overlayEl.classList.add('hidden');

    syncRemoveButtonVisibility(false);

    return;
  }

  // PT: Padroniza estilo da imagem inserida por outra UI (ex: Daphne)
  // EN: Standardize image style inserted by another UI (e.g., Daphne)
  img.classList.add('w-full', 'h-full', 'object-cover', 'rounded-md');

  previewEl.classList.add('has-image');
  if (overlayEl) overlayEl.classList.remove('hidden');
  syncRemoveButtonVisibility(true);
}

// PT: Abre um modal fallback simples com <dialog>
// EN: Opens a simple fallback modal with <dialog>
function openFallbackDialog({ src, alt }) {
  let dlg = document.getElementById('feedback-preview-modal');

  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'feedback-preview-modal';
    dlg.className = 'rounded-xl p-0';
    dlg.innerHTML = `
      <div class="relative">
        <button type="button" aria-label="Close"
          class="absolute right-2 top-2 z-10 rounded-full bg-black/60 text-white px-2 py-1 text-xs"
          data-close>Close</button>
        <img alt="" class="max-h-[85vh] w-auto object-contain block">
      </div>`;

    document.body.appendChild(dlg);

    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.hasAttribute('data-close')) dlg.close();
    });
  }

  const img = dlg.querySelector('img');
  img.src = src;
  img.alt = alt || 'Feedback image';

  dlg.showModal();
}

// PT: Abre o modal de imagem (padrão do sistema ou fallback)
// EN: Opens the image modal (system default or fallback)
function openImageModal({ src, alt }) {
  // PT: Se existir modal padrão do projeto, usa ele
  // EN: If the project modal exists, use it
  if (window.FeedbackCardModal?.open) {
    window.FeedbackCardModal.open({ src, alt });
    return;
  }

  // PT/EN: fallback mínimo
  openFallbackDialog({ src, alt });
}

// PT: Lida com abertura do modal ao clicar/teclar no preview
// EN: Handles modal opening on preview click/keyboard
function handlePreviewOpen() {
  if (!previewEl) return;

  const img = previewEl.querySelector('img');
  if (!img || !img.src) return;

  openImageModal({
    src: img.src,
    alt: img.alt || 'Feedback image',
  });
}

// PT: Dispara evento global solicitando limpeza do input de foto
// EN: Dispatches global event requesting photo input clearing
function dispatchClearRequest() {
  // PT: Irene só solicita a limpeza (quem limpa input é a Daphne)
  // EN: Irene only requests clearing (Daphne clears the file input)
  window.dispatchEvent(
    new CustomEvent('feedback:photo:clear-request', {
      detail: { source: 'IrenePhotoPreviewUX' },
    })
  );
}

// PT: Garante que o botão de remoção exista e tenha handlers
// EN: Ensures the remove button exists and has handlers

function ensureRemoveButton() {
  if (!previewEl) return;

  // PT/EN: garante que não vai duplicar handlers se attach rodar de novo
  detachRemoveButtonHandlers();

  // PT: evita duplicar se o botão já existir no DOM
  // EN: avoid duplicates if button already exists in DOM
  removeBtnEl = previewEl.querySelector('[data-photo-remove]');

  if (!removeBtnEl) {
    removeBtnEl = document.createElement('button');
    removeBtnEl.type = 'button';
    removeBtnEl.setAttribute('aria-label', 'Remove photo');
    removeBtnEl.setAttribute('data-photo-remove', '');

    removeBtnEl.innerHTML = `
      <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6l-12 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `;

    // PT: estilo do X (somente UX do preview)
    // EN: X styling (preview UX only)
    removeBtnEl.classList.add(
      'hidden',
      'absolute',
      'top-2',
      'right-2',
      'z-20',
      'w-6',
      'h-6',
      'rounded-full',

      'inline-flex',
      'items-center',
      'justify-center',

      'text-gray-700',
      'bg-white/70',
      'hover:bg-white/90',
      'hover:text-gray-900',

      'select-none',
      'backdrop-blur-sm'
    );

    // PT: garante que o preview seja âncora do absolute
    // EN: ensure preview is the anchor for absolute positioning
    previewEl.classList.add('relative');

    previewEl.appendChild(removeBtnEl);
  }

  // PT/EN: handlers (refs para detach)
  onRemoveClickRef = (e) => {
    e.preventDefault();
    e.stopPropagation(); // PT/EN: não abrir modal ao clicar no X
    dispatchClearRequest();
  };

  onRemoveKeydownRef = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation(); // PT/EN: não abrir modal ao teclar no X
      dispatchClearRequest();
    }
  };

  removeBtnEl.addEventListener('click', onRemoveClickRef);
  removeBtnEl.addEventListener('keydown', onRemoveKeydownRef);
}

function syncRemoveButtonVisibility(hasImage) {
  if (!removeBtnEl) return;

  // PT: X só aparece quando há imagem
  // EN: X only shows when an image exists
  if (hasImage) removeBtnEl.classList.remove('hidden');
  else removeBtnEl.classList.add('hidden');
}

// PT: Remove listeners do botão X (sem remover do DOM)
// EN: Removes X button listeners (without removing from DOM)
function detachRemoveButtonHandlers() {
  if (!removeBtnEl) return;

  if (onRemoveClickRef) {
    removeBtnEl.removeEventListener('click', onRemoveClickRef);
  }
  if (onRemoveKeydownRef) {
    removeBtnEl.removeEventListener('keydown', onRemoveKeydownRef);
  }

  onRemoveClickRef = null;
  onRemoveKeydownRef = null;
}

// ------------------------------
// Public API (Irene)
// ------------------------------

function attachPhotoPreviewUX(options = {}) {
  const { previewId = 'photo-preview', overlayId = 'photo-preview-overlay' } = options;

  previewEl = document.getElementById(previewId);

  console.log('[Irene] attachPhotoPreviewUX: previewEl?', !!previewEl);

  overlayEl = document.getElementById(overlayId);

  if (!previewEl) return;

  applyPreviewCardStyles();
  syncPreviewState();
  ensureRemoveButton();

  console.log('[Irene] ensureRemoveButton executed');

  // PT: Observa mudanças (ex: <img> inserida/removida pelo preview)
  // EN: Observes changes (e.g., <img> inserted/removed by preview UI)
  observerRef = new MutationObserver(syncPreviewState);
  observerRef.observe(previewEl, { childList: true, subtree: true });

  // PT: Clique/teclado no preview abre modal
  // EN: Click/keyboard on preview opens modal
  onPreviewClickRef = () => handlePreviewOpen();
  onPreviewKeydownRef = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePreviewOpen();
    }
  };

  previewEl.addEventListener('click', onPreviewClickRef);
  previewEl.addEventListener('keydown', onPreviewKeydownRef);
}

function detachPhotoPreviewUX() {
  if (observerRef) observerRef.disconnect();
  observerRef = null;

  if (previewEl && onPreviewClickRef) {
    previewEl.removeEventListener('click', onPreviewClickRef);
  }
  if (previewEl && onPreviewKeydownRef) {
    previewEl.removeEventListener('keydown', onPreviewKeydownRef);
  }

  onPreviewClickRef = null;
  onPreviewKeydownRef = null;

  // PT: limpa botão de remoção
  // EN: cleans up remove button
  detachRemoveButtonHandlers();
  removeBtnEl = null;

  previewEl = null;
  overlayEl = null;
}

// ------------------------------
// Export pattern (project standard)
// Ordem de uso: attach → detach
// ------------------------------

export const IrenePhotoPreviewUX = {
  attachPhotoPreviewUX,
  detachPhotoPreviewUX,
};
