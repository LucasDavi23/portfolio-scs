// 🌟 Abigaíl — Guardiã do Summary de Avaliações
//
// PT: Abigaíl representa clareza, ordem e apresentação. Ela NÃO calcula dados
//     nem fala com a rede — isso é papel da Athenais (Athenais-summary-helpers.js).
//     Aqui, Abigaíl cuida APENAS da interface:
//       • encontra os elementos do DOM,
//       • aplica a média, barras e contadores,
//       • exibe fallback visual quando necessário,
//       • coordena o fluxo geral (cache → rede → DOM),
//       • e permite atualizações manuais (refresh).
//
// EN: Abigail represents clarity, structure and presentation. She does NOT
//     compute data nor talk to the network — that is Athenais's task
//     (Athenais-summary-helpers.js). Here, Abigail handles ONLY the UI layer:
//       • locates DOM elements,
//       • applies average, bars and counters,
//       • displays visual fallback when needed,
//       • orchestrates the overall flow (cache → network → DOM),
//       • and allows manual refreshes.

// -------------------------------------------------------------
// imports / importações
// -------------------------------------------------------------

// EndpointConfig — Configuração do Endpoint (Camada de Infra)
// Fornece:
// - set(url)
// - get()
import { EndpointConfig } from '/assets/js/feedback/core/config/feedback-endpoint.js';

/* -----------------------------------------------------------------------------*/
// Athenais — Summary Helpers (Logic Layer)
// Athenais fornece:
// - loadSummaryFromCache()
// - loadSummarySnapshot()
// - saveSummarytoCache()
// - fetchSummaryWithRetry()
// - fetchSummaryMetaWithRetry()
// - buildSummaryFromResponse()

import { AthenaisSummaryHelpers } from '/assets/js/feedback/board/summary/athenais-summary-helpers.js';

// -----------------------------------------------------------------------------
// ⭐ Zoe — rating UI do system (avaliações por estrelas)
// EN ⭐ Zoe — system rating UI (star-based ratings)
// Fornece:
//  - renderRating()
//  - normalizeRating()
//  - mountInput()

import { ZoeRating } from '/assets/js/system/ui/rating/zoe-rating.js';

// -----------------------------------------------------------------------------

console.log('summary.js: carregado / loaded. (Abigaíl entrou em ação)');

