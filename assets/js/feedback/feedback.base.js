// /assets/js/feedback/feedback.base.js
let endpoint =
  window.FEEDBACK_ENDPOINT ||
  "https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec";

// ✅ sincroniza o global assim que o módulo carrega
window.FEEDBACK_ENDPOINT = endpoint;

export function definirEndpoint(url) {
  if (typeof url === "string" && /^https?:\/\//.test(url)) {
    endpoint = url;
    window.FEEDBACK_ENDPOINT = url;
  }
}

export function obterEndpoint() {
  return endpoint || window.FEEDBACK_ENDPOINT || "";
}
