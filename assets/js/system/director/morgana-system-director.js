// /js/system/director/morgana-system-director.js
// 🜁 Morgana — Diretora Geral do Sistema
// Nível: Adulta
//
// PT: Morgana coordena o sistema como um todo. Ela não cuida de setores,
//     mas garante que cada líder execute seu papel na ordem correta.
//     Este arquivo é o "ponto inicial" do sistema.
//
// EN: Morgana coordinates the entire system. She does not handle specific
//     sectors, but ensures each leader runs in the correct order.
//     This file is the system's entry point.

// 🌇 Aurora — Líder do Layout
import { AuroraLayoutLeader } from '/assets/js/layout/leader/aurora-layout-main.js';

import { KendraFeedbackLeader } from '/assets/js/feedback/board/leader/kendra-feedback-main';
// Futuro:
// import { initFeedback } from '/assets/js/feedback/leader/selah-feedback-board-ui.js';
// import { initPedidos } from '/assets/js/pedidos/leader/...';

export function initSystem() {
  // PT: Inicializa cada setor necessário na página.
  // EN: Initializes each required sector on the page.

  // --- Layout ---
  AuroraLayoutLeader.initLayout();

  // --- Feedback ---
  KendraFeedbackLeader.initFeedback();
  // --- Futuro ---
  // initFeedback();
  // initPedidos();
  // initOrcamento();
}

// Auto-executa se desejado (opcional):
document.addEventListener('DOMContentLoaded', initSystem);
