// ==================================================
// 🕯️ Vela — Modal Motion Specialist
//
// Nível: Adulta
//
// File: vela-modal-motion.js
//
// PT: Padroniza a animação de abrir/fechar dos modais,
//     aplicando motion consistente para:
//     - root (overlay): fade (opacity)
//     - panel (conteúdo): fade + translate (opcional)
//     Vela cuida apenas do "motion lifecycle":
//     reflow seguro, transições, transitionend correto
//     e reset de estado base.
//
//     Ela NÃO:
//     - trava/destrava scroll (Latch)
//     - decide quando abrir/fechar (Mira/Lyra/Iris decidem)
//     - conhece Onyx/Echo ou lógica de modal
//
// EN: Standardizes modal open/close motion,
//     providing consistent transitions for:
//     - root (overlay): fade (opacity)
//     - panel (content): fade + translate (optional)
//     Vela handles only the motion lifecycle:
//     safe reflow, transitions, correct transitionend
//     and base state reset.
//
//     She does NOT:
//     - lock/unlock scroll (Latch)
//     - decide when to open/close (Mira/Lyra/Iris do that)
//     - know Onyx/Echo or modal business logic
// ==================================================

// ------------------------------
// Defaults (project-friendly)
// ------------------------------
const DEFAULT_TIMINGS = {
  openMs: 360,
  closeMs: 450, // close mais lento que open para sensação de "resposta"

  // PT: Enter (ease-out) / Leave (ease-in) premium
  // EN: Premium enter (ease-out) / leave (ease-in)
  enterEasing: 'cubic-bezier(0, 0, 0.2, 1)', // ease-out (material-ish)
  leaveEasing: 'cubic-bezier(0.4, 0, 1, 1)', // ease-in
};

const DEFAULT_CLASSES = {
  // PT: Root (overlay) — fade
  // EN: Root (overlay) — fade
  rootEnterFrom: ['opacity-0'],
  rootEnterTo: ['opacity-100'],
  rootExitFrom: ['opacity-100'],
  rootExitTo: ['opacity-0'],

  // PT: Panel (card/painel) — fade + slide
  // EN: Panel (card/panel) — fade + slide
  panelEnterFrom: ['opacity-0', 'translate-y-3', 'sm:translate-y-0', 'sm:scale-95'],
  panelEnterTo: ['opacity-100', 'translate-y-0', 'sm:scale-100'],
  panelExitFrom: ['opacity-100', 'translate-y-0', 'sm:scale-100'],
  panelExitTo: ['opacity-0', 'translate-y-3', 'sm:translate-y-0', 'sm:scale-95'],

  // PT: “Segurança” para evitar click durante close (opcional)
  // EN: “Safety” to prevent clicks during close (optional)
  closingShieldClass: 'pointer-events-none',
};

// ------------------------------
// Internal state (module scope)
// ------------------------------
let isAnimating = false;

// ------------------------------
// Internal helpers
// ------------------------------

function toArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function applyClasses(el, add = [], remove = []) {
  if (!el) return;

  const addList = toArray(add);
  const removeList = toArray(remove);

  if (removeList.length) el.classList.remove(...removeList);
  if (addList.length) el.classList.add(...addList);
}

function setTransition(el, durationMs, easing) {
  if (!el) return;

  // PT: Sem "all" — reduz riscos (só opacity/transform via classes)
  // EN: Avoid "all" — reduces risks (only opacity/transform via classes)
  el.style.transitionDuration = `${Math.max(0, durationMs)}ms`;
  el.style.transitionTimingFunction = easing || '';
}

function clearTransition(el) {
  if (!el) return;
  el.style.transitionDuration = '';
  el.style.transitionTimingFunction = '';
}

function forceReflow(el) {
  if (!el) return;

  // PT: Força o browser a aplicar o estado "from" antes do "to"
  // EN: Forces browser to commit "from" state before switching to "to"
  void el.offsetHeight; // eslint-disable-line no-unused-expressions
}

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
      // PT: Garantir que o transitionend seja do próprio elemento
      // EN: Ensure transitionend is from the element itself
      if (event.target !== el) return;
      cleanup();
    };

    // PT: Fallback — se o browser não disparar transitionend
    // EN: Fallback — if browser doesn't fire transitionend
    const timer = setTimeout(cleanup, safetyMs);

    el.addEventListener('transitionend', onEnd);
  });
}

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

  // PT: Se for fullscreen no mobile, pode desativar translate (só fade)
  // EN: If it's fullscreen on mobile, you can disable translate (fade only)
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

