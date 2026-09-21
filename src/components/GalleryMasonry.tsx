import { notify } from '../lib/notify';
import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Camera, ZoomIn, Download, Share2, Heart, X, Sparkles } from 'lucide-react';

export const GalleryMasonry: React.FC = () => {
  const { config } = useEvent();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const galleryImages = config.gallery || [];

  const handleShare = (url: string) => {
    if (navigator.share) {
      navigator.share({ title: `Galería ${config.honoree}`, url });
    } else {
      navigator.clipboard.writeText(url);
      notify('¡Enlace de imagen copiado al portapapeles!');
    }
  };

  return (
    <section id="galeria" className="py-24 bg-[#050505] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Camera className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Álbum de Producción</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-4">
            Galería Fotográfica
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Recorré las fotos oficiales del book de 15 de Clara. Hacé clic para verlas en alta definición.
          </p>
          <div className="mt-8 inline-flex rounded-full border border-white/10 bg-zinc-900/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#C0C0C0]">Book de 15 · {galleryImages.length} Fotos</div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map(img => (
            <div
              key={img.id}
              onClick={() => {
                if (!failedImages[img.id]) setSelectedPhoto(img.url);
              }}
              className="relative group overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F0F] cursor-pointer shadow-2xl hover:border-[#C0C0C0]/40 transition-all duration-300"
            >
              {!failedImages[img.id] ? (
                <img
                  src={img.url}
                  alt={img.title}
                  onError={() => setFailedImages(prev => ({ ...prev, [img.id]: true }))}
                  className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-b from-zinc-900 to-black flex flex-col items-center justify-center p-6 text-center border border-white/5">
                  <div className="w-14 h-14 rounded-full bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 flex items-center justify-center text-[#C0C0C0] mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-[#C0C0C0]" />
                  </div>
                  <span className="text-zinc-200 font-serif text-base font-semibold">{img.title}</span>
                  <span className="text-[11px] text-[#C0C0C0]/80 mt-1 font-mono bg-zinc-950/80 px-3 py-1 rounded-full border border-white/10">
                    public{img.url}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-2">Copia la foto a esta ruta para verla acá</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end pointer-events-none">
                <span className="text-[#C0C0C0] text-xs font-semibold uppercase tracking-widest">{img.category}</span>
                <h3 className="font-serif text-2xl font-semibold text-white mt-1">{img.title}</h3>
                {!failedImages[img.id] && (
                  <div className="flex items-center gap-3 mt-3 text-[#C0C0C0] text-xs uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5"/> Ampliar</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {galleryImages.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-white/15 bg-[#0F0F0F] px-6 py-14 text-center text-sm text-zinc-400">
              Las fotos del book se publicarán acá cuando estén listas.
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl p-4 flex items-center justify-center" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <img src={selectedPhoto} alt="Zoom preview" className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border border-white/10 object-contain" />

            <div className="mt-6 flex items-center gap-4">
              <a
                href={selectedPhoto}
                download="Clara_15_Foto.jpg"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#C0C0C0]/20 hover:bg-[#E0E0E0]"
              >
                <Download className="w-4 h-4" /> Descargar HD
              </a>
              <button
                onClick={() => handleShare(selectedPhoto)}
                className="px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 hover:border-[#C0C0C0]/40 hover:text-[#C0C0C0]"
              >
                <Share2 className="w-4 h-4" /> Compartir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
