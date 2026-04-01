// /assets/js/feedback/leader/kendra-feedback-leader.js
// 🛡️ Kendra — Feedback Board Leader
//
// Nível / Level: Adulto / Adult
//
// PT: Kendra coordena o setor de Feedback Board. Ela não lida com detalhes
//     de thumbs, preload ou UI diretamente — isso é responsabilidade de
//     Lia, Petra, Selah, Mira, Abigail e Livia. Sua função é garantir que
//     cada especialista execute seu papel no momento certo, mantendo o
//     módulo estável, rápido e confiável.
//
// EN: Kendra coordinates the Feedback Board sector. She does not handle
//     thumb, preload or UI details directly — that is the responsibility of
//     Lia, Petra, Selah, Mira, Abigail and Livia. Her role is to ensure each
//     specialist run at the right time, keeping the module stable, fast
//     and reliable.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🧬 Naomi — Card API Helpers
// Fornece / Provides:
// - list()
// - latest()
// - setTimeoutMs()
// - setRetries()
// - setCacheTtl()
/* -----------------------------------------------------------------------------*/
import { NaomiFeedbackCardAPI } from '/assets/js/feedback/board/api/card/naomi-card-api-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🌟 Abigail — Summary UI
// Fornece / Provides:
// - initSummaryUI()
/* -----------------------------------------------------------------------------*/
import { AbigailSummaryUI } from '/assets/js/feedback/board/summary/abigail-summary-ui.js';

/* -----------------------------------------------------------------------------*/
// 🌷 Livia — Avatar UI
// Fornece / Provides:
// - initAvatar()
/* -----------------------------------------------------------------------------*/
import { LiviaAvatarUI } from '/assets/js/feedback/board/avatar/livia-avatar-ui.js';

/* -----------------------------------------------------------------------------*/
// 🌱 Lia — Board Preload Helpers
// Fornece / Provides:
// - preloadFirstPageToCache()
// - warmOnce()
/* -----------------------------------------------------------------------------*/
import { LiaPreload } from '/assets/js/feedback/board/main/lia-board-preload-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🪨 Petra — Image UI
// Fornece / Provides:
// - initThumbSystem()
/* -----------------------------------------------------------------------------*/
import { PetraImageUI } from '/assets/js/feedback/board/image/petra-image-ui.js';

/* -----------------------------------------------------------------------------*/
// 🌿 Selah — Board UI
// Fornece / Provides:
// - init()
/* -----------------------------------------------------------------------------*/
import { SelahBoardUI } from '/assets/js/feedback/board/main/selah-board-ui.js';

/* -----------------------------------------------------------------------------*/
// ✨ Mira — List Modal UI
// Fornece / Provides:
// - ListModal()
/* -----------------------------------------------------------------------------*/
import { MiraListUI } from '/assets/js/feedback/board/list/mira-list-ui.js';

/* -----------------------------------------------------------------------------*/
// 📘 Logger — System Observability Layer
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

/* -----------------------------------------------------------------------------*/
// DOM Ready Helper
//
// PT: Executa uma função quando o DOM estiver pronto.
// EN: Runs a function when the DOM is ready.
/* -----------------------------------------------------------------------------*/
function onDomReady(callback) {
  if (document.readyState !== 'loading') {
    callback();
    return;
  }

  document.addEventListener('DOMContentLoaded', callback, { once: true });
}

/* -----------------------------------------------------------------------------*/
// Sector Initializers
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Lia Preload Initialization
//
// PT: Inicializa o preload da Lia usando a Naomi como fonte de dados (API).
// EN: Initializes Lia preload using Naomi as the data source (API).
/* -----------------------------------------------------------------------------*/
function initLiaPreload() {
  const feedbackApi = NaomiFeedbackCardAPI;

  if (!feedbackApi || typeof feedbackApi.list !== 'function') {
    Logger.warn('Board', 'Kendra', 'NaomiFeedbackCardAPI unavailable, Lia preload skipped');
    return;
  }

  LiaPreload.preloadFirstPageToCache(feedbackApi).catch((error) => {
    Logger.warn('Board', 'Kendra', 'Lia preloadFirstPageToCache failed', error);
  });

  LiaPreload.warmOnce(feedbackApi).catch((error) => {
    Logger.warn('Board', 'Kendra', 'Lia warmOnce failed', error);
  });
}

// PT: Inicializa a UI de summary da Abigail.
// EN: Initializes Abigail summary UI.
function initAbigailSummary() {
  try {
    AbigailSummaryUI.initSummaryUI(document);
  } catch (error) {
    Logger.warn('Board', 'Kendra', 'Abigail summary initialization failed', error);
  }
}

// PT: Inicializa a UI de avatar da Livia.
// EN: Initializes Livia avatar UI.
function initLiviaAvatar() {
  try {
    LiviaAvatarUI.initAvatar(document);
  } catch (error) {
    Logger.warn('Board', 'Kendra', 'Livia avatar initialization failed', error);
  }
}

// PT: Inicializa o sistema de thumbs da Petra.
// EN: Initializes Petra thumb system.
function initPetraThumbs() {
  try {
    PetraImageUI.initThumbSystem(document);
  } catch (error) {
    Logger.warn('Board', 'Kendra', 'Petra thumb system initialization failed', error);
  }
}

// PT: Inicializa o board da Selah.
// EN: Initializes Selah board.
function initSelahBoard() {
  if (!SelahBoardUI || typeof SelahBoardUI.init !== 'function') {
    Logger.warn('Board', 'Kendra', 'No board implementation found (SelahBoardUI.init)');
    return;
  }

  try {
    SelahBoardUI.init({ cards: { perPlatform: 1 } });
  } catch (error) {
    Logger.warn('Board', 'Kendra', 'SelahBoardUI initialization failed', error);
  }
}

// PT: Inicializa o modal de lista da Mira.
// EN: Initializes Mira list modal.
function initMiraListModal() {
  try {
    MiraListUI.ListModal(document);
  } catch (error) {
    Logger.warn('Board', 'Kendra', 'Mira list modal initialization failed', error);
  }
}

/* -----------------------------------------------------------------------------*/
// Bootstrap
/* -----------------------------------------------------------------------------*/

// PT: Função principal da Kendra que amarra o setor de Feedback.
// EN: Main Kendra function that wires the Feedback sector together.
function bootstrapBoard() {
  initLiaPreload();
  initAbigailSummary();
  initLiviaAvatar();
  initPetraThumbs();
  initSelahBoard();
  initMiraListModal();
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const KendraBoardLeader = {
  // PT: Inicializa o setor de Feedback. Deve ser chamada pela Morgana.
  // EN: Initializes the Feedback sector. Should be called by Morgana.
  initBoard() {
    onDomReady(bootstrapBoard);
  },

  // PT: Exposto para debug e uso controlado.
  // EN: Exposed for debug and controlled use.
  bootstrapBoard,
};
