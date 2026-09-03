import React from 'react';
import { useEvent } from '../context/EventContext';
import { Heart, Share2, Volume2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { config, isAudioPlaying, setIsAudioPlaying } = useEvent();

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: `${config.title} · Invitación Web`,
        text: `¡Estás invitado a la fiesta de 15 años de ${config.honoree}! Confirmá tu presencia aquí:`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace de la invitación copiado al portapapeles!');
    }
  };

  return (
    <footer className="bg-[#050505] text-white border-t border-white/10 py-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Monogram Logo */}
        <div className="w-16 h-16 rounded-full bg-[#C0C0C0] text-black font-serif font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#C0C0C0]/20">
          {config.honoree ? config.honoree.charAt(0).toUpperCase() : 'C'}
        </div>

        <h3 className="font-serif text-4xl sm:text-5xl font-semibold silver-gradient-text mb-2">
          {config.honoree} · Mis 15 Años
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-8 font-light">
          Una celebración inolvidable. Gracias por formar parte de nuestra historia y acompañarnos en esta gala.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={handleShareApp}
            className="px-6 py-2.5 rounded-full bg-zinc-900 border border-white/10 text-[#C0C0C0] hover:border-[#C0C0C0]/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" /> Compartir Invitación
          </button>

          <button
            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
            className="px-6 py-2.5 rounded-full bg-zinc-900 border border-white/10 text-[#C0C0C0] hover:border-[#C0C0C0]/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <Volume2 className="w-4 h-4" /> {isAudioPlaying ? 'Pausar Música de Fondo' : 'Reproducir Vals'}
          </button>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-light">
          <div>
            © 2026 {config.honoree} 15 Years. Todos los derechos reservados.
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
