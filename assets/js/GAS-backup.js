/** ================== CONFIG ================== **/
const SPREADSHEET_ID = '1z2rfB5xnt6zbt3MAPZ6m99c8_4PmX_6rZU9qHAeRwMc';
const SHEET_MURAL = 'Mural';
const SHEET_RESP = 'Respostas';

/** ================== GET: lista avaliações ================== **/
function doGet(e) {
  const p = e?.parameter || {};
  const modeOrAction = String(p.mode || p.action || 'list').toLowerCase();

  // NOVO: rota de imagem para proxy
  if (modeOrAction === 'img') {
    return serveImage_(p);
  }

  if (modeOrAction !== 'list' && modeOrAction !== 'meta') {
    return json({ error: 'mode/action inválido' });
  }

  const plat = String(p.plat || '').toLowerCase(); // scs|shopee|ml|google|''
  const page = Math.max(1, parseInt(p.page || '1', 10));
  const limit = Math.max(1, Math.min(50, parseInt(p.limit || '10', 10)));
  const fast = String(p.fast || '0') === '1';

  // ✅ bypass do cache (nocache=1) — usado no refresh do committed
  const nocache =
    String(p.nocache || '') === '1' || String(p.force || '') === '1' || String(p.cb || '') !== '';

  // ⚡ cache 60s
  const cache = CacheService.getScriptCache();
  const cacheKey =
    modeOrAction === 'meta'
      ? `mural:meta:v4:${plat || 'all'}`
      : `mural:v4:${plat || 'all'}:p${page}:l${limit}:f${fast ? 1 : 0}`;
  if (!nocache) {
    const hit = cache.get(cacheKey);
    if (hit) return json(JSON.parse(hit));
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_MURAL);
  if (!sh) return json({ v: 4, items: [], hasMore: false, total: fast ? undefined : 0 });

  const values = sh.getDataRange().getValues(); // 1x leitura
  if (!values || values.length <= 1)
    return json({ v: 4, items: [], hasMore: false, total: fast ? undefined : 0 });

  const head = values[0].map((h) => String(h).toLowerCase());
  const col = (name) => head.indexOf(name);
  const cPlat = col('plataforma');
  const cAprov = col('aprovado');
  const cData = col('data');
  const cAutor = col('autor');
  const cTexto = col('texto');
  const cStars = col('estrelas');
  const cUrl = col('url');
  const wantPlat = plat && plat !== 'all' ? plat : null;

  // ============================================================
  // ✅ PREMIUM: META SUMMARY (total, avg, buckets) — sem paginação
  // ============================================================
  if (modeOrAction === 'meta') {
    const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalMeta = 0;
    let sumMeta = 0;

    for (let i = values.length - 1; i >= 1; i--) {
      const row = values[i];

      const aprovado = row[cAprov] === true || String(row[cAprov]).toUpperCase() === 'TRUE';
      if (!aprovado) continue;

      const plataforma = String(row[cPlat] || '').toLowerCase();
      if (wantPlat && plataforma !== wantPlat) continue;

      let star = Number(row[cStars] || 0);
      if (!Number.isFinite(star)) star = 0;

      star = Math.round(star);
      if (star < 1) star = 1;
      if (star > 5) star = 5;

      buckets[star] += 1;
      totalMeta += 1;
      sumMeta += star;
    }

    const avgMeta = totalMeta > 0 ? sumMeta / totalMeta : 0;

    const payload = { v: 4, avg: avgMeta, total: totalMeta, buckets };

    if (!nocache) {
      cache.put(cacheKey, JSON.stringify(payload), 60);
    }

    return json(payload);
  }

  const skip = (page - 1) * limit;
  let skipped = 0;
  const items = [];
  let total = 0;
  let hasMore = false;

  // percorre do fim pro começo (mais recentes primeiro)
  for (let i = values.length - 1; i >= 1; i--) {
    const row = values[i];
    const aprovado = row[cAprov] === true || String(row[cAprov]).toUpperCase() === 'TRUE';
    if (!aprovado) continue;
    const plataforma = String(row[cPlat] || '').toLowerCase();
    if (wantPlat && plataforma !== wantPlat) continue;

    if (!fast) total++; // conta total real apenas no modo completo

    if (skipped < skip) {
      skipped++;
      continue;
    }

    if (items.length < limit) {
      items.push({
        plataforma,
        estrelas: Number(row[cStars] || 0),
        data: toISO(parseDate(row[cData])),
        autor: String(row[cAutor] || '').trim(),
        texto: String(row[cTexto] || '').trim(),
        url: String(row[cUrl] || '').trim(),
      });
    } else {
      // já coletou a página; se for fast, podemos sair com hasMore=true
      if (fast) {
        hasMore = true;
        break;
      }
      // se não for fast, seguimos até o fim pra consolidar 'total'
    }
  }

  if (!fast) {
    hasMore = page * limit < total;
  }

  const payload = { v: 4, items, hasMore, total: fast ? undefined : total };
  if (!nocache) {
    cache.put(cacheKey, JSON.stringify(payload), 60);
  }
  return json(payload);
}

