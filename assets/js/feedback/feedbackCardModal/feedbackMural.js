// /assets/js/feedback/feedbackMural.js

// imports
import {
  parseDrive,
  DRIVE_THUMB,
  DRIVE_FULL,
  ensureDriveUrl,
  tryBestDriveThumb,
  sanitizeUrl,
  imgProxyUrl,
  extractDriveId,
} from '../feedbackHelpers.js';

// Módulo do mural de feedbacks (Hero SCS + Shopee, ML, Google)
// Carrega apenas quando chamar FeedbackMural.init()
// Requer: window.FeedbackAPI.list(plat, page, limit) e window.FeedbackLista.open(plat)

// Hero e Cards mostram skeleton enquanto carregam.

// Em erro, exibem mensagem + botão “Tentar novamente”.

// Fazem autorretry em 5s quando online.

// Atualizam o Hero imediatamente quando o form dispara feedback:novo (usa detail.item se vier do servidor).

// Recarregam ao voltar a conexão (window.online).
(function () {
  'use strict';

  const LINK_PLATAFORMA = {
    shopee: 'https://shopee.com.br/',
    ml: 'https://www.mercadolivre.com.br/',
    google: 'https://www.google.com/maps/',
  };

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

  // Config de resiliência
  const NET = {
    timeoutMs: 9000, // só referência para mensagens
    retryDelayBase: 600, // 600ms, 1200ms, 2400ms (com jitter)
    retryMaxAttempts: 2, // 1 tentativa + 2 retries = 3 no total (combina com FeedbackAPI)
    autoRetryAfterMs: 5000, // se online, tenta sozinho após 5s
  };

  let CFG = JSON.parse(JSON.stringify(DEFAULTS));
  let _initSeq = 0;
  let heroAutoRetryTimer = null;
  let cardsAutoRetryTimer = null;

  // ---------- Utils ----------
  function renderEstrelas(n = 0) {
    const val = Math.max(0, Math.min(+n || 0, 5));
    return `
      <span class="inline-flex items-center gap-1" aria-label="${val} de 5 estrelas">
        <span class="text-yellow-500 text-sm">${'★'.repeat(Math.round(val))}</span>
        <span class="text-neutral-800 font-semibold text-sm">${val.toFixed(1)}</span>
      </span>
    `;
  }
  // converte valor qualquer em string
  function _toStr(v) {
    return typeof v === 'string' ? v : v == null ? '' : String(v);
  }
  // retorna a primeira string não-vazia
  function _firstNonEmpty(...vals) {
    for (const v of vals) {
      const s = _toStr(v).trim();
      if (s) return s;
    }
    return '';
  }
  // converte URL do Google Drive para link direto (embed/view)
  // function googleDriveToDirect(u) {
  //   const s = _toStr(u);
  //   if (!s) return "";
  //   if (/drive\.google\.com\/uc\?/.test(s)) return s; // já direto
  //   let m = s.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  //   if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  //   m = s.match(/[?&]id=([^&]+)/i);
  //   if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  //   return s; // devolve como veio (não-Drive ou já válido)
  // }

  /* ------------------------------------------------------------
   * pickImagePair(item)
   * ------------------------------------------------------------
   * 🇧🇷 Escolhe a melhor fonte de imagem do objeto `item` e
   * retorna { thumbUrl, fullUrl } já normalizados:
   * - Se for Google Drive (link ou ID), converte para proxy do GAS (imgProxyUrl).
   * - Se for http(s) comum (jpg/png/etc.), usa direto.
   * - Se já for o próprio proxy do GAS, mantém (não duplica).
   *
   * 🇺🇸 Picks the best image source from `item` and returns
   * { thumbUrl, fullUrl } normalized:
   * - Google Drive → proxied via GAS.
   * - Regular http(s) → used as-is.
   * - Already proxied → kept untouched.
   */
  function pickImagePair(item) {
    // 🔹 Proteção: se item não for objeto, retorna vazio
    if (!item || typeof item !== 'object') return { thumbUrl: '', fullUrl: '' };

    // ----------------------------------------------------------
    // Normalizador de valores (string/obj):
    // - Converte possíveis formatos (string direta, {url}, {href}, {id})
    // - Mantém só string "limpa" (trim)
    // ----------------------------------------------------------
    const toStr = (v) => {
      if (!v) return '';
      if (typeof v === 'string') return v.trim();
      if (typeof v === 'object') {
        if (typeof v.url === 'string') return v.url.trim();
        if (typeof v.href === 'string') return v.href.trim();
        if (typeof v.id === 'string') return v.id.trim();
      }
      return '';
    };

    // ----------------------------------------------------------
    // Filtro de "lixo" comum de planilha:
    // - Remove valores vazios, placeholders e "[object Object]"
    // ----------------------------------------------------------
    const isGarbage = (s) => {
      const t = String(s || '').trim();
      if (!t) return true;
      if (t === '[object Object]') return true;
      const lower = t.toLowerCase();
      return ['n/a', 'na', 'null', 'undefined', '#', '...', '…', '-', '—'].includes(lower);
    };

    // ----------------------------------------------------------
    // Heurística de plausibilidade:
    // - Aceita http(s), links do Drive ou um ID "parecido com Drive"
    // ----------------------------------------------------------
    const isPlausible = (s) =>
      /^https?:\/\//i.test(s) || /drive\.google\.com/i.test(s) || /^[\w-]{10,}$/.test(s);

    // ----------------------------------------------------------
    // Coleta de candidatos:
    // 🇧🇷 "candidates" varre os campos mais comuns e retorna o primeiro válido.
    // 🇺🇸 "candidates" scans common fields and keeps the first valid one.
    // (não precisamos detalhar cada campo aqui; ideia: "tudo que pode conter imagem")
    // ----------------------------------------------------------
    const candidates = [
      item.foto_url,
      item.image_url,
      item.image,
      item.url,
      item.foto,
      item.link,
      item.image_id,
      item.foto_id,
    ]
      .map(toStr) // normaliza valores diversos para string
      .filter((s) => !isGarbage(s)); // remove lixo

    // ----------------------------------------------------------
    // Pega o primeiro candidato plausível
    // ----------------------------------------------------------
    const raw = candidates.find(isPlausible) || '';
    if (!raw) return { thumbUrl: '', fullUrl: '' };

    // ----------------------------------------------------------
    // Hint de cache (opcional):
    // 🇧🇷 let aqui porque pode evoluir (ex.: trocar fonte do hint no futuro)
    // 🇺🇸 let because you might change the source later (e.g., updated_at)
    // ----------------------------------------------------------
    let cacheHint = item?.data || item?.timestamp || '';

    // ----------------------------------------------------------
    // Caso 2: é Drive (link/ID) → sempre usar o proxy do GAS
    // - extractDriveId: aceita formatos diversos (/file/d/ID, ?id=ID, ID puro…)
    // - imgProxyUrl: gera …/exec?action=img&id=<ID>&v=<cacheHint>
    // ----------------------------------------------------------

    const driveId = extractDriveId(raw);
    if (driveId) {
      const proxied = imgProxyUrl(driveId, cacheHint);
      const safe = sanitizeUrl(proxied);
      return { thumbUrl: safe, fullUrl: safe };
    }

    // ----------------------------------------------------------
    // Caso 3: http(s) comum → usar direto como thumb e full
    // - Ex.: CDN própria, imagens absolutas do site, etc.
    // ----------------------------------------------------------
    const httpSafe = sanitizeUrl(raw);
    return { thumbUrl: httpSafe, fullUrl: httpSafe };
  }

  // formata data ISO para dd/mm/aaaa
  function formatarData(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d)) return isoStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  }

  // gera linhas de esqueleto (skeleton) para loading
  function skeletonLines(lines = 3) {
    let out = '<div class="animate-pulse">';
    for (let i = 0; i < lines; i++) {
      const w = i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full';
      out += `<div class="h-4 bg-neutral-200 rounded ${w} mb-2"></div>`;
    }
    out += '</div>';
    return out;
  }

  // simples backoff com jitter (600, 1200, 2400… + 0–200ms)
  function backoff(attempt) {
    return NET.retryDelayBase * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
  }

  // ---------- HERO (preenche in-place, não recria HTML) ----------
  // function renderHeroInPlace(root, item) {
  //   if (!root) return;
  //   console.log('[renderHeroInPlace] ENTER', { item });
  //   const elAutor = root.querySelector('[data-h-autor]');
  //   const elEstrelas = root.querySelector('[data-h-estrelas]');
  //   const elData = root.querySelector('[data-h-data]');
  //   const elTexto = root.querySelector('[data-h-texto]');
  //   const btnMais = root.querySelector('[data-h-ver-mais]');

  //   if (!item) {
  //     if (elAutor) elAutor.textContent = '';
  //     if (elEstrelas) elEstrelas.innerHTML = '';
  //     if (elData) elData.textContent = '';
  //     if (elTexto) elTexto.textContent = '';
  //   } else {
  //     if (elAutor) elAutor.textContent = item.autor ?? 'Cliente';
  //     if (elEstrelas) elEstrelas.innerHTML = renderEstrelas(item.estrelas ?? item.rating);
  //     if (elData) elData.textContent = formatarData(item.data ?? item.data_iso);
  //     if (elTexto) elTexto.textContent = item.texto ?? item.comentario ?? '';
  //   }

  //   // --- THUMB do Hero (miniatura clicável) ---
  //   const btnThumb = root.querySelector('.thumb-container');
  //   const img = btnThumb?.querySelector('img');
  //   console.log('[renderHeroInPlace] thumb nodes', { btnThumb, img });

  //   if (btnThumb && img) {
  //     const { thumbUrl, fullUrl } = pickImagePair(item);
  //     console.log('[hero-thumb]', { thumbUrl, fullUrl, item });

  //     // estado inicial
  //     btnThumb.classList.add('hidden');
  //     btnThumb.classList.remove('js-open-modal');
  //     img.removeAttribute('data-full');
  //     btnThumb.removeAttribute('data-full');
  //     img.removeAttribute('srcset'); // evita conflitos
  //     img.removeAttribute('loading'); // evita lazy travado com hidden
  //     img.onload = null;
  //     img.onerror = null;

  //     if (thumbUrl) {
  //       img.onload = () => {
  //         console.log('[hero-thumb] onload OK');
  //         btnThumb.classList.remove('hidden');
  //         btnThumb.classList.add('js-open-modal');
  //         img.setAttribute('data-full', fullUrl);
  //         btnThumb.setAttribute('data-full', fullUrl);
  //       };
  //       img.onerror = () => {
  //         const retried = img.getAttribute('data-retried') === '1';
  //         if (!retried && fullUrl && fullUrl !== thumbUrl) {
  //           img.setAttribute('data-retried', '1');
  //           img.src = fullUrl; // fallback
  //           return;
  //         }
  //         btnThumb.classList.add('hidden');
  //         btnThumb.classList.remove('js-open-modal');
  //         img.removeAttribute('src');
  //       };
  //       img.removeAttribute('src');
  //       img.src = thumbUrl;
  //     } else {
  //       console.log('[hero-thumb] sem thumbUrl');
  //       img.removeAttribute('src');
  //     }
  //   } else {
  //     console.warn('[renderHeroInPlace] NÃO encontrou .thumb-container img no HERO');
  //   }
  // }

  // function renderHeroLoading(root) {
  //   const elTexto = root?.querySelector('[data-h-texto]');
  //   const elEst = root?.querySelector('[data-h-estrelas]');
  //   const elAutor = root?.querySelector('[data-h-autor]');
  //   const elData = root?.querySelector('[data-h-data]');
  //   if (elEst) elEst.innerHTML = skeletonLines(1);
  //   if (elAutor) elAutor.textContent = '';
  //   if (elData) elData.textContent = '';
  //   if (elTexto) elTexto.innerHTML = skeletonLines(3);
  // }

  // function renderHeroError(root, msg, onRetry) {
  //   const elTexto = root?.querySelector('[data-h-texto]');
  //   const elEst = root?.querySelector('[data-h-estrelas]');
  //   const elAutor = root?.querySelector('[data-h-autor]');
  //   const elData = root?.querySelector('[data-h-data]');
  //   if (elEst) elEst.innerHTML = '';
  //   if (elAutor) elAutor.textContent = '';
  //   if (elData) elData.textContent = '';
  //   if (elTexto) {
  //     elTexto.innerHTML = `
  //       <div class="rounded-lg border p-3">
  //         <p class="text-sm text-red-600 mb-2">${msg || 'Falha ao carregar.'}</p>
  //         <button type="button" class="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm" data-h-retry> Tentar novamente </button>
  //       </div>`;
  //     elTexto
  //       .querySelector('[data-h-retry]')
  //       ?.addEventListener('click', () => onRetry && onRetry());
  //   }
  // }

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
          NET.autoRetryAfterMs
        );
      }
    }
  }

  // ---------- CARDS FIXOS (preenche in-place) ----------
  function fillCardFixed(root, item) {
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
            class="thumb-container hidden w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0"
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
    if (headStars) headStars.innerHTML = renderEstrelas(ratingVal);

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

    if (elData) elData.textContent = formatarData(dataIso);
    if (elTexto) elTexto.textContent = texto;
    if (elAutor) elAutor.textContent = autor ? `— ${autor}` : '';

    // Thumb (já usa pickImagePair, ok)
    if (typeof item.foto_url === 'string' && item.foto_url.trim() === '[object Object]') {
      console.warn('[foto_url inválido no item]', { item });
    }

    // --- THUMB ROBUSTA + LOG ---
    const btnThumb = lista.querySelector('.thumb-container');
    const img = btnThumb?.querySelector('img');

    if (!btnThumb || !img) {
      console.warn('[thumb] nós não encontrados', { btnThumb: !!btnThumb, img: !!img, root });
    } else {
      const { thumbUrl, fullUrl } = pickImagePair(item); // continua gerando .../exec?action=img&id=...
      const proxyUrl = thumbUrl || fullUrl || '';

      btnThumb.classList.add('hidden');
      btnThumb.classList.remove('js-open-modal');
      img.onload = img.onerror = null;
      img.removeAttribute('data-full');
      btnThumb.removeAttribute('data-full');

      if (!proxyUrl) {
        img.removeAttribute('src');
        console.log('[thumb] sem URL válida – ficará oculto');
      } else {
        // força novo ciclo
        img.removeAttribute('src');
        img.referrerPolicy = 'no-referrer';
        img.decoding = 'async';
        img.setAttribute('loading', 'eager');

        // ⚠️ Agora buscamos a dataURL como TEXTO
        const bust = (proxyUrl.includes('?') ? '&' : '?') + 'cb=' + (Date.now() % 1e7);
        fetch(proxyUrl + bust)
          .then((r) => r.text())
          .then((dataUrl) => {
            if (!/^data:image\//i.test(dataUrl))
              throw new Error('proxy não retornou dataURL de imagem');
            img.onload = () => {
              btnThumb.classList.remove('hidden');
              btnThumb.classList.add('js-open-modal');
              const big = fullUrl || thumbUrl;
              if (big) {
                // Para o modal, reaproveite o mesmo proxy
                img.setAttribute('data-full', big);
                btnThumb.setAttribute('data-full', big);
              }
            };
            img.onerror = () => {
              console.warn('[thumb] erro renderizando dataURL');
              btnThumb.classList.add('hidden');
              btnThumb.classList.remove('js-open-modal');
              img.removeAttribute('src');
            };
            img.src = dataUrl;
          })
          .catch((err) => {
            console.warn('[thumb] fetch proxy falhou', err);
            btnThumb.classList.add('hidden');
            btnThumb.classList.remove('js-open-modal');
            img.removeAttribute('src');
          });
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
          <div class="text-xs text-neutral-500">${formatarData(it.data)}</div>
        </div>
        <div class="text-sm mb-1">${renderEstrelas(it.estrelas)}</div>
        <p class="text-sm text-neutral-700 line-clamp-3">${it.texto ?? ''}</p>
      </article>`;
  }

  function renderCardLoading(root) {
    const isMedia =
      root.getAttribute('data-variant') === 'media' ||
      !!root.querySelector('[data-c-list] .media-row');
    if (isMedia) return; // não troca o DOM do SCS
    const lista = root.querySelector('[data-c-list]');
    if (lista) lista.innerHTML = skeletonLines(3);
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
          NET.autoRetryAfterMs
        );
      }
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
      await this.init(CFG);
    },
  };

  // Atualiza Hero imediatamente quando um novo feedback for enviado (form)
  window.addEventListener('feedback:novo', (ev) => {
    const det = ev?.detail || {};
    if (det?.avaliacao?.plataforma !== 'scs') return;
    const root = document.querySelector(CFG.seletores.heroRoot);
    if (!root) return;

    // Se o servidor devolveu o item já formatado (createFeedback_), usa direto; senão, recarrega
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
      carregarHero({ silent: false });
    }
  });

  // Recarrega quando a conexão volta
  window.addEventListener('online', () => {
    carregarHero(_initSeq, { silent: false });
    const seq = _initSeq; // mesma rodada
    carregarCard(CFG.seletores.cardShopee, 'shopee', seq, { silent: true });
    carregarCard(CFG.seletores.cardML, 'ml', seq, { silent: true });
    carregarCard(CFG.seletores.cardGoogle, 'google', seq, { silent: true });
  });

  window.FeedbackMural = FeedbackMural;
})();
