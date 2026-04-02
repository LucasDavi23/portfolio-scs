/* -----------------------------------------------------------------------------*/
// 🌉 Feedback API — Google Apps Script
//
// Nível / Level: Simples / Direct
//
// PT:
// Este script é a API do reviews de feedback.
// Ele lê e retorna avaliações aprovadas da aba "Reviews"
// e também pode servir imagens pelo modo "img".
//
// Antes de usar:
// 1. Crie uma planilha Google Sheets.
// 2. Garanta que existam as abas:
//    - Reviews
//    - Responses
// 3. Cole o ID da planilha em SPREADSHEET_ID.
// 4. Publique o Apps Script como Web App.
//
// A aba "Reviews" deve conter os cabeçalhos:
// - platform
// - approved
// - date
// - author
// - text
// - rating
// - url
//
// A aba "Responses" pode ser usada para salvar os envios do formulário.
//
// EN:
// This script is the feedback wall API.
// It reads and returns approved reviews from the "Reviews" sheet
// and can also serve images through the "img" mode.
//
// Before using:
// 1. Create a Google Sheets file.
// 2. Make sure these sheets exist:
//    - Reviews
//    - Responses
// 3. Paste the spreadsheet ID into SPREADSHEET_ID.
// 4. Deploy the Apps Script as a Web App.
//
// The "Reviews" sheet must contain these headers:
// - platform
// - approved
// - date
// - author
// - text
// - rating
// - url
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Config
/* -----------------------------------------------------------------------------*/
// PT: ID da planilha principal onde ficam os dados
// EN: Main spreadsheet ID where data is stored
const SPREADSHEET_ID = '1z2rfB5xnt6zbt3MAPZ6m99c8_4PmX_6rZU9qHAeRwMc';

// PT: Aba usada para exibir as avaliações no Reviews
// EN: Sheet used to display reviews on the wall
const SHEET_REVIEWS = 'Reviews';

// PT: Aba usada para salvar respostas enviadas pelo formulário
// EN: Sheet used to store submitted form responses
const SHEET_RESPONSES = 'Responses';

