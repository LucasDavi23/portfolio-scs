// ==================================================
// 🧠 Athena — Image Processing Specialist
//
// Nível: Adulta
//
// File: athena-image-processing.js
//
// PT: Especialista em processamento de imagem no formulário.
//     Athena é responsável por validar arquivos, converter,
//     redimensionar e comprimir imagens (WebP com fallback),
//     extrair base64/mime/blob e gerar nomes únicos.
//     Ela atua apenas no processamento local (browser),
//     não toca UI, não chama API/GAS e não emite eventos.
//
// EN: Image processing specialist for the form.
//     Athena is responsible for validating files, converting,
//     resizing and compressing images (WebP with fallback),
//     extracting base64/mime/blob and generating unique filenames.
//     She operates only on local processing (browser),
//     does not touch UI, does not call APIs/GAS and does not emit events.
// ==================================================

// ------------------------------
// Constants
// ------------------------------

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE_MB = 2;

// ------------------------------
// Validation
// ------------------------------

function validateFile(file) {
  // PT: Arquivo opcional — ausência é válida
  // EN: Optional file — absence is valid
  if (!file) return { ok: true };

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

// ------------------------------
// Internal helpers (browser APIs)
// ------------------------------

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

async function loadImageSource(fileOrBlob) {
  const blob = fileOrBlob instanceof Blob ? fileOrBlob : fileOrBlob;

  if ('createImageBitmap' in window) {
    try {
      // PT: Usa orientação EXIF quando suportado
      // EN: Uses EXIF orientation when supported
      return await createImageBitmap(blob, {
        imageOrientation: 'from-image',
      });
    } catch (_) {
      /* fallback below */
    }
  }

  return await new Promise((resolve, reject) => {
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

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

// ------------------------------
// Conversion / compression
// Returns: { base64, mime, blob, width, height }
// ------------------------------

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
    // PT: Falha rara — sem contexto 2D
    // EN: Rare failure — no 2D context available
    throw new Error('Canvas 2D context is not available.');
  }

  ctx.drawImage(source, 0, 0, dims.width, dims.height);

  // Try WebP first
  let mime = 'image/webp';
  let blob = await canvasToBlob(canvas, mime, quality);

  // Fallback to JPEG if WebP is not supported
  if (!blob) {
    mime = 'image/jpeg';
    blob = await canvasToBlob(canvas, mime, quality);
  }

  // PT: Loop adaptativo para caber no limite de tamanho
  // EN: Adaptive loop to fit size limit
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

// ------------------------------
// Compatibility helper (no resize)
// Returns: { base64, mime }
// ------------------------------

async function extractBase64AndMime(file) {
  const dataURL = await fileToDataURL(file);
  const [meta, base64] = String(dataURL).split(',');
  const mime = /^data:(.*?);base64/.exec(meta)?.[1] || '';
  return { base64, mime };
}

// ------------------------------
// Filename helper
// ------------------------------

function generateUniqueFilename(file) {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:TZ]/g, '')
    .slice(0, 14);

  const extension = file.name.split('.').pop().toLowerCase();
  return `scs_${timestamp}.${extension}`;
}

// ------------------------------
// Export pattern (project standard)
// Ordem de uso: validate → convert → extract → filename → constants
// ------------------------------

export const AthenaImageProcessing = {
  validateFile,
  convertToWebp,
  extractBase64AndMime,
  generateUniqueFilename,
  ALLOWED_MIME_TYPES,
  DEFAULT_MAX_SIZE_MB,
};
