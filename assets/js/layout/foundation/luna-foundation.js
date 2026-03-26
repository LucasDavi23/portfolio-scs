// 🌙 Luna — Layout Foundation
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Cuida da base do layout (rodapé e botão voltar ao topo).
// EN: Handles layout foundation (footer and back-to-top button).

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Footer Year
//
// PT: Atualiza o ano automaticamente no rodapé.
// EN: Updates the footer year automatically.
/* -----------------------------------------------------------------------------*/

// PT: Define o ano atual no rodapé.
// EN: Sets the current year in the footer.
function initFooterYear() {
  const yearSpan = document.getElementById('year');
  if (!yearSpan) return;

  yearSpan.textContent = new Date().getFullYear();
}

/* -----------------------------------------------------------------------------*/
// Back to Top
//
// PT: Controla o botão "voltar ao topo".
// EN: Controls the "back to top" button.
/* -----------------------------------------------------------------------------*/

// PT: Inicializa o botão e comportamento de rolagem.
// EN: Initializes button and scroll behavior.
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  // PT: Executa a rolagem para o topo.
  // EN: Scrolls the page to the top.
  const backToTop = () => {
    const isModalOpen = document.documentElement.classList.contains('modal-open');
    scrollTo({ top: 0, behavior: isModalOpen ? 'auto' : 'smooth' });
  };

  // PT: Mostra ou esconde o botão conforme o scroll.
  // EN: Shows or hides the button based on scroll.
  const onScroll = () => {
    backToTopBtn.style.display = scrollY > 20 ? 'block' : 'none';
  };

  addEventListener('scroll', onScroll, { passive: true });

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    backToTop();
  });

  onScroll();
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const LunaFoundation = {
  initFooterYear,
  initBackToTop,

  initFoundation() {
    this.initFooterYear();
    this.initBackToTop();
  },
};
