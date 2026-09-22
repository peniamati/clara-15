/**
 * Utilities for Google Drive links and direct image streaming
 */

export const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1vD5IpM96K5bMCfJbVpTmEMS9WwE1Y4sH';
export const GOOGLE_DRIVE_SYNC_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxGExLVYOswBQ0Y3wn0D2iMtdS-ioBXJFiMpMmv6k1_lWm5JsLv0E98ubFhI3bCRp0yMg/exec';

export interface DriveSyncedImage {
  id: string;
  name: string;
  mimeType: string;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export function listDriveImages(): Promise<DriveSyncedImage[]> {
  return new Promise((resolve, reject) => {
    const callbackName = `__claraDriveSync${Date.now()}${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => finish(new Error('La sincronización con Drive tardó demasiado.')), 60000);
    const finish = (error?: Error, images: DriveSyncedImage[] = []) => {
      window.clearTimeout(timeout);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
      error ? reject(error) : resolve(images);
    };
    (window as unknown as Record<string, unknown>)[callbackName] = (payload: { ok?: boolean; images?: DriveSyncedImage[]; error?: string }) => {
      if (!payload?.ok) finish(new Error(payload?.error || 'Drive no devolvió una respuesta válida.'));
      else finish(undefined, Array.isArray(payload.images) ? payload.images : []);
    };
    script.onerror = () => finish(new Error('No se pudo conectar con Google Drive.'));
    script.src = `${GOOGLE_DRIVE_SYNC_ENDPOINT}?callback=${encodeURIComponent(callbackName)}&sync=${Date.now()}`;
    document.body.appendChild(script);
  });
}

export async function uploadImageToDrive(imageDataUrl: string, requestedName: string): Promise<DriveSyncedImage> {
  const mimeType = imageDataUrl.match(/^data:([^;]+);base64,/)?.[1];
  if (!mimeType) throw new Error('La imagen no tiene un formato compatible con Drive.');
  const fileName = requestedName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
  const target = `drive-upload-${Date.now()}`;
  const frame = document.createElement('iframe');
  frame.name = target;
  frame.hidden = true;
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = GOOGLE_DRIVE_SYNC_ENDPOINT;
  form.target = target;
  form.hidden = true;
  for (const [name, value] of Object.entries({ mimeType, fileName, base64: imageDataUrl })) {
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.append(frame, form);
  form.submit();
  window.setTimeout(() => { frame.remove(); form.remove(); }, 12000);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await new Promise(resolve => window.setTimeout(resolve, 1200));
    const images = await listDriveImages();
    const uploaded = images.find(image => image.name === fileName);
    if (uploaded) return uploaded;
  }
  throw new Error('Drive recibió la foto, pero todavía no aparece en la carpeta. Reintentá en unos segundos.');
}

export function notifyOrganizer(type: 'rsvp' | 'song', fields: Record<string, string>): void {
  const target = `organizer-notification-${Date.now()}`;
  const frame = document.createElement('iframe');
  frame.name = target;
  frame.hidden = true;
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = GOOGLE_DRIVE_SYNC_ENDPOINT;
  form.target = target;
  form.hidden = true;
  for (const [name, value] of Object.entries({ action: 'notify', type, ...fields })) {
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.append(frame, form);
  form.submit();
  window.setTimeout(() => { frame.remove(); form.remove(); }, 15000);
}

/**
 * Extracts a Google Drive File ID from various link formats:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}
 */
export function extractDriveFileId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already just the raw alphanumeric ID
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) {
    return trimmed;
  }

  // Matches /d/{ID}
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return matchD[1];

  // Matches id={ID}
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  return null;
}

/**
 * Converts a Google Drive link or ID to a high-quality direct image URL
 * using Google's official fast content delivery network (lh3.googleusercontent.com).
 */
export function getDriveDirectImageUrl(urlOrId: string, size = 1600): string {
  const fileId = extractDriveFileId(urlOrId);
  if (!fileId) return urlOrId;
  return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
}
