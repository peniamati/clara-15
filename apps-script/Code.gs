// Source for the deployed Clara Drive web app. Publish a new deployment after editing.
const FOLDER_ID = '1vD5IpM96K5bMCfJbVpTmEMS9WwE1Y4sH';
const FIREBASE_PROJECT_ID = 'foton-8d1e5';
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function jsonpOutput(callback, data) {
  const safeCallback = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(callback) ? callback : 'callback';
  return ContentService.createTextOutput(safeCallback + '(' + JSON.stringify(data) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = String(params.callback || 'callback');
  if (params.action === 'deleteStatus') {
    const operationId = String(params.operationId || '');
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(operationId)) return jsonpOutput(callback, { ok: false, error: 'Operación inválida' });
    const value = CacheService.getScriptCache().get('photo-delete-' + operationId);
    return jsonpOutput(callback, value ? JSON.parse(value) : { ok: true, pending: true });
  }
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    const images = [];
    while (files.hasNext() && images.length < 500) {
      const file = files.next();
      const mimeType = file.getMimeType();
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) continue;
      images.push({
        id: file.getId(), name: file.getName(), mimeType: mimeType,
        imageUrl: 'https://lh3.googleusercontent.com/d/' + file.getId() + '=w2400',
        thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200',
        createdAt: file.getDateCreated().toISOString()
      });
    }
    images.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return jsonpOutput(callback, { ok: true, images: images });
  } catch (error) {
    return jsonpOutput(callback, { ok: false, error: String(error) });
  }
}

function verifyOrganizer(params) {
  const idToken = String(params.idToken || '');
  const apiKey = String(params.apiKey || '');
  if (!idToken || !apiKey || idToken.length > 5000 || apiKey.length > 200) throw new Error('Iniciá sesión como organizador para borrar fotos.');

  const lookup = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(apiKey), {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ idToken: idToken }), muteHttpExceptions: true
  });
  if (lookup.getResponseCode() !== 200) throw new Error('La sesión expiró. Volvé a iniciar sesión.');
  const user = (JSON.parse(lookup.getContentText()).users || [])[0];
  const claims = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(idToken.split('.')[1])).getDataAsString());
  if (!user || !user.emailVerified || user.disabled || !user.email ||
      claims.aud !== FIREBASE_PROJECT_ID ||
      claims.iss !== 'https://securetoken.google.com/' + FIREBASE_PROJECT_ID ||
      claims.sub !== user.localId) throw new Error('La cuenta no tiene acceso de organizador.');

  const configResponse = UrlFetchApp.fetch(
    'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT_ID + '/databases/(default)/documents/settings/config?key=' + encodeURIComponent(apiKey),
    { muteHttpExceptions: true }
  );
  if (configResponse.getResponseCode() !== 200) throw new Error('No se pudieron comprobar los permisos del organizador.');
  const fields = JSON.parse(configResponse.getContentText()).fields || {};
  const admins = (((fields.adminEmails || {}).arrayValue || {}).values || [])
    .map(value => String(value.stringValue || '').toLowerCase());
  if (!admins.includes(String(user.email).toLowerCase())) throw new Error('La cuenta no tiene acceso de organizador.');
}

function removePhotoFromFolder(params) {
  verifyOrganizer(params);
  const fileId = String(params.fileId || '');
  if (!/^[a-zA-Z0-9_-]{20,100}$/.test(fileId)) throw new Error('La foto no tiene un identificador válido.');
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const file = DriveApp.getFileById(fileId);
  if (!ALLOWED_IMAGE_TYPES.includes(file.getMimeType())) throw new Error('El archivo no es una foto admitida.');
  const parents = file.getParents();
  let insideFolder = false;
  while (parents.hasNext()) if (parents.next().getId() === FOLDER_ID) insideFolder = true;
  if (!insideFolder) throw new Error('La foto ya no está en la carpeta de Clara.');
  // Remove only this folder association; never delete another person's original file.
  folder.removeFile(file);
  const remainingParents = file.getParents();
  while (remainingParents.hasNext()) {
    if (remainingParents.next().getId() === FOLDER_ID) throw new Error('Drive no confirmó que la foto saliera de la carpeta.');
  }
}

function sendOrganizerNotification(params) {
  const recipient = String(params.adminEmail || 'antonella.brizuela18@gmail.com');
  if (params.type === 'rsvp') {
    const subject = 'Nueva confirmación de asistencia: ' + String(params.guest || 'Invitado');
    const body = ['Nueva respuesta para los 15 de Clara:', '', 'Invitado: ' + String(params.guest || ''), 'Estado: ' + String(params.status || ''), 'Teléfono: ' + String(params.phone || ''), 'Email: ' + String(params.email || ''), 'Notas: ' + String(params.notes || '')].join('\n');
    MailApp.sendEmail(recipient, subject, body);
  } else if (params.type === 'song') {
    const subject = 'Nueva canción propuesta: ' + String(params.title || 'Sin título');
    const body = ['Nueva canción propuesta:', '', 'Tema: ' + String(params.title || ''), 'Artista: ' + String(params.artist || ''), 'Pedida por: ' + String(params.submittedBy || ''), 'Momento: ' + String(params.note || ''), 'Spotify: ' + String(params.spotifyUrl || '')].join('\n');
    MailApp.sendEmail(recipient, subject, body);
  } else {
    throw new Error('Tipo de notificación no válido');
  }
}

function doPost(e) {
  const params = (e && e.parameter) || {};
  if (params.action === 'removePhoto') {
    const operationId = String(params.operationId || '');
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(operationId)) return jsonOutput({ ok: false, error: 'Operación inválida' });
    let result;
    try { removePhotoFromFolder(params); result = { ok: true, removed: true }; }
    catch (error) { result = { ok: false, error: String(error) }; }
    CacheService.getScriptCache().put('photo-delete-' + operationId, JSON.stringify(result), 300);
    return jsonOutput(result);
  }
  try {
    if (params.action === 'notify') {
      sendOrganizerNotification(params);
      return jsonOutput({ ok: true });
    }
    const mimeType = String(params.mimeType || '').toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) throw new Error('Formato de imagen no permitido');
    const raw = String(params.base64 || '').replace(/^data:[^;]+;base64,/, '');
    const bytes = Utilities.base64Decode(raw);
    if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) throw new Error('La imagen supera el límite de 6 MB');
    const safeName = String(params.fileName || ('foto-' + Date.now()))
      .replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    const file = DriveApp.getFolderById(FOLDER_ID)
      .createFile(Utilities.newBlob(bytes, mimeType, safeName));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return jsonOutput({ ok: true, image: {
      id: file.getId(), name: file.getName(), mimeType: file.getMimeType(),
      imageUrl: 'https://lh3.googleusercontent.com/d/' + file.getId() + '=w2400',
      createdAt: file.getDateCreated().toISOString()
    }});
  } catch (error) {
    return jsonOutput({ ok: false, error: String(error) });
  }
}

function autorizarAvisosPorCorreo() {
  MailApp.getRemainingDailyQuota();
}
