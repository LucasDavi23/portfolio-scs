// 🕯️ Vela — Modal Motion
//
// Nível / Level: Adulta / Adult
//
// PT: Controla animações de abertura e fechamento de modais.
// EN: Controls modal open and close animations.

/* -----------------------------------------------------------------------------*/
// Constants
//
// PT: Configurações padrão de animação.
// EN: Default animation settings.
/* -----------------------------------------------------------------------------*/

const DEFAULT_TIMINGS = {
  openMs: 360,
  closeMs: 450,
  enterEasing: 'cubic-bezier(0, 0, 0.2, 1)',
  leaveEasing: 'cubic-bezier(0.4, 0, 1, 1)',
};

const DEFAULT_CLASSES = {
  rootEnterFrom: ['opacity-0'],
  rootEnterTo: ['opacity-100'],
  rootExitFrom: ['opacity-100'],
  rootExitTo: ['opacity-0'],

  panelEnterFrom: ['opacity-0', 'translate-y-3', 'sm:translate-y-0', 'sm:scale-95'],
  panelEnterTo: ['opacity-100', 'translate-y-0', 'sm:scale-100'],
  panelExitFrom: ['opacity-100', 'translate-y-0', 'sm:scale-100'],
  panelExitTo: ['opacity-0', 'translate-y-3', 'sm:translate-y-0', 'sm:scale-95'],

  closingShieldClass: 'pointer-events-none',
};

/* -----------------------------------------------------------------------------*/
// State
//
// PT: Estado interno da animação.
// EN: Internal animation state.
/* -----------------------------------------------------------------------------*/

let isAnimating = false;

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares de manipulação.
// EN: Helper functions.
/* -----------------------------------------------------------------------------*/

// PT: Converte valor em array.
// EN: Converts value to array.
function toArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

// PT: Aplica classes.
// EN: Applies classes.
function applyClasses(el, add = [], remove = []) {
  if (!el) return;

  const addList = toArray(add);
  const removeList = toArray(remove);

  if (removeList.length) el.classList.remove(...removeList);
  if (addList.length) el.classList.add(...addList);
}

// PT: Define transição.
// EN: Sets transition.
function setTransition(el, durationMs, easing) {
  if (!el) return;

  el.style.transitionDuration = `${Math.max(0, durationMs)}ms`;
  el.style.transitionTimingFunction = easing || '';
}

// PT: Limpa transição.
// EN: Clears transition.
function clearTransition(el) {
  if (!el) return;

  el.style.transitionDuration = '';
  el.style.transitionTimingFunction = '';
}

// PT: Força reflow.
// EN: Forces reflow.
function forceReflow(el) {
  if (!el) return;

  // PT: Garante aplicação do estado inicial antes da transição.
  // EN: Ensures initial state is applied before transition.
  void el.offsetHeight;
}

// PT: Aguarda fim da transição.
// EN: Waits for transition end.
function waitTransitionEnd(el, durationMs) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    let done = false;
    const safetyMs = Math.max(0, Number(durationMs) || 0) + 80;

    const cleanup = () => {
      if (done) return;
      done = true;

      el.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      resolve();
    };

    const onEnd = (event) => {
      if (event.target !== el) return;
      cleanup();
    };

    const timer = setTimeout(cleanup, safetyMs);

    el.addEventListener('transitionend', onEnd);
  });
}

/* -----------------------------------------------------------------------------*/
// Config Helpers
//
// PT: Normaliza configuração de animação.
// EN: Normalizes animation config.
/* -----------------------------------------------------------------------------*/

function normalizeConfig(config = {}) {
  const {
    rootEl,
    panelEl,
    timings = {},
    stateClasses = {},
    enablePanelTranslate = true,
    preventClickDuringClose = true,
  } = config;

  const mergedTimings = {
    openMs: timings.openMs ?? DEFAULT_TIMINGS.openMs,
    closeMs: timings.closeMs ?? DEFAULT_TIMINGS.closeMs,
    enterEasing: timings.enterEasing ?? DEFAULT_TIMINGS.enterEasing,
    leaveEasing: timings.leaveEasing ?? DEFAULT_TIMINGS.leaveEasing,
  };

  const resolved = resolveTimings(mergedTimings);

  mergedTimings.openMs = resolved.openMs;
  mergedTimings.closeMs = resolved.closeMs;

  const mergedClasses = { ...DEFAULT_CLASSES, ...stateClasses };

  if (!enablePanelTranslate) {
    mergedClasses.panelEnterFrom = ['opacity-0', 'sm:scale-95'];
    mergedClasses.panelEnterTo = ['opacity-100', 'sm:scale-100'];
    mergedClasses.panelExitFrom = ['opacity-100', 'sm:scale-100'];
    mergedClasses.panelExitTo = ['opacity-0', 'sm:scale-95'];
  }

  return {
    rootEl,
    panelEl,
    timings: mergedTimings,
    classes: mergedClasses,
    options: { preventClickDuringClose },
  };
}

