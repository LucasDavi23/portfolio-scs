// /assets/js/feedback/feedbackMural.js
// Módulo do mural de feedbacks (Hero SCS + Shopee, ML, Google)
// Carrega apenas quando chamar FeedbackMural.init()
// Requer: window.FeedbackAPI.list(plat, page, limit) e window.FeedbackLista.open(plat)

(function () {
  "use strict";

  const LINK_PLATAFORMA = {
    shopee: "https://shopee.com.br/",
    ml: "https://www.mercadolivre.com.br/",
    google: "https://www.google.com/maps/",
  };

  const DEFAULTS = {
    hero: { plat: "scs", page: 1, limit: 1 },
    cards: { perPlatform: 2 },
    seletores: {
      heroRoot: "[data-feedback-hero]",
      cardShopee: '[data-feedback-card="shopee"]',
      cardML: '[data-feedback-card="ml"]',
      cardGoogle: '[data-feedback-card="google"]',
    },
  };

  let CFG = JSON.parse(JSON.stringify(DEFAULTS));

  // ---------- Utils ----------
  function renderEstrelas(n = 0) {
    const val = Math.max(0, Math.min(+n || 0, 5));
    return `
      <span class="inline-flex items-center gap-1" aria-label="${val} de 5 estrelas">
        <span class="text-yellow-500 text-sm">${"★".repeat(
          Math.round(val)
        )}</span>
        <span class="text-neutral-800 font-semibold text-sm">${val.toFixed(
          1
        )}</span>
      </span>
    `;
  }

  function formatarData(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d)) return isoStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  }

  function skeleton() {
    return `
      <div class="animate-pulse">
        <div class="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
      </div>`;
  }

  // ---------- HERO (preenche in-place, não recria HTML) ----------
  function renderHeroInPlace(root, item) {
    if (!root) return;

    const elAutor = root.querySelector("[data-h-autor]");
    const elEstrelas = root.querySelector("[data-h-estrelas]");
    const elData = root.querySelector("[data-h-data]");
    const elTexto = root.querySelector("[data-h-texto]");
    const btnMais = root.querySelector("[data-h-ver-mais]");

    if (!item) {
      if (elAutor) elAutor.textContent = "";
      if (elEstrelas) elEstrelas.innerHTML = "";
      if (elData) elData.textContent = "";
      if (elTexto) elTexto.textContent = "";
    } else {
      if (elAutor) elAutor.textContent = item.autor ?? "Cliente";
      if (elEstrelas) elEstrelas.innerHTML = renderEstrelas(item.estrelas);
      if (elData) elData.textContent = formatarData(item.data);
      if (elTexto) elTexto.textContent = item.texto ?? "";
    }

    if (btnMais && !btnMais._bound) {
      btnMais.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          if (window.FeedbackLista?.open) window.FeedbackLista.open("scs");
        },
        { once: true }
      );
      btnMais._bound = true;
    }
  }

  async function carregarHero() {
    const root = document.querySelector(CFG.seletores.heroRoot);
    if (!root) return;

    const holder = root.querySelector("[data-h-texto]");
    const backupPlaceholder = holder ? holder.innerHTML : "";

    try {
      const lista = await window.FeedbackAPI.list(
        CFG.hero.plat,
        CFG.hero.page,
        CFG.hero.limit
      );
      const item = Array.isArray(lista) && lista[0] ? lista[0] : null;
      renderHeroInPlace(root, item);
    } catch (e) {
      console.error("[feedbackMural] Erro Hero:", e);
      if (holder) holder.innerHTML = backupPlaceholder;
    }
  }

  // ---------- CARDS FIXOS (preenche in-place) ----------
  function fillCardFixed(root, item) {
    const lista = root.querySelector("[data-c-list]");
    if (!lista) return;

    // Cabeçalho (estrelinhas + nota)
    const headStars = root.querySelector("[data-c-estrelas]");
    if (headStars) headStars.innerHTML = renderEstrelas(item.estrelas);

    // Linha do artigo
    const miniStars = lista.querySelector("[data-c-item-stars]");
    if (miniStars) {
      const v = Math.max(0, Math.min(Number(item.estrelas) || 0, 5));
      miniStars.textContent = "★★★★★".slice(0, Math.max(1, Math.round(v)));
    }

    const elData = lista.querySelector("[data-c-data]");
    const elTexto = lista.querySelector("[data-c-texto]");
    const elAutor = lista.querySelector("[data-c-autor]");
    if (elData) elData.textContent = formatarData(item.data);
    if (elTexto) elTexto.textContent = item.texto || "";
    if (elAutor) elAutor.textContent = item.autor ? `— ${item.autor}` : "";

    // Thumb opcional
    const btnThumb = lista.querySelector(".thumb-container");
    const img = btnThumb?.querySelector("img");
    if (btnThumb && img) {
      const full = item.foto_url || item.image_url || "";
      if (full) {
        img.src = full;
        img.setAttribute("data-full", full);
        btnThumb.setAttribute("data-full", full);
        btnThumb.classList.remove("hidden");
        btnThumb.classList.add("js-open-modal");
      } else {
        btnThumb.classList.add("hidden");
        btnThumb.classList.remove("js-open-modal");
        img.removeAttribute("src");
        img.removeAttribute("data-full");
        btnThumb.removeAttribute("data-full");
      }
    }

    // 🔒 SEM link “Ver na plataforma” no card
    const linkPlat = root.querySelector("[data-c-link-plat]");
    if (linkPlat) {
      linkPlat.classList.add("hidden");
      linkPlat.removeAttribute("href");
    }

    // Botão “Ver mais”
    const btnMais = root.querySelector("[data-c-ver-mais]");
    if (btnMais && !btnMais._bound) {
      btnMais.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          window.FeedbackLista?.open?.(root.getAttribute("data-feedback-card"));
        },
        { once: true }
      );
      btnMais._bound = true;
    }
  }

  function renderCardFallback(root, itens) {
    const lista = root.querySelector("[data-c-list]");
    if (!lista) return;

    if (!itens?.length) {
      lista.innerHTML = `<div class="text-sm text-neutral-500">Ainda não há avaliações aprovadas aqui.</div>`;
      return;
    }

    const it = itens[0];
    lista.innerHTML = `
      <article class="p-3 border rounded-lg bg-white">
        <div class="flex items-center justify-between gap-3 mb-1">
          <div class="font-medium truncate">${it.autor ?? "Cliente"}</div>
          <div class="text-xs text-neutral-500">${formatarData(it.data)}</div>
        </div>
        <div class="text-sm mb-1">${renderEstrelas(it.estrelas)}</div>
        <p class="text-sm text-neutral-700 line-clamp-3">${it.texto ?? ""}</p>
      </article>`;
  }

  async function carregarCard(selector, plat) {
    const root = document.querySelector(selector);
    if (!root) return;

    const lista = root.querySelector("[data-c-list]");
    const placeholderHTML = lista ? lista.innerHTML : "";

    // opcional: estado de carregamento
    // if (lista) lista.innerHTML = skeleton();

    try {
      const itens = await window.FeedbackAPI.list(
        plat,
        1,
        CFG.cards.perPlatform
      );
      const item = Array.isArray(itens) && itens[0] ? itens[0] : null;

      if (!item) {
        if (lista) lista.innerHTML = placeholderHTML;
        return;
      }

      // Preenche usando ganchos data-* do seu HTML
      if (
        lista &&
        (lista.querySelector("[data-c-texto]") ||
          lista.querySelector("[data-c-autor]") ||
          lista.querySelector("[data-c-data]"))
      ) {
        fillCardFixed(root, item);
      } else {
        renderCardFallback(root, [item]);
      }

      // Link plataforma default (se item não tiver url)
      // const linkPlat = root.querySelector('[data-c-link-plat]');
      // if (linkPlat && !item.url) {
      //     const platHref = LINK_PLATAFORMA[plat] || '';
      //     if (platHref) {
      //         linkPlat.classList.remove('hidden');
      //         linkPlat.href = platHref;
      //         linkPlat.target = '_blank';
      //         linkPlat.rel = 'noopener';
      //     }
      // }

      // Botão "Ver mais" (caso não tenha sido vinculado no fillCardFixed)
      const btnMais = root.querySelector("[data-c-ver-mais]");
      if (btnMais && !btnMais._bound) {
        btnMais.addEventListener(
          "click",
          (e) => {
            e.preventDefault();
            if (window.FeedbackLista?.open) window.FeedbackLista.open(plat);
          },
          { once: true }
        );
        btnMais._bound = true;
      }
    } catch (e) {
      console.error(`[feedbackMural] Erro card ${plat}:`, e);
      if (lista) lista.innerHTML = placeholderHTML;
    }
  }

  // ---------- API pública ----------
  const FeedbackMural = {
    async init(opts = {}) {
      CFG = {
        hero: { ...DEFAULTS.hero, ...(opts.hero || {}) },
        cards: { ...DEFAULTS.cards, ...(opts.cards || {}) },
        seletores: { ...DEFAULTS.seletores, ...(opts.seletores || {}) },
      };

      if (!window.FeedbackAPI?.list) {
        console.warn("[feedbackMural] FeedbackAPI.list não encontrada.");
        return;
      }

      await carregarHero();
      await Promise.all([
        carregarCard(CFG.seletores.cardShopee, "shopee"),
        carregarCard(CFG.seletores.cardML, "ml"),
        carregarCard(CFG.seletores.cardGoogle, "google"),
      ]);
    },

    async refresh() {
      await this.init(CFG);
    },
  };

  window.FeedbackMural = FeedbackMural;
})();
