// /assets/js/feedback/feedbackPreload.js
(function (w, d) {
  "use strict";

  d.addEventListener("DOMContentLoaded", () => {
    if (!w.FeedbackAPI) return;

    // ⚡ aquece cards (1 por plataforma)
    Promise.allSettled([
      w.FeedbackAPI.list("scs", 1, 1, { fast: 1 }),
      w.FeedbackAPI.list("ml", 1, 1, { fast: 1 }),
      w.FeedbackAPI.list("shopee", 1, 1, { fast: 1 }),
      w.FeedbackAPI.list("google", 1, 1, { fast: 1 }),
    ]);

    // ⚡ aquece TOTAL dos modais (fast=0, limit=1)
    const firstBust = Date.now();
    ["scs", "ml", "shopee", "google"].forEach((p) => {
      w.FeedbackAPI.listMeta(p, 1, 1, { fast: 0, _bust: firstBust }).catch(
        () => {}
      );
    });

    // ♻️ reaquecimento periódico (a cada 5 min)
    let warming = false;
    setInterval(async () => {
      if (warming) return;
      warming = true;
      try {
        const bust = Date.now();
        await Promise.allSettled([
          w.FeedbackAPI.list("scs", 1, 1, { fast: 1 }),
          w.FeedbackAPI.list("ml", 1, 1, { fast: 1 }),
          w.FeedbackAPI.list("shopee", 1, 1, { fast: 1 }),
          w.FeedbackAPI.list("google", 1, 1, { fast: 1 }),
          w.FeedbackAPI.listMeta("scs", 1, 1, { fast: 0, _bust: bust }),
          w.FeedbackAPI.listMeta("ml", 1, 1, { fast: 0, _bust: bust }),
          w.FeedbackAPI.listMeta("shopee", 1, 1, { fast: 0, _bust: bust }),
          w.FeedbackAPI.listMeta("google", 1, 1, { fast: 0, _bust: bust }),
        ]);
      } finally {
        warming = false;
      }
    }, 5 * 60 * 1000); // 5 min
  });
})(window, document);

// função para saber o tempo do card do feedback
// (function () {
//     const el = document.createElement('div');
//     el.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:9999;background:#111;color:#0f0;font:12px/1.4 monospace;padding:8px 10px;border-radius:8px;opacity:.85';
//     el.textContent = 'perf…';
//     document.body.appendChild(el);

//     async function time(label, fn) {
//         const t0 = performance.now(); await fn(); const dt = (performance.now() - t0) | 0;
//         el.textContent += `\n${label}: ${dt}ms`;
//     }

//     const bust = Date.now();
//     time('card scs', () => FeedbackAPI.list('scs', 1, 1, { fast: 1, _bust: bust }));
//     time('card ml', () => FeedbackAPI.list('ml', 1, 1, { fast: 1, _bust: bust }));
//     time('total scs', () => FeedbackAPI.listMeta('scs', 1, 1, { fast: 0, _bust: bust }));
// })();

// funçao para saber o tempo do modal e do card do feedback
(function () {
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;bottom:12px;left:12px;z-index:9999;background:#111;color:#0f0;font:12px/1.4 monospace;padding:8px 10px;border-radius:8px;opacity:.85;white-space:pre;";
  el.textContent = "perf…";
  document.body.appendChild(el);

  async function time(label, fn) {
    const t0 = performance.now();
    await fn();
    const dt = (performance.now() - t0) | 0;
    el.textContent += `\n${label}: ${dt}ms`;
  }

  const bust = Date.now();

  // 🟩 cards (1 por plataforma)
  time("card scs", () =>
    FeedbackAPI.list("scs", 1, 1, { fast: 1, _bust: bust })
  );
  time("card ml", () => FeedbackAPI.list("ml", 1, 1, { fast: 1, _bust: bust }));
  time("card shopee", () =>
    FeedbackAPI.list("shopee", 1, 1, { fast: 1, _bust: bust })
  );
  time("card google", () =>
    FeedbackAPI.list("google", 1, 1, { fast: 1, _bust: bust })
  );

  // 🟦 total (fast=0)
  time("total scs", () =>
    FeedbackAPI.listMeta("scs", 1, 1, { fast: 0, _bust: bust })
  );

  // 🟨 modal page1 (fast=1, 5 itens)
  time("modal scs", () =>
    FeedbackAPI.listMeta("scs", 1, 5, { fast: 1, _bust: bust })
  );
})();
