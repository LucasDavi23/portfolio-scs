// /assets/js/feedback/board/avatar/livia-avatar-ui.js
// 🌷 Lívia — UI do Avatar
// PT: Responsável pela camada visual do avatar: criação do wrap, estilo e atualização das iniciais.
// EN: Handles the visual layer of the avatar: wrap creation, styling and initials updates.
/* -----------------------------------------------------------------------------*/

// 🌷 Helena — lógica de avatar
// EN 🌷 Helena — avatar logic
// Fornece / Provides:
//   - getInitials()
/* -----------------------------------------------------------------------------*/
import { HelenaAvatarHelpers } from '/assets/js/feedback/board/avatar/helena-avatar-helpers.js';

export function attachAvatarToAuthor(card) {
  const nameEl = card.querySelector('.meta-row [data-c-autor]');
  if (!nameEl) return;

  // PT: Evita duplicação do wrapper.
  // EN: Avoids wrapper duplication.
  if (nameEl.parentElement?.classList.contains('author-wrap')) return;

  const wrap = document.createElement('div');
  wrap.className = 'author-wrap';

  const avatar = document.createElement('span');
  avatar.className = 'avatar-iniciais';
  avatar.setAttribute('aria-hidden', 'true');

  nameEl.parentNode.insertBefore(wrap, nameEl);
  wrap.appendChild(avatar);
  wrap.appendChild(nameEl);

  // PT: Atualiza iniciais baseado no texto do autor.
  // EN: Updates initials based on author text.
  const update = () => {
    const txt = (nameEl.textContent || '').trim();
    avatar.textContent = HelenaAvatarHelpers.getInitials(txt);
  };

  // PT: Observa mudanças no nome para manter iniciais corretas.
  // EN: Observes name changes to keep initials correct.
  const mo = new MutationObserver(update);
  mo.observe(nameEl, { childList: true, characterData: true, subtree: true });

  update();
}

/**
 * PT: Inicializa a UI de avatar para todos os cards do board.
 * EN: Initializes avatar UI for all board cards.
 */

export function initAvatar() {
  document
    .querySelectorAll('section[data-feedback-card][data-variant="media"]')
    // PT: Se já tem wrap, não reinjeta.
    // EN: If wrap already exists, do not reinject.
    .forEach(attachAvatarToAuthor);
}

/**
 * PT/EN: Export padrão da persona (sem autoexec).
 * A Kendra é quem chama initAvatar().
 */
export const LiviaAvatarUI = {
  attachAvatarToAuthor,
  initAvatar,
};
