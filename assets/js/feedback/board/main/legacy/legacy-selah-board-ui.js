// /assets/js/feedback/board/main/selah-board-ui.js
// 🌿 Selah — Board de Avaliações (UI)
// PT: Simboliza contemplação. Exibe o Board de avaliações com transições suaves.
// EN: Symbolizes contemplation. Renders the review board with smooth transitions.
/* -----------------------------------------------------------------------------*/

// Imports / Dependências
// -----------------------------------------------------------------------------

// 🌿 Dalia — lógica de imagem (helpers)
// EN 🌿 Dalia — image logic (helpers)
// Fornece:
// - FALLBACK_IMG

import { DaliaImageHelpers } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

/* -----------------------------------------------------------------------------*/

// 🎨 Petra — UI da imagem (thumb + auto-recover)
// EN 🎨 Petra — Image UI (thumb + auto-recover)
// Fornece:
// - LoadThumbWithRetries,
// - smartAutoRecover,
// - markHasPhoto

import { PetraImageUI } from '/assets/js/feedback/board/image/petra-image-ui.js';
/* -----------------------------------------------------------------------------*/

// ✨ Elara — helpers do board (estrelas, datas, imagens)
// EN ✨ Elara — board helpers (stars, dates, images)
// Fornece:
//  - formatDate()
//  - skeletonLines()
//  - pickImagePair()
//  - NET (retry/backoff config)

import { ElaraBoardHelpers } from '/assets/js/feedback/board/main/elara-board-helpers.js';

// ------------------------------------------------------------
// ⭐ Zoe — rating UI do system (avaliações por estrelas)
// EN ⭐ Zoe — system rating UI (star-based ratings)
// Fornece:
//  - renderRating()
//  - normalizeRating()
//  - mountInput()

import { ZoeRating } from '/assets/js/system/ui/rating/zoe-rating.js';

// ------------------------------------------------------------

// Módulo do Board de feedbacks (Hero SCS + Shopee, ML, Google)
// Carrega apenas quando chamar FeedbackMural.init() (mantido por compat)
// Requer: window.FeedbackAPI.list(plat, page, limit) e window.FeedbackLista.open(plat)
// Hero e Cards mostram skeleton enquanto carregam.
// Em erro, exibem mensagem + botão “Tentar novamente”.
// Fazem autorretry em 5s quando online.
// Atualizam o Hero imediatamente quando o form dispara feedback:novo.
// Recarregam ao voltar a conexão (window.online).

const DEFAULTS = {
  hero: { plat: 'scs', page: 1, limit: 1 },
  cards: { perPlatform: 2 },
  seletores: {
    heroRoot: '[data-feedback-hero]',
    cardSCS: '[data-feedback-card="scs"]',
    cardShopee: '[data-feedback-card="shopee"]',
    cardML: '[data-feedback-card="ml"]',
    cardGoogle: '[data-feedback-card="google"]',
  },
};

let CFG = JSON.parse(JSON.stringify(DEFAULTS));
let _initSeq = 0;
let heroAutoRetryTimer = null;
let cardsAutoRetryTimer = null;

// --------------------------------------------------
// Realtime refresh (debounce) — internal state
// --------------------------------------------------
let committedRefreshTimer = null;
let lastCommittedClientRequestId = '';

