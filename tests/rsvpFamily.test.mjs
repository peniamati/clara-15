import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareFamilyGuests } from '../src/lib/rsvpFamily.ts';

const person = (id, name, age, phone = '') => ({
  id, name, lastName: 'Pérez', age: String(age), phone, email: '', dietaryRestrictions: []
});

test('registra cuatro miembros y vincula menores con el adulto elegido', () => {
  const members = [
    person('adult-1', 'Ana', 38, '2911111111'),
    person('adult-2', 'Juan', 40, '2912222222'),
    { ...person('child-1', 'Lucía', 12), responsibleAdultId: 'adult-2', dietaryRestrictions: ['Sin TACC / Celíaco'] },
    person('child-2', 'Tomás', 0)
  ];
  const result = prepareFamilyGuests(members, 'CONFIRMED', { name: '', phone: '' }, 'Nos vemos');
  assert.equal(result.guests?.length, 4);
  assert.equal(result.guests?.[2].tutorName, 'Juan Pérez');
  assert.equal(result.guests?.[2].phone, '2912222222');
  assert.equal(result.guests?.[3].tutorName, 'Ana Pérez');
  assert.equal(result.guests?.[3].age, 0);
  assert.deepEqual(result.guests?.[2].dietaryRestrictions, ['Sin TACC / Celíaco']);
  assert.equal(result.guests?.[0].notes, 'Nos vemos');
});

test('pide tutor una sola vez si ningún miembro es adulto', () => {
  const children = [person('one', 'Luz', 15), person('two', 'Teo', 8)];
  assert.match(prepareFamilyGuests(children, 'CONFIRMED', { name: '', phone: '' }, '').error || '', /adulto responsable/);
  const result = prepareFamilyGuests(children, 'CONFIRMED', { name: 'María Pérez', phone: '2910000000' }, '');
  assert.deepEqual(result.guests?.map(guest => guest.tutorPhone), ['2910000000', '2910000000']);
});

test('valida todos los integrantes antes de guardar', () => {
  assert.match(prepareFamilyGuests([person('a', 'Ana', 35, '2911'), person('b', '', 3)], 'CONFIRMED', { name: '', phone: '' }, '').error || '', /nombre y apellido/);
  assert.match(prepareFamilyGuests([person('a', 'Ana', 35, '2911'), person('b', 'Teo', '')], 'CONFIRMED', { name: '', phone: '' }, '').error || '', /edad/);
  assert.match(prepareFamilyGuests([person('a', 'Ana', 35, '')], 'CONFIRMED', { name: '', phone: '' }, '').error || '', /teléfono/);
});
