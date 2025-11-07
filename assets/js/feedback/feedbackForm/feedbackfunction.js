// ===== UI do Form (preview tamanho card + abrir modal) =====
document.addEventListener("DOMContentLoaded", () => {
  const preview = document.getElementById("foto-preview");
  const overlay = document.getElementById("foto-preview-overlay");
  if (!preview) return;

  // Mantém o preview no tamanho de card SEM depender do Tailwind em runtime
  preview.classList.add(
    "w-full",
    "max-w-sm",
    "h-24",
    "overflow-hidden",
    "rounded-lg",
    "border",
    "border-gray-200",
    "bg-white",
    "shadow-sm"
  );

  // Sempre que uma <img> for inserida pelo seu UI.js, padroniza estilo
  const tune = () => {
    const img = preview.querySelector("img");
    if (!img) {
      preview.classList.remove("tem-imagem");
      if (overlay) overlay.classList.add("hidden");
      return;
    }
    img.classList.add("w-full", "h-full", "object-cover", "rounded-md"); // ou object-contain
    preview.classList.add("tem-imagem");
    if (overlay) overlay.classList.remove("hidden");
  };
  tune();
  new MutationObserver(tune).observe(preview, {
    childList: true,
    subtree: true,
  });

  // Abrir no modal (usa seu modal padrão se existir; senão, fallback simples)
  function abrirModalCom(src, alt = "Imagem do feedback") {
    if (window.FeedbackCardModal?.open) {
      // seu modal padrão
      window.FeedbackCardModal.open({ src, alt });
      return;
    }
    // fallback mínimo (dialog)
    let dlg = document.getElementById("feedback-preview-modal");
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.id = "feedback-preview-modal";
      dlg.className = "rounded-xl p-0";
      dlg.innerHTML = `
        <div class="relative">
          <button type="button" aria-label="Fechar"
            class="absolute right-2 top-2 z-10 rounded-full bg-black/60 text-white px-2 py-1 text-xs"
            data-close>Fechar</button>
          <img alt="" class="max-h-[85vh] w-auto object-contain block">
        </div>`;
      document.body.appendChild(dlg);
      dlg.addEventListener("click", (e) => {
        if (e.target === dlg || e.target.hasAttribute("data-close"))
          dlg.close();
      });
    }
    dlg.querySelector("img").src = src;
    dlg.querySelector("img").alt = alt;
    dlg.showModal();
  }

  // Clique/teclado no preview
  function handleOpen() {
    const img = preview.querySelector("img");
    if (!img || !img.src) return;
    abrirModalCom(img.src, img.alt || "Imagem do feedback");
  }
  preview.addEventListener("click", handleOpen);
  preview.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("comentario");
  const contador = document.getElementById("contador-comentario");

  if (textarea && contador) {
    const atualizarContador = () => {
      contador.textContent = textarea.value.length;
    };

    textarea.addEventListener("input", atualizarContador);
    atualizarContador(); // atualiza ao carregar
  }
});
