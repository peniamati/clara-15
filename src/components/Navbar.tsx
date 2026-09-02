import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import {
  Music,
  Volume2,
  VolumeX,
  QrCode,
  ShieldCheck,
  Sun,
  Moon,
  Type,
  Eye,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenQrPass: () => void;
  onOpenAdmin: () => void;
  onOpenGiantScreen: () => void;
  onOpenCheckIn: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQrPass,
  onOpenAdmin,
  onOpenGiantScreen,
  onOpenCheckIn,
}) => {
  const { config, isPlayingMusic, setIsPlayingMusic, accessibility, setAccessibility, activeGuest } = useEvent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accMenuOpen, setAccMenuOpen] = useState(false);

  const toggleMusic = () => {
    setIsPlayingMusic(prev => !prev);
  };

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Historia', href: '#historia' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Evento', href: '#evento' },
    { name: 'RSVP', href: '#rsvp' },
    { name: 'Playlist', href: '#playlist' },
    { name: 'Firmas', href: '#firmas' },
    { name: 'Regalos', href: '#regalos' },
    { name: 'Photobooth', href: '#photobooth' },
    { name: 'Juegos', href: '#juegos' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#050505]/90 border-b border-white/10 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#inicio" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C0C0C0] via-amber-200 to-[#997A15] flex items-center justify-center p-[1px] shadow-lg shadow-[#C0C0C0]/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C0C0C0]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-wider text-white group-hover:text-[#C0C0C0] transition-colors">
              {config.honoree}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#C0C0C0] font-semibold">
              {config.eventType} · Gala VIP
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs tracking-widest uppercase font-medium text-zinc-300">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-[#C0C0C0] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C0C0C0] hover:after:w-full after:transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Audio Toggle Button */}
          <button
            onClick={toggleMusic}
            title={isPlayingMusic ? 'Pausar música ambiental' : 'Reproducir música ambiental'}
            className={`p-2.5 rounded-full border transition-all ${
              isPlayingMusic
                ? 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-[#C0C0C0] animate-pulse'
                : 'bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Accessibility Controls Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccMenuOpen(!accMenuOpen)}
              title="Ajustes de accesibilidad"
              className="p-2.5 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-[#C0C0C0] transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>

            {accMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#0F0F0F] border border-white/10 p-4 shadow-2xl z-50 text-xs flex flex-col gap-3 backdrop-blur-2xl">
                <span className="font-serif text-sm text-[#C0C0C0] border-b border-white/10 pb-2 font-semibold">
                  Accesibilidad & Ajustes
                </span>
                
                {/* Font Size Selector */}
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5"><Type className="w-3.5 h-3.5"/> Fuente</span>
                  <div className="flex gap-1">
                    {(['normal', 'large', 'xlarge'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => setAccessibility(a => ({ ...a, fontSize: size }))}
                        className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                          accessibility.fontSize === size
                            ? 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-[#C0C0C0]'
                            : 'border-white/10 text-zinc-400'
                        }`}
                      >
                        {size === 'normal' ? '1x' : size === 'large' ? '1.2x' : '1.4x'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Alto Contraste</span>
                  <button
                    onClick={() => setAccessibility(a => ({ ...a, highContrast: !a.highContrast }))}
                    className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                      accessibility.highContrast
                        ? 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-[#C0C0C0]'
                        : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    {accessibility.highContrast ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* QR Pass / RSVP Button */}
          <a
            href="#rsvp"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#C0C0C0]/10 to-white/10 border border-[#C0C0C0]/40 text-[#C0C0C0] hover:bg-[#C0C0C0]/20 text-xs font-semibold tracking-wide transition-all"
          >
            <QrCode className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Confirmar / Mi Pase</span>
          </a>

          {/* SaaS Admin / Staff Shortcut */}
          <button
            onClick={onOpenAdmin}
            title="Panel de Control del Organizador"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-[#C0C0C0] hover:border-[#C0C0C0]/40 text-xs font-semibold tracking-wide transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Organizador</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0A0A]/95 border-b border-white/10 px-6 py-6 flex flex-col gap-4 backdrop-blur-2xl">
          <nav className="flex flex-col gap-3 font-medium text-zinc-300 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#C0C0C0] py-2 border-b border-white/5"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#rsvp"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 rounded-xl bg-[#C0C0C0]/20 border border-[#C0C0C0]/40 text-[#C0C0C0] text-xs font-semibold flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" /> Confirmar / Mi Pase
            </a>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Organizador
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenCheckIn(); }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                Recepción
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