/* -----------------------------------------------------------------------------*/
// doGet — List Reviews
/* -----------------------------------------------------------------------------*/
function doGet(e) {
  const params = e?.parameter || {};
  const requestMode = String(params.mode || params.action || 'list').toLowerCase();

  // PT: Rota para servir imagem pelo proxy
  // EN: Route used to serve images through proxy
  if (requestMode === 'img') {
    return serveImage_(params);
  }

  // PT: Modos aceitos: list e meta
  // EN: Accepted modes: list and meta
  if (requestMode !== 'list' && requestMode !== 'meta') {
    return json({ ok: false, error: 'Invalid mode/action.' });
  }

  // PT: Compatibilidade entre "plat" e "platform"
  // EN: Compatibility between "plat" and "platform"
  const platformParam = String(params.platform || params.plat || '').toLowerCase();

  // PT: Paginação protegida com limites mínimos e máximos
  // EN: Safe pagination with min/max limits
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = Math.max(1, Math.min(50, parseInt(params.limit || '10', 10)));
  const fast = String(params.fast || '0') === '1';

  // PT: Permite ignorar o cache quando necessário
  // EN: Allows bypassing cache when needed
  const noCache =
    String(params.nocache || '') === '1' ||
    String(params.force || '') === '1' ||
    String(params.cb || '') !== '';

  const cache = CacheService.getScriptCache();
  const cacheKey =
    requestMode === 'meta'
      ? `wall:meta:v4:${platformParam || 'all'}`
      : `wall:v4:${platformParam || 'all'}:p${page}:l${limit}:f${fast ? 1 : 0}`;

  if (!noCache) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) return json(JSON.parse(cachedData));
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const reviewsSheet = spreadsheet.getSheetByName(SHEET_REVIEWS);

  if (!reviewsSheet) {
    return json({ v: 4, items: [], hasMore: false, total: fast ? undefined : 0 });
  }

  const rows = reviewsSheet.getDataRange().getValues();
  if (!rows || rows.length <= 1) {
    return json({ v: 4, items: [], hasMore: false, total: fast ? undefined : 0 });
  }

  const header = rows[0].map((h) => String(h).trim().toLowerCase());
  const getColumnIndex = (name) => header.indexOf(String(name).toLowerCase().trim());

  // PT: Colunas obrigatórias esperadas na aba Reviews
  // EN: Required columns expected in the Reviews sheet
  const cPlatform = getColumnIndex('platform');
  const cApproved = getColumnIndex('approved');
  const cDate = getColumnIndex('date');
  const cAuthor = getColumnIndex('author');
  const cText = getColumnIndex('text');
  const cRating = getColumnIndex('rating');
  const cUrl = getColumnIndex('url');

  const required = {
    platform: cPlatform,
    approved: cApproved,
    date: cDate,
    author: cAuthor,
    text: cText,
    rating: cRating,
    url: cUrl,
  };

  const missing = Object.keys(required).filter((key) => required[key] < 0);

  if (missing.length) {
    return json({
      ok: false,
      error: `Missing columns in SHEET_REVIEWS: ${missing.join(', ')}`,
      header,
    });
  }

  const wantPlatform = platformParam && platformParam !== 'all' ? platformParam : null;

  /* ---------------------------------------------------------------------------*/
  // Meta summary
  /* ---------------------------------------------------------------------------*/
  if (requestMode === 'meta') {
    const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalMeta = 0;
    let sumMeta = 0;

    for (let i = rows.length - 1; i >= 1; i--) {
      const row = rows[i];

      const isApproved =
        row[cApproved] === true || String(row[cApproved]).trim().toUpperCase() === 'TRUE';

      if (!isApproved) continue;

      const platform = String(row[cPlatform] || '')
        .trim()
        .toLowerCase();
      if (wantPlatform && platform !== wantPlatform) continue;

      let rating = Number(row[cRating] || 0);
      if (!Number.isFinite(rating)) rating = 0;

      rating = Math.round(rating);
      if (rating < 1) rating = 1;
      if (rating > 5) rating = 5;

      buckets[rating] += 1;
      totalMeta += 1;
      sumMeta += rating;
    }

    const avgMeta = totalMeta > 0 ? sumMeta / totalMeta : 0;
    const payload = { v: 4, avg: avgMeta, total: totalMeta, buckets };

    if (!noCache) cache.put(cacheKey, JSON.stringify(payload), 60);
    return json(payload);
  }

  /* ---------------------------------------------------------------------------*/
  // List
  /* ---------------------------------------------------------------------------*/
  const skip = (page - 1) * limit;
  let skipped = 0;

  const items = [];
  let total = 0;
  let hasMore = false;

  const TZ = 'America/Sao_Paulo';

  for (let i = rows.length - 1; i >= 1; i--) {
    const row = rows[i];

    const isApproved = row[cApproved] === true || String(row[cApproved]).toUpperCase() === 'TRUE';

    if (!isApproved) continue;

    const platform = String(row[cPlatform] || '')
      .trim()
      .toLowerCase();
    if (wantPlatform && platform !== wantPlatform) continue;

    if (!fast) total++;

    if (skipped < skip) {
      skipped++;
      continue;
    }

    const date = normalizeDate_(row[cDate]);

    if (items.length < limit) {
      items.push({
        platform,
        rating: Number(row[cRating] || 0),
        date_br: date ? Utilities.formatDate(date, TZ, 'dd/MM/yyyy HH:mm:ss') : '',
        date_ms: date ? date.getTime() : null,
        author: String(row[cAuthor] || '').trim(),
        text: String(row[cText] || '').trim(),
        url: String(row[cUrl] || '').trim(),
      });
    } else {
      if (fast) {
        hasMore = true;
        break;
      }
    }
  }

  if (!fast) {
    hasMore = page * limit < total;
  }

  const payload = { v: 4, items, hasMore, total: fast ? undefined : total };

  if (!noCache) cache.put(cacheKey, JSON.stringify(payload), 60);
  return json(payload);
}