// ---------- HERO (preenche in-place, não recria HTML) ----------
function renderHeroInPlace(root, item) {
  if (!root) return;

  const elAutor = root.querySelector('[data-h-autor]');
  const elEstrelas = root.querySelector('[data-h-estrelas]');
  const elData = root.querySelector('[data-h-data]');
  const elTexto = root.querySelector('[data-h-texto]');

  if (!item) {
    if (elAutor) elAutor.textContent = '';
    if (elEstrelas) elEstrelas.innerHTML = '';
    if (elData) elData.textContent = '';
    if (elTexto) elTexto.textContent = '';
  } else {
    if (elAutor) elAutor.textContent = item.autor ?? 'Cliente';
    if (elEstrelas) elEstrelas.innerHTML = ZoeRating.renderRating(item.estrelas ?? item.rating);
    if (elData) elData.textContent = ElaraBoardHelpers.formatDate(item.data ?? item.data_iso);
    if (elTexto) elTexto.textContent = item.texto ?? item.comentario ?? '';
  }

  // --- THUMB do Hero (miniatura clicável) ---
  const btnThumb = root.querySelector('.thumb-container');
  const img = btnThumb?.querySelector('img');

  if (btnThumb && img) {
    const { thumbUrl, fullUrl } = pickImagePair(item);

    // estado inicial
    btnThumb.classList.add('hidden');
    btnThumb.classList.remove('js-open-modal');
    img.removeAttribute('data-full');
    btnThumb.removeAttribute('data-full');
    img.removeAttribute('srcset');
    img.removeAttribute('loading');
    img.onload = null;
    img.onerror = null;

    if (thumbUrl) {
      img.onload = () => {
        btnThumb.classList.remove('hidden');
        btnThumb.classList.add('js-open-modal');
        img.setAttribute('data-full', fullUrl);
        btnThumb.setAttribute('data-full', fullUrl);
      };
      img.onerror = () => {
        const retried = img.getAttribute('data-retried') === '1';
        if (!retried && fullUrl && fullUrl !== thumbUrl) {
          img.setAttribute('data-retried', '1');
          img.src = fullUrl; // fallback
          return;
        }
        btnThumb.classList.add('hidden');
        btnThumb.classList.remove('js-open-modal');
        img.removeAttribute('src');
      };
      img.removeAttribute('src');
      img.src = thumbUrl;
    } else {
      img.removeAttribute('src');
    }
  }
}

function renderHeroLoading(root) {
  const elTexto = root?.querySelector('[data-h-texto]');
  const elEst = root?.querySelector('[data-h-estrelas]');
  const elAutor = root?.querySelector('[data-h-autor]');
  const elData = root?.querySelector('[data-h-data]');
  if (elEst) elEst.innerHTML = ElaraBoardHelpers.skeletonLines(1);
  if (elAutor) elAutor.textContent = '';
  if (elData) elData.textContent = '';
  if (elTexto) elTexto.innerHTML = ElaraBoardHelpers.skeletonLines(3);
}

function renderHeroError(root, msg, onRetry) {
  const elTexto = root?.querySelector('[data-h-texto]');
  const elEst = root?.querySelector('[data-h-estrelas]');
  const elAutor = root?.querySelector('[data-h-autor]');
  const elData = root?.querySelector('[data-h-data]');
  if (elEst) elEst.innerHTML = '';
  if (elAutor) elAutor.textContent = '';
  if (elData) elData.textContent = '';
  if (elTexto) {
    elTexto.innerHTML = `
        <div class="rounded-lg border p-3">
          <p class="text-sm text-red-600 mb-2">${msg || 'Falha ao carregar.'}</p>
          <button type="button" class="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm" data-h-retry>
            Tentar novamente
          </button>
        </div>`;
    elTexto.querySelector('[data-h-retry]')?.addEventListener('click', () => onRetry && onRetry());
  }
}

async function carregarHero(seq, { silent = false } = {}) {
  const root = document.querySelector(CFG.seletores.heroRoot);
  if (!root) return;

  clearTimeout(heroAutoRetryTimer);
  if (!silent) renderHeroLoading(root);

  try {
    // 1) tenta normal
    let lista = await window.FeedbackAPI.list(CFG.hero.plat, CFG.hero.page, CFG.hero.limit, {
      fast: 1,
    });
    // 2) fallback: se veio vazio, tenta sem fast (caso cache do GAS esteja atrasado)
    if (!Array.isArray(lista) || !lista.length) {
      lista = await window.FeedbackAPI.list(CFG.hero.plat, CFG.hero.page, CFG.hero.limit, {
        fast: 0,
      });
    }

    console.log('[carregarHero] itens carregados', {
      count: lista?.length,
      lista,
    });

    // 👇 se outra rodada começou, não pinta mais nada
    if (seq !== _initSeq) return;

    const item = Array.isArray(lista) && lista[0] ? lista[0] : null;
    if (!item) throw new Error('Sem dados para exibir.');
    renderHeroInPlace(root, item);
  } catch (e) {
    console.warn('[feedbackMural] Erro Hero:', e);
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    const msg = offline
      ? 'Sem conexão. Verifique sua internet.'
      : e?.message || 'Falha ao carregar.';

    renderHeroError(root, msg, () => carregarHero(_initSeq, { silent: false }));

    // autoretry: se está online, tenta de novo em 5s
    if (!offline) {
      heroAutoRetryTimer = setTimeout(
        () => carregarHero(_initSeq, { silent: true }),
        ElaraBoardHelpers.NET.autoRetryAfterMs
      );
    }
  }
}

