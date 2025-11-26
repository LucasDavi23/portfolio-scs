// /assets/js/feedback/feedbackInit.js
(function () {
    'use strict';

    // cache simples (opcional) para usar no modal
    window.FeedbackCache = window.FeedbackCache || new Map();

    function pronto(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn, { once: true });
    }

    const isInFeedbackModal = (el) => !!el.closest('#modalFeedback');

    function srcValido(s) {
        if (!s) return false;
        const t = String(s).trim();
        if (!t || t === '#' || t === 'about:blank') return false;
        return true;
    }

    // Hidrata 1 thumb-container (fora do modal de lista)
    function aplicarThumb(btn) {
        if (!btn || isInFeedbackModal(btn)) return;

        const img = btn.querySelector('img');
        if (!img) { btn.classList.add('hidden'); btn.classList.remove('js-open-modal'); return; }

        const thumb = img.getAttribute('src');
        let full = img.getAttribute('data-full') || btn.getAttribute('data-full');

        if (srcValido(thumb) && !srcValido(full)) {
            full = thumb;
            img.setAttribute('data-full', full);
            btn.setAttribute('data-full', full);
        }

        if (srcValido(thumb)) {
            btn.classList.remove('hidden');
            btn.classList.add('js-open-modal'); // usa o modal global de imagem
        } else {
            btn.classList.add('hidden');
            btn.classList.remove('js-open-modal');
        }
    }

    function scan(root = document) {
        root.querySelectorAll('.thumb-container').forEach(aplicarThumb);
    }

    // 🔥 pré-aquece a 1ª página de cada plataforma (opcional)
    async function prefetchPrimeiraPagina() {
        if (!window.FeedbackAPI?.list) return;
        const plats = ['scs', 'shopee', 'ml', 'google'];
        try {
            await Promise.all(plats.map(p =>
                window.FeedbackAPI.list(p, 1, 1).then(items => {
                    window.FeedbackCache.set(`${p}:1:1`, items);
                }).catch(() => null)
            ));
        } catch (_) { }
    }

    pronto(function () {
        // 1) hidrata thumbs já presentes
        scan();

        // 2) observa novos nós e re-hidrata thumbs
        const obs = new MutationObserver((mutList) => {
            for (const m of mutList) {
                m.addedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;

                    if (node.matches?.('.thumb-container')) aplicarThumb(node);
                    node.querySelectorAll?.('.thumb-container').forEach(aplicarThumb);

                    node.querySelectorAll?.('.thumb-container img').forEach((img) => {
                        new MutationObserver(() => aplicarThumb(img.closest('.thumb-container')))
                            .observe(img, { attributes: true, attributeFilter: ['src', 'data-full'] });
                    });
                });
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });

        // 3) 🚀 EAGER LOAD do mural (sem IntersectionObserver)
        if (window.FeedbackMural?.init) {
            window.FeedbackMural.init({ cards: { perPlatform: 1 } });
        }

        // 4) (opcional) pré-aquecer para o modal abrir instantâneo
        prefetchPrimeiraPagina();

        // 5) Clique global "Ver mais" → abre modal da plataforma
        document.addEventListener('click', (ev) => {
            const link = ev.target.closest('[data-action="ver-mais"][data-plataforma]');
            if (!link) return;
            ev.preventDefault();
            const plat = link.dataset.plataforma; // scs|shopee|ml|google
            if (window.FeedbackLista?.open) window.FeedbackLista.open(plat);
        });
    });
})();