/* -----------------------------------------------------------------------------*/
// doPost — Save Feedback
/* -----------------------------------------------------------------------------*/
function doPost(e) {
  try {
    const params = e?.parameter || {};
    const action = String(params.action || '').toLowerCase();

    // PT: Roteamento por action para manter compatibilidade com a API atual.
    // EN: Action-based routing to keep compatibility with the current API.
    if (action === 'uploadphoto') {
      return uploadPhoto_(e);
    }

    if (action === 'createfeedback') {
      return createFeedback_(e);
    }

    // PT: Fallback para o fluxo atual quando nenhuma action for informada.
    // EN: Fallback to the current flow when no action is provided.
    return createFeedback_(e);
  } catch (error) {
    return json({ ok: false, error: String((error && error.message) || error) });
  }
}

/* -----------------------------------------------------------------------------*/
// Create Feedback
//
// PT: Cria um feedback, salva nas abas (privada + Reviews) e retorna o item.
// EN: Creates a feedback, writes to private + Reviews sheets, and returns item.
/* -----------------------------------------------------------------------------*/
function createFeedback_(e) {
  const body = JSON.parse(e?.postData?.contents || '{}');

  /* ---------------------------------------------------------------------------
// Input (fallback)
--------------------------------------------------------------------------- */
  const rating = Number(body.rating || 0);

  const name = String(body.name || body.nome || '').trim();
  const comment = String(body.comment || body.comentario || '').trim();
  const order = String(body.order || body.pedido || '').trim();
  const contact = String(body.contact || body.contato || '').trim();
  const origin = String(body.origin || body.origem || 'scs').trim();

  const tsClient = body.timestamp_client
    ? new Date(body.timestamp_client)
    : body.timestamp_cliente
      ? new Date(body.timestamp_cliente)
      : new Date();

  const tsServer = new Date();

  /* ---------------------------------------------------------------------------
// Validation
--------------------------------------------------------------------------- */
  if (!(rating >= 1 && rating <= 5)) {
    return json({ ok: false, error: 'Invalid rating.' });
  }

  if (!comment) {
    return json({ ok: false, error: 'Empty comment.' });
  }

  /* ---------------------------------------------------------------------------
// Sheets (open + ensure structure)
--------------------------------------------------------------------------- */
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  const responsesSheet = ensureSheet_(spreadsheet, SHEET_RESPONSES, [
    'timestamp_server',
    'rating',
    'name',
    'comment',
    'order',
    'contact',
    'origin',
    'timestamp_client',
  ]);

  const reviewsSheet = ensureSheet_(spreadsheet, SHEET_REVIEWS, [
    'platform',
    'rating',
    'date',
    'author',
    'text',
    'url',
    'approved',
    'featured',
  ]);

  /* ---------------------------------------------------------------------------
// Write → Responses (private)
--------------------------------------------------------------------------- */
  responsesSheet.appendRow([tsServer, rating, name, comment, order, contact, origin, tsClient]);

  /* ---------------------------------------------------------------------------
// Photo (optional)
--------------------------------------------------------------------------- */
  const photoUrl = String(body.photo_public_url || body.photo_url || '').trim();

  /* ---------------------------------------------------------------------------
// Write → Reviews (public / header-safe)
--------------------------------------------------------------------------- */
  const header = reviewsSheet
    .getRange(1, 1, 1, reviewsSheet.getLastColumn())
    .getValues()[0]
    .map((h) => String(h).trim().toLowerCase());

  const getColumnIndex = (colName) => header.indexOf(String(colName).trim().toLowerCase());

  const outputRow = new Array(header.length).fill('');

  const iPlatform = getColumnIndex('platform');
  const iRating = getColumnIndex('rating');
  const iDate = getColumnIndex('date');
  const iAuthor = getColumnIndex('author');
  const iText = getColumnIndex('text');
  const iUrl = getColumnIndex('url');
  const iApproved = getColumnIndex('approved');
  const iFeatured = getColumnIndex('featured');

  if (iPlatform >= 0) outputRow[iPlatform] = 'scs';
  if (iRating >= 0) outputRow[iRating] = rating;
  if (iDate >= 0) outputRow[iDate] = tsServer;
  if (iAuthor >= 0) outputRow[iAuthor] = name;
  if (iText >= 0) outputRow[iText] = comment;
  if (iUrl >= 0) outputRow[iUrl] = photoUrl;
  if (iApproved >= 0) outputRow[iApproved] = true;
  if (iFeatured >= 0) outputRow[iFeatured] = false;

  reviewsSheet.appendRow(outputRow);

  /* ---------------------------------------------------------------------------
// Response payload (Hero)
--------------------------------------------------------------------------- */
  const tz = Session.getScriptTimeZone();
  const dateBr = Utilities.formatDate(tsServer, tz, 'dd/MM/yyyy HH:mm');

  const item = {
    rating,
    name,
    comment,
    date_iso: tsServer.toISOString(),
    date_br: dateBr,
    photo_url: photoUrl || '',
  };

  return json({ ok: true, item });
}

