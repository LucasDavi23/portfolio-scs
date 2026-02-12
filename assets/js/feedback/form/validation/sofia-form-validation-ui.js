// ==================================================
// 🧠 Sofia — Form Validation & UX State Specialist
//
// Nível: Jovem
//
// File: sofia-form-validation-ui.js
//
// PT: Sofia cuida da validação básica de UX do formulário e do estado visual
//     durante o preenchimento/envio. Ela:
//     - coleta valores dos inputs (trim)
//     - valida regras simples (honeypot, obrigatórios, limites de texto)
//     - exibe status (info/success/error) via data-attribute
//     - trava/destrava o botão de envio (aria-busy + texto)
//     - marca/limpa erro de campo sem exigir mudanças no HTML
//
//     Sofia não processa imagem (Athena), não controla UI de foto (Daphne),
//     não controla UI de estrelas (Ayla), não emite eventos e não chama API/Flow.
//
// EN: Sofia handles basic UX validation and the visual state of the form
//     during input and submission. She:
//     - collects input values (trim)
//     - validates simple rules (honeypot, required fields, text limits)
//     - displays status (info/success/error) via data-attribute
//     - locks/unlocks the submit button (aria-busy + label text)
//     - marks/clears field errors without requiring HTML changes
//
//     Sofia does not process images (Athena), does not handle photo UI (Daphne),
//     does not handle rating UI (Ayla), does not emit events and does not call API/Flow.
// ==================================================

// ------------------------------
// Internal element map
// ------------------------------

// Logger — System Observability Layer
// Provides logging capabilities for debugging and monitoring.
// Provides:
//  - Logger.debug()
//  - Logger.info()
//  - Logger.warn()
//  - Logger.error()
import { Logger } from '/assets/js/system/core/logger.js';

const dom = document;

let autoClearAttached = false;

const elements = {
  form: dom.querySelector('#feedback-form'),
  ratingGroup: dom.querySelector('#rating-group'),
  ratingHidden: dom.querySelector('#rating'),

  nameInput: dom.querySelector('#nameInput'),
  commentInput: dom.querySelector('#commentInput'),
  contactInput: dom.querySelector('#contactInput'),

  honeypotInput: dom.querySelector('#honeypot'),
  photoInput: dom.querySelector('#photo'),
  submitButton: dom.querySelector('#btn-submit'),
  statusEl: dom.querySelector('#form-status'),
};

// ------------------------------
// Data collection (UX-level)
// ------------------------------

function collectFormValues() {
  return {
    rating: String(elements.ratingHidden?.value || '').trim(),
    name: String(elements.nameInput?.value || '').trim(),
    comment: String(elements.commentInput?.value || '').trim(),
    contact: String(elements.contactInput?.value || '').trim(),
    honeypot: String(elements.honeypotInput?.value || '').trim(),
    file: elements.photoInput?.files?.[0] || null,
  };
}

// ------------------------------
// Basic UX validation
// Returns: { ok: boolean, message: string }
// ------------------------------

function validateBasicRules(values) {
  // PT: Honeypot preenchido → provável bot
  // EN: Filled honeypot → likely bot
  if (values.honeypot) {
    return { ok: false, message: 'Validação falhou (possível bot).', field: 'honeypot' };
  }

  // PT: Rating deve ser 1..5 (FormData vem string)
  // EN: Rating must be 1..5 (FormData comes as string)
  const ratingNum = Number(values.rating);

  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return {
      ok: false,
      message: 'Por favor, escolha uma avaliação (1 a 5 estrelas).',
      field: 'rating',
    };
  }

  // PT: Nome mínimo para evitar lixo
  // EN: Minimum name length to avoid junk input
  if (values.name.length < 4) {
    return {
      ok: false,
      message: 'Por favor, insira um nome válido (mínimo de 4 caracteres).',
      field: 'name',
    };
  }

  // PT: Comentário com limites básicos de UX
  // EN: Comment with basic UX limits
  if (values.comment.length < 20 || values.comment.length > 600) {
    return {
      ok: false,
      message: 'Por favor, insira um comentário entre 20 e 600 caracteres.',
      field: 'comment',
    };
  }

  return { ok: true, message: '' };
}

