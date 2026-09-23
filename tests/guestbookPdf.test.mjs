import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGuestbookPdf } from '../src/lib/guestbookPdf.ts';

test('genera un PDF A4 del libro de firmas, incluso con dedicatorias largas', () => {
  const messages = [
    { id: '1', guestName: 'Sofía', message: 'Que tengas una noche hermosa, Clara.', createdAt: '2026-10-17T21:00:00.000Z' },
    { id: '2', guestName: 'Familia Peña', message: 'Un recuerdo para siempre. '.repeat(350), createdAt: '2026-10-17T22:00:00.000Z' },
  ];
  const pdf = buildGuestbookPdf(messages, 'Clara Hoggan');
  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  assert.equal(new TextDecoder().decode(bytes.subarray(0, 8)), '%PDF-1.3');
  assert.ok(pdf.getNumberOfPages() > 1);
  assert.ok(bytes.length > 2000);
});
