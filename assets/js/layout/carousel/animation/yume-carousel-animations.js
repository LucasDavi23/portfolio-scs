// 🎐 Yume — Carousel Animations
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Aplica animações de entrada e saída dos slides.
// EN: Applies enter and exit slide animations.

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Animation Constants
//
// PT: Classes usadas nas transições e estados dos slides.
// EN: Classes used for slide transitions and states.
/* -----------------------------------------------------------------------------*/

const BASE_TRANSITION_CLASSES = [
  'transition-[transform,opacity]',
  'duration-700',
  'ease-[cubic-bezier(0.22,1,0.36,1)]',
  'will-change-transform',
  'will-change-opacity',
  'transform-gpu',
];

const STATE_CLASSES = [
  'translate-x-0',
  'translate-x-full',
  '-translate-x-full',
  'opacity-0',
  'opacity-100',
  'z-0',
  'z-10',
  'pointer-events-none',
];

/* -----------------------------------------------------------------------------*/
// Slide State Helpers
//
// PT: Prepara o estado do slide antes da animação.
// EN: Prepares slide state before animation.
/* -----------------------------------------------------------------------------*/

// PT: Limpa estados antigos e aplica base de transição.
// EN: Clears previous states and applies transition base.
function resetSlideState(element) {
  if (!element) return;

  element.classList.remove(...STATE_CLASSES);
  element.classList.add(...BASE_TRANSITION_CLASSES);
}

/* -----------------------------------------------------------------------------*/
// Slide Animations
//
// PT: Controla entrada e saída dos slides.
// EN: Controls slide enter and exit.
/* -----------------------------------------------------------------------------*/

// PT: Aplica animação de entrada do slide.
// EN: Applies slide enter animation.
function applySlideEnterAnimation(element, direction = 'next') {
  if (!element) return;

  resetSlideState(element);

  element.classList.add(
    'z-10',
    'opacity-0',
    direction === 'prev' ? '-translate-x-full' : 'translate-x-full'
  );

  // PT: Força reflow para ativar a transição.
  // EN: Forces reflow to trigger the transition.
  void element.offsetWidth;

  element.classList.remove('opacity-0', 'translate-x-full', '-translate-x-full');
  element.classList.add('opacity-100', 'translate-x-0');
}

// PT: Aplica animação de saída do slide.
// EN: Applies slide exit animation.
function applySlideExitAnimation(element, direction = 'next') {
  if (!element) return;

  resetSlideState(element);

  element.classList.add('z-10', 'opacity-100', 'translate-x-0');

  // PT: Força reflow para saída suave.
  // EN: Forces reflow for smooth exit.
  void element.offsetWidth;

  element.classList.remove('opacity-100', 'translate-x-0');
  element.classList.add(
    'opacity-0',
    'pointer-events-none',
    direction === 'prev' ? 'translate-x-full' : '-translate-x-full'
  );
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const YumeCarouselAnimations = {
  applyEnter: applySlideEnterAnimation,
  applyExit: applySlideExitAnimation,
};
