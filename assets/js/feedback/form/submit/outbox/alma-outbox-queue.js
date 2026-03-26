/* -----------------------------------------------------------------------------*/
// 🧠 Alma — Submit Queue Guardian
//
// Nível / Level: Jovem / Young
//
// PT: Responsável por armazenar tentativas de envio que falharam
//     durante o fluxo de submit do formulário.
//     Mantém uma fila local de payloads pendentes,
//     preservando ordem, integridade e identidade.
//     Não envia dados, não faz retry, não valida domínio
//     e não interage com UI ou API.
//
// EN: Responsible for storing failed submit attempts
//     during the form submission flow.
//     Maintains a local queue of pending payloads,
//     preserving order, integrity and identity.
//     Does not send data, does not retry, does not validate domain
//     and does not interact with UI or API.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 📟 UUID — Unique Identifier Utility
// Fornece / Provides:
// - generateUUID()
/* -----------------------------------------------------------------------------*/
import { generateUUID } from '/assets/js/system/utils/uuid.js';

/* -----------------------------------------------------------------------------*/
// Constants
//
// PT: Constantes internas da fila.
// EN: Internal queue constants.
/* -----------------------------------------------------------------------------*/

// PT: Chave usada para persistir a fila no localStorage.
// EN: Key used to persist the queue in localStorage.
const STORAGE_KEY = 'feedback_submit_outbox_queue';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares de leitura e persistência da fila.
// EN: Helper functions for queue reading and persistence.
/* -----------------------------------------------------------------------------*/

// PT: Lê a fila atual do storage local.
// EN: Reads the current queue from local storage.
function readQueueFromStorage() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    return rawValue ? JSON.parse(rawValue) : [];
  } catch (_error) {
    return [];
  }
}

// PT: Persiste a fila atual no storage local.
// EN: Persists the current queue into local storage.
function writeQueueToStorage(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

// PT: Gera timestamp ISO para rastreamento interno.
// EN: Generates an ISO timestamp for internal tracking.
function generateTimestamp() {
  return new Date().toISOString();
}

/* -----------------------------------------------------------------------------*/
// Queue State
//
// PT: Estado interno da fila mantido em memória.
// EN: Internal in-memory queue state.
/* -----------------------------------------------------------------------------*/

let submitQueue = readQueueFromStorage();

/* -----------------------------------------------------------------------------*/
// Public API
//
// PT: Operações públicas da fila local de submits.
// EN: Public operations for the local submit queue.
/* -----------------------------------------------------------------------------*/

// PT: Adiciona um payload na fila local, preservando a ordem.
// EN: Adds a payload to the local queue, preserving order.
function enqueue(payload, meta = {}) {
  if (!payload) {
    return;
  }

  const queueItem = {
    id: payload.clientRequestId || generateUUID(),
    payload,
    meta,
    createdAt: generateTimestamp(),
  };

  submitQueue.push(queueItem);
  writeQueueToStorage(submitQueue);
}

// PT: Retorna o primeiro item da fila sem removê-lo.
// EN: Returns the first queue item without removing it.
function peek() {
  return submitQueue.length > 0 ? submitQueue[0] : null;
}

// PT: Remove e retorna o primeiro item da fila.
// EN: Removes and returns the first queue item.
function dequeue() {
  if (submitQueue.length === 0) {
    return;
  }

  const removedItem = submitQueue.shift();
  writeQueueToStorage(submitQueue);

  return removedItem;
}

// PT: Remove um item específico da fila pelo ID.
// EN: Removes a specific queue item by ID.
function removeById(id) {
  if (!id) {
    return;
  }

  submitQueue = submitQueue.filter((queueItem) => queueItem.id !== id);
  writeQueueToStorage(submitQueue);
}

// PT: Limpa todos os itens da fila.
// EN: Clears all items from the queue.
function clearQueue() {
  submitQueue = [];
  writeQueueToStorage(submitQueue);
}

// PT: Retorna a quantidade de itens pendentes.
// EN: Returns the number of pending items.
function getQueueSize() {
  return submitQueue.length;
}

// PT: Atualiza parcialmente o meta do primeiro item da fila.
// EN: Partially updates the meta of the first queue item.
function updateHeadMeta(metaPatch = {}) {
  if (submitQueue.length === 0) {
    return;
  }

  const headItem = submitQueue[0];
  const currentMeta = headItem.meta && typeof headItem.meta === 'object' ? headItem.meta : {};

  headItem.meta = {
    ...currentMeta,
    ...(metaPatch || {}),
  };

  writeQueueToStorage(submitQueue);

  return true;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const AlmaOutboxQueue = {
  enqueue,
  peek,
  dequeue,
  removeById,
  clearQueue,
  getQueueSize,
  updateHeadMeta,
};
