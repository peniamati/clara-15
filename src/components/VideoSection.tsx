import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Film, Play, Sparkles } from 'lucide-react';

export const VideoSection: React.FC = () => {
  const { config } = useEvent();
  const [activeVideoTab, setActiveVideoTab] = useState<'presentacion' | 'recuerdos' | 'sorpresa'>('presentacion');

  const videos = {
    presentacion: {
      title: 'Tráiler Oficial de los 15 Años',
      desc: 'Una mirada cinematográfica a los preparativos, el vestuario y la emoción de este gran año.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?si=preview'
    },
    recuerdos: {
      title: 'Video de Recuerdos & Infancia',
      desc: 'Momentos en familia desde los primeros meses hasta hoy.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?si=preview'
    },
    sorpresa: {
      title: 'Video Sorpresa de la Corte de Honor',
      desc: 'Mensajes secretos grabados por sus amigas y compañeros de colegio.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?si=preview'
    }
  };

  const current = videos[activeVideoTab];

  return (
    <section className="py-24 bg-[#050505] text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Film className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Cinemática Exclusiva</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Cine & Recuerdos de {config.honoree}
          </h2>
          <p className="text-zinc-400 text-sm font-light">
            Disfruta de las producciones audiovisuales creadas especialmente para esta gran gala.
          </p>

          {/* Video selector buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {(['presentacion', 'recuerdos', 'sorpresa'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveVideoTab(tab)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeVideoTab === tab
                    ? 'bg-[#C0C0C0] text-black font-bold shadow-lg shadow-[#C0C0C0]/20'
                    : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white hover:border-[#C0C0C0]/30'
                }`}
              >
                {tab === 'presentacion' ? 'Tráiler Presentación' : tab === 'recuerdos' ? 'Video Recuerdos' : 'Video Sorpresa'}
              </button>
            ))}
          </div>
        </div>

        {/* Video Player Display */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0F0F0F] shadow-2xl p-2 sm:p-4">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative flex items-center justify-center">
            {/* Visual Thumbnail Frame */}
            <iframe
              src={current.embedUrl}
              title={current.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="p-4 sm:p-6 text-center">
            <h3 className="font-serif text-2xl font-semibold text-white mb-1">{current.title}</h3>
            <p className="text-zinc-400 text-xs sm:text-sm font-light">{current.desc}</p>
          </div>
        </div>

      </div>
    </section>
  );
};
