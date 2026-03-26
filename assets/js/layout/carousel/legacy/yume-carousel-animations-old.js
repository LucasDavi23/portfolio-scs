// 🎐 Yume — Animações do Carrossel
// Nível / Level: Aprendiz / Apprentice
//
// PT:
// Centraliza as animações visuais do carrossel.
// Yume não controla índice, autoplay ou navegação.
// Sua função é apenas aplicar a transição visual de entrada/saída.
//
// EN:
// Centralizes carousel visual animations.
// Yume does not control index, autoplay or navigation.
// Its role is only to apply enter/exit visual transitions.

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

function resetSlideState(element) {
  if (!element) return;

  element.classList.remove(...STATE_CLASSES);
  element.classList.add(...BASE_TRANSITION_CLASSES);
}

function applySlideEnterAnimation(element, direction = 'next') {
  if (!element) return;

  resetSlideState(element);

  // PT: posiciona o slide fora da tela antes da entrada
  // EN: places the slide off-screen before entering
  element.classList.add(
    'z-10',
    'opacity-0',
    direction === 'prev' ? '-translate-x-full' : 'translate-x-full'
  );

  // PT: força reflow para garantir a transição
  // EN: forces reflow to ensure the transition runs
  void element.offsetWidth;

  element.classList.remove('opacity-0', 'translate-x-full', '-translate-x-full');
  element.classList.add('opacity-100', 'translate-x-0');
}

function applySlideExitAnimation(element, direction = 'next') {
  if (!element) return;

  resetSlideState(element);

  // PT: estado atual visível antes de sair
  // EN: current visible state before exiting
  element.classList.add('z-10', 'opacity-100', 'translate-x-0');

  // PT: força reflow para a saída acontecer suavemente
  // EN: forces reflow so exit transition happens smoothly
  void element.offsetWidth;

  element.classList.remove('opacity-100', 'translate-x-0');
  element.classList.add(
    'opacity-0',
    'pointer-events-none',
    direction === 'prev' ? 'translate-x-full' : '-translate-x-full'
  );
}

export const YumeCarouselAnimations = {
  applyEnter: applySlideEnterAnimation,
  applyExit: applySlideExitAnimation,
};
