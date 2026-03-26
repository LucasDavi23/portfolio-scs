/* -----------------------------------------------------------------------------*/
// ✨ Mira — List Modal UI
//
// Nível / Level: Adulto / Adult
//
// PT: Controla a interface do modal de lista de avaliações.
//     Abre/fecha o modal, carrega páginas, renderiza itens e atualiza
//     cabeçalho, rodapé e paginação.
//
// EN: Controls the review list modal UI.
//     Opens/closes the modal, loads pages, renders items and updates
//     header, footer and pagination.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// 🧬 Naomi — Card API Helpers
// Fornece / Provides:
// - list()
// - listMeta()
/* -----------------------------------------------------------------------------*/
import { NaomiFeedbackCardAPI } from '/assets/js/feedback/board/api/card/naomi-card-api-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🎨 Petra — Image UI
// Fornece / Provides:
// - loadThumbWithRetries()
// - smartAutoRecover()
/* -----------------------------------------------------------------------------*/
import { PetraImageUI } from '/assets/js/feedback/board/image/petra-image-ui.js';

/* -----------------------------------------------------------------------------*/
// 🌿 Dália — Image Helpers
// Fornece / Provides:
// - FALLBACK_IMG
/* -----------------------------------------------------------------------------*/
import { DaliaImageHelpers } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

/* -----------------------------------------------------------------------------*/
// ✨ Dara — List Helpers
// Fornece / Provides:
// - getPlatformLabel()
// - getPlatformLink()
// - isTimeoutError()
// - isUsableUrl()
/* -----------------------------------------------------------------------------*/
import { DaraListHelpers } from '/assets/js/feedback/board/list/dara-list-helpers.js';

/* -----------------------------------------------------------------------------*/
// 🕰️ Juniper — Date/Time Utilities
// Fornece / Provides:
// - format()
/* -----------------------------------------------------------------------------*/
import { JuniperDateTime } from '/assets/js/system/utils/juniper-date-time.js';

/* -----------------------------------------------------------------------------*/
// 💡 Luma — Loading UI
// Fornece / Provides:
// - ensurePaint()
// - spinnerHTML()
// - setButtonLoading()
/* -----------------------------------------------------------------------------*/
import { LumaLoading } from '/assets/js/system/ui/loading/luma-loading.js';

/* -----------------------------------------------------------------------------*/
// ⭐ Zoe — Rating UI
// Fornece / Provides:
// - renderRating()
/* -----------------------------------------------------------------------------*/
import { ZoeRating } from '/assets/js/system/ui/rating/zoe-rating.js';

/* -----------------------------------------------------------------------------*/
// 🔒 Latch — Root Scroll Lock
// Fornece / Provides:
// - lockScroll()
// - unlockScroll()
/* -----------------------------------------------------------------------------*/
import { LatchRootScroll } from '/assets/js/system/utils/latch-root-scroll-lock.js';

/* -----------------------------------------------------------------------------*/
// 🕯️ Vela — Modal Motion
// Fornece / Provides:
// - openModalMotion()
// - closeModalMotion()
/* -----------------------------------------------------------------------------*/
import { VelaModalMotion } from '/assets/js/layout/modal/vela-modal-motion.js';

/* -----------------------------------------------------------------------------*/
// DOM Helpers
//
// PT: Atalhos simples para busca no DOM.
// EN: Simple shortcuts for DOM lookup.
/* -----------------------------------------------------------------------------*/
const qs = (selector, root = document) => root.querySelector(selector);

/* -----------------------------------------------------------------------------*/
// Limit Helpers
//
// PT: Retorna o limite padrão com base na largura da tela.
// EN: Returns the default limit based on screen width.
/* -----------------------------------------------------------------------------*/
function getDefaultLimit() {
  return window.matchMedia('(max-width: 639px)').matches ? 8 : 12;
}

/* -----------------------------------------------------------------------------*/
// Modal State
//
// PT: Estado interno do modal de lista.
// EN: Internal state for the list modal.
/* -----------------------------------------------------------------------------*/
const state = {
  plat: 'scs',
  page: 1,
  limit: 5,
  hasMore: false,
  loading: false,
  total: undefined,
};

let fetchingTotal = false;

/* -----------------------------------------------------------------------------*/
// DOM State
//
// PT: Referências de DOM vinculadas no init.
// EN: DOM references bound during init.
/* -----------------------------------------------------------------------------*/
let elements = null;

