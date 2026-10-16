const test = require('node:test');
const assert = require('node:assert/strict');
const { fetchSpotifyPlaylist } = require('../spotify');

test('collects every page and keeps the official track fields', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.includes('/api/token')) return { ok: true, json: async () => ({ access_token: 'token' }) };
    if (url.includes('offset=0')) return { ok: true, json: async () => ({
      items: [{ item: { id: 'one', name: 'Tema 1', artists: [{ name: 'Artista' }], external_urls: { spotify: 'https://open.spotify.com/track/one' } } }],
      next: 'https://api.spotify.com/next'
    }) };
    return { ok: true, json: async () => ({ items: [{ track: { id: 'two', name: 'Tema 2', artists: [] } }], next: null }) };
  };
  const tracks = await fetchSpotifyPlaylist({ clientId: 'id', refreshToken: 'secret', fetchImpl });
  assert.deepEqual(tracks.map(track => track.id), ['spotify-one', 'spotify-two']);
  assert.equal(tracks[0].isInOfficialPlaylist, true);
  assert.equal(calls.length, 3);
});

test('does not replace the shared playlist with an empty response', async () => {
  const fetchImpl = async url => url.includes('/api/token')
    ? { ok: true, json: async () => ({ access_token: 'token' }) }
    : { ok: true, json: async () => ({ items: [], next: null }) };
  await assert.rejects(fetchSpotifyPlaylist({ clientId: 'id', refreshToken: 'secret', fetchImpl }), /empty playlist/);
});
