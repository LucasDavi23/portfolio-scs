// -------------------------------
// ARQUIVO: /assets/js/feedback/feedbackForm.foto.js
// Responsável por validação, conversão e compressão da imagem (para WebP)
// -------------------------------
export const FeedbackFoto = (() => {
  const FORMATOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
  const TAMANHO_MAX_MB = 2;

  // ✅ Valida formato e tamanho original
  function validarArquivo(arquivo) {
    if (!arquivo) return { ok: true };
    const tamanhoMB = arquivo.size / (1024 * 1024);
    if (!FORMATOS_PERMITIDOS.includes(arquivo.type)) {
      return { ok: false, mensagem: "Formato inválido. Use JPG, PNG ou WEBP." };
    }
    if (tamanhoMB > TAMANHO_MAX_MB) {
      return { ok: false, mensagem: `Imagem acima de ${TAMANHO_MAX_MB}MB.` };
    }
    return { ok: true };
  }

  // 🔧 Helpers
  function arquivoParaDataURL(arquivo) {
    return new Promise((resolver, rejeitar) => {
      const leitor = new FileReader();
      leitor.onload = () => resolver(leitor.result);
      leitor.onerror = rejeitar;
      leitor.readAsDataURL(arquivo);
    });
  }

  function gerarNomeUnico(arquivo) {
    const agora = new Date();
    const timestamp = agora
      .toISOString()
      .replace(/[-:TZ]/g, "")
      .slice(0, 14); // ex: 20251010_110305
    const extensao = arquivo.name.split(".").pop().toLowerCase();
    return `scs_${timestamp}.${extensao}`;
  }

  function blobParaBase64(blob) {
    return new Promise((resolver, rejeitar) => {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        const dataURL = leitor.result; // data:mime;base64,AAAA
        const base64 = String(dataURL).split(",")[1] || "";
        resolver(base64);
      };
      leitor.onerror = rejeitar;
      leitor.readAsDataURL(blob);
    });
  }

  async function carregarImagem(arquivo) {
    const blob = arquivo instanceof Blob ? arquivo : arquivo;
    if ("createImageBitmap" in window) {
      try {
        // Usa orientação do EXIF quando possível
        return await createImageBitmap(blob, {
          imageOrientation: "from-image",
        });
      } catch (_) {
        /* fallback abaixo */
      }
    }
    return await new Promise((ok, erro) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = erro;
      img.src = URL.createObjectURL(blob);
    });
  }

  function dimensionar(origLarg, origAlt, maxLado) {
    const ladoMaior = Math.max(origLarg, origAlt);
    if (ladoMaior <= maxLado) return { largura: origLarg, altura: origAlt };
    const fator = maxLado / ladoMaior;
    return {
      largura: Math.round(origLarg * fator),
      altura: Math.round(origAlt * fator),
    };
  }

  function canvasParaBlob(canvas, tipo, qualidade) {
    return new Promise((ok) => {
      canvas.toBlob((blob) => ok(blob), tipo, qualidade);
    });
  }

  // 🪄 Converte/Redimensiona para WebP (com fallback para JPEG)
  // Retorna: { base64, mime, blob, largura, altura }
  async function converterParaWebp(arquivo, opcoes = {}) {
    const maxLado = Number.isFinite(opcoes.maxLado) ? opcoes.maxLado : 1280;
    const tamanhoMaxMB = Number.isFinite(opcoes.tamanhoMaxMB)
      ? opcoes.tamanhoMaxMB
      : TAMANHO_MAX_MB;
    let qualidade = Number.isFinite(opcoes.qualidade) ? opcoes.qualidade : 0.8;

    const fonte = await carregarImagem(arquivo);
    const { width: w0, height: h0 } = fonte;
    const dims = dimensionar(w0, h0, maxLado);

    const canvas = document.createElement("canvas");
    canvas.width = dims.largura;
    canvas.height = dims.altura;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(fonte, 0, 0, dims.largura, dims.altura);

    // Tenta WebP primeiro
    let mime = "image/webp";
    let blob = await canvasParaBlob(canvas, mime, qualidade);

    // Fallback: alguns navegadores antigos podem não gerar WebP
    if (!blob) {
      mime = "image/jpeg";
      blob = await canvasParaBlob(canvas, mime, qualidade);
    }

    // 🔁 Ajuste de qualidade para caber no limite
    const alvoBytes = tamanhoMaxMB * 1024 * 1024;
    let tentativas = 0;
    while (blob && blob.size > alvoBytes && qualidade > 0.5 && tentativas < 5) {
      qualidade -= 0.1;
      blob = await canvasParaBlob(canvas, mime, qualidade);
      tentativas++;
    }

    const base64 = await blobParaBase64(blob);
    return { base64, mime, blob, largura: dims.largura, altura: dims.altura };
  }

  // Conversão simples (sem redimensionar) — mantida para compatibilidade
  async function extrairBase64EMime(arquivo) {
    const dataURL = await arquivoParaDataURL(arquivo);
    const [meta, base64] = String(dataURL).split(",");
    const mime = /^data:(.*?);base64/.exec(meta)?.[1] || "";
    return { base64, mime };
  }

  return {
    validarArquivo,
    extrairBase64EMime,
    converterParaWebp,
    FORMATOS_PERMITIDOS,
    TAMANHO_MAX_MB,
    gerarNomeUnico,
  };
})();
