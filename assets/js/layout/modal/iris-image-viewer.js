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

  function openModal(src, altText = '') {
    if (!src) {
      console.warn('[Iris] src vazio, não vou abrir a imagem.');
      return;
    }

    modalImg.src = src;
    modalImg.alt = altText;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    modalImg.src = '';
    modalImg.alt = '';
  }

  // Delegação global — funciona inclusive para elementos injetados depois
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('.js-open-modal');
    if (!opener) return;

    let src = '';
    let altText = '';

    // 1) Tenta data-full no próprio botão
    src = opener.getAttribute('data-full') || opener.dataset.full || '';

    // 2) Se não achou, tenta <img> interna
    if (!src) {
      const innerImg = opener.querySelector('img');
      if (innerImg) {
        src = innerImg.getAttribute('data-full') || innerImg.dataset.full || innerImg.src || '';
        altText = innerImg.alt || altText;
      }
    }

    // 3) Se o opener em si é uma <img>
    if (!src && opener.tagName === 'IMG') {
      src = opener.src || '';
      altText = opener.alt || altText;
    }

    // 4) Fallback de alt: aria-label do botão
    if (!altText) {
      altText = opener.getAttribute('aria-label') || '';
    }

    if (!src) {
      console.warn('[Iris] src não encontrado, não vou abrir a imagem.');
      return;
    }

    openModal(src, altText);
  });

  btnClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    const clickedImage = e.target.closest('#modalImgSrc');
    const clickedClose = e.target.closest('#modalClose');

    // se NÃO clicou na imagem e NÃO clicou no botão de fechar,
    // consideramos que foi clique no fundo/backdrop
    if (!clickedImage && !clickedClose) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

export const IrisImageViewer = {
  ImageViewer,

  initImageViewer() {
    this.ImageViewer();
  },
};