/* -----------------------------------------------------------------------------*/
// Upload Photo
//
// PT: Salva a foto (base64) no Drive e retorna os links de acesso.
// EN: Saves the photo (base64) to Drive and returns access links.
/* -----------------------------------------------------------------------------*/
function uploadPhoto_(e) {
  try {
    const body = JSON.parse(e?.postData?.contents || '{}');

    /* ---------------------------------------------------------------------------
    // Input
    --------------------------------------------------------------------------- */
    const base64 = String(body.base64 || '');
    let filename = String(body.filename || 'scs_' + Date.now() + '.webp');
    const mime = String(body.mime || 'image/webp');
    const originalName = String(body.original_name || '');

    /* ---------------------------------------------------------------------------
    // Validation
    --------------------------------------------------------------------------- */
    if (!base64) {
      return json({ ok: false, error: 'Missing base64.' });
    }

    /* ---------------------------------------------------------------------------
    // Filename
    --------------------------------------------------------------------------- */
    if (/image\/webp/i.test(mime) && !/\.webp$/i.test(filename)) {
      filename = filename.replace(/\.\w+$/g, '') + '.webp';
    }

    /* ---------------------------------------------------------------------------
    // Drive (folder + file)
    --------------------------------------------------------------------------- */
    const blob = dataUrlToBlob_(base64, mime, filename);
    const folder = getOrCreateFolder_('SCS-Feedback-Fotos');
    const file = folder.createFile(blob).setName(filename);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    /* ---------------------------------------------------------------------------
    // Output URLs
    --------------------------------------------------------------------------- */
    const photoId = file.getId();
    const viewerUrl = file.getUrl();

    const match = viewerUrl.match(/[?&]resourcekey=([^&]+)/);
    const resourceKey = match ? match[1] : '';

    const photoPublicUrl = `https://drive.google.com/uc?export=view&id=${photoId}${resourceKey ? `&resourcekey=${resourceKey}` : ''}`;

    return json({
      ok: true,
      photo_id: photoId,
      photo_url: viewerUrl,
      photo_public_url: photoPublicUrl,
      filename,
      original_name: originalName,
      mime,
    });
  } catch (error) {
    return json({ ok: false, error: String((error && error.message) || error) });
  }
}

/* -----------------------------------------------------------------------------*/
// Helpers
//
// PT: Funções auxiliares para manipulação de Sheets, dados e utilidades.
// EN: Helper functions for Sheets handling, data parsing and utilities.
/* -----------------------------------------------------------------------------*/

/* ---------------------------------------------------------------------------
 // Ensure Sheet
--------------------------------------------------------------------------- */
// PT: Garante que a aba exista e cria o cabeçalho se estiver vazia.
// EN: Ensures the sheet exists and creates the header if empty.
function ensureSheet_(spreadsheet, sheetName, header) {
  const cleanSheetName = String(sheetName || '').trim();
  const allSheets = spreadsheet.getSheets();

  const foundSheet = allSheets.find(
    (sheet) => sheet.getName().trim().toLowerCase() === cleanSheetName.toLowerCase()
  );

  let targetSheet = foundSheet || null;

  if (!targetSheet) {
    targetSheet = spreadsheet.insertSheet(cleanSheetName);
    targetSheet.appendRow(header);
  } else if (targetSheet.getLastRow() === 0) {
    targetSheet.appendRow(header);
  }

  return targetSheet;
}

