import React from 'react';
import { useEvent } from '../context/EventContext';
import {
  MapPin,
  Calendar,
  Clock,
  Shirt,
  Navigation,
  CloudSun,
  GlassWater,
  Sparkles,
  Utensils,
  Heart,
  Music,
  Film,
  Cake,
  PartyPopper,
  Coffee,
  CheckCircle2
} from 'lucide-react';

export const EventInfoDetails: React.FC = () => {
  const { config, schedule } = useEvent();

  const formattedEventDate = new Date(config.date).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedEventTime = new Date(config.date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'GlassWater': return <GlassWater className="w-5 h-5 text-[#C0C0C0]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#C0C0C0]" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-[#C0C0C0]" />;
      case 'Heart': return <Heart className="w-5 h-5 text-[#C0C0C0]" />;
      case 'Music': return <Music className="w-5 h-5 text-[#C0C0C0]" />;
      case 'Film': return <Film className="w-5 h-5 text-[#C0C0C0]" />;
      case 'Cake': return <Cake className="w-5 h-5 text-[#C0C0C0]" />;
      case 'PartyPopper': return <PartyPopper className="w-5 h-5 text-[#C0C0C0]" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-[#C0C0C0]" />;
      default: return <Sparkles className="w-5 h-5 text-[#C0C0C0]" />;
    }
  };

  return (
    <section id="evento" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <MapPin className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Coordenadas & Horarios</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-4">
            Información de la Celebración
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Todos los detalles para que organices tu llegada, código de vestimenta y disfrutes cada momento.
          </p>
        </div>

        {/* Event Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1: Venue & Address */}
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-between hover:border-[#C0C0C0]/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-[#C0C0C0]" />
              </div>
              <span className="text-[#C0C0C0] text-xs font-bold uppercase tracking-widest">Lugar del Evento</span>
              <h3 className="font-serif text-3xl font-semibold text-white mt-1 mb-3">
                {config.venue}
              </h3>
              <p className="text-zinc-300 text-sm mb-6 leading-relaxed font-light">
                {config.address}, {config.city}
              </p>
            </div>

            {/* GPS Launch Buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
              <span className="text-xs text-zinc-400 font-medium mb-1">Abrir en tu app de navegación:</span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={config.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 hover:text-[#C0C0C0] hover:border-[#C0C0C0]/30 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3 text-[#C0C0C0]" /> Maps
                </a>
                <a
                  href={config.wazeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 hover:text-[#C0C0C0] hover:border-[#C0C0C0]/30 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3 text-[#C0C0C0]" /> Waze
                </a>
                <a
                  href={config.appleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 hover:text-[#C0C0C0] hover:border-[#C0C0C0]/30 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3 text-[#C0C0C0]" /> Apple
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Date & Time */}
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-between hover:border-[#C0C0C0]/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-[#C0C0C0]" />
              </div>
              <span className="text-[#C0C0C0] text-xs font-bold uppercase tracking-widest">Fecha & Recepción</span>
              <h3 className="font-serif text-3xl font-semibold text-white mt-1 mb-2 capitalize">
                {formattedEventDate}
              </h3>
              <div className="flex items-center gap-2 text-[#C0C0C0] font-semibold text-sm mb-4">
                <Clock className="w-4 h-4" /> Recepción {formattedEventTime} HS · Puntual
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed font-light">
                Recepción al aire libre con sushi bar, fondues, appetizers gourmet y barra de cócteles & mocktails antes del ingreso a la pista.
              </p>
            </div>

            {/* Weather Widget Preview */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CloudSun className="w-7 h-7 text-[#C0C0C0]" />
                <div>
                  <span className="text-xs text-zinc-400 block font-medium">Pronóstico de la noche</span>
                  <span className="text-white text-sm font-semibold">22°C · Noche Despejada</span>
                </div>
              </div>
              <span className="text-[10px] text-[#C0C0C0] bg-[#C0C0C0]/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Clima Ideal</span>
            </div>
          </div>

          {/* Card 3: Dress Code */}
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-between hover:border-[#C0C0C0]/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 flex items-center justify-center mb-6">
                <Shirt className="w-6 h-6 text-[#C0C0C0]" />
              </div>
              <span className="text-[#C0C0C0] text-xs font-bold uppercase tracking-widest">Código de Vestimenta</span>
              <h3 className="font-serif text-3xl font-semibold text-white mt-1 mb-3">
                {config.dressCode}
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4 font-light">
                {config.dressCodeDetails}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href="#dresscode"
                className="inline-flex items-center gap-2 text-xs text-[#C0C0C0] font-bold hover:underline tracking-wider uppercase"
              >
                <span>Ver moodboard de sugerencias y colores</span> →
              </a>
            </div>
          </div>

        </div>

        {/* Schedule / Cronograma Timeline */}
        <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h3 className="font-serif text-3xl sm:text-4xl font-semibold silver-gradient-text">
              Cronograma Interactivo de la Fiesta
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 font-light">
              Las etapas se irán activando automáticamente durante el transcurso de la noche.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schedule.map((item, idx) => (
              <div
                key={item.title}
                className={`p-6 rounded-2xl border transition-all ${
                  item.isUnlocked
                    ? 'bg-[#C0C0C0]/10 border-[#C0C0C0] text-white shadow-xl shadow-[#C0C0C0]/10'
                    : 'bg-zinc-900/60 border-white/10 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#050505] border border-white/10 text-[#C0C0C0]">
                    {item.time} HS
                  </span>
                  {getIcon(item.iconName)}
                </div>
                <h4 className="font-serif text-xl font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-xs leading-relaxed font-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Google Maps iFrame Placeholder */}
        <div className="mt-12 rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-80 bg-[#0F0F0F] relative">
          <iframe
            title="Google Maps Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3289.475482930219!2d-58.5398284847741!3d-34.46543198049581!2m3!1f0!0f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb01e8a93d0d5%3A0x6b453915155e8888!2sPalacio%20Sans%20Souci!5e0!3m2!1ses!2sar!4v1689000000000!5m2!1ses!2sar"
            className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-80 hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        </div>

      </div>
    </section>
  );
};