// ---------- CARDS FIXOS (preenche in-place) ----------
async function fillCardFixed(root, item) {
  const lista = root.querySelector('[data-c-list]');
  if (!lista) return;

  // ✅ 1) detecta se é o layout mídia (SCS)
  const isMedia =
    root.getAttribute('data-variant') === 'media' || !!lista.querySelector('.media-row');

  // ✅ 2) só reescreve o miolo se NÃO for mídia
  if (!isMedia) {
    lista.innerHTML = `
      <div class="grid grid-cols-[3.5rem_1fr_auto] items-start gap-3">
    <button type="button"
            class="thumb-container hidden relative w-[84px] aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50 p-1 shrink-0"
            aria-label="Ver foto">
      <img alt="" class="w-full h-full object-cover object-center" />
    </button>

    <div class="min-w-0">
      <p class="text-gray-800 leading-6 line-clamp-2" data-c-texto></p>
      <p class="mt-1 text-[12px] text-gray-600 font-medium tracking-wide" data-c-autor></p>
    </div>

    <time class="text-[11px] text-gray-500 whitespace-nowrap" data-c-data></time>
  </div>
    `;
  }

  // Estrelas (rating/estrelas)
  const headStars = root.querySelector('[data-c-estrelas]');
  const ratingVal = Number(item.estrelas ?? item.rating) || 0;
  if (headStars) headStars.innerHTML = ZoeRating.renderRating(ratingVal);

  const miniStars = lista.querySelector('[data-c-item-stars]');
  if (miniStars) {
    const v = Math.max(0, Math.min(ratingVal, 5));
    miniStars.textContent = '★★★★★'.slice(0, Math.max(1, Math.round(v)));
  }

  // Data / Texto / Autor com alias
  const elData = lista.querySelector('[data-c-data]');
  const elTexto = lista.querySelector('[data-c-texto]');
  const elAutor = lista.querySelector('[data-c-autor]');

  const dataIso = item.data ?? item.data_iso;
  const texto = item.texto ?? item.comentario ?? '';
  const autor = item.autor ?? item.nome ?? '';

  if (elData) elData.textContent = ElaraBoardHelpers.formatDate(dataIso);
  if (elTexto) elTexto.textContent = texto;
  if (elAutor) elAutor.textContent = autor ? `— ${autor}` : '';

  // Thumb (já usa pickImagePair, ok)
  if (typeof item.foto_url === 'string' && item.foto_url.trim() === '[object Object]') {
    console.warn('[foto_url inválido no item]', { item });
  }

  /* ------------------------------------------------------------
     * Thumb do card: carregar imagem via proxy + preparar modal
     * ------------------------------------------------------------
     * 🇧🇷 1) Encontra os nós (botão/área clicável e <img>)
     *     2) Reseta estado visual/atributos
     *     3) Decide URLs (thumb/full) com pickImagePair()
     *     4) Carrega imagem com retries curtos
     *     5) Inicia auto-recover em background
     *
     * 🇺🇸 1) Find nodes (click area and <img>)
     *     2) Reset visual/attrs
     *     3) Decide URLs (thumb/full) with pickImagePair()
     *     4) Load image with short retries
     *     5) Start background auto-recover  
     * Conceito importante:
        - Não abrimos o modal com o link cru do Google (GAS)
          porque ele pode retornar HTML, erros ou headers inválidos.
        - A thumb já passa por proxy, auto-recover e conversão → 
          então ela é **o teste perfeito** de que a imagem funciona.
        - Se a thumb exibiu algo, o modal DEVE usar esse mesmo src.
        ================================================================
     */
  {
    const btnThumbEl = lista.querySelector('.thumb-container'); // área clicável (abre modal)
    const imgEl = btnThumbEl?.querySelector('img'); // a imagem em si

    if (!btnThumbEl || !imgEl) {
      console.warn('[thumb] nós não encontrados', { btnThumb: !!btnThumbEl, img: !!imgEl, root });
    } else {
      // 1) URLs normalizadas (proxy p/ Drive; http normal como está)
      const { thumbUrl, fullUrl } = ElaraBoardHelpers.pickImagePair(item);

      /*  
          🇧🇷 sourceForThumb = URL usada para tentar carregar a imagem da thumb.
              Essa URL entra no "moedor" (proxy + retries + base64).

          🇺🇸 sourceForThumb = the URL we try to load through the proxy pipeline.
        */
      const sourceForThumb = thumbUrl || fullUrl || '';

      /*  
          🇧🇷 rawBigUrl = URL original maior (caso queira futuro HD).
              Ela NÃO é usada no modal atualmente, somente guardada.

          🇺🇸 rawBigUrl = original bigger image URL (kept for future use only).
        */
      const rawBigUrl = fullUrl || thumbUrl || '';

      //garantindo o root card
      const rootCard = root || lista.closest('section[data-feedback-card]'); // se já tem 'root', use-o
      // 0) estado inicial: assume SEM foto
      PetraImageUI.markHasPhoto(rootCard, false);

      // 3) Reset de estado visual e atributos
      btnThumbEl.classList.add('hidden'); // começa escondido até carregar
      btnThumbEl.classList.remove('js-open-modal');
      imgEl.onload = imgEl.onerror = null;
      imgEl.removeAttribute('data-full');
      btnThumbEl.removeAttribute('data-full');
      imgEl.removeAttribute('src');
      imgEl.referrerPolicy = 'no-referrer'; // ajuda em cenários de Cores/origem
      imgEl.decoding = 'async';
      imgEl.setAttribute('loading', 'eager');

      if (!sourceForThumb) {
        console.log('[thumb] sem URL válida – ficará oculto');
        // opcional: imgEl.src = DaliaImageHelpers.FALLBACK_IMG;
        PetraImageUI.markHasPhoto(rootCard, false);
      } else {
        try {
          // 4) Retries curtos antes do fallback (não travam o card)
          // let aqui pra você poder calibrar rápido (ex.: 2 em dev, 3 em prod)
          let maxAttempts = 2;

          await PetraImageUI.loadThumbWithRetries(
            imgEl,
            btnThumbEl,
            sourceForThumb,
            rawBigUrl,
            maxAttempts
          );

          // --> AQUI: se carregou, o botão NÃO estará "hidden"
          const ok = !btnThumbEl.classList.contains('hidden');
          PetraImageUI.markHasPhoto(rootCard, ok);

          // 👇 NOVO: usa A SRC FINAL DA THUMB COMO FONTE DO MODAL
          const finalUrlForModal = imgEl.src; // já é algo que o navegador conseguiu exibir (base64 ou não)

          // 5) Com a thumb visível, configurar dados p/ modal
          if (finalUrlForModal && ok) {
            // só se carregou mesmo
            imgEl.dataset.full = finalUrlForModal;
            btnThumbEl.dataset.full = finalUrlForModal; // marca que abre o modal
            btnThumbEl.classList.add('js-open-modal');
            btnThumbEl.setAttribute('role', 'button'); // acessibilidade
            btnThumbEl.setAttribute('tabindex', '0'); // focável via teclado
          }
          // 6) Auto-recover em background (se o proxy “acordar”, a imagem troca sozinha)
          PetraImageUI.smartAutoRecover(imgEl, sourceForThumb, 60000, 10000); // total 60s, tenta a cada 10s
        } catch (err) {
          console.warn('[thumb] falhou até após retries, fallback + auto-recover', err);
          imgEl.src = DaliaImageHelpers.FALLBACK_IMG;
          btnThumbEl.classList.remove('js-open-modal');
          PetraImageUI.smartAutoRecover(imgEl, sourceForThumb, 60000, 10000); // total 60s, tenta a cada 10s
          PetraImageUI.markHasPhoto(rootCard, false);
        }
      }
    }
  }

  // Oculta link plataforma (se existir no markup)
  const linkPlat = root.querySelector('[data-c-link-plat]');
  if (linkPlat) {
    linkPlat.classList.add('hidden');
    linkPlat.removeAttribute('href');
  }

  // Botão ver mais (mantém)
  const btnMais = root.querySelector('[data-c-ver-mais]');
  if (btnMais && !btnMais._bound) {
    btnMais.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        window.FeedbackLista?.open?.(root.getAttribute('data-feedback-card'));
      },
      { once: true }
    );
    btnMais._bound = true;
  }
}

