import test from 'node:test';
import assert from 'node:assert/strict';
import { listDriveImages } from '../src/lib/driveUtils.ts';

function mockBrowser() {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const timers = new Map();
  let nextTimer = 1;
  let script;
  globalThis.window = {
    setTimeout(callback) {
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  };
  globalThis.document = {
    createElement(type) {
      assert.equal(type, 'script');
      script = { remove() { this.removed = true; } };
      return script;
    },
    body: { appendChild() {} },
  };
  return {
    get script() { return script; },
    timers,
    callbackName() { return new URL(script.src).searchParams.get('callback'); },
    restore() {
      globalThis.window = previousWindow;
      globalThis.document = previousDocument;
    },
  };
}

test('Drive resuelve y limpia el callback al terminar de cargar el script', async () => {
  const browser = mockBrowser();
  try {
    const result = listDriveImages();
    const callback = browser.callbackName();
    const images = [{ id: 'photo-1', name: 'foto.png' }];
    globalThis.window[callback]({ ok: true, images });
    browser.script.onload();
    assert.deepEqual(await result, images);
    assert.equal(globalThis.window[callback], undefined);
  } finally { browser.restore(); }
});

test('un timeout conserva el callback para respuestas tardías sin error de consola', async () => {
  const browser = mockBrowser();
  try {
    const result = listDriveImages();
    const callback = browser.callbackName();
    const timeout = [...browser.timers.values()][0];
    timeout();
    await assert.rejects(result, /tardó demasiado/);
    assert.equal(typeof globalThis.window[callback], 'function');
    assert.doesNotThrow(() => globalThis.window[callback]({ ok: true, images: [] }));
    browser.script.onload();
    assert.equal(globalThis.window[callback], undefined);
  } finally { browser.restore(); }
});

test('un fallo de red informa el error y limpia el callback', async () => {
  const browser = mockBrowser();
  try {
    const result = listDriveImages();
    const callback = browser.callbackName();
    browser.script.onerror();
    await assert.rejects(result, /No se pudo conectar/);
    assert.equal(globalThis.window[callback], undefined);
  } finally { browser.restore(); }
});
