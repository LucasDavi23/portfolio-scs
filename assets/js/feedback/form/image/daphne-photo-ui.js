/* -----------------------------------------------------------------------------*/
// 📷 Daphne — Photo UI Specialist
//
// Nível / Level: Jovem / Young
//
// PT: Controla a UI da foto no formulário (input file, label e preview).
//     Atualiza o texto do label, gera a thumb usando URL.createObjectURL
//     e integra com o modal emitindo um CustomEvent.
//     Não valida domínio, não converte ou comprime imagem,
//     não chama API/GAS e não faz upload.
//
// EN: Controls the photo UI in the form (file input, label and preview).
//     Updates the label text, builds the thumbnail using URL.createObjectURL
//     and integrates with the modal by emitting a CustomEvent.
//     Does not validate domain, does not convert or compress images,
//     does not call APIs/GAS and does not upload.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 📘 Logger — System Observability Layer
// Fornece / Provides:
// - warn()
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

/* -----------------------------------------------------------------------------*/
// 📡 App Events — System Tool
// Fornece / Provides:
// - emitAppEvent()
// - onAppEvent()
// - offAppEvent()
/* -----------------------------------------------------------------------------*/
import { AppEvents } from '/assets/js/system/events/appEvents.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Estado interno e funções auxiliares da UI de foto.
// EN: Internal state and helper functions for photo UI.
/* -----------------------------------------------------------------------------*/

let inputElement = null;
let labelElement = null;
let previewElement = null;

let isAttached = false;
let currentObjectUrl = null;

let onInputChangeRef = null;
let onPreviewClickRef = null;
let onClearRequestRef = null;

let inputClearButtonElement = null;
let onInputClearClickRef = null;
let onInputClearKeydownRef = null;

// PT: Libera a Object URL atual, se existir.
// EN: Releases the current Object URL, if present.
function revokeCurrentObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

// PT: Atualiza o preview visual da foto selecionada.
// EN: Updates the visual preview of the selected photo.
function renderPhotoPreview(file) {
  if (!previewElement) {
    Logger.warn('FORM', 'Daphne', 'preview element not found during renderPhotoPreview');
    return;
  }

  const existingImage = previewElement.querySelector('img');

  if (existingImage) {
    existingImage.remove();
  }

  revokeCurrentObjectUrl();

  if (!file) {
    previewElement.dataset.full = '';
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  currentObjectUrl = objectUrl;

  const imageElement = new Image();
  imageElement.src = objectUrl;
  imageElement.alt = 'Image preview';
  imageElement.className = 'max-w-full max-h-full object-cover rounded-md';

  previewElement.appendChild(imageElement);
  previewElement.dataset.full = objectUrl;
}

// PT: Atualiza o texto do label e a visibilidade do botão de limpar.
// EN: Updates the label text and the visibility of the clear button.
function updatePhotoLabel(file) {
  if (!labelElement) {
    Logger.warn('FORM', 'Daphne', 'label element not found during updatePhotoLabel');
    return;
  }

  labelElement.textContent = file ? file.name : 'Nenhuma Foto Selecionada';

  if (inputClearButtonElement) {
    if (file) {
      inputClearButtonElement.classList.remove('hidden');
    } else {
      inputClearButtonElement.classList.add('hidden');
    }
  }
}

// PT: Remove listeners do botão de limpar sem remover o elemento do DOM.
// EN: Removes clear-button listeners without removing the DOM element.
function detachInputClearButtonHandlers() {
  if (!inputClearButtonElement) {
    return;
  }

  if (onInputClearClickRef) {
    inputClearButtonElement.removeEventListener('click', onInputClearClickRef);
  }

  if (onInputClearKeydownRef) {
    inputClearButtonElement.removeEventListener('keydown', onInputClearKeydownRef);
  }

  onInputClearClickRef = null;
  onInputClearKeydownRef = null;
}

// PT: Garante a existência do botão de limpar ao lado do input.
// EN: Ensures the clear button exists next to the input.
function ensureInputClearButton() {
  const rowElement = document.getElementById('photo-ui-row');

  if (!rowElement) {
    Logger.warn('FORM', 'Daphne', 'photo-ui-row not found while ensuring clear button');
    return;
  }

  inputClearButtonElement = rowElement.querySelector('[data-input-clear]');

  if (!inputClearButtonElement) {
    inputClearButtonElement = document.createElement('button');
    inputClearButtonElement.type = 'button';
    inputClearButtonElement.setAttribute('aria-label', 'Clear photo');
    inputClearButtonElement.setAttribute('data-input-clear', '');
    inputClearButtonElement.innerHTML = `
      <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6l-12 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `;

    inputClearButtonElement.classList.add(
      'hidden',
      'absolute',
      'right-28',
      'top-1/2',
      '-translate-y-1/2',
      'z-20',
      'w-6',
      'h-6',
      'rounded-full',
      'inline-flex',
      'hover:bg-gray-100',
      'items-center',
      'justify-center',
      'text-gray-500',
      'hover:text-gray-800',
      'transition',
      'select-none'
    );

    rowElement.appendChild(inputClearButtonElement);
  }

  detachInputClearButtonHandlers();

  onInputClearClickRef = (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearPhotoUI();
  };

  onInputClearKeydownRef = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      clearPhotoUI();
    }
  };

  inputClearButtonElement.addEventListener('click', onInputClearClickRef);
  inputClearButtonElement.addEventListener('keydown', onInputClearKeydownRef);
}

