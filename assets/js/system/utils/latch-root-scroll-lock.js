// ✨ Latch — Scroll Lock
//
// Nível / Level: Jovem / Young
//
// PT: Controla o travamento e restauração do scroll.
// EN: Controls scroll lock and restoration.

/* -----------------------------------------------------------------------------*/
// State
//
// PT: Estado interno do controle de scroll.
// EN: Internal scroll control state.
/* -----------------------------------------------------------------------------*/

let lockCount = 0;

const scrollStack = [];

let savedPaddingRight = '';

let activeMode = 'html';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares do scroll.
// EN: Scroll helper functions.
/* -----------------------------------------------------------------------------*/

// PT: Retorna o elemento que controla o scroll.
// EN: Returns the element that controls scroll.
function getScrollEl() {
  return document.scrollingElement || document.documentElement;
}

// PT: Obtém posição atual do scroll.
// EN: Gets current scroll position.
function getScrollY() {
  const el = getScrollEl();
  return scrollY || el.scrollTop || 0;
}

// PT: Define posição do scroll.
// EN: Sets scroll position.
function setScrollY(y) {
  const el = getScrollEl();

  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;

  html.style.scrollBehavior = 'auto';

  scrollTo(0, y);
  el.scrollTop = y;

  html.style.scrollBehavior = prevBehavior;
}

// PT: Compensa largura da scrollbar.
// EN: Compensates scrollbar width.
function applyScrollbarCompensation() {
  const scrollbarWidth = innerWidth - document.documentElement.clientWidth;

  if (scrollbarWidth > 0) {
    savedPaddingRight = document.documentElement.style.paddingRight || '';
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
  }
}

// PT: Remove compensação da scrollbar.
// EN: Removes scrollbar compensation.
function clearScrollbarCompensation() {
  document.documentElement.style.paddingRight = savedPaddingRight || '';
  savedPaddingRight = '';
}

/* -----------------------------------------------------------------------------*/
// Scroll Control
//
// PT: Controla lock e unlock do scroll.
// EN: Controls scroll lock and unlock.
/* -----------------------------------------------------------------------------*/

// PT: Ativa o lock de scroll.
// EN: Locks scroll.
function lockScroll() {
  const currentY = lockCount === 0 ? getScrollY() : (scrollStack[scrollStack.length - 1] ?? 0);

  scrollStack.push(currentY);

  if (lockCount === 0) {
    activeMode = 'html';

    applyScrollbarCompensation();

    document.documentElement.classList.add('no-scroll', 'modal-open');
  }

  lockCount += 1;
}

// PT: Remove o lock de scroll.
// EN: Unlocks scroll.
function unlockScroll() {
  if (lockCount === 0) return;

  lockCount -= 1;

  const y = scrollStack.pop() ?? 0;

  if (lockCount === 0) {
    document.documentElement.classList.remove('no-scroll', 'modal-open');

    clearScrollbarCompensation();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setScrollY(y);
      });
    });

    activeMode = 'html';
  }
}

/* -----------------------------------------------------------------------------*/
// Debug
//
// PT: Funções auxiliares de debug.
// EN: Debug helper functions.
/* -----------------------------------------------------------------------------*/

// PT: Retorna quantidade de locks ativos.
// EN: Returns active lock count.
function getScrollLockCount() {
  return lockCount;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const LatchRootScroll = {
  lockScroll,
  unlockScroll,
  getScrollLockCount,
};
