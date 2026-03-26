/* -----------------------------------------------------------------------------*/
// 🧠 Athena — Image Processing Specialist
//
// Nível / Level: Adulta / Adult
//
// PT: Especialista em processamento de imagem no formulário.
//     Responsável por validar arquivos, converter, redimensionar,
//     comprimir imagens (WebP com fallback), extrair base64/mime/blob
//     e gerar nomes únicos.
//
//     Atua apenas no processamento local (browser),
//     não toca UI, não chama API/GAS e não emite eventos.
//
// EN: Image processing specialist for the form.
//     Responsible for validating files, converting, resizing,
//     compressing images (WebP with fallback), extracting base64/mime/blob
//     and generating unique filenames.
//
//     Operates only locally (browser),
//     does not touch UI, does not call APIs/GAS and does not emit events.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Imports
/* -----------------------------------------------------------------------------*/
// (nenhum necessário / none needed)

/* -----------------------------------------------------------------------------*/
// Constants
//
// PT: Configurações base do processamento de imagem.
// EN: Base configuration for image processing.
/* -----------------------------------------------------------------------------*/

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE_MB = 2;

/* -----------------------------------------------------------------------------*/
// Validation
//
// PT: Validação inicial do arquivo antes do processamento.
// EN: Initial file validation before processing.
/* -----------------------------------------------------------------------------*/

// PT: Valida tipo e tamanho do arquivo antes do processamento.
// EN: Validates file type and size before processing.
function validateFile(file) {
  if (!file) {
    return { ok: true };
  }

  const sizeMB = file.size / (1024 * 1024);

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: 'Invalid format. Use JPG, PNG or WEBP.',
    };
  }

  if (sizeMB > DEFAULT_MAX_SIZE_MB) {
    return {
      ok: false,
      message: `Image exceeds ${DEFAULT_MAX_SIZE_MB}MB.`,
    };
  }

  return { ok: true };
}

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares baseadas em APIs do navegador.
// EN: Helper functions based on browser APIs.
/* -----------------------------------------------------------------------------*/

// PT: Converte um File em DataURL completo.
// EN: Converts a File into a full DataURL.
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// PT: Converte um Blob em base64 puro (sem metadata).
// EN: Converts a Blob into raw base64 (without metadata).
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const dataURL = reader.result;
      const base64 = String(dataURL).split(',')[1] || '';
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// PT: Carrega a imagem usando createImageBitmap quando disponível,
//     com fallback para Image.
// EN: Loads the image using createImageBitmap when available,
//     with fallback to Image.
async function loadImageSource(fileOrBlob) {
  const blob = fileOrBlob;

  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(blob, {
        imageOrientation: 'from-image',
      });
    } catch (_) {
      // fallback abaixo
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

// PT: Ajusta largura e altura mantendo a proporção dentro do limite máximo.
// EN: Adjusts width and height while preserving aspect ratio within max size.
function fitWithinMaxSide(originalWidth, originalHeight, maxSide) {
  const largestSide = Math.max(originalWidth, originalHeight);

  if (largestSide <= maxSide) {
    return { width: originalWidth, height: originalHeight };
  }

  const scale = maxSide / largestSide;

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

// PT: Converte o canvas em Blob no formato e qualidade informados.
// EN: Converts the canvas into a Blob using the given format and quality.
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/* -----------------------------------------------------------------------------*/
// Processing
//
// PT: Conversão, compressão e extração de dados da imagem.
// EN: Image conversion, compression and data extraction.
/* -----------------------------------------------------------------------------*/

// PT: Converte a imagem para WebP com fallback para JPEG,
//     aplicando redimensionamento e compressão adaptativa.
// EN: Converts the image to WebP with JPEG fallback,
//     applying resize and adaptive compression.
async function convertToWebp(file, options = {}) {
  const maxSide = Number.isFinite(options.maxSide) ? options.maxSide : 1280;
  const maxSizeMB = Number.isFinite(options.maxSizeMB) ? options.maxSizeMB : DEFAULT_MAX_SIZE_MB;
  let quality = Number.isFinite(options.quality) ? options.quality : 0.8;

  const source = await loadImageSource(file);
  const { width: w0, height: h0 } = source;

  const dims = fitWithinMaxSide(w0, h0, maxSide);

  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context is not available.');
  }

  ctx.drawImage(source, 0, 0, dims.width, dims.height);

  let mime = 'image/webp';
  let blob = await canvasToBlob(canvas, mime, quality);

  if (!blob) {
    mime = 'image/jpeg';
    blob = await canvasToBlob(canvas, mime, quality);
  }

  const targetBytes = maxSizeMB * 1024 * 1024;
  let attempts = 0;

  while (blob && blob.size > targetBytes && quality > 0.5 && attempts < 5) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, mime, quality);
    attempts += 1;
  }

  const base64 = await blobToBase64(blob);

  return {
    base64,
    mime,
    blob,
    width: dims.width,
    height: dims.height,
  };
}

/* -----------------------------------------------------------------------------*/
// Compatibility
//
// PT: Funções compatíveis com fluxos mais simples ou legados.
// EN: Functions compatible with simpler or legacy flows.
/* -----------------------------------------------------------------------------*/

// PT: Extrai base64 e mime sem redimensionar a imagem.
// EN: Extracts base64 and mime without resizing the image.
async function extractBase64AndMime(file) {
  const dataURL = await fileToDataURL(file);
  const [meta, base64] = String(dataURL).split(',');
  const mime = /^data:(.*?);base64/.exec(meta)?.[1] || '';

  return { base64, mime };
}

/* -----------------------------------------------------------------------------*/
// Filename
//
// PT: Geração de nome único para arquivo processado.
// EN: Unique filename generation for processed file.
/* -----------------------------------------------------------------------------*/

// PT: Gera um nome único baseado em timestamp.
// EN: Generates a unique filename based on timestamp.
function generateUniqueFileName(file) {
  const now = new Date();

  const timestamp = now
    .toISOString()
    .replace(/[-:TZ]/g, '')
    .slice(0, 14);

  const extension = file.name.split('.').pop().toLowerCase();

  return `scs_${timestamp}.${extension}`;
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const AthenaImageProcessing = {
  validateFile,
  convertToWebp,
  extractBase64AndMime,
  generateUniqueFileName,
  ALLOWED_MIME_TYPES,
  DEFAULT_MAX_SIZE_MB,
};