// cria a aba se não existir e escreve o cabeçalho se estiver vazia
function ensureSheet_(ss, name, header) {
  // Normaliza o nome da aba (remove espaços extras)
  const cleanName = String(name || '').trim();
  const allSheets = ss.getSheets();
  const found = allSheets.find(
    (sh) => sh.getName().trim().toLowerCase() === cleanName.toLowerCase()
  );

  let sh = found || null;

  if (!sh) {
    // Se realmente não existe, cria a aba
    sh = ss.insertSheet(cleanName);
    sh.appendRow(header);
  } else if (sh.getLastRow() === 0) {
    // Se existe mas está vazia, cria o cabeçalho
    sh.appendRow(header);
  }

  return sh;
}

/** ================== POST: grava feedback do site (SCS) ================== **/
function doPost(e) {
  try {
    const p = e?.parameter || {};
    const action = String(p.action || '').toLowerCase();

    // Roteamento por action (compatível com teu FeedbackAPI)
    if (action === 'uploadphoto') {
      return uploadPhoto_(e); // devolve { ok, photo_id, photo_url, ... }
    }
    if (action === 'createfeedback') {
      return createFeedback_(e); // devolve { ok, item }
    }

    // Fallback: comportamento atual (sem action) — mantém compatibilidade
    return createFeedback_(e);
  } catch (err) {
    return json({ ok: false, error: String((err && err.message) || err) });
  }
}

// Cria feedback (escreve em Respostas + Mural) e devolve "item" pro Hero SCS
function createFeedback_(e) {
  const body = JSON.parse(e?.postData?.contents || '{}');

  const rating = Number(body.rating || 0);
  const nome = String(body.nome || '').trim();
  const comentario = String(body.comentario || '').trim();
  const pedido = String(body.pedido || '').trim();
  const contact = String(body.contact || body.contato || '').trim();
  const origem = String(body.origem || 'scs');
  const tsClient = body.timestamp_cliente ? new Date(body.timestamp_cliente) : new Date();
  const tsServer = new Date();

  if (!(rating >= 1 && rating <= 5)) return json({ ok: false, error: 'Rating inválido.' });
  if (!comentario) return json({ ok: false, error: 'Comentário vazio.' });

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const shResp = ensureSheet_(ss, SHEET_RESP, [
    'timestamp_server',
    'rating',
    'nome',
    'comentario',
    'pedido',
    'contato',
    'origem',
    'timestamp_cliente',
  ]);
  const shMural = ensureSheet_(ss, SHEET_MURAL, [
    'plataforma',
    'estrelas',
    'data',
    'autor',
    'texto',
    'url',
    'aprovado',
    'destaque',
  ]);

  shResp.appendRow([tsServer, rating, nome, comentario, pedido, contato, origem, tsClient]);

  // ✅ usa público se vier, senão viewer, senão vazio
  const photoUrl = String(body.photo_public_url || body.photo_url || '').trim();

  shMural.appendRow(['scs', rating, tsServer, nome, comentario, photoUrl, true, false]);

  const tz = Session.getScriptTimeZone();
  const dataBr = Utilities.formatDate(tsServer, tz, 'dd/MM/yyyy HH:mm');

  const item = {
    rating,
    nome,
    comentario,
    data_iso: tsServer.toISOString(),
    data_br: dataBr,
    photo_url: photoUrl || '',
  };

  return json({ ok: true, item });
}

// Salva a foto (base64) em uma pasta no Drive e retorna a URL
function uploadPhoto_(e) {
  try {
    const body = JSON.parse(e?.postData?.contents || '{}');
    const base64 = String(body.base64 || '');
    let filename = String(body.filename || 'scs_' + Date.now() + '.webp');
    const mime = String(body.mime || 'image/webp');
    const original = String(body.original_name || '');

    if (!base64) return json({ ok: false, error: 'base64 ausente.' });

    // garante extensão .webp se o mime for webp
    if (/image\/webp/i.test(mime) && !/\.webp$/i.test(filename)) {
      filename = filename.replace(/\.\w+$/g, '') + '.webp';
    }

    const blob = dataUrlToBlob_(base64, mime, filename);
    const folder = getOrCreateFolder_('SCS-Feedback-Fotos');
    const file = folder.createFile(blob).setName(filename);

    // público com link (pode precisar de permissão do workspace)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const photo_id = file.getId();
    const viewerUrl = file.getUrl(); // pode conter ?resourcekey=0-xxxx
    const m = viewerUrl.match(/[?&]resourcekey=([^&]+)/);
    const rk = m ? m[1] : '';

    // link direto para <img>
    const photo_public_url = `https://drive.google.com/uc?export=view&id=${photo_id}${rk ? `&resourcekey=${rk}` : ''}`;

    return json({
      ok: true,
      photo_id,
      photo_url: viewerUrl, // viewer
      photo_public_url, // direto pra <img>
      filename,
      original_name: original,
      mime,
    });
  } catch (err) {
    return json({ ok: false, error: String((err && err.message) || err) });
  }
}

