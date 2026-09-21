import { notify } from '../lib/notify';
import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Music, ThumbsUp, Plus, Search, Disc, ExternalLink } from 'lucide-react';

export const CollaborativePlaylist: React.FC = () => {
  const { songs, addSongRequest, voteSong, config } = useEvent();
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle || !artist) {
      notify('Por favor ingresa el título de la canción y el artista.');
      return;
    }

    if (!await addSongRequest({
      title: songTitle,
      artist,
      submittedBy: submittedBy || 'Invitado'
    })) return;

    setSongTitle('');
    setArtist('');
    setSubmittedBy('');
  };

  const filteredSongs = songs
    .filter(s => s.approved && (
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchTerm.toLowerCase())
    ))
    .sort((a, b) => b.votes - a.votes);

  return (
    <section id="playlist" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Music className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Setlist Colaborativo de DJ</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Armemos la Playlist de la Fiesta
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Sumá tus canciones favoritas a la lista oficial de Spotify o proponé temas para que el DJ los haga sonar en la pista.
          </p>
        </div>

        {/* Spotify Collaborative Playlist Embed & Action */}
        <div className="mb-12 bg-[#0F0F0F] border border-[#C0C0C0]/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#1DB954]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] text-xs font-semibold uppercase tracking-wider mb-2">
                <span>🟢 Playlist Oficial de Spotify</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                Escuchá y agregá canciones a la lista
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-light mt-1 max-w-xl">
                Hacé clic en el botón para abrir la lista en Spotify y agregar directamente las canciones que querés bailar en la fiesta.
              </p>
            </div>

            <a
              href="https://open.spotify.com/playlist/408drhVBzu4Jxrt501CwOL?si=3b44a51ff97744da"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-3.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#1DB954]/20 transition-all inline-flex items-center gap-2.5 active:scale-95"
            >
              <Music className="w-4 h-4" />
              <span>Abrir y Sumar en Spotify</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/playlist/408drhVBzu4Jxrt501CwOL?utm_source=generator&si=3b44a51ff97744da"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Playlist Spotify Clara 15"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form: Add Song */}
          <div className="lg:col-span-5 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl h-fit">
            <h3 className="font-serif text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C0C0C0]" /> Recomendar una Canción
            </h3>

            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Nombre del Tema *</label>
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Artista / Banda *</label>
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Tu Nombre (Opcional)</label>
                <input
                  type="text"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  placeholder="Ej: Juan"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10 transition-all flex items-center justify-center gap-2"
              >
                <Disc className="w-4 h-4" /> Agregar a la Lista
              </button>
            </form>
          </div>

          {/* Ranking & List */}
          <div className="lg:col-span-7 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="font-serif text-2xl font-semibold text-white">
                  Ranking de Canciones Votadas
                </h3>

                {/* Search Bar */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar canción..."
                    className="w-full pl-8 pr-3 py-2 rounded-full bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#C0C0C0] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {filteredSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between gap-4 hover:border-[#C0C0C0]/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0 ? 'bg-[#C0C0C0] text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{song.title}</h4>
                        <p className="text-zinc-400 text-xs font-light">{song.artist} <span className="text-zinc-500">· Pedido por {song.submittedBy}</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => voteSong(song.id)}
                      className="px-3.5 py-1.5 rounded-full bg-[#050505] border border-white/10 text-[#C0C0C0] hover:border-[#C0C0C0]/50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{song.votes}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-xs text-zinc-400">
                Las canciones más votadas se sumarán al set del DJ para la fiesta de {config.honoree}.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
