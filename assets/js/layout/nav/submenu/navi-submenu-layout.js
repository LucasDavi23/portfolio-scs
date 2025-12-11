// /js/layout/nav/submenu/navi-submenu-layout.js
// 🧭 Navi — Submenu / Menu Mobile
// Nível: Aprendiz
// PT: Controla o menu mobile: abrir/fechar, backdrop, ESC e scroll suave
//     para links âncora.
// EN: Controls the mobile menu: open/close, backdrop, ESC key and smooth
//     scrolling for anchor links.

// Função para abrir o menu
// Function to open the menu
function openMenu({ menu, backdrop }) {
  menu.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

// Função para fechar o menu
// Function to close the menu
function closeMenu({ menu, backdrop }) {
  menu.classList.add('hidden');
  backdrop.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

// Inicializa o menu mobile
// Initializes the mobile menu
export function initSubmenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('close-menu');
  const menu = document.getElementById('menu');
  const backdrop = document.getElementById('menu-backdrop');

  if (!menu || !backdrop) return;

  const ctx = { menu, backdrop };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => openMenu(ctx));
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeMenu(ctx));
  }

  backdrop.addEventListener('click', () => closeMenu(ctx));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu(ctx);
  });

  // Fecha ao clicar em qualquer link do menu + faz scroll suave para âncoras
  // Closes when clicking any menu link + smooth scroll for anchors
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href');
    // Fecha o menu primeiro
    closeMenu(ctx);

    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
    }
  });
}

export const NaviSubmenuLayout = {
  initSubmenu,

  initSubmenuLayout() {
    this.initSubmenu();
  },
};
