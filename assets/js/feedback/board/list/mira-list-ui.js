// ✨ Mira — Guardiã do Modal LISTA (UI - ESModule)
// Nível: Adulta
//------------------------------------------------------------
// PT: Controla tudo que é DOM/visual do modal LISTA (“Ver mais”):
//     - abrir/fechar o modal
//     - carregar páginas de avaliações (via FeedbackAPI)
//     - renderizar itens na <ul>
//     - atualizar cabeçalho/rodapé e botão "Carregar mais"
//     Usa Dara (helpers) para nome/link de plataforma e detecção de timeout.
//
// EN: Controls all DOM/visual logic for the LIST modal (“See more”):
//     - open/close the modal
//     - load paginated reviews (via FeedbackAPI)
//     - render items into the <ul>
//     - update header/footer and "Load more" button
//     Uses Dara for platform label/link and timeout detection.
//
// Relações / Relations:
//  - Selah (Mural/Hero): dispara o modal (data-action="ver-mais")
//  - Dara (Helpers): getPlatformLabel, getPlatformLink, isTimeoutError
//  - Talita / FeedbackAPI: global.FeedbackAPI.listMeta(...)
//  - Petra (imagem): no futuro pode assumir a lógica de thumb/full.
//  - Dalia (imagem): lógica pura de thumb/full (sem DOM).
// -----------------------------------------------------------------------------

// Importações / Imports

// -----------------------------------------------------------------------------

// Petra — Image UI Helpers
// PT: Lida com thumbs, fallback e observação de imagem
//  EN: Manages thumbs, fallback and DOM observers for images.
// Fornece / Provides:
//   - initThumbSystem()
//   - applyThumb()
//   - scanThumbs()
//   - observeThumbs()

import { PetraImageUI } from '/assets/js/feedback/board/image/petra-image-ui.js';

// -----------------------------------------------------------------------------

// Dalia — Image Helpers (Lógica pura, sem DOM)
// PT: Centraliza a lógica "pura" de imagem (sem DOM):
// EN: Centralizes the "pure" image logic (no DOM):
// Fornece / Provides:
// - FALLBACK_IMG

import { DaliaImageHelpers } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

// -----------------------------------------------------------------------------

// Dara — Assistente lógica da Mira (Helpers)
// PT: Centraliza a lógica "pura" do modal LISTA (sem DOM):
// EN: Centralizes the "pure" logic for the LIST modal (no DOM):
// Fornece / Provides:
// - getPlatformLabel()
// - getPlatformLink()
// - isTimeoutError()
// - isUsableUrl()

import { DaraListHelpers } from '/assets/js/feedback/board/list/dara-list-helpers.js';

// -----------------------------------------------------------------------------

// Elara — Assistente lógica do Mural (Helpers)
// PT: Centraliza a lógica "pura" do Mural (sem DOM):
// EN: Centralizes the "pure" logic for the Board (no DOM):
// Fornece / Provides:
// - pickImagePair()
// - isValidImageURL()

import { ElaraBoardHelpers } from '/assets/js/feedback/board/main/elara-board-helpers.js';

// -----------------------------------------------------------------------------

// Juniper — Utilitários de Data/Hora
// PT: Usado para formatar datas de avaliações.
// EN: Used to format review dates.
// Fornece / Provides:
// - formatDateTime()
// - parseDateTime()

import { JuniperDateTime } from '/assets/js/system/utils/juniper-date-time.js';

// -----------------------------------------------------------------------------

// Luma — UI de Loading Reutilizável
// PT: Usado para mostrar loading em botões, etc.
// EN: Used to show loading in buttons, etc.
// Fornece / Provides:
// - ensurePaint()
// - spinnerHTML()
// - renderLoading()
// - clearLoading()
// - setButtonLoading()

import { LumaLoading } from '/assets/js/system/ui/loading/luma-loading';

// -----------------------------------------------------------------------------

// Zoe — rating UI do system (avaliações por estrelas)
// EN Zoe — system rating UI (star-based ratings)
// Fornece:
//  - renderRating()
//  - normalizeRating()
//  - mountInput()

import { ZoeRating } from '/assets/js/system/ui/rating/zoe-rating.js';

