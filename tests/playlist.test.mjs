import test from 'node:test';
import assert from 'node:assert/strict';
import { findOfficialTrack, isPublicSong, uniqueSongs } from '../src/lib/playlist.ts';

const tracks = [{ id: 'spotify-123', title: 'Canción de Clara', artist: 'Artista', spotifyUrl: 'https://open.spotify.com/track/123' }];

test('reconoce una propuesta cuando su tema ya figura en Spotify', () => {
  assert.equal(findOfficialTrack({ id: 'request-1', title: 'Cancion de Clara', artist: 'ARTISTA' }, tracks)?.id, 'spotify-123');
});

test('reconoce el enlace exacto aunque el invitado escriba otro título', () => {
  assert.equal(findOfficialTrack({ id: 'request-2', title: 'Otro nombre', artist: 'Otro artista', spotifyUrl: 'https://open.spotify.com/track/123?si=abc' }, tracks)?.id, 'spotify-123');
});

test('mantiene pendiente una canción que no está en la playlist oficial', () => {
  assert.equal(findOfficialTrack({ id: 'request-3', title: 'Tema nuevo', artist: 'Artista' }, tracks), undefined);
});

test('una propuesta no se publica aunque alguien la marque como aprobada', () => {
  assert.equal(isPublicSong({ approved: true, isInOfficialPlaylist: false }), false);
  assert.equal(isPublicSong({ approved: false, isInOfficialPlaylist: true }), false);
  assert.equal(isPublicSong({ approved: true, isInOfficialPlaylist: true }), true);
});

test('muestra una sola canción aunque figure dos veces en Spotify o como propuesta', () => {
  const songs = [
    { id: 'request-1', title: 'Mueve el Toto', artist: 'El Apache Ness', votes: 3 },
    { id: 'spot-35', title: 'Mueve el Toto', artist: 'El Apache Ness', votes: 0 },
    { id: 'spot-91', title: 'MUEVE EL TOTO', artist: 'El Apache Ness', votes: 0 },
    { id: 'spot-92', title: 'Otra canción', artist: 'Otro artista', votes: 0 }
  ];
  assert.deepEqual(uniqueSongs(songs).map(song => song.id), ['request-1', 'spot-92']);
});
