export const DEFAULT_EVENT_ALBUM_URL = 'https://photos.app.goo.gl/xeFB3FuSo5EPL99c9';

export function resolveEventAlbumUrl(value?: string): string {
  try {
    const url = new URL(value?.trim() || DEFAULT_EVENT_ALBUM_URL);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

export function eventAlbumProvider(value: string): string {
  const host = new URL(value).hostname;
  if (host === 'photos.app.goo.gl' || host === 'photos.google.com') return 'Google Fotos';
  if (host === 'drive.google.com') return 'Google Drive';
  return 'Álbum compartido';
}
