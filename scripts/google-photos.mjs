// Public shared albums expose their gallery data in this bootstrap JSON.
// Parse only the JSON; never execute scripts returned by Google.
export function parseGooglePhotosAlbum(html, albumUrl) {
  const callbacks = html.matchAll(/AF_initDataCallback\(\{key:\s*'[^']+',\s*hash:\s*'[^']+',\s*data:([\s\S]*?),\s*sideChannel:/g);
  for (const match of callbacks) {
    let data;
    try { data = JSON.parse(match[1]); } catch { continue; }
    if (!Array.isArray(data?.[1]) || !data[1].some(row => Array.isArray(row?.[1]) && typeof row[1][0] === 'string' && row[1][0].startsWith('https://lh3.googleusercontent.com/'))) continue;
    if (data[2]) throw new Error('Google Photos returned a paginated album; refusing an incomplete import.');
    const seen = new Set();
    const photos = data[1].flatMap(row => {
      const baseUrl = row?.[1]?.[0];
      if (typeof row?.[0] !== 'string' || typeof baseUrl !== 'string' || !baseUrl.startsWith('https://lh3.googleusercontent.com/') || seen.has(row[0])) return [];
      seen.add(row[0]);
      return [{
        id: `google-photos-${row[0]}`, guestName: 'Álbum de la fiesta',
        imageUrl: `${baseUrl}=w1800`, thumbnailUrl: `${baseUrl}=w640`,
        filter: 'Normal', sticker: 'Sin sticker', caption: 'Recuerdo de la fiesta',
        likes: 0, approved: true, photoSource: 'google-photos', sourceUrl: albumUrl,
        createdAt: typeof row[2] === 'number' ? new Date(row[2]).toISOString() : ''
      }];
    });
    if (photos.length) return { albumUrl, title: typeof data?.[3]?.[1] === 'string' ? data[3][1] : 'Fotos de la fiesta', photos };
  }
  throw new Error('No public album photos found. The album may be private or Google may have changed its page format.');
}
