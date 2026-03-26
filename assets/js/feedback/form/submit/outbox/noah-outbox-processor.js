// 🧱 Noah — Outbox Processor
//
// Nível / Level: Adulto / Adult
//
// PT: Responsável por processar a outbox de envios pendentes.
//     Consulta a fila da Alma, decide quando tentar novamente,
//     executa reenvios com retry/backoff e remove itens após sucesso.
//     Não armazena dados, não coordena UI, não valida domínio
//     e não renderiza interface.
//     Seu papel é manter o fluxo de envio ativo mesmo após falhas.
//
// EN: Responsible for processing the outbox of pending submissions.
//     Queries Alma's queue, decides when to retry,
//     performs resends with retry/backoff, and removes items after success.
//     Does not store data, does not coordinate UI, does not validate domain,
//     and does not render interface.
//     Its role is to keep the delivery flow alive despite failures.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🧠 Alma — Submit Queue
// Fornece / Provides:
// - peek()
// - dequeue()
// - getQueueSize()
// - updateHeadMeta()
/* -----------------------------------------------------------------------------*/
import { AlmaOutboxQueue } from '/assets/js/feedback/form/submit/outbox/alma-outbox-queue.js';

/* -----------------------------------------------------------------------------*/
// Internal Constants
//
// PT: Configurações padrão de retry e backoff.
// EN: Default retry and backoff settings.
/* -----------------------------------------------------------------------------*/
const DEFAULTS = {
  // PT: Intervalo base em milissegundos entre tentativas.
  // EN: Base interval in milliseconds between attempts.
  baseDelayMs: 2_000,

  // PT: Limite máximo do atraso em milissegundos.
  // EN: Maximum delay cap in milliseconds.
  maxDelayMs: 60_000,

  // PT: Fator de crescimento exponencial.
  // EN: Exponential growth factor.
  backoffFactor: 2,

  // PT: Variação aleatória para evitar tentativas sincronizadas.
  // EN: Random variation to avoid synchronized retries.
  jitterRatio: 0.25,

  // PT: Número máximo de tentativas por item.
  // EN: Maximum number of attempts per item.
  maxAttemptsPerItem: 10,
};

/* -----------------------------------------------------------------------------*/
// Internal State
/* -----------------------------------------------------------------------------*/

let isRunning = false;
let isProcessing = false;
let timerId = null;

let config = { ...DEFAULTS };

// PT: Função de envio injetada externamente.
// EN: Send function injected externally.
//
// Assinatura esperada / Expected signature:
// sendFn(payload, meta) -> Promise<{ ok: boolean, status?: number, error?: any }>
let sendFunction = null;

// PT: Hooks opcionais para integração externa.
// EN: Optional hooks for external integration.
let hooks = {
  onCommitted: null,
};

/* -----------------------------------------------------------------------------*/
// Internal Helpers — Hooks
/* -----------------------------------------------------------------------------*/

// PT: Atualiza os hooks opcionais do processador.
// EN: Updates the processor optional hooks.
function setHooks(nextHooks = {}) {
  hooks = { ...hooks, ...(nextHooks || {}) };
}

/* -----------------------------------------------------------------------------*/
// Internal Helpers — Time and Backoff
/* -----------------------------------------------------------------------------*/

// PT: Aplica variação aleatória ao delay.
// EN: Applies random variation to the delay.
function applyJitter(delayMs, jitterRatio) {
  const jitter = delayMs * jitterRatio;
  const min = delayMs - jitter;
  const max = delayMs + jitter;

  return Math.max(0, Math.floor(min + Math.random() * (max - min)));
}

// PT: Calcula o próximo atraso com backoff exponencial e jitter.
// EN: Computes the next delay using exponential backoff and jitter.
function computeBackoffDelay(attempts) {
  const rawDelay = config.baseDelayMs * Math.pow(config.backoffFactor, Math.max(0, attempts - 1));
  const cappedDelay = Math.min(rawDelay, config.maxDelayMs);

  return applyJitter(cappedDelay, config.jitterRatio);
}

// PT: Agenda o próximo ciclo de execução.
// EN: Schedules the next execution cycle.
function scheduleNextTick(delayMs) {
  clearScheduledTick();

  timerId = setTimeout(() => {
    tick().catch(() => {
      // PT: Erros já são tratados internamente no ciclo.
      // EN: Errors are already handled internally in the cycle.
    });
  }, delayMs);
}

// PT: Limpa qualquer timer pendente.
// EN: Clears any pending timer.
function clearScheduledTick() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
}

