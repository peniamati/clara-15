import test from 'node:test';
import assert from 'node:assert/strict';
import { specialMenus, guestReportRows } from '../src/lib/guestReports.ts';

test('no cuenta el menú general como una restricción y tolera registros anteriores', () => {
  assert.deepEqual(specialMenus(['Menú Estándar', 'Ninguna (Menú General)', ' Vegetariano ']), ['Vegetariano']);
  assert.deepEqual(specialMenus(undefined), []);
  assert.deepEqual(specialMenus(['', null, 'Sin TACC / Celíaco']), ['Sin TACC / Celíaco']);
});

test('la exportación conserva contactos como texto y admite invitados sin restricciones', () => {
  const rows = guestReportRows([{ name: 'Sofía', lastName: 'Peña', age: 0, phone: '+5492910000000', tutorPhone: '02910000000' }]);
  assert.equal(rows[0]['Menú especial'], 'Estándar');
  assert.equal(rows[0]['Menor de edad'], 'Sí');
  assert.equal(rows[0]['Teléfono del tutor'], '02910000000');
  assert.equal(rows[0].Teléfono, '+5492910000000');
});
