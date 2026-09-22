export const MAX_PHOTO_DATA_LENGTH = 700_000;

const DRIVE_IMAGE_URL = /^https:\/\/lh3[.]googleusercontent[.]com\/d\/[a-zA-Z0-9_-]+=w\d+$/;

export function isSupportedPhotoSource(value: string): boolean {
  return value.startsWith('data:image/') || DRIVE_IMAGE_URL.test(value);
}

export function validatePhotoSource(value: string): string | null {
  if (!isSupportedPhotoSource(value)) {
    return 'Seleccioná una imagen o vinculá una foto válida de Google Drive.';
  }
  if (value.length > 950_000) {
    return 'No se pudo comprimir la foto al tamaño permitido.';
  }
  return null;
}

export function describePersistenceError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code || '')
    : '';
  if (code.includes('permission-denied')) {
    return 'Firebase rechazó la operación. Revisá que las reglas estén publicadas y que el acceso anónimo esté habilitado.';
  }
  if (code.includes('unavailable') || code.includes('network')) {
    return 'No hay conexión con Firebase. Revisá internet y volvé a intentar.';
  }
  if (code.includes('invalid-api-key') || code.includes('invalid-argument')) {
    return 'La configuración de Firebase del sitio no es válida. Revisá los secrets del despliegue.';
  }
  return error instanceof Error && error.message
    ? error.message
    : 'No se guardó la operación. Volvé a intentar.';
}
