import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Music, ThumbsUp, Plus, Search, Disc } from 'lucide-react';

export const CollaborativePlaylist: React.FC = () => {
  const { songs, addSongRequest, voteSong, config } = useEvent();
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle || !artist) {
      alert('Por favor ingresa el título de la canción y el artista.');
      return;
    }

    addSongRequest({
      title: songTitle,
      artist,
      submittedBy: submittedBy || 'Invitado'
    });

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
            Proponé tus temas favoritos y votá los de los demás. ¡Las canciones más votadas sonarán en la pista principal!
          </p>
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
