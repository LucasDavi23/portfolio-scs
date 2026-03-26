// ⭐ Zoe — Rating UI
//
// Nível / Level: Adulta / Adult
//
// PT: Renderiza estrelas de avaliação e prepara base para input.
// EN: Renders rating stars and prepares base for input.

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares do rating.
// EN: Rating helper functions.
/* -----------------------------------------------------------------------------*/

// PT: Normaliza o valor do rating.
// EN: Normalizes rating value.
function normalizeRating(value, max = 5) {
  const raw = typeof value === 'string' ? value.replace(',', '.') : value;
  const n = Number(raw);

  if (!Number.isFinite(n)) return 0;

  return Math.max(0, Math.min(n, max));
}

/* -----------------------------------------------------------------------------*/
// Render
//
// PT: Gera o HTML do rating com preenchimento proporcional.
// EN: Generates rating HTML with proportional fill.
/* -----------------------------------------------------------------------------*/

// PT: Renderiza estrelas no estilo proporcional.
// EN: Renders stars with proportional fill.
function renderRating(value = 0, options = {}) {
  const {
    max = 5,
    showValue = true,
    wrapClass = 'inline-flex items-center gap-1',
    size = 'sm',
    emptyClass = 'text-neutral-300',
    filledClass = 'text-yellow-500',
    valueClass = 'text-neutral-800 font-semibold text-sm',
    symbol = '★★★★★',
  } = options;

  const SIZE_MAP = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  const sizeClass = SIZE_MAP[size] || (typeof size === 'string' ? size : SIZE_MAP.sm);

  const normalizedValue = normalizeRating(value, max);
  const percentage = (normalizedValue / max) * 100;

  return `
    <span class="${wrapClass}" aria-label="${normalizedValue.toFixed(1)} de ${max} estrelas">
      <span class="relative inline-block leading-none ${sizeClass}">
        <span class="${emptyClass}">${symbol}</span>
        <span class="absolute left-0 top-0 overflow-hidden ${filledClass}" style="width:${percentage}%">
          ${symbol}
        </span>
      </span>
      ${showValue ? `<span class="${valueClass}">${normalizedValue.toFixed(1)}</span>` : ''}
    </span>
  `.trim();
}

/* -----------------------------------------------------------------------------*/
// Input (Future)
//
// PT: Base para input de rating (não implementado).
// EN: Base for rating input (not implemented).
/* -----------------------------------------------------------------------------*/

// PT: Inicializa input de rating.
// EN: Initializes rating input.
function mountRatingInput(/* rootEl, options */) {
  console.warn('ZoeRating.mountRatingInput: ainda não implementado.');
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const ZoeRating = {
  normalizeRating,
  renderRating,
  mountRatingInput,
};