// PT: Emite o evento para abrir o modal da imagem.
// EN: Emits the event used to open the image modal.
function emitPhotoModalEvent(src) {
  AppEvents.emitAppEvent('modal:imagem', {
    src,
    alt: 'Uploaded photo',
  });
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Anexa a UI da foto ao formulário.
// EN: Attaches photo UI to the form.
function attachPhotoUI(options = {}) {
  if (isAttached) {
    return;
  }

  const { inputId = 'photo', labelId = 'photo-label', previewId = 'photo-preview' } = options;

  inputElement = document.getElementById(inputId);
  labelElement = document.getElementById(labelId);
  previewElement = document.getElementById(previewId);

  if (!inputElement || !labelElement || !previewElement) {
    Logger.warn('FORM', 'Daphne', 'missing DOM refs during attachPhotoUI', {
      inputElement,
      labelElement,
      previewElement,
    });
    return;
  }

  ensureInputClearButton();

  onInputChangeRef = () => {
    const file = inputElement.files?.[0] || null;
    updatePhotoLabel(file);
    renderPhotoPreview(file);
  };

  inputElement.addEventListener('change', onInputChangeRef);

  onPreviewClickRef = () => {
    const url = previewElement.dataset.full;

    if (!url) {
      return;
    }

    emitPhotoModalEvent(url);
  };

  previewElement.addEventListener('click', onPreviewClickRef);

  onClearRequestRef = () => clearPhotoUI();
  AppEvents.onAppEvent('feedback:photo:clear-request', onClearRequestRef);

  onInputChangeRef();

  isAttached = true;
}

// PT: Limpa a UI da foto selecionada.
// EN: Clears the selected photo UI.
function clearPhotoUI() {
  if (!isAttached) {
    Logger.warn('FORM', 'Daphne', 'clearPhotoUI called while UI is not attached');
    return;
  }

  if (!inputElement || !labelElement || !previewElement) {
    Logger.warn('FORM', 'Daphne', 'missing DOM refs during clearPhotoUI', {
      inputElement,
      labelElement,
      previewElement,
    });
    return;
  }

  inputElement.value = '';
  updatePhotoLabel(null);
  renderPhotoPreview(null);
}

// PT: Remove listeners e limpa refs da UI da foto.
// EN: Removes listeners and clears refs from photo UI.
function detachPhotoUI() {
  if (!isAttached) {
    return;
  }

  if (inputElement && onInputChangeRef) {
    inputElement.removeEventListener('change', onInputChangeRef);
  }

  if (previewElement && onPreviewClickRef) {
    previewElement.removeEventListener('click', onPreviewClickRef);
  }

  if (onClearRequestRef) {
    AppEvents.offAppEvent('feedback:photo:clear-request', onClearRequestRef);
  }

  detachInputClearButtonHandlers();

  inputClearButtonElement = null;
  onInputClearClickRef = null;
  onInputClearKeydownRef = null;
  onClearRequestRef = null;

  revokeCurrentObjectUrl();

  inputElement = null;
  labelElement = null;
  previewElement = null;

  onInputChangeRef = null;
  onPreviewClickRef = null;

  isAttached = false;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const DaphnePhotoUI = {
  attachPhotoUI,
  clearPhotoUI,
  detachPhotoUI,
};
