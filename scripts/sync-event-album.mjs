import { readFile, writeFile } from 'node:fs/promises';
import { parseGooglePhotosAlbum } from './google-photos.mjs';

const defaultAlbumUrl = 'https://photos.app.goo.gl/xeFB3FuSo5EPL99c9';
let albumUrl = process.env.EVENT_ALBUM_URL || defaultAlbumUrl;
const output = new URL('../src/data/eventAlbumPhotos.json', import.meta.url);

// The existing public event settings decide which shared album to import.
if (!process.env.EVENT_ALBUM_URL && process.env.VITE_FIREBASE_PROJECT_ID) {
  const project = encodeURIComponent(process.env.VITE_FIREBASE_PROJECT_ID);
  const database = encodeURIComponent(process.env.VITE_FIREBASE_DATABASE_ID || '(default)');
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/${database}/documents/settings/config`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const settings = await response.json();
    albumUrl = settings.fields?.eventAlbumUrl?.stringValue?.trim() || defaultAlbumUrl;
  } catch {
    console.warn('Could not read public album settings; using the configured fallback.');
  }
}

const parsed = new URL(albumUrl);
if (parsed.protocol !== 'https:' || !['photos.app.goo.gl', 'photos.google.com'].includes(parsed.hostname)) {
  console.log('The configured album is not Google Photos; no public photo import is needed.');
} else {
  try {
    const html = process.env.EVENT_ALBUM_HTML_FILE
      ? await readFile(process.env.EVENT_ALBUM_HTML_FILE, 'utf8')
      : await fetch(albumUrl, { signal: AbortSignal.timeout(45000) }).then(response => {
        if (!response.ok) throw new Error(`Album request failed: HTTP ${response.status}`);
        return response.text();
      });
    const snapshot = parseGooglePhotosAlbum(html, albumUrl);
    await writeFile(output, JSON.stringify(snapshot, null, 2) + '\n');
    console.log(`Party album imported: ${snapshot.photos.length} photos.`);
  } catch (error) {
    // Keep a working gallery if Google is temporarily unavailable or changes its markup.
    const previous = JSON.parse(await readFile(output, 'utf8'));
    if (!previous.photos?.length) throw error;
    console.warn(`Album refresh failed; retaining ${previous.photos.length} saved photos. ${error.message}`);
  }
}
