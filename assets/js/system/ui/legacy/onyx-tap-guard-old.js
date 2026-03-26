// 🪨 Onyx — Tap Guard
//
// Nível: Jovem
//
// PT: Especialista em gestos de toque.
//     Onyx detecta TAP real e ignora DRAG/SCROLL no mobile.
//     Ele também bloqueia o “ghost click” que alguns navegadores
//     disparam depois de um arrasto.
//
// EN: Touch gesture specialist.
//     Onyx detects real TAP and ignores DRAG/SCROLL on mobile.
//     It also blocks “ghost clicks” some browsers fire after a drag.
// --------------------------------------------------

export function createTapGuard({
  movementThresholdPixels = 10, // PT: px para virar drag | EN: px to become drag
  maximumTapDurationMs = 350, // PT: ms máximo para tap | EN: max ms for tap
  ghostClickBlockDurationMs = 450, // PT: janela anti-ghost | EN: anti-ghost window
} = {}) {
  // ------------------------------
  // Internal state (Onyx)
  // ------------------------------
  let activePointerId = null;

  let startClientX = 0;
  let startClientY = 0;
  let startTimestampMs = 0;

  let movedBeyondThreshold = false;
  let ghostClickBlockedUntilMs = 0;

  function nowMs() {
    return Date.now();
  }

  function resetTracking() {
    activePointerId = null;
    startClientX = 0;
    startClientY = 0;
    startTimestampMs = 0;
    movedBeyondThreshold = false;
  }

  function isBlockedNow() {
    return nowMs() < ghostClickBlockedUntilMs;
  }

  /**
   * PT: Inicia o rastreio no pointerdown.
   * EN: Starts tracking on pointerdown.
   */
  function capturePointerDown(pointerEvent, elementToCapture = null) {
    // PT: ignora o click direito do mouse
    // EN: ignore right mouse click
    if (pointerEvent.pointerType === 'mouse' && pointerEvent.button !== 0) {
      return false;
    }

    activePointerId = pointerEvent.pointerId;
    startClientX = pointerEvent.clientX;
    startClientY = pointerEvent.clientY;
    startTimestampMs = nowMs();
    movedBeyondThreshold = false;

    // PT: captura o ponteiro para este elemento (opcional)
    // EN: capture pointer to this element (optional)
    if (elementToCapture && elementToCapture.setPointerCapture) {
      try {
        elementToCapture.setPointerCapture(activePointerId);
      } catch (_) {}
    }

    return true;
  }

  /**
   * PT: Marca como “drag” quando passou do limite.
   * EN: Marks as “drag” when it passes the threshold.
   */
  function trackPointerMove(pointerEvent) {
    if (activePointerId == null) return;
    if (pointerEvent.pointerId !== activePointerId) return;

    const deltaX = Math.abs(pointerEvent.clientX - startClientX);
    const deltaY = Math.abs(pointerEvent.clientY - startClientY);

    if (deltaX > movementThresholdPixels || deltaY > movementThresholdPixels) {
      movedBeyondThreshold = true;

      // PT: após drag, bloqueia ghost click por uma janela curta
      // EN: after drag, block ghost clicks for a short window
      ghostClickBlockedUntilMs = nowMs() + ghostClickBlockDurationMs;
    }
  }

  /**
   * PT: Avalia no pointerup se foi TAP real.
   * EN: Evaluates on pointerup if it was a real TAP.
   */
  function evaluatePointerUp(pointerEvent) {
    if (activePointerId == null) {
      return { ok: false, reason: 'no_pointer' };
    }

    if (pointerEvent.pointerId !== activePointerId) {
      return { ok: false, reason: 'pointer_mismatch' };
    }

    const durationMs = nowMs() - startTimestampMs;

    // PT: reset cedo para evitar duplo disparo
    // EN: early reset to avoid double firing
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

  /**
   * PT: Bloqueia click fantasma no listener de click (capture=true).
   * EN: Blocks ghost click in a click listener (capture=true).
   */
  function blockGhostClick(clickEvent) {
    if (!isBlockedNow()) return false;

    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    return true;
  }

  /**
   * PT: expõe o estado do bloqueio.
   * EN: exposes the block state.
   */
  function isGhostClickBlocked() {
    return isBlockedNow();
  }

  return {
    capturePointerDown,
    trackPointerMove,
    evaluatePointerUp,
    blockGhostClick,
    isGhostClickBlocked,
  };
}

export const OnyxTapGuard = {
  createTapGuard,
};
