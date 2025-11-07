// ------------------------------
// feedbackForm.estrelas.js
// Controle visual + toggle das estrelas (permite limpar)
// ------------------------------
(function () {
  const grupo = document.getElementById("rating-group");
  if (!grupo) return;

  const radios = Array.from(
    document.querySelectorAll('input[name="rating_star"]')
  );
  const labels = Array.from(grupo.querySelectorAll("label.star, label")); // aceita .star ou label normal
  const oculto = document.getElementById("rating");
  const badge = document.getElementById("rating-badge");

  function pintar(qtd) {
    labels.forEach((lb, i) => {
      lb.classList.toggle("star--ativa", i < qtd);
    });
  }

  function valorAtual() {
    return parseInt(oculto?.value || "0", 10) || 0;
  }

  function setBadge(qtd) {
    if (!badge) return;
    if (qtd > 0) {
      badge.textContent = `${qtd}/5`;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  function definir(qtd) {
    // marca o rádio correspondente
    const r = radios.find((x) => parseInt(x.value, 10) === qtd);
    if (r) r.checked = true;
    if (oculto) oculto.value = String(qtd);
    pintar(qtd);
    setBadge(qtd);
  }

  function limpar() {
    radios.forEach((r) => (r.checked = false));
    if (oculto) oculto.value = "";
    pintar(0);
    setBadge(0);
  }

  // Clique na label: toggle (permite limpar clicando na mesma estrela)
  labels.forEach((lb) => {
    lb.addEventListener("click", (e) => {
      e.preventDefault(); // evita o comportamento padrão da label
      const forId = lb.getAttribute("for");
      const radio = forId ? document.getElementById(forId) : null;
      const clicked = radio ? parseInt(radio.value, 10) : 0;
      const atual = valorAtual();

      if (clicked === atual) {
        limpar(); // clicou na mesma → limpa
      } else {
        definir(clicked);
      }
    });
  });

  // Suporte a teclado (setas/Tab ativam radios → change dispara)
  radios.forEach((r) => {
    r.addEventListener("change", () => definir(parseInt(r.value, 10)));
  });

  // Estado inicial (se vier pré-marcado)
  const pre = radios.find((r) => r.checked);
  definir(pre ? parseInt(pre.value, 10) : 0);

  // Expor reset global para usar após o envio
  window.resetEstrelasFeedback = limpar;
})();
