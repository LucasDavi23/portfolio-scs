// /assets/js/feedback/board/avatar/livia-avatar-ui.js
// 🌷 Lívia — UI do Avatar
// PT: Responsável pela camada visual do avatar: criação do wrap, estilo e atualização das iniciais.
// EN: Handles the visual layer of the avatar: wrap creation, styling and initials updates.
/* -----------------------------------------------------------------------------*/

// 🌷 Helena — lógica de avatar
// EN 🌷 Helena — avatar logic
import { getInitials } from '/assets/js/feedback/board/avatar/helena-avatar-helpers.js';

export function attachAvatarToAuthor(card) {
  const nameEl = card.querySelector('.meta-row [data-c-autor]');
  if (!nameEl) return;

  // evita duplicação
  if (nameEl.parentElement?.classList.contains('author-wrap')) return;

  const wrap = document.createElement('div');
  wrap.className = 'author-wrap';

  const avatar = document.createElement('span');
  avatar.className = 'avatar-iniciais';
  avatar.setAttribute('aria-hidden', 'true');

  nameEl.parentNode.insertBefore(wrap, nameEl);
  wrap.appendChild(avatar);
  wrap.appendChild(nameEl);

  // atualiza iniciais
  const update = () => {
    const txt = (nameEl.textContent || '').trim();
    avatar.textContent = getInitials(txt);
  };

  const mo = new MutationObserver(update);
  mo.observe(nameEl, { childList: true, characterData: true, subtree: true });

  update();
}

// inicialização automática
export function initAvatar() {
  document
    .querySelectorAll('section[data-feedback-card][data-variant="media"]')
    .forEach(attachAvatarToAuthor);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAvatar);
} else {
  initAvatar();
}
