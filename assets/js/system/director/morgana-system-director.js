// 🜁 Morgana — System Director
//
// Nível / Level: Adulta / Adult
//
// PT: Coordena a inicialização dos setores do sistema e registra a
// infraestrutura compartilhada necessária antes do boot.
//
// EN: Coordinates system sector initialization and registers
// the shared infrastructure required before boot.

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// EndpointConfig — Feedback Endpoint Configuration
// Fornece / Provides:
// - set(url)
// - get()
// - isOffline()
/* -----------------------------------------------------------------------------*/
import { EndpointConfig } from '/assets/js/feedback/core/config/feedback-data-endpoint.js';

/* -----------------------------------------------------------------------------*/
// ImageEndpointConfig — Feedback Image Endpoint Configuration
// Fornece / Provides:
// - set(url)
// - get()
// - isOffline()
/* -----------------------------------------------------------------------------*/
import { ImageEndpointConfig } from '/assets/js/feedback/core/config/feedback-image-endpoint.js';

/* -----------------------------------------------------------------------------*/
// 🌇 Aurora — Layout Leader
// Fornece / Provides:
// - initLayout()
/* -----------------------------------------------------------------------------*/
import { AuroraLayoutLeader } from '/assets/js/layout/leader/aurora-layout-main.js';

/* -----------------------------------------------------------------------------*/
// 🛡️ Kendra — Board Leader
// Fornece / Provides:
// - initBoard()
/* -----------------------------------------------------------------------------*/
import { KendraBoardLeader } from '/assets/js/feedback/board/leader/kendra-feedback-main';

/* -----------------------------------------------------------------------------*/
// 🌙 Aura — Form Leader
// Fornece / Provides:
// - initForm()
/* -----------------------------------------------------------------------------*/
import { AuraFormLeader } from '/assets/js/feedback/form/leader/aura-form-leader-main.js';

/* -----------------------------------------------------------------------------*/
// 📘 Logger — System Observability Layer
// Fornece / Provides:
// - debug()
// - warn()
/* -----------------------------------------------------------------------------*/
import { Logger } from '/assets/js/system/core/logger.js';

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares internas da diretora do sistema.
// EN: Internal helper functions used by the system director.
/* -----------------------------------------------------------------------------*/

// PT: Executa uma etapa de inicialização com proteção de erro.
// EN: Runs an initialization step with safe error protection.
function runInitStep(stepName, callback) {
  try {
    callback();
    Logger.debug?.('SYSTEM', 'Morgana', `${stepName} initialized`);
  } catch (error) {
    Logger.warn('SYSTEM', 'Morgana', `Failed to initialize ${stepName}`, error);
  }
}

/* -----------------------------------------------------------------------------*/
// Feedback Infrastructure Bootstrap
//
// PT: Resolve e registra os endpoints centrais do sistema de feedback,
//     considerando ambiente (dev/prod).
//
// EN: Resolves and registers central feedback endpoints,
//     considering environment (dev/prod).
/* -----------------------------------------------------------------------------*/

const GAS_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec';

// PT: Resolve o endpoint principal de dados.
// EN: Resolves the main data endpoint.
function resolveFeedbackDataEndpoint() {
  return import.meta.env.DEV ? '/gas' : GAS_ENDPOINT;
}

// PT: Resolve o endpoint de imagens.
// EN: Resolves the image endpoint.
function resolveFeedbackImageEndpoint() {
  return import.meta.env.DEV ? '/gas-img' : GAS_ENDPOINT;
}

// PT: Inicializa a infraestrutura de endpoints do feedback.
// EN: Initializes feedback endpoint infrastructure.
function initFeedbackInfrastructure() {
  EndpointConfig.set(resolveFeedbackDataEndpoint());
  ImageEndpointConfig.set(resolveFeedbackImageEndpoint());
}

/* -----------------------------------------------------------------------------*/
// System Initialization
//
// PT: Inicializa os setores principais do sistema.
// EN: Initializes core system sectors.
/* -----------------------------------------------------------------------------*/

// PT: Executa a inicialização principal do sistema.
// EN: Runs the main system initialization.
export function initSystem() {
  Logger.debug?.('SYSTEM', 'Morgana', 'System initialization started');

  initFeedbackInfrastructure();

  runInitStep('Layout', () => {
    AuroraLayoutLeader.initLayout();
  });

  runInitStep('Board', () => {
    KendraBoardLeader.initBoard();
  });

  runInitStep('Form', () => {
    AuraFormLeader.initForm();
  });

  Logger.debug?.('SYSTEM', 'Morgana', 'System initialization finished');
}

/* -----------------------------------------------------------------------------*/
// Auto Init
//
// PT: Executa o sistema ao carregar o DOM.
// EN: Runs the system when the DOM is ready.
/* -----------------------------------------------------------------------------*/

document.addEventListener('DOMContentLoaded', initSystem);
