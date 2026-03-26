// 🪨 Petra — Image DOM Controller
//
// Nível / Level: Adulto / Adult
//
// PT: Responsável pelo comportamento visual das imagens no Board.
//     Aplica thumb/full, fallback visual e auto-recover diretamente
//     no DOM. Utiliza a lógica pura fornecida pela Dália
//     (dalia-image-helpers.js).
//
// EN: Responsible for the visual behavior of images in the Board.
//     Applies thumb/full images, visual fallback and auto-recover
//     directly in the DOM. Uses the pure logic provided by Dália
//     (dalia-image-helpers.js).
// ------------------------------------------------------------------
//
// Imports / Dependências
//
// 🌿 Dália — lógica de imagem (helpers)
// EN 🌿 Dalia — image logic (helpers)
// Fornece:
// - fetchDataURL(proxyUrl)
// - FALLBACK_IMG
// - isLikely1x1(dataUrl)

import { DaliaImageHelpers } from '/assets/js/feedback/board/image/dalia-image-helpers.js';

/* ------------------------------------------------------------
 * applyImageWithFallback(imgEl, btnThumbEl, proxyUrl, fullUrl)
 * ------------------------------------------------------------
 * 🇧🇷 Aplica uma imagem (vinda do proxy) no elemento <img>.
 * Se o proxy falhar, mostra uma imagem alternativa (fallback).
 *
 * - Tenta carregar a imagem principal via fetchDataURL().
 * - Usa isLikely1x1() para detectar respostas inválidas (ex: PNG 1x1).
 * - Se tudo falhar, mostra FALLBACK_IMG (/assets/img/no-photo.png).
 *
 * 🇺🇸 Applies an image (from proxy) to an <img> element.
 * If the proxy fails, shows a fallback placeholder image.
 *
 * - Tries to load the main image using fetchDataURL().
 * - Uses isLikely1x1() to detect invalid responses (e.g., transparent 1x1).
 * - Falls back to FALLBACK_IMG (/assets/img/no-photo.png) if all fails.
 */

export async function applyImageWithFallback(imgEl, btnThumbEl, proxyUrl, fullUrl) {
  try {
    // 🔹 1) Buscar a imagem no proxy via fetchDataURL()
    // Retorna um texto Base64 tipo "data:image/png;base64,AAAA..."
    const dataUrl = await DaliaImageHelpers.fetchDataURL(proxyUrl);

    // 🔹 2) Testar se o resultado é válido
    // Se for uma imagem 1x1 transparente (erro), dispara exceção.
    if (DaliaImageHelpers.isLikely1x1(dataUrl)) throw new Error('imagem 1x1 inválida');

    // 🔹 3) Aplicar a imagem no <img>
    // src → a imagem Base64 que veio do proxy
    imgEl.src = dataUrl;

    // 🔹 4) Tornar o botão visível e habilitar o modal
    btnThumbEl.classList.remove('hidden');
    btnThumbEl.classList.add('js-open-modal');
    imgEl.setAttribute('data-full', fullUrl);
    btnThumbEl.setAttribute('data-full', fullUrl);
  } catch (err) {
    // ⚠️ Se algo deu errado, aplica o fallback local
    console.warn('[applyImageWithFallback] erro ao carregar imagem:', err.message);

    // Mostra a imagem padrão "sem foto"
    imgEl.src = DaliaImageHelpers.FALLBACK_IMG;
    btnThumbEl.classList.remove('js-open-modal');
  }
}

/* ------------------------------------------------------------
 * loadThumbWithRetries(imgEl, btnThumbEl, proxyUrl, fullUrl, maxAttempts = 2)
 * ------------------------------------------------------------
 * 🇧🇷 Tenta carregar a miniatura (thumb) várias vezes
 * usando o proxy do Google Apps Script (GAS).
 *
 * - Faz até "maxAttempts" tentativas.
 * - Entre cada tentativa, espera 500 ms (meio segundo).
 * - Se tudo falhar, mostra a imagem de fallback.
 *
 * 🇺🇸 Tries to load the thumbnail multiple times
 * using the Google Apps Script (GAS) proxy.
 *
 * - Makes up to "maxAttempts" attempts.
 * - Waits 500 ms between each try.
 * - Falls back to a local placeholder image if all fail.
 */