/* ---------------------------------------------------------------------------
 // JSON Response
--------------------------------------------------------------------------- */
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/* ---------------------------------------------------------------------------
 // Normalize Key
--------------------------------------------------------------------------- */
function normKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/* ---------------------------------------------------------------------------
 // Header Indexer (PT/EN aliases)
--------------------------------------------------------------------------- */
function indexer(header) {
  const map = {};
  header.forEach((headerName, i) => (map[normKey(headerName)] = i));

  const alias = {
    platform: ['platform', 'plataforma', 'plataform'],
    rating: ['rating', 'estrelas', 'stars'],
    date: ['date', 'data'],
    author: ['author', 'autor'],
    text: ['text', 'texto', 'comment', 'comentario'],
    url: ['url'],
    approved: ['approved', 'aprovado'],
    featured: ['featured', 'destaque'],
    contact: ['contact', 'contato'],
  };

  const pick = (...keys) => {
    for (const key of keys) {
      const idx = map[normKey(key)];
      if (Number.isInteger(idx) && idx >= 0) return idx;
    }
    return -1;
  };

  const idx = {
    platform: pick(...alias.platform),
    rating: pick(...alias.rating),
    date: pick(...alias.date),
    author: pick(...alias.author),
    text: pick(...alias.text),
    url: pick(...alias.url),
    approved: pick(...alias.approved),
    featured: pick(...alias.featured),
    contact: pick(...alias.contact),
  };

  return idx;
}

/* ---------------------------------------------------------------------------
 // Safe Cell
--------------------------------------------------------------------------- */
function safeCell(row, i) {
  return i >= 0 ? row[i] : '';
}

/* ---------------------------------------------------------------------------
 // Map Row → Review Object
--------------------------------------------------------------------------- */
function mapRow(row, idx, platform) {
  return {
    platform,
    rating: Number(safeCell(row, idx.rating) || 0),
    date: toISO(parseDate(safeCell(row, idx.date))),
    author: String(safeCell(row, idx.author) || '').trim(),
    text: String(safeCell(row, idx.text) || '').trim(),
    url: String(safeCell(row, idx.url) || '').trim(),
  };
}

/* ---------------------------------------------------------------------------
 // Parse Date
--------------------------------------------------------------------------- */
function parseDate(value) {
  if (value instanceof Date) return value;

  const stringValue = String(value || '').trim();

  let match = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return new Date(+match[3], +match[2] - 1, +match[1]);

  match = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return new Date(+match[1], +match[2] - 1, +match[3]);

  const parsedDate = new Date(stringValue);
  return isNaN(parsedDate) ? null : parsedDate;
}

