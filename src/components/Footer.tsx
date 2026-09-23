import React from 'react';
import { useEvent } from '../context/EventContext';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { config } = useEvent();

  return (
    <footer className="bg-[#050505] text-white border-t border-white/10 py-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Monogram Logo */}
        <div className="w-16 h-16 rounded-full bg-[#C0C0C0] text-black font-serif font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#C0C0C0]/20">
          {config.honoree ? config.honoree.charAt(0).toUpperCase() : 'C'}
        </div>

        <h3 className="heading-safe mx-auto max-w-4xl font-serif text-3xl sm:text-5xl font-semibold silver-gradient-text mb-2">
          {config.honoree} · Mis 15 Años
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-8 font-light">
          Una celebración inolvidable. Gracias por formar parte de nuestra historia y acompañarnos en esta fiesta.
        </p>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-light">
          <div>
            © 2026 Matías Peña · Diseño y desarrollo de la invitación.
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400 font-serif">
            <Heart className="w-3.5 h-3.5 text-[#C0C0C0] fill-[#C0C0C0]" />
            <span>Hecho para celebrar</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