// -----------------------------------------------------------------------------
// ✨ Latch — Body Scroll Lock (System Utils)
// Provides:
//  - lockBodyScroll()
//  - unlockBodyScroll()
//  - getScrollLockCount()

import { LatchRootScroll } from '/assets/js/system/utils/latch-root-scroll-lock.js';

// -----------------------------------------------------------------------------
// 🕯️ Vela — Modal Motion (System Utils)
// Provides:
// openModalMotion,
// closeModalMotion,
import { VelaModalMotion } from '/assets/js/layout/modal/vela-modal-motion.js';

// ==========================
// 1) HELPERS BÁSICOS DE DOM
// ==========================

/** PT: Atalho para querySelector. EN: Shorthand for querySelector. */
const qs = (selector, root = document) => root.querySelector(selector); // root opcional

/** PT: Atalho para querySelectorAll em array. EN: Shorthand to get an array. */
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector)); // root opcional

/** PT: Retorna o limite padrão baseado na largura da tela. EN: Returns default limit based on screen width. */
function getDefaultLimit() {
  return window.matchMedia('(max-width: 639px)').matches ? 8 : 12;
}

// ==========================
// 2) ESTADO DO MODAL
// ==========================

const state = {
  // estado inicial do modal
  plat: 'scs', // plataforma atual (scs, google, facebook, etc)
  page: 1, // pagina atual
  limit: 5, // fallback (open() define 8 mobile / 12 desktop)
  hasMore: false, // se há mais páginas
  loading: false, // se há requisição em andamento
  total: undefined, // total real (fast:0), opcional
};

// PT: flag para não buscar o total múltiplas vezes em paralelo.
// EN: flag to avoid fetching total multiple times in parallel.
let fetchingTotal = false; // false = não está buscando / not fetching

// ==========================
// 3) DOM STATE (Bound at init)
// ==========================

let els = null; // refs de DOM (inicializado no init)

function bindElements(root = document) {
  els = {
    // objeto para guardar refs de DOM / object to hold DOM refs
    modal: qs('#modalFeedback', root), // modal container
    panel: qs('#modalFeedbackPanel', root), // painel do modal
    modal: qs('#modalFeedback'), // modal container
    titulo: qs('#modalFeedbackTitulo'), // título do modal
    sub: qs('#modalFeedbackSub'), // subtítulo do modal
    list: qs('#modalFeedbackList'), // <ul> da list
    info: qs('#modalFeedbackInfo'), // info de total/erro
    btnMore: qs('#modalFeedbackLoadMore'), // botão "Carregar mais"
    btnClose: qs('#modalFeedbackClose'), // botão fechar
    btnPlat: qs('#modalFeedbackLink'), // "ver na plataforma"
  };
  return els;
}

// ==========================
// 4) RENDERIZAÇÕES
// ==========================

/**
 * PT: Monta 1 item de avaliação como <li>.
 * EN: Builds 1 review item (<li>).
 */