function bindElements(root = document) {
  elements = {
    modal: qs('#modalFeedback', root),
    panel: qs('#modalFeedbackPanel', root),
    titulo: qs('#modalFeedbackTitulo', root),
    sub: qs('#modalFeedbackSub', root),
    list: qs('#modalFeedbackList', root),
    info: qs('#modalFeedbackInfo', root),
    btnMore: qs('#modalFeedbackLoadMore', root),
    btnClose: qs('#modalFeedbackClose', root),
    btnPlat: qs('#modalFeedbackLink', root),
  };

  return elements;
}

/* -----------------------------------------------------------------------------*/
// Item Renderer
//
// PT: Monta um item de avaliação como <li>.
// EN: Builds a review item as <li>.
/* -----------------------------------------------------------------------------*/
function renderItem(item) {
  const listItemElement = document.createElement('li');
  listItemElement.className = 'py-4';

  const lineElement = document.createElement('div');
  lineElement.className = 'flex flex-col gap-2';

  /* ------------------------------------------------------------------------- */
  // Image Slot
  //
  // PT: Mira cria a estrutura; Petra cuida do carregamento e recuperação.
  // EN: Mira creates the structure; Petra handles loading and recovery.
  /* ------------------------------------------------------------------------- */

  const thumbButtonElement = document.createElement('button');
  thumbButtonElement.type = 'button';
  thumbButtonElement.className =
    'thumb-container relative w-[84px] aspect-[2/2] rounded-md overflow-hidden border border-gray-200 bg-gray-50 p-1 hidden';
  thumbButtonElement.setAttribute('data-owner', 'mira-list');

  const imageElement = document.createElement('img');
  imageElement.alt = 'Foto enviada pelo cliente';
  imageElement.className = 'h-full w-full object-contain';
  imageElement.loading = 'eager';
  imageElement.decoding = 'async';
  imageElement.referrerPolicy = 'no-referrer';

  thumbButtonElement.classList.add('hidden');
  thumbButtonElement.classList.remove('js-open-modal');
  imageElement.onload = null;
  imageElement.onerror = null;
  imageElement.removeAttribute('data-full');
  thumbButtonElement.removeAttribute('data-full');
  imageElement.removeAttribute('src');

  /* ------------------------------------------------------------------------- */
  // Text Content
  //
  // PT: Conteúdo textual principal da avaliação.
  // EN: Main textual content of the review.
  /* ------------------------------------------------------------------------- */

  const contentElement = document.createElement('div');
  contentElement.className = 'min-w-0';

  const metaElement = document.createElement('div');
  metaElement.className = 'inline-flex items-center gap-2 text-sm';

  const ratingElement = document.createElement('span');
  ratingElement.className = 'shrink-0';
  ratingElement.innerHTML = ZoeRating.renderRating(item.rating || 0, {
    size: 'sm',
    showValue: false,
  });

  const formattedDate = JuniperDateTime.format(
    item.date_ms ?? item.date_br ?? item.date_iso ?? item.dateIso ?? item.date
  );

  const timeElement = document.createElement('time');
  timeElement.className = 'text-xs text-gray-500 whitespace-nowrap';
  timeElement.textContent = formattedDate || '';

  metaElement.appendChild(ratingElement);
  metaElement.appendChild(timeElement);

  const textElement = document.createElement('p');
  textElement.className = 'mt-0 text-gray-900 leading-6';
  textElement.textContent = item.text || '';

  const authorElement = document.createElement('p');
  authorElement.className = 'mt-0 text-xs text-gray-500';
  authorElement.textContent = item.author ? `- ${item.author}` : '';

  contentElement.appendChild(metaElement);
  contentElement.appendChild(textElement);
  contentElement.appendChild(authorElement);
  lineElement.appendChild(contentElement);

  /* ------------------------------------------------------------------------- */
  // Media Wrapper
  //
  // PT: Linha dedicada à mídia, exibida apenas quando a thumb é válida.
  // EN: Media row shown only when the thumbnail is valid.
  /* ------------------------------------------------------------------------- */

  const dividerElement = document.createElement('div');
  dividerElement.className = 'mt-0 pt-2 hidden';

  const mediaRowElement = document.createElement('div');
  mediaRowElement.className = 'mt-0 hidden';

  thumbButtonElement.appendChild(imageElement);
  mediaRowElement.appendChild(thumbButtonElement);
  dividerElement.appendChild(mediaRowElement);
  lineElement.appendChild(dividerElement);

  /* ------------------------------------------------------------------------- */
  // Image Pipeline
  //
  // PT: Usa Dalia para normalizar a imagem e Petra para carregar/retry.
  // EN: Uses Dalia to normalize the image and Petra for load/retry.
  /* ------------------------------------------------------------------------- */
  {
    const { thumbUrl, fullUrl } = DaliaImageHelpers.pickImagePair(item);

    const thumbSourceUrl = (thumbUrl || fullUrl || '').trim();
    const rawFullUrl = (fullUrl || thumbUrl || '').trim();

    if (DaraListHelpers.isUsableUrl(thumbSourceUrl)) {
      PetraImageUI.loadThumbWithRetries(
        imageElement,
        thumbButtonElement,
        thumbSourceUrl,
        rawFullUrl,
        2
      )
        .then(() => {
          const isVisible = !thumbButtonElement.classList.contains('hidden');
          if (!isVisible) return;

          dividerElement.classList.remove('hidden');
          mediaRowElement.classList.remove('hidden');

          const modalSourceUrl = imageElement.src;
          if (modalSourceUrl) {
            imageElement.dataset.full = modalSourceUrl;
            thumbButtonElement.dataset.full = modalSourceUrl;
            thumbButtonElement.classList.add('js-open-modal');
            thumbButtonElement.setAttribute('role', 'button');
            thumbButtonElement.setAttribute('tabindex', '0');
          }

          PetraImageUI.smartAutoRecover(imageElement, thumbSourceUrl, 60000, 10000);
        })
        .catch(() => {
          thumbButtonElement.classList.add('hidden');
          dividerElement.classList.add('hidden');
          mediaRowElement.classList.add('hidden');

          imageElement.src = DaliaImageHelpers.FALLBACK_IMG;
          thumbButtonElement.classList.remove('js-open-modal');

          PetraImageUI.smartAutoRecover(imageElement, thumbSourceUrl, 60000, 10000);
        });
    }

    // PT: Quando não houver URL válida, a mídia permanece oculta.
    // EN: When no valid URL exists, media stays hidden.
  }

  listItemElement.appendChild(lineElement);
  return listItemElement;
}