// ------------------------------
// UX status (message + type)
// type: "info" | "success" | "error"
// ------------------------------

function showFormStatus(message, type = 'info') {
  if (!elements.statusEl) return;
  elements.statusEl.textContent = message;
  elements.statusEl.dataset.type = type; // style via [data-type="..."]
}

// ------------------------------
// Submit button lock/unlock
// ------------------------------

function lockSubmit(isLocked) {
  if (!elements.submitButton) return;

  const locked = !!isLocked;
  elements.submitButton.disabled = locked;
  elements.submitButton.setAttribute('aria-busy', locked ? 'true' : 'false');
  elements.submitButton.textContent = locked ? 'Enviando…' : 'Enviar';
}

function getFieldElement(field) {
  switch (field) {
    case 'rating':
      // PT: rating não é input visível, então retornamos null
      // EN: rating isn't a visible input, so return null
      return null;
    case 'name':
      return elements.nameInput;
    case 'comment':
      return elements.commentInput;
    case 'contact':
      return elements.contactInput;
    case 'honeypot':
      return elements.honeypotInput;
    default:
      return null;
  }
}

// ------------------------------
// Form UI reset (UX helper)
// ------------------------------

function clearFormStatus() {
  if (!elements.statusEl) return;
  elements.statusEl.textContent = '';
  delete elements.statusEl.dataset.type;
}

function resetFormUI() {
  // PT: reset do form (valores)
  // EN: form reset (values)
  elements.form?.reset();

  // PT/EN: clear toast/status
  clearFormStatus();

  // PT/EN: clear field errors
  clearFieldError(elements.nameInput);
  clearFieldError(elements.commentInput);
  clearFieldError(elements.contactInput);

  // PT/EN: clear rating visual error
  clearRatingError();
}

// ------------------------------
// Focus & Scroll UX Helpers
// ------------------------------

// ------------------------------
// Focus & Scroll UX Helpers
// ------------------------------

