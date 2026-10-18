import React from 'react';
import { ExternalLink, Images } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { eventAlbumProvider, resolveEventAlbumUrl } from '../lib/eventAlbum';

export const EventPhotoAlbum: React.FC = () => {
  const { config } = useEvent();
  const url = resolveEventAlbumUrl(config.eventAlbumUrl);
  if (config.enableEventAlbum === false || !url) return null;
  const provider = eventAlbumProvider(url);

  return (
    <div id="fotos-fiesta" className="mb-12 rounded-3xl border border-white/20 bg-gradient-to-br from-zinc-800/70 to-[#0F0F0F] p-6 sm:p-9">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300"><Images className="h-4 w-4" aria-hidden="true" /> {provider}</span>
          <h3 className="font-serif text-3xl font-semibold text-white sm:text-4xl">Fotos de la fiesta</h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">Volvé a vivir los 15 de {config.honoree}. Mirá las fotos y los videos del álbum compartido.</p>
          <p className="mt-2 text-xs text-zinc-400">Si el álbum permite colaborar, también podés agregar tus recuerdos desde allí.</p>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-zinc-200">
          Ver álbum de la fiesta <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};