/* -----------------------------------------------------------------------------*/
// Empty State Renderer
//
// PT: Renderiza o estado vazio do modal.
// EN: Renders the modal empty state.
/* -----------------------------------------------------------------------------*/
function renderEmpty(platform, message = 'Ainda não há avaliações.') {
  const listItemElement = document.createElement('li');
  listItemElement.className = 'py-10 text-center';
  listItemElement.innerHTML = `<p class="text-sm text-gray-500">${message}</p>`;

  const platformLink = DaraListHelpers.getPlatformLink(platform);

  if (platform !== 'scs' && platformLink) {
    const anchorElement = document.createElement('a');
    anchorElement.href = platformLink;
    anchorElement.target = '_blank';
    anchorElement.rel = 'noopener';
    anchorElement.className =
      'mt-3 inline-flex rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50';
    anchorElement.textContent = 'Ver na plataforma';

    const wrapperElement = document.createElement('div');
    wrapperElement.appendChild(anchorElement);
    listItemElement.appendChild(wrapperElement);
  }

  return listItemElement;
}

/* -----------------------------------------------------------------------------*/
// Header Updater
//
// PT: Atualiza cabeçalho e rodapé com base nos contadores.
// EN: Updates header and footer based on counters.
/* -----------------------------------------------------------------------------*/
function updateHeader(shown, total, hasMore) {
  const shownSafe = Number.isFinite(shown) && shown >= 0 ? shown : 0;
  const totalSafe = Number.isFinite(total) && total > 0 ? total : null;

  if (elements.sub) {
    elements.sub.textContent =
      totalSafe !== null ? `${shownSafe} / ${totalSafe} avaliações` : `${shownSafe} avaliações`;
  }

  if (elements.info) {
    elements.info.textContent =
      totalSafe !== null
        ? hasMore
          ? `Mostrando ${shownSafe} de ${totalSafe}`
          : `Exibindo todas (${totalSafe})`
        : hasMore
          ? `Mostrando ${shownSafe} (há mais…)`
          : `Exibindo ${shownSafe}`;
  }
}