function isScrollableY(el) {
  if (!el) return false;
  const s = window.getComputedStyle(el);
  const oy = s.overflowY;
  return (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1;
}

function getModalRoot() {
  return document.getElementById('feedback-modal');
}

function getDialogEl() {
  return document.querySelector('#feedback-modal [role="dialog"]');
}

function getHeaderOffset(dialogEl) {
  const header = dialogEl?.querySelector('[data-modal-header]');
  const h = header ? header.getBoundingClientRect().height : 0;
  return h + 12; // respiro
}

// PT: acha o container rolável REAL subindo do target até o modal
// EN: finds the REAL scroll container going up from target to modal
function findScrollParentWithinModal(targetEl) {
  const modal = getModalRoot();
  if (!modal || !targetEl) return null;

  let el = targetEl.parentElement;
  while (el && el !== modal) {
    if (isScrollableY(el)) return el;
    el = el.parentElement;
  }

  // fallback: tenta dialog, se ele for scrollável
  const dialog = getDialogEl();
  if (isScrollableY(dialog)) return dialog;

  return null;
}

function forceScrollTo(containerEl, dialogEl, targetEl) {
  if (!containerEl || !dialogEl || !targetEl) return;

  const containerRect = containerEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  // posição do target dentro do container rolável
  const topInContainer = targetRect.top - containerRect.top + containerEl.scrollTop;
  const top = Math.max(0, topInContainer - getHeaderOffset(dialogEl));

  // FORÇA (sem smooth, mobile-friendly)
  containerEl.scrollTop = top;

  // reassert no próximo frame (alguns mobiles reancoram)
  requestAnimationFrame(() => {
    containerEl.scrollTop = top;
  });
}

function scrollToField(field) {
  const dialogEl = getDialogEl();
  const targetEl = field === 'rating' ? elements.ratingGroup : getFieldElement(field);
  if (!dialogEl || !targetEl) return;

  const containerEl = findScrollParentWithinModal(targetEl);
  if (!containerEl) return;

  // debug opcional (se quiser manter)
  // console.log('[Sofia scroll] container:', {
  //   overflowY: getComputedStyle(containerEl).overflowY,
  //   scrollTop: containerEl.scrollTop,
  //   scrollHeight: containerEl.scrollHeight,
  //   clientHeight: containerEl.clientHeight,
  // });

  forceScrollTo(containerEl, dialogEl, targetEl);
}

function focusField(field) {
  if (field === 'rating') {
    elements.ratingGroup?.setAttribute('tabindex', '-1');
    elements.ratingGroup?.focus?.({ preventScroll: true });
    return;
  }

  const el = getFieldElement(field);
  el?.focus?.({ preventScroll: true });
}

// ------------------------------
// Field error UI (no HTML changes required)
// ------------------------------

function markFieldError(inputEl, message) {
  if (!inputEl) return;

  inputEl.classList.add('border-red-500', 'ring-1', 'ring-red-400', 'focus:ring-red-400');
  inputEl.setAttribute('aria-invalid', 'true');

  // PT/EN: unique hint id tied to this input
  const hintId =
    inputEl.dataset.errId || `err_${inputEl.id || Math.random().toString(16).slice(2)}`;
  inputEl.dataset.errId = hintId;

  let hint = dom.getElementById(hintId);
  if (!hint) {
    hint = dom.createElement('p');
    hint.id = hintId;
    hint.className = 'hint-error mt-1 text-xs text-red-600';
    // PT/EN: insert right after the input (safe even with wrappers)
    inputEl.insertAdjacentElement('afterend', hint);
  }

  hint.textContent = message;
}

function markRatingError(message) {
  const wrapper = elements.ratingGroup;
  if (!wrapper) return;

  wrapper.classList.add('ring-2', 'ring-red-400', 'rounded-md');
  wrapper.setAttribute('aria-invalid', 'true');

  const hintId = 'rating-error-hint';
  let hint = dom.getElementById(hintId);
  if (!hint) {
    hint = dom.createElement('p');
    hint.id = hintId;
    hint.className = 'hint-error mt-1 text-xs text-red-600';
    wrapper.insertAdjacentElement('afterend', hint);
  }
  hint.textContent = message;
}

function clearRatingError() {
  const wrapper = elements.ratingGroup;
  if (!wrapper) return;

  wrapper.classList.remove('ring-2', 'ring-red-400', 'rounded-md');
  wrapper.removeAttribute('aria-invalid');

  const hint = dom.getElementById('rating-error-hint');
  if (hint) hint.remove();
}

function clearFieldError(inputEl) {
  if (!inputEl) return;

  inputEl.classList.remove('border-red-500', 'ring-1', 'ring-red-400', 'focus:ring-red-400');
  inputEl.removeAttribute('aria-invalid');

  const hintId = inputEl.dataset.errId;
  if (hintId) {
    const hint = dom.getElementById(hintId);
    if (hint) hint.remove();
    delete inputEl.dataset.errId;
  }
}

function attachAutoClearFieldErrors() {
  Logger.debug('sofia', 'attachAutoClearFieldErrors called');

  if (autoClearAttached) {
    autoClearAttached = true;
  }

  // PT: Limpa erro ao digitar/modificar campo
  // EN: Clears error on typing/modifying field
  const bind = (el) => {
    if (!el) return;
    el.addEventListener('input', () => clearFieldError(el));
    el.addEventListener('blur', () => clearFieldError(el));
  };

  bind(elements.nameInput);
  bind(elements.commentInput);
  bind(elements.contactInput);

  // PT/EN: Rating stars – clear visual error when user interacts
  if (elements.ratingGroup) {
    elements.ratingGroup.addEventListener('click', clearRatingError);
    elements.ratingGroup.addEventListener('change', clearRatingError);
  }
}

// ------------------------------
// Export pattern (project standard)
// Ordem de uso: collect → validate → status/lock → fieldErrors
// ------------------------------

export const SofiaFormValidationUI = {
  elements,
  collectFormValues,
  validateBasicRules,
  showFormStatus,
  lockSubmit,
  getFieldElement,
  clearFormStatus,
  resetFormUI,
  scrollToField,
  focusField,
  markFieldError,
  markRatingError,
  clearFieldError,
  clearRatingError,
  attachAutoClearFieldErrors,
};
