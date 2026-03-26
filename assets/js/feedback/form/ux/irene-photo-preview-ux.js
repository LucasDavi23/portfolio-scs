// ✨ Irene — Photo Preview UX
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Responsável pela experiência de preview da foto no formulário.
//     Padroniza o container como card, sincroniza a imagem inserida,
//     controla overlay, permite abrir a imagem em modal e solicita
//     a limpeza do preview quando necessário.
//     Não valida input, não processa imagem, não controla o input de arquivo
//     e não chama API.
//
// EN: Responsible for the photo preview experience in the form.
//     Standardizes the container as a card, syncs the inserted image,
//     controls the overlay, allows opening the image in a modal,
//     and requests preview clearing when needed.
//     Does not validate input, does not process images,
//     does not control the file input, and does not call APIs.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 👁️ Iris — Image Viewer
// Fornece / Provides:
// - initImageViewer()
/* -----------------------------------------------------------------------------*/
import { IrisImageViewer } from '/assets/js/layout/modal/iris-image-viewer.js';

/* -----------------------------------------------------------------------------*/
// 📡 App Events — System Tool
// Fornece / Provides:
// - emitAppEvent()
/* -----------------------------------------------------------------------------*/
import { AppEvents } from '/assets/js/system/events/appEvents.js';

/* -----------------------------------------------------------------------------*/
// Internal State
/* -----------------------------------------------------------------------------*/

// PT: Referências principais do DOM.
// EN: Main DOM references.
let previewElement = null;
let overlayElement = null;

// PT: Observer do preview para inserção ou remoção de imagem.
// EN: Preview observer for image insertion or removal.
let previewObserver = null;

// PT: Handlers do preview para abertura do modal.
// EN: Preview handlers for modal opening.
let onPreviewClick = null;
let onPreviewKeydown = null;

// PT: Botão de remoção da foto no preview.
// EN: Remove photo button in the preview.
let removeButtonElement = null;
let onRemoveClick = null;
let onRemoveKeydown = null;

/* -----------------------------------------------------------------------------*/
// Internal Helpers — Preview Card
//
// PT: Funções auxiliares para estrutura e estado visual do preview.
// EN: Helper functions for preview structure and visual state.
/* -----------------------------------------------------------------------------*/

// PT: Aplica estilos de card ao container do preview.
// EN: Applies card styles to the preview container.
function applyPreviewCardStyles() {
  if (!previewElement) return;

  previewElement.classList.add(
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

// PT: Sincroniza o estado do preview com ou sem imagem.
// EN: Syncs the preview state with or without an image.
function syncPreviewState() {
  if (!previewElement) return;

  const imageElement = previewElement.querySelector('img');

  if (!imageElement) {
    previewElement.classList.remove('has-image');

    if (overlayElement) {
      overlayElement.classList.add('hidden');
    }

    syncRemoveButtonVisibility(false);
    return;
  }

  // PT: Padroniza a imagem inserida por outra UI.
  // EN: Standardizes the image inserted by another UI.
  imageElement.classList.add('w-full', 'h-full', 'object-cover', 'rounded-md');

  previewElement.classList.add('has-image');

  if (overlayElement) {
    overlayElement.classList.remove('hidden');
  }

  syncRemoveButtonVisibility(true);
}

/* -----------------------------------------------------------------------------*/
// Internal Helpers — Modal
//
// PT: Funções auxiliares para abertura do modal de imagem.
// EN: Helper functions for opening the image modal.
/* -----------------------------------------------------------------------------*/

// PT: Abre um modal fallback simples com dialog.
// EN: Opens a simple fallback modal with dialog.
function openFallbackDialog({ src, alt }) {
  let dialogElement = document.getElementById('feedback-preview-modal');

  if (!dialogElement) {
    dialogElement = document.createElement('dialog');
    dialogElement.id = 'feedback-preview-modal';
    dialogElement.className = 'rounded-xl p-0';
    dialogElement.innerHTML = `
      <div class="relative">
        <button
          type="button"
          aria-label="Close"
          class="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
          data-close
        >
          Close
        </button>
        <img alt="" class="block max-h-[85vh] w-auto object-contain">
      </div>
    `;

    document.body.appendChild(dialogElement);

    dialogElement.addEventListener('click', (event) => {
      if (event.target === dialogElement || event.target.hasAttribute('data-close')) {
        dialogElement.close();
      }
    });
  }

  const imageElement = dialogElement.querySelector('img');
  imageElement.src = src;
  imageElement.alt = alt || 'Feedback image';

  dialogElement.showModal();
}

// PT: Abre o modal de imagem usando a Iris (viewer global).
// EN: Opens the image modal using Iris (global viewer).
function openImageModal({ src, alt }) {
  if (!src) return;

  IrisImageViewer.openImageViewer({ src, alt });
}

// PT: Abre o modal a partir da imagem atual do preview.
// EN: Opens the modal from the current preview image.
function handlePreviewOpen() {
  if (!previewElement) return;

  const imageElement = previewElement.querySelector('img');
  if (!imageElement || !imageElement.src) return;

  openImageModal({
    src: imageElement.src,
    alt: imageElement.alt || 'Feedback image',
  });
}

/* -----------------------------------------------------------------------------*/
// Internal Helpers — Clear Request
//
// PT: Solicita limpeza do input de foto sem manipular o input diretamente.
// EN: Requests photo input clearing without manipulating the input directly.
/* -----------------------------------------------------------------------------*/

// PT: Dispara evento global solicitando limpeza do input de foto.
// EN: Dispatches a global event requesting photo input clearing.
function dispatchClearRequest() {
  AppEvents.emitAppEvent('feedback:photo:clear-request', {
    source: 'IrenePhotoPreviewUX',
  });
}

/* -----------------------------------------------------------------------------*/
// Internal Helpers — Remove Button
//
// PT: Cria, sincroniza e remove handlers do botão de exclusão da foto.
// EN: Creates, syncs, and removes handlers for the photo removal button.
/* -----------------------------------------------------------------------------*/

// PT: Garante que o botão de remoção exista e tenha handlers.
// EN: Ensures the remove button exists and has handlers.
function ensureRemoveButton() {
  if (!previewElement) return;

  detachRemoveButtonHandlers();

  removeButtonElement = previewElement.querySelector('[data-photo-remove]');

  if (!removeButtonElement) {
    removeButtonElement = document.createElement('button');
    removeButtonElement.type = 'button';
    removeButtonElement.setAttribute('aria-label', 'Remove photo');
    removeButtonElement.setAttribute('data-photo-remove', '');

    removeButtonElement.innerHTML = `
      <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6l-12 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `;

    removeButtonElement.classList.add(
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

    previewElement.classList.add('relative');
    previewElement.appendChild(removeButtonElement);
  }

  onRemoveClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatchClearRequest();
  };

  onRemoveKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      dispatchClearRequest();
    }
  };

  removeButtonElement.addEventListener('click', onRemoveClick);
  removeButtonElement.addEventListener('keydown', onRemoveKeydown);
}

