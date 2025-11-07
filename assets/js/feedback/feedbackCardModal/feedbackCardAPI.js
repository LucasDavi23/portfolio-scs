import { toPublicImageUrl } from "../feedbackHelpers.js";

// /assets/js/feedback/feedbackCard/feedbackAPI.js
(function (w) {
  "use strict";

  // ========= Config =========
  // DEFAULT_RETRIES → controla quantas vezes o
  // sistema tenta novamente quando o Apps Script responde 503, 429 ou timeout.

  // DEFAULT_TIMEOUT_MS → controla quanto tempo cada tentativa
  // pode demorar antes de abortar.

  // DEFAULT_TTL_MS → define quanto tempo o cache local (memória) é
  // mantido antes de forçar nova leitura.

  let ENDPOINT = w.FEEDBACK_ENDPOINT || "";
  let DEFAULT_TIMEOUT_MS = 11000; // ⏱️ timeout por tentativa
  let DEFAULT_RETRIES = 3; // 🔁 tentativas extras
  let DEFAULT_TTL_MS = 60_000; // 🧠 cache local (60s)

  // ========= Controle de tráfego (anti-tempestade) =========
  const _inflight = new Map(); // url -> Promise em andamento
  let _lastCallTs = 0;
  const MIN_GAP_MS = 180; // espaçamento mínimo entre fetches

  function rateLimitedFetch(url, opts = {}) {
    const now = Date.now();
    const gap = now - _lastCallTs;
    if (gap < MIN_GAP_MS) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          _lastCallTs = Date.now();
          fetch(url, opts).then(resolve, reject);
        }, MIN_GAP_MS - gap);
      });
    }
    _lastCallTs = now;
    return fetch(url, opts);
  }

  // ========= Cache simples por URL =========
  const _memCache = new Map(); // key -> { exp: number, data: any }

  // ========= Helpers base/endpoint =========
  function setBase(url) {
    if (typeof url === "string" && /^https?:\/\//.test(url)) {
      ENDPOINT = url;
      w.FEEDBACK_ENDPOINT = url; // mantém sincronizado com global
    }
  }
  function getBase() {
    return ENDPOINT || w.FEEDBACK_ENDPOINT || "";
  }

  // ========= Helpers timeout/retry =========
  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function backoffDelay(attempt) {
    // 600ms, 1200ms, 2400ms (+ jitter 0–200ms)
    return 600 * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
  }

  // ========= Fetch com timeout, retry, cache e normalização =========
  async function fetchWithTimeout(url, { timeoutMs, signal } = {}) {
    const controller = new AbortController();
    const id = setTimeout(
      () => controller.abort(new Error("Timeout")),
      timeoutMs
    );

    try {
      const finalSignal = signal
        ? AbortSignal.any
          ? AbortSignal.any([signal, controller.signal])
          : controller.signal
        : controller.signal;

      const resp = await rateLimitedFetch(url, {
        method: "GET",
        signal: finalSignal,
      });
      return resp;
    } finally {
      clearTimeout(id);
    }
  }

  // fetchJsonWithRetry: faz fetch com timeout, retry e normalização
  async function fetchJsonWithRetry(
    url,
    { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, signal } = {}
  ) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("Sem conexão. Tente novamente.");
    }

    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const resp = await fetchWithTimeout(url, { timeoutMs, signal });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await safeJson(resp);
        return data;
      } catch (err) {
        lastErr = err;
        const msg = String(err?.message || err);
        const isTimeout = /abort|timeout|timed?out/i.test(msg);
        const isHTTP429 = /HTTP 429/.test(msg);
        const isHTTP503 = /HTTP 503/.test(msg);

        // última tentativa: normalize a mensagem
        if (attempt === retries) {
          if (isTimeout) throw new Error("Timeout ao chamar API");
          throw new Error(`Falha ao chamar API: ${msg}`);
        }

        // backoff com jitter (429 espera mais e NÃO faz cache-bust)
        const base = isHTTP429 ? 2000 : isHTTP503 ? 1200 : 600;
        const wait =
          base * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
        await delay(wait);

        if (!isHTTP429) {
          url = addBustParam(url); // evita reuso de resposta intermediária
        }
        continue;
      }
    }
  }

  function addBustParam(url) {
    try {
      const u = new URL(url, location.origin);
      u.searchParams.set("_bust", Date.now().toString());
      return u.toString();
    } catch {
      // se for uma string já completa, tenta fallback simples
      const sep = url.includes("?") ? "&" : "?";
      return `${url}${sep}_bust=${Date.now()}`;
    }
  }

  // ========= JSON & normalização =========
  async function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    const txt = await res.text();
    if (/application\/json/i.test(ct)) return JSON.parse(txt || "[]");
    try {
      return JSON.parse(txt || "[]");
    } catch {
      throw new Error("Resposta inválida da API");
    }
  }

  function toISO(d) {
    if (!d) return "";
    const m = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(m)) return m;
    const br = m.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (br) return `${br[3]}-${br[2]}-${br[1]}`;
    const date = new Date(m);
    return isNaN(date) ? m : date.toISOString().slice(0, 10);
  }

  function normalizeItem(x) {
    if (!x || typeof x !== "object") return null;

    // escolha segura do campo de foto (string)
    const pickStr = (v) => (typeof v === "string" ? v.trim() : "");
    const rawFoto =
      [
        x.foto_url,
        x.image_url,
        x.photo_public_url,
        x.photo_url,
        x.image,
        x.link,
        x.url,
      ]
        .map(pickStr)
        .find(Boolean) || "";

    return {
      estrelas: Number(x.estrelas ?? x.rating ?? 0) || 0,
      data: toISO(x.data ?? x.date ?? ""),
      autor: (x.autor ?? x.author ?? "").toString().trim(),
      texto: (x.texto ?? x.comment ?? "").toString().trim(),

      // mantém 'url' puro, se houver
      url: pickStr(x.url) || undefined,

      // foto_url agora recebe UMA string válida, nunca o objeto inteiro
      foto_url: toPublicImageUrl(rawFoto) || undefined,

      plataforma:
        (x.plataforma ?? x.plat ?? "").toString().trim().toLowerCase() ||
        undefined,
    };
  }

  function clampInt(v, min, max, fallback) {
    const n = parseInt(v, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  // ========= API pública =========
  async function fetchJsonCached(
    url,
    {
      ttlMs = DEFAULT_TTL_MS,
      timeoutMs = DEFAULT_TIMEOUT_MS,
      retries = DEFAULT_RETRIES,
    } = {}
  ) {
    const key = String(url);
    const now = Date.now();

    // 1) cache em memória
    const hit = _memCache.get(key);
    if (hit && hit.exp > now) return hit.data;

    // 2) coalesce: se já existe chamada em andamento para o mesmo URL, espere ela
    if (_inflight.has(key)) {
      return _inflight.get(key);
    }

    // 3) dispara a chamada real com retry
    const runner = (async () => {
      try {
        const data = await fetchJsonWithRetry(url, { timeoutMs, retries });
        _memCache.set(key, { exp: now + ttlMs, data });
        return data;
      } finally {
        _inflight.delete(key);
      }
    })();

    _inflight.set(key, runner);
    return runner;
  }

  async function list(plat, page = 1, limit = 1, opts = { fast: 1 }) {
    if (!plat) throw new Error("plat é obrigatório (scs|shopee|ml|google)");
    const pg = clampInt(page, 1, 1_000_000, 1);
    const lim = clampInt(limit, 1, 50, 1);

    const base = getBase();
    if (!base) throw new Error("FEEDBACK_ENDPOINT não definido.");
    const url = new URL(base);
    url.searchParams.set("mode", "list");
    url.searchParams.set("plat", plat);
    url.searchParams.set("page", String(pg));
    url.searchParams.set("limit", String(lim));

    if (opts && typeof opts === "object") {
      Object.entries(opts).forEach(([k, v]) =>
        url.searchParams.set(k, String(v))
      );
    } else {
      url.searchParams.set("fast", "1");
    }

    const data = await fetchJsonCached(url.toString(), opts);
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data.items)
      ? data.items
      : [];
    return arr.map(normalizeItem).filter(Boolean);
  }

  async function listMeta(plat, page = 1, limit = 5, opts = { fast: 1 }) {
    if (!plat) throw new Error("plat é obrigatório (scs|shopee|ml|google)");
    const pg = clampInt(page, 1, 1_000_000, 1);
    const lim = clampInt(limit, 1, 50, 5);

    const base = getBase();
    if (!base) throw new Error("FEEDBACK_ENDPOINT não definido.");
    const url = new URL(base);
    url.searchParams.set("mode", "list");
    url.searchParams.set("plat", plat);
    url.searchParams.set("page", String(pg));
    url.searchParams.set("limit", String(lim));

    if (opts && typeof opts === "object") {
      Object.entries(opts).forEach(([k, v]) =>
        url.searchParams.set(k, String(v))
      );
    } else {
      url.searchParams.set("fast", "1");
    }

    const data = await fetchJsonCached(url.toString(), opts);
    const itemsArr = Array.isArray(data)
      ? data
      : Array.isArray(data.items)
      ? data.items
      : [];
    const items = itemsArr.map(normalizeItem).filter(Boolean);
    const hasMore =
      typeof data?.hasMore === "boolean" ? data.hasMore : items.length === lim;
    const total = typeof data?.total === "number" ? data.total : undefined;
    return { items, hasMore, total };
  }

  async function latest(plat, limit = 1) {
    const items = await list(plat, 1, limit, { fast: 1 });
    return items.slice(0, limit);
  }

  // ajustes em tempo de execução (se quiser)
  function setTimeoutMs(ms) {
    if (ms > 0) DEFAULT_TIMEOUT_MS = ms;
  }
  function setRetries(n) {
    if (n >= 0) DEFAULT_RETRIES = n;
  }
  function setCacheTtl(ms) {
    if (ms >= 0) DEFAULT_TTL_MS = ms;
  }

  w.FeedbackAPI = {
    list,
    listMeta,
    latest,
    setBase,
    getBase,
    setTimeoutMs,
    setRetries,
    setCacheTtl,
  };
})(window);
