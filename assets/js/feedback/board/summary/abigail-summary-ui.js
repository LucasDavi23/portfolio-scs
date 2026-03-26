/* -----------------------------------------------------------------------------*/
// 🌟 Abigaíl — Summary UI
//
// Nível / Level: Adulto / Adult
//
// PT: Abigaíl cuida da interface do summary com clareza:
// - encontra os elementos do DOM,
// - aplica média, estrelas, barras e contadores,
// - exibe fallback visual,
// - coordena cache, rede e atualização manual.
//
// EN: Abigail handles the summary UI with clarity:
// - finds DOM elements,
// - applies average, stars, bars and counters,
// - displays visual fallback,
// - coordinates cache, network and manual refresh.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Athenais — Summary Helpers
// Fornece / Provides:
// - loadSummaryFromCache()
// - loadSummarySnapshot()
// - saveSummaryToCache()
// - fetchSummaryMetaWithRetry()
// - buildSummaryFromResponse()
/* -----------------------------------------------------------------------------*/
import { AthenaisSummaryHelpers } from '/assets/js/feedback/board/summary/athenais-summary-helpers.js';

/* -----------------------------------------------------------------------------*/
// Zoe — Rating UI
// Fornece / Provides:
// - renderRating()
/* -----------------------------------------------------------------------------*/
import { ZoeRating } from '/assets/js/system/ui/rating/zoe-rating.js';

/* -----------------------------------------------------------------------------*/
// Logger — System Logger
// Fornece / Provides:
// - warn(section, persona, message, error?)
// - error(section, persona, message, error?)
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

/* -----------------------------------------------------------------------------*/
// 📡 App Events — System Tool
// Fornece / Provides:
// - onAppEvent()
/* -----------------------------------------------------------------------------*/
import { AppEvents } from '/assets/js/system/events/appEvents.js';

/* -----------------------------------------------------------------------------*/
// Module State
/* -----------------------------------------------------------------------------*/

// PT: Mantém a instância ativa do controller do summary.
// EN: Stores the active summary controller instance.
let activeSummaryController = null;

// PT: Controla o debounce do refresh em tempo real.
// EN: Controls realtime refresh debounce.
let summaryRefreshTimer = null;

/* -----------------------------------------------------------------------------*/
// DOM Helpers
/* -----------------------------------------------------------------------------*/

// PT: Coleta os elementos principais do summary.
// EN: Collects the main summary elements.
function getSummaryElements() {
  const avgElement = document.querySelector('[data-sum-avg]');
  const starsElement = document.querySelector('[data-sum-stars]');
  const totalElement = document.querySelector('[data-sum-total]');

  return {
    avgElement,
    starsElement,
    totalElement,
  };
}

// PT: Cria um mapa de elementos por estrela.
// EN: Builds an element map by star value.
function createStarElementMap(selector, datasetKey) {
  const elements = document.querySelectorAll(selector);
  const elementMap = {};

  elements.forEach((element) => {
    const star = Number(element.dataset[datasetKey]);

    if (star >= 1 && star <= 5) {
      elementMap[star] = element;
    }
  });

  return elementMap;
}

// PT: Verifica se os elementos principais existem.
// EN: Verifies whether the main elements exist.
function hasRequiredElements(elements) {
  return elements.avgElement && elements.starsElement && elements.totalElement;
}

/* -----------------------------------------------------------------------------*/
// UI Render
/* -----------------------------------------------------------------------------*/

// PT: Renderiza o estado vazio do summary.
// EN: Renders the empty state of the summary.
function renderEmptySummary({ avgElement, starsElement, totalElement, barMap, countMap }) {
  avgElement.textContent = '-';
  starsElement.innerHTML = ZoeRating.renderRating(0, {
    showValue: false,
    size: 'lg',
  });
  totalElement.textContent = '0';

  for (let star = 1; star <= 5; star++) {
    if (countMap[star]) countMap[star].textContent = '0';
    if (barMap[star]) barMap[star].style.width = '0%';
  }
}

