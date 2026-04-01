/* -----------------------------------------------------------------------------*/
// 🌱 Lia — Board Preload
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Responsável pelo aquecimento inicial do Board e pelo preload leve
//     da primeira página via Naomi, usando um cache compartilhado.
//
// EN: Responsible for the initial Board warm-up and light first-page
//     preload through Naomi, using a shared cache.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Platforms
//
// PT: Plataformas usadas no sistema de feedback.
// EN: Platforms used by the feedback system.
/* -----------------------------------------------------------------------------*/
const PLATFORMS = ['scs', 'ml', 'shopee', 'google'];

/* -----------------------------------------------------------------------------*/
// Warm Interval
//
// PT: Intervalo do reaquecimento periódico.
// EN: Periodic rewarm interval.
/* -----------------------------------------------------------------------------*/
const WARM_INTERVAL_MS = 5 * 60 * 1000;

/* -----------------------------------------------------------------------------*/
// API Validation
//
// PT: Valida se a API possui os métodos necessários.
// EN: Validates whether the API has the required methods.
/* -----------------------------------------------------------------------------*/
function hasListApi(api) {
  return !!api && typeof api.list === 'function';
}

function hasWarmApi(api) {
  return hasListApi(api) && typeof api.listMeta === 'function';
}

/* -----------------------------------------------------------------------------*/
// Warm Single Platform
//
// PT: Aquece uma única plataforma com list() e listMeta().
// EN: Warms a single platform using list() and listMeta().
/* -----------------------------------------------------------------------------*/
async function warmSinglePlatform(api, platform, cacheBust) {
  const cardRequest = api.list(platform, 1, 1, { fast: 1, _bust: cacheBust });
  const metaRequest = api.listMeta(platform, 1, 1, { fast: 0, _bust: cacheBust });

  await Promise.allSettled([cardRequest, metaRequest]);
}

/* -----------------------------------------------------------------------------*/
// Warm Once
//
// PT: Aquece todas as plataformas uma vez.
// EN: Warms all platforms once.
/* -----------------------------------------------------------------------------*/
async function warmOnce(api) {
  if (!hasWarmApi(api)) return;

  const cacheBust = Date.now();
  const tasks = PLATFORMS.map((platform) => warmSinglePlatform(api, platform, cacheBust));

  await Promise.allSettled(tasks);
}

/* -----------------------------------------------------------------------------*/
// Start Warm Loop
//
// PT: Inicia o loop de reaquecimento periódico.
// Retorna uma função para encerrar o loop.
//
// EN: Starts the periodic warm-up loop.
// Returns a function to stop the loop.
/* -----------------------------------------------------------------------------*/
function startWarmLoop(api, intervalMs = WARM_INTERVAL_MS) {
  if (!hasWarmApi(api)) return () => {};

  let warming = false;

  const intervalId = setInterval(async () => {
    if (warming) return;
    warming = true;

    try {
      const cacheBust = Date.now();
      const tasks = PLATFORMS.map((platform) => warmSinglePlatform(api, platform, cacheBust));

      await Promise.allSettled(tasks);
    } finally {
      warming = false;
    }
  }, intervalMs);

  return () => clearInterval(intervalId);
}

/* -----------------------------------------------------------------------------*/
// Cache Key
//
// PT: Monta a chave usada no cache compartilhado.
// EN: Builds the key used in the shared cache.
/* -----------------------------------------------------------------------------*/
function makeCacheKey(platform, page = 1, perPage = 1) {
  return `${platform}:${page}:${perPage}`;
}

/* -----------------------------------------------------------------------------*/
// Shared Cache
//
// PT: Cache interno do módulo (não global)
// EN: Internal module cache (not global)
/* -----------------------------------------------------------------------------*/
let internalCache = null;

function ensureCache() {
  if (!internalCache) {
    internalCache = new Map();
  }

  return internalCache;
}

/* -----------------------------------------------------------------------------*/
// Preload First Page
//
// PT: Pré-carrega a primeira página de cada plataforma no cache compartilhado.
// EN: Preloads the first page of each platform into the shared cache.
/* -----------------------------------------------------------------------------*/
async function preloadFirstPageToCache(api, platforms = PLATFORMS) {
  if (!hasListApi(api)) return;

  const cache = ensureCache();
  const page = 1;
  const perPage = 1;

  const tasks = platforms.map(async (platform) => {
    try {
      const items = await api.list(platform, page, perPage, { fast: 1 });
      const key = makeCacheKey(platform, page, perPage);
      cache.set(key, items);
    } catch {
      // PT: Falha de preload não deve quebrar o Board.
      // EN: Preload failure should not break the Board.
    }
  });

  await Promise.allSettled(tasks);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/
export const LiaPreload = {
  warmOnce,
  startWarmLoop,
  makeCacheKey,
  ensureCache,
  preloadFirstPageToCache,
};