// PT: Sincroniza a visibilidade do botão de remoção.
// EN: Syncs the visibility of the remove button.
function syncRemoveButtonVisibility(hasImage) {
  if (!removeButtonElement) return;

  if (hasImage) {
    removeButtonElement.classList.remove('hidden');
  } else {
    removeButtonElement.classList.add('hidden');
  }
}

// PT: Remove os listeners do botão de remoção.
// EN: Removes the listeners from the remove button.
function detachRemoveButtonHandlers() {
  if (!removeButtonElement) return;

  if (onRemoveClick) {
    removeButtonElement.removeEventListener('click', onRemoveClick);
  }

  if (onRemoveKeydown) {
    removeButtonElement.removeEventListener('keydown', onRemoveKeydown);
  }

  onRemoveClick = null;
  onRemoveKeydown = null;
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Anexa a UX do preview de foto ao container informado.
// EN: Attaches photo preview UX to the provided container.
function attachPhotoPreviewUX(options = {}) {
  const { previewId = 'photo-preview', overlayId = 'photo-preview-overlay' } = options;

  previewElement = document.getElementById(previewId);
  overlayElement = document.getElementById(overlayId);

  if (!previewElement) return;

  applyPreviewCardStyles();
  syncPreviewState();
  ensureRemoveButton();

  // PT: Observa mudanças no preview, como inserção ou remoção de imagem.
  // EN: Observes changes in the preview, such as image insertion or removal.
  previewObserver = new MutationObserver(syncPreviewState);
  previewObserver.observe(previewElement, { childList: true, subtree: true });

  // PT: Clique ou teclado no preview abre o modal.
  // EN: Click or keyboard on the preview opens the modal.
  onPreviewClick = () => handlePreviewOpen();
  onPreviewKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePreviewOpen();
    }
  };

  previewElement.addEventListener('click', onPreviewClick);
  previewElement.addEventListener('keydown', onPreviewKeydown);
}

// PT: Remove a UX do preview e limpa referências.
// EN: Detaches preview UX and clears references.
function detachPhotoPreviewUX() {
  if (previewObserver) {
    previewObserver.disconnect();
  }
  previewObserver = null;

  if (previewElement && onPreviewClick) {
    previewElement.removeEventListener('click', onPreviewClick);
  }

  if (previewElement && onPreviewKeydown) {
    previewElement.removeEventListener('keydown', onPreviewKeydown);
  }

  onPreviewClick = null;
  onPreviewKeydown = null;

  detachRemoveButtonHandlers();
  removeButtonElement = null;

  previewElement = null;
  overlayElement = null;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const IrenePhotoPreviewUX = {
  attachPhotoPreviewUX,
  detachPhotoPreviewUX,
};
