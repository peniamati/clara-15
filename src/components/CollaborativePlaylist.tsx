import { notify } from '../lib/notify';
import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { 
  Music, 
  ThumbsUp, 
  Plus, 
  Search, 
  Disc, 
  ExternalLink, 
  Mail, 
  CheckCircle2, 
  ListMusic, 
  Flame, 
  Info
} from 'lucide-react';
import { notifyOrganizer, ORGANIZER_EMAIL_ENABLED } from '../lib/driveUtils';
import { isPublicSong, normalizeSongText } from '../lib/playlist';

const SPOTIFY_PLAYLIST_URL = 'https://open.spotify.com/playlist/408drhVBzu4Jxrt501CwOL?si=3b44a51ff97744da';

export const CollaborativePlaylist: React.FC = () => {
  const { songs, addSongRequest, voteSong, config } = useEvent();
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [note, setNote] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [wantsEmailNotification, setWantsEmailNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'list' | 'ranking'>('list');
  const [submittedSuccessModal, setSubmittedSuccessModal] = useState<{
    title: string;
    artist: string;
    submittedBy: string;
    note: string;
    emailed: boolean;
  } | null>(null);
  const [votedSongIds, setVotedSongIds] = useState<Set<string>>(new Set());

  const adminEmails = (config.adminEmails?.length ? config.adminEmails : ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com']).join(',');

  const handleVote = async (songId: string, songName: string) => {
    try {
      await voteSong(songId);
      setVotedSongIds(prev => new Set([...prev, songId]));
      notify(`¡Voto registrado para "${songName}"!`);
    } catch {
      notify('No se pudo registrar el voto en este momento.');
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !artist.trim()) {
      notify('Por favor ingresá el título de la canción y el artista.');
      return;
    }

    const currentTitle = songTitle.trim();
    const currentArtist = artist.trim();
    const currentSubmittedBy = submittedBy.trim() || 'Invitado';
    const currentNote = note.trim();
    const duplicate = songs.find(song =>
      normalizeSongText(song.title) === normalizeSongText(currentTitle) &&
      normalizeSongText(song.artist) === normalizeSongText(currentArtist)
    );
    if (duplicate) {
      notify(`“${duplicate.title}” de ${duplicate.artist} ya está en la lista. Podés votarla en lugar de repetirla.`);
      setSearchTerm(duplicate.title);
      return;
    }

    try {
      const added = await addSongRequest({
        title: currentTitle,
        artist: currentArtist,
        submittedBy: currentSubmittedBy,
        note: currentNote,
        spotifyUrl: spotifyUrl.trim() || undefined
      });
      if (!added) return;

      if (ORGANIZER_EMAIL_ENABLED && wantsEmailNotification) {
        notifyOrganizer('song', {
          title: currentTitle,
          artist: currentArtist,
          submittedBy: currentSubmittedBy,
          note: currentNote,
          spotifyUrl: spotifyUrl.trim(),
          adminEmail: adminEmails
        });
      }

      setSubmittedSuccessModal({
        title: currentTitle,
        artist: currentArtist,
        submittedBy: currentSubmittedBy,
        note: currentNote,
        emailed: wantsEmailNotification
      });

      setSongTitle('');
      setArtist('');
      setSubmittedBy('');
      setNote('');
      setSpotifyUrl('');
      setWantsEmailNotification(false);
      notify('¡Propuesta guardada! El organizador la verá como pendiente.');
    } catch (err) {
      notify('Hubo un problema al enviar la canción. Reintentá en unos segundos.');
    }
  };

  // Filter songs based on search and sort by votes or original list order
  const filteredSongs = songs
    .filter(s => isPublicSong(s) && (
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchTerm.toLowerCase())
    ));

  const sortedSongs = activeViewMode === 'ranking'
    ? [...filteredSongs].sort((a, b) => b.votes - a.votes)
    : filteredSongs;

  return (
    <section id="playlist" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Music className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Música & Setlist de la Fiesta</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            La música de la fiesta
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Escuchá la playlist de Clara, votá tus favoritas y proponé el próximo tema para bailar.
          </p>
        </div>

        {/* Spotify Player & Info Card */}
        <div className="mb-12 bg-[#0F0F0F] border border-[#C0C0C0]/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#1DB954]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] text-xs font-semibold uppercase tracking-wider mb-2">
                <span>🟢 Playlist Oficial del Evento</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                La playlist de {config.honoree}
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-light mt-1 max-w-xl">
                Escuchá la música de la fiesta directamente aquí o abrila en tu aplicación de Spotify.
              </p>
            </div>

            <a
              href={SPOTIFY_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-3.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#1DB954]/20 transition-all inline-flex items-center gap-2.5 active:scale-95"
            >
              <Music className="w-4 h-4" />
              <span>Abrir en Spotify</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Embedded Spotify player */}
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/playlist/408drhVBzu4Jxrt501CwOL?utm_source=generator&si=3b44a51ff97744da"
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`Playlist Spotify ${config.honoree}`}
            />
          </div>

          {/* Explanation note about collaborative editing */}
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-900/70 border border-white/10 flex items-start gap-3 text-xs text-zinc-400">
            <Info className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
            <p>
              <strong className="text-zinc-200">¿Falta un tema?</strong> Proponelo abajo. El organizador lo verá como pendiente; aparecerá en esta lista cuando esté en la playlist oficial de Spotify.
            </p>
          </div>
        </div>

        {/* Main Grid: Add Song Form & List/Ranking of Songs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form: Propose Song */}
          <div className="lg:col-span-5 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl h-fit">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-5 h-5 text-[#C0C0C0]" />
              <h3 className="font-serif text-2xl font-semibold text-white">
                Proponer una Canción
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-6 font-light">
              Pedí el tema que querés que suene. No aparecerá en la lista pública hasta que se agregue a Spotify.
            </p>

            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Link de Spotify (Opcional)
                </label>
                <input
                  type="url"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#1DB954] outline-none"
                />
                <p className="mt-1.5 text-[11px] text-zinc-500">Pegalo si lo tenés para que el organizador encuentre la versión exacta.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Nombre de la Canción *
                </label>
                <input
                  type="text"
                  required
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Ej: Dance the Night"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Artista o Banda *
                </label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Ej: Dua Lipa"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Tu Nombre (Opcional)
                </label>
                <input
                  type="text"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  placeholder="Ej: Sofía (Amiga de Clara)"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  ¿Para qué momento? (Opcional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: Para el carnaval carioca / Para bailar con amigos"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              {ORGANIZER_EMAIL_ENABLED && <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-4 text-sm text-zinc-300">
                <input type="checkbox" checked={wantsEmailNotification} onChange={event => setWantsEmailNotification(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C0C0C0]" />
                <span>Avisar también por email al organizador <span className="block text-xs text-zinc-500">Se enviará automáticamente. Si no lo elegís, igual verá la propuesta pendiente en el panel.</span></span>
              </label>}

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Disc className="w-4 h-4" /> Agregar canción
              </button>
            </form>

            <div className="mt-5 p-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-2 text-[11px] text-zinc-400">
              <Mail className="w-3.5 h-3.5 text-[#C0C0C0] shrink-0" />
              <span>{ORGANIZER_EMAIL_ENABLED ? 'Tu propuesta queda registrada para el organizador, aunque no elijas el email.' : 'Tu propuesta aparecerá como pendiente en el panel del organizador. El aviso por email está temporalmente desactivado.'}</span>
            </div>
          </div>

          {/* List & Ranking Column */}
          <div className="lg:col-span-7 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    Canciones de la Fiesta
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {sortedSongs.length} temas cargados · Votá tus preferidos
                  </p>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('list')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      activeViewMode === 'list'
                        ? 'bg-[#C0C0C0] text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ListMusic className="w-3.5 h-3.5" />
                    <span>Modo Lista</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('ranking')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      activeViewMode === 'ranking'
                        ? 'bg-[#C0C0C0] text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Más Votadas</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por tema o artista..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#C0C0C0] outline-none"
                />
              </div>

              {/* Song Items List */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {sortedSongs.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    No se encontraron canciones con ese criterio de búsqueda.
                  </div>
                ) : (
                  sortedSongs.map((song, index) => {
                    const hasVoted = votedSongIds.has(song.id);
                    return (
                      <div
                        key={song.id}
                        className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between gap-3 hover:border-[#C0C0C0]/30 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Index Badge */}
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                            activeViewMode === 'ranking'
                              ? index === 0
                                ? 'bg-[#C0C0C0] text-black shadow-md shadow-[#C0C0C0]/20'
                                : index === 1
                                ? 'bg-zinc-300 text-black'
                                : index === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-zinc-800 text-zinc-400'
                              : 'bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700'
                          }`}>
                            {activeViewMode === 'ranking' ? `#${index + 1}` : index + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white text-sm truncate">
                                {song.title}
                              </h4>
                              {song.isInOfficialPlaylist && (
                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-[10px] font-medium border border-[#1DB954]/20 shrink-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                                  En Spotify
                                </span>
                              )}
                            </div>
                            <p className="text-zinc-400 text-xs truncate">
                              {song.artist}
                              {song.submittedBy && (
                                <span className="text-zinc-500"> · {song.submittedBy}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Vote Button */}
                        <button
                          type="button"
                          onClick={() => handleVote(song.id, song.title)}
                          className={`shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                            hasVoted
                              ? 'bg-[#C0C0C0] text-black border-[#C0C0C0]'
                              : 'bg-[#050505] border-white/10 text-[#C0C0C0] hover:border-[#C0C0C0]/50 hover:bg-zinc-900'
                          }`}
                          title="Votar canción para que suene en la fiesta"
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-black' : ''}`} />
                          <span>{song.votes}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-xs text-zinc-400">
                Las canciones con más votos tendrán prioridad en los sets principales del DJ durante la noche de {config.honoree}.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Success Modal / Action Banner for requested song */}
      {submittedSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-[#0F0F0F] border border-[#C0C0C0]/40 p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-2xl font-semibold text-center text-white mb-2">
              ¡Canción Propuesta!
            </h3>
            
            <p className="text-xs text-zinc-300 text-center mb-6">
              Recibimos tu tema para la fiesta de <strong className="text-white">{config.honoree}</strong>. Quedó pendiente hasta que el organizador lo agregue a Spotify.{submittedSuccessModal.emailed ? ' También solicitamos el aviso automático por email.' : ''}
            </p>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 mb-6 space-y-1 text-xs">
              <p className="font-semibold text-white text-sm">{submittedSuccessModal.title}</p>
              <p className="text-zinc-400">Artista: <span className="text-zinc-200">{submittedSuccessModal.artist}</span></p>
              <p className="text-zinc-400">Propuesto por: <span className="text-zinc-200">{submittedSuccessModal.submittedBy}</span></p>
              {submittedSuccessModal.note && (
                <p className="text-zinc-400">Momento: <span className="text-zinc-200">{submittedSuccessModal.note}</span></p>
              )}
            </div>

            <div className="space-y-2.5">
              <a
                href={SPOTIFY_PLAYLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Ver la Playlist en Spotify</span>
              </a>

              <button
                type="button"
                onClick={() => setSubmittedSuccessModal(null)}
                className="w-full py-2 text-zinc-400 hover:text-white text-xs font-medium underline"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
