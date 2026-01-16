// -------------------------------
// ARQUIVO: /assets/js/feedback/feedbackForm.ui.js
// Responsável por acessar elementos, coletar dados e lidar com a UI
// -------------------------------
export const FeedbackUI = (() => {
  const d = document;
  const el = {
    formulario: d.querySelector("#feedback-form"),
    nota: d.querySelector("#rating"),
    nome: d.querySelector("#nome"),
    comentario: d.querySelector("#comentario"),
    contato: d.querySelector("#contato"),
    honeypot: d.querySelector("#honeypot"),
    foto: d.querySelector("#foto"),
    botao: d.querySelector("#btn-submit"),
    status: d.querySelector("#form-status"),
    preview: d.querySelector("#foto-preview"),
  };

  function coletar() {
    return {
      nota: (el.nota?.value || "").trim(),
      nome: (el.nome?.value || "").trim(),
      comentario: (el.comentario?.value || "").trim(),
      contato: (el.contato?.value || "").trim(),
      honeypot: (el.honeypot?.value || "").trim(),
      arquivo: el.foto?.files?.[0] || null,
    };
  }

  function validarBasico(v) {
    if (v.honeypot) return "Falha na validação (possível bot).";
    if (!v.nota) return "Escolha uma nota (estrelas).";
    if (v.nome.length < 4)
      return "Informe um nome válido (mínimo 4 caracteres).";
    if (v.comentario.length < 20 || v.comentario.length > 600)
      return "O comentário deve ter entre 20 e 600 caracteres.";
    return "";
  }

  function exibirStatus(mensagem, tipo = "info") {
    if (!el.status) return;
    el.status.textContent = mensagem;
    el.status.dataset.tipo = tipo; // possibilita estilização por [data-tipo]
  }

  function travarEnvio(travar) {
    if (!el.botao) return;
    el.botao.disabled = !!travar;
    el.botao.setAttribute("aria-busy", travar ? "true" : "false");
    el.botao.textContent = travar ? "Enviando…" : "Enviar";
  }

  function resetar() {
    el.formulario?.reset();
    if (el.preview) el.preview.innerHTML = "";
  }

  function atualizarPreview(arquivo) {
    if (!el.preview) return;
    el.preview.innerHTML = "";
    if (!arquivo) return;
    const url = URL.createObjectURL(arquivo);
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Pré-visualização da imagem enviada";
    img.className = "";
    el.preview.appendChild(img);
  }

  // === helpers de erro de campo (sem mudar HTML) ao input nome ===
  function marcarErroCampo(inputEl, mensagem) {
    if (!inputEl) return;
    // estilo de erro
    inputEl.classList.add(
      "border-red-500",
      "ring-1",
      "ring-red-400",
      "focus:ring-red-400"
    );
    inputEl.setAttribute("aria-invalid", "true");

    // cria/atualiza hint
    let hint = inputEl.parentElement.querySelector(".hint-erro");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "hint-erro mt-1 text-xs text-red-600";
      inputEl.parentElement.appendChild(hint);
    }
    hint.textContent = mensagem;
  }

  function limparErroCampo(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove(
      "border-red-500",
      "ring-1",
      "ring-red-400",
      "focus:ring-red-400"
    );
    inputEl.removeAttribute("aria-invalid");
    const hint = inputEl.parentElement.querySelector(".hint-erro");
    if (hint) hint.remove();
  }

  return {
    el,
    coletar,
    validarBasico,
    exibirStatus,
    travarEnvio,
    resetar,
    atualizarPreview,
    marcarErroCampo,
    limparErroCampo,
  };
})();
