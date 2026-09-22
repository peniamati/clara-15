import React from 'react';
import { motion } from 'motion/react';
import { useEvent } from '../context/EventContext';
import { Volume2, Sparkles, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onOpen: () => void;
  onOpenAdmin?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpen, onOpenAdmin }) => {
  const { config, setIsPlayingMusic, trackEvent } = useEvent();

  const handleEnter = () => {
    setIsPlayingMusic(true);
    void trackEvent('invitation_open');
    void trackEvent('music_play');
    onOpen();
  };

  return (
    <div className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col items-center justify-between bg-[#050505] px-4 py-8 sm:py-12 text-white select-none overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(192, 192, 192, 0.15) 0%, rgba(5, 5, 5, 0.95) 70%)'
        }}
      />

      {/* Top Header Monogram */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/10 bg-zinc-950/80 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C0C0C0]">
          <Sparkles className="w-3 h-3 text-[#C0C0C0]" />
          Invitación Formal
        </span>
      </motion.div>

      {/* Central Envelope Card */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-auto my-auto rounded-3xl border border-white/15 bg-gradient-to-b from-[#121212] via-[#0A0A0A] to-[#050505] p-8 sm:p-10 text-center shadow-2xl shadow-black/80"
      >
        {/* Decorative Corner Ornaments */}
        <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-[#C0C0C0]/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[#C0C0C0]/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-[#C0C0C0]/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-[#C0C0C0]/40 rounded-br-sm pointer-events-none" />

        <div className="mb-3 text-xs uppercase tracking-[0.3em] text-[#C0C0C0]/80 font-medium">
          {config.eventType}
        </div>

        <h1 
          className="text-4xl sm:text-5xl md:text-6xl text-white font-serif tracking-tight mb-4 text-balance"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {config.honoree}
        </h1>

        <div className="flex items-center justify-center gap-3 my-5">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C0C0C0]/50" />
          <span className="text-[#C0C0C0] text-xs">✦</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C0C0C0]/50" />
        </div>

        <p className="text-zinc-300 text-sm sm:text-base font-light mb-8 max-w-xs mx-auto leading-relaxed">
          {config.welcomeMessage || '15 años. Una noche. Mil momentos.'}
        </p>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleEnter}
          className="group relative w-full flex items-center justify-center gap-3 rounded-full bg-[#C0C0C0] hover:bg-white text-black px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-[#C0C0C0]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Abrir Invitación</span>
          <Volume2 className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
        </button>

        <p className="mt-4 text-[11px] text-zinc-500 tracking-wider">
          Música ambiental recomendada
        </p>
      </motion.div>

      {/* Bottom Footer Details & Admin Access */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-2 text-center"
      >
        <span className="text-xs text-zinc-500 tracking-widest font-mono">
          {config.date ? new Date(config.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : '2026'} · {config.venue || 'Salón de Fiestas'}
        </span>
        <button
          type="button"
          onClick={onOpenAdmin || (() => { window.location.hash = 'organizador'; })}
          className="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[11px] text-zinc-500 transition-colors hover:bg-white/5 hover:text-[#C0C0C0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C0C0C0]"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Acceso Organizador</span>
        </button>
      </motion.div>
    </div>
  );
};
