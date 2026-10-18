import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_EVENT_ALBUM_URL, eventAlbumProvider, resolveEventAlbumUrl } from '../src/lib/eventAlbum.ts';

test('usa el álbum de la fiesta aunque la configuración anterior haya quedado vacía', () => {
  assert.equal(resolveEventAlbumUrl(undefined), DEFAULT_EVENT_ALBUM_URL);
  assert.equal(resolveEventAlbumUrl('  '), DEFAULT_EVENT_ALBUM_URL);
  assert.equal(eventAlbumProvider(DEFAULT_EVENT_ALBUM_URL), 'Google Fotos');
});

test('respeta el enlace editado por el organizador', () => {
  const album = 'https://drive.google.com/drive/folders/otra-carpeta';
  assert.equal(resolveEventAlbumUrl(` ${album} `), album);
  assert.equal(eventAlbumProvider(album), 'Google Drive');
});

test('no publica un enlace inválido ni un protocolo ejecutable', () => {
  for (const value of ['javascript:alert(1)', 'no es un enlace', 'http://example.com']) {
    assert.equal(resolveEventAlbumUrl(value), '');
  }
});