/* ---------------------------------------------------------------------------
 // Date → ISO (YYYY-MM-DD)
--------------------------------------------------------------------------- */
function toISO(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';

  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${mm}-${dd}`;
}

/* ---------------------------------------------------------------------------
 // Base64 → Blob
--------------------------------------------------------------------------- */
function dataUrlToBlob_(base64, mime, name) {
  const cleaned = base64.includes('base64,') ? base64.split('base64,')[1] : base64;

  const bytes = Utilities.base64Decode(cleaned);

  return Utilities.newBlob(bytes, mime || 'application/octet-stream', name || 'upload.bin');
}

/* ---------------------------------------------------------------------------
 // Get or Create Folder (Drive)
--------------------------------------------------------------------------- */
function getOrCreateFolder_(name) {
  const iter = DriveApp.getFoldersByName(name);

  if (iter.hasNext()) return iter.next();

  return DriveApp.createFolder(name);
}

/* -----------------------------------------------------------------------------*/
// Maintenance / Auto Ping
/* -----------------------------------------------------------------------------*/
function ping() {
  const webAppUrl =
    'https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec';

  ['scs', 'ml', 'shopee', 'google'].forEach((platform) => {
    try {
      UrlFetchApp.fetch(`${webAppUrl}?mode=list&plat=${platform}&page=1&limit=1&fast=1`);
    } catch (error) {
      Logger.log('Ping failed for ' + platform + ': ' + error);
    }
  });
}

/* -----------------------------------------------------------------------------*/
// Maintenance / Normalize Drive Links
/* -----------------------------------------------------------------------------*/
function runNormalize() {
  normalizeDriveLinks_forceRK_();
}

/* ---------------------------------------------------------------------------
 // Extract Drive ID
--------------------------------------------------------------------------- */
function extractDriveId_(value) {
  const text = String(value || '').trim();
  if (!text) return '';

  if (/^[\w-]{10,}$/.test(text)) return text;

  let match = text.match(/\/file\/d\/([-\w]{10,})/i);
  if (match) return match[1];

  match = text.match(/[?&]id=([-\w]{10,})/i);
  if (match) return match[1];

  match = text.match(/[?&](?:image_id)=([-\w]{10,})/i);
  if (match) return match[1];

  return '';
}

/* ---------------------------------------------------------------------------
 // Ensure Anyone Reader
--------------------------------------------------------------------------- */
function ensureAnyoneReader_(fileId) {
  try {
    Drive.Permissions.create({ type: 'anyone', role: 'reader', allowFileDiscovery: false }, fileId);
  } catch (_) {}
}

/* ---------------------------------------------------------------------------
 // Normalize Drive Links (force resourceKey)
--------------------------------------------------------------------------- */
function normalizeDriveLinks_forceRK_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const reviewsSheet = spreadsheet.getSheetByName(SHEET_REVIEWS);

  if (!reviewsSheet) {
    Logger.log('Reviews sheet not found');
    return;
  }

  const rows = reviewsSheet.getDataRange().getValues();

  if (!rows || rows.length <= 1) {
    Logger.log('No rows found');
    return;
  }

  const header = rows[0].map((headerName) => String(headerName).toLowerCase().trim());
  const urlColumnIndex = ['url', 'photo_url', 'image_url']
    .map((columnName) => header.indexOf(columnName))
    .find((index) => index >= 0);

  if (urlColumnIndex == null) {
    Logger.log('Column url/photo_url/image_url not found');
    return;
  }

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const rawUrl = String(rows[rowIndex][urlColumnIndex] || '').trim();
    if (!rawUrl) {
      skippedCount++;
      continue;
    }

    const fileId = extractDriveId_(rawUrl);
    if (!fileId) {
      skippedCount++;
      continue;
    }

    try {
      ensureAnyoneReader_(fileId);

      let resourceKey = '';

      try {
        const fileMeta = Drive.Files.get(fileId, {
          fields: 'id,resourceKey,mimeType,thumbnailLink',
        });

        resourceKey = fileMeta && fileMeta.resourceKey ? fileMeta.resourceKey : '';
      } catch (_) {}

      const normalizedUrl = `https://drive.google.com/uc?export=view&id=${fileId}${resourceKey ? `&resourcekey=${resourceKey}` : ''}`;

      if (normalizedUrl !== rawUrl) {
        reviewsSheet.getRange(rowIndex + 1, urlColumnIndex + 1).setValue(normalizedUrl);
        updatedCount++;
      } else {
        if (resourceKey && !/resourcekey=/.test(rawUrl)) {
          reviewsSheet.getRange(rowIndex + 1, urlColumnIndex + 1).setValue(normalizedUrl);
          updatedCount++;
        } else {
          skippedCount++;
        }
      }
    } catch (error) {
      errorCount++;
      Logger.log(`Failed at row ${rowIndex + 1}: ${error && error.message}`);
    }
  }

  Logger.log(
    `normalizeDriveLinks_forceRK_: updated=${updatedCount}, skipped=${skippedCount}, errors=${errorCount}`
  );
}

