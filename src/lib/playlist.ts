import type { SongRequest } from '../types';

export const normalizeSongText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase();

const spotifyTrackId = (url?: string) => url?.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/)?.[1];

export function findOfficialTrack(song: Pick<SongRequest, 'id' | 'title' | 'artist' | 'spotifyUrl'>, tracks: SongRequest[]): SongRequest | undefined {
  const requestedTrackId = spotifyTrackId(song.spotifyUrl);
  return tracks.find(track => track.id === song.id ||
    (requestedTrackId && spotifyTrackId(track.spotifyUrl) === requestedTrackId) ||
    (normalizeSongText(track.title) === normalizeSongText(song.title) && normalizeSongText(track.artist) === normalizeSongText(song.artist)));
}

export function isPublicSong(song: Pick<SongRequest, 'approved' | 'isInOfficialPlaylist'>): boolean {
  return song.approved && song.isInOfficialPlaylist === true;
}
