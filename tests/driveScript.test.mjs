import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8');
const folderId = '1vD5IpM96K5bMCfJbVpTmEMS9WwE1Y4sH';
const fileId = 'abcdefghijklmnopqrstuvwxyz123456';
const operationId = '12345678-1234-1234-1234-123456789abc';

function scriptHarness({ emailVerified = true, insideFolder = true } = {}) {
  let removed = false;
  let driveTouched = false;
  const claims = { aud: 'foton-8d1e5', iss: 'https://securetoken.google.com/foton-8d1e5', sub: 'organizer-uid' };
  const token = `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;
  const file = {
    getMimeType: () => 'image/jpeg',
    getParents: () => {
      const parents = insideFolder && !removed ? [{ getId: () => folderId }] : [];
      let index = 0;
      return { hasNext: () => index < parents.length, next: () => parents[index++] };
    },
  };
  const folder = {};
  const sandbox = {
    ContentService: { MimeType: { JSON: 'JSON', JAVASCRIPT: 'JAVASCRIPT' }, createTextOutput: text => ({ text, setMimeType() { return this; } }) },
    CacheService: { getScriptCache: () => ({ put() {}, get() { return null; } }) },
    UrlFetchApp: { fetch: (url, options) => {
      if (url.includes('/drive/v3/files/')) removed = options.method === 'patch';
      return ({
      getResponseCode: () => 200,
      getContentText: () => url.includes('accounts:lookup')
        ? JSON.stringify({ users: [{ localId: 'organizer-uid', email: 'admin@example.com', emailVerified }] })
        : url.includes('/drive/v3/files/') ? JSON.stringify({ id: fileId, parents: [] })
        : JSON.stringify({ fields: { adminEmails: { arrayValue: { values: [{ stringValue: 'admin@example.com' }] } } } }),
      });
    } },
    ScriptApp: { getOAuthToken: () => 'test-token' },
    Utilities: {
      base64DecodeWebSafe: value => Buffer.from(value, 'base64url'),
      newBlob: bytes => ({ getDataAsString: () => bytes.toString() }),
    },
    DriveApp: {
      getFolderById: () => { driveTouched = true; return folder; },
      getFileById: () => { driveTouched = true; return file; },
    },
  };
  vm.runInNewContext(source, sandbox);
  const request = { parameter: { action: 'removePhoto', operationId, fileId, idToken: token, apiKey: 'public-key' } };
  return { sandbox, request, get removed() { return removed; }, get driveTouched() { return driveTouched; } };
}

test('solo un organizador verificado puede quitar fotos de Drive', () => {
  const harness = scriptHarness({ emailVerified: false });
  const response = JSON.parse(harness.sandbox.doPost(harness.request).text);
  assert.equal(response.ok, false);
  assert.equal(harness.driveTouched, false);
});

test('una eliminación ya completada puede reintentarse para limpiar el registro web', () => {
  const harness = scriptHarness({ insideFolder: false });
  const response = JSON.parse(harness.sandbox.doPost(harness.request).text);
  assert.deepEqual(response, { ok: true, removed: true, alreadyAbsent: true });
  assert.equal(harness.removed, false);
});

test('quita de la carpeta una foto autorizada sin eliminar el archivo original', () => {
  const harness = scriptHarness();
  const response = JSON.parse(harness.sandbox.doPost(harness.request).text);
  assert.deepEqual(response, { ok: true, removed: true, alreadyAbsent: false });
  assert.equal(harness.removed, true);
});

test('informa el estado de una subida sin esperar una nueva lista de Drive', () => {
  const cache = new Map();
  let changedSharing = false;
  const image = { id: fileId, name: 'prueba.jpg', mimeType: 'image/jpeg' };
  const sandbox = {
    CacheService: { getScriptCache: () => ({ get: key => cache.get(key) || null, put: (key, value) => cache.set(key, value) }) },
    ContentService: { MimeType: { JSON: 'JSON', JAVASCRIPT: 'JAVASCRIPT' }, createTextOutput: text => ({ text, setMimeType() { return this; } }) },
    Utilities: { base64Decode: () => [1, 2, 3], newBlob: () => ({}) },
    DriveApp: { Access: { ANYONE_WITH_LINK: 'link' }, Permission: { VIEW: 'view' }, getFolderById: () => ({ createFile: () => ({
      getId: () => image.id, getName: () => image.name, getMimeType: () => image.mimeType,
      getDateCreated: () => new Date('2026-09-23T12:00:00Z'), setSharing() { changedSharing = true; },
    }) }) },
  };
  vm.runInNewContext(source, sandbox);
  const post = sandbox.doPost({ parameter: { operationId, mimeType: 'image/jpeg', fileName: image.name, base64: 'data:image/jpeg;base64,AQID' } });
  assert.equal(JSON.parse(post.text).ok, true);
  const get = sandbox.doGet({ parameter: { action: 'uploadStatus', operationId, callback: 'cb' } });
  assert.match(get.text, /^cb\(\{"ok":true,"image":/);
  assert.match(get.text, /prueba\.jpg/);
  assert.equal(changedSharing, false);
});