// ---------- RENDER HELPERS (fallback, loading, error) ----------
function renderCardFallback(root, itens) {
  const lista = root.querySelector('[data-c-list]');
  if (!lista) return;

  if (!itens?.length) {
    lista.innerHTML = `<div class="text-sm text-neutral-500">Ainda não há avaliações aprovadas aqui.</div>`;
    return;
  }

  const it = itens[0];
  lista.innerHTML = `
      <article class="p-3 border rounded-lg bg-white">
        <div class="flex items-center justify-between gap-3 mb-1">
          <div class="font-medium truncate">${it.autor ?? 'Cliente'}</div>
          <div class="text-xs text-neutral-500">${ElaraBoardHelpers.formatDate(it.data)}</div>
        </div>
        <div class="mb-1">
          ${ZoeRating.renderRating(it.estrelas, { size: 'text-sm sm:text-base' })}
        </div>

        <p class="text-sm text-neutral-700 line-clamp-3">${it.texto ?? ''}</p>
      </article>`;
}

function renderCardLoading(root) {
  const isMedia =
    root.getAttribute('data-variant') === 'media' ||
    !!root.querySelector('[data-c-list] .media-row');
  if (isMedia) return; // não troca o DOM do SCS
  const lista = root.querySelector('[data-c-list]');
  if (lista) lista.innerHTML = ElaraBoardHelpers.skeletonLines(3);
}

