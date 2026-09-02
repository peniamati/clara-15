import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { MessageSquare, Heart, Sparkles, Send, Lock, Clock, Image as ImageIcon } from 'lucide-react';

export const Guestbook: React.FC = () => {
  const { guestbook, addGuestbookMessage, reactToMessage, timeCapsule, addTimeCapsuleMessage, config } = useEvent();
  
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Time capsule state
  const [capsuleAuthor, setCapsuleAuthor] = useState('');
  const [capsuleMsg, setCapsuleMsg] = useState('');
  const [unlockAge, setUnlockAge] = useState<18 | 21>(18);
  const [activeSubTab, setActiveSubTab] = useState<'guestbook' | 'capsule'>('guestbook');

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    addGuestbookMessage({
      guestName: guestName || `Amigo de ${config.honoree}`,
      message,
      photoUrl: photoUrl || undefined
    });

    setGuestName('');
    setMessage('');
    setPhotoUrl('');
  };

  const handleCapsuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsuleMsg) return;

    addTimeCapsuleMessage({
      author: capsuleAuthor || 'Anónimo',
      message: capsuleMsg,
      unlockAge
    });

    setCapsuleAuthor('');
    setCapsuleMsg('');
    alert(`¡Tu mensaje ha sido sellado en la Cápsula del Tiempo! Se abrirá cuando ${config.honoree} cumpla ${unlockAge} años.`);
  };

  return (
    <section id="firmas" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Muro de Cariño</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Libro de Firmas & Cápsula
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Dejale tus mejores deseos, fotos o un mensaje secreto guardado para el futuro.
          </p>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setActiveSubTab('guestbook')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeSubTab === 'guestbook'
                  ? 'bg-[#C0C0C0] text-black font-bold shadow-lg shadow-[#C0C0C0]/20'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              📖 Libro de Firmas
            </button>
            <button
              onClick={() => setActiveSubTab('capsule')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeSubTab === 'capsule'
                  ? 'bg-[#C0C0C0] text-black font-bold shadow-lg shadow-[#C0C0C0]/20'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              ⏳ Cápsula del Tiempo
            </button>
          </div>
        </div>

        {activeSubTab === 'guestbook' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form */}
            <div className="lg:col-span-5 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 shadow-2xl h-fit">
              <h3 className="font-serif text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C0C0C0]" /> Dejar una Firma
              </h3>

              <form onSubmit={handleGuestbookSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Tu Nombre</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej: Tía Mariana"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Mensaje o Deseo *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Escribí tus palabras dedicadas para ${config.honoree}...`}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1 uppercase tracking-wider">
                    <ImageIcon className="w-3.5 h-3.5 text-[#C0C0C0]" /> Adjuntar URL de Foto (Opcional)
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Publicar Firma
                </button>
              </form>
            </div>

            {/* Messages Stream */}
            <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {guestbook.map((msg) => (
                <div key={msg.id} className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-semibold text-white text-lg">{msg.guestName}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed mb-4 font-light">{msg.message}</p>

                  {msg.photoUrl && (
                    <img src={msg.photoUrl} alt="Attached" className="w-full h-48 object-cover rounded-xl mb-4 border border-white/10" />
                  )}

                  {/* Reaction Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10 text-xs">
                    <button
                      onClick={() => reactToMessage(msg.id, 'love')}
                      className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-[#C0C0C0]/40 text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      ❤️ {msg.reactions.love}
                    </button>
                    <button
                      onClick={() => reactToMessage(msg.id, 'sparkle')}
                      className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-[#C0C0C0]/40 text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      ✨ {msg.reactions.sparkle}
                    </button>
                    <button
                      onClick={() => reactToMessage(msg.id, 'cheer')}
                      className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-[#C0C0C0]/40 text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      🥂 {msg.reactions.cheer}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* Time Capsule View */
          <div className="max-w-3xl mx-auto bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="text-center mb-6">
              <Lock className="w-10 h-10 text-[#C0C0C0] mx-auto mb-2" />
              <h3 className="font-serif text-3xl font-semibold text-white">Cápsula del Tiempo Digital</h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-light mt-1">
                Escribí un mensaje confidencial que permanecerá bloqueado bajo candado digital hasta el futuro cumpleaños de {config.honoree}.
              </p>
            </div>

            <form onSubmit={handleCapsuleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Tu Nombre o Parentesco</label>
                  <input
                    type="text"
                    value={capsuleAuthor}
                    onChange={(e) => setCapsuleAuthor(e.target.value)}
                    placeholder="Ej: Mamá / Mejor Amigo"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Abrir en el cumpleaños Nº</label>
                  <select
                    value={unlockAge}
                    onChange={(e) => setUnlockAge(Number(e.target.value) as 18 | 21)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                  >
                    <option value={18}>18 Años (2029)</option>
                    <option value={21}>21 Años (2032)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Mensaje para la {config.honoree} del Futuro *</label>
                <textarea
                  required
                  rows={4}
                  value={capsuleMsg}
                  onChange={(e) => setCapsuleMsg(e.target.value)}
                  placeholder="Consejos, recuerdos, profecías o deseos..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#E0E0E0] transition-all shadow-xl shadow-[#C0C0C0]/10"
              >
                🔒 Guardar & Encriptar en la Cápsula
              </button>
            </form>
          </div>
        )}

      </div>
    </section>
  );
};
