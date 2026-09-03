import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvent } from '../context/EventContext';
import { Volume2 } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { config, setIsPlayingMusic } = useEvent();

  const handleEnter = () => {
    setIsPlayingMusic(true);
    setIsOpen(true);
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] min-h-[100dvh] overflow-y-auto overscroll-contain bg-[#050505] px-5 py-10 text-white"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="mx-auto my-auto w-full max-w-md text-center"
          >
            <h1 className="mb-6 break-words px-4 text-4xl text-[#C0C0C0] sm:text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-heading)' }}>
              {config.eventType} de {config.honoree}
            </h1>
            <p className="text-zinc-400 mb-12 tracking-widest uppercase text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              Estás invitado
            </p>
            <button
              type="button"
              onClick={handleEnter}
              className="group relative mx-auto flex min-h-12 touch-manipulation items-center justify-center gap-3 rounded-full bg-[#C0C0C0] px-8 py-4 text-xs font-bold uppercase tracking-widest text-black shadow-lg shadow-[#C0C0C0]/20 transition-all active:scale-[0.97] hover:bg-white"
            >
              <span>Abrir Invitación</span>
              <Volume2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
