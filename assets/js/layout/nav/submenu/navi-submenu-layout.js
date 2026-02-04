// /js/layout/nav/submenu/navi-submenu-layout.js
// 🧭 Navi — Submenu / Menu Mobile
// Nível: Aprendiz
// PT: Controla o menu mobile: abrir/fechar, backdrop, ESC e scroll suave
//     para links âncora.
// EN: Controls the mobile menu: open/close, backdrop, ESC key and smooth
//     scrolling for anchor links.

const OPEN_CLASS = 'is-open';
const DESKTOP_MIN = 640; // Tailwind sm

function isDesktop() {
  return window.innerWidth >= DESKTOP_MIN;
}

// Função para abrir o menu
// Function to open the menu
function openMenu({ menu, backdrop }) {
  // PT: Se o botão existe e foi clicado, abre.
  // EN: If the button exists and was clicked, open.

  menu.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');

  // PT: ativa animação no próximo frame
  // EN: enable animation next frame
  requestAnimationFrame(() => {
    menu.classList.add(OPEN_CLASS);
    backdrop.classList.add(OPEN_CLASS);
  });
}

// Função para fechar o menu
// Function to close the menu
function closeMenu({ menu, backdrop }) {
  // PT: remove animação primeiro
  // EN: remove animation first
  menu.classList.remove(OPEN_CLASS);
  backdrop.classList.remove(OPEN_CLASS);

  document.body.classList.remove('overflow-hidden');

  // PT: espera transição e depois oculta
  // EN: wait transition then hide
  const HIDE_DELAY = 280; // casa com o CSS (260ms)
  window.setTimeout(() => {
    menu.classList.add('hidden');
    backdrop.classList.add('hidden');
  }, HIDE_DELAY);
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

  // PT: estado inicial consistente
  // EN: consistent initial state
  menu.classList.add('hidden');
  backdrop.classList.add('hidden');
  menu.classList.remove(OPEN_CLASS);
  backdrop.classList.remove(OPEN_CLASS);

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

    // PT: Fecha o menu primeiro
    // EN: Close first
    closeMenu(ctx);

    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  });

  // ✅ Fecha se entrar em desktop (ex: rotacionar tablet / resize)
  // ✅ Auto close when switching to desktop
  window.addEventListener('resize', () => {
    const toggleVisible = !!menuToggle && menuToggle.offsetParent !== null;
    if (!toggleVisible) closeMenu(ctx);
  });
}

export const NaviSubmenuLayout = {
  initSubmenu,

  initSubmenuLayout() {
    this.initSubmenu();
  },
};
