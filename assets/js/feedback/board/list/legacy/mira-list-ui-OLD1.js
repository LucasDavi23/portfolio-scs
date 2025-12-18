// ✨ Mira — Guardiã do Modal LISTA (UI - ESModule)
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
//------------------------------------------------------------

// Dara — Assistente lógica da Mira (Helpers)
// PT: Centraliza a lógica "pura" do modal LISTA (sem DOM):
// EN: Centralizes the "pure" logic for the LIST modal (no DOM):
// Fornece / Provides:
// - getPlatformLabel()
// - getPlatformLink()
// - isTimeoutError()
// - hasRealPhoto
import { DaraListHelpers } from './dara-list-helpers.js';

// Juniper — Utilitários de Data/Hora
// PT: Usado para formatar datas de avaliações.
// EN: Used to format review dates.
import { JuniperDateTime } from '/assets/js/system/utils/juniper-date-time.js';

// ==========================
// 1) HELPERS BÁSICOS DE DOM
// ==========================

/** PT: Atalho para querySelector. EN: Shorthand for querySelector. */
const qs = (selector, root = document) => root.querySelector(selector); // root opcional

/** PT: Atalho para querySelectorAll em array. EN: Shorthand to get an array. */
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector)); // root opcional

// ==========================
// 2) ESTADO DO MODAL
// ==========================

