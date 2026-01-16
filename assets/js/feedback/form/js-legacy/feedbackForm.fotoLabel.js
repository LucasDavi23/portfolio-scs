// Atualiza o texto do label, gera a thumb e integra com o modal
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("foto");
  const label = document.getElementById("foto-label");
  const preview = document.getElementById("foto-preview");

  if (!input || !label || !preview) return;

  const setPreview = (file) => {
    preview.innerHTML = "";
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.alt = "Pré-visualização da imagem enviada";
    img.className = "max-w-full max-h-full object-cover rounded-md";
    preview.appendChild(img);

    // guarda o URL para o modal
    preview.dataset.full = url;
  };

  input.addEventListener("change", () => {
    const file = input.files?.[0] || null;
    label.textContent = file ? file.name : "Nenhum arquivo selecionado";
    setPreview(file);
  });

  // Clique na thumb -> abre modal existente
  preview.addEventListener("click", () => {
    const url = preview.dataset.full;
    if (!url) return;

    // Se você já tiver uma função global do seu modal, descomente:
    // window.abrirModalImagem?.(url, "Foto enviada");

    // Alternativa: dispare um evento que o seu modal escute
    window.dispatchEvent(
      new CustomEvent("modal:imagem", {
        detail: { src: preview.dataset.full, alt: "Foto enviada" },
      })
    );
  });
});