function renderItem(it) {
  // it = item de review
  const li = document.createElement('li');
  li.className = 'py-4';

  const line = document.createElement('div');
  line.className = 'flex flex-col gap-2';

  /* ==================================================
   * 🪨 PETRA SLOT — imagem (Mira cria, Petra manda)
   * ================================================== */

  const btnThumb = document.createElement('button');
  btnThumb.type = 'button';
  btnThumb.className =
    'thumb-container relative w-[84px] aspect-[2/2] rounded-md overflow-hidden border border-gray-200 bg-gray-50 p-1 hidden';

  btnThumb.setAttribute('data-owner', 'mira-list');

  const img = document.createElement('img');
  img.alt = 'Foto enviada pelo cliente';
  img.className = 'h-full w-full object-contain';
  img.loading = 'eager';
  img.decoding = 'async';
  img.referrerPolicy = 'no-referrer';

  // ✅ Reset total (igual Selah)
  btnThumb.classList.add('hidden');
  btnThumb.classList.remove('js-open-modal');
  img.onload = img.onerror = null;
  img.removeAttribute('data-full');
  btnThumb.removeAttribute('data-full');
  img.removeAttribute('src');

  btnThumb.appendChild(img);
  line.appendChild(btnThumb);

  // --------------------------------------------------
  // ✅ PIPELINE CORRETO (igual Selah):
  // use pickImagePair para normalizar/proxy
  // --------------------------------------------------
  {
    // Se Mira não importa ElaraBoardHelpers, pode chamar o helper equivalente que vocês já usam.
    // O importante é NÃO usar it.photo_url direto.
    const { thumbUrl, fullUrl } = ElaraBoardHelpers.pickImagePair(it);

    const sourceForThumb = (thumbUrl || fullUrl || '').trim(); // ✅ entra no "moedor"
    const rawBigUrl = (fullUrl || thumbUrl || '').trim(); // guardado (futuro HD)

    // DEBUG certeiro (depois remove)
    // console.log('[MIRA] sourceForThumb:', sourceForThumb, { thumbUrl, fullUrl, it });

    if (DaraListHelpers.isUsableUrl(sourceForThumb)) {
      PetraImageUI.loadThumbWithRetries(img, btnThumb, sourceForThumb, rawBigUrl, 2)
        .then(() => {
          const ok = !btnThumb.classList.contains('hidden');
          if (!ok) return;

          // ✅ mostra divisor + media quando thumb está ok
          divider.classList.remove('hidden');
          mediaRow.classList.remove('hidden');

          // ✅ SRC FINAL vira fonte do modal (igual Selah)
          const finalUrlForModal = img.src;
          if (finalUrlForModal) {
            img.dataset.full = finalUrlForModal;
            btnThumb.dataset.full = finalUrlForModal;
            btnThumb.classList.add('js-open-modal');
            btnThumb.setAttribute('role', 'button');
            btnThumb.setAttribute('tabindex', '0');
          }

          // ✅ auto-recover com a fonte do moedor (não a raw)
          PetraImageUI.smartAutoRecover(img, sourceForThumb, 60000, 10000);
        })
        .catch((err) => {
          console.warn('[MIRA thumb] falhou após retries', { err, sourceForThumb, it });

          // mantém oculto (sem imagem)
          btnThumb.classList.add('hidden');
          divider.classList.add('hidden');
          mediaRow.classList.add('hidden');

          img.src = DaliaImageHelpers.FALLBACK_IMG;
          btnThumb.classList.remove('js-open-modal');
          // opcional: tenta recuperar mesmo assim
          PetraImageUI.smartAutoRecover(img, sourceForThumb, 60000, 10000);
        });
    }
  }

  /* ==================================================
   * 📝 TEXTO — Mira continua dona
   * ================================================== */

  const body = document.createElement('div');
  body.className = 'min-w-0';

  const meta = document.createElement('div');
  meta.className = 'inline-flex items-center gap-2 text-sm';

  const rating = document.createElement('span');
  rating.className = 'shrink-0';
  rating.innerHTML = ZoeRating.renderRating(it.estrelas || 0, {
    size: 'sm', // lista/modal → discreto
    showValue: false, // só estrelas
  });

  const when = JuniperDateTime.format(it.data);
  const time = document.createElement('time');
  time.className = 'text-xs text-gray-500 whitespace-nowrap';
  time.textContent = when || '';
  meta.appendChild(rating);
  meta.appendChild(time);

  const txt = document.createElement('p');
  txt.className = 'mt-0 text-gray-900 leading-6';
  txt.textContent = it.texto || '';

  const autor = document.createElement('p');
  autor.className = 'mt-0 text-xs text-gray-500';
  autor.textContent = it.autor ? `- ${it.autor}` : '';

  body.appendChild(meta);
  body.appendChild(txt);
  body.appendChild(autor);
  line.appendChild(body);

  // Linha divisória
  const divider = document.createElement('div');
  divider.className = 'mt-0 pt-2 hidden';

  // Linha da imagem
  const mediaRow = document.createElement('div');
  mediaRow.className = 'mt-0 hidden';

  // adiciona a imagem à linha
  mediaRow.appendChild(btnThumb);
  divider.appendChild(mediaRow);
  line.appendChild(divider);

  // adiciona linha ao <li>
  li.appendChild(line);
  return li;
}

/**
 * PT: Renderiza estado "vazio" (sem avaliações).
 * EN: Renders "empty" state (no reviews).
 */
