// /assets/js/feedback/dev/performance-probe.js
// 🧪 Performance Probe (dev only)
// PT: Ferramenta de desenvolvimento para medir o tempo de carregamento da API
//     de feedback. Mostra, na tela, o tempo em ms de cada chamada.
// EN: Development tool used to measure loading performance of the feedback API.
//     Displays response times (ms) directly on screen.

export function runPerformanceProbe(api) {
  if (!api || typeof api.list !== 'function') {
    console.warn('[PerformanceProbe] Invalid or missing API.');
    return;
  }

  // 🟩 small floating UI that prints times
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed',
    'bottom:12px',
    'left:12px',
    'z-index:999999',
    'background:#111',
    'color:#0f0',
    'font:12px/1.4 monospace',
    'padding:8px 12px',
    'border-radius:8px',
    'opacity:.90',
    'white-space:pre',
    'box-shadow:0 0 6px #0f0',
  ].join(';');
  el.textContent = 'Performance Probe:';
  document.body.appendChild(el);

  // generic bench function
  async function time(label, fn) {
    const t0 = performance.now();
    await fn();
    const dt = (performance.now() - t0) | 0;
    el.textContent += `\n${label}: ${dt}ms`;
  }

  // unique timestamp to bust caches
  const bust = Date.now();

  // 🟩 card (fast=1) tests
  time('card scs', () => api.list('scs', 1, 1, { fast: 1, _bust: bust }));
  time('card ml', () => api.list('ml', 1, 1, { fast: 1, _bust: bust }));
  time('card shopee', () => api.list('shopee', 1, 1, { fast: 1, _bust: bust }));
  time('card google', () => api.list('google', 1, 1, { fast: 1, _bust: bust }));

  // 🟦 total count (fast=0)
  time('total scs', () => api.listMeta('scs', 1, 1, { fast: 0, _bust: bust }));

  // 🟨 modal first page (fast=1, 5 items)
  time('modal scs', () => api.listMeta('scs', 1, 5, { fast: 1, _bust: bust }));
}