function renderCardError(root, msg, onRetry) {
  const lista = root.querySelector('[data-c-list]');
  if (!lista) return;
  lista.innerHTML = `
      <div class="rounded-lg border p-3">
        <p class="text-sm text-red-600 mb-2">${msg || 'Falha ao carregar.'}</p>
        <button type="button" class="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm" data-c-retry>Tentar novamente</button>
      </div>`;
  lista.querySelector('[data-c-retry]')?.addEventListener('click', () => onRetry && onRetry());
}

async function carregarCard(selector, plat, seq, { silent = false } = {}) {
  console.log('[carregarCard] ENTER', { selector, plat, seq, _initSeq });

  const root = document.querySelector(selector);
  if (!root) {
    console.warn('[carregarCard] root NÃO encontrado para', selector);
    return;
  }

  clearTimeout(cardsAutoRetryTimer);
  if (!silent) renderCardLoading(root);

  try {
    let itens = await window.FeedbackAPI.list(plat, 1, CFG.cards.perPlatform, { fast: 1 });
    if (!Array.isArray(itens) || !itens.length) {
      itens = await window.FeedbackAPI.list(plat, 1, CFG.cards.perPlatform, {
        fast: 0,
      });
    }

    console.log('[carregarCard] itens carregados', {
      plat,
      count: itens?.length,
      itens,
    });

    // evita pintar rodada velha
    if (seq !== _initSeq) {
      console.warn('[carregarCard] ABORT seq mismatch', { seq, _initSeq });
      return;
    }

    const item = Array.isArray(itens) && itens[0] ? itens[0] : null;
    if (!item) {
      console.log('[carregarCard] sem item -> fallback');
      renderCardFallback(root, []);
      return;
    }

    // verifica se é card fixo (data-c-list existe)
    const lista = root.querySelector('[data-c-list]');
    console.log('[carregarCard] lista existe?', !!lista);

    // 👉 sempre monta o miolo padrão; o fillCardFixed já cria a estrutura
    if (lista) {
      console.log('[carregarCard] chamando fillCardFixed...');
      fillCardFixed(root, item);
    } else {
      console.log('[carregarCard] sem [data-c-list] -> fallback');
      renderCardFallback(root, [item]);
    }
  } catch (e) {
    console.error(`[feedbackMural] Erro card ${plat}:`, e);
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    const msg = offline
      ? 'Sem conexão. Verifique sua internet.'
      : e?.message || 'Falha ao carregar.';

    // ✅ passa seq no callback do botão
    renderCardError(root, msg, () => carregarCard(selector, plat, _initSeq, { silent: false }));

    if (!offline) {
      cardsAutoRetryTimer = setTimeout(
        () => carregarCard(selector, plat, _initSeq, { silent: true }),
        ElaraBoardHelpers.NET.autoRetryAfterMs
      );
    }
  }
}

