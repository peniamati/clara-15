import test from 'node:test';
import assert from 'node:assert/strict';
import {
  describePersistenceError,
  isSupportedPhotoSource,
  validatePhotoSource,
} from '../src/lib/photoUpload.ts';

test('acepta imágenes locales y enlaces directos generados por Google Drive', () => {
  assert.equal(isSupportedPhotoSource('data:image/webp;base64,abc'), true);
  assert.equal(isSupportedPhotoSource('https://lh3.googleusercontent.com/d/abc_DEF-123=w1600'), true);
});

test('rechaza URLs externas arbitrarias y datos que no sean imágenes', () => {
  assert.equal(isSupportedPhotoSource('https://example.com/photo.jpg'), false);
  assert.equal(isSupportedPhotoSource('data:text/html;base64,abc'), false);
});

test('impide superar el margen seguro del documento de Firestore', () => {
  assert.match(validatePhotoSource(`data:image/jpeg;base64,${'a'.repeat(950_000)}`), /tamaño permitido/);
});

test('explica los errores de permisos y red con acciones concretas', () => {
  assert.match(describePersistenceError({ code: 'firestore/permission-denied' }), /reglas/);
  assert.match(describePersistenceError({ code: 'firestore/unavailable' }), /conexión/);
});
