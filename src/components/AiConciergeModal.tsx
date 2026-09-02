import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Bot, X, Send, Sparkles, MessageCircle } from 'lucide-react';

export const AiConciergeModal: React.FC = () => {
  const { config, activeGuest } = useEvent();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: activeGuest?.name
        ? `¡Hola ${activeGuest.name}! Soy la Asistente Concierge IA de los 15 de ${config.honoree}. ¿En qué te puedo ayudar sobre el evento?`
        : `¡Hola! Soy la Asistente Concierge IA de los 15 de ${config.honoree}. ¿En qué te puedo ayudar sobre el evento?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    '¿Cuál es el dress code?',
    '¿A qué hora empieza la fiesta?',
    `¿Cómo llego a ${config.venue}?`,
    '¿Cuál es el alias para el regalo?'
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    if (!queryText) setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend, guestName: activeGuest?.name })
      });
      const data = await res.json();

      setMessages([...newMessages, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: `La fiesta es en ${config.venue} a las 20:00 HS. El dress code es ${config.dressCode}.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher Bubble */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#C0C0C0] text-black shadow-2xl shadow-[#C0C0C0]/20 hover:scale-110 transition-transform flex items-center gap-2 font-semibold text-xs uppercase tracking-wider"
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline">Concierge IA</span>
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-[#050505] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-fade-in">
          
          {/* Header */}
          <div className="p-4 bg-[#0F0F0F] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C0C0C0]/20 border border-[#C0C0C0] flex items-center justify-center text-[#C0C0C0]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-white text-base">Concierge IA {config.honoree} 15</h4>
                <span className="text-[10px] text-[#C0C0C0] block font-medium uppercase tracking-wider">● En línea 24/7</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'ml-auto bg-[#C0C0C0] text-black font-semibold rounded-br-none'
                    : 'mr-auto bg-[#0F0F0F] border border-white/10 text-zinc-200 rounded-bl-none font-light'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-[#0F0F0F] border border-white/10 text-zinc-400 p-3 rounded-2xl text-xs animate-pulse">
                Consultando agenda de gala...
              </div>
            )}
          </div>

          {/* Quick Chip Questions */}
          <div className="px-3 py-2 border-t border-white/10 flex gap-1.5 overflow-x-auto text-[10px]">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-[#C0C0C0] hover:border-[#C0C0C0]/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0F0F0F] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregunta lo que quieras..."
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#C0C0C0] outline-none"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#C0C0C0] text-black hover:bg-[#E0E0E0] font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