// PT: Função principal de inicialização da UI do summary.
// EN: Main initialization function for the summary UI.
function initSummaryUI() {
  // -------------------------------------------------------------------
  // 0. Verifica se o endpoint está definido
  // -------------------------------------------------------------------
  // PT: Endpoint global definido em feedbackAPI.js (exposto no window).
  // EN: Global endpoint defined in feedbackAPI.js (exposed on window).
  const ENDPOINT = EndpointConfig.get();

  // PT: Se por algum motivo o endpoint não existir, avisamos e abortamos.
  // EN: If for some reason the endpoint is missing, we warn and abort.
  if (!ENDPOINT) {
    console.warn('summary.js: FEEDBACK_ENDPOINT não definido / not defined.');
    return;
  }

  // ============================================================
  // 1. CAPTURA DOS ELEMENTOS DO DOM
  // ============================================================
  const avgEl = document.querySelector('[data-sum-avg]');
  const starsEl = document.querySelector('[data-sum-stars]');
  const totalEl = document.querySelector('[data-sum-total]');

  if (!avgEl || !starsEl || !totalEl) {
    console.warn('summary.js: elementos principais (data-sum-avg/stars/total) não encontrado.');
    return;
  }

  // PT: Coletamos todas as barras e contadores por estrela (5★, 4★, 3★...).
  //     Depois transformamos em dois mapas:
  //     - barMap[5]  -> <div data-sum-bar="5">
  //     - countMap[5]-> <span data-sum-count="5">
  //
  // EN: We collect all bars and counters per star (5★, 4★, 3★...).
  //     Then we build two maps:
  //     - barMap[5]  -> <div data-sum-bar="5">
  //     - countMap[5]-> <span data-sum-count="5">
  const barEls = document.querySelectorAll('[data-sum-bar]');
  const countEls = document.querySelectorAll('[data-sum-count]');

  const barMap = {}; // { estrela: elementoBarra }
  barEls.forEach((el) => {
    // PT: Para cada barra...
    const star = Number(el.dataset.sumBar); // PT: Pegamos a estrela (1-5).
    if (star >= 1 && star <= 5) {
      // PT: Válido?
      barMap[star] = el;
    }
  });
  const countMap = {}; // { estrela: elementoContador }
  countEls.forEach((el) => {
    // PT: Para cada contador...
    const star = Number(el.dataset.sumCount);
    if (star >= 1 && star <= 5) {
      // PT: Válido?
      countMap[star] = el; // PT: Mapeia.
    }
  });

  // ============================================================
  // 2. FUNÇÕES QUE ATUALIZAM O DOM (APENAS VISUAL)
  // ============================================================

  // PT: Recebe o summary pronto (avg, total, buckets) e aplica no HTML.
  // EN: Receives the ready summary (avg, total, buckets) and applies it to the HTML.

  function applySummaryToDOM(summary) {
    // PT: Recebe o summary.
    const { avg, total, buckets } = summary; // PT: Extrai dados.

    if (!total) {
      // PT: Caso “lista vazia” — estado zerado, mas elegante.
      // EN: “Empty list” state — zeroed but elegant.
      avgEl.textContent = '–'; // PT: Média vazia.
      starsEl.textContent = '★★★★★'; // PT: Estrelas vazias.
      totalEl.textContent = '0'; // PT: Total zero.

      for (let star = 1; star <= 5; star++) {
        // PT: Para cada estrela...
        if (countMap[star]) countMap[star].textContent = '0'; // PT: Contador zero.
        if (barMap[star]) barMap[star].style.width = '0%'; // PT: Barra vazia.
      }
      return;
    }
    // PT: Exibimos a média com 1 casa decimal, usando vírgula (PT-BR).
    // EN: We display the average with 1 decimal place, using comma.
    avgEl.textContent = avg.toFixed(1).replace('.', ','); // PT: Exibe média.

    // // PT: Calcula estrelas cheias (arredondadas).
    // // EN: Computes filled stars (rounded).
    // const fullStars = Math.round(avg); // PT: Arredonda média para estrelas.
    // const clamped = Math.max(0, Math.min(5, fullStars)); // PT: Garante entre 0 e 5.

    // starsEl.textContent = '★★★★★'.slice(0, clamped) + '☆☆☆☆☆'.slice(clamped, 5); // PT: Exibe estrelas.

    // PT: Estrelas são responsabilidade do System UI (Zoe)
    // EN: Stars are owned by the System UI (Zoe)
    starsEl.innerHTML = ZoeRating.renderRating(avg, {
      showValue: false, // PT: a média já aparece no avgEl
      size: 'lg', // PT: tamanho maior no summary
    });

    // PT: Total de avaliações.
    // EN: Total number of reviews.
    totalEl.textContent = String(total); // PT: Exibe total.

    // PT: Aplica contagens e larguras das barras.
    // EN: Applies counts and bar widths.
    for (let star = 1; star <= 5; star++) {
      // PT: Para cada estrela...
      const count = buckets[star] ?? 0; // PT: Conta (ou zero).

      if (countMap[star]) {
        countMap[star].textContent = String(count); // PT: Exibe contador.
      }

      if (barMap[star]) {
        // PT: Se existe barra...
        const percent = total > 0 ? (count / total) * 100 : 0; // PT: Calcula porcentagem.
        barMap[star].style.width = `${percent.toFixed(2)}%`; // PT: Define largura da barra.
      }
    }
  }
  // PT: Estado totalmente vazio e seguro (quando nada funciona MESMO).
  // EN: Fully empty and safe state (when literally nothing works).
  function applyEmptyFallbackToDom() {
    avgEl.textContent = '-'; // PT: Média vazia.
    starsEl.innerHTML = ZoeRating.renderRating(0, {
      showValue: false,
      size: 'lg',
    }); // PT: Estrelas vazias.

    totalEl.textContent = '0'; // PT: Total zero.

    for (let star = 1; star <= 5; star++) {
      if (countMap[star]) countMap[star].textContent = '0'; // PT: Contador zero.
      if (barMap[star]) barMap[star].style.width = '0%'; // PT: Barra vazia.
    }
  }

  // ============================================================
  // 3. FLUXO PRINCIPAL: CACHE + REDE + DOM
  // ============================================================

  // PT: Função principal que:
  //     1) tenta usar o cache;
  //     2) busca dados novos na rede;
  //     3) aplica no DOM;
  //     4) atualiza o cache.
  //
  // EN: Main function that:
  //     1) tries to use cache;
  //     2) fetches fresh data from network;
  //     3) applies to the DOM;
  //     4) updates the cache.
  async function loadSummary({ forceNetwork = false } = {}) {
    // PT: Opção para forçar rede.
    let usedCache = false; // PT: Indicador de uso de cache.

    if (!forceNetwork) {
      // PT: Se não for forçar rede...
      const cached = AthenaisSummaryHelpers.loadSummaryFromCache(); // PT: Tenta carregar do cache.
      if (cached) {
        // PT: Mostra o cache imediatamente (UX rápida).
        // EN: Show cache immediately (fast UX).
        applySummaryToDOM(cached); // PT: Aplica no DOM.
        usedCache = true; // PT: Marcamos que usamos cache.
      }
    }

    try {
      const data = await AthenaisSummaryHelpers.fetchSummaryMetaWithRetry({
        forceFresh: forceNetwork,
      }); // PT: Tenta buscar da rede.
      console.log('📦 Dados brutos do GAS (summary):', data);
      const summary = AthenaisSummaryHelpers.buildSummaryFromResponse(data);
      console.log('📊 Summary calculado:', summary);

      // PT: Aplica e salva no cache.
      // EN: Apply and save to cache.
      applySummaryToDOM(summary); // PT: Aplica no DOM.
      AthenaisSummaryHelpers.saveSummarytoCache(summary); // PT: Salva no cache.
    } catch (err) {
      // PT: Se falhar...
      console.error('summary.js: falha ao atualizar summary / update failed:', err);

      if (!usedCache) {
        const snapshot = AthenaisSummaryHelpers.loadSummarySnapshot();
        // PT: Se não usamos cache, tentamos restaurar o último estado válido
        //     via snapshot. Só exibimos o fallback vazio se nunca houve dados.
        // EN: If cache was not used, we try to restore the last known valid
        //     state via snapshot. Only show empty fallback if no data ever existed.
        if (snapshot) {
          // PT: Usa o último estado válido conhecido (snapshot),
          //     evitando UI vazia por falha transitória de rede.
          // EN: Uses the last known valid state (snapshot),
          //     preventing empty UI due to transient network failure.
          applySummaryToDOM(snapshot);
        } else {
          // Nunca carregou nada na vida
          // nem cache, nem snapshot
          applyEmptyFallbackToDom();
        }
      }
      // PT: Se o cache já foi aplicado, mantém o estado atual sem alterar a UI.
      // EN: If cache was already applied, keep the current UI state unchanged.
    }
  }

  // -------------------------------------------------------------
  // Realtime: summary escuta novos feedbacks confirmados
  // -------------------------------------------------------------
  let summaryRefreshTimer = null;

  window.addEventListener('feedback:committed', () => {
    clearTimeout(summaryRefreshTimer);
    summaryRefreshTimer = setTimeout(() => {
      loadSummary({ forceNetwork: true });
    }, 250);
  });

  // PT: Expondo uma função global opcional para “forçar” atualização
  //     (útil após envio de novo feedback).
  // EN: Expose an optional global function to “force” a refresh
  //     (useful after submitting a new feedback).
  window.feedbackSummaryRefresh = function () {
    // PT: Função global.
    loadSummary({ forceNetwork: true }); // PT: Força atualização pela rede.
  };

  // PT: Chamada inicial ao carregar a página.
  // EN: Initial call when the page loads.
  loadSummary();
}

// PT/EN: Export em estilo moderno, caso o bootstrap queira chamar manualmente.
// PT: Por enquanto, o DOMContentLoaded já chama sozinho.
// EN: For now, DOMContentLoaded already triggers it automatically.
export const AbigailSummaryUI = {
  initSummaryUI,
};
