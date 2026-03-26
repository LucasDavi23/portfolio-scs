// 🧭 Navi — Submenu Layout
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Controla abertura e fechamento do menu mobile.
// EN: Controls mobile menu open and close.

/* -----------------------------------------------------------------------------*/
// Constants
//
// PT: Classe de estado do menu mobile.
// EN: Mobile menu state class.
/* -----------------------------------------------------------------------------*/

const OPEN_CLASS = 'is-open';

/* -----------------------------------------------------------------------------*/
// Menu Actions
//
// PT: Controla abertura e fechamento do menu.
// EN: Controls menu open and close.
/* -----------------------------------------------------------------------------*/

// PT: Abre o menu mobile.
// EN: Opens the mobile menu.
function openMenu({ menu, backdrop }) {
  menu.classList.remove('hidden');
  backdrop.classList.remove('hidden');

  document.body.classList.add('overflow-hidden');

  // PT: Ativa animação no próximo frame.
  // EN: Enables animation on the next frame.
  requestAnimationFrame(() => {
    menu.classList.add(OPEN_CLASS);
    backdrop.classList.add(OPEN_CLASS);
  });
}

// PT: Fecha o menu mobile.
// EN: Closes the mobile menu.
function closeMenu({ menu, backdrop }) {
  menu.classList.remove(OPEN_CLASS);
  backdrop.classList.remove(OPEN_CLASS);

  document.body.classList.remove('overflow-hidden');

  // PT: Espera a transição terminar antes de ocultar.
  // EN: Waits for transition to finish before hiding.
  const hideDelayMs = 280;

  setTimeout(() => {
    menu.classList.add('hidden');
    backdrop.classList.add('hidden');
  }, hideDelayMs);
}

/* -----------------------------------------------------------------------------*/
// Initialization
//
// PT: Inicializa eventos e estado do menu mobile.
// EN: Initializes mobile menu events and state.
/* -----------------------------------------------------------------------------*/

// PT: Inicializa o submenu mobile.
// EN: Initializes the mobile submenu.
function initSubmenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const closeButton = document.getElementById('mobile-menu-close');
  const menu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('mobile-menu-backdrop');

  if (!menu || !backdrop) return;

  const context = { menu, backdrop };

  menu.classList.add('hidden');
  backdrop.classList.add('hidden');
  menu.classList.remove(OPEN_CLASS);
  backdrop.classList.remove(OPEN_CLASS);

  if (menuToggle) {
    menuToggle.addEventListener('click', () => openMenu(context));
  }

  if (closeButton) {
    closeButton.addEventListener('click', () => closeMenu(context));
  }

  backdrop.addEventListener('click', () => closeMenu(context));

  // PT: Fecha o menu ao pressionar ESC.
  // EN: Closes menu on ESC key.
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(context);
  });

  // PT: Fecha ao clicar em links do menu e trata âncoras.
  // EN: Closes on menu link click and handles anchors.
  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    closeMenu(context);

    if (href && href.startsWith('#')) {
      event.preventDefault();

      const target = document.querySelector(href);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  });

  // PT: Fecha o menu ao voltar para desktop.
  // EN: Closes menu when returning to desktop.
  addEventListener('resize', () => {
    const isToggleVisible = !!menuToggle && menuToggle.offsetParent !== null;
    if (!isToggleVisible) closeMenu(context);
  });
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const NaviSubmenuLayout = {
  initSubmenu,

  initSubmenuLayout() {
    this.initSubmenu();
  },
};
