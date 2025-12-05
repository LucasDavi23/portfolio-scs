// /assets/js/feedback/board/main/lia-board-preload-helpers.js
// 🌱 Lia — Aprendiz do Board (Preload)
// PT: Irmã mais nova da Selah. Responsável por buscar o primeiro lote de cards
//     do mural utilizando a Naomi (CardAPI) e manter um cache leve de curto prazo,
//     garantindo que o Board fique rápido e eficiente após o primeiro acesso.
// EN: Younger sister of Selah. Responsible for fetching the initial batch of cards
//     through Naomi (CardAPI) and maintaining a short-lived cache to keep the Board
//     fast and responsive after the first load. Only handles warm-up logic — no DOM.

/**
 * Platforms to warm up.
 * PT: Lista de plataformas usadas no sistema de feedback.
 * EN: List of platforms used by the feedback system.
 */

const PLATFORMS = ['scs', 'ml', 'shopee', 'google'];

/**
 * Interval for periodic warm-up (5 minutes).
 * PT: Intervalo do reaquecimento (5 min).
 * EN: Rewarm interval (5 min).
 */
const WARM_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Warm-up a single platform using both list() and listMeta().
 * PT: Aquece uma única plataforma usando list() e listMeta().
 * EN: Warm a single platform using list() and listMeta().
 */
async function warmSinglePlatform(api, platform, bust) {
  const card = api.list(platform, 1, 1, { fast: 1, _bust: bust });
  const meta = api.listMeta(platform, 1, 1, { fast: 0, _bust: bust });

  await Promise.allSettled([card, meta]);
}

/**
 * Warm all platforms once.
 * PT: Aquece todas as plataformas uma vez.
 * EN: Warm all platforms once.
 */
export async function warmOnce(api) {
  if (!api || typeof api.list !== 'function' || typeof api.listMeta !== 'function') {
    console.warn('[Lia] Invalid API provided to warmOnce.');
    return;
  }

  const bust = Date.now(); // PT: Valor para bust de cache // EN: Value for cache busting
  const tasks = PLATFORMS.map((p) => warmSinglePlatform(api, p, bust)); // PT: Mapeia plataformas para tarefas de aquecimento // EN: Map platforms to warm-up tasks
  await Promise.allSettled(tasks);
}

/**
 * Start the periodic warm loop (every 5 minutes).
 * Returns a function to stop the loop.
 *
 * PT: Inicia o loop de reaquecimento periódico (a cada 5 min).
 *     Retorna uma função para parar o loop.
 *
 * EN: Starts the periodic warm-up loop (every 5 minutes).
 *     Returns a function to stop the loop.
 */
export function startWarmLoop(api, intervalMs = WARM_INTERVAL_MS) {
  if (!api || typeof api.list !== 'function' || typeof api.listMeta !== 'function') {
    console.warn('[Lia] Invalid API provided to startWarmLoop.');
    return () => {};
  }

  let warming = false;

  const timer = setInterval(async () => {
    if (warming) return; // PT: Já está aquecendo // EN: Already warming
    warming = true;

    try {
      const bust = Date.now(); // PT: Valor para bust de cache // EN: Value for cache busting
      const tasks = PLATFORMS.map((p) => warmSinglePlatform(api, p, bust)); // PT: Mapeia plataformas para tarefas de aquecimento // EN: Map platforms to warm-up tasks
      await Promise.allSettled(tasks);
    } finally {
      warming = false;
    }
  }, intervalMs);

  return () => clearInterval(timer); // PT: Função para parar o loop // EN: Function to stop the loop
}

/**
 * Build the cache key for a given platform/page/config.
 * PT: Monta a chave usada no cache global (ex.: "scs:1:1").
 * EN: Builds the key used in the global cache (e.g. "scs:1:1").
 */
// makeCAcheKey = criarChaveDeCache
export function makeCacheKey(platform, page = 1, perPage = 1) {
  return `${platform}:${page}:${perPage}`;
}

/**
 * Ensure there is a global in-memory cache for feedback.
 *
 * PT: Garante que exista um Map global em window.FeedbackCache.
 *     Retorna sempre a mesma instância (compartilhada com o modal, mural, etc.).
 *
 * EN: Ensures there is a global Map at window.FeedbackCache.
 *     Always returns the same instance (shared with modal, board, etc.).
 */
export function ensureCache(globalObj = window) {
  if (!globalObj.FeedbackCache) {
    globalObj.FeedbackCache = new Map(); // PT: Cria o cache global // EN: Create the global cache
  }
  return globalObj.FeedbackCache;
}

/**
 * Preload the first page for each platform into the shared cache.
 *
 * PT: Pré-carrega a primeira página de cada plataforma no cache global
 *     (window.FeedbackCache), para o modal/lista poder abrir imediatamente
 *     usando esses dados já aquecidos.
 *
 * EN: Preloads the first page for each platform into the global cache
 *     (window.FeedbackCache), so the list/modal can open instantly using
 *     this warmed-up data.
 */
export async function preloadFirstPageToCache(api, platforms = PLATFORMS) {
  if (!api || typeof api.list !== 'function') {
    // PT: Valida a API // EN: Validate the API
    console.warn('[Lia] Invalid API provided to preloadFirstPageToCache.');
    return;
  }

  const cache = ensureCache();
  const PAGE = 1;
  const PER_PAGE = 1; // PT: Número de cards por página // EN: Number of cards per page

  // tasks = tarefas
  const tasks = platforms.map(async (plat) => {
    try {
      const items = await api.list(plat, PAGE, PER_PAGE, { fast: 1 });
      const key = makeCacheKey(plat, PAGE, PER_PAGE);
      cache.set(key, items); // PT: Armazena no cache global // EN: Store in global cache
    } catch (error) {
      console.warn(`[Lia] Failed to preload feedback for platform ${plat}:`, error);
    }
  });
  await Promise.allSettled(tasks); // PT: Aguarda todas as tarefas // EN: Wait for all tasks
}

export const LiaPreload = {
  warmOnce,
  startWarmLoop,
  makeCacheKey,
  ensureCache,
  preloadFirstPageToCache,
};
