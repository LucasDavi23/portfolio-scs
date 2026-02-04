// ✨ Latch — Body Scroll Lock (System Utils)
// Nível: Jovem
//------------------------------------------------------------
// PT: Especialista em travar e restaurar o scroll do documento.
//     Evita "scroll vazando", bounce e deslocamentos indesejados
//     em modais (desktop e mobile).
//
// EN: Specialist in locking and restoring document scroll.
//     Prevents scroll leakage, bounce and unwanted layout shifts
//     in modals (desktop and mobile).
//
// Responsabilidade / Responsibility:
//  - Congelar o scroll quando um modal abre
//  - Restaurar o scroll exatamente no ponto original
//  - Ser reutilizável por qualquer modal do sistema
//
// Regras / Rules:
//  - Não manipula DOM de modais
//  - Não decide quando abrir/fechar
//  - Apenas executa o lock/unlock
//------------------------------------------------------------

// ==========================
// 1) ESTADO INTERNO
// ==========================

// PT: Contador para suportar múltiplos modais abertos
// EN: Counter to support stacked modals
let lockCount = 0;

// PT: Stack para manter o scroll correto por camada de lock.
// EN: Stack to keep the correct scroll per lock layer.
const scrollStack = [];

// PT: Guarda padding-right aplicado para compensar scrollbar.
// EN: Stores padding-right used to compensate scrollbar.
let savedPaddingRight = '';

// PT: Modo ativo de lock (para debug/fallback).
// EN: Active lock mode (for debug/fallback).
let activeMode = 'html'; // 'html' | 'body-fixed'

// ==========================
// 2) HELPERS INTERNOS
// ==========================

// PT/EN: elemento que realmente rola (muitas páginas = html)
function getScrollEl() {
  return document.scrollingElement || document.documentElement;
}

// PT/EN: pega o Y real do documento
function getScrollY() {
  const el = getScrollEl();
  return window.scrollY || el.scrollTop || 0;
}

// PT/EN: seta o Y real do documento (sem smooth)
function setScrollY(y) {
  const el = getScrollEl();

  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';

  // robusto: window + element
  window.scrollTo(0, y);
  el.scrollTop = y;

  html.style.scrollBehavior = prevBehavior;
}

// PT: Compensa a largura da scrollbar (evita shift no desktop)
// EN: Compensate scrollbar width (prevents layout shift on desktop)
function applyScrollbarCompensation() {
  const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarW > 0) {
    savedPaddingRight = document.documentElement.style.paddingRight || '';
    document.documentElement.style.paddingRight = `${scrollbarW}px`;
  }
}

// PT/EN: remove compensação
function clearScrollbarCompensation() {
  document.documentElement.style.paddingRight = savedPaddingRight || '';
  savedPaddingRight = '';
}

// ==========================
// 3) API PRINCIPAL
// ==========================

/**
 * PT: Trava o scroll do documento.
 *     Seguro para chamadas repetidas (stack-safe).
 *
 * EN: Locks document scroll.
 *     Safe for repeated calls (stack-safe).
 */
function lockScroll() {
  // ✅ sempre empilha o "y" correto do momento
  // Se já estiver travado, getScrollY pode ficar estável; usamos o último salvo.
  const currentY = lockCount === 0 ? getScrollY() : (scrollStack[scrollStack.length - 1] ?? 0);
  scrollStack.push(currentY);

  if (lockCount === 0) {
    // ✅ MODO PRINCIPAL (teu caso): trava pelo HTML (scroll real)
    activeMode = 'html';

    applyScrollbarCompensation();
    document.documentElement.classList.add('no-scroll', 'modal-open');

    // ⚠️ NÃO fixa body aqui (evita conflito quando scroll owner é html)
    // document.body.style.position = 'fixed' ... (removido)
  }

  lockCount += 1;
}

/**
 * PT: Libera o scroll do documento.
 *     Só destrava quando nenhum modal restante existir.
 *
 * EN: Unlocks document scroll.
 *     Only unlocks when no modal remains.
 */
function unlockScroll() {
  if (lockCount === 0) return;

  lockCount -= 1;

  // ✅ recupera o scroll desta camada
  const y = scrollStack.pop() ?? 0;

  if (lockCount === 0) {
    // remove estados globais
    document.documentElement.classList.remove('no-scroll', 'modal-open');
    clearScrollbarCompensation();

    // ✅ 2 frames: evita restaurar antes do layout “voltar”
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setScrollY(y);
      });
    });

    activeMode = 'html';
  }
}

// ==========================
// 4) API AUXILIAR (DEBUG)
// ==========================

/**
 * PT: Retorna quantos locks estão ativos.
 * EN: Returns current active lock count.
 */
function getScrollLockCount() {
  return lockCount;
}

// ==========================
// 5) EXPORT PÚBLICO (FACADE)
// ==========================

export const LatchRootScroll = {
  lockScroll,
  unlockScroll,
  getScrollLockCount,
};
