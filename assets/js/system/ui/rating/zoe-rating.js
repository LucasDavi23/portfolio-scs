// ------------------------------------------------------------
// Zoe — Rating UI (System)
// Nível: Adulta
// ------------------------------------------------------------
// PT: UI atom de estrelas (display) + base pronta para input no form.
// EN: Rating stars UI atom (display) + base ready for future form input.
// ------------------------------------------------------------

/**
 * PT: Normaliza rating (aceita número, string "4.7" ou "4,7", null etc.)
 * EN: Normalize rating (number, "4.7" or "4,7" string, null-safe)
 */
function normalizeRating(value, max = 5) {
  const raw = typeof value === 'string' ? value.replace(',', '.') : value;
  const n = Number(raw);

  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(n, max));
}

/**
 * PT: Render de estrelas estilo Shopee:
 *     - Sempre mostra 5 estrelas
 *     - Preenche proporcionalmente (média quebrada funciona)
 * EN: Shopee-like stars:
 *     - Always shows 5 stars
 *     - Proportional fill (fractional averages supported)
 */
function renderRating(value = 0, opts = {}) {
  const {
    max = 5,
    showValue = true,
    // PT: classes para encaixar no teu Tailwind atual / EN: Tailwind hooks
    wrapClass = 'inline-flex items-center gap-1',
    // PT: tamanho semântico do rating / EN: semantic size
    size = 'sm',
    emptyClass = 'text-neutral-300',
    filledClass = 'text-yellow-500',
    valueClass = 'text-neutral-800 font-semibold text-sm',
    // PT: se quiser trocar o símbolo depois / EN: easy swap later
    symbol = '★★★★★',
  } = opts;

  // PT: mapa de tamanhos / EN: size map
  const SIZE_MAP = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.sm;

  const val = normalizeRating(value, max);
  const pct = (val / max) * 100;

  return `
    <span class="${wrapClass}" aria-label="${val.toFixed(1)} de ${max} estrelas">
      <span class="relative inline-block leading-none ${sizeClass}">
        <span class="${emptyClass}">${symbol}</span>
        <span class="absolute left-0 top-0 overflow-hidden ${filledClass}" style="width:${pct}%">
          ${symbol}
        </span>
      </span>
      ${showValue ? `<span class="${valueClass}">${val.toFixed(1)}</span>` : ''}
    </span>
  `.trim();
}

/**
 * PT: Base para futuro rating input (form) — ainda não implementado.
 * EN: Base for future rating input (form) — not implemented yet.
 */
function mountRatingInput(/* rootEl, options */) {
  console.warn('ZoeRating.mountRatingInput: ainda não implementado.');
}

// ------------------------------------------------------------
// API Pública (padrão do System: export const Persona = { ... })
// ------------------------------------------------------------
export const ZoeRating = {
  normalizeRating,
  renderRating,
  mountRatingInput,
};