/* -----------------------------------------------------------------------------*/
// Total Fetcher
//
// PT: Busca o total real em paralelo quando necessário.
// EN: Fetches the real total in parallel when needed.
/* -----------------------------------------------------------------------------*/
async function searchTotalIfNecessary() {
  if (fetchingTotal) return;
  if (Number.isFinite(state.total) && state.total > 0) return;

  fetchingTotal = true;

  try {
    const meta = await NaomiFeedbackCardAPI.listMeta(state.plat, 1, 1, {
      fast: 0,
      _bust: Date.now(),
    });

    if (Number.isFinite(meta.total) && meta.total >= 0) {
      if (state.total == null || meta.total > state.total) {
        state.total = meta.total;

        const shown = elements.list.querySelectorAll('li:not([data-luma-loading="1"])').length;
        if (shown > 0) {
          updateHeader(shown, state.total, state.hasMore);
        }
      }
    }
  } catch {
    // PT: Falha ao buscar total real não deve quebrar o modal.
    // EN: Failing to fetch the real total should not break the modal.
  } finally {
    fetchingTotal = false;
  }
}

/* -----------------------------------------------------------------------------*/
// Modal Open
//
// PT: Abre o modal e inicia a primeira carga.
// EN: Opens the modal and starts the first load.
/* -----------------------------------------------------------------------------*/
function open(platform) {
  if (!initialized) {
    ListModal(document);
  }

  state.plat = platform || 'scs';
  state.page = 1;
  state.hasMore = false;
  state.total = undefined;
  state.limit = getDefaultLimit();

  elements.titulo.textContent = DaraListHelpers.getPlatformLabel(state.plat);
  elements.sub.innerHTML = LumaLoading.spinnerHTML('Carregando avaliações...');
  elements.list.innerHTML = `<li data-luma-loading="1" class="py-12 flex justify-center">
    ${LumaLoading.spinnerHTML('Carregando...')}
  </li>`;
  elements.info.textContent = '—';

  const platformLink = DaraListHelpers.getPlatformLink(state.plat);

  if (state.plat === 'scs' || !platformLink) {
    elements.btnPlat?.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    elements.btnPlat?.removeAttribute('href');
  } else {
    elements.btnPlat?.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    if (elements.btnPlat) elements.btnPlat.href = platformLink;
  }

  elements.modal.classList.remove('hidden');
  elements.modal.classList.add('flex');

  LatchRootScroll.lockScroll();

  if (elements.modal && elements.panel) {
    VelaModalMotion.openModalMotion({
      rootEl: elements.modal,
      panelEl: elements.panel,
    });
  }

  if (elements.btnMore) {
    elements.btnMore.setAttribute('disabled', 'true');
    elements.btnMore.classList.add('opacity-50', 'cursor-not-allowed');
  }

  load(true).catch(async (error) => {
    if (DaraListHelpers.isTimeoutError(error)) {
      elements.sub.textContent = '⏳ Servidor lento, tentando novamente...';
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        await load(true);
        return;
      } catch (retryError) {
        elements.sub.textContent = '⚠️ Servidor ainda não respondeu. Tente novamente em instantes.';
      }
    } else {
      elements.sub.textContent = '⚠️ Falha ao carregar. Tente novamente.';
    }

    elements.list.appendChild(renderEmpty(state.plat));

    if (elements.btnMore) {
      elements.btnMore.removeAttribute('disabled');
      elements.btnMore.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });

  searchTotalIfNecessary();
}

let isClosing = false;

/* -----------------------------------------------------------------------------*/
// Modal Close
//
// PT: Fecha o modal com animação e libera o scroll.
// EN: Closes the modal with motion and unlocks scroll.
/* -----------------------------------------------------------------------------*/
async function close() {
  if (isClosing) return;
  isClosing = true;

  if (elements.modal && elements.panel) {
    await VelaModalMotion.closeModalMotion({
      rootEl: elements.modal,
      panelEl: elements.panel,
    });
  }

  if (elements?.modal) {
    elements.modal.classList.add('hidden');
    elements.modal.classList.remove('flex');
  }

  LatchRootScroll.unlockScroll();

  if (elements?.list) {
    elements.list.innerHTML = '';
  }

  isClosing = false;
}

