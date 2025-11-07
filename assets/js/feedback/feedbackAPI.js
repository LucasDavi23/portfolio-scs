import { toPublicImageUrl } from "./feedbackHelpers.js";

// /assets/js/feedback/feedbackAPI.js
(function (w) {
  "use strict";

  // Pode trocar via FeedbackAPI.setBase(...)
  let ENDPOINT =
    "https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec";

  const DEFAULT_TIMEOUT_MS = 12000;
  const DEFAULT_TTL_MS = 60_000; // cache local (front) — 60s

  // Cache simples em memória por URL (chave = string da URL)
  const _memCache = new Map(); // key -> { exp: number, data: any }

  function setBase(url) {
    if (typeof url === "string" && /^https?:\/\//.test(url)) ENDPOINT = url;
  }

  function withTimeout(promise, ms = DEFAULT_TIMEOUT_MS) {
    let t;
    return Promise.race([
      promise.finally(() => clearTimeout(t)),
      new Promise(
        (_, rej) =>
          (t = setTimeout(() => rej(new Error("Timeout ao chamar API")), ms))
      ),
    ]);
  }

  async function fetchJsonCached(url, { ttlMs = DEFAULT_TTL_MS } = {}) {
    const key = String(url);
    const now = Date.now();
    const hit = _memCache.get(key);
    if (hit && hit.exp > now) return hit.data;

    const res = await withTimeout(fetch(key, { method: "GET" }));
    if (!res.ok) throw new Error(`Falha ao buscar lista (${res.status})`);

    const data = await safeJson(res);
    // Só grava no cache se veio OK
    _memCache.set(key, { exp: now + ttlMs, data });
    return data;
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

  // helpers locais
  function _coerceUrl(raw) {
    if (typeof raw === "string") return raw.trim();
    if (raw && typeof raw === "object") {
      if (typeof raw.url === "string") return raw.url.trim();
      if (typeof raw.href === "string") return raw.href.trim();
      if (typeof raw.id === "string")
        return `https://drive.google.com/uc?export=view&id=${raw.id}`;
      return ""; // evita cair "[object Object]"
    }
    return "";
  }
  function _firstNonEmpty(...vals) {
    for (const v of vals) {
      const s = _coerceUrl(v);
      if (s) return s;
    }
    return "";
  }

  // ✅ cole esta versão
  function normalizeItem(x) {
    if (!x || typeof x !== "object") return null;

    // escolhe a melhor origem e normaliza p/ link público do Drive se necessário
    const raw = _firstNonEmpty(x.foto_url, x.image_url, x.url);
    const foto_public = toPublicImageUrl(raw); // sempre string ou ""

    return {
      estrelas: Number(x.estrelas ?? x.rating ?? 0) || 0,
      data: toISO(x.data ?? x.date ?? ""),
      autor: String(x.autor ?? x.author ?? "").trim(),
      texto: String(x.texto ?? x.comment ?? "").trim(),
      url: String(x.url ?? "").trim() || undefined,
      foto_url: foto_public || undefined, // 🔒 nunca objeto
      plataforma:
        String(x.plataforma ?? x.plat ?? "")
          .trim()
          .toLowerCase() || undefined,
    };
  }

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

  function clampInt(v, min, max, fallback) {
    const n = parseInt(v, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  // ======================================
  // 🧩 Lista básica (cards)
  // - foca na avaliação mais recente
  // - fast=1 por padrão
  // ======================================
  async function list(plat, page = 1, limit = 1, opts = { fast: 1 }) {
    if (!plat) throw new Error("plat é obrigatório (scs|shopee|ml|google)");
    const pg = clampInt(page, 1, 1_000_000, 1);
    const lim = clampInt(limit, 1, 50, 1);

    const url = new URL(ENDPOINT);
    url.searchParams.set("mode", "list");
    url.searchParams.set("plat", plat);
    url.searchParams.set("page", String(pg));
    url.searchParams.set("limit", String(lim));

    // fast=1 por padrão (pode ser sobrescrito em opts)
    if (opts && typeof opts === "object") {
      Object.entries(opts).forEach(([k, v]) =>
        url.searchParams.set(k, String(v))
      );
    } else {
      url.searchParams.set("fast", "1");
    }

    // GET simples para evitar preflight/CORS
    const data = await fetchJsonCached(url.toString());
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data.items)
      ? data.items
      : [];
    return arr.map(normalizeItem).filter(Boolean);
  }

  // ======================================
  // 📜 Lista paginada (modal)
  // - fast=1 por padrão
  // - limit=5 por padrão (abre com 5; “Carregar mais” busca +5)
  // ======================================
  async function listMeta(plat, page = 1, limit = 5, opts = { fast: 1 }) {
    if (!plat) throw new Error("plat é obrigatório (scs|shopee|ml|google)");
    const pg = clampInt(page, 1, 1_000_000, 1);
    const lim = clampInt(limit, 1, 50, 5);

    const url = new URL(ENDPOINT);
    url.searchParams.set("mode", "list");
    url.searchParams.set("plat", plat);
    url.searchParams.set("page", String(pg));
    url.searchParams.set("limit", String(lim));

    // fast=1 por padrão (pode ser sobrescrito em opts)
    if (opts && typeof opts === "object") {
      Object.entries(opts).forEach(([k, v]) =>
        url.searchParams.set(k, String(v))
      );
    } else {
      url.searchParams.set("fast", "1");
    }

    const data = await fetchJsonCached(url.toString());
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

  // Atalho: últimos N (mantido por compatibilidade)
  async function latest(plat, limit = 1) {
    const items = await list(plat, 1, limit, { fast: 1 });
    return items.slice(0, limit);
  }

  w.FeedbackAPI = { list, listMeta, latest, setBase };
})(window);