/* -----------------------------------------------------------------------------*/
// Image Proxy
/* -----------------------------------------------------------------------------*/
function serveImage_(params) {
  const debug = String(params.debug || '') === '1';

  let fileId = String(params.id || params.fileId || '').trim();
  const url = String(params.url || '').trim();

  const info = {
    step: 'start',
    id: fileId,
    fromUrl: !!url,
    ok: false,
    via: '',
    error: '',
  };

  /* ---------------------------------------------------------------------------
   // Resolve File ID
  --------------------------------------------------------------------------- */
  if (!fileId && url) {
    const match = url.match(/\/file\/d\/([-\w]{10,})/i) || url.match(/[?&]id=([-\w]{10,})/i);

    if (match) fileId = match[1];
  }

  if (!fileId) {
    info.error = 'missing id';
    return _text(JSON.stringify(info));
  }

  /* ---------------------------------------------------------------------------
   // Strategy 1: DriveApp
  --------------------------------------------------------------------------- */
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const dataUrl = _toDataUrl(blob);

    if (debug) {
      info.ok = true;
      info.via = 'DriveApp';
      info.mime = blob.getContentType();
      info.sample = dataUrl.slice(0, 64) + '...';

      return _text(JSON.stringify(info, null, 2), true);
    }

    return _text(dataUrl);
  } catch (error) {
    info.step = 'driveapp-fail';
    info.error = String(error);
  }

  /* ---------------------------------------------------------------------------
   // Strategy 2: Advanced Drive + UrlFetch
  --------------------------------------------------------------------------- */
  try {
    if (typeof Drive === 'undefined' || !Drive.Files || !Drive.Files.get) {
      info.step = 'adv-missing';
      info.error = 'Drive advanced not enabled';
      return _text(JSON.stringify(info));
    }

    const fileMeta = Drive.Files.get(fileId, { fields: 'id,mimeType,name' });

    const response = UrlFetchApp.fetch(
      'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media',
      {
        headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true,
      }
    );

    const statusCode = response.getResponseCode();

    if (statusCode >= 200 && statusCode < 300) {
      const mime = fileMeta.mimeType || 'application/octet-stream';
      const blob = Utilities.newBlob(response.getContent(), mime, fileMeta.name || fileId);
      const dataUrl = _toDataUrl(blob);

      if (debug) {
        info.ok = true;
        info.via = 'UrlFetch';
        info.mime = mime;
        info.sample = dataUrl.slice(0, 64) + '...';

        return _text(JSON.stringify(info, null, 2), true);
      }

      return _text(dataUrl);
    }

    info.step = 'urlfetch-fail';
    info.code = statusCode;
    info.error = response.getContentText().slice(0, 300);

    return _text(JSON.stringify(info));
  } catch (error) {
    info.step = 'adv-fail';
    info.error = String(error);

    return _text(JSON.stringify(info));
  }
}

/* ---------------------------------------------------------------------------
 // Blob → Data URL
--------------------------------------------------------------------------- */
function _toDataUrl(blob) {
  const mime = blob.getContentType() || 'application/octet-stream';
  const base64 = Utilities.base64Encode(blob.getBytes());

  return 'data:' + mime + ';base64,' + base64;
}

/* ---------------------------------------------------------------------------
 // Text Output
--------------------------------------------------------------------------- */
function _text(content, isJson) {
  return ContentService.createTextOutput(content).setMimeType(
    isJson ? ContentService.MimeType.JSON : ContentService.MimeType.TEXT
  );
}

/* ---------------------------------------------------------------------------
 // Normalize Date
--------------------------------------------------------------------------- */
function normalizeDate_(value) {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === 'number' && isFinite(value)) {
    const ms = Math.round((value - 25569) * 86400 * 1000);
    return new Date(ms);
  }

  const stringValue = String(value).trim();

  const match = stringValue.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (match) {
    const dd = Number(match[1]);
    const mm = Number(match[2]);
    const yyyy = Number(match[3]);

    const hh = Number(match[4] || 0);
    const min = Number(match[5] || 0);
    const ss = Number(match[6] || 0);

    return new Date(yyyy, mm - 1, dd, hh, min, ss);
  }

  return null;
}

/* -----------------------------------------------------------------------------*/
// Debug + Image Fallback Handler
/* -----------------------------------------------------------------------------*/

/* ---------------------------------------------------------------------------
 // Debug JSON or 1x1 Fallback Image
--------------------------------------------------------------------------- */
function debugOrFallbackImage_(debug, info) {
  if (debug) {
    return ContentService.createTextOutput(JSON.stringify(info, null, 2)).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  // 🔸 Return 1x1 PNG to prevent <img> from breaking
  const fallbackPng = Utilities.base64Decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  );

  return Utilities.newBlob(fallbackPng, 'image/png', 'fallback.png');
}
