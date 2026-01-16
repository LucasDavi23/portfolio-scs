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

const dom = document;

const elements = {
  form: dom.querySelector('#feedback-form'),
  ratingHidden: dom.querySelector('#rating'),
  nameInput: dom.querySelector('#nome'),
  commentInput: dom.querySelector('#comentario'),
  contactInput: dom.querySelector('#contato'),
  honeypotInput: dom.querySelector('#honeypot'),
  photoInput: dom.querySelector('#foto'),
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
    return { ok: false, message: 'Validation failed (possible bot).' };
  }

  // PT: Nota obrigatória (Ayla preenche hidden, Sofia só confere)
  // EN: Rating required (Ayla fills hidden, Sofia only checks)
  if (!values.rating) {
    return { ok: false, message: 'Please choose a rating (stars).' };
  }

  // PT: Nome mínimo para evitar lixo
  // EN: Minimum name length to avoid junk input
  if (values.name.length < 4) {
    return { ok: false, message: 'Please enter a valid name (min 4 chars).' };
  }

  // PT: Comentário com limites básicos de UX
  // EN: Comment with basic UX limits
  if (values.comment.length < 20 || values.comment.length > 600) {
    return {
      ok: false,
      message: 'Comment must be between 20 and 600 characters.',
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
  elements.submitButton.textContent = locked ? 'Sending…' : 'Send';
}

// ------------------------------
// Field error UI (no HTML changes required)
// ------------------------------

function markFieldError(inputEl, message) {
  if (!inputEl) return;

  inputEl.classList.add('border-red-500', 'ring-1', 'ring-red-400', 'focus:ring-red-400');
  inputEl.setAttribute('aria-invalid', 'true');

  let hint = inputEl.parentElement?.querySelector('.hint-error');
  if (!hint && inputEl.parentElement) {
    hint = dom.createElement('p');
    hint.className = 'hint-error mt-1 text-xs text-red-600';
    inputEl.parentElement.appendChild(hint);
  }

  if (hint) hint.textContent = message;
}

function clearFieldError(inputEl) {
  if (!inputEl) return;

  inputEl.classList.remove('border-red-500', 'ring-1', 'ring-red-400', 'focus:ring-red-400');
  inputEl.removeAttribute('aria-invalid');

  const hint = inputEl.parentElement?.querySelector('.hint-error');
  if (hint) hint.remove();
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
  markFieldError,
  clearFieldError,
};