/** ================== helpers ================== **/
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function indexer(header) {
  const map = {};
  header.forEach((h, i) => (map[String(h).toLowerCase()] = i));
  // garantias de nomes
  ['plataforma', 'estrelas', 'data', 'autor', 'texto', 'url', 'aprovado', 'destaque'].forEach(
    (k) => {
      if (map[k] === undefined) map[k] = -1;
    }
  );
  return map;
}

function mapRow(row, idx, plataforma) {
  return {
    plataforma: plataforma,
    estrelas: Number(row[idx.estrelas] || 0),
    data: toISO(parseDate(row[idx.data])),
    autor: String(row[idx.autor] || '').trim(),
    texto: String(row[idx.texto] || '').trim(),
    url: String(row[idx.url] || '').trim(),
  };
}

function parseDate(v) {
  if (v instanceof Date) return v;
  const s = String(v || '').trim();
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // DD/MM/YYYY
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); // YYYY-MM-DD
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

function toISO(d) {
  if (!(d instanceof Date) || isNaN(d)) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate() + 0).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function dataUrlToBlob_(base64, mime, name) {
  // Aceita dataURL completo (data:image/webp;base64,...) ou só o payload base64
  const cleaned = base64.indexOf('base64,') >= 0 ? base64.split('base64,')[1] : base64;
  const bytes = Utilities.base64Decode(cleaned);
  const blob = Utilities.newBlob(bytes, mime || 'application/octet-stream', name || 'upload.bin');
  return blob;
}
function getOrCreateFolder_(name) {
  const iter = DriveApp.getFoldersByName(name);
  if (iter.hasNext()) return iter.next();
  return DriveApp.createFolder(name);
}

/** ================== MANUTENÇÃO / PING AUTOMÁTICO ================== **/
function ping() {
  const url =
    'https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec';
  ['scs', 'ml', 'shopee', 'google'].forEach((p) => {
    try {
      UrlFetchApp.fetch(`${url}?mode=list&plat=${p}&page=1&limit=1&fast=1`);
    } catch (err) {
      Logger.log('Ping falhou para ' + p + ': ' + err);
    }
  });
}

function runNormalize() {
  normalizeDriveLinks_forceRK_();
}
function extractDriveId_(s) {
  const t = String(s || '').trim();
  if (!t) return '';
  if (/^[\w-]{10,}$/.test(t)) return t;
  let m = t.match(/\/file\/d\/([-\w]{10,})/i);
  if (m) return m[1];
  m = t.match(/[?&]id=([-\w]{10,})/i);
  if (m) return m[1];
  m = t.match(/[?&](?:image_id)=([-\w]{10,})/i);
  if (m) return m[1];
  return '';
}

function ensureAnyoneReader_(fileId) {
  try {
    Drive.Permissions.create({ type: 'anyone', role: 'reader', allowFileDiscovery: false }, fileId);
  } catch (_) {}
}