export async function loadThumbWithRetries(imgEl, btnThumbEl, proxyUrl, fullUrl, maxAttempts = 2) {
  // 🔹 1) "let" cria uma variável que PODE mudar de valor depois.
  // Aqui ela começa em 0, representando a primeira tentativa.
  // (se fosse const, o valor não poderia ser alterado)
  let attempt = 0;

  // 🔹 2) Função auxiliar "delay"
  // Retorna uma Promise que só é resolvida depois de X milissegundos.
  // É usada para dar uma pausa (ex: 500 ms) entre as tentativas.
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 🔹 3) "while" = laço de repetição
  // Executa o bloco abaixo ENQUANTO a condição for verdadeira.
  // Aqui, repete enquanto o número de tentativas for menor que o máximo permitido.
  while (attempt < maxAttempts) {
    try {
      // 🔹 4) attempt++ → soma +1 à variável "attempt"
      // É igual a escrever "attempt = attempt + 1"
      attempt++;

      console.log(`[loadThumbWithRetries] tentativa ${attempt} de ${maxAttempts}`);

      // 🔹 5) Tenta carregar a imagem
      await applyImageWithFallback(imgEl, btnThumbEl, proxyUrl, fullUrl);

      // ✅ Se deu certo, encerra o loop usando "return"
      console.log('[loadThumbWithRetries] imagem carregada com sucesso');
      return;
    } catch (err) {
      // ⚠️ 6) Se falhar, o código vem parar aqui (no catch)
      console.warn(`[loadThumbWithRetries] falha na tentativa ${attempt}:`, err);

      // 🔹 7) Se ainda há tentativas restantes, espera meio segundo antes de tentar de novo
      if (attempt < maxAttempts) {
        await delay(500); // pausa de 500 milissegundos
      }
    }
  }

  // 🚫 8) Se todas as tentativas falharem, mostra o fallback
  console.error('[loadThumbWithRetries] todas as tentativas falharam, usando fallback');
  imgEl.src = DaliaImageHelpers.FALLBACK_IMG;
  btnThumbEl.classList.remove('js-open-modal');
}

/* ------------------------------------------------------------
 * smartAutoRecover(imgEl, proxyUrl, totalMs = 60000, everyMs = 10000)
 * ------------------------------------------------------------
 * 🇧🇷 Faz tentativas automáticas de recarregar a imagem em segundo plano,
 * caso o proxy falhe (ex: imagem 1x1 ou temporariamente fora do ar).
 *
 * 🇺🇸 Automatically retries to reload the image in background
 * if the proxy temporarily fails (like a 1x1 fallback image).
 */

export function smartAutoRecover(imgEl, proxyUrl, totalMs = 60000, everyMs = 10000) {
  // const usado aqui pois o tempo inicial nunca muda —
  // ele serve apenas como referência para sabermos quando parar as tentativas.
  const startTime = Date.now();

  // const aqui define uma função interna fixa (não será reatribuída),
  // responsável por tentar recarregar a imagem e se falhar, agendar outra tentativa.
  const tryReload = async () => {
    try {
      // verifica quanto tempo passou desde o início;
      // se já excedeu o tempo limite totalMs (ex: 60 segundos), para completamente.
      if (Date.now() - startTime > totalMs) return;

      // let usado aqui porque o cacheBreaker muda a cada tentativa —
      // ele gera uma nova URL com timestamp diferente para evitar o cache.
      let cacheBreaker = (proxyUrl.includes('?') ? '&' : '?') + 'cb=' + (Date.now() % 1e7);

      // faz a requisição novamente para o proxy, usando o cacheBreaker
      const response = await fetch(proxyUrl + cacheBreaker);

      // lê o corpo da resposta (texto Base64)
      const dataURLText = await response.text();

      // verifica se a resposta é válida (não é o PNG 1x1);
      if (!DaliaImageHelpers.isLikely1x1(dataURLText)) {
        // se for válida, substitui a imagem atual e dispara o evento de carregamento
        imgEl.src = dataURLText;
        imgEl.dispatchEvent(new Event('load'));
        console.log('[smartAutoRecover] imagem recuperada com sucesso!');
        return; // encerra o procosso — imagem já foi carregada
      }
    } catch (err) {
      // se o fetch falhar (problema de rede, proxy, etc.), apenas loga o erro e continua tentando
      console.warn('[smartAutoRecover] tentativa falhou, nova tentativa em breve...', err);
    }

    // agenda a próxima tentativa após "everyMs" milissegundos (ex: 10 segundos)
    setTimeout(tryReload, everyMs);
  };

  // inicia a primeira tentativa com um pequeno atraso
  setTimeout(tryReload, everyMs);
}

/* ------------------------------------------------------------
 * markHasPhoto(rootCard, hasPhoto)
 * ------------------------------------------------------------ */
export function markHasPhoto(rootCard, hasPhoto) {
  // marca a foto onde tem a raiz "raiz, tem"
  if (!rootCard) return;
  rootCard.classList.toggle('has-photo', !!hasPhoto);
  rootCard.classList.toggle('no-photo', !hasPhoto);
}

