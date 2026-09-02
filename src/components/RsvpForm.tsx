import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  QrCode,
  Share2,
  Send,
  Calendar,
  UtensilsCrossed,
  Users,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Phone,
  User,
  HeartHandshake
} from 'lucide-react';
import QRCode from 'qrcode';

export const RsvpForm: React.FC = () => {
  const { config, addOrUpdateGuestRsvp, activeGuest } = useEvent();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('15');
  const [status, setStatus] = useState<'CONFIRMED' | 'DECLINED'>('CONFIRMED');
  const [tutorName, setTutorName] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  const [submitted, setSubmitted] = useState(false);
  const [confirmedGuest, setConfirmedGuest] = useState<any>(null);
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string | null>(null);

  const numericAge = parseInt(age, 10) || 0;
  const isMinor = numericAge > 0 && numericAge < 18;

  const dietaryOptions = [
    'Ninguna (Menú General)',
    'Vegetariano',
    'Vegano',
    'Sin TACC / Celíaco',
    'Sin lactosa',
    'Diabético',
    'Kosher',
    'Alergia Frutos Secos / Mariscos'
  ];

  const handleDietaryToggle = (item: string) => {
    if (item.startsWith('Ninguna')) {
      setSelectedDietary(['Ninguna']);
      return;
    }
    const filtered = selectedDietary.filter(i => !i.startsWith('Ninguna'));
    if (filtered.includes(item)) {
      setSelectedDietary(filtered.filter(i => i !== item));
    } else {
      setSelectedDietary([...filtered, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !lastName.trim()) {
      alert('Por favor completa tu nombre y apellido.');
      return;
    }

    if (status === 'CONFIRMED' && isMinor && (!tutorName.trim() || !tutorPhone.trim())) {
      alert('Al ser menor de 18 años, por favor ingresa el nombre y teléfono de contacto de tu padre, madre o tutor responsable.');
      return;
    }

    const savedGuest = addOrUpdateGuestRsvp({
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: numericAge,
      tutorName: isMinor ? tutorName.trim() : undefined,
      tutorPhone: isMinor ? tutorPhone.trim() : undefined,
      emergencyContactName: isMinor ? tutorName.trim() : undefined,
      emergencyContactPhone: isMinor ? tutorPhone.trim() : undefined,
      status,
      adultsCount: 1,
      kidsCount: 0,
      dietaryRestrictions: selectedDietary.length > 0 ? selectedDietary : ['Menú Estándar'],
      notes: notes.trim()
    });

    setConfirmedGuest(savedGuest);

    // Generate QR Code data URL
    try {
      const qrUrl = await QRCode.toDataURL(savedGuest.qrCode, { width: 300, margin: 2 });
      setGeneratedQrDataUrl(qrUrl);
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);

    if (status === 'CONFIRMED') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const currentGuest = confirmedGuest || activeGuest;

  const sendWhatsAppConfirmation = () => {
    const text = `¡Hola ${config.honoree}! Soy ${name} ${lastName}${numericAge ? ` (${numericAge} años)` : ''}. ${
      status === 'CONFIRMED'
        ? `¡Confirmé mi asistencia para tu fiesta de 15! ${isMinor ? `(Contacto tutor: ${tutorName} - ${tutorPhone}). ` : ''}Mi código de pase de ingreso es: ${currentGuest?.qrCode || 'QR-PASS'}`
        : 'Lamentablemente no podré asistir a tus 15 años, ¡te deseo una noche fantástica e inolvidable!'
    }`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="rsvp" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Confirmación Oficial</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Confirmar Asistencia (RSVP)
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Por favor confirma tu presencia antes del <strong className="text-[#C0C0C0] font-semibold">{config.rsvpDeadline}</strong> para la asignación de tu mesa y selección de menú.
          </p>
        </div>

        {submitted ? (
          /* Confirmation Pass Screen */
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#C0C0C0]/20 border border-[#C0C0C0] text-[#C0C0C0] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#C0C0C0]" />
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-2">
              {status === 'CONFIRMED' ? '¡Asistencia Confirmada!' : 'Respuesta Registrada'}
            </h3>
            <p className="text-zinc-300 text-sm max-w-md mx-auto mb-8 font-light">
              {status === 'CONFIRMED'
                ? `¡Nos emociona contar contigo ${name}! A continuación tienes tu Pase Digital Inteligente de Ingreso.`
                : 'Agradecemos que nos hayas avisado. ¡Te enviaremos las fotos y el resumen de la fiesta!'}
            </p>

            {status === 'CONFIRMED' && (
              <div className="max-w-sm mx-auto bg-[#050505] border border-[#C0C0C0]/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#C0C0C0]" />
                
                <span className="text-[10px] text-[#C0C0C0] uppercase tracking-widest font-bold block mb-1">Pase Digital VIP</span>
                <h4 className="font-serif text-2xl font-semibold text-white">{config.honoree} · Mis 15</h4>
                <p className="text-xs text-zinc-400 mb-4">{config.venue} · {config.address}</p>

                {generatedQrDataUrl && (
                  <img src={generatedQrDataUrl} alt="QR Pass" className="w-48 h-48 mx-auto rounded-xl border border-white/10 p-2 bg-white my-3 shadow-md" />
                )}

                <div className="text-left text-xs bg-zinc-900/90 p-4 rounded-2xl border border-white/10 space-y-1.5 my-3">
                  <div><strong className="text-[#C0C0C0]">Invitado:</strong> {name} {lastName}</div>
                  {numericAge > 0 && (
                    <div><strong className="text-[#C0C0C0]">Edad:</strong> {numericAge} años {isMinor && <span className="text-zinc-400 font-normal">(Menor de 18)</span>}</div>
                  )}
                  {isMinor && tutorName && (
                    <div className="pt-1 border-t border-white/10">
                      <strong className="text-[#C0C0C0]">Tutor / Contacto:</strong> {tutorName} ({tutorPhone})
                    </div>
                  )}
                  <div><strong className="text-[#C0C0C0]">Mesa Asignada:</strong> #{currentGuest?.tableNumber || 1}</div>
                  <div><strong className="text-[#C0C0C0]">Menú:</strong> {selectedDietary.length > 0 ? selectedDietary.join(', ') : 'Estándar'}</div>
                </div>

                <span className="text-[10px] font-mono text-zinc-500 uppercase">{currentGuest?.qrCode}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={sendWhatsAppConfirmation}
                className="px-8 py-3.5 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#C0C0C0]/20 hover:bg-[#E0E0E0] transition-all"
              >
                <Share2 className="w-4 h-4" /> Enviar por WhatsApp
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-3.5 rounded-full bg-zinc-900 border border-white/10 text-white text-xs font-semibold tracking-wider uppercase hover:border-[#C0C0C0]/30 transition-all"
              >
                Editar Respuesta
              </button>
            </div>
          </div>
        ) : (
          /* RSVP Form */
          <form onSubmit={handleSubmit} className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-xl">
            
            {/* Status Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setStatus('CONFIRMED')}
                className={`p-4 rounded-2xl border font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  status === 'CONFIRMED'
                    ? 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-white shadow-lg shadow-[#C0C0C0]/10'
                    : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#C0C0C0]" />
                <span>¡Sí, Confirmo!</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('DECLINED')}
                className={`p-4 rounded-2xl border font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  status === 'DECLINED'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : 'bg-zinc-900 border-white/10 text-zinc-400'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>No podré asistir</span>
              </button>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Apellido *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">WhatsApp / Celular *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Edad (Años) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="99"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ej. 15"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Email <span className="text-zinc-500 font-normal lowercase">(opcional, para enviarte el pase por correo)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>
            </div>

            {/* Conditional Tutor/Guardian Section for Guests Under 18 */}
            {status === 'CONFIRMED' && isMinor && (
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-[#C0C0C0]/30 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C0C0C0]">
                  <ShieldCheck className="w-4 h-4 text-[#C0C0C0]" />
                  <span>Contacto de Padre, Madre o Tutor Responsable</span>
                  <span className="text-[10px] lowercase px-2 py-0.5 rounded-full bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 text-zinc-300 font-normal">
                    requerido para menores de 18
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-light">
                  Por seguridad y organización del salón, solicitamos los datos de un adulto responsable en caso de cualquier necesidad durante la fiesta.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                      Nombre y Apellido del Tutor *
                    </label>
                    <input
                      type="text"
                      required
                      value={tutorName}
                      onChange={(e) => setTutorName(e.target.value)}
                      placeholder="Nombre de mamá, papá o tutor"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:border-[#C0C0C0] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                      Teléfono / WhatsApp de Urgencias *
                    </label>
                    <input
                      type="tel"
                      required
                      value={tutorPhone}
                      onChange={(e) => setTutorPhone(e.target.value)}
                      placeholder="+54 9 11 9876-5432"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:border-[#C0C0C0] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {status === 'CONFIRMED' && (
              /* Dietary Restrictions Checklist */
              <div className="pt-4 border-t border-white/10">
                <label className="block text-xs font-semibold text-zinc-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <UtensilsCrossed className="w-4 h-4 text-[#C0C0C0]" />
                  <span>Menú Especial / Restricciones Alimentarias</span>
                </label>

                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => {
                    const isSelected = selectedDietary.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleDietaryToggle(option)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-white font-semibold'
                            : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isSelected && '✓ '} {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="pt-4 border-t border-white/10">
              <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-[#C0C0C0]" /> Mensaje o Dedicatoria para Clara
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe un mensajito o deseo para Clara en sus 15 años..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs tracking-widest uppercase hover:bg-[#E0E0E0] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#C0C0C0]/10"
            >
              <Send className="w-4 h-4" />
              <span>Confirmar Asistencia & Obtener Mi Pase QR</span>
            </button>

          </form>
        )}

      </div>
    </section>
  );
};