function setBaseOpenState(rootEl, panelEl, classes, timings) {
  // PT: Garantia de transição consistente
  // EN: Ensures consistent transitions
  setTransition(rootEl, timings.openMs, timings.enterEasing);
  setTransition(panelEl, timings.openMs, timings.enterEasing);

  // PT: Aplica estado inicial (from)
  // EN: Apply initial (from) state
  applyClasses(rootEl, classes.rootEnterFrom, classes.rootEnterTo);
  applyClasses(panelEl, classes.panelEnterFrom, classes.panelEnterTo);

  forceReflow(panelEl || rootEl);

  // PT: Vai para o estado final (to)
  // EN: Switch to final (to) state
  applyClasses(rootEl, classes.rootEnterTo, classes.rootEnterFrom);
  applyClasses(panelEl, classes.panelEnterTo, classes.panelEnterFrom);
}

function setBaseCloseState(rootEl, panelEl, classes, timings, preventClickDuringClose) {
  setTransition(rootEl, timings.closeMs, timings.leaveEasing);
  setTransition(panelEl, timings.closeMs, timings.leaveEasing);

  // PT: Garante que estamos "visíveis" antes de fechar
  // EN: Ensure we are "visible" before closing
  applyClasses(rootEl, classes.rootExitFrom, classes.rootExitTo);
  applyClasses(panelEl, classes.panelExitFrom, classes.panelExitTo);

  if (preventClickDuringClose && rootEl) {
    rootEl.classList.add(classes.closingShieldClass);
  }

  forceReflow(panelEl || rootEl);

  // PT: Vai para o estado "to" do close
  // EN: Switch to close "to" state
  applyClasses(rootEl, classes.rootExitTo, classes.rootExitFrom);
  applyClasses(panelEl, classes.panelExitTo, classes.panelExitFrom);
}

function resetAfterOpen(rootEl, panelEl) {
  // PT: Mantém limpo (evita acumular styles)
  // EN: Keep it clean (avoid accumulating styles)
  clearTransition(rootEl);
  clearTransition(panelEl);
}

function resetAfterClose(rootEl, panelEl, classes) {
  clearTransition(rootEl);
  clearTransition(panelEl);

  // PT: Remove o shield de clique (se estiver)
  // EN: Remove click shield (if present)
  if (rootEl) rootEl.classList.remove(classes.closingShieldClass);
}

// ------------------------------
// Helper Timing
// ------------------------------

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 640px)').matches;
}

// timings resolver
function resolveTimings(userTimings = {}) {
  const openMs = userTimings.openMs ?? DEFAULT_TIMINGS.openMs;
  let closeMs = userTimings.closeMs ?? DEFAULT_TIMINGS.closeMs;

  // 📱 Mobile: close mais suave
  if (isMobileViewport()) {
    closeMs = Math.max(closeMs, 540);
  }

  return { openMs, closeMs };
}

// ------------------------------
// Public API (Vela)
// ------------------------------

/**
 * PT: Executa motion de abertura (fade no overlay + motion no painel).
 * EN: Runs open motion (overlay fade + panel motion).
 */
async function openModalMotion(config = {}) {
  if (isAnimating) return;
  isAnimating = true;

  const { rootEl, panelEl, timings, classes } = normalizeConfig(config);

  if (!rootEl || !panelEl) {
    isAnimating = false;
    return;
  }

  // PT: Se o modal estava hidden, quem chama (Mira/Lyra) deve remover hidden/flex antes.
  // EN: If modal was hidden, the caller (Mira/Lyra) must remove hidden/flex before.
  setBaseOpenState(rootEl, panelEl, classes, timings);

  // PT: Espera o panel terminar (padrão: panel é o "dono" do motion)
  // EN: Wait for panel end (panel owns the motion)
  await waitTransitionEnd(panelEl, timings.openMs);

  resetAfterOpen(rootEl, panelEl);
  isAnimating = false;
}

/**
 * PT: Executa motion de fechamento (mais rápido que open).
 * EN: Runs close motion (faster than open).
 */
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

// ------------------------------
// Export pattern (project standard)
// PT: Ordem "mais fácil" (open → close)
// EN: "Easiest" order (open → close)
// ------------------------------
export const VelaModalMotion = {
  openModalMotion,
  closeModalMotion,
};
