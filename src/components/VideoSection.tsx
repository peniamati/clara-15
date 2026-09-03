import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Film, Play, Sparkles } from 'lucide-react';
import discoInvitation from '../assets/disco-invitation.png';

export const VideoSection: React.FC = () => {
  const { config } = useEvent();
  const [activeMoment, setActiveMoment] = useState<'presentacion' | 'recuerdos' | 'sorpresa'>('presentacion');

  const moments = {
    presentacion: {
      title: 'Una noche para brillar',
      desc: 'La cuenta regresiva ya empezó: preparate para celebrar, bailar y compartir una noche inolvidable.',
    },
    recuerdos: {
      title: 'Recuerdos que nos trajeron hasta acá',
      desc: 'Muy pronto vamos a sumar aquí las fotos y videos reales que la familia quiera compartir.',
    },
    sorpresa: {
      title: 'Sorpresas para la pista',
      desc: 'La mejor parte se guarda para la noche de la fiesta. ¡No faltes!',
    },
  };

  const current = moments[activeMoment];

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
            Un adelanto de la estética disco que vamos a vivir juntos.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {(['presentacion', 'recuerdos', 'sorpresa'] as const).map((moment) => (
              <button
                key={moment}
                type="button"
                onClick={() => setActiveMoment(moment)}
                aria-pressed={activeMoment === moment}
                className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeMoment === moment
                    ? 'bg-[#C0C0C0] text-black shadow-lg shadow-[#C0C0C0]/20'
                    : 'border border-white/10 bg-zinc-900/80 text-zinc-400 hover:border-[#C0C0C0]/50 hover:text-white'
                }`}
              >
                {moment === 'presentacion' ? 'La gala' : moment === 'recuerdos' ? 'Recuerdos' : 'Sorpresas'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F0F] p-2 shadow-2xl sm:p-4">
          <div className="group relative aspect-video overflow-hidden rounded-2xl bg-black">
            <img src={discoInvitation} alt="Bolas de espejos para la fiesta" className="h-full w-full object-cover object-top opacity-80 transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/50 text-[#E0E0E0] shadow-xl backdrop-blur-sm">
                {activeMoment === 'sorpresa' ? <Sparkles className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
              </div>
            </div>
          </div>

          <div className="p-4 text-center sm:p-6">
            <h3 className="mb-1 font-serif text-2xl font-semibold text-white">{current.title}</h3>
            <p className="text-xs font-light text-zinc-400 sm:text-sm">{current.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
