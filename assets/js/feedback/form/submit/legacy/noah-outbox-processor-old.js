// ==================================================
// 🧱 Noah — Outbox Processor
//
// Nível: Adulto
//
//
// PT: Especialista em persistência e entrega eventual.
//     Noah processa a Outbox: consulta a Alma, decide quando tentar,
//     executa reenvios com retry/backoff e remove da fila quando há sucesso.
//     Ele NÃO guarda dados (isso é Alma), NÃO coordena submit UI,
//     NÃO valida domínio do formulário e NÃO renderiza interface.
//     Seu papel é manter o fluxo vivo apesar de falhas.
//
// EN: Specialist in persistence and eventual delivery.
//     Noah processes the Outbox: queries Alma, decides when to retry,
//     executes resends with retry/backoff, and removes items on success.
//     He does NOT store data (that's Alma), does NOT coordinate submit UI,
//     does NOT validate form domain, and does NOT touch UI.
//     His role is to keep the flow alive despite failures.
// ==================================================

// 🧠 Alma — Submit Queue
// Provides:
// - enqueue,
// - peek,
// - dequeue,
// - removeById,
// - clearQueue,
// - getQueueSize,

import { AlmaOutboxQueue } from '/assets/js/feedback/form/submit/outbox/alma-outbox-queue.js';

// --------------------------------------------------
// Internal constants (defaults)
// --------------------------------------------------

/**
 * PT: Configurações padrão de retry/backoff.
 * EN: Default retry/backoff settings.
 */
const DEFAULTS = {
  // PT: intervalo base (ms) entre tentativas
  // EN: base interval (ms) between attempts
  baseDelayMs: 2_000,

  // PT: teto máximo do atraso (ms)
  // EN: max delay cap (ms)
  maxDelayMs: 60_000,

  // PT: fator de crescimento exponencial
  // EN: exponential growth factor
  backoffFactor: 2,

  // PT: jitter aleatório para evitar "thundering herd"
  // EN: random jitter to avoid thundering herd
  jitterRatio: 0.25,

  // PT: limite de tentativas por item antes de "desistir"
  // EN: max attempts per item before giving up
  maxAttemptsPerItem: 10,
};

// --------------------------------------------------
// Internal state
// --------------------------------------------------

let isRunning = false;
let isProcessing = false;
let timerId = null;

let config = { ...DEFAULTS };

/**
 * PT: Função de envio injetada (ex: Gael).
 * EN: Injected send function (e.g., Gael).
 *
 * Assinatura esperada:
 * sendFn(payload, meta) -> Promise<{ ok: boolean, status?: number, error?: any }>
 */
let sendFn = null;

/**
 * PT: Hooks opcionais (Noah não toca UI).
 * EN: Optional hooks (Noah does not touch UI).
 */
let hooks = {
  onCommitted: null,
};

/**
 * 🧱 Talento interno: Configurar hooks
 *
 * PT: Permite que um orquestrador (ex: Selene/Liora) receba callbacks
 *     quando Noah concluir uma entrega (commit).
 *
 * EN: Allows an orchestrator (e.g., Selene/Liora) to receive callbacks
 *     when Noah completes a commit.
 */
function setHooks(nextHooks = {}) {
  hooks = { ...hooks, ...(nextHooks || {}) };
}

// --------------------------------------------------
// Internal helpers (time & backoff)
// --------------------------------------------------

/**
 * PT: Obtém timestamp em ms.
 * EN: Gets current timestamp in ms.
 */
function nowMs() {
  return Date.now();
}

/**
 * PT: Gera jitter aleatório em torno do delay.
 * EN: Generates random jitter around delay.
 */
function applyJitter(delayMs, jitterRatio) {
  const jitter = delayMs * jitterRatio;
  const min = delayMs - jitter;
  const max = delayMs + jitter;
  return Math.max(0, Math.floor(min + Math.random() * (max - min)));
}

/**
 * PT: Calcula o próximo delay com backoff exponencial + jitter.
 * EN: Computes next delay with exponential backoff + jitter.
 */
function computeBackoffDelay(attempts) {
  const raw = config.baseDelayMs * Math.pow(config.backoffFactor, Math.max(0, attempts - 1));
  const capped = Math.min(raw, config.maxDelayMs);
  return applyJitter(capped, config.jitterRatio);
}

/**
 * PT: Agenda a próxima execução do loop.
 * EN: Schedules the next loop execution.
 */
function scheduleNextTick(delayMs) {
  clearScheduledTick();
  timerId = window.setTimeout(() => {
    // PT/EN: execute one cycle
    tick().catch(() => {
      // PT: erros já tratados internamente
      // EN: errors are handled internally
    });
  }, delayMs);
}

/**
 * PT: Limpa qualquer timer pendente.
 * EN: Clears any pending timer.
 */
function clearScheduledTick() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
}

// --------------------------------------------------
// Noah — Core cycle (tick)
// --------------------------------------------------

/**
 * PT: Executa um ciclo de processamento.
 * EN: Runs one processing cycle.
 */