// === força url canônica com resourcekey + garante público ===
function normalizeDriveLinks_forceRK_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_MURAL);
  if (!sh) {
    Logger.log('Aba Mural não encontrada');
    return;
  }

  const values = sh.getDataRange().getValues();
  if (!values || values.length <= 1) {
    Logger.log('Sem linhas');
    return;
  }

  const head = values[0].map((h) => String(h).toLowerCase().trim());
  const cUrl = ['url', 'photo_url', 'image_url'].map((n) => head.indexOf(n)).find((i) => i >= 0);
  if (cUrl == null) {
    Logger.log('Coluna url/photo_url/image_url não encontrada');
    return;
  }

  let ok = 0,
    skip = 0,
    err = 0;

  for (let i = 1; i < values.length; i++) {
    const raw = String(values[i][cUrl] || '').trim();
    if (!raw) {
      skip++;
      continue;
    }

    const id = extractDriveId_(raw);
    if (!id) {
      skip++;
      continue;
    }

    try {
      // 1) garante "anyone reader"
      ensureAnyoneReader_(id);

      // 2) tenta obter resourceKey via Drive API
      let rk = '';
      try {
        const meta = Drive.Files.get(id, { fields: 'id,resourceKey,mimeType,thumbnailLink' });
        rk = meta && meta.resourceKey ? meta.resourceKey : '';
      } catch (_) {}

      // 3) monta a URL final com RK (se houver)
      const newUrl = `https://drive.google.com/uc?export=view&id=${id}${rk ? `&resourcekey=${rk}` : ''}`;

      if (newUrl !== raw) {
        sh.getRange(i + 1, cUrl + 1).setValue(newUrl);
        ok++;
      } else {
        // já igual; ainda assim, se não tinha rk e meta trouxe rk, atualiza
        if (rk && !/resourcekey=/.test(raw)) {
          sh.getRange(i + 1, cUrl + 1).setValue(newUrl);
          ok++;
        } else {
          skip++;
        }
      }
    } catch (e) {
      err++;
      Logger.log(`Falha L${i + 1}: ${e && e.message}`);
    }
  }

  Logger.log(`normalizeDriveLinks_forceRK_: ok=${ok}, skip=${skip}, err=${err}`);
}

// Helper imagem
// === PROXY DE IMAGEM: GET .../exec?action=img&id=<FILE_ID> ===
/** Proxy de imagem do Drive: /exec?action=img&id=<FILE_ID>[&v=123] */
function serveImage_(p) {
  var id = String(p.id || p.fileId || '').trim();
  var url = String(p.url || '').trim();
  var debug = String(p.debug || '') === '1';
  var info = { step: 'start', id: id, fromUrl: !!url, ok: false, via: '', error: '' };

  if (!id && url) {
    var m = url.match(/\/file\/d\/([-\w]{10,})/i) || url.match(/[?&]id=([-\w]{10,})/i);
    if (m) id = m[1];
  }
  if (!id) {
    info.error = 'missing id';
    return _text(JSON.stringify(info));
  }

  // 1) DriveApp
  try {
    var file = DriveApp.getFileById(id);
    var blob = file.getBlob(); // tem mime correto
    var dataUrl = _toDataUrl(blob);

    if (debug) {
      info.ok = true;
      info.via = 'DriveApp';
      info.mime = blob.getContentType();
      info.sample = dataUrl.slice(0, 64) + '...';
      return _text(JSON.stringify(info, null, 2), true);
    }

    // ✅ devolve a dataURL como TEXTO
    return _text(dataUrl);
  } catch (e1) {
    info.step = 'driveapp-fail';
    info.error = String(e1);
  }

  // 2) Plano B – Drive Avançado + UrlFetch
  try {
    if (typeof Drive === 'undefined' || !Drive.Files || !Drive.Files.get) {
      info.step = 'adv-missing';
      info.error = 'Drive advanced not enabled';
      return _text(JSON.stringify(info));
    }
    var meta = Drive.Files.get(id, { fields: 'id,mimeType,name' });
    var resp = UrlFetchApp.fetch(
      'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '?alt=media',
      {
        headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true,
      }
    );
    var code = resp.getResponseCode();
    if (code >= 200 && code < 300) {
      var mime = meta.mimeType || 'application/octet-stream';
      var blob = Utilities.newBlob(resp.getContent(), mime, meta.name || id);
      var dataUrl = _toDataUrl(blob);

      if (debug) {
        info.ok = true;
        info.via = 'UrlFetch';
        info.mime = mime;
        info.sample = dataUrl.slice(0, 64) + '...';
        return _text(JSON.stringify(info, null, 2), true);
      }

      return _text(dataUrl);
    } else {
      info.step = 'urlfetch-fail';
      info.code = code;
      info.error = resp.getContentText().slice(0, 300);
      return _text(JSON.stringify(info));
    }
  } catch (e2) {
    info.step = 'adv-fail';
    info.error = String(e2);
    return _text(JSON.stringify(info));
  }
}

// Helpers
function _toDataUrl(blob) {
  var mime = blob.getContentType() || 'application/octet-stream';
  var b64 = Utilities.base64Encode(blob.getBytes());
  return 'data:' + mime + ';base64,' + b64;
}
function _text(s, isJson) {
  return ContentService.createTextOutput(s).setMimeType(
    isJson ? ContentService.MimeType.JSON : ContentService.MimeType.TEXT
  );
}

function _debugOr1x1_(debug, info) {
  if (debug) {
    return ContentService.createTextOutput(JSON.stringify(info, null, 2)).setMimeType(
      ContentService.MimeType.JSON
    );
  }
  // 🔸 Retorna PNG 1x1 para o <img> não quebrar
  var png = Utilities.base64Decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  );
  return Utilities.newBlob(png, 'image/png', 'fallback.png');
}
