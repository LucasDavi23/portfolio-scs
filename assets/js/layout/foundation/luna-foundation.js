// /js/layout/foundation/luna-foundation.js
// 🌙 Luna — Foundation do Layout
// Nível: Aprendiz
// PT: Cuida da fundação do layout: ano do rodapé e botão "voltar ao topo".
// EN: Takes care of layout foundation: footer year and "back to top" button.

// RODAPÉ DO ANO
// PT: Atualiza o ano no rodapé automaticamente.
// EN: Automatically updates the year in the footer.
function initFooterYear() {
  const yearSpan = document.getElementById('year');
  if (!yearSpan) return;
  yearSpan.textContent = new Date().getFullYear();
}

// BOTÃO "VOLTAR AO TOPO"
// PT: Cria o botão "voltar ao topo" e adiciona a funcionalidade de rolagem suave.
// EN: Creates the "back to top" button and adds smooth scroll functionality.
function initBackToTop() {
  const backToTopBtn = document.getElementById('backTotTopBtn');
  if (!backToTopBtn) return;

  const backToTop = () => {
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onScroll = () => {
    backToTopBtn.style.display = window.scrollY > 20 ? 'block' : 'none';
  };

  window.addEventListener('scroll', onScroll);
  backToTopBtn.addEventListener('click', backToTop);

  // já garante o estado inicial
  onScroll();
}

export const LunaFoundation = {
  initFooterYear,
  initBackToTop,

  initFoundation() {
    this.initFooterYear();
    this.initBackToTop();
  },
};
