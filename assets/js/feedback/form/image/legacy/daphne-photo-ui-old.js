// ==================================================
// 📷 Daphne — Photo UI Specialist
//
// Nível: Jovem
//
// File: daphne-photo-ui.js
//
// PT: Controla a UI da foto no formulário (input file + label + preview).
//     Daphne atualiza o texto do label, gera a thumb (preview) usando
//     URL.createObjectURL e integra com o modal emitindo um CustomEvent.
//     Ela não valida domínio, não converte/comprime imagem (isso é Athena),
//     não chama API/GAS e não faz upload — UI apenas.
//
// EN: Controls the photo UI in the form (file input + label + preview).
//     Daphne updates the label text, builds the thumbnail preview using
//     URL.createObjectURL and integrates with the modal by emitting a CustomEvent.
//     She does not validate domain, does not convert/compress images (Athena does),
//     does not call APIs/GAS and does not upload — UI only.
// ==================================================

let inputEl = null;
let labelEl = null;
let previewEl = null;

let isAttached = false;
let currentObjectUrl = null;

// PT: mantém refs dos handlers para detach seguro
// EN: keep handler refs for safe detach

let onInputChangeRef = null;
let onPreviewClickRef = null;

// PT: handler do evento global de limpeza (pedido vindo da Irene)
// EN: global clear event handler (request coming from Irene)
let onClearRequestRef = null;

// PT: botão X do input (limpar seleção)
// EN: input clear (X) button
let inputClearBtnEl = null;
let onInputClearClickRef = null;
let onInputClearKeydownRef = null;

// ------------------------------
// Internal helpers (UI only)
// ------------------------------

function revokeCurrentObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function renderPhotoPreview(file) {
  if (!previewEl) {
    console.warn('[Daphne] previewEl not found. renderPhotoPreview skipped.');
    return;
  }

  // PT: remove apenas a <img> (não destrói camadas de UX, ex: botão X da Irene)
  // EN: remove only the <img> (does not destroy UX layers, e.g., Irene's X button)
  const existingImg = previewEl.querySelector('img');
  if (existingImg) existingImg.remove();

  revokeCurrentObjectUrl();

  if (!file) {
    previewEl.dataset.full = '';
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  currentObjectUrl = objectUrl;

  const img = new Image();
  img.src = objectUrl;
  img.alt = 'Image preview';
  img.className = 'max-w-full max-h-full object-cover rounded-md';

  previewEl.appendChild(img);
  previewEl.dataset.full = objectUrl;
}

function updatePhotoLabel(file) {
  if (!labelEl) {
    console.warn('[Daphne] labelEl not found. updatePhotoLabel skipped.');
    return;
  }

  labelEl.textContent = file ? file.name : 'Nenhuma Foto Selecionada';

  // PT: X só aparece quando há arquivo selecionado
  // EN: X only shows when a file is selected
  if (inputClearBtnEl) {
    if (file) inputClearBtnEl.classList.remove('hidden');
    else inputClearBtnEl.classList.add('hidden');
  }
}

// PT: remove listeners do botão X (sem remover do DOM)
// EN: removes X button listeners (without removing from DOM)
function detachInputClearButtonHandlers() {
  if (!inputClearBtnEl) return;

  if (onInputClearClickRef) {
    inputClearBtnEl.removeEventListener('click', onInputClearClickRef);
  }
  if (onInputClearKeydownRef) {
    inputClearBtnEl.removeEventListener('keydown', onInputClearKeydownRef);
  }

  onInputClearClickRef = null;
  onInputClearKeydownRef = null;
}

// PT: garante botão X ao lado do input (limpa seleção)
// EN: ensures an X button next to the input (clears selection)
function ensureInputClearButton() {
  const rowEl = document.getElementById('photo-ui-row');

  if (!rowEl) {
    console.warn('[Daphne] photo-ui-row not found. Input clear button skipped.');
    return;
  }

  // PT: tenta achar no DOM (evita duplicar)
  // EN: tries to find in the DOM (avoids duplicates)
  inputClearBtnEl = rowEl.querySelector('[data-input-clear]');

  if (!inputClearBtnEl) {
    inputClearBtnEl = document.createElement('button');
    inputClearBtnEl.type = 'button';
    inputClearBtnEl.setAttribute('aria-label', 'Clear photo');
    inputClearBtnEl.setAttribute('data-input-clear', '');
    inputClearBtnEl.innerHTML = `
      <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6l-12 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `;

    // PT: estilo básico do X (ajuste se quiser)
    // EN: basic X styling (tweak as needed)
    inputClearBtnEl.classList.add(
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

    rowEl.appendChild(inputClearBtnEl);
  }

  // PT: evita duplicar listeners se ensure rodar mais de uma vez
  // EN: prevents duplicated listeners if ensure runs more than once
  detachInputClearButtonHandlers();

  // PT: handlers com refs para detach seguro
  // EN: handlers with refs for safe detach
  onInputClearClickRef = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearPhotoUI();
  };

  onInputClearKeydownRef = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      clearPhotoUI();
    }
  };

  inputClearBtnEl.addEventListener('click', onInputClearClickRef);
  inputClearBtnEl.addEventListener('keydown', onInputClearKeydownRef);
}

