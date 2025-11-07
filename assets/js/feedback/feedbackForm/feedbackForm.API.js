// -------------------------------
// ARQUIVO: /assets/js/feedback/feedbackForm.api.js
// Responsável por comunicação com o Apps Script (POST/GET)
// -------------------------------
// /assets/js/feedback/feedbackForm.api.js
export const FeedbackAPI = (() => {
  const BASE = () =>
    window.FEEDBACK_ENDPOINT ||
    "https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec";

  async function requisicaoPOSTJSON(acao, corpo) {
    const url = `${BASE()}?action=${encodeURIComponent(acao)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" }, // evita preflight
      body: JSON.stringify(corpo),
      mode: "cors",
    });

    const text = await resp.text();
    if (!resp.ok)
      throw new Error(`Erro HTTP ${resp.status}: ${text || "(sem corpo)"}`);

    let raw;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new Error(`JSON inválido do GAS: ${text.slice(0, 300)}`);
    }

    return {
      success: !!(raw.success ?? raw.ok ?? raw.status === "ok"),
      message: raw.message || raw.error || "",
      data: raw.data || raw, // fallback amigável
      item: raw.item || null,
      raw,
    };
  }

  return {
    async enviarFotoBase64({ base64, mime, filename, original_name }) {
      return requisicaoPOSTJSON("uploadPhoto", {
        base64,
        mime,
        filename,
        original_name,
      });
    },
    async criarFeedback(payload) {
      return requisicaoPOSTJSON("createFeedback", payload);
    },
    async listar({ plataforma = "scs", limite = 5, pagina = 1 }) {
      const url = `${BASE()}?mode=list&plat=${plataforma}&limit=${limite}&page=${pagina}`;
      const resp = await fetch(url); // sem headers no GET
      if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`);
      return resp.json();
    },
  };
})();
