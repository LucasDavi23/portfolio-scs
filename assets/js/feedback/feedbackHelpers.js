// feedbackHelpers.js — robusto p/ Drive (lh3) com fallback
// 👉 Troque pelo SEU URL de deploy do Apps Script (/exec)
//    Este endpoint é usado para montar as URLs do proxy de imagem

import { data } from 'autoprefixer';

//    e também para as rotas de dados (ex.: action=list).
export const GAS_BASE =
  'https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec';

/* ------------------------------------------------------------
 * parseDrive(raw, item?)
 * ------------------------------------------------------------
 * Extrai { id, rk } (resourceKey) a partir de:
 *  - ID puro ("1AbC...")
 *  - Links do tipo /file/d/<ID>
 *  - Links com ?id=<ID>
 *  - Links legados (/thumbnail, /uc) que já contêm id=image_id
 *
 * Retorna sempre um objeto { id: string, rk: string }.
 * Se não achar, retorna { id: '', rk: '' }.
 */
export function parseDrive(raw, item = {}) {
  const s = String(raw || '').trim();
  if (!s) return { id: '', rk: '' };

  // Caso 1: já é um ID "puro"
  if (/^[\w-]{10,}$/.test(s)) {
    const rkGuess = item.resourcekey || item.resourceKey || item.foto_resourcekey || '';
    return { id: s, rk: rkGuess || '' };
  }

  // Caso 2: /file/d/<ID>
  let m = s.match(/\/file\/d\/([-\w]{10,})/i);
  if (m) {
    const rk = (s.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: m[1], rk };
  }

  // Caso 3: ...?id=<ID>
  m = s.match(/[?&]id=([-\w]{10,})/i);
  if (m) {
    const rk = (s.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: m[1], rk };
  }

  // Caso 4: endpoints legados com id/image_id na query
  m = s.match(/[?&](?:id|image_id)=([-\w]{10,})/i);
  if (m) {
    const rk = (s.match(/[?&]resourcekey=([^&#]+)/i) || [, ''])[1];
    return { id: m[1], rk };
  }

  return { id: '', rk: '' };
}

// --- builders: preferir lh3 (binário); se não houver rk, cair para endpoints legados ---
// (comentário histórico seu mantido)

// --- parse existente (mantenha) ---
// export function parseDrive(...) { ... }

// --- builders: agora SEM Drive direto; só proxy ---
// Observação: Estas funções convertem uma entrada (id/link) em URL de imagem
// passando SEMPRE pelo seu proxy GAS (evitando ORB/CORS do Drive).
// O parâmetro rkIgnored fica aqui apenas por compat/assinatura.
export function DRIVE_FULL(idOrUrl, rkIgnored = '') {
  const id = extractDriveId(idOrUrl);
  if (!id) return '';
  return imgProxyUrl(id); // sempre via GAS
}

export function DRIVE_THUMB(idOrUrl, rkIgnored = '', w = 256) {
  const id = extractDriveId(idOrUrl);
  if (!id) return '';
  // Mesma URL do proxy (o back retorna a imagem original);
  // Se quiser gerar thumbs menores “de verdade”, teria que tratar no GAS.
  return imgProxyUrl(id);
}

// --- garantia & tentativa ---
// Validador simples de ID do Drive (mín. 10 chars alfanum/hífen/underscore)
export const isDriveId = (s) => /^[\w-]{10,}$/.test(String(s || '').trim());

/* ------------------------------------------------------------
 * ensureDriveUrl(raw, item, kind='thumb')
 * ------------------------------------------------------------
 * Garante a construção da URL do proxy a partir de qualquer texto/ID plausível.
 * - Extrai o ID
 * - Aplica um cache-buster leve (data/timestamp) para evitar cache teimoso
 * - Devolve a URL do proxy (mesma para full/thumb no seu modelo atual)
 */
export function ensureDriveUrl(raw, item, kind = 'thumb') {
  if (!raw) return '';
  const id = extractDriveId(raw);
  if (!id) return '';
  const bust = item?.data || item?.timestamp || ''; // cache-buster leve (opcional)
  return kind === 'full' ? imgProxyUrl(id, bust) : imgProxyUrl(id, bust);
}

/* ------------------------------------------------------------
 * tryBestDriveThumb(idOrUrl, rkIgnored, item)
 * ------------------------------------------------------------
 * Antes: tentava variações do Drive (lh3/uc). Agora:
 * - Sempre monta o proxy do GAS (evita ORB)
 * - Faz um preload “best effort” (não impacta o fluxo do card)
 */
export function tryBestDriveThumb(idOrUrl, rkIgnored = '', item = {}) {
  const thumb = ensureDriveUrl(idOrUrl, item, 'thumb');
  const full = ensureDriveUrl(idOrUrl, item, 'full');
  preloadImage(thumb).then((ok) => {
    if (!ok) preloadImage(full);
  });
  return thumb || full || '';
}

/* ------------------------------------------------------------
 * preloadImage(src)
 * ------------------------------------------------------------
 * Faz um pré-carregamento “fire-and-forget” de uma URL de imagem.
 * Nunca rejeita: resolve(true) se onload, resolve(false) se onerror.
 * Adiciona um cb (cache-buster) para evitar reuso de cache incorreto.
 */
export function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    const url = src + (src.includes('?') ? '&' : '?') + 'cb=' + (Date.now() % 1e7);
    img.src = url;
  });
}

/* ------------------------------------------------------------
 * sanitizeUrl(u)
 * ------------------------------------------------------------
 * Sanitização básica de URLs externas:
 * - Bloqueia "javascript:"
 * - Aceita apenas http/https (💡 dica: se você começar a usar dataURL,
 *   pode ampliar para aceitar /^data:/ também.)
 */
export function sanitizeUrl(u) {
  const s = typeof u === 'string' ? u.trim() : '';
  if (!s) return '';
  if (/^javascript:/i.test(s)) return '';
  if (!/^https?:\/\//i.test(s)) return '';
  try {
    const url = new URL(s);
    return url.toString();
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------
 * toPublicImageUrl(u)
 * ------------------------------------------------------------
 * Compatibilidade legada para “publicar” uma URL de imagem a partir
 * de um link/ID de Drive. Hoje redireciona para o proxy FULL (GAS).
 */
export function toPublicImageUrl(u) {
  const { id, rk } = parseDrive(u || '');
  if (!id) return String(u || '');
  return DRIVE_FULL(id, rk);
}

/* ------------------------------------------------------------
 * extractDriveId(anyUrlOrId)
 * ------------------------------------------------------------
 * Extrai um ID plausível de:
 *  - ID puro
 *  - Links /file/d/<ID>
 *  - Links com ?id=<ID>
 *  - Fallback por padrão de “padrão de ID” ([-\w]{20,})
 */
export function extractDriveId(anyUrlOrId) {
  if (!anyUrlOrId) return '';
  const s = String(anyUrlOrId).trim();

  // já é ID?
  if (/^[\w-]{20,}$/.test(s)) return s;

  // padrões comuns do Drive
  const m =
    s.match(/\/file\/d\/([-\w]{10,})/i) || s.match(/[?&]id=([-\w]{10,})/i) || s.match(/[-\w]{20,}/); // fallback
  return m ? m[1] : '';
}

/* ------------------------------------------------------------
 * imgProxyUrl(anyUrlOrId, cacheBust?)
 * ------------------------------------------------------------
 * Monta a URL do seu proxy de imagem no GAS a partir de um id/link do Drive.
 * Ex.: https://SEU_EXEC/exec?action=img&id=<ID>&v=<cacheBust>
 */
export function imgProxyUrl(anyUrlOrId, cacheBust = '') {
  const id = extractDriveId(anyUrlOrId);
  if (!id) return '';
  const v = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : '';
  return `${GAS_BASE}?action=img&id=${encodeURIComponent(id)}${v}`;
}

/* ============================================================
   [NOVO BLOCO] HELPERS DE IMAGEM (PROXY + DATAURL + RETRIES)
   ------------------------------------------------------------
   Objetivo:
   - Lidar com o carregamento das imagens do Drive via seu proxy do GAS.
   - O proxy responde uma dataURL (texto base64 da imagem).
   - Estes helpers cuidam de:
     → fazer o fetch da dataURL,
     → testar se é válida,
     → tentar recarregar algumas vezes,
     → aplicar fallback visual quando falha tudo.
   ============================================================ */

/* ------------------------------------------------------------
 * FALLBACK_IMG
 * ------------------------------------------------------------
 * Caminho local da imagem padrão que aparece quando
 * o carregamento da foto falha completamente.
 * Pode ser um arquivo PNG leve ou SVG.
 */

export const FALLBACK_IMG = '/assets/img/no-photo.png';

/* ------------------------------------------------------------
 * fetchDataURL(url)
 * ------------------------------------------------------------
 * 🇧🇷 Faz a requisição para a URL do proxy (GAS)
 * e devolve o TEXTO retornado (dataURL em Base64).
 * Adiciona um “cache-buster” (?cb=…) para evitar reuso de cache.
 *
 * 🇺🇸 Fetches the proxy (GAS) URL and returns the response text
 * as a Base64 dataURL. Adds a "cache-buster" (?cb=…) to bypass cache.
 */

export async function fetchDataURL(url) {
  // 🔹 1) Gerar um "cache breaker" (também chamado cache-buster)
  // Serve para forçar o navegador a buscar uma nova versão da imagem,
  // evitando que ele use uma cópia antiga do cache.
  // (if the URL already has ?, we use &, otherwise we use ?)
  const cacheBreaker = (url.includes('?') ? '&' : '?') + 'cb=' + (Date.now() % 1e7);

  // 🔹 2) Enviar a requisição HTTP para o proxy (GAS)
  // "await" significa: espera o servidor responder.
  // fetch() returns a "Response" object that contains the full HTTP response.
  const response = await fetch(url + cacheBreaker);

  // 🔹 3) Ler o corpo da resposta (response body)
  // Aqui pegamos o conteúdo da imagem como texto (string Base64).
  // r.text() → reads the entire response body as text
  const dataURLText = await response.text();

  // 🔹 4) Retornar o texto (imagem em formato DataURL)
  // This will look like: "data:image/png;base64,AAAA...."
  return dataURLText;
}

/* ------------------------------------------------------------
 * isLikely1x1(dataUrl)
 * ------------------------------------------------------------
 * 🇧🇷 Detecta quando a resposta do proxy provavelmente
 * é o PNG 1×1 transparente usado como “erro”.
 *
 * Se a string NÃO começar com "data:image/..." ou
 * for muito pequena (<200 caracteres),
 * consideramos inválida e tratamos como imagem vazia.
 *
 * 🇺🇸 Detects when the proxy response is probably
 * the transparent 1×1 PNG used as an “error image”.
 *
 * If the string does NOT start with "data:image/..."
 * or is too small (<200 characters),
 * we treat it as invalid (empty image).
 */

export function isLikely1x1(dataUrl) {
  // 🔹 Verifica se começa com "data:image/"
  // ^data:image/  → "^" significa "começa com"
  // o "i" no final (flag) significa "ignore case"
  // ou seja: aceita "data:image/" ou "DATA:IMAGE/"
  // test() → método que verifica se a expressão regular bate com a string
  if (!/^data:image\//i.test(dataUrl)) return true; // não é imagem válida

  // 🔹 Se for muito curta, provavelmente é o PNG 1x1 de erro
  // (um base64 curtinho, tipo 100 caracteres)
  return dataUrl.length < 200; // pequena demais → 1x1
}

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
    const dataUrl = await fetchDataURL(proxyUrl);

    // 🔹 2) Testar se o resultado é válido
    // Se for uma imagem 1x1 transparente (erro), dispara exceção.
    if (isLikely1x1(dataUrl)) throw new Error('imagem 1x1 inválida');

    // 🔹 3) Aplicar a imagem no <img>
    // src → a imagem Base64 que veio do proxy
    imgEl.src = dataUrl;

    // 🔹 4) Tornar o botão visível e habilitar o modal
    btnThumbEl.classList.remove('hidden');
    btnThumbEl.classList.remove('js-open-modal');
    imgEl.setAttribute('data-full', fullUrl);
    btnThumbEl.setAttribute('data-full', fullUrl);
  } catch (err) {
    // ⚠️ Se algo deu errado, aplica o fallback local
    console.warn('[applyImageWithFallback] erro ao carregar imagem:', err.message);

    // Mostra a imagem padrão "sem foto"
    imgEl.src = FALLBACK_IMG;
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
  imgEl.src = FALLBACK_IMG;
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
      if (!isLikely1x1(dataURLText)) {
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

// Helper novo pelo que parece ele esconde a foto
export function markHasPhoto(rootCard, hasPhoto) {
  // marca a foto onde tem a raiz "raiz, tem"
  if (!rootCard) return;
  rootCard.classList.toggle('has-photo', !!hasPhoto);
  rootCard.classList.toggle('no-phot', !hasPhoto);
}
