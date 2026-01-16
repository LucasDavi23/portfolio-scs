// ==================================================
// 🧬 Vesper — Core de Rede (helpers) — Nível: Adulta
//
// Nível: Adulta
//
// File: vesper-form-api-core-helpers.js
//
// PT: Especialista na camada de rede do FORM: constrói BASE URL,
//     executa POST JSON com headers "text/plain" (evita preflight),
//     faz parse seguro e normaliza erros. Não conhece domínio do form.
// EN: Specialist in the FORM network layer: builds BASE URL,
//     performs JSON POST with "text/plain" headers (avoids preflight),
//     safely parses responses and normalizes errors. Knows no form domain.
// ==================================================

/**
 * PT: Resolve o endpoint do Apps Script.
 * EN: Resolves Apps Script endpoint.
 */
export function getFeedbackEndpoint() {
  return (
    window.FEEDBACK_ENDPOINT ||
    'https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec'
  );
}

/**
 * PT: Normaliza resposta do GAS em um formato estável.
 * EN: Normalizes GAS response into a stable shape.
 */
export function normalizeGasResponse(raw) {
  return {
    success: !!(raw?.success ?? raw?.ok ?? raw?.status === 'ok'),
    message: raw?.message || raw?.error || '',
    data: raw?.data || raw,
    item: raw?.item || null,
    raw,
  };
}

/**
 * PT: POST JSON para o Apps Script via text/plain (evita preflight).
 * EN: JSON POST to Apps Script via text/plain (avoids preflight).
 */
export async function postJsonAction(action, body) {
  const base = getFeedbackEndpoint();
  const url = `${base}?action=${encodeURIComponent(action)}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(body),
    mode: 'cors',
  });

  const text = await resp.text();

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${text || '(empty body)'}`);
  }

  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(`Invalid GAS JSON: ${text.slice(0, 300)}`);
  }

  return normalizeGasResponse(raw);
}

/**
 * PT: GET JSON simples (sem headers) para o GAS.
 * EN: Simple GET JSON (no headers) for GAS.
 */
export async function getJson(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export const VesperFormApiCoreHelpers = {
  getFeedbackEndpoint,
  normalizeGasResponse,
  postJsonAction,
  getJson,
};
