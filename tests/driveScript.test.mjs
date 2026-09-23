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
  const folder = { removeFile: () => { removed = true; } };
  const sandbox = {
    ContentService: { MimeType: { JSON: 'JSON', JAVASCRIPT: 'JAVASCRIPT' }, createTextOutput: text => ({ text, setMimeType() { return this; } }) },
    CacheService: { getScriptCache: () => ({ put() {}, get() { return null; } }) },
    UrlFetchApp: { fetch: url => ({
      getResponseCode: () => 200,
      getContentText: () => url.includes('accounts:lookup')
        ? JSON.stringify({ users: [{ localId: 'organizer-uid', email: 'admin@example.com', emailVerified }] })
        : JSON.stringify({ fields: { adminEmails: { arrayValue: { values: [{ stringValue: 'admin@example.com' }] } } } }),
    }) },
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

test('no quita archivos ajenos a la carpeta de Clara', () => {
  const harness = scriptHarness({ insideFolder: false });
  const response = JSON.parse(harness.sandbox.doPost(harness.request).text);
  assert.equal(response.ok, false);
  assert.equal(harness.removed, false);
});

test('quita de la carpeta una foto autorizada sin eliminar el archivo original', () => {
  const harness = scriptHarness();
  const response = JSON.parse(harness.sandbox.doPost(harness.request).text);
  assert.deepEqual(response, { ok: true, removed: true });
  assert.equal(harness.removed, true);
});
