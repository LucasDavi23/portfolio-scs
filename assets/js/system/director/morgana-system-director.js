// 🜁 Morgana — System Director
//
// Nível / Level: Adulta / Adult
//
// PT: Coordena a inicialização dos setores do sistema.
// EN: Coordinates system sector initialization.

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

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
// System Initialization
//
// PT: Inicializa os setores principais do sistema.
// EN: Initializes core system sectors.
/* -----------------------------------------------------------------------------*/

// PT: Executa a inicialização principal do sistema.
// EN: Runs the main system initialization.
export function initSystem() {
  AuroraLayoutLeader.initLayout();

  KendraBoardLeader.initBoard();

  AuraFormLeader.initForm();
}

/* -----------------------------------------------------------------------------*/
// Auto Init
//
// PT: Executa o sistema ao carregar o DOM.
// EN: Runs the system when the DOM is ready.
/* -----------------------------------------------------------------------------*/

document.addEventListener('DOMContentLoaded', initSystem);
