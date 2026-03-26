/* -----------------------------------------------------------------------------*/
// 🌿 Elara — Board Helpers
//
// Nível / Level: Jovem / Young
//
// PT: Fornece utilidades leves do Board, como skeleton e backoff de rede.
//
// EN: Provides light Board utilities such as skeleton rendering and network backoff.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Network Resilience Config
//
// PT: Configurações simples de resiliência para tentativas de rede.
// EN: Simple resilience settings for network retry behavior.
/* -----------------------------------------------------------------------------*/
const NET = {
  timeoutMs: 9000,
  retryDelayBase: 600,
  retryMaxAttempts: 2,
  autoRetryAfterMs: 5000,
};

/* -----------------------------------------------------------------------------*/
// Loading Skeleton
//
// PT: Gera linhas de skeleton para estados de carregamento.
// EN: Generates skeleton lines for loading states.
/* -----------------------------------------------------------------------------*/
function skeletonLines(lines = 3) {
  let html = `<div class="animate-pulse">`;

  for (let index = 0; index < lines; index++) {
    const widthClass = index === 0 ? 'w-3/4' : index === lines - 1 ? 'w-1/2' : 'w-full';
    html += `<div class="h-4 bg-neutral-200 rounded ${widthClass} mb-2"></div>`;
  }

  html += '</div>';
  return html;
}

/* -----------------------------------------------------------------------------*/
// Backoff with Jitter
//
// PT: Calcula backoff exponencial com pequeno jitter aleatório.
// EN: Calculates exponential backoff with a small random jitter.
/* -----------------------------------------------------------------------------*/
function backoff(attempt) {
  return NET.retryDelayBase * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/
export const ElaraBoardHelpers = {
  NET,
  skeletonLines,
  backoff,
};
