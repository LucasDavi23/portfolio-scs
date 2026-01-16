// /assets/js/feedback/feedbackForm.core.js
import { FeedbackAPI } from "./feedbackForm.API.js";
import { FeedbackFoto } from "./feedbackForm.foto.js";
import { FeedbackUI } from "./feedbackForm.ui.js";
import { nomeOk } from "./feedback.filtronome.js";

(() => {
  const ui = FeedbackUI;
  if (!ui.el.formulario) return;

  // (sem mudanças) preview da foto...
  ui.el.foto?.addEventListener("change", () => {
    const arquivo = ui.el.foto.files?.[0] || null;
    const v = FeedbackFoto.validarArquivo(arquivo);
    if (!v.ok) {
      ui.exibirStatus(v.mensagem, "erro");
      ui.el.foto.value = "";
      ui.atualizarPreview(null);
      return;
    }
    ui.atualizarPreview(arquivo);
  });

  ui.el.formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = ui.coletar();
    const erroBasico = ui.validarBasico(dados);

    if (!nomeOk(dados.nome)) {
      ui.marcarErroCampo(
        ui.el.nome,
        "Por favor, use um nome apropriado (sem ofensas)."
      );
      ui.exibirStatus(
        "Por favor, use um nome apropriado (sem ofensas).",
        "erro"
      );
      ui.el.nome.focus();
      return;
    }
    if (erroBasico) return ui.exibirStatus(erroBasico, "erro");

    try {
      ui.travarEnvio(true);
      ui.exibirStatus("Enviando seu feedback…", "info");

      // 1) Upload da foto (opcional)
      let photo_id = "";
      let photo_url = "";
      let photo_public_url = "";
      let photo_name = "";
      let photo_name_original = "";

      if (dados.arquivo) {
        const validaFoto = FeedbackFoto.validarArquivo(dados.arquivo);
        if (!validaFoto.ok) throw new Error(validaFoto.mensagem);

        photo_name_original = dados.arquivo.name;
        photo_name = FeedbackFoto.gerarNomeUnico(dados.arquivo);

        const { base64, mime } = await FeedbackFoto.converterParaWebp(
          dados.arquivo,
          {
            maxLado: 1280,
            qualidade: 0.8,
            tamanhoMaxMB: 2,
          }
        );

        const up = await FeedbackAPI.enviarFotoBase64({
          base64,
          mime,
          filename: photo_name,
          original_name: photo_name_original,
        });
        if (!(up?.ok || up?.success)) {
          // compatibilidade com up.ok (antigo) e up.success (novo)
          throw new Error(up.message || "Falha ao enviar a imagem.");
        }
        const r = up.data || up; // compatibilidade
        photo_id = r.photo_id || "";
        photo_url = r.photo_url || "";
        // 🔽 usa direto do backend; se faltar, monta por id
        photo_public_url =
          r.photo_public_url ||
          (r.photo_id
            ? `https://drive.google.com/uc?export=view&id=${r.photo_id}`
            : "");
      }

      // pega do hidden #rating OU do radio selecionado name="rating_star"
      const ratingHidden = Number(
        document.querySelector("#rating")?.value || 0
      );
      const ratingRadio = Number(
        document.querySelector('input[name="rating_star"]:checked')?.value || 0
      );
      const rating =
        ratingHidden && ratingHidden > 0 ? ratingHidden : ratingRadio;

      // debug opcional
      console.log("[rating-debug]", {
        ratingHidden,
        ratingRadio,
        final: rating,
      });

      // garanta que a validação e o payload user o valor correto
      if (!(rating >= 1 && rating <= 5)) {
        ui.exibirStatus("Selecione de 1 a 5 estrelas.", "erro");
        document.querySelector('input[name="rating_star"]')?.focus();
        return;
      }

      // alinhar objeto coletado
      dados.nota = rating;

      // 2) Criar feedback (AGORA COM plataforma='scs')
      const payload = {
        plataforma: "scs", // 🔴 chave para limitar o update no front
        rating,
        nome: dados.nome,
        comentario: dados.comentario,
        pedido: dados.pedido,
        contato: dados.contato,
        origem: "portfolio_scs",
        timestamp_cliente: new Date().toISOString(),
        photo_id,
        photo_url,
        photo_public_url, // manda explicito (já pública)
        photo_name,
        photo_name_original,
      };

      const ret = await FeedbackAPI.criarFeedback(payload);
      if (!ret.success)
        throw new Error(ret.message || "Erro ao salvar feedback.");

      ui.exibirStatus("Obrigado! Seu feedback foi enviado. ✅", "sucesso");
      ui.resetar();

      // 3) Evento para atualizar APENAS o que ouvir "SCS" (Hero)
      window.dispatchEvent(
        new CustomEvent("feedback:novo", {
          detail: {
            avaliacao: {
              plataforma: "scs",
              estrelas: rating,
              data: new Date().toISOString(),
              autor: dados.nome,
              texto: dados.comentario,
              url: photo_public_url || photo_url || "", // 👉 preferir público
              aprovado: true,
              destaque: false,
            },
            item: ret.item || ret.data || null, // se o servidor devolver o item já formatado
          },
        })
      );
    } catch (erro) {
      console.error(erro);
      ui.exibirStatus(erro.message || "Falha no envio.", "erro");
    } finally {
      ui.travarEnvio(false);
    }
  });
})();