/* -----------------------------------------------------------------------------*/
// Internal Helpers — Send
/* -----------------------------------------------------------------------------*/

// PT: Executa o envio com proteção contra exceptions.
// EN: Executes the send operation with protection against exceptions.
async function safeSend(payload, meta) {
  try {
    const result = await sendFunction(payload, meta);

    if (result && result.ok === true) {
      return { ok: true };
    }

    return {
      ok: false,
      error: result?.error,
      status: result?.status,
    };
  } catch (error) {
    return { ok: false, error };
  }
}

/* -----------------------------------------------------------------------------*/
// Core Cycle
//
// PT: Executa um ciclo de processamento da outbox.
// EN: Executes one outbox processing cycle.
/* -----------------------------------------------------------------------------*/
async function tick() {
  if (!isRunning) return;
  if (isProcessing) return;

  isProcessing = true;

  try {
    // PT: Sem sender configurado, Noah apenas reagenda.
    // EN: Without a configured sender, Noah only reschedules.
    if (typeof sendFunction !== 'function') {
      scheduleNextTick(config.baseDelayMs);
      return;
    }

    // PT: Sem itens na fila, entra em modo ocioso.
    // EN: With no items in the queue, enter idle mode.
    if (AlmaOutboxQueue.getQueueSize() === 0) {
      scheduleNextTick(config.baseDelayMs);
      return;
    }

    const queueItem = AlmaOutboxQueue.peek();

    if (!queueItem) {
      scheduleNextTick(config.baseDelayMs);
      return;
    }

    // PT: Normaliza o meta para controle de tentativas.
    // EN: Normalizes meta for attempt tracking.
    const meta = queueItem.meta || {};
    const attempts = Number(meta.attempts || 0);

    // PT: Remove o item se o limite máximo já foi atingido.
    // EN: Removes the item if the maximum attempt limit has been reached.
    if (attempts >= config.maxAttemptsPerItem) {
      AlmaOutboxQueue.dequeue();
      scheduleNextTick(config.baseDelayMs);
      return;
    }

    // PT: Tenta reenviar o item atual.
    // EN: Tries to resend the current item.
    const result = await safeSend(queueItem.payload, meta);

    if (result.ok) {
      // PT: Em caso de sucesso, remove da fila.
      // EN: On success, removes the item from the queue.
      const removedItem = AlmaOutboxQueue.dequeue();

      if (typeof hooks.onCommitted === 'function') {
        hooks.onCommitted(removedItem, result);
      }

      scheduleNextTick(config.baseDelayMs);
      return;
    }

    // PT: Em caso de falha, atualiza metadados e reagenda com backoff.
    // EN: On failure, updates metadata and reschedules with backoff.
    const nextAttempts = attempts + 1;

    AlmaOutboxQueue.updateHeadMeta({
      attempts: nextAttempts,
      lastErrorAt: new Date().toISOString(),
      lastError: String(result.error || 'unknown'),
    });

    const delayMs = computeBackoffDelay(nextAttempts);
    scheduleNextTick(delayMs);
  } catch (error) {
    // PT: Falha inesperada reage com nova tentativa futura.
    // EN: Unexpected failure triggers a future retry.
    scheduleNextTick(config.baseDelayMs);
  } finally {
    isProcessing = false;
  }
}

/* -----------------------------------------------------------------------------*/
// Public API
/* -----------------------------------------------------------------------------*/

// PT: Define a função responsável pelo envio.
// EN: Sets the function responsible for sending.
function setSender(fn) {
  sendFunction = fn;
}

// PT: Atualiza parcialmente a configuração do processador.
// EN: Partially updates the processor configuration.
function configure(partialConfig = {}) {
  config = { ...config, ...(partialConfig || {}) };
}

// PT: Inicia o processamento contínuo da outbox.
// EN: Starts continuous outbox processing.
function start() {
  if (isRunning) return;

  isRunning = true;
  scheduleNextTick(0);
}

// PT: Interrompe o processamento e limpa timers.
// EN: Stops processing and clears timers.
function stop() {
  isRunning = false;
  clearScheduledTick();
}

// PT: Força um novo ciclo imediatamente.
// EN: Forces a new cycle immediately.
function nudge() {
  if (!isRunning) return;

  scheduleNextTick(0);
}

// PT: Retorna o estado atual do processador.
// EN: Returns the current processor state.
function getState() {
  return {
    isRunning,
    isProcessing,
    queueSize: AlmaOutboxQueue.getQueueSize(),
  };
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const NoahOutboxProcessor = {
  setSender,
  setHooks,
  configure,
  start,
  stop,
  nudge,
  getState,
};
