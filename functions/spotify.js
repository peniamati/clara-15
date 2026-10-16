const PLAYLIST_ID = '408drhVBzu4Jxrt501CwOL';
const MIN_REFRESH_MS = 15 * 60 * 1000;
const LEASE_MS = 2 * 60 * 1000;

async function fetchSpotifyPlaylist({ clientId, refreshToken, fetchImpl = fetch }) {
  const tokenResponse = await fetchImpl('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId })
  });
  if (!tokenResponse.ok) throw new Error(`Spotify token request failed: ${tokenResponse.status}`);
  const { access_token: accessToken } = await tokenResponse.json();
  if (!accessToken) throw new Error('Spotify returned no access token.');

  const tracks = [];
  let next = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/items?limit=50&offset=0`;
  while (next) {
    const response = await fetchImpl(next, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw new Error(`Spotify playlist request failed: ${response.status}`);
    const page = await response.json();
    for (const item of page.items || []) {
      const track = item.item ?? item.track;
      if (!track?.id || !track?.name) continue;
      tracks.push({
        id: `spotify-${track.id}`,
        title: track.name,
        artist: (track.artists || []).map(artist => artist.name).join(', '),
        submittedBy: 'Playlist Oficial', votes: 0, approved: true,
        spotifyUrl: track.external_urls?.spotify || '', isInOfficialPlaylist: true
      });
    }
    next = page.next;
  }
  if (!tracks.length) throw new Error('Spotify returned an empty playlist.');
  if (Buffer.byteLength(JSON.stringify(tracks), 'utf8') > 850000) {
    throw new Error('Playlist exceeds the Firestore document size limit.');
  }
  return tracks;
}

module.exports = { MIN_REFRESH_MS, LEASE_MS, fetchSpotifyPlaylist };
