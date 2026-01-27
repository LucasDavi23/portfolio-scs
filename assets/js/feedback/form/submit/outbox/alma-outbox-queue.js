// ==================================================
// 🧠 Alma — Submit Queue Guardian
//
// Nível: Jovem
//
//
// PT: Responsável por guardar tentativas de envio que falharam
//     durante o fluxo de submit do formulário.
//     Alma mantém uma fila local (queue) de payloads pendentes,
//     preservando ordem, integridade e identidade de cada tentativa.
//     Ela NÃO envia dados, NÃO faz retry, NÃO valida domínio
//     e NÃO interage com UI ou API.
//     Seu único papel é organizar, armazenar e devolver
//     os dados pendentes quando solicitada.
//
// EN: Responsible for storing failed submit attempts
//     during the form submission flow.
//     Alma maintains a local queue of pending payloads,
//     preserving order, integrity, and identity of each attempt.
//     She does NOT send data, does NOT retry, does NOT validate domain,
//     and does NOT interact with UI or API.
//     Her sole role is to organize, store, and provide
//     pending data when requested.
// ==================================================

// --------------------------------------------------
// Internal constants
// --------------------------------------------------

/**
 * PT: Chave única usada para persistir a fila no storage local.
 * EN: Unique key used to persist the queue in local storage.
 */

const STORAGE_KEY = 'feedback_submit_outbox_queue';

// --------------------------------------------------
// Internal helpers (storage abstraction)
// --------------------------------------------------

/**
 * PT: Lê a fila atual do storage.
 * EN: Reads the current queue from storage.
 */
function readQueueFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    // PT: Em caso de corrupção, assume fila vazia.
    // EN: In case of corruption, assume empty queue.
    return [];
  }
}

/**
 * PT: Persiste a fila no storage.
 * EN: Persists the queue into storage.
 */
function writeQueueToStorage(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/**
 * PT: Gera um timestamp ISO para controle interno.
 * EN: Generates an ISO timestamp for internal tracking.
 */
function generateTimestamp() {
  return new Date().toISOString();
}

// --------------------------------------------------
// Alma — Internal state
// --------------------------------------------------

/**
 * PT: Estado interno da fila mantido em memória.
 * EN: Internal in-memory queue state.
 */
let submitQueue = readQueueFromStorage();

// --------------------------------------------------
// Alma — Talents (Queue operations)
// --------------------------------------------------

/**
 * 🧠 Talento: Guardar (enqueue)
 *
 * PT: Armazena um payload de submit na fila local.
 *     A ordem de inserção é preservada (FIFO).
 *     Alma não valida o conteúdo nem o motivo do erro.
 *
 * EN: Stores a submit payload into the local queue.
 *     Insertion order is preserved (FIFO).
 *     Alma does not validate content nor failure reason.
 */
function enqueue(payload, meta = {}) {
  if (!payload) return;

  const queueItem = {
    id: payload.clientRequestId || crypto.randomUUID(),
    payload,
    meta,
    createdAt: generateTimestamp(),
  };
  submitQueue.push(queueItem);
  writeQueueToStorage(submitQueue);
}

/**
 * 🧠 Talento: Espiar (peek)
 *
 * PT: Retorna o próximo item da fila sem removê-lo.
 * EN: Returns the next item in the queue without removing it.
 */
function peek() {
  return submitQueue.length > 0 ? submitQueue[0] : null;
}

/**
 * 🧠 Talento: Consumir (dequeue)
 *
 * PT: Remove o primeiro item da fila.
 *     Deve ser chamado somente após confirmação externa de sucesso.
 *
 * EN: Removes the first item from the queue.
 *     Should be called only after external success confirmation.
 */
function dequeue() {
  if (submitQueue.length === 0) return;

  const removedItem = submitQueue.shift();
  writeQueueToStorage(submitQueue);

  return removedItem;
}

/**
 * 🧠 Talento: Remover por ID
 *
 * PT: Remove um item específico da fila usando seu identificador.
 * EN: Removes a specific item from the queue by its identifier.
 */
function removeById(id) {
  if (!id) return;

  submitQueue = submitQueue.filter((item) => item.id !== id);
  writeQueueToStorage(submitQueue);
}

/**
 * 🧠 Talento: Limpar tudo
 *
 * PT: Remove todos os itens da fila.
 * EN: Clears all items from the queue.
 */
function clearQueue() {
  submitQueue = [];
  writeQueueToStorage(submitQueue);
}

/**
 * 🧠 Talento: Estado da fila
 *
 * PT: Retorna o número de itens pendentes.
 * EN: Returns the number of pending items.
 */
function getQueueSize() {
  return submitQueue.length;
}

/**
 * 🧠 Talento: Atualizar Meta do Primeiro Item (updateHeadMeta)
 *
 * PT: Atualiza parcialmente o objeto meta do primeiro item da fila (head),
 *     persistindo no storage. Útil para registrar attempts/backoff.
 *
 * EN: Partially updates the meta object of the first queue item (head),
 *     persisting into storage. Useful to record attempts/backoff.
 */
function updateHeadMeta(metaPatch = {}) {
  if (submitQueue.length === 0) return;

  const head = submitQueue[0];
  const currentMeta = head.meta && typeof head.meta === 'object' ? head.meta : {};

  head.meta = { ...currentMeta, ...(metaPatch || {}) };

  // EN: persist updated queue
  writeQueueToStorage(submitQueue);

  return true;
}

// --------------------------------------------------
// Public API (Alma)
// --------------------------------------------------
// Ordem de uso:
// - enqueue → guarda
// - peek → consulta
// - dequeue / removeById → consome
// - clearQueue → reset
// --------------------------------------------------

export const AlmaOutboxQueue = {
  enqueue,
  peek,
  dequeue,
  removeById,
  clearQueue,
  getQueueSize,
  updateHeadMeta,
};
