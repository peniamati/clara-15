import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGooglePhotosAlbum } from '../scripts/google-photos.mjs';

const photo = (id, url = `https://lh3.googleusercontent.com/pw/${id}`) => [id, [url, 800, 1200], 1792281905899];
const page = (rows, token = '') => `<script>AF_initDataCallback({key: 'ds:1', hash: '2', data:${JSON.stringify([null, rows, token, ['album-id', 'Fiesta']])}, sideChannel: {}});</script>`;

test('importa solo fotos del álbum, sin avatares ni duplicados', () => {
  const result = parseGooglePhotosAlbum(page([photo('one'), photo('one'), photo('two'), photo('invalid', 'https://example.com/avatar')]), 'https://photos.app.goo.gl/test');
  assert.equal(result.photos.length, 2);
  assert.equal(result.photos[0].thumbnailUrl, 'https://lh3.googleusercontent.com/pw/one=w640');
  assert.equal(result.photos[0].photoSource, 'google-photos');
  assert.equal(result.title, 'Fiesta');
});

test('rechaza una página privada o incompleta antes de sobrescribir la galería', () => {
  assert.throws(() => parseGooglePhotosAlbum('<html>Sign in</html>', 'album'), /No public album photos/);
  assert.throws(() => parseGooglePhotosAlbum(page([photo('one')], 'next-page-token'), 'album'), /incomplete import/);
});
