// /assets/js/feedback/feedback-bootstrap.js
// ⚙️ Feedback Bootstrap — Orquestrador raiz
// PT: Ponto central de inicialização do sistema de feedback.
//     Quando o DOM estiver pronto, ele coordena o preload (Lia),
//     as imagens do board (Petra) e o mural (Selah).
// EN: Central entry point for feedback system startup.
//     When the DOM is ready, it coordinates preload (Lia),
//     board images (Petra) and the hero/board (Selah).
/* --------------------------------------------------*/
import { FeedbackCardAPI } from '/assets/js/feedback/board/api/card/naomi-card-api-helpers.js';

/* --------------------------------------------------
 * 🌱 Lia — Preload Helpers
 * PT: Responsável por pré-aquecer dados e manter cache.
 * EN: Handles warm-up and global feedback cache.
 * Fornece / Provides:
 *   - preloadFirstPageToCache()
 *   - warmOnce()
 *   - startWarmLoop()
 *   - ensureCache()
 -------------------------------------------------- */
import { LiaPreload } from '/assets/js/feedback/board/main/lia-board-preload-helpers.js';

/* --------------------------------------------------
 * 🪨 Petra — Image UI Helpers
 * PT: Lida com thumbs, fallback e observação de imagem no Board.
 * EN: Manages thumbs, fallback and DOM observers for Board images.
 * Fornece / Provides:
 *   - initThumbSystem()
 *   - applyThumb()
 *   - scanThumbs()
 *   - observeThumbs()
 -------------------------------------------------- */
import { PetraImageUI } from '/assets/js/feedback/board/image/petra-image-ui.js';

/* --------------------------------------------------
 * 🌿 Selah — Board UI
 * PT: Controla renderização do mural/hero e cards iniciais.
 * EN: Controls the feedback board/hero and initial card rendering.
 * Fornece / Provides:
 *   - initBoard()
 -------------------------------------------------- */
import { SelahBoardUI } from '/assets/js/feedback/board/main/selah-board-ui.js';
/* --------------------------------------------------*/

// 1) Expõe a API no window (compat com código legado)
if (!window.FeedbackCardAPI) {
  window.FeedbackAPI = FeedbackCardAPI;
}

/**
 * PT: Helper simples para rodar algo quando o DOM estiver pronto.
 * EN: Small helper to run a callback when DOM is ready.
 */
function onDomReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }
}

/**
 * PT: Inicializa o preload da Lia caso a FeedbackAPI esteja disponível.
 * EN: Initializes Lia's preload logic if FeedbackAPI is available.
 */
function initLiaPreload() {
  const api = window.FeedbackAPI;
  if (!api || typeof api.list !== 'function') {
    console.warn(
      '[Bootstrap] FeedbackAPI não encontrada ou inválida — preload da Lia não será executado.'
    );
    return;
  }

  // PT: Pré-carrega a primeira página para cada plataforma.
  // EN: Preload first page for each platform.
  LiaPreload.preloadFirstPageToCache(api).catch((err) => {
    console.warn('[Bootstrap] Erro ao fazer preload inicial com Lia:', err);
  });

  // PT: Opcional — iniciar o loop de reaquecimento, se você quiser.
  // EN: Optional — start periodic warm loop if you want.
  LiaPreload.warmOnce(api).catch((err) => {
    console.warn('[Bootstrap] Erro ao executar warmOnce da Lia: ', err);
  });
  // Se um dia quiser usar o loop periódico:
  // const stopWarmLoop = LiaPreload.startWarmLoop(api);
  // window.FeedbackWarmLoopStop = stopWarmLoop; // opcional, para debug
}

/**
 * PT: Inicializa o sistema de thumbs da Petra no documento inteiro.
 * EN: Initializes Petra's thumb system for the whole document.
 */
function initPetraThumbs() {
  try {
    PetraImageUI.initThumbSystem(document);
  } catch (err) {
    console.warn('[Bootstrap] Erro ao inicializar thumbs da Petra:', err);
  }
}

/**
 * PT: Inicializa o mural/board (Selah) se disponível.
 * EN: Initializes the hero/board (Selah) if available.
 */
function initSelahBoard() {
  if (SelahBoardUI && typeof SelahBoardUI.initBoard === 'function') {
    try {
      SelahBoardUI.initBoard(document);
    } catch (err) {
      console.warn('[Bootstrap] Erro ao inicializar o board com SelahBoardUI:', err);
    }
  }

  // Fallback: compatibilidade com o global antigo (FeedbackMural.init)
  if (window.FeedbackMural && typeof window.FeedbackMural.init === 'function') {
    try {
      window.FeedbackMural.init({ cards: { perPlatform: 1 } });
    } catch (err) {
      console.warn('[Bootstrap] Erro ao inicializar o board com FeedbackMural.init:', err);
    }
  } else {
    console.warn(
      '[Bootstrap] Nenhuma implementação de board encontrada (SelahBoardUI ou FeedbackMural.init).'
    );
  }
}
/**
 * PT: Função principal de bootstrap: é aqui que tudo é amarrado
 *     quando o DOM estiver pronto.
 * EN: Main bootstrap function: this is where everything is wired
 *     once the DOM is ready.
 */
function bootstrapFeedback() {
  // 1) Lia — preload/cache de feedback
  initLiaPreload();

  // 2) Petra — sistema de thumbs do board (fora do modal lista)
  initPetraThumbs();

  // 3) Selah — inicializa o mural/hero do feedback
  initSelahBoard();

  // 4) Mira (modal LISTA) continua cuidando de si mesma neste momento.
  //    Ela ainda usa o próprio onReady interno, então o bootstrap
  //    não precisa chamar nada diretamente aqui por enquanto.
  // EN:
  // 4) Mira (LIST modal) still handles its own startup internally.
  //    It uses its own onReady, so the bootstrap does not need to
  //    call anything directly here for now.
}

// Dispara o bootstrap quando o DOM estiver pronto.
// Fire bootstrap once the DOM is ready.
onDomReady(bootstrapFeedback);
