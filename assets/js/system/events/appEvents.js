// ==================================================
// 📡 App Events — System Tool
//
// PT: Camada de eventos do sistema para comunicação interna.
//     Encapsula emissão e escuta de eventos customizados.
//
// EN: System event layer for internal communication.
//     Wraps custom event emit/listen logic.
//
// Fornece / Provides:
// - emitAppEvent()
// - onAppEvent()
// - offAppEvent()
// - onceAppEvent()
//
// Tipo / Type: Ferramenta (Tool)
// ==================================================

/* -----------------------------------------------------------------------------*/
// Emit
//
// PT: Dispara um evento global com dados opcionais.
// EN: Dispatches a global event with optional payload.
/* -----------------------------------------------------------------------------*/
function emitAppEvent(name, detail = null) {
  if (!name) return;

  try {
    const event = new CustomEvent(name, { detail });
    window.dispatchEvent(event);
  } catch (_) {
    // PT: Falha silenciosa para não interromper o fluxo.
    // EN: Silent failure to avoid interrupting the flow.
  }
}

/* -----------------------------------------------------------------------------*/
// Listen
//
// PT: Escuta um evento global.
// EN: Listens to a global event.
/* -----------------------------------------------------------------------------*/
function onAppEvent(name, handler, options) {
  if (!name || typeof handler !== 'function') return;

  window.addEventListener(name, handler, options);
}

/* -----------------------------------------------------------------------------*/
// Remove Listener
//
// PT: Remove um listener previamente registrado.
// EN: Removes a previously registered listener.
/* -----------------------------------------------------------------------------*/
function offAppEvent(name, handler, options) {
  if (!name || typeof handler !== 'function') return;

  window.removeEventListener(name, handler, options);
}

/* -----------------------------------------------------------------------------*/
// Once
//
// PT: Escuta um evento apenas uma vez.
// EN: Listens to an event only once.
/* -----------------------------------------------------------------------------*/
function onceAppEvent(name, handler) {
  if (!name || typeof handler !== 'function') return;

  const onceHandler = (event) => {
    try {
      handler(event);
    } finally {
      window.removeEventListener(name, onceHandler);
    }
  };

  window.addEventListener(name, onceHandler);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const AppEvents = {
  emitAppEvent,
  onAppEvent,
  offAppEvent,
  onceAppEvent,
};