function renderEmpty(plat, msg = 'Ainda não há avaliações.') {
  const li = document.createElement('li'); // cria <li>
  li.className = 'py-10 text-center'; // classes
  li.innerHTML = `
 <p class="text-sm text-gray-500">${msg}</p> `; // conteúdo

  const link = DaraListHelpers.getPlatformLink(plat); // link da plataforma
  if (plat !== 'scs' && link) {
    const a = document.createElement('a'); // cria <a>
    a.href = link; // atribui href
    a.target = 'blank'; // nova aba
    a.rel = 'noopener';
    a.className = 'mt-3 inline-flex rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50'; // classes
    a.textContent = 'Ver na plataforma'; // texto

    const wrap = document.createElement('div'); // cria div wrap
    wrap.appendChild(a); // adiciona <a> ao wrap
    li.appendChild(wrap); // adiciona wrap ao <li>
  }
  return li; // retorna o <li> pronto
}

/**
 * PT: Atualiza cabeçalho e rodapé com base nos contadores.
 * EN: Updates header/footer based on current counters.
 */
function updateHeader(shown, total, hasMore) {
  const shownSafe = Number.isFinite(shown) && shown >= 0 ? shown : 0;
  const totalSafe = Number.isFinite(total) && total > 0 ? total : null;

  // 🔹 Subtítulo
  if (totalSafe !== null) {
    els.sub.textContent = `${shownSafe} / ${totalSafe} avaliações`;
  } else {
    els.sub.textContent = `${shownSafe} avaliações`;
  }

  // 🔹 Linha de info (rodapé)
  if (totalSafe !== null) {
    els.info.textContent = hasMore
      ? `Mostrando ${shownSafe} de ${totalSafe}`
      : `Exibindo todas (${totalSafe})`;
  } else {
    els.info.textContent = hasMore ? `Mostrando ${shownSafe} (há mais…)` : `Exibindo ${shownSafe}`;
  }
}

/**
 * PT: Busca o total real (fast:0) em paralelo, se ainda não soubermos.
 * EN: Fetches the real total (fast:0) in parallel, if not known yet.
 */

async function searchTotalIfNecessary() {
  // buscarTotalSePreciso
  if (fetchingTotal) return; // já está buscando / already fetching
  if (Number.isFinite(state.total) && state.total > 0) return; // já sabemos o total / already know total

  fetchingTotal = true; // marca que está buscando / mark as fetching
  try {
    const meta = await window.FeedbackAPI.listMeta(state.plat, 1, 1, {
      fast: 0, // fast:0 para total real
      _bust: Date.now(), // bust cache
    });

    if (Number.isFinite(meta.total) && meta.total >= 0) {
      if (state.total == null || meta.total > state.total) {
        state.total = meta.total; // atualiza total se maior / update total if bigger
        const shown = els.list.querySelectorAll('li:not([data-luma-loading="1"])').length; // itens mostrados / shown items
        if (shown > 0) {
          updateHeader(shown, state.total, state.hasMore); // atualiza header / update header
        }
      }
    }
  } catch (e) {
    // falha ao buscar total — ignora / failed to fetch total — ignore
    console.warn('Não foi possível buscar o total real de avaliações.', e);
  } finally {
    fetchingTotal = false; // marca que terminou de buscar / mark as not fetching
  }
}

// ==========================
// 5) ABRIR / FECHAR MODAL
// ==========================

