// /js/layout/modal/iris-image-viewer.js
// 👁️ Iris — Image Viewer (Modal de Imagem Global)
// Nível: Jovem
// PT: Gerencia o modal global de imagem: abre a imagem em destaque,
//     bloqueia o scroll de fundo e fecha por botão, backdrop ou ESC.
// EN: Manages the global image modal: shows the image in focus, locks
//     background scroll and closes via button, backdrop or ESC.

export function ImageViewer() {
  const modal = document.getElementById('modalImg');
  const modalImg = document.getElementById('modalImgSrc');
  const btnClose = document.getElementById('modalClose');

  if (!modal || !modalImg || !btnClose) return;

  // PT: trava scroll sem shift (robusto)
  // EN: locks scroll without layout shift (robust)
  let _scrollY = 0;

  function lockScrollFixed() {
    _scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${_scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockScrollFixed() {
    const y = _scrollY;

    // PT: salva e força scroll sem animação (se estiver scroll-smooth)
    // EN: temporarily disable smooth scrolling during restore
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    // PT: restaura no próximo frame para evitar "jump"
    // EN: restore on next frame to avoid jump
    requestAnimationFrame(() => {
      window.scrollTo(0, y);

      // PT/EN: devolve comportamento anterior
      html.style.scrollBehavior = prevBehavior;
    });
  }

  function openModal(src, altText = '') {
    if (!src) {
      console.warn('[Iris] src vazio, não vou abrir a imagem.');
      return;
    }

    modalImg.src = src;
    modalImg.alt = altText;
    modal.classList.remove('hidden');
    modal.classList.add('grid');
    modal.setAttribute('aria-hidden', 'false');
    lockScrollFixed();
  }

  function closeModal() {
    modal.classList.remove('grid');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');

    // PT/EN: deixa o DOM aplicar hidden primeiro
    requestAnimationFrame(() => {
      unlockScrollFixed();
      modalImg.src = '';
      modalImg.alt = '';
    });
  }

  // Delegação global — funciona inclusive para elementos injetados depois
  // PT: delegação global para abrir o modal (mais estável que click)
  // EN: global delegation to open the modal (more stable than click)
  document.addEventListener(
    'pointerdown',
    (e) => {
      // PT: se modal aberto, não processa openers
      // EN: if modal is open, ignore openers
      if (!modal.classList.contains('hidden')) return;

      const opener = e.target.closest('.js-open-modal');
      if (!opener) return;

      // PT: evita navegação (ex: <a href="#">) e evita "click-through"
      // EN: prevents navigation (e.g., <a href="#">) and click-through
      e.preventDefault();
      e.stopPropagation();

      let src = '';
      let altText = '';

      // 1) data-full no opener
      src = opener.dataset.full || '';

      // 2) fallback: img interna
      if (!src) {
        const innerImg = opener.querySelector('img');
        if (innerImg) {
          src = innerImg.dataset.full || innerImg.src || '';
          altText = innerImg.alt || '';
        }
      }

      // 3) se o opener em si é IMG
      if (!src && opener.tagName === 'IMG') {
        src = opener.src || '';
        altText = opener.alt || '';
      }

      // 4) fallback alt
      if (!altText) {
        altText = opener.getAttribute('aria-label') || '';
      }

      if (!src) {
        console.warn('[Iris] src não encontrado, não vou abrir a imagem.');
        return;
      }

      openModal(src, altText);
    },
    true // capture: pega antes de handlers/navegação
  );

  btnClose.addEventListener(
    'pointerdown',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    },
    true
  );

  // PT: fecha no pointerdown (antes do click) para evitar "click-through"
  // EN: close on pointerdown (before click) to avoid click-through
  modal.addEventListener(
    'pointerdown',
    (e) => {
      // só fecha se clicou no overlay (fora do conteúdo)
      if (e.target !== modal) return;

      e.preventDefault();
      e.stopPropagation();

      closeModal();
    },
    true // capture: pega antes do restante
  );

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

export const IrisImageViewer = {
  ImageViewer,

  initImageViewer() {
    this.ImageViewer();
  },
};
