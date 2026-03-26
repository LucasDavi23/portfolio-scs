// 🌷 Lívia — Avatar UI
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Responsável pela camada visual do avatar.
//     Cria o wrapper do autor, renderiza o avatar e mantém as iniciais atualizadas.
//
// EN: Responsible for the avatar visual layer.
//     Creates the author wrapper, renders the avatar and keeps initials updated.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🌷 Helena — Avatar Logic
// Fornece / Provides:
// - getInitials()
/* -----------------------------------------------------------------------------*/
import { HelenaAvatarHelpers } from '/assets/js/feedback/board/avatar/helena-avatar-helpers.js';

/* -----------------------------------------------------------------------------*/
// Avatar Attachment
/* -----------------------------------------------------------------------------*/

function attachAvatarToAuthor(card) {
  const authorElement = card.querySelector('.meta-row [data-c-author]');
  if (!authorElement) return;

  // PT: Evita duplicação do wrapper.
  // EN: Prevents wrapper duplication.
  if (authorElement.parentElement?.classList.contains('author-wrap')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'author-wrap';

  const avatar = document.createElement('span');
  avatar.className = 'avatar-initials';
  avatar.setAttribute('aria-hidden', 'true');

  authorElement.parentNode.insertBefore(wrapper, authorElement);
  wrapper.appendChild(avatar);
  wrapper.appendChild(authorElement);

  // PT: Atualiza iniciais com base no texto do autor.
  // EN: Updates initials based on author text.
  const updateInitials = () => {
    const authorText = (authorElement.textContent || '').trim();
    avatar.textContent = HelenaAvatarHelpers.getInitials(authorText);
  };

  // PT: Observa mudanças no nome para manter iniciais corretas.
  // EN: Observes name changes to keep initials correct.
  const observer = new MutationObserver(updateInitials);
  observer.observe(authorElement, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  updateInitials();
}

/* -----------------------------------------------------------------------------*/
// Avatar Initialization
/* -----------------------------------------------------------------------------*/

// PT: Inicializa a UI de avatar para todos os cards do board.
// EN: Initializes avatar UI for all board cards.
function initAvatar() {
  document
    .querySelectorAll('section[data-feedback-card][data-variant="media"]')
    // PT: Se já tiver wrapper, não reinjeta.
    // EN: If wrapper already exists, do not reinject.
    .forEach(attachAvatarToAuthor);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const LiviaAvatarUI = {
  attachAvatarToAuthor,
  initAvatar,
};
