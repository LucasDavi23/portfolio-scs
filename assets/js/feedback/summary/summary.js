// 🌟 Abigaíl — Guardiã do Summary de Avaliações
// PT: Abigaíl representa sabedoria, prudência e clareza. Ela coordena o resumo
//     das avaliações da SCS: carrega dados, calcula média, monta a distribuição
//     de estrelas, aplica fallback e garante estabilidade (retry, cache, timeout).
//
// EN: Abigail represents wisdom, clarity and discernment. She orchestrates the
//     SCS reviews summary: loads data, computes averages, builds star distribution,
//     handles fallback and ensures stability (retry, cache, timeout).
//
// Arquivo Técnico / Technical File: summary.js

// PT: Usa a função oficial do sistema para pegar o endpoint.
// EN: Uses the system's official function to obtain the endpoint.
import { obterEndpoint } from '/assets/js/feedback/feedback.base.js';

(function () {
  console.log('summary.js: carregado / loaded. (Abigaíl entrou em ação)');
  // ============================================================
  // 1. CONFIGURAÇÕES BÁSICAS
  // ============================================================

  // PT: Endpoint global definido em feedbackAPI.js (exposto no window).
  // EN: Global endpoint defined in feedbackAPI.js (exposed on window).
  const ENDPOINT = obterEndpoint();

  console.log('🔗 ENDPOINT summary:', ENDPOINT);

  // PT: Chave usada no localStorage para guardar o resumo mais recente.
  // EN: Key used in localStorage to store the latest summary snapshot.
  const CACHE_KEY = 'scs_feedback_summary_scs';

  // PT: Chave usada no localStorage para guardar o resumo mais recente.
  // EN: Key used in localStorage to store the latest summary snapshot.
  const CACHE_TTL_MS = 60_000; // 1 minuto

  // PT: Timeout para cada requisição ao GAS (em milissegundos).
  // EN: Timeout for each GAS request (in milliseconds).
  const FETCH_TIMEOUT_MS = 4_000; // 4 segundos

  // PT: Quantas tentativas extras além da primeira (0 = só uma tentativa).
  // EN: How many extra retries besides the first attempt (0 = only once).
  const MAX_RETRIES = 1;

  if (!ENDPOINT) {
    console.warn('summary.js: window.feedbackAPI não encontrado / not found.');
    return;
  }

  // PT: Esperamos o DOM ficar pronto.
  // EN: We wait for the DOM to be ready.
  document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 2. CAPTURA DOS ELEMENTOS DO DOM
    // ============================================================

    const avgEl = document.querySelector('[data-sum-avg]');
    const starsEl = document.querySelector('[data-sum-stars]');
    const totalEl = document.querySelector('[data-sum-total]');

    if (!avgEl || !starsEl || !totalEl) {
      console.warn('summary.js: elementos principais (data-sum-avg/stars/total) não encontrado.');
      return;
    }

    // PT: Coletamos barras e contadores para montar mapas por estrela.
    // EN: We collect bars and counters to build star-based maps.
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
    // 3. HELPERS DE CACHE (localStorage)
    // ============================================================

    // PT: Tenta ler o resumo do cache e verifica se ainda está dentro da validade.
    // EN: Tries to read the summary from cache and checks if it's still valid.
    function loadSummaryFromCache() {
      try {
        const raw = localStorage.getItem(CACHE_KEY); // PT: Lê do localStorage.
        if (!raw) return null;

        const parsed = JSON.parse(raw); // PT: Converte de JSON.
        const { timestamp, avg, total, buckets } = parsed || {}; // PT: Extrai dados.

        if (typeof timestamp !== 'number') return null; // PT: Timestamp inválido.

        const age = Date.now() - timestamp; // PT: Calcula idade do cache.
        if (age > CACHE_TTL_MS) {
          // PT: Cache expirado.
          // EN: Cache expired.
          return null;
        }

        if (typeof avg !== 'number' || typeof total !== 'number' || typeof buckets !== 'object') {
          return null; // PT: Dados inválidos.
        }

        return parsed;
      } catch (err) {
        console.warn('summary.js: erro ao ler cache / error reading cache.', err);
        return null;
      }
    }

    // PT: Salva no cache o resumo atual junto com o timestamp.
    // EN: Saves the current summary to cache along with a timestamp.
    function saveSummarytoCache(summary) {
      try {
        const payload = {
          // PT: Prepara o payload.
          avg: summary.avg, //  PT: Média das avaliações.
          total: summary.total, // PT: Total de avaliações.
          buckets: summary.buckets, // PT: Mapa de estrelas.
          timestamp: Date.now(), // PT: Marca o tempo atual.
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); // PT: Salva como JSON.
      } catch (err) {
        console.warn('summary.js: erro ao salvar cache / cache write error:', err);
      }
    }

    // ============================================================
    // 4. HELPERS DE REDE: TIMEOUT + RETRY
    // ============================================================

    // PT: Implementa um fetch com timeout manual usando Promise.race.
    // EN: Implements fetch with manual timeout using Promise.race.
    function fetchWithTimeout(url, timeoutMs) {
      // PT: Retorna uma Promise.
      return Promise.race([
        // PT: Competição entre:
        fetch(url), // PT: A promessa do fetch.
        new Promise((_, reject) => {
          // PT: E uma promessa que rejeita após timeout.
          const id = setTimeout(() => {
            // PT: Timeout atingido.
            clearTimeout(id); // PT: Limpa o timeout.
            reject(new Error('Timeout na requisição / Request timed out')); // PT: Rejeita a promessa.
          }, timeoutMs);
        }),
      ]);
    }

    // PT: Faz a requisição ao GAS com tentativas extras (retry).
    // EN: Performs the request to GAS with extra retries.
    async function fetchSummaryWithRetry() {
      // PT: Retorna uma Promise.
      const url = `${ENDPOINT}?mode=list&plat=scs&limit=200&page=1`; // PT: URL do endpoint.

      let attempt = 0; // PT: Contador de tentativas.
      let lastError = null; // PT: Último erro ocorrido.

      while (attempt <= MAX_RETRIES) {
        // PT: Enquanto não excedeu tentativas.
        try {
          const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS); // PT: Tenta buscar com timeout.
          if (!res.ok) {
            // PT: Resposta inválida?
            throw new Error('Resposta não OK do servidor / Server response not OK: ' + res.status);
          }

          const data = await res.json(); // PT: Converte resposta em JSON.
          return data; // PT: se deu certo, retornamos os dados imediatamente.
        } catch (err) {
          lastError = err; // PT: Guarda o erro.
          attempt += 1; // PT: Incrementa tentativas.
          console.warn(`summary.js: tentativa ${attempt} falhou / attempt failed:`, err);

          // PT: Se ainda temos retries disponíveis, o loop continua.
          // EN: If we still have retries available, the loop continues.
        }
      }

      // PT: Se chegamos aqui, todas as tentativas falharam.
      // EN: If we reach here, all attempts failed.
      throw lastError || new Error('Falha ao buscar summary / Failed to fetch summary.');
    }

    // ============================================================
    // 5. PARSE DOS DADOS: LISTA -> SUMMARY
    // ============================================================

    // PT: Converte a resposta do GAS em um objeto “summary” com:
    //     { avg, total, buckets: {1,2,3,4,5} }
    // EN: Converts GAS response into a “summary” object:
    //     { avg, total, buckets: {1,2,3,4,5} }
    function buildSummaryFromResponse(data) {
      // PT: Recebe dados brutos da API.
      // PT: Aceitamos tanto { items: [...] } quanto [...] direto.
      // EN: We accept both { items: [...] } and [...] directly.
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

      const ratings = items
        .map((item) => {
          // PT: Mapeia para extrair avaliações.
          const raw = item.rating ?? item.stars ?? item.estrelas ?? item.nota ?? item.rate; // PT: Vários nomes possíveis.

          const n = Number(raw); // PT: Converte para número. "aqui o n deve ser Number ou numero em pt"
          return Number.isFinite(n) ? n : null; // PT: Retorna número ou null.
        })
        .filter((n) => n !== null); // PT: Filtra nulos.

      const total = ratings.length; // PT: Total de avaliações.

      if (!total) {
        // PT: Sem avaliações válidas ainda.
        // EN: No valid ratings yet.

        return {
          avg: 0, // PT: Média das avaliações.
          total: 0, // PT: Total de avaliações.
          buckets: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // PT: Mapa vazio.
        };
      }

      const sum = ratings.reduce((acc, n) => acc + n, 0); // PT: Soma todas as avaliações.
      const avg = sum / total; // PT: Calcula a média.

      const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; // PT: Inicializa contadores.
      ratings.forEach((r) => {
        // PT: Conta cada avaliação. o que seria o (r) ? acho que rating
        let star = Math.round(r); // PT: Arredonda para a estrela mais próxima.
        if (star < 1) star = 1;
        if (star > 5) star = 5;
        buckets[star] += 1;
      });

      return { avg, total, buckets }; // PT: Retorna o resumo.
    }

    // ============================================================
    // 6. APLICAÇÃO DO SUMMARY NO DOM
    // ============================================================

    // PT: Aplica um objeto summary nos elementos de UI (texto e barras).
    // EN: Applies a summary object to UI elements (text and bars).
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

      // PT: Calcula estrelas cheias (arredondadas).
      // EN: Computes filled stars (rounded).
      const fullStars = Math.round(avg); // PT: Arredonda média para estrelas.
      const clamped = Math.max(0, Math.min(5, fullStars)); // PT: Garante entre 0 e 5.

      starsEl.textContent = '★★★★★'.slice(0, clamped) + '☆☆☆☆☆'.slice(clamped, 5); // PT: Exibe estrelas.

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
      starsEl.textContent = '★★★★★'; // PT: Estrelas vazias.
      totalEl.textContent = '0'; // PT: Total zero.

      for (let star = 1; star <= 5; star++) {
        if (countMap[star]) countMap[star].textContent = '0'; // PT: Contador zero.
        if (barMap[star]) barMap[star].style.width = '0%'; // PT: Barra vazia.
      }
    }

    // ============================================================
    // 7. FLUXO PRINCIPAL: CACHE + “STALE-WHILE-REVALIDATE”
    // ============================================================

    // PT: Carrega primeiro do cache (se existir), depois tenta atualizar pela rede.
    // EN: First loads from cache (if any), then tries to refresh from the network.
    async function loadSummary({ forceNetwork = false } = {}) {
      // PT: Opção para forçar rede.
      let usedCache = false; // PT: Indicador de uso de cache.

      if (!forceNetwork) {
        // PT: Se não for forçar rede...
        const cached = loadSummaryFromCache(); // PT: Tenta carregar do cache.
        if (cached) {
          // PT: Mostra o cache imediatamente (UX rápida).
          // EN: Show cache immediately (fast UX).
          applyEmptyFallbackToDom(cached); // PT: Aplica no DOM.
          usedCache = true; // PT: Marcamos que usamos cache.
        }
      }

      try {
        const data = await fetchSummaryWithRetry(); // PT: Tenta buscar da rede.
        console.log('📦 Dados brutos do GAS (summary):', data);
        const summary = buildSummaryFromResponse(data);
        console.log('📊 Summary calculado:', summary);

        // PT: Aplica e salva no cache.
        // EN: Apply and save to cache.
        applyEmptyFallbackToDom(summary); // PT: Aplica no DOM.
        saveSummarytoCache(summary); // PT: Salva no cache.
      } catch (err) {
        // PT: Se falhar...
        console.error('summary.js: falha ao atualizar summary / update failed:', err);

        if (!usedCache) {
          // PT: Se não usamos cache, aplicamos fallback vazio.
          // PT: Se não tínhamos cache, mostramos fallback totalmente vazio.
          // EN: If there was no cache, we show a fully empty fallback.
          applyEmptyFallbackToDom();
        }
        // PT: Se já havia cache aplicado, simplesmente mantemos o que está.
        // EN: If cache was already applied, we silently keep it.
      }
    }

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
  });
})();
