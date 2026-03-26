/* -----------------------------------------------------------------------------*/
// ⭐ Ayla — Form Rating UI Specialist
//
// Nível / Level: Aprendiz / Junior
//
// PT: Controla a interface de avaliação por estrelas
//     dentro do formulário de feedback.
//     É responsável apenas pela interação visual:
//     clique, toggle das estrelas, sincronização com
//     input oculto, badge de status e reset visual.
//     Não calcula regras de domínio, não emite eventos
//     e não executa envio — UI apenas.
//
// EN: Controls the star-based rating interface
//     inside the feedback form.
//     Responsible only for visual interaction:
//     click handling, star toggling, hidden input
//     synchronization, status badge and visual reset.
//     Does not calculate domain rules, emit events,
//     or submit data — UI only.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/
// (nenhum necessário / none needed)

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Estado interno e funções auxiliares da UI de estrelas.
// EN: Internal state and helper functions for stars UI.
/* -----------------------------------------------------------------------------*/

let groupElement = null;
let radioElements = [];
let labelElements = [];
let hiddenInputElement = null;
let badgeElement = null;

let isAttached = false;

let labelClickHandlers = [];
let radioChangeHandlers = [];

// PT: Pinta as estrelas ativas conforme a quantidade selecionada.
// EN: Paints active stars according to the selected quantity.
function paintStars(quantity) {
  labelElements.forEach((labelElement, index) => {
    labelElement.classList.toggle('star--ativa', index < quantity);
  });
}

// PT: Atualiza o badge com o valor atual da avaliação.
// EN: Updates the badge with the current rating value.
function updateBadge(quantity) {
  if (!badgeElement) {
    return;
  }

  if (quantity > 0) {
    badgeElement.textContent = `${quantity}/5`;
    badgeElement.classList.remove('hidden');
  } else {
    badgeElement.classList.add('hidden');
  }
}

// PT: Lê o valor atual da avaliação no input oculto.
// EN: Reads the current rating value from the hidden input.
function getCurrentRatingValue() {
  return parseInt(hiddenInputElement?.value || '0', 10) || 0;
}

// PT: Aplica o valor da avaliação e sincroniza radios, estrelas e badge.
// EN: Applies the rating value and syncs radios, stars and badge.
function applyRatingValue(quantity) {
  const normalizedValue = Number(quantity) || 0;

  const selectedRadio = radioElements.find((radioElement) => {
    return parseInt(radioElement.value, 10) === normalizedValue;
  });

  if (selectedRadio) {
    selectedRadio.checked = true;
  }

  if (hiddenInputElement) {
    hiddenInputElement.value = String(normalizedValue);
  }

  paintStars(normalizedValue);
  updateBadge(normalizedValue);
}

// PT: Limpa completamente a avaliação visual e o input oculto.
// EN: Fully clears the visual rating and the hidden input.
function clearRatingValue() {
  radioElements.forEach((radioElement) => {
    radioElement.checked = false;
  });

  if (hiddenInputElement) {
    hiddenInputElement.value = '';
  }

  paintStars(0);
  updateBadge(0);
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Anexa a UI de estrelas ao formulário.
// EN: Attaches the stars UI to the form.
function attachStarsUI(options = {}) {
  if (isAttached) {
    return;
  }

  const {
    groupId = 'rating-group',
    radioName = 'rating_star',
    hiddenInputId = 'rating',
    badgeId = 'rating-badge',
  } = options;

  groupElement = document.getElementById(groupId);

  if (!groupElement) {
    return;
  }

  radioElements = Array.from(document.querySelectorAll(`input[name="${radioName}"]`));

  labelElements = Array.from(groupElement.querySelectorAll('label.star, label'));

  hiddenInputElement = document.getElementById(hiddenInputId);
  badgeElement = document.getElementById(badgeId);

  labelClickHandlers = labelElements.map((labelElement) => {
    const handler = (event) => {
      event.preventDefault();

      const forId = labelElement.getAttribute('for');
      const relatedRadio = forId ? document.getElementById(forId) : null;

      const clickedValue = relatedRadio ? parseInt(relatedRadio.value, 10) : 0;

      const currentValue = getCurrentRatingValue();

      if (clickedValue === currentValue) {
        clearRatingValue();
      } else {
        applyRatingValue(clickedValue);
      }
    };

    labelElement.addEventListener('click', handler);
    return handler;
  });

  radioChangeHandlers = radioElements.map((radioElement) => {
    const handler = () => {
      applyRatingValue(parseInt(radioElement.value, 10));
    };

    radioElement.addEventListener('change', handler);
    return handler;
  });

  const preCheckedRadio = radioElements.find((radioElement) => radioElement.checked);

  applyRatingValue(preCheckedRadio ? parseInt(preCheckedRadio.value, 10) : 0);

  isAttached = true;
}

// PT: Remove listeners e limpa as referências internas.
// EN: Removes listeners and clears internal references.
function detachStarsUI() {
  if (!isAttached) {
    return;
  }

  labelElements.forEach((labelElement, index) => {
    const handler = labelClickHandlers[index];

    if (handler) {
      labelElement.removeEventListener('click', handler);
    }
  });

  radioElements.forEach((radioElement, index) => {
    const handler = radioChangeHandlers[index];

    if (handler) {
      radioElement.removeEventListener('change', handler);
    }
  });

  groupElement = null;
  radioElements = [];
  labelElements = [];
  hiddenInputElement = null;
  badgeElement = null;

  labelClickHandlers = [];
  radioChangeHandlers = [];

  isAttached = false;
}

// PT: Define o valor da avaliação e sincroniza a UI.
// EN: Sets the rating value and syncs the UI.
function setStarsValue(value) {
  applyRatingValue(value);
}

// PT: Retorna o valor atual da avaliação.
// EN: Returns the current rating value.
function getStarsValue() {
  return getCurrentRatingValue();
}

// PT: Limpa a avaliação selecionada.
// EN: Clears the selected rating.
function clearStarsUI() {
  clearRatingValue();
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const AylaRatingStarsUI = {
  attachStarsUI,
  setStarsValue,
  getStarsValue,
  clearStarsUI,
  detachStarsUI,
};