async function tick() {
  if (!isRunning) return;
  if (isProcessing) return; // EN: prevent re-entrancy

  isProcessing = true;

  try {
    // PT: Se não há sender, Noah não pode agir.
    // EN: If no sender is configured, Noah can't act.
    if (typeof sendFn !== 'function') {
      // EN: try again later
      scheduleNextTick(config.baseDelayMs);
      return;
    }

    // PT: Se fila vazia, entra em modo "idle".
    // EN: If queue is empty, go idle.
    if (AlmaOutboxQueue.getQueueSize() === 0) {
      scheduleNextTick(config.baseDelayMs);
      return;
    }

    const item = AlmaOutboxQueue.peek();
    if (!item) {
      // EN: try again later
      scheduleNextTick(config.baseDelayMs);
      return;
    }

    // PT: Normaliza meta (controle de tentativas).
    // EN: Normalize meta (attempt tracking).
    const meta = item.meta || {};
    const attempts = Number(meta.attempts || 0);

    // PT: Se excedeu tentativas, remove (ou poderia "quarentenar").
    // EN: If max attempts exceeded, remove (or quarantine).
    if (attempts >= config.maxAttemptsPerItem) {
      AlmaOutboxQueue.dequeue();

      scheduleNextTick(config.baseDelayMs);
      return;
    }

    // PT: Tenta enviar.
    // EN: Try to send.
    const result = await safeSend(item.payload, meta);

    if (result.ok) {
      // PT: Sucesso → remove da fila.
      // EN: Success → remove from queue.
      const removedItem = AlmaOutboxQueue.dequeue();

      if (typeof hooks.onCommitted === 'function') {
        hooks.onCommitted(removedItem, result);
      }

      scheduleNextTick(config.baseDelayMs);
      return;
    }

    // PT: Falhou → atualiza attempts e re-agenda com backoff.
    // EN: Failed → update attempts and reschedule with backoff.
    const nextAttempts = attempts + 1;

    AlmaOutboxQueue.updateHeadMeta({
      attempts: nextAttempts,
      lastErrorAt: new Date().toISOString(),
      lastError: String(result.error || 'unknown'),
    });

    // PT: Persistir o "attempts" precisa de update na Alma.
    // EN: Persisting "attempts" requires an update method in Alma.
    // Estratégia (temporária): remove + re-enqueue mantendo ordem? NÃO.
    // Melhor: criar Alma.updateHeadMeta(metaPatch).
    // Aqui deixamos pendente para implementar no passo seguinte.

    const delayMs = computeBackoffDelay(nextAttempts);
    scheduleNextTick(delayMs);
  } catch (error) {
    // PT: Falha inesperada → re-tenta depois.
    // EN: Unexpected failure → retry later.
    scheduleNextTick(config.baseDelayMs);
  } finally {
    isProcessing = false;
  }
}

/**
 * PT: Envio protegido (não deixa exception explodir).
 * EN: Protected send (prevents exceptions from bubbling).
 */
async function safeSend(payload, meta) {
  try {
    const result = await sendFn(payload, meta);
    if (result && result.ok === true) return { ok: true };
    return { ok: false, error: result?.error, status: result?.status };
  } catch (error) {
    return { ok: false, error };
  }
}

// --------------------------------------------------
// Public API (Noah)
// --------------------------------------------------

/**
 * 🧱 Talento: Configurar Sender
 *
 * PT: Injeta a função responsável por enviar (ex: Gael).
 * EN: Injects the sender function responsible for sending (e.g., Gael).
 */
function setSender(fn) {
  sendFn = fn;
}

/**
 * 🧱 Talento: Ajustar Config
 *
 * PT: Sobrescreve parcial dos defaults (backoff, limites, etc).
 * EN: Partially overrides defaults (backoff, limits, etc).
 */
function configure(partial = {}) {
  config = { ...config, ...(partial || {}) };
}

/**
 * 🧱 Talento: Iniciar
 *
 * PT: Inicia o processamento contínuo da Outbox.
 * EN: Starts continuous Outbox processing.
 */
function start() {
  if (isRunning) return;
  isRunning = true;

  // PT/EN: start immediately
  scheduleNextTick(0);
}

/**
 * 🧱 Talento: Parar
 *
 * PT: Para o processamento e limpa timers.
 * EN: Stops processing and clears timers.
 */
function stop() {
  isRunning = false;
  clearScheduledTick();
}

/**
 * 🧱 Talento: Forçar um ciclo
 *
 * PT: Executa um ciclo imediatamente (útil após enqueue).
 * EN: Runs one cycle immediately (useful after enqueue).
 */
function nudge() {
  if (!isRunning) return;
  scheduleNextTick(0);
}

/**
 * 🧱 Talento: Estado
 *
 * PT: Retorna estado atual para debug/control.
 * EN: Returns current state for debug/control.
 */
function getState() {
  return {
    isRunning,
    isProcessing,
    queueSize: AlmaOutboxQueue.getQueueSize(),
  };
}

export const NoahOutboxProcessor = {
  setSender,
  setHooks,
  configure,
  start,
  stop,
  nudge,
  getState,
};
