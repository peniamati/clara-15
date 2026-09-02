import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] text-white"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl mb-6 text-[#C0C0C0]" style={{ fontFamily: 'var(--font-heading)' }}>
              {config.eventTitle}
            </h1>
            <p className="text-zinc-400 mb-12 tracking-widest uppercase text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              Estás invitado
            </p>
            <button
              onClick={handleEnter}
              className="group relative px-8 py-4 bg-[#C0C0C0] text-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg shadow-[#C0C0C0]/20 flex items-center justify-center gap-3 mx-auto"
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
