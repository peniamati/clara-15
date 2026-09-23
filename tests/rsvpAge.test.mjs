import test from 'node:test';
import assert from 'node:assert/strict';
import { guestContactPhone, isMinorGuest, parseGuestAge } from '../src/lib/rsvpAge.ts';

test('admite edades de 0 a 4 años y exige tutor para todo menor', () => {
  for (const age of [0, 1, 2, 3, 4]) {
    assert.equal(parseGuestAge(String(age)), age);
    assert.equal(isMinorGuest(age), true);
  }
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
