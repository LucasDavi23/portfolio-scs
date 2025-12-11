// 🌸 Nami — Guardiã do Carrossel Principal
// Nível: Jovem
//
// PT: Nami representa fluidez, movimento e suavidade. Ela não cuida de efeitos
//     avançados nem das animações profundas — isso é papel da Yume
//     (yume-carousel-animation.js). O domínio da Nami é a experiência base:
//       • identifica o carrossel no DOM,
//       • gerencia o slide atual,
//       • controla os botões (prev/next),
//       • sincroniza os indicadores (dots),
//       • habilita a navegação por swipe (mobile),
//       • garante transições limpas e previsíveis.
//     Nami é responsável por manter o carrossel funcional e elegante,
//     preparando o terreno para Yume aplicar animações mais ricas.
//
// EN: Nami stands for flow, movement and smoothness. She does NOT handle
//     advanced effects or deep animation logic — that is Yume’s task
//     (yume-carousel-animation.js). Nami’s domain is the core carousel behavior:
//       • locates the carousel in the DOM,
//       • manages the active slide,
//       • handles the navigation arrows,
//       • syncs dot indicators,
//       • enables swipe navigation on mobile,
//       • ensures clean, predictable transitions.
//     Nami keeps the carousel stable and refined, setting the stage for Yume
//     to bring deeper animation and polish.

// PT: Controla o carrossel principal: slides, setas, dots e swipe.
// EN: Controls the main carousel: slides, arrows, dots, and swipe.
function CarouselLayout() {
  const root = document.getElementById('carrossel-producao');
  if (!root) return; // PT: evita erro se o carrossel não existir / EN: safe guard

  const items = [...root.querySelectorAll('[id^="carrossel-item-"]')];
  const dots = [...root.querySelectorAll('[data-dot]')];
  const btnPrev = root.querySelector('#carrossel-prev');
  const btnNext = root.querySelector('#carrossel-next');

  const LAST = items.length - 1;
  let i = 0;
  let isAnimating = false;

  // --------------------------------------------------
  // PT: Atualiza o estado das setas (habilita/desabilita)
  // EN: Updates arrow states (enable/disable)
  // --------------------------------------------------
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

  // --------------------------------------------------
  // PT: Atualiza os indicadores (bolinhas)
  // EN: Updates the dot indicators
  // --------------------------------------------------
  const paintDots = (active) => {
    dots.forEach((d, idx) => {
      d.setAttribute('aria-current', idx === active ? 'true' : 'false');
      d.classList.toggle('bg-white/90', idx === active);
      d.classList.toggle('bg-white/40', idx !== active);
      d.classList.add('ring-1', 'ring-black/10');
    });
  };

  // --------------------------------------------------
  // PT: Prepara o estado inicial dos slides
  // EN: Prepares the initial slide state
  // --------------------------------------------------
  const initSlides = () => {
    items.forEach((el, idx) => {
      el.classList.remove('opacity-0', 'opacity-100', 'translate-x-5', '-translate-x-5');
      el.classList.add('absolute', 'inset-0', 'transition-transform', 'duration-500', 'ease-out');

      if (idx === 0) {
        el.classList.add('translate-x-0', 'z-10');
      } else {
        el.classList.add('translate-x-full', 'z-0', 'pointer-events-none');
      }
    });

    paintDots(0);
    setBtnState();
  };

  // --------------------------------------------------
  // PT: Mostra um slide específico (direita ou esquerda)
  // EN: Shows a specific slide (right or left direction)
  // --------------------------------------------------
  const show = (target, dir = 1) => {
    if (isAnimating) return;
    if (target < 0 || target > LAST) return;
    if (target === i) return;

    isAnimating = true;

    const currEl = items[i];
    const nextEl = items[target];

    nextEl.classList.remove('translate-x-0', '-translate-x-full', 'pointer-events-none');
    nextEl.classList.add(dir > 0 ? 'translate-x-full' : '-translate-x-full', 'z-10');

    void nextEl.offsetHeight; // reflow

    currEl.classList.remove('translate-x-0', 'z-10');
    currEl.classList.add(
      dir > 0 ? '-translate-x-full' : 'translate-x-full',
      'z-0',
      'pointer-events-none'
    );

    nextEl.classList.remove(dir > 0 ? 'translate-x-full' : '-translate-x-full');
    nextEl.classList.add('translate-x-0');

    const onDone = () => {
      nextEl.removeEventListener('transitionend', onDone);
      i = target;
      paintDots(i);
      setBtnState();
      isAnimating = false;
    };

    nextEl.addEventListener('transitionend', onDone, { once: true });
  };

  const next = () => show(i + 1, +1);
  const prev = () => show(i - 1, -1);

  // Inicializa
  initSlides();

  // --------------------------------------------------
  // Eventos das setas
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Eventos dos dots
  // --------------------------------------------------
  dots.forEach((d, idx) =>
    d.addEventListener('click', () => {
      if (idx !== i) show(idx, idx > i ? +1 : -1);
    })
  );

  // --------------------------------------------------
  // Swipe (mobile)
  // --------------------------------------------------
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

export const NamiCarouselLayout = {
  CarouselLayout,

  initCarousel() {
    this.CarouselLayout();
  },
};