function scheduleBoardRefreshFromCommitted(detail) {
  const clientRequestId = String(detail?.clientRequestId || '');

  // PT: sem id, ignora (contrato do evento)
  // EN: no id, ignore (event contract)
  if (!clientRequestId) return;

  // PT: de-dupe (evita processar o mesmo commit duas vezes)
  // EN: de-dupe (avoid processing same commit twice)
  if (clientRequestId === lastCommittedClientRequestId) return;
  lastCommittedClientRequestId = clientRequestId;

  // PT: debounce curtinho (evita múltiplos refresh caso tenha 2 eventos)
  // EN: short debounce (avoid multiple refresh bursts)
  clearTimeout(committedRefreshTimer);
  committedRefreshTimer = setTimeout(() => {
    SelahBoardUI.refresh?.();
  }, 250);
}

// ---------- API pública (moderna) ----------
const SelahBoardUI = {
  async init(opts = {}) {
    CFG = {
      hero: { ...DEFAULTS.hero, ...(opts.hero || {}) },
      cards: { ...DEFAULTS.cards, ...(opts.cards || {}) },
      seletores: { ...DEFAULTS.seletores, ...(opts.seletores || {}) },
    };

    if (!window.FeedbackAPI?.list) {
      console.warn('[feedbackMural] FeedbackAPI.list não encontrada.');
      return;
    }

    const mySeq = ++_initSeq;
    await carregarHero(mySeq);
    await Promise.allSettled([
      carregarCard(CFG.seletores.cardSCS, 'scs', mySeq),
      carregarCard(CFG.seletores.cardShopee, 'shopee', mySeq),
      (async () => {
        await new Promise((r) => setTimeout(r, 200));
        return carregarCard(CFG.seletores.cardML, 'ml', mySeq);
      })(),
      (async () => {
        await new Promise((r) => setTimeout(r, 400));
        return carregarCard(CFG.seletores.cardGoogle, 'google', mySeq);
      })(),
    ]);
  },

  async refresh() {
    if (!window.FeedbackAPI?.list) return;

    const seq = ++_initSeq;

    await Promise.allSettled([
      carregarCard(CFG.seletores.cardSCS, 'scs', seq, { silent: true }),
      carregarCard(CFG.seletores.cardShopee, 'shopee', seq, { silent: true }),
      carregarCard(CFG.seletores.cardML, 'ml', seq, { silent: true }),
      carregarCard(CFG.seletores.cardGoogle, 'google', seq, { silent: true }),
    ]);
  },
};

// Atualiza Hero imediatamente quando um novo feedback for enviado (form)
window.addEventListener('feedback:novo', (ev) => {
  const det = ev?.detail || {};
  if (det?.avaliacao?.plataforma !== 'scs') return;
  const root = document.querySelector(CFG.seletores.heroRoot);
  if (!root) return;

  if (det.item) {
    renderHeroInPlace(root, {
      rating: det.item.rating,
      estrelas: det.item.rating,
      nome: det.item.nome,
      autor: det.item.nome,
      comentario: det.item.comentario,
      texto: det.item.comentario,
      data_iso: det.item.data_iso,
      data: det.item.data_iso,
      foto_url: det.item.foto_url,
    });
  } else {
    // ⚠️ Mantido como estava, para não mexer no comportamento agora
    carregarHero({ silent: false });
  }
});

// Recarrega quando a conexão volta
window.addEventListener('online', () => {
  const seq = _initSeq;
  carregarCard(CFG.seletores.cardSCS, 'scs', seq, { silent: true });
  carregarCard(CFG.seletores.cardShopee, 'shopee', seq, { silent: true });
  carregarCard(CFG.seletores.cardML, 'ml', seq, { silent: true });
  carregarCard(CFG.seletores.cardGoogle, 'google', seq, { silent: true });
});

// PT: Realtime: quando um feedback foi confirmado (submit OU outbox), recarrega o board
// EN: Realtime: when a feedback is committed (submit OR outbox), refresh the board
window.addEventListener('feedback:committed', (ev) => {
  const detail = ev?.detail || null;
  if (!detail) return;

  // Log opcional (pode tirar depois)
  console.log('[Selah] feedback:committed -> refresh', {
    source: detail.source,
    clientRequestId: detail.clientRequestId,
  });

  scheduleBoardRefreshFromCommitted(detail);
});

// Compatibilidade com legado
window.FeedbackMural = SelahBoardUI;

// Export moderno para o bootstrap
export { SelahBoardUI };
