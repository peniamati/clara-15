export function parseGuestAge(value: string): number | null {
  if (!value.trim()) return null;
  const age = Number(value);
  return Number.isInteger(age) && age >= 0 && age <= 99 ? age : null;
}

export function isMinorGuest(age: number | null): boolean {
  return age !== null && age < 18;
}

export function guestContactPhone(age: number | null, phone: string, tutorPhone: string): string {
  return (isMinorGuest(age) ? phone.trim() || tutorPhone.trim() : phone.trim());
}
