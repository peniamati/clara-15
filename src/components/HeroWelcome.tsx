import React from 'react';
import { useEvent } from '../context/EventContext';
import { Sparkles, Calendar, Clock, MapPin, ChevronDown } from 'lucide-react';
import discoInvitation from '../assets/disco-invitation.png';

export const HeroWelcome: React.FC = () => {
  const { config } = useEvent();

  const formattedDate = new Date(config.date).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = new Date(config.date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const heroImage = config.heroImageUrl?.includes('photo-1511795409834-ef04bbd61622')
    ? discoInvitation
    : config.heroImageUrl || discoInvitation;

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] text-white pt-20"
    >
      {/* Background Media with Dark Luxury Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={config.honoree}
          className="w-full h-full object-cover object-center filter brightness-40 contrast-125 saturate-90 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-[#050505]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0,transparent_70%)]" />
      </div>

      {/* Floating Subtle Metallic Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#C0C0C0]/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center py-20">
        
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs tracking-widest uppercase mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#C0C0C0]" />
          <span>{config.eventType} · Gala de Quince Años</span>
        </div>

        {/* Main Name Heading in Cormorant Garamond Luxury Serif */}
        <h1 className="font-serif text-6xl sm:text-8xl lg:text-9xl font-semibold tracking-tight silver-gradient-text drop-shadow-2xl mb-4">
          {config.honoree}
        </h1>

        <p className="font-serif italic text-xl sm:text-2xl text-zinc-300 font-light max-w-2xl mb-10 leading-relaxed">
          "{config.welcomeMessage}"
        </p>

        {/* Key Event Badges */}
        <div className="flex flex-wrap justify-center items-center gap-3 text-xs sm:text-sm font-medium text-zinc-200 mb-12">
          <div className="px-5 py-3 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <Calendar className="w-4 h-4 text-[#C0C0C0]" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <Clock className="w-4 h-4 text-[#C0C0C0]" />
            <span>{formattedTime} HS</span>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <MapPin className="w-4 h-4 text-[#C0C0C0]" />
            <span>{config.venue}</span>
          </div>
        </div>

        {/* CTA Primary Button */}
        <a
          href="#historia"
          className="group relative inline-flex items-center justify-center px-10 py-4 rounded-full bg-[#C0C0C0] text-black font-semibold text-sm uppercase tracking-widest hover:bg-[#E0E0E0] transition-all duration-300 shadow-xl shadow-[#C0C0C0]/10 hover:scale-105"
        >
          <span className="flex items-center gap-2">
            Ver Historia & Gala
          </span>
        </a>

        {/* Scroll Indicator */}
        <a
          href="#cuenta-regresiva"
          className="mt-14 text-zinc-400 hover:text-[#C0C0C0] transition-colors animate-bounce flex flex-col items-center gap-1 text-xs tracking-wider"
        >
          <span>Desliza para explorar</span>
          <ChevronDown className="w-4 h-4" />
        </a>

      </div>
    </section>
  );
};
