import React from 'react';
import { useEvent } from '../context/EventContext';
import { Shirt, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const DressCodeMoodboard: React.FC = () => {
  const { config } = useEvent();

  const ladiesLook = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
  ];

  const mensLook = [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  ];

  return (
    <section id="dresscode" className="py-24 bg-[#050505] text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Shirt className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Guía de Estilo & Paleta</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Dress Code: {config.dressCode}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Inspiraciones visuales y paleta de colores para deslumbrar en la noche de gala.
          </p>
        </div>

        {/* Color Palette Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Suggested Colors */}
          <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 text-[#C0C0C0] font-serif font-semibold text-xl mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#C0C0C0]" /> Colores Sugeridos
            </div>
            <div className="flex flex-wrap gap-3">
              {config.suggestedColors.map((color) => (
                <span
                  key={color}
                  className="px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider"
                >
                  ✨ {color}
                </span>
              ))}
            </div>
          </div>

          {/* Forbidden Colors */}
          <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-rose-500/20 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-serif font-semibold text-xl mb-4">
              <XCircle className="w-5 h-5" /> Colores Reservados Exclusivamente
            </div>
            <div className="flex flex-wrap gap-3">
              {config.forbiddenColors.map((color) => (
                <span
                  key={color}
                  className="px-4 py-2 rounded-full bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs font-semibold uppercase tracking-wider"
                >
                  ⛔ {color}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Visual Moodboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Ladies */}
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-serif text-2xl font-semibold text-white mb-4">Damas: Vestidos de Gala & Alta Costura</h3>
            <div className="grid grid-cols-3 gap-3">
              {ladiesLook.map((img, i) => (
                <img key={i} src={img} alt="Ladies look" className="w-full h-48 object-cover rounded-2xl border border-white/10 hover:scale-105 transition-transform" />
              ))}
            </div>
          </div>

          {/* Gentlemen */}
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-serif text-2xl font-semibold text-white mb-4">Caballeros: Smoking, Traje Oscuro & Moño</h3>
            <div className="grid grid-cols-3 gap-3">
              {mensLook.map((img, i) => (
                <img key={i} src={img} alt="Gentlemen look" className="w-full h-48 object-cover rounded-2xl border border-white/10 hover:scale-105 transition-transform" />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
