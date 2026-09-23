import test from 'node:test';
import assert from 'node:assert/strict';
import { guestContactPhone, isMinorGuest, parseGuestAge } from '../src/lib/rsvpAge.ts';

test('admite bebés de 0 y 1 año y exige tutor para todo menor', () => {
  assert.equal(parseGuestAge('0'), 0);
  assert.equal(parseGuestAge('1'), 1);
  assert.equal(isMinorGuest(parseGuestAge('0')), true);
  assert.equal(isMinorGuest(parseGuestAge('1')), true);
  assert.equal(isMinorGuest(parseGuestAge('17')), true);
  assert.equal(isMinorGuest(parseGuestAge('18')), false);
});

test('rechaza edades vacías, decimales o fuera de rango', () => {
  for (const value of ['', ' ', '-1', '1.5', '100', 'abc']) {
    assert.equal(parseGuestAge(value), null, value);
  }
});

test('usa el teléfono del tutor si un menor no tiene celular propio', () => {
  assert.equal(guestContactPhone(1, '', ' 2911234567 '), '2911234567');
  assert.equal(guestContactPhone(1, '2917654321', '2911234567'), '2917654321');
  assert.equal(guestContactPhone(18, '', '2911234567'), '');
});