function emitPhotoModalEvent(src) {
  window.dispatchEvent(
    new CustomEvent('modal:imagem', {
      detail: { src, alt: 'Uploaded photo' },
    })
  );
}

// ------------------------------
// Public API (Daphne)
// ------------------------------

function attachPhotoUI(options = {}) {
  if (isAttached) return;

  const { inputId = 'photo', labelId = 'photo-label', previewId = 'photo-preview' } = options;

  inputEl = document.getElementById(inputId);
  labelEl = document.getElementById(labelId);
  previewEl = document.getElementById(previewId);

  if (!inputEl || !labelEl || !previewEl) {
    console.warn('[Daphne] Missing DOM refs. attachPhotoUI aborted.', {
      inputEl,
      labelEl,
      previewEl,
    });
    return;
  }

  ensureInputClearButton();

  // PT: Change no input file → atualiza label e preview
  // EN: File input change → update label and preview
  onInputChangeRef = () => {
    const file = inputEl.files?.[0] || null;
    updatePhotoLabel(file);
    renderPhotoPreview(file);
  };

  inputEl.addEventListener('change', onInputChangeRef);

  // PT: Clique no preview → emite evento para o modal
  // EN: Preview click → emits event for the modal
  onPreviewClickRef = () => {
    const url = previewEl.dataset.full;
    if (!url) return;
    emitPhotoModalEvent(url);
  };

  previewEl.addEventListener('click', onPreviewClickRef);

  // PT: Irene solicita limpeza via evento global → Daphne executa o reset
  // EN: Irene requests clearing via global event → Daphne performs the reset
  onClearRequestRef = () => clearPhotoUI();
  window.addEventListener('feedback:photo:clear-request', onClearRequestRef);

  // Initial sync
  onInputChangeRef();

  isAttached = true;
}

function clearPhotoUI() {
  if (!isAttached) {
    console.warn('[Daphne] clearPhotoUI called while not attached.');
    return;
  }

  if (!inputEl || !labelEl || !previewEl) {
    console.warn('[Daphne] clearPhotoUI missing DOM refs.', { inputEl, labelEl, previewEl });
    return;
  }

  if (inputEl) inputEl.value = '';
  updatePhotoLabel(null);
  renderPhotoPreview(null);
}

function detachPhotoUI() {
  if (!isAttached) return;

  if (inputEl && onInputChangeRef) {
    inputEl.removeEventListener('change', onInputChangeRef);
  }

  if (previewEl && onPreviewClickRef) {
    previewEl.removeEventListener('click', onPreviewClickRef);
  }

  // PT: remove listener do evento global de limpeza
  // EN: remove global clear event listener
  if (onClearRequestRef) {
    window.removeEventListener('feedback:photo:clear-request', onClearRequestRef);
  }

  // PT: remove handlers do botão X do input (limpar seleção)
  // EN: remove input clear (X) button handlers
  detachInputClearButtonHandlers();

  // Limpa refs
  inputClearBtnEl = null;
  onInputClearClickRef = null;
  onInputClearKeydownRef = null;

  onClearRequestRef = null;

  revokeCurrentObjectUrl();

  inputEl = null;
  labelEl = null;
  previewEl = null;

  onInputChangeRef = null;
  onPreviewClickRef = null;

  isAttached = false;
}

// ------------------------------
// Export pattern (project standard)
// Ordem de uso: attach → clear → detach
// ------------------------------

export const DaphnePhotoUI = {
  attachPhotoUI,
  clearPhotoUI,
  detachPhotoUI,
};