/* -----------------------------------------------------------------------------*/
// Timing Helpers
//
// PT: Ajusta timings conforme viewport.
// EN: Adjusts timings based on viewport.
/* -----------------------------------------------------------------------------*/

function isMobileViewport() {
  return typeof matchMedia !== 'undefined' && matchMedia('(max-width: 640px)').matches;
}

function resolveTimings(userTimings = {}) {
  const openMs = userTimings.openMs ?? DEFAULT_TIMINGS.openMs;
  let closeMs = userTimings.closeMs ?? DEFAULT_TIMINGS.closeMs;

  if (isMobileViewport()) {
    closeMs = Math.max(closeMs, 540);
  }

  return { openMs, closeMs };
}

/* -----------------------------------------------------------------------------*/
// Motion Base
//
// PT: Define estados base de open/close.
// EN: Defines open/close base states.
/* -----------------------------------------------------------------------------*/

function setBaseOpenState(rootEl, panelEl, classes, timings) {
  setTransition(rootEl, timings.openMs, timings.enterEasing);
  setTransition(panelEl, timings.openMs, timings.enterEasing);

  applyClasses(rootEl, classes.rootEnterFrom, classes.rootEnterTo);
  applyClasses(panelEl, classes.panelEnterFrom, classes.panelEnterTo);

  forceReflow(panelEl || rootEl);

  applyClasses(rootEl, classes.rootEnterTo, classes.rootEnterFrom);
  applyClasses(panelEl, classes.panelEnterTo, classes.panelEnterFrom);
}

function setBaseCloseState(rootEl, panelEl, classes, timings, preventClickDuringClose) {
  setTransition(rootEl, timings.closeMs, timings.leaveEasing);
  setTransition(panelEl, timings.closeMs, timings.leaveEasing);

  applyClasses(rootEl, classes.rootExitFrom, classes.rootExitTo);
  applyClasses(panelEl, classes.panelExitFrom, classes.panelExitTo);

  if (preventClickDuringClose && rootEl) {
    rootEl.classList.add(classes.closingShieldClass);
  }

  forceReflow(panelEl || rootEl);

  applyClasses(rootEl, classes.rootExitTo, classes.rootExitFrom);
  applyClasses(panelEl, classes.panelExitTo, classes.panelExitFrom);
}

function resetAfterOpen(rootEl, panelEl) {
  clearTransition(rootEl);
  clearTransition(panelEl);
}

function resetAfterClose(rootEl, panelEl, classes) {
  clearTransition(rootEl);
  clearTransition(panelEl);

  if (rootEl) rootEl.classList.remove(classes.closingShieldClass);
}

/* -----------------------------------------------------------------------------*/
// Public API
//
// PT: Executa animações de abertura e fechamento.
// EN: Runs open and close animations.
/* -----------------------------------------------------------------------------*/

// PT: Executa animação de abertura.
// EN: Runs open animation.
async function openModalMotion(config = {}) {
  if (isAnimating) return;
  isAnimating = true;

  const { rootEl, panelEl, timings, classes } = normalizeConfig(config);

  if (!rootEl || !panelEl) {
    isAnimating = false;
    return;
  }

  setBaseOpenState(rootEl, panelEl, classes, timings);

  await waitTransitionEnd(panelEl, timings.openMs);

  resetAfterOpen(rootEl, panelEl);
  isAnimating = false;
}

// PT: Executa animação de fechamento.
// EN: Runs close animation.
async function closeModalMotion(config = {}) {
  if (isAnimating) return;
  isAnimating = true;

  const { rootEl, panelEl, timings, classes, options } = normalizeConfig(config);

  if (!rootEl || !panelEl) {
    isAnimating = false;
    return;
  }

  setBaseCloseState(rootEl, panelEl, classes, timings, options.preventClickDuringClose);

  await waitTransitionEnd(panelEl, timings.closeMs);

  resetAfterClose(rootEl, panelEl, classes);
  isAnimating = false;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const VelaModalMotion = {
  openModalMotion,
  closeModalMotion,
};
