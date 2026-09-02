import React, { useState, useEffect } from 'react';
import { useEvent } from '../context/EventContext';
import { Calendar, Clock, Sparkles, Download, Check } from 'lucide-react';

export const Countdown: React.FC = () => {
  const { config } = useEvent();
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(config.date).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ months, days, hours, minutes, seconds });
      } else {
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [config.date]);

  // Google Calendar Link generator
  const getGoogleCalendarUrl = () => {
    const start = new Date(config.date).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(new Date(config.date).getTime() + 8 * 60 * 60 * 1000);
    const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`${config.eventType} ${config.honoree}`);
    const details = encodeURIComponent(`Noche de Gala en ${config.venue}. Dress code: ${config.dressCode}`);
    const location = encodeURIComponent(`${config.venue}, ${config.address}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  // iCal download generator
  const downloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Maestro15//EN
BEGIN:VEVENT
SUMMARY:${config.eventType} ${config.honoree}
DESCRIPTION:Celebración de Gala de 15 Años. Dress code: ${config.dressCode}
LOCATION:${config.venue}, ${config.address}
DTSTART:${new Date(config.date).toISOString().replace(/-|:|\.\d\d\d/g, '')}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${config.honoree.replace(/\s+/g, '_')}_15_Años.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeBlocks = [
    { label: 'Meses', value: timeLeft.months },
    { label: 'Días', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Minutos', value: timeLeft.minutes },
    { label: 'Segundos', value: timeLeft.seconds },
  ];

  return (
    <section id="cuenta-regresiva" className="py-24 bg-[#050505] text-white border-y border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 text-center">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
          <Clock className="w-3.5 h-3.5 text-[#C0C0C0]" />
          <span>Faltan muy pocos días</span>
        </div>

        <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
          Cuenta Regresiva para la Gran Noche
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-14 font-light">
          Cada segundo nos acerca más a un momento inolvidable lleno de emoción, vals y celebración.
        </p>

        {/* Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto mb-14">
          {timeBlocks.map((block) => (
            <div
              key={block.label}
              className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center group hover:border-[#C0C0C0]/40 transition-all duration-300"
            >
              <span className="font-serif text-4xl sm:text-6xl font-bold text-white group-hover:text-[#C0C0C0] transition-colors tracking-tight">
                {String(block.value).padStart(2, '0')}
              </span>
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-widest mt-3">
                {block.label}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Integration Links */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full bg-zinc-900 border border-white/10 text-white hover:border-[#C0C0C0]/40 hover:text-[#C0C0C0] text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg"
          >
            <Calendar className="w-4 h-4 text-[#C0C0C0]" />
            <span>Agregar a Google Calendar</span>
          </a>

          <button
            onClick={downloadIcs}
            className="px-6 py-3.5 rounded-full bg-zinc-900 border border-white/10 text-white hover:border-[#C0C0C0]/40 hover:text-[#C0C0C0] text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg"
          >
            <Download className="w-4 h-4 text-[#C0C0C0]" />
            <span>Descargar Evento para Apple Calendar</span>
          </button>
        </div>

      </div>
    </section>
  );
};