// PT: Renderiza o summary no DOM.
// EN: Renders the summary into the DOM.
function applySummaryToDOM(summary, { avgElement, starsElement, totalElement, barMap, countMap }) {
  const { avg, total, buckets } = summary;

  if (!total) {
    renderEmptySummary({ avgElement, starsElement, totalElement, barMap, countMap });
    return;
  }

  avgElement.textContent = avg.toFixed(1).replace('.', ',');
  starsElement.innerHTML = ZoeRating.renderRating(avg, {
    showValue: false,
    size: 'lg',
  });
  totalElement.textContent = String(total);

  for (let star = 1; star <= 5; star++) {
    const count = buckets[star] ?? 0;

    if (countMap[star]) {
      countMap[star].textContent = String(count);
    }

    if (barMap[star]) {
      const percent = (count / total) * 100;
      barMap[star].style.width = `${percent.toFixed(2)}%`;
    }
  }
}

/* -----------------------------------------------------------------------------*/
// Summary Flow
/* -----------------------------------------------------------------------------*/

// PT: Cria o controlador principal do summary.
// EN: Creates the main summary controller.
function createSummaryController() {
  const elements = getSummaryElements();

  if (!hasRequiredElements(elements)) {
    Logger.warn('Summary', 'Abigail', 'Required summary elements were not found.');
    return null;
  }

  const barMap = createStarElementMap('[data-sum-bar]', 'sumBar');
  const countMap = createStarElementMap('[data-sum-count]', 'sumCount');

  const domContext = {
    ...elements,
    barMap,
    countMap,
  };

  // PT: Carrega o summary com cache, rede e fallback.
  // EN: Loads the summary using cache, network and fallback.
  async function loadSummary({ forceNetwork = false } = {}) {
    let usedCache = false;

    if (!forceNetwork) {
      const cachedSummary = AthenaisSummaryHelpers.loadSummaryFromCache();

      if (cachedSummary) {
        applySummaryToDOM(cachedSummary, domContext);
        usedCache = true;
      }
    }

    try {
      const responseData = await AthenaisSummaryHelpers.fetchSummaryMetaWithRetry({
        forceFresh: forceNetwork,
      });

      const summary = AthenaisSummaryHelpers.buildSummaryFromResponse(responseData);

      applySummaryToDOM(summary, domContext);
      AthenaisSummaryHelpers.saveSummaryToCache(summary);
    } catch (error) {
      Logger.error('Summary', 'Abigail', 'Failed to update summary UI.', error);

      if (!usedCache) {
        const snapshot = AthenaisSummaryHelpers.loadSummarySnapshot();

        if (snapshot) {
          applySummaryToDOM(snapshot, domContext);
        } else {
          renderEmptySummary(domContext);
        }
      }
    }
  }

  return {
    loadSummary,
  };
}

/* -----------------------------------------------------------------------------*/
// Refresh
/* -----------------------------------------------------------------------------*/

// PT: Força atualização manual do summary.
// EN: Forces a manual summary refresh.
function refreshSummary() {
  if (!activeSummaryController) {
    Logger.warn(
      'Summary',
      'Abigail',
      'Manual refresh was ignored because the controller is not ready.'
    );
    return;
  }

  activeSummaryController.loadSummary({ forceNetwork: true });
}

/* -----------------------------------------------------------------------------*/
// Events
/* -----------------------------------------------------------------------------*/

// PT: Reage a feedbacks confirmados e atualiza o summary.
// EN: Reacts to committed feedback and refreshes the summary.
function bindSummaryEvents() {
  AppEvents.onAppEvent('feedback:committed', () => {
    clearTimeout(summaryRefreshTimer);

    summaryRefreshTimer = setTimeout(() => {
      refreshSummary();
    }, 250);
  });
}

/* -----------------------------------------------------------------------------*/
// Init
/* -----------------------------------------------------------------------------*/

// PT: Inicializa a interface do summary.
// EN: Initializes the summary UI.
function initSummaryUI() {
  activeSummaryController = createSummaryController();
  if (!activeSummaryController) return;

  bindSummaryEvents();
  activeSummaryController.loadSummary();
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const AbigailSummaryUI = {
  initSummaryUI,
  refreshSummary,
};
