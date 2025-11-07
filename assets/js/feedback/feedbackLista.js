// /assets/js/feedback/feedbackLista.js
// UI do modal de lista de feedbacks (abre/fecha/paginação/render) — sem backend.
// Requer: window.FeedbackAPI.listMeta(plat, page, limit, { fast })

(function (w, d) {
  // ==========================
  // 1) CONFIG E CONSTANTES
  // ==========================
  const LINK_PLATAFORMA = {
    shopee: 'https://shopee.com.br/SEU_PERFIL',
    ml: 'https://www.mercadolivre.com.br/perfil/SEU_PERFIL',
    google: 'https://g.page/r/SEU_PLACE_ID',
  };

  // ==========================
  // 2) HELPERS
  // ==========================
  const qs = (s, r = d) => r.querySelector(s);
  const qsa = (s, r = d) => Array.from(r.querySelectorAll(s));
  const pronto = (fn) => (d.readyState !== 'loading' ? fn() : d.addEventListener('DOMContentLoaded', fn));

  function nomePlataforma(plat) {
    switch (plat) {
      case 'shopee': return 'Shopee';
      case 'ml': return 'Mercado Livre';
      case 'google': return 'Google';
      default: return 'Avaliações do site (SCS)';
    }
  }

  // ==========================
  // 3) ESTADO DO MODAL
  // ==========================
  const state = {
    plat: 'scs',
    page: 1,
    limit: 5,          // ⚡ carrega 5 por página
    hasMore: false,
    carregando: false,
    total: undefined,  // total real (obtido em paralelo com fast:0)
  };

  // controla chamada paralela do total
  let _buscandoTotal = false;

  // ==========================
  // 4) REFERÊNCIAS DE DOM
  // ==========================
  const els = {
    modal: qs('#modalFeedback'),
    titulo: qs('#modalFeedbackTitulo'),
    sub: qs('#modalFeedbackSub'),
    lista: qs('#modalFeedbackLista'),
    info: qs('#modalFeedbackInfo'),
    btnMore: qs('#modalFeedbackLoadMore'),
    btnClose: qs('#modalFeedbackClose'),
    btnPlat: qs('#modalFeedbackLink'), // “Ver na plataforma”
  };

  // ==========================
  // 5) RENDERIZAÇÕES
  // ==========================
  /**
   * Monta 1 item de avaliação.
   * it: { estrelas, data, autor, texto, url?, foto_url? }
   */
  function renderItem(it) {
    const li = d.createElement('li');
    li.className = 'py-4';

    // 3 colunas: [thumb opcional] [texto] [direita]
    const linha = d.createElement('div');
    linha.className = 'grid grid-cols-[auto,1fr,auto] items-start gap-3';

    // --- Thumb opcional ---
    const temFoto = it.foto_url && it.foto_url.trim() !== '';
    if (temFoto) {
      const btn = d.createElement('button');
      btn.type = 'button';
      btn.className = 'js-open-modal relative w-16 h-12 rounded-md overflow-hidden border border-gray-200 bg-white shrink-0';
      btn.setAttribute('data-full', it.foto_url);

      const img = d.createElement('img');
      img.src = it.foto_url;
      img.alt = 'Foto enviada pelo cliente';
      img.loading = 'lazy';
      img.className = 'h-full w-full object-cover';

      btn.appendChild(img);
      linha.appendChild(btn);
    } else {
      const spacer = d.createElement('div');
      spacer.className = 'w-16 h-12';
      linha.appendChild(spacer);
    }

    // --- Corpo do texto ---
    const corpo = d.createElement('div');
    corpo.className = 'min-w-0';

    const meta = d.createElement('div');
    meta.className = 'flex items-center justify-between gap-2 text-sm';
    meta.innerHTML = `
      <span class="text-yellow-500">${'★'.repeat(+it.estrelas || 0)}</span>
      <time class="text-xs text-gray-500">${it.data || ''}</time>
    `;

    const txt = d.createElement('p');
    txt.className = 'mt-1 text-gray-900 leading-6';
    txt.textContent = it.texto || '';

    const autor = d.createElement('p');
    autor.className = 'mt-1 text-xs text-gray-500';
    autor.textContent = it.autor ? `— ${it.autor}` : '';

    corpo.appendChild(meta);
    corpo.appendChild(txt);
    corpo.appendChild(autor);
    linha.appendChild(corpo);

    // --- Coluna direita (reservado p/ futuro) ---
    const right = d.createElement('div');
    right.className = 'text-right text-xs text-gray-400';
    linha.appendChild(right);

    li.appendChild(linha);
    return li;
  }

  function renderEmpty(plat, msg = 'Ainda não há avaliações por aqui.') {
    const li = d.createElement('li');
    li.className = 'py-10 text-center';
    li.innerHTML = `<p class="text-sm text-gray-500">${msg}</p>`;

    if (plat !== 'scs' && LINK_PLATAFORMA[plat]) {
      const a = d.createElement('a');
      a.href = LINK_PLATAFORMA[plat];
      a.target = 'blank';
      a.rel = 'noopener';
      a.className = 'mt-3 inline-flex rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50';
      a.textContent = 'Ver na plataforma';
      const wrap = d.createElement('div');
      wrap.appendChild(a);
      li.appendChild(wrap);
    }
    return li;
  }

  // Cabeçalho/rodapé — funciona com ou sem total
  function atualizarCabecalho(mostrados, total, hasMore) {
    const totalOk = Number.isFinite(total) && total > 0;
    if (totalOk) {
      els.sub.textContent = `${mostrados} / ${total} avaliações`;
      els.info.textContent = hasMore
        ? `Mostrando ${mostrados} / ${total}`
        : `Exibindo todas (${total})`;
    } else {
      els.sub.textContent = `${mostrados} avaliações`;
      els.info.textContent = hasMore
        ? `Mostrando ${mostrados} (há mais…)`
        : `Exibindo ${mostrados}`;
    }
  }

  // Busca o total real uma única vez (fast:0) e atualiza o cabeçalho
  async function buscarTotalSePreciso() {
    if (_buscandoTotal) return;
    if (Number.isFinite(state.total) && state.total > 0) return;

    _buscandoTotal = true;
    try {
      const meta = await w.FeedbackAPI.listMeta(state.plat, 1, 1, { fast: 0 });
      if (Number.isFinite(meta.total) && meta.total >= 0) {
        state.total = meta.total;
        const mostrados = els.lista.childElementCount;
        atualizarCabecalho(mostrados, state.total, state.hasMore);
      }
    } catch (e) {
      console.warn('Não foi possível obter o total agora:', e);
    } finally {
      _buscandoTotal = false;
    }
  }

  // ==========================
  // 6) ABRIR / FECHAR MODAL
  // ==========================
  function open(plat) {
    state.plat = plat || 'scs';
    state.page = 1;
    state.hasMore = false;
    state.total = undefined;

    // Cabeçalho
    els.titulo.textContent = nomePlataforma(state.plat);
    els.sub.textContent = 'Carregando…';
    els.lista.innerHTML = '';
    els.info.textContent = '—';

    // Botão “Ver na plataforma”: escondido no SCS, visível nos marketplaces
    if (state.plat === 'scs') {
      els.btnPlat?.classList.add('hidden', 'opacity-0', 'pointer-events-none');
      els.btnPlat?.removeAttribute('href');
    } else {
      els.btnPlat?.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      if (els.btnPlat) els.btnPlat.href = LINK_PLATAFORMA[state.plat] || '#';
    }

    // Mostrar modal
    els.modal.classList.remove('hidden');
    els.modal.classList.add('flex');
    d.body.style.overflow = 'hidden';

    // Carregar a primeira página (rápida) e, em paralelo, buscar total real
    carregar(true).catch(() => {
      els.sub.textContent = 'Falha ao carregar. Tente novamente.';
      els.lista.appendChild(renderEmpty(state.plat));
    });
    buscarTotalSePreciso();
  }

  function close() {
    els.modal.classList.add('hidden');
    els.modal.classList.remove('flex');
    d.body.style.overflow = '';
    setTimeout(() => (els.lista.innerHTML = ''), 100);
  }

  // ==========================
  // 7) PAGINAÇÃO (CARREGAR MAIS)
  // ==========================
  async function carregar(primeira = false) {
    if (state.carregando) return;
    state.carregando = true;

    try {
      if (primeira) els.sub.textContent = 'Carregando…';

      // ⚡ Usa listMeta com fast=1 e limit=5
      const { items = [], hasMore = false, total } =
        await w.FeedbackAPI.listMeta(state.plat, state.page, state.limit, { fast: 1 });

      if (primeira && items.length === 0) {
        els.sub.textContent = 'Sem avaliações por aqui.';
        els.lista.appendChild(renderEmpty(state.plat));
        state.hasMore = false;
      } else {
        // desenha os itens
        items.forEach((it) => els.lista.appendChild(renderItem(it)));

        // atualiza total se backend enviou
        if (Number.isFinite(total) && total >= 0) state.total = total;

        // contadores + cabeçalho/rodapé
        const mostrados = els.lista.childElementCount;
        state.hasMore = !!hasMore;
        atualizarCabecalho(mostrados, state.total, state.hasMore);

        // estado do botão “Carregar mais”
        if (state.hasMore) {
          els.btnMore?.removeAttribute('disabled');
          els.btnMore?.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
          els.btnMore?.setAttribute('disabled', 'true');
          els.btnMore?.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // próxima página
        state.page += 1;
      }
    } catch (err) {
      console.error(err);
      if (primeira) {
        els.sub.textContent = 'Falha ao carregar. Tente novamente.';
        els.lista.appendChild(renderEmpty(state.plat));
      }
    } finally {
      state.carregando = false;
    }
  }

  // ==========================
  // 8) LISTENERS GLOBAIS
  // ==========================
  pronto(() => {
    // Abrir (links “Ver mais” nos cards do mural/hero)
    qsa('[data-action="ver-mais"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        open(a.getAttribute('data-plataforma') || 'scs');
      });
    });

    // Fechar
    els.btnClose?.addEventListener('click', close);
    els.modal?.addEventListener('click', (e) => {
      if (e.target === els.modal) close(); // backdrop
    });
    w.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    // Paginar
    els.btnMore?.addEventListener('click', () => carregar(false));
  });

  // ==========================
  // 9) EXPOSIÇÃO (API PÚBLICA)
  // ==========================
  w.FeedbackLista = { open, close };
})(window, document);
