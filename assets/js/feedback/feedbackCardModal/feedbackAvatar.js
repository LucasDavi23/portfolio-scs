// Pega iniciais ignorando símbolos, números e espaços
function getInitials(name) {
  // pega apenas sequências de letras (suporta acentos com \p{L})
  const words = (name || '').match(/\p{L}+/gu) || [];
  if (words.length === 0) return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  const first = words[0][0];
  const last = words[words.length - 1][0];
  return (first + last).toUpperCase();
}

function attachAvatarToAuthor(card) {
  const nameEl = card.querySelector('.meta-row [data-c-autor]');
  if (!nameEl) return;
  if (nameEl.parentElement?.classList.contains('author-wrap')) return;

  const wrap = document.createElement('div');
  wrap.className = 'author-wrap';
  const avatar = document.createElement('span');
  avatar.className = 'avatar-iniciais';
  avatar.setAttribute('aria-hidden', 'true');

  nameEl.parentNode.insertBefore(wrap, nameEl);
  wrap.appendChild(avatar);
  wrap.appendChild(nameEl);

  // espera o texto chegar do fill
  const update = () => {
    const txt = (nameEl.textContent || '').trim();
    const initials = getInitials(txt);
    avatar.textContent = initials;
  };
  const mo = new MutationObserver(update);
  mo.observe(nameEl, { childList: true, characterData: true, subtree: true });
  update(); // tenta já na primeira vez
}

// aplicar nos cards "media" após o fill:
document
  .querySelectorAll('section[data-feedback-card][data-variant="media"]') // seleciona cards de mídia
  .forEach(attachAvatarToAuthor); // aplica em cada card