// Mira Modal List UI — lógica de thumbs do Board
/**
 * PT: Verifica se um elemento está dentro do modal de feedback (lista).
 * EN: Checks if an element is inside the feedback modal (list).
 */
function isInFeedbackModal(el) {
  return !!el?.closest?.('#modalFeedback');
}

/**
 * PT: Normaliza opções de hidratação.
 * EN: Normalizes hydration options.
 */
function normalizeOpts(opts) {
  return {
    allowModal: !!opts?.allowModal, // padrão: false (se não fornecido)
  };
}

/* ------------------------------------------------------------*/

/**
 * PT: Valida um src básico de imagem.
 * EN: Validates a basic image src.
 */
function isValidSrc(value) {
  if (!value) return false; // nulo/indefinido
  const cleaned = String(value).trim();
  if (!cleaned || cleaned === '#' || cleaned === 'about:blank') return false; // vazio ou inválido
  return true;
}

/**
 * PT: Aplica a lógica de visibilidade e data-full em um thumb-container.
 * EN: Applies visibility and data-full logic to a single thumb-container.
 */

function applyThumb(container, opts) {
  const o = normalizeOpts(opts);
  // console.log('[PETRA] applyThumb', container.getAttribute('data-owner'), container);

  if (!container) return;
  if (!o.allowModal && isInFeedbackModal(container)) return;

  // ✅ pega a raiz do card 1 vez (mais limpo / consistent)
  const card = container.closest('[data-feedback-card]');

  const img = container.querySelector('img');
  if (!img) {
    container.classList.add('hidden');
    container.classList.remove('js-open-modal');
    // ✅ marca estado no card
    markHasPhoto(card, false);
    return;
  }

  const thumbSrc = img.getAttribute('src');
  let fullSrc = img.getAttribute('data-full') || container.getAttribute('data-full');

  // Se o thumb é válido mas o full ainda não, usa o thumb como full
  if (isValidSrc(thumbSrc) && !isValidSrc(fullSrc)) {
    fullSrc = thumbSrc;
    img.setAttribute('data-full', fullSrc);
    container.setAttribute('data-full', fullSrc);
  }

  const hasPhoto = isValidSrc(thumbSrc);

  if (hasPhoto) {
    container.classList.remove('hidden');
    container.classList.add('js-open-modal');
  } else {
    container.classList.add('hidden');
    container.classList.remove('js-open-modal');
  }

  // ✅ marca estado no card
  markHasPhoto(card, hasPhoto);
}

/**
 * PT: Escaneia um root em busca de ".thumb-container".
 * EN: Scans a root for ".thumb-container".
 */
function scanThumbs(root = document, opts) {
  const o = normalizeOpts(opts);
  root.querySelectorAll('.thumb-container').forEach((el) => applyThumb(el, o));
}

/**
 * PT: Observa o DOM e hidrata thumbs criados dinamicamente.
 * EN: Observes the DOM and hydrates dynamically added thumbs.
 */
function observeThumbs(root = document, opts) {
  const o = normalizeOpts(opts);

  const obs = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        // O nó é um thumb-container sozinho
        if (node.matches?.('.thumb-container')) {
          applyThumb(node);
        }

        // O nó tem filhos com thumb-containers
        node.querySelectorAll?.('.thumb-container').forEach((el) => applyThumb(el, o)); // aplica em cada um

        // Observa mudanças em <img> dentro do thumb
        node.querySelectorAll?.('.thumb-container img').forEach((img) => {
          const container = img.closest('.thumb-container');
          if (!container) return;

          new MutationObserver(() => applyThumb(container)).observe(img, {
            attributes: true,
            attributeFilter: ['src', 'data-full'],
          });
        });
      });
    }
  });
  // ✅ importante: observar o root em si (modal ou document)
  obs.observe(root.body || root, { childList: true, subtree: true });
  return obs;
}

/**
 * PT: Export final da Petra com tudo junto.
 * EN: Final export for Petra including DOM thumb logic.
 */

export const PetraImageUI = {
  // Lado de imagem com Dália (já existente)
  applyImageWithFallback,
  loadThumbWithRetries,
  smartAutoRecover,
  markHasPhoto,

  // Novo — controle dos thumbs do Board
  applyThumb,
  scanThumbs,
  observeThumbs,

  /**
   * PT: Inicializa o sistema de thumbs da Petra.
   * EN: Initializes Petra's thumb system.
   */
  initThumbSystem(root = document) {
    this.scanThumbs(root);
    this.observeThumbs(root);
  },
};
