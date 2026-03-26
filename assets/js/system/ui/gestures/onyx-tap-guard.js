// 🪨 Onyx — Tap Guard
//
// Nível / Level: Jovem / Young
//
// PT: Valida toques reais e bloqueia ghost clicks.
// EN: Validates real taps and blocks ghost clicks.

/* -----------------------------------------------------------------------------*/
// Tap Guard Factory
//
// PT: Cria um guardião de toque com regras de TAP e DRAG.
// EN: Creates a touch guard with TAP and DRAG rules.
/* -----------------------------------------------------------------------------*/

// PT: Cria a instância do tap guard.
// EN: Creates the tap guard instance.
function createTapGuard({
  movementThresholdPixels = 10,
  maximumTapDurationMs = 350,
  ghostClickBlockDurationMs = 450,
} = {}) {
  /* -----------------------------------------------------------------------------*/
  // State
  //
  // PT: Estado interno do gesto.
  // EN: Internal gesture state.
  /* -----------------------------------------------------------------------------*/

  let activePointerId = null;

  let startClientX = 0;
  let startClientY = 0;
  let startTimestampMs = 0;

  let movedBeyondThreshold = false;
  let ghostClickBlockedUntilMs = 0;

  /* -----------------------------------------------------------------------------*/
  // Helpers
  //
  // PT: Funções auxiliares do controle de toque.
  // EN: Helper functions for touch control.
  /* -----------------------------------------------------------------------------*/

  // PT: Retorna o tempo atual em milissegundos.
  // EN: Returns current time in milliseconds.
  function nowMs() {
    return Date.now();
  }

  // PT: Limpa o rastreio atual.
  // EN: Resets current tracking.
  function resetTracking() {
    activePointerId = null;
    startClientX = 0;
    startClientY = 0;
    startTimestampMs = 0;
    movedBeyondThreshold = false;
  }

  // PT: Verifica se o bloqueio anti-ghost está ativo.
  // EN: Checks whether anti-ghost blocking is active.
  function isBlockedNow() {
    return nowMs() < ghostClickBlockedUntilMs;
  }

  /* -----------------------------------------------------------------------------*/
  // Gesture Actions
  //
  // PT: Controla o ciclo do gesto de toque.
  // EN: Controls the touch gesture lifecycle.
  /* -----------------------------------------------------------------------------*/

  // PT: Inicia o rastreio no pointerdown.
  // EN: Starts tracking on pointerdown.
  function capturePointerDown(pointerEvent, elementToCapture = null) {
    // PT: Ignora clique direito do mouse.
    // EN: Ignores right mouse click.
    if (pointerEvent.pointerType === 'mouse' && pointerEvent.button !== 0) {
      return false;
    }

    activePointerId = pointerEvent.pointerId;
    startClientX = pointerEvent.clientX;
    startClientY = pointerEvent.clientY;
    startTimestampMs = nowMs();
    movedBeyondThreshold = false;

    // PT: Captura o ponteiro no elemento, se suportado.
    // EN: Captures the pointer on the element if supported.
    if (elementToCapture && elementToCapture.setPointerCapture) {
      try {
        elementToCapture.setPointerCapture(activePointerId);
      } catch (_) {}
    }

    return true;
  }

  // PT: Marca como drag ao ultrapassar o limite.
  // EN: Marks as drag after crossing the threshold.
  function trackPointerMove(pointerEvent) {
    if (activePointerId == null) return;
    if (pointerEvent.pointerId !== activePointerId) return;

    const deltaX = Math.abs(pointerEvent.clientX - startClientX);
    const deltaY = Math.abs(pointerEvent.clientY - startClientY);

    if (deltaX > movementThresholdPixels || deltaY > movementThresholdPixels) {
      movedBeyondThreshold = true;

      // PT: Após drag, bloqueia ghost click por um curto período.
      // EN: After drag, blocks ghost click for a short period.
      ghostClickBlockedUntilMs = nowMs() + ghostClickBlockDurationMs;
    }
  }

  // PT: Avalia no pointerup se foi um TAP válido.
  // EN: Evaluates on pointerup whether it was a valid TAP.
  function evaluatePointerUp(pointerEvent) {
    if (activePointerId == null) {
      return { ok: false, reason: 'no_pointer' };
    }

    if (pointerEvent.pointerId !== activePointerId) {
      return { ok: false, reason: 'pointer_mismatch' };
    }

    const durationMs = nowMs() - startTimestampMs;

    // PT: Limpa cedo para evitar disparo duplicado.
    // EN: Resets early to avoid duplicate firing.
    resetTracking();

    if (movedBeyondThreshold) {
      return { ok: false, reason: 'moved' };
    }

    if (durationMs > maximumTapDurationMs) {
      return { ok: false, reason: 'too_long' };
    }

    if (isBlockedNow()) {
      return { ok: false, reason: 'blocked' };
    }

    return { ok: true, reason: 'tap' };
  }

  // PT: Bloqueia ghost click no listener de click.
  // EN: Blocks ghost click in the click listener.
  function blockGhostClick(clickEvent) {
    if (!isBlockedNow()) return false;

    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    return true;
  }

  // PT: Expõe o estado atual do bloqueio.
  // EN: Exposes current block state.
  function isGhostClickBlocked() {
    return isBlockedNow();
  }

  /* -----------------------------------------------------------------------------*/
  // Return API
  //
  // PT: Retorna a API pública do tap guard.
  // EN: Returns the public tap guard API.
  /* -----------------------------------------------------------------------------*/

  return {
    capturePointerDown,
    trackPointerMove,
    evaluatePointerUp,
    blockGhostClick,
    isGhostClickBlocked,
  };
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const OnyxTapGuard = {
  createTapGuard,
};
