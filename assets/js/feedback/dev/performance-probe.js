// 🧪 Performance Probe — Dev Helper
//
// PT: Ferramenta simples para medir o tempo de resposta da API de feedback.
//     Mostra os resultados em um pequeno painel na tela.
//
// EN: Simple helper used to measure feedback API response times.
//     Displays the results in a small on-screen panel.

/* -----------------------------------------------------------------------------*/
// Validation
//
// PT: Verifica se a API recebida possui os métodos necessários.
// EN: Checks whether the provided API has the required methods.
/* -----------------------------------------------------------------------------*/
function isValidProbeApi(api) {
  return Boolean(api && typeof api.list === 'function' && typeof api.listMeta === 'function');
}

/* -----------------------------------------------------------------------------*/
// UI
//
// PT: Cria um painel simples para exibir os tempos na tela.
// EN: Creates a simple panel to display timing results on screen.
/* -----------------------------------------------------------------------------*/
function createProbePanel() {
  const panel = document.createElement('div');

  panel.style.cssText = [
    'position:fixed',
    'bottom:12px',
    'left:12px',
    'z-index:999999',
    'background:#111',
    'color:#0f0',
    'font:12px/1.4 monospace',
    'padding:8px 12px',
    'border-radius:8px',
    'opacity:.9',
    'white-space:pre',
  ].join(';');

  panel.textContent = 'Performance Probe:';
  document.body.appendChild(panel);

  return panel;
}

/* -----------------------------------------------------------------------------*/
// Benchmark
//
// PT: Mede o tempo de uma chamada assíncrona e escreve no painel.
// EN: Measures an async call and writes the result to the panel.
/* -----------------------------------------------------------------------------*/
async function measure(panel, label, callback) {
  const start = performance.now();

  try {
    await callback();
    const elapsed = Math.round(performance.now() - start);
    panel.textContent += `\n${label}: ${elapsed}ms`;
  } catch {
    panel.textContent += `\n${label}: error`;
  }
}

/* -----------------------------------------------------------------------------*/
// Public API
//
// PT: Executa testes simples de desempenho para endpoints usados no board.
//
// Como usar:
// import { runPerformanceProbe } from '/assets/js/feedback/dev/performance-probe.js';
// import { NaomiFeedbackCardAPI } from '/assets/js/feedback/board/api/naomi-feedback-card-api.js';
//
// runPerformanceProbe(NaomiFeedbackCardAPI);
//
// EN: Runs simple performance tests for endpoints used by the board.
/* -----------------------------------------------------------------------------*/
export async function runPerformanceProbe(api) {
  if (!isValidProbeApi(api)) return;

  const panel = createProbePanel();
  const cacheBust = Date.now();

  await measure(panel, 'card scs', () => api.list('scs', 1, 1, { fast: 1, _bust: cacheBust }));

  await measure(panel, 'card ml', () => api.list('ml', 1, 1, { fast: 1, _bust: cacheBust }));

  await measure(panel, 'card shopee', () =>
    api.list('shopee', 1, 1, { fast: 1, _bust: cacheBust })
  );

  await measure(panel, 'card google', () =>
    api.list('google', 1, 1, { fast: 1, _bust: cacheBust })
  );

  await measure(panel, 'total scs', () => api.listMeta('scs', 1, 1, { fast: 0, _bust: cacheBust }));

  await measure(panel, 'modal scs', () => api.listMeta('scs', 1, 5, { fast: 1, _bust: cacheBust }));
}
