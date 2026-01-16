// /assets/js/feedback/leader/kendra-feedback-leader.js
// 🛡️ Kendra — Líder do Setor de Feedback Board
// Nível: Adulta
//
// PT: Kendra coordena o setor de Feedback board. Ela não lida com detalhes como
//     thumbs, preload ou UI diretamente — isso é responsabilidade de Lia,
//     Petra, Selah e Mira. Sua função é garantir que cada especialista
//     execute seu papel no momento certo, mantendo o módulo estável,
//     rápido e confiável.
//
// EN: Kendra coordinates the Feedback sector. She does not handle details
//     like thumbs, preload or UI directly — that's the job of Lia, Petra,
//     Selah and Mira. Her role is to ensure each specialist runs at the
//     right time, keeping the module stable, fast and reliable.
//
// Observação da hierarquia:
// - Morgana = Diretora Geral do Sistema
// - Aurora  = Líder do Layout
// - Kendra  = Líder do Setor de Feedback
// - (Abaixo dela: Lia, Petra, Selah, Mira, Abigail, Athenais, Livia)
/* ------------------------------------------------------------------*/

import { NaomiFeedbackCardAPI } from '/assets/js/feedback/board/api/card/naomi-card-api-helpers.js';

/* --------------------------------------------------
 * // 🌟 Abigaíl 
  * PT: Controla a UI do resumo/summary do feedback.
  * EN: Manages the feedback summary UI.
  * Fornece / Provides:
  *  - initSummaryUI()
  -------------------------------------------------- */

import { AbigailSummaryUI } from '/assets/js/feedback/board/summary/abigail-summary-ui.js';

/* --------------------------------------------------
 * 🌷 Lívia — UI do Avatar
  * PT: Responsável pela camada visual do avatar: criação do wrap, estilo e atualização das iniciais.
  * EN: Handles the visual layer of the avatar: wrap creation, styling and initials updates.
  * Fornece / Provides:
  *   - initAvatar()
  -------------------------------------------------- */

import { LiviaAvatarUI } from '/assets/js/feedback/board/avatar/livia-avatar-ui.js';

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

/* --------------------------------------------------
 * ✨ Mira — LIST Modal UI
 * PT: Controla o modal de lista completa de feedback.
 * EN: Manages the full feedback list modal.
 * Fornece / Provides:
 *   - initListModal()
 -------------------------------------------------- */
import { MiraListUI } from '/assets/js/feedback/board/list/mira-list-ui.js';
/* --------------------------------------------------*/

// 1) Expõe a API no window (compat com código legado)
if (!window.FeedbackCardAPI) {
  window.FeedbackAPI = NaomiFeedbackCardAPI;
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
      '[Kendra] FeedbackAPI não encontrada ou inválida — preload da Lia não será executado.'
    );
    return;
  }

  // PT: Pré-carrega a primeira página para cada plataforma.
  // EN: Preload first page for each platform.
  LiaPreload.preloadFirstPageToCache(api).catch((err) => {
    console.warn('[Kendra] Erro ao fazer preload inicial com Lia:', err);
  });

  // PT: Opcional — iniciar o loop de reaquecimento, se você quiser.
  // EN: Optional — start periodic warm loop if you want.
  LiaPreload.warmOnce(api).catch((err) => {
    console.warn('[Kendra] Erro ao executar warmOnce da Lia: ', err);
  });
  // Se um dia quiser usar o loop periódico:
  // const stopWarmLoop = LiaPreload.startWarmLoop(api);
  // window.FeedbackWarmLoopStop = stopWarmLoop; // opcional, para debug
}

/**
 * PT: Abigaíl Controla a UI do resumo/summary do feedback.
 * EN: Abigail manages the feedback summary UI.
 */
function initAbigailSummary() {
  try {
    AbigailSummaryUI.initSummaryUI(document);
  } catch (err) {
    console.warn('[Kendra] Erro ao inicializar o resumo da Abigail:', err);
  }
}

/**
 * PT: Livia Responsável pela camada visual do avatar: criação do wrap, estilo e atualização das iniciais.
 * EN: Livia Handles the visual layer of the avatar: wrap creation, styling and initials updates.
 */
function initLiviaAvatar() {
  try {
    LiviaAvatarUI.initAvatar(document);
  } catch (err) {
    console.warn('[Kendra] Erro ao inicializar o avatar da Livia:', err);
  }
}

/**
 * PT: Inicializa o sistema de thumbs da Petra no documento inteiro.
 * EN: Initializes Petra's thumb system for the whole document.
 */
function initPetraThumbs() {
  try {
    PetraImageUI.initThumbSystem(document);
  } catch (err) {
    console.warn('[Kendra] Erro ao inicializar thumbs da Petra:', err);
  }
}

/**
 * PT: Inicializa o mural/board (Selah) se disponível.
 * EN: Initializes the hero/board (Selah) if available.
 */
function initSelahBoard() {
  let hasBoard = false;

  if (SelahBoardUI && typeof SelahBoardUI.initBoard === 'function') {
    try {
      SelahBoardUI.initBoard(document);
      hasBoard = true;
    } catch (err) {
      console.warn('[Kendra] Erro ao inicializar o board com SelahBoardUI:', err);
    }
  }

  // LEGADO: compat com implementação antiga baseada em window.FeedbackMural
  if (window.FeedbackMural && typeof window.FeedbackMural.init === 'function') {
    try {
      window.FeedbackMural.init({ cards: { perPlatform: 1 } });
      hasBoard = true;
    } catch (err) {
      console.warn('[Kendra] Erro ao inicializar o board com FeedbackMural.init:', err);
    }
  }

  if (!hasBoard) {
    console.warn(
      '[Kendra] Nenhuma implementação de board encontrada (SelahBoardUI ou FeedbackMural.init).'
    );
  }
}
/**
 * PT: Mira (modal LIST) continua cuidando de si mesma neste momento.
 * EN: Mira (LIST modal) still handles its own startup internally.
 */

function initMiraListModal() {
  try {
    MiraListUI.ListModal(document);
  } catch (err) {
    console.warn('[Kendra] Erro ao inicializar o modal de lista da Mira:', err);
  }
}

/**
 * PT: Função principal de Kendra: é aqui que tudo é amarrado
 *     quando o DOM estiver pronto.
 * EN: Main Kendra function: this is where everything is wired
 *     once the DOM is ready.
 */
function bootstrapBoard() {
  // 1) Lia — preload/cache de feedback
  initLiaPreload();

  // 2) Abigaíl — resumo/summary do feedback
  initAbigailSummary();

  // 3) Lívia — UI do Avatar
  initLiviaAvatar();

  // 4) Petra — sistema de thumbs do board (fora do modal lista)
  initPetraThumbs();

  // 5) Selah — inicializa o mural/hero do feedback
  initSelahBoard();

  // 6) Mira (modal LISTA) continua cuidando de si mesma neste momento.
  initMiraListModal();
}

export const KendraBoardLeader = {
  /**
   * PT: Inicializa o setor de Feedback. Deve ser chamada pela Morgana.
   * EN: Initializes the Feedback sector. Should be called by Morgana.
   */
  initBoard(root = document) {
    // // Dispara o bootstrap quando o DOM estiver pronto.
    // // Fire bootstrap once the DOM is ready.
    onDomReady(() => bootstrapBoard());
  },

  // Opcional — expõe a função bruta para debug
  bootstrapBoard,
};
