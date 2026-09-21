import React from 'react';
import { useEvent } from '../context/EventContext';
import { ExternalLink, Film, Images } from 'lucide-react';
import discoHero from '../assets/disco-hero-unsplash.jpg';

export const VideoSection: React.FC = () => {
  const { config } = useEvent();

  return (
    <section className="relative overflow-hidden bg-[#050505] py-24 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C0C0C0]/30 bg-zinc-900/80 px-4 py-1.5 text-xs uppercase tracking-widest text-[#C0C0C0]">
            <Film className="h-3.5 w-3.5" />
            <span>Momentos de la noche</span>
          </div>
          <h2 className="mb-3 font-serif text-4xl font-semibold silver-gradient-text sm:text-6xl">
            Recuerdos de {config.honoree}
          </h2>
          <p className="text-sm font-light text-zinc-400">
            Después de la fiesta, este será el lugar para ver y compartir los recuerdos entre todos.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F0F] p-2 shadow-2xl sm:p-4">
          <div className="group relative aspect-video overflow-hidden rounded-2xl bg-black">
            <img src={discoHero} alt="Bolas de espejos para la fiesta" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/50 text-[#E0E0E0] shadow-xl backdrop-blur-sm"><Images className="h-6 w-6" /></div>
            </div>
          </div>

          <div className="p-4 text-center sm:p-6">
            <h3 className="mb-1 font-serif text-2xl font-semibold text-white">Las fotos de la fiesta, en un solo lugar</h3>
            <p className="text-xs font-light text-zinc-400 sm:text-sm">El álbum compartido se habilitará cuando esté disponible.</p>
            {config.eventAlbumUrl && <a href={config.eventAlbumUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 text-xs font-bold uppercase tracking-wider text-black">Ver y subir fotos <ExternalLink className="h-4 w-4" /></a>}
          </div>
        </div>
      </div>
    </section>
  );
};
