// 🧠 Sofia — Form Validation and UX State
//
// Nível / Level: Jovem / Young
//
// PT: Responsável pela validação básica de UX do formulário e pelo estado
//     visual durante o preenchimento e envio.
//     Coleta valores dos inputs, valida regras simples, exibe status,
//     trava ou destrava o botão de envio e marca ou limpa erros de campo
//     sem exigir alterações no HTML.
//     Não processa imagem, não controla UI de foto, não controla UI de estrelas,
//     não emite eventos e não chama API.
//
// EN: Responsible for basic form UX validation and visual state
//     during input and submission.
//     Collects input values, validates simple rules, displays status,
//     locks or unlocks the submit button, and marks or clears field errors
//     without requiring HTML changes.
//     Does not process images, does not control photo UI, does not control rating UI,
//     does not emit events, and does not call APIs.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Internal State
/* -----------------------------------------------------------------------------*/

const documentRoot = document;

let autoClearAttached = false;

/* -----------------------------------------------------------------------------*/
// Internal Elements Map
//
// PT: Mapa centralizado dos elementos usados pela Sofia.
// EN: Centralized map of elements used by Sofia.
/* -----------------------------------------------------------------------------*/

const elements = {
  form: documentRoot.querySelector('#feedback-form'),
  ratingGroup: documentRoot.querySelector('#rating-group'),
  ratingHidden: documentRoot.querySelector('#rating'),

  nameInput: documentRoot.querySelector('#nameInput'),
  commentInput: documentRoot.querySelector('#commentInput'),
  contactInput: documentRoot.querySelector('#contactInput'),

  honeypotInput: documentRoot.querySelector('#honeypot'),
  photoInput: documentRoot.querySelector('#photo'),
  submitButton: documentRoot.querySelector('#btn-submit'),
  statusElement: documentRoot.querySelector('#form-status'),
};

/* -----------------------------------------------------------------------------*/
// Data Collection
//
// PT: Coleta valores do formulário em nível de UX.
// EN: Collects form values at UX level.
/* -----------------------------------------------------------------------------*/

// PT: Coleta e normaliza os valores atuais do formulário.
// EN: Collects and normalizes the current form values.
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

/* -----------------------------------------------------------------------------*/
// Basic Validation
//
// PT: Valida regras básicas do formulário.
// EN: Validates basic form rules.
/* -----------------------------------------------------------------------------*/

// PT: Valida regras simples de UX e retorna resultado padronizado.
// EN: Validates simple UX rules and returns a standardized result.
function validateBasicRules(values) {
  // PT: Honeypot preenchido indica possível bot.
  // EN: Filled honeypot indicates a likely bot.
  if (values.honeypot) {
    return {
      ok: false,
      message: 'Validação falhou (possível bot).',
      field: 'honeypot',
    };
  }

  // PT: Rating deve estar entre 1 e 5.
  // EN: Rating must be between 1 and 5.
  const ratingNumber = Number(values.rating);

  if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    return {
      ok: false,
      message: 'Por favor, escolha uma avaliação (1 a 5 estrelas).',
      field: 'rating',
    };
  }

  // PT: Nome mínimo para evitar entradas inválidas.
  // EN: Minimum name length to avoid invalid input.
  if (values.name.length < 4) {
    return {
      ok: false,
      message: 'Por favor, insira um nome válido (mínimo de 4 caracteres).',
      field: 'name',
    };
  }

  // PT: Comentário com limites básicos de UX.
  // EN: Comment with basic UX limits.
  if (values.comment.length < 20 || values.comment.length > 600) {
    return {
      ok: false,
      message: 'Por favor, insira um comentário entre 20 e 600 caracteres.',
      field: 'comment',
    };
  }

  return { ok: true, message: '' };
}

/* -----------------------------------------------------------------------------*/
// Form Status
//
// PT: Controla a mensagem e o tipo visual do status do formulário.
// EN: Controls the form status message and visual type.
/* -----------------------------------------------------------------------------*/

// PT: Exibe mensagem de status com tipo visual.
// EN: Displays a status message with visual type.
function showFormStatus(message, type = 'info') {
  if (!elements.statusElement) return;

  elements.statusElement.textContent = message;
  elements.statusElement.dataset.type = type;
}

// PT: Limpa o status visual do formulário.
// EN: Clears the form visual status.
function clearFormStatus() {
  if (!elements.statusElement) return;

  elements.statusElement.textContent = '';
  delete elements.statusElement.dataset.type;
}

