import { writeFile } from 'node:fs/promises';

process.on('uncaughtException', error => {
  const message = String(error?.message || error).replace(/\r?\n/g, ' ');
  console.error(`::error title=Spotify playlist sync failed::${message}`);
  process.exitCode = 1;
});

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const playlistId = process.env.SPOTIFY_PLAYLIST_ID || '408drhVBzu4Jxrt501CwOL';

if (!clientId || !clientSecret) {
  console.log('Spotify credentials are not configured; keeping the bundled playlist snapshot.');
  process.exit(0);
}

const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'grant_type=client_credentials',
});

if (!tokenResponse.ok) throw new Error(`Spotify token request failed: ${tokenResponse.status}`);
const { access_token: accessToken } = await tokenResponse.json();
const tracks = [];
let next = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=50&offset=0`;

while (next) {
  const response = await fetch(next, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) {
    const hint = response.status === 403
      ? 'Spotify requires a user token from the playlist owner or a collaborator.'
      : '';
    throw new Error(`Spotify playlist request failed: ${response.status}. ${hint}`);
  }
  const page = await response.json();
  for (const item of page.items || []) {
    const track = item.item ?? item.track;
    if (!track?.id || !track?.name) continue;
    tracks.push({
      id: `spotify-${track.id}`,
      title: track.name,
      artist: (track.artists || []).map(artist => artist.name).join(', '),
      submittedBy: 'Playlist Oficial',
      votes: 0,
      approved: true,
      spotifyUrl: track.external_urls?.spotify || '',
      isInOfficialPlaylist: true,
    });
  }
  next = page.next;
}

const source = `import { SongRequest } from '../types';\n\nexport const spotifyPlaylistTracks: SongRequest[] = ${JSON.stringify(tracks, null, 2)};\n`;
await writeFile(new URL('../src/data/spotifyTracks.ts', import.meta.url), source, 'utf8');
console.log(`Spotify playlist synchronized: ${tracks.length} tracks.`);
