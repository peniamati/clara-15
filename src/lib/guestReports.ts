import type { Guest } from '../types';

export function specialMenus(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string')
    .map(item => item.trim()).filter(item => item && !/^(ninguna\b|men[uú]\s+(est[aá]ndar|general)\b|est[aá]ndar$)/i.test(item));
}

export function guestReportRows(guests: Guest[]) {
  return guests.map(g => ({
    'Grupo familiar': g.groupId || '', Nombre: g.name, Apellido: g.lastName,
    Edad: g.age ?? '', 'Menor de edad': g.age !== undefined && g.age < 18 ? 'Sí' : 'No',
    Tutor: g.tutorName || g.emergencyContactName || '',
    'Teléfono del tutor': g.tutorPhone || g.emergencyContactPhone || '',
    Teléfono: g.phone || '', Email: g.email || '', Estado: g.status,
    Mesa: g.tableNumber || 'Sin asignar', 'Menú especial': specialMenus(g.dietaryRestrictions).join(', ') || 'Estándar',
    Notas: g.notes || '',
  }));
}