const state = {
  // estado inicial do modal
  plat: 'scs', // plataforma atual (scs, google, facebook, etc)
  page: 1, // pagina atual
  limit: 5, // itens por página
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
 *
 * it: { estrelas, data, autor, texto, url?, foto_url? }
 */

function renderItem(it) {
  // it = item de review
  const li = document.createElement('li'); // cria <li>
  li.className = 'py-4'; // classe base

  const line = document.createElement('div'); // cria div linha
  line.className = 'grid grid-cols-[auto,1fr,auto] items-start gap-3'; // classes

  // 🟣 DARA — Responsável por decidir se uma foto é válida.
  // Mira usa esta decisão para exibir ou esconder a thumbnail.
  const hasPhoto = DaraListHelpers.hasRealPhoto(it.foto_url); // se há foto
  // --- Coluna da foto ---
  if (hasPhoto) {
    const btn = document.createElement('button'); // botão p/ abrir imagem
    btn.type = 'button';
    btn.className =
      'js-open-modal relative w-16 h-12 rounded-md overflow-hidden border border-gray-200 bg-white shrink-0';
    btn.setAttribute('data-full', it.foto_url); // atributo p/ Petra

    const img = document.createElement('img'); // cria <img>

    img.src = 'it.foto_url'; // atribui src
    img.alt = 'Foto enviada pelo cliente'; // alt genérico
    img.loading = 'lazy'; // lazy load
    img.className = 'h-full w-full object-cover'; // classes

    btn.appendChild(img); // adiciona img ao botão
    line.appendChild(btn); // adiciona botão ao <li>
  } else {
    // PT: Espaçador pra manter o grid alinhado. EN: Spacer to keep layout aligned.
    const spacer = document.createElement('div'); // cria div espaçadora
    spacer.className = 'w-16 h-12'; // classes
    line.appendChild(spacer); // adiciona ao <li>
  }

  // --- Corpo do texto ---
  const body = document.createElement('div'); // cria div do corpo
  body.className = 'min-w-0'; // classes

  const meta = document.createElement('div'); // cria div meta
  meta.className = 'flex items-center justify-beetween gap-2 text-sm';

  // ⭐ stars
  const rating = document.createElement('span');
  rating.className = 'text-yellow-500 shrink-0';
  rating.textContent = '★'.repeat(+it.estrelas || 0);

  // 🕒 date / time (Juniper)
  const when = JuniperDateTime.format(it.data);
  const time = document.createElement('time');
  time.className = 'text-xs text-gray-500 whitespace-nowrap';
  time.textContent = when || '';
  meta.appendChild(rating); // ⭐
  meta.appendChild(time); // 🕒 (Juniper)

  const txt = document.createElement('p'); // cria parágrafo
  txt.className = 'mt-1 text-gray-900 leading-6'; // classes
  txt.textContent = it.texto || ''; // atribui texto

  const autor = document.createElement('p'); // cria parágrafo autor
  autor.className = 'mt-1 text-xs text-gray-500'; // classes
  autor.textContent = it.autor ? `-${it.autor}` : ''; // atribui autor

  body.appendChild(meta); // adiciona meta ao corpo
  body.appendChild(txt); // adiciona texto ao corpo
  body.appendChild(autor); // adiciona autor ao corpo
  line.appendChild(body); // adiciona corpo ao <li>

  // --- Coluna direita reservada para futuro ---
  const right = document.createElement('div'); // cria div direita
  right.className = 'text-right text-xs text-gray-400'; // classes
  line.appendChild(right); // adiciona ao <li>

  li.appendChild(line); // adiciona linha ao <li>
  return li; // retorna o <li> pronto
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
  const totalOk = Number.isFinite(total) && total > 0; // total válido

  if (totalOk) {
    els.sub.textContent = `${shown} / ${total} avaliações`; // subtítulo
    els.info.textContent = hasMore ? `Mostrando ${shown} / ${total}` : `Exibindo todas (${total})`; // info rodapé
  } else {
    els.sub.textContent = `${shown} avaliações`;
    els.info.textContent = hasMore ? `Mostrando ${shown} (há mais…)` : `Exibindo ${shown}`; // info rodapé
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
        const shown = els.list.chieldElementCount; // itens mostrados / shown items
        updateHeader(shown, state.total, state.hasMore); // atualiza header / update header
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
  // reset de estado // reset state

  state.plat = plat || 'scs'; // plataforma
  state.page = 1; // página 1
  state.hasMore = false; // sem mais páginas
  state.total = undefined; // total desconhecido

  // header + limpar UI
  els.titulo.textContent = DaraListHelpers.getPlatformLabel(state.plat);
  els.sub.textContent = 'Loading…';
  els.list.innerHTML = '';
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
  document.body.style.overflow = 'hidden'; // trava scroll body

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

export function close() {
  els.modal.classList.add('hidden');
  els.modal.classList.remove('flex');
  document.body.style.overflow = '';

  setTimeout(() => {
    els.list.innerHTML = '';
  }, 100);
}

// ==========================
// 6) PAGINAÇÃO (CARREGAR MAIS)
// ==========================

async function load(first = false) {
  if (state.load) return;
  state.load = true;

  try {
    if (first) els.sub.textContent = 'Loading...';

    const bust = Date.now();

    const {
      items = [],
      hasMore = false,
      total,
    } = await window.FeedbackAPI.listMeta(state.plat, state.page, state.limit, {
      fast: 1,
      _bust: bust,
    });

    if (first && items.length === 0) {
      els.sub.textContent = 'Sem avaliações por aqui.'; // subtítulo
      els.list.appendChild(renderEmpty(state.plat)); // render vazio
      state.hasMore = false; // sem mais páginas
    } else {
      const frag = document.createDocumentFragment(); // fragmento p/ otimizar
      items.forEach((it) => frag.appendChild(renderItem(it))); // renderiza itens
      els.list.appendChild(frag); // adiciona fragmento à lista

      if (Number.isFinite(total) && total >= 0) {
        if (state.total == null || total > state.total) {
          state.total = total; // atualiza total se maior / update total if bigger
        }
      }

      const shown = els.list.childElementCount; // itens mostrados
      state.hasMore = hasMore; // atualiza hasMore
      updateHeader(shown, state.total, state.hasMore); // atualiza header

      if (state.hasMore) {
        els.btnMore?.removeAttribute('disabled'); // ativa botão
        els.btnMore?.classList.remove('opacity-50', 'cursor-not-allowed'); // estilo ativo
      } else {
        els.btnMore?.setAttribute('disabled', 'true'); // desativa botão
        els.btnMore?.classList.add('opacity-50', 'cursor-not-allowed'); // estilo desativado
      }

      state.page += 1; // próxima página

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

    if (first) {
      els.list.appendChild(renderEmpty(state.plat));
    }

    if (els.btnMore) {
      els.btnMore.disable = false; // ativa botão
      els.btnMore.classList.remove('opacity-50', 'cursor-not-allowed'); // estilo ativo
    }
  } finally {
    state.load = false;
  }
}

// ==========================
// 7) INIT (SEM AUTOEXEC)
// ==========================

let initialized = false; // flag para init único

function ListModal(root = document) {
  if (initialized) return; // já inicializado
  initialized = true;

  bindElements(); // vincula refs de DOM

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

  els.btnClose?.addEventListener('click', close); // fechar botão

  els.modal?.addEventListener('click', (e) => {
    if (e.target === els.modal) close(); // backdrop
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
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
