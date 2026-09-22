import { notify } from '../lib/notify';
import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { 
  MessageSquare, 
  Send, 
  Heart, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  PenTool
} from 'lucide-react';

export const LibroDeFirmas: React.FC = () => {
  const { guestbook, addGuestbookMessage, reactToMessage, config } = useEvent();

  // Guestbook Form States
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const MESSAGES_PER_PAGE = 6;

  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      notify('Por favor escribí tu dedicatoria para Clara.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addGuestbookMessage({
        guestName: guestName.trim() || `Invitado de ${config.honoree}`,
        message: message.trim()
      });

      if (success) {
        setGuestName('');
        setMessage('');
        setCurrentPage(1);
        notify('¡Dedicatoria guardada con éxito en el libro!');
      }
    } catch {
      notify('No se pudo guardar el mensaje. Por favor reintentá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedMessages = [...guestbook].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sortedMessages.length / MESSAGES_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const displayedMessages = sortedMessages.slice(
    (activePage - 1) * MESSAGES_PER_PAGE,
    activePage * MESSAGES_PER_PAGE
  );

  return (
    <section id="firmas" className="py-24 bg-[#050505] text-white relative border-t border-white/10">
      {/* Anchor compatibility for #recuerdos if someone links to it */}
      <div id="recuerdos-firmas" className="relative -top-24" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <PenTool className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Dedicatorias & Mensajes</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Libro de Firmas
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Escribile unas palabras a {config.honoree} que quedarán para siempre en su libro digital.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-5 py-2 text-xs text-zinc-300">
            <MessageSquare className="h-3.5 w-3.5" /> {guestbook.length} dedicatorias
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Signature Form */}
            <div className="lg:col-span-5 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl h-fit">
              <h3 className="font-serif text-2xl font-semibold text-white mb-2 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-[#C0C0C0]" />
                <span>Firmar el Libro</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6 font-light">
                Tus deseos y dedicatorias se verán reflejados al instante en el muro.
              </p>

              <form onSubmit={handleGuestbookSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Tu Nombre o Firma *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej: Familia Gómez / Los tíos de San Juan"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Tu Mensaje de Felicitaciones *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dejale a Clara tus mejores deseos para esta nueva etapa de su vida..."
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#C0C0C0] hover:bg-white text-black font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enviando...' : 'Publicar Dedicatoria'}</span>
                </button>
              </form>
            </div>

            {/* Messages Feed */}
            <div className="lg:col-span-7 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    Dedicatorias Recibidas
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {guestbook.length} mensajes
                  </span>
                </div>

                {sortedMessages.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500 text-xs">
                    Todavía no hay firmas registradas. ¡Sé el primero en firmar el libro de Clara!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedMessages.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-[#C0C0C0]/30 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="font-semibold text-white text-sm font-serif">
                            {item.guestName}
                          </h4>
                          <span className="text-[11px] text-zinc-500">
                            {new Date(item.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed whitespace-pre-wrap">
                          {item.message}
                        </p>

                        {/* Reactions Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => reactToMessage(item.id, 'love')}
                            className="px-3 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
                          >
                            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                            <span>{item.reactions?.love || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => reactToMessage(item.id, 'sparkle')}
                            className="px-3 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>{item.reactions?.sparkle || 0}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                  <button
                    type="button"
                    disabled={activePage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-full hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>Página {activePage} de {totalPages}</span>
                  <button
                    type="button"
                    disabled={activePage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-full hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

        </div>

      </div>
    </section>
  );
};
