// /js/system/director/morgana-system-director.js
// 🜁 Morgana — Diretora Geral do Sistema
// Nível: Adulta
//
// PT: Morgana coordena o sistema como um todo. Ela não cuida de setores,
//     mas garante que cada líder execute seu papel na ordem correta.
//     Este arquivo é o "ponto inicial" do sistema.
//
// EN: Morgana coordinates the entire system. She does not handle specific
//     sectors, but ensure s each leader runs in the correct order.
//     This file is the system's entry point.

// 🌇 Aurora — Líder do Layout
import { AuroraLayoutLeader } from '/assets/js/layout/leader/aurora-layout-main.js';

// 🛡️ Kendra — Líder do Setor de Board.
import { KendraBoardLeader } from '/assets/js/feedback/board/leader/kendra-feedback-main';

// 🌙 Aura — Líder do setor Form.
import { AuraFormLeader } from '/assets/js/feedback/form/leader/aura-form-leader-main.js';

// Futuro:
// import { initFeedback } from '/assets/js/feedback/leader/selah-feedback-board-ui.js';
// import { initPedidos } from '/assets/js/pedidos/leader/...';

export function initSystem() {
  // PT: Inicializa cada setor necessário na página.
  // EN: Initializes each required sector on the page.

  // --- Layout ---
  AuroraLayoutLeader.initLayout();

  // --- Feedback ---

  // --- Board ---
  KendraBoardLeader.initBoard();

  // --- Form ---mas
  AuraFormLeader.initForm();
  // --- Futuro ---
  // initFeedback();
  // initPedidos();
  // initOrcamento();
}

// Auto-executa se desejado (opcional):
document.addEventListener('DOMContentLoaded', initSystem);
