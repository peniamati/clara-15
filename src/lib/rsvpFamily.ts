import type { Guest } from '../types';
import { isMinorGuest, parseGuestAge } from './rsvpAge.ts';

export interface FamilyMemberDraft {
  id: string;
  name: string;
  lastName: string;
  age: string;
  phone: string;
  email: string;
  dietaryRestrictions: string[];
  responsibleAdultId?: string;
}

export function prepareFamilyGuests(
  members: FamilyMemberDraft[],
  status: 'CONFIRMED' | 'DECLINED',
  tutor: { name: string; phone: string },
  notes: string
): { guests: Partial<Guest>[]; error?: never } | { guests?: never; error: string } {
  if (!members.length) return { error: 'Agregá al menos una persona.' };
  if (members.some(member => !member.name.trim() || !member.lastName.trim())) {
    return { error: 'Completá el nombre y apellido de cada integrante.' };
  }
  const ages = members.map(member => parseGuestAge(member.age));
  if (ages.some(age => age === null)) {
    return { error: 'Ingresá la edad de cada integrante en años, entre 0 y 99. Para bebés, ingresá 0.' };
  }
  const adults = members.filter((_, index) => !isMinorGuest(ages[index]));
  if (adults.some(adult => !adult.phone.trim())) {
    return { error: 'Ingresá un teléfono de contacto para cada adulto.' };
  }
  if (status === 'CONFIRMED' && !adults.length && members.some((_, index) => isMinorGuest(ages[index])) &&
      (!tutor.name.trim() || !tutor.phone.trim())) {
    return { error: 'Ingresá el nombre y teléfono de un adulto responsable para los menores.' };
  }

  return { guests: members.map((member, index) => {
    const age = ages[index]!;
    const minor = isMinorGuest(age);
    const responsible = adults.find(adult => adult.id === member.responsibleAdultId) || adults[0];
    const tutorName = minor && status === 'CONFIRMED'
      ? responsible ? `${responsible.name.trim()} ${responsible.lastName.trim()}` : tutor.name.trim()
      : '';
    const tutorPhone = minor && status === 'CONFIRMED' ? responsible?.phone.trim() || tutor.phone.trim() : '';
    return {
      name: member.name.trim(), lastName: member.lastName.trim(), age,
      phone: minor ? tutorPhone : member.phone.trim(), email: member.email.trim(),
      ...(minor && status === 'CONFIRMED' ? {
        tutorName, tutorPhone, emergencyContactName: tutorName, emergencyContactPhone: tutorPhone
      } : {}),
      status, adultsCount: minor ? 0 : 1, kidsCount: minor ? 1 : 0,
      dietaryRestrictions: status === 'CONFIRMED' && member.dietaryRestrictions.length
        ? member.dietaryRestrictions : ['Menú Estándar'],
      notes: index === 0 ? notes.trim() : ''
    };
  }) };
}