/* -----------------------------------------------------------------------------*/
// Page Loader
//
// PT: Carrega a página atual da lista.
// EN: Loads the current list page.
/* -----------------------------------------------------------------------------*/
async function load(first = false) {
  if (state.loading) return;
  state.loading = true;

  if (!first && elements?.btnMore) {
    LumaLoading.setButtonLoading(elements.btnMore, true, 'Carregando...');
    await LumaLoading.ensurePaint();
  }

  try {
    if (first) {
      elements.sub.innerHTML = LumaLoading.spinnerHTML('Carregando avaliações...');
      await LumaLoading.ensurePaint();
    }

    const cacheBust = Date.now();

    const {
      items = [],
      hasMore = false,
      total,
    } = await NaomiFeedbackCardAPI.listMeta(state.plat, state.page, state.limit, {
      fast: 1,
      _bust: cacheBust,
    });

    const loadingItemElement = elements.list.querySelector('li[data-luma-loading="1"]');
    if (loadingItemElement) {
      loadingItemElement.remove();
    }

    if (first && items.length === 0) {
      elements.sub.textContent = 'Ainda não há avaliações.';
      elements.list.appendChild(renderEmpty(state.plat));
      state.hasMore = false;
    } else {
      const fragment = document.createDocumentFragment();
      items.forEach((item) => fragment.appendChild(renderItem(item)));
      elements.list.appendChild(fragment);

      if (Number.isFinite(total) && total >= 0) {
        if (state.total == null || total > state.total) {
          state.total = total;
        }
      }

      const shown = elements.list.querySelectorAll('li:not([data-luma-loading="1"])').length;
      state.hasMore = hasMore;

      const totalSafe = Number.isFinite(state.total) ? state.total : shown;
      updateHeader(shown, totalSafe, state.hasMore);

      if (state.hasMore) {
        elements.btnMore?.removeAttribute('disabled');
        elements.btnMore?.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        elements.btnMore?.setAttribute('disabled', 'true');
        elements.btnMore?.classList.add('opacity-50', 'cursor-not-allowed');
      }

      state.page += 1;

      // PT: Fallback extra para garantir o total caso o paralelo não resolva.
      // EN: Extra fallback to ensure total if parallel fetch does not resolve.
      if (first && (state.total == null || state.total === 0)) {
        NaomiFeedbackCardAPI.listMeta(state.plat, 1, 1, {
          fast: 0,
          _bust: Date.now(),
        })
          .then(({ total: realTotal }) => {
            if (
              Number.isFinite(realTotal) &&
              realTotal > 0 &&
              (state.total == null || realTotal > state.total)
            ) {
              state.total = realTotal;
              const shownNow = elements.list.childElementCount;
              updateHeader(shownNow, state.total, state.hasMore);
            }
          })
          .catch(() => {
            // PT: Falha ao buscar total em paralelo é ignorada.
            // EN: Parallel total fetch failure is ignored.
          });
      }
    }
  } catch (error) {
    if (DaraListHelpers.isTimeoutError(error)) {
      elements.sub.textContent = '⏳ Servidor lento. Tente novamente.';
    } else {
      elements.sub.textContent = '⚠️ Falha ao carregar. Clique em "Tentar novamente".';
    }

    const loadingItemElement = elements.list.querySelector('li[data-luma-loading="1"]');
    if (loadingItemElement) {
      loadingItemElement.remove();
    }

    if (first) {
      elements.list.appendChild(renderEmpty(state.plat));
    }

    if (elements.btnMore) {
      elements.btnMore.disabled = false;
      elements.btnMore.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  } finally {
    if (!first && elements?.btnMore) {
      LumaLoading.setButtonLoading(elements.btnMore, false);
    }

    state.loading = false;
  }
}

/* -----------------------------------------------------------------------------*/
// Init
//
// PT: Inicializa a Mira sem autoexec.
// EN: Initializes Mira without autoexec.
/* -----------------------------------------------------------------------------*/
let initialized = false;

function ListModal(root = document) {
  if (initialized) return;
  initialized = true;

  bindElements(root);

  if (!elements?.modal || !elements?.list) {
    initialized = false;
    return;
  }

  root.addEventListener('click', (event) => {
    const triggerElement = event.target?.closest?.('[data-action="ver-mais"]');
    if (!triggerElement) return;

    event.preventDefault();

    const platform =
      triggerElement.dataset.platform ||
      triggerElement.dataset.plat ||
      triggerElement.getAttribute('data-platform') ||
      triggerElement.getAttribute('data-plat') ||
      'scs';

    open(platform);
  });

  elements.btnClose?.addEventListener('click', (event) => {
    event.stopPropagation();
    close();
  });

  elements.modal?.addEventListener('click', (event) => {
    if (event.target === elements.modal) {
      close();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && elements?.modal && !elements.modal.classList.contains('hidden')) {
      close();
    }
  });

  elements.btnMore?.addEventListener('click', () => load(false));
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/
export const MiraListUI = {
  ListModal,
  open,
  close,
  state: state,
};
