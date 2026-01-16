// ==================================================
// 📣 Nysa — Feedback Event Messenger
//
// Nível: Jovem
//
// File: nysa-feedback-events.js
//
// PT: Emite eventos internos relacionados ao feedback.
//     Nysa padroniza o formato do evento "feedback:novo",
//     garantindo que outras partes do sistema (Hero/Board/etc.)
//     recebam um payload consistente.
//     Ela não valida domínio, não toca UI e não chama API — apenas emite.
//
// EN: Emits internal feedback-related events.
//     Nysa standardizes the "feedback:novo" event format,
//     ensuring other parts of the system (Hero/Board/etc.)
//     receive a consistent payload.
//     She does not validate domain, does not touch UI, and does not call APIs — only emits.
// ==================================================

/**
 * PT: Nome do evento público (compatível com o legado).
 * EN: Public event name (legacy-compatible).
 */
const EVENT_NAME = 'feedback:novo';

/**
 * PT: Monta o formato padrão de "avaliacao" para o Hero/Board.
 * EN: Builds the standard "avaliacao" shape for Hero/Board.
 */
function buildEvaluation({
  platform = 'scs',
  rating = 0,
  author = '',
  text = '',
  url = '',
  approved = true,
  featured = false,
  dateISO = new Date().toISOString(),
} = {}) {
  return {
    plataforma: platform,
    estrelas: Number(rating) || 0,
    data: dateISO,
    autor: author,
    texto: text,
    url,
    aprovado: !!approved,
    destaque: !!featured,
  };
}

/**
 * PT: Emite o evento "feedback:novo" com o formato esperado.
 * EN: Emits the "feedback:novo" event with the expected format.
 *
 * @param {Object} args
 * @param {Object} args.evaluation - shape used by Hero/Board
 * @param {Object|null} args.item - optional server-returned item
 * @param {Window|EventTarget} args.target - where to dispatch (default: window)
 */
function emitNewFeedback({ evaluation, item = null, target = window } = {}) {
  if (!target?.dispatchEvent) return false;

  const detail = {
    avaliacao: evaluation || buildEvaluation(),
    item: item ?? null,
  };

  target.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
  return true;
}

/**
 * PT: Atalho específico para o caso SCS (compatível com o core legado).
 * EN: Shortcut specifically for the SCS case (legacy-compatible).
 */
function emitNewScsFeedback({
  rating = 0,
  name = '',
  comment = '',
  photoPublicUrl = '',
  photoUrl = '',
  item = null,
  target = window,
} = {}) {
  const preferredUrl = photoPublicUrl || photoUrl || '';

  const evaluation = buildEvaluation({
    platform: 'scs',
    rating,
    author: name,
    text: comment,
    url: preferredUrl,
    approved: true,
    featured: false,
    dateISO: new Date().toISOString(),
  });

  return emitNewFeedback({ evaluation, item, target });
}

/**
 * Public contract
 */
export const NysaFeedbackEvents = {
  EVENT_NAME,
  buildEvaluation,
  emitNewFeedback,
  emitNewScsFeedback,
};