/* -----------------------------------------------------------------------------*/
// Submit Button State
//
// PT: Controla o estado visual e interativo do botão de envio.
// EN: Controls the visual and interactive state of the submit button.
/* -----------------------------------------------------------------------------*/

// PT: Trava ou destrava o botão de envio.
// EN: Locks or unlocks the submit button.
function lockSubmit(isLocked) {
  if (!elements.submitButton) return;

  const locked = Boolean(isLocked);

  elements.submitButton.disabled = locked;
  elements.submitButton.setAttribute('aria-busy', locked ? 'true' : 'false');
  elements.submitButton.textContent = locked ? 'Enviando…' : 'Enviar';
}

/* -----------------------------------------------------------------------------*/
// Field Mapping
//
// PT: Resolve o elemento visual correspondente a um campo lógico.
// EN: Resolves the visual element corresponding to a logical field.
/* -----------------------------------------------------------------------------*/

// PT: Retorna o elemento relacionado ao campo informado.
// EN: Returns the element related to the provided field.
function getFieldElement(field) {
  switch (field) {
    case 'rating':
      // PT: Rating não possui input visível direto.
      // EN: Rating does not have a direct visible input.
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

/* -----------------------------------------------------------------------------*/
// Form UI Reset
//
// PT: Limpa estado visual e campos com erro no formulário.
// EN: Clears visual state and errored fields in the form.
/* -----------------------------------------------------------------------------*/

// PT: Reseta a UI do formulário.
// EN: Resets the form UI.
function resetFormUI() {
  // PT: Reseta os valores do formulário.
  // EN: Resets form values.
  elements.form?.reset();

  clearFormStatus();

  clearFieldError(elements.nameInput);
  clearFieldError(elements.commentInput);
  clearFieldError(elements.contactInput);
  clearRatingError();
}

/* -----------------------------------------------------------------------------*/
// Focus and Scroll Helpers
//
// PT: Controla foco e rolagem até campos com erro dentro do modal.
// EN: Controls focus and scrolling to errored fields inside the modal.
/* -----------------------------------------------------------------------------*/

// PT: Verifica se um elemento possui rolagem vertical útil.
// EN: Checks whether an element has usable vertical scrolling.
function isScrollableY(element) {
  if (!element) return false;

  const styles = window.getComputedStyle(element);
  const overflowY = styles.overflowY;

  return (
    (overflowY === 'auto' || overflowY === 'scroll') &&
    element.scrollHeight > element.clientHeight + 1
  );
}

// PT: Retorna o container raiz do modal.
// EN: Returns the modal root container.
function getModalRoot() {
  return document.getElementById('feedback-modal');
}

// PT: Retorna o elemento de diálogo do modal.
// EN: Returns the modal dialog element.
function getDialogElement() {
  return document.querySelector('#feedback-modal [role="dialog"]');
}

// PT: Calcula o offset do cabeçalho do modal.
// EN: Computes the modal header offset.
function getHeaderOffset(dialogElement) {
  const headerElement = dialogElement?.querySelector('[data-modal-header]');
  const headerHeight = headerElement ? headerElement.getBoundingClientRect().height : 0;

  return headerHeight + 12;
}

// PT: Encontra o container realmente rolável do target até o modal.
// EN: Finds the truly scrollable container from the target up to the modal.
function findScrollParentWithinModal(targetElement) {
  const modalRoot = getModalRoot();
  if (!modalRoot || !targetElement) return null;

  let currentElement = targetElement.parentElement;

  while (currentElement && currentElement !== modalRoot) {
    if (isScrollableY(currentElement)) return currentElement;
    currentElement = currentElement.parentElement;
  }

  const dialogElement = getDialogElement();
  if (isScrollableY(dialogElement)) return dialogElement;

  return null;
}

// PT: Força a rolagem do container até o target.
// EN: Forces container scrolling to the target.
function forceScrollTo(containerElement, dialogElement, targetElement) {
  if (!containerElement || !dialogElement || !targetElement) return;

  const containerRect = containerElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  const topInsideContainer = targetRect.top - containerRect.top + containerElement.scrollTop;

  const targetTop = Math.max(0, topInsideContainer - getHeaderOffset(dialogElement));

  containerElement.scrollTop = targetTop;

  requestAnimationFrame(() => {
    containerElement.scrollTop = targetTop;
  });
}

// PT: Rola até o campo informado dentro do modal.
// EN: Scrolls to the provided field inside the modal.
function scrollToField(field) {
  const dialogElement = getDialogElement();
  const targetElement = field === 'rating' ? elements.ratingGroup : getFieldElement(field);

  if (!dialogElement || !targetElement) return;

  const containerElement = findScrollParentWithinModal(targetElement);
  if (!containerElement) return;

  forceScrollTo(containerElement, dialogElement, targetElement);
}

// PT: Aplica foco ao campo informado.
// EN: Focuses the provided field.
function focusField(field) {
  if (field === 'rating') {
    elements.ratingGroup?.setAttribute('tabindex', '-1');
    elements.ratingGroup?.focus?.({ preventScroll: true });
    return;
  }

  const fieldElement = getFieldElement(field);
  fieldElement?.focus?.({ preventScroll: true });
}

/* -----------------------------------------------------------------------------*/
// Field Error UI
//
// PT: Marca e limpa erros visuais dos campos sem depender de HTML extra.
// EN: Marks and clears visual field errors without depending on extra HTML.
/* -----------------------------------------------------------------------------*/

// PT: Marca erro visual em um campo.
// EN: Marks visual error on a field.
function markFieldError(inputElement, message) {
  if (!inputElement) return;

  inputElement.classList.add('border-red-500', 'ring-1', 'ring-red-400', 'focus:ring-red-400');
  inputElement.setAttribute('aria-invalid', 'true');

  const hintId =
    inputElement.dataset.errId || `err_${inputElement.id || Math.random().toString(16).slice(2)}`;

  inputElement.dataset.errId = hintId;

  let hintElement = documentRoot.getElementById(hintId);

  if (!hintElement) {
    hintElement = documentRoot.createElement('p');
    hintElement.id = hintId;
    hintElement.className = 'hint-error mt-1 text-xs text-red-600';
    inputElement.insertAdjacentElement('afterend', hintElement);
  }

  hintElement.textContent = message;
}

// PT: Marca erro visual no grupo de rating.
// EN: Marks visual error on the rating group.
function markRatingError(message) {
  const ratingWrapper = elements.ratingGroup;
  if (!ratingWrapper) return;

  ratingWrapper.classList.add('ring-2', 'ring-red-400', 'rounded-md');
  ratingWrapper.setAttribute('aria-invalid', 'true');

  const hintId = 'rating-error-hint';
  let hintElement = documentRoot.getElementById(hintId);

  if (!hintElement) {
    hintElement = documentRoot.createElement('p');
    hintElement.id = hintId;
    hintElement.className = 'hint-error mt-1 text-xs text-red-600';
    ratingWrapper.insertAdjacentElement('afterend', hintElement);
  }

  hintElement.textContent = message;
}

// PT: Limpa erro visual do grupo de rating.
// EN: Clears visual error from the rating group.
function clearRatingError() {
  const ratingWrapper = elements.ratingGroup;
  if (!ratingWrapper) return;

  ratingWrapper.classList.remove('ring-2', 'ring-red-400', 'rounded-md');
  ratingWrapper.removeAttribute('aria-invalid');

  const hintElement = documentRoot.getElementById('rating-error-hint');
  if (hintElement) {
    hintElement.remove();
  }
}

// PT: Limpa erro visual de um campo.
// EN: Clears visual error from a field.
function clearFieldError(inputElement) {
  if (!inputElement) return;

  inputElement.classList.remove('border-red-500', 'ring-1', 'ring-red-400', 'focus:ring-red-400');
  inputElement.removeAttribute('aria-invalid');

  const hintId = inputElement.dataset.errId;
  if (!hintId) return;

  const hintElement = documentRoot.getElementById(hintId);
  if (hintElement) {
    hintElement.remove();
  }

  delete inputElement.dataset.errId;
}

/* -----------------------------------------------------------------------------*/
// Auto Clear Field Errors
//
// PT: Limpa erros automaticamente quando o usuário interage novamente.
// EN: Clears errors automatically when the user interacts again.
/* -----------------------------------------------------------------------------*/

// PT: Anexa limpeza automática de erros aos campos.
// EN: Attaches automatic error clearing to the fields.
function attachAutoClearFieldErrors() {
  if (autoClearAttached) {
    return;
  }

  autoClearAttached = true;

  const bindAutoClear = (element) => {
    if (!element) return;

    element.addEventListener('input', () => clearFieldError(element));
    element.addEventListener('blur', () => clearFieldError(element));
  };

  bindAutoClear(elements.nameInput);
  bindAutoClear(elements.commentInput);
  bindAutoClear(elements.contactInput);

  if (elements.ratingGroup) {
    elements.ratingGroup.addEventListener('click', clearRatingError);
    elements.ratingGroup.addEventListener('change', clearRatingError);
  }
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

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