export function open(plat) {
  // inicializa se ainda não foi (passa root para bindElements)
  if (!initialized) ListModal(document);

  // reset de estado // reset state

  state.plat = plat || 'scs'; // plataforma
  state.page = 1; // página 1
  state.hasMore = false; // sem mais páginas
  state.total = undefined; // total desconhecido
  state.limit = getDefaultLimit(); // itens por página baseado na tela

  // header + limpar UI
  els.titulo.textContent = DaraListHelpers.getPlatformLabel(state.plat);

  // Loading inicial
  els.sub.innerHTML = LumaLoading.spinnerHTML('Loading evaluations...');

  // ✅ Placeholder de loading na lista (marcado para remoção no 1º payload)
  els.list.innerHTML = `<li data-luma-loading="1" class="py-12 flex justify-center">
  ${LumaLoading.spinnerHTML('Loading...')} </li>`;

  els.info.textContent = '—';

  // botão "ver na plataforma"
  const link = DaraListHelpers.getPlatformLink(state.plat); // link da plataforma
  if (state.plat === 'scs' || !link) {
    els.btnPlat?.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    els.btnPlat?.removeAttribute('href');
  } else {
    els.btnPlat?.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    if (els.btnPlat) els.btnPlat.href = link;
  }

  // abrir Modal
  els.modal.classList.remove('hidden'); // mostra modal
  els.modal.classList.add('flex'); // mostra modal
  // 🔒 TRAVA SCROLL (Latch)
  LatchRootScroll.lockScroll();
  console.log('[Mira List] open()', { plat: state.plat });

  // 🎞️ Motion (Vela)
  if (els.modal && els.panel) {
    VelaModalMotion.openModalMotion({
      rootEl: els.modal,
      panelEl: els.panel,
    });
  }

  // desativar "Carregar mais" até terminar 1ª carga
  if (els.btnMore) {
    els.btnMore.setAttribute('disabled', 'true'); // desativa
    els.btnMore.classList.add('opacity-50', 'cursor-not-allowed'); // estilo desativado
  }

  // carregar 1ª página com tratamento de erro/retry
  load(true).catch(async (err) => {
    console.warn('Erro ao carregar inicial:', err);
    if (DaraListHelpers.isTimeoutError(err)) {
      els.sub.textContent = '⏳ Servidor lento, tentando novamente...';
      await new Promise((r) => setTimeout(r, 2000));
      try {
        await load(true);
        console.info('Retry Ok após timeOut inicial');
        return;
      } catch (e2) {
        console.warn('Retry falhou:', e2);
        els.sub.textContent = '⚠️ Servidor ainda não respondeu. Tente novamente em instantes.';
      }
    } else {
      els.sub.textContent = '⚠️ Falha ao carregar. Tente novamente.';
    }

    // fallback visual
    els.list.appendChild(renderEmpty(state.plat));

    // liberar botão para usuário tentar manualmente
    if (els.btnMore) {
      els.btnMore.removeAttribute('disabled');
      els.btnMore.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });

  // busca total real em paralelo
  searchTotalIfNecessary();
}

let isClosing = false; // flag para evitar múltiplos closes

export async function close() {
  if (isClosing) return; // já está fechando
  isClosing = true;

  // 🎞️ Motion (Vela) — fecha primeiro, esconde depois
  if (els.modal && els.panel) {
    await VelaModalMotion.closeModalMotion({
      rootEl: els.modal,
      panelEl: els.panel,
    });
  }

  if (els?.modal) {
    els.modal.classList.add('hidden');
    els.modal.classList.remove('flex');
  }

  // 🔓 LIBERA SCROLL (Latch)
  LatchRootScroll.unlockScroll();

  els.list.innerHTML = '';

  isClosing = false; // reset flag para permitir reabrir
}

// ==========================
// 6) PAGINAÇÃO (CARREGAR MAIS)
// ==========================

async function load(first = false) {
  if (state.loading) return;
  state.loading = true;

  // ✅ Luma no botão só no "Carregar mais"
  if (!first && els?.btnMore) {
    LumaLoading.setButtonLoading(els.btnMore, true, 'Loading more...');
    await LumaLoading.ensurePaint(); // garante que o loading aparece
  }

  try {
    if (first) {
      els.sub.innerHTML = LumaLoading.spinnerHTML('Loading evaluations...');
      await LumaLoading.ensurePaint(); // ✅ PT: garante que o loading aparece | EN: ensures loading appears
    }

    const bust = Date.now();

    const {
      items = [],
      hasMore = false,
      total,
    } = await window.FeedbackAPI.listMeta(state.plat, state.page, state.limit, {
      fast: 1,
      _bust: bust,
    });

    console.log('[MIRA LIST] payload listMeta:', { items, first: items?.[0] });

    // ✅ remove body placeholder loading (prevents "6 items" and stuck loading)
    const liLoading = els.list.querySelector('li[data-luma-loading="1"]');
    if (liLoading) liLoading.remove();

    if (first && items.length === 0) {
      els.sub.textContent = 'No reviews yet.'; // subtítulo
      els.list.appendChild(renderEmpty(state.plat)); // render vazio
      state.hasMore = false; // sem mais páginas
    } else {
      const frag = document.createDocumentFragment(); // fragmento p/ otimizar
      items.forEach((it) => frag.appendChild(renderItem(it))); // renderiza itens
      els.list.appendChild(frag); // adiciona fragmento à lista

      // ✅ update total only when API provides it (never sum)
      if (Number.isFinite(total) && total >= 0) {
        if (state.total == null || total > state.total) {
          state.total = total; // atualiza total se maior / update total if bigger
        }
      }

      const shown = els.list.querySelectorAll('li:not([data-luma-loading="1"])').length; // itens mostrados
      state.hasMore = hasMore; // atualiza hasMore
      // ✅ prevent undefined in header
      const totalSafe = Number.isFinite(state.total) ? state.total : shown;
      updateHeader(shown, totalSafe, state.hasMore); // atualiza header

      if (state.hasMore) {
        els.btnMore?.removeAttribute('disabled'); // ativa botão
        els.btnMore?.classList.remove('opacity-50', 'cursor-not-allowed'); // estilo ativo
      } else {
        els.btnMore?.setAttribute('disabled', 'true'); // desativa botão
        els.btnMore?.classList.add('opacity-50', 'cursor-not-allowed'); // estilo desativado
      }

      state.page += 1; // próxima página

      // keep your parallel full total fetch (fast:0) if needed
      if (first && (state.total == null || state.total === 0)) {
        window.FeedbackAPI.listMeta(state.plat, 1, 1, {
          fast: 0,
          _bust: Date.now(),
        })
          .then(({ total: t }) => {
            if (Number.isFinite(t) && t > 0 && (state.total == null || t > state.total)) {
              state.total = t;
              const shownNow = els.list.childElementCount;
              updateHeader(shownNow, state.total, state.hasMore);
            }
          })
          .catch(() => {
            /* falha ao buscar total — ignora */
          });
      }
    }
  } catch (err) {
    console.error(err); // log do erro

    if (DaraListHelpers.isTimeoutError(err)) {
      els.sub.textContent = '⏳ Servidor lento. Tente novamente.';
    } else {
      els.sub.textContent = '⚠️ Falha ao carregar. Clique em "Tentar novamente".';
    }

    // ✅ remove placeholder even on error, so it won't stay stuck
    const liLoading = els.list.querySelector('li[data-luma-loading="1"]');
    if (liLoading) liLoading.remove();

    if (first) {
      els.list.appendChild(renderEmpty(state.plat));
    }

    if (els.btnMore) {
      els.btnMore.disabled = false; // ativa botão
      els.btnMore.classList.remove('opacity-50', 'cursor-not-allowed'); // estilo ativo
    }
  } finally {
    // ✅ sempre desfaz o loading do botão no final (se não for 1ª carga)
    if (!first && els?.btnMore) {
      LumaLoading.setButtonLoading(els.btnMore, false);
    }
    state.loading = false;
  }
}

// ==========================
// 7) INIT (SEM AUTOEXEC)
// ==========================

let initialized = false; // flag para init único

function ListModal(root = document) {
  if (initialized) return; // já inicializado
  initialized = true;

  bindElements(root); // vincula refs de DOM

  // Delegação para abrir o modal via [data-action="ver-mais"]
  root.addEventListener('click', (e) => {
    const trigger = e.target?.closest?.('[data-action="ver-mais"]');

    if (!trigger) return; // não é o alvo
    e.preventDefault();

    const plat =
      trigger.dataset.platform ||
      trigger.dataset.plat ||
      trigger.getAttribute('data-platform') ||
      trigger.getAttribute('data-plat') ||
      'scs';

    open(plat);
  });

  els.btnClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  els.modal?.addEventListener('click', (e) => {
    if (e.target === els.modal) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modal.classList.contains('hidden')) {
      close();
    }
  });

  // Paginar
  els.btnMore?.addEventListener('click', () => load(false));
}

// ==========================
// 8) EXPORT PADRÃO (PERSONA)
// ==========================
export const MiraListUI = {
  ListModal,
  open,
  close,

  // opcional p/ debug
  _state: state,
};
