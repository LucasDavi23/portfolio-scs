// 🌸 Nami — Carousel Layout
//
// Nível / Level: Jovem / Young
//
// PT: Nami cuida do comportamento do carrossel.
//     Controla slides, setas, indicadores e swipe.
//     Não lida com animações avançadas — isso é papel da Yume.
// EN: Nami handles carousel behavior.
//     Controls slides, arrows, indicators and swipe.
//     Does not handle advanced animations — that is Yume's role.

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

// 🎐 Yume — Animation
// Fornece / Provides:
// - applyEnter()
// - applyExit()
import { YumeCarouselAnimations } from '/assets/js/layout/carousel/animation/yume-carousel-animations.js';

/* -----------------------------------------------------------------------------*/
// Carousel Setup
//
// PT: Inicializa o carrossel e coleta elementos do DOM.
// EN: Initializes carousel and collects DOM elements.
/* -----------------------------------------------------------------------------*/

// PT: Controla o carrossel principal.
// EN: Controls the main carousel.
function CarouselLayout() {
  const root = document.getElementById('carousel-producao');
  if (!root) return;

  const items = [...root.querySelectorAll('[data-carousel-item]')];
  const dots = [...root.querySelectorAll('[data-dot]')];
  const btnPrev = root.querySelector('#carousel-prev');
  const btnNext = root.querySelector('#carousel-next');

  const LAST = items.length - 1;
  let i = 0;
  let isAnimating = false;

  /* -----------------------------------------------------------------------------*/
  // Arrow State
  //
  // PT: Atualiza o estado das setas.
  // EN: Updates arrow state.
  /* -----------------------------------------------------------------------------*/

  const setBtnState = () => {
    const mark = (btn, off) => {
      if (!btn) return;
      btn.setAttribute('aria-disabled', off ? 'true' : 'false');
      btn.classList.toggle('opacity-40', off);
      btn.classList.toggle('cursor-not-allowed', off);
    };

    mark(btnPrev, i === 0);
    mark(btnNext, i === LAST);
  };

  /* -----------------------------------------------------------------------------*/
  // Dot Indicators
  //
  // PT: Atualiza os indicadores (dots).
  // EN: Updates dot indicators.
  /* -----------------------------------------------------------------------------*/

  const paintDots = (active) => {
    dots.forEach((d, idx) => {
      d.setAttribute('aria-current', idx === active ? 'true' : 'false');
      d.classList.toggle('bg-white/90', idx === active);
      d.classList.toggle('bg-white/40', idx !== active);
      d.classList.add('ring-1', 'ring-black/10');
    });
  };

  /* -----------------------------------------------------------------------------*/
  // Slide Initialization
  //
  // PT: Define o estado inicial dos slides.
  // EN: Sets initial slide state.
  /* -----------------------------------------------------------------------------*/

  const initSlides = () => {
    items.forEach((el, idx) => {
      el.classList.remove('opacity-0', 'opacity-100', 'translate-x-5', '-translate-x-5');
      el.classList.add('absolute', 'inset-0');

      if (idx === 0) {
        el.classList.add('translate-x-0', 'z-10');
      } else {
        el.classList.add('translate-x-full', 'z-0', 'pointer-events-none');
      }
    });

    paintDots(0);
    setBtnState();
  };

  /* -----------------------------------------------------------------------------*/
  // Slide Control
  //
  // PT: Controla a troca de slides.
  // EN: Controls slide switching.
  /* -----------------------------------------------------------------------------*/

  const show = (target, dir = 1) => {
    if (isAnimating) return;
    if (target < 0 || target > LAST) return;
    if (target === i) return;

    isAnimating = true;

    const currEl = items[i];
    const nextEl = items[target];
    const direction = dir > 0 ? 'next' : 'prev';

    paintDots(target);

    YumeCarouselAnimations.applyExit(currEl, direction);
    YumeCarouselAnimations.applyEnter(nextEl, direction);

    const onDone = () => {
      nextEl.removeEventListener('transitionend', onDone);
      i = target;
      setBtnState();
      isAnimating = false;
    };

    nextEl.addEventListener('transitionend', onDone, { once: true });
  };

  const next = () => show(i + 1, +1);
  const prev = () => show(i - 1, -1);

  initSlides();

  /* -----------------------------------------------------------------------------*/
  // Arrow Events
  //
  // PT: Eventos dos botões de navegação.
  // EN: Navigation button events.
  /* -----------------------------------------------------------------------------*/

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      if (btnPrev.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        return;
      }
      prev();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      if (btnNext.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        return;
      }
      next();
    });
  }

  /* -----------------------------------------------------------------------------*/
  // Dot Events
  //
  // PT: Eventos dos indicadores.
  // EN: Dot indicator events.
  /* -----------------------------------------------------------------------------*/

  dots.forEach((d, idx) =>
    d.addEventListener('click', () => {
      if (idx !== i) show(idx, idx > i ? +1 : -1);
    })
  );

  /* -----------------------------------------------------------------------------*/
  // Swipe Events
  //
  // PT: Controle de swipe no mobile.
  // EN: Mobile swipe control.
  /* -----------------------------------------------------------------------------*/

  let sx = 0;
  let sy = 0;
  let t0 = 0;
  const MIN = 45;
  const DOM = 1.25;
  const FAST = 0.55;

  root.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      t0 = performance.now();
    },
    { passive: true }
  );

  root.addEventListener(
    'touchend',
    (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;

      if (Math.abs(dy) * DOM > Math.abs(dx)) return;

      const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
      if (Math.abs(dx) < MIN && v < FAST) return;

      if (dx < 0) {
        if (i < LAST) next();
      } else {
        if (i > 0) prev();
      }
    },
    { passive: true }
  );
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const NamiCarouselLayout = {
  CarouselLayout,

  initCarousel() {
    this.CarouselLayout();
  },
};
