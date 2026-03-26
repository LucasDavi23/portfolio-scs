// 🌇 Aurora — Layout Leader
//
// Nível / Level: Adulta / Adult
//
// PT: Coordena a inicialização do layout.
//     Organiza a ordem de execução entre foundation, navegação,
//     modal, carrossel e outros módulos visuais.
// EN: Coordinates layout initialization.
//     Organizes execution order across foundation, navigation,
//     modal, carousel and other visual modules.

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🌙 Luna — Layout Foundation
// Fornece / Provides:
// - initFoundation()
/* -----------------------------------------------------------------------------*/
import { LunaFoundation } from '/assets/js/layout/foundation/luna-foundation.js';

/* -----------------------------------------------------------------------------*/
// 🧭 Navi — Submenu Layout
// Fornece / Provides:
// - initSubmenuLayout()
/* -----------------------------------------------------------------------------*/
import { NaviSubmenuLayout } from '/assets/js/layout/nav/submenu/navi-submenu-layout.js';

/* -----------------------------------------------------------------------------*/
// 🧭 Nara — Nav State
// Fornece / Provides:
// - enableNavState()
/* -----------------------------------------------------------------------------*/
import { NaraNavState } from '/assets/js/layout/nav/scroll/nara-nav-state.js';

/* -----------------------------------------------------------------------------*/
// 👁️ Iris — Image Viewer
// Fornece / Provides:
// - initImageViewer()
/* -----------------------------------------------------------------------------*/
import { IrisImageViewer } from '/assets/js/layout/modal/iris-image-viewer.js';

/* -----------------------------------------------------------------------------*/
// 🎠 Nami — Carousel Layout
// Fornece / Provides:
// - initCarousel()
/* -----------------------------------------------------------------------------*/
import { NamiCarouselLayout } from '/assets/js/layout/carousel/nami-carousel-layout.js';

/* -----------------------------------------------------------------------------*/
// 📝 Lyra — Form Modal
// Fornece / Provides:
// - initLyraFormModal()
/* -----------------------------------------------------------------------------*/
import { LyraFormModal } from '/assets/js/layout/modal/lyra-form-modal.js';

/* -----------------------------------------------------------------------------*/
// Layout Initialization
//
// PT: Inicializa os módulos principais do layout na ordem certa.
// EN: Initializes core layout modules in the correct order.
/* -----------------------------------------------------------------------------*/

// PT: Executa a inicialização principal do layout.
// EN: Runs the main layout initialization.
function initLayout() {
  LunaFoundation.initFoundation();

  NaviSubmenuLayout.initSubmenuLayout();

  NaraNavState.enableNavState();

  IrisImageViewer.initImageViewer();

  NamiCarouselLayout.initCarousel();

  LyraFormModal.initLyraFormModal();
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const AuroraLayoutLeader = {
  initLayout,
};
