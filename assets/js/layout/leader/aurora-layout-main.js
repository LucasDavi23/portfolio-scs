// /js/layout/leader/aurora-layout-main.js
// 🌇 Aurora — Líder do Layout
// Nível: Adulta
//
// PT: Aurora coordena o layout da página. Ela não faz o trabalho “miúdo”,
//     mas garante que cada responsável execute sua parte na ordem certa.
//     Aqui ela inicializa:
//       • foundation (Luna),
//       • submenu / mobile nav (Navi),
//       • efeitos de scroll (Aura),
//       • modal de imagem (Iris),
//       • carrossel principal (Nami).
//
// EN: Aurora coordinates the page layout. She does not handle low-level tasks
//     herself, but ensures each specialist runs at the right time. Here she
//     initializes:
//       • foundation (Luna),
//       • submenu / mobile nav (Navi),
//       • scroll effects (Aura),
//       • image modal (Iris),
//       • main carousel (Nami).

// 🌙 Luna — foundation do layout (básico)
// EN 🌙 Luna — layout foundation (basic)
// Fornece:
// - initFooterYear()
// - initBackToTop()
import { LunaFoundation } from '/assets/js/layout/foundation/luna-foundation.js';

// 🧭 Navi — lógica do submenu/mobile nav
// EN 🧭 Navi — mobile navigation logic
// Fornece:
// - initMobileMenu()
import { NaviSubmenuLayout } from '/assets/js/layout/nav/submenu/navi-submenu-layout.js';

// 🌬️ Aura — efeitos de scroll (experiência visual)
// EN 🌬️ Aura — scroll visual effects
// Fornece:
// - initScrollEffects()
import { AuraScrollEffects } from '/assets/js/layout/nav/scroll/aura-scroll-effects.js';

// 🧭 Nara — estado do menu via scroll
// EN 🧭 Nara — scroll-based menu state
// Fornece:
// - enableNavState()
// - disableNavState()
import { NaraNavState } from '/assets/js/layout/nav/scroll/nara-nav-state.js';

// 👁️ Iris — modal de imagem simples
// EN 👁️ Iris — simple image modal
// Fornece:
// - initImageModal()
import { IrisImageViewer } from '/assets/js/layout/modal/iris-image-viewer.js';

// 🎠 Nami — carrossel principal do layout
// EN 🎠 Nami — main carousel logic
// Fornece:
// - initCarousel()

import { NamiCarouselLayout } from '/assets/js/layout/carousel/nami-carousel-layout.js';

// 📝 Lyra — modal de formulário (contato, feedback etc.
// EN 📝 Lyra — form modal (contact, feedback etc.
// Fornece:
// - initLyraFormModal()
import { LyraFormModal } from '/assets/js/layout/modal/lyra-form-modal.js';

// (Opcional, futuro)
// 🎐 Yume — animações do carrossel (futuro)
// import { YumeCarouselAnimations } from '/assets/js/layout/hero/carousel/yume-carousel-animations.js';

// PT: Função principal da Aurora. Ela chama a inicialização de cada parte
//     do layout na ordem que faz sentido.
// EN: Aurora's main function. It calls each layout part initializer
//     in a meaningful order.

function initLayout() {
  // 1) Foundation básica (ano, back-to-top, etc.)
  LunaFoundation.initFoundation();

  // 2) Navegação (submenu / menu mobile)
  NaviSubmenuLayout.initSubmenuLayout();

  // 2.1) Sincroniza estado do menu via scroll
  NaraNavState.enableNavState();
  // 3) Efeitos de scroll (quando existir implementação)
  // AuraScrollEffects.initScrollEffects();

  // 4) Modal de imagem global
  IrisImageViewer.initImageViewer();

  // 5) Carrossel principal
  NamiCarouselLayout.initCarousel();

  // 6) Futuro: animações extras da Yume
  // YumeCarouselAnimations?.attach?.();

  // 7) Modal de formulário (Lyra)
  LyraFormModal.initLyraFormModal();
}

export const AuroraLayoutLeader = {
  initLayout,
};
