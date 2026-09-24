import { notify } from '../lib/notify';
import React, { useRef, useState } from 'react';
import { useEvent } from '../context/EventContext';
import confetti from 'canvas-confetti';
import { notifyOrganizer, ORGANIZER_EMAIL_ENABLED } from '../lib/driveUtils';
import { isMinorGuest, parseGuestAge } from '../lib/rsvpAge';
import { FamilyMemberDraft, prepareFamilyGuests } from '../lib/rsvpFamily';
import {
  CheckCircle2,
  XCircle,
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
  HeartHandshake,
  Plus,
  Trash2
} from 'lucide-react';

export const RsvpForm: React.FC = () => {
  const { config, addGuestGroupRsvp, trackEvent } = useEvent();
  const hasTrackedStart = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('15');
  const [status, setStatus] = useState<'CONFIRMED' | 'DECLINED'>('CONFIRMED');
  const [tutorName, setTutorName] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [otherMembers, setOtherMembers] = useState<FamilyMemberDraft[]>([]);
  const [primaryResponsibleAdultId, setPrimaryResponsibleAdultId] = useState('');
  const [notes, setNotes] = useState('');
  const [wantsEmailNotification, setWantsEmailNotification] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const numericAge = parseGuestAge(age);
  const isMinor = isMinorGuest(numericAge);
  const members: FamilyMemberDraft[] = [
    { id: 'primary', name, lastName, age, phone, email, dietaryRestrictions: selectedDietary, responsibleAdultId: primaryResponsibleAdultId },
    ...otherMembers
  ];
  const adults = members.filter(member => {
    const value = parseGuestAge(member.age);
    return value !== null && !isMinorGuest(value);
  });
  const hasMinor = members.some(member => isMinorGuest(parseGuestAge(member.age)));
  const addMember = () => setOtherMembers(previous => [...previous, {
    id: crypto.randomUUID(), name: '', lastName: '', age: '', phone: '', email: '', dietaryRestrictions: []
  }]);
  const updateMember = (id: string, change: Partial<FamilyMemberDraft>) =>
    setOtherMembers(previous => previous.map(member => member.id === id ? { ...member, ...change } : member));

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
      setSelectedDietary([item]);
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
    const prepared = prepareFamilyGuests(members, status, { name: tutorName, phone: tutorPhone }, notes);
    if (prepared.error) {
      setError(prepared.error);
      requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return;
    }

    if (saving) return;
    setSaving(true);
    setError('');
    try {
    await addGuestGroupRsvp(prepared.guests);

    setSubmitted(true);
    if (ORGANIZER_EMAIL_ENABLED && wantsEmailNotification) {
      notifyOrganizer('rsvp', {
        guest: members.map(member => `${member.name.trim()} ${member.lastName.trim()}`).join(', '),
        status,
        phone: prepared.guests[0].phone || '',
        email: email.trim(),
        notes: notes.trim(),
        adminEmail: (config.adminEmails?.length ? config.adminEmails : ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com']).join(',')
      });
    }
    requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    void trackEvent(status === 'CONFIRMED' ? 'rsvp_complete' : 'rsvp_declined');

    if (status === 'CONFIRMED') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    } catch {
      setError('No se pudo guardar el grupo. Revisá tu conexión e intentá nuevamente.');
      requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
    finally { setSaving(false); }
  };

  const sendWhatsAppConfirmation = () => {
    const group = members.map(member => `${member.name.trim()} ${member.lastName.trim()}`).join(', ');
    const text = `¡Hola ${config.honoree}! ${members.length > 1 ? `Somos ${group}.` : `Soy ${group}${numericAge !== null ? ` (${numericAge} años)` : ''}.`} ${
      status === 'CONFIRMED'
        ? `¡Confirmamos la asistencia de ${members.length} ${members.length === 1 ? 'persona' : 'personas'} para tu fiesta de 15!`
        : 'Lamentablemente no podré asistir a tus 15 años, ¡te deseo una noche fantástica e inolvidable!'
    }`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const resetForAnotherGuest = () => {
    setName(''); setLastName(''); setPhone(''); setEmail(''); setAge('15');
    setStatus('CONFIRMED'); setTutorName(''); setTutorPhone('');
    setSelectedDietary([]); setOtherMembers([]); setPrimaryResponsibleAdultId(''); setNotes(''); setWantsEmailNotification(false); setError(''); setSubmitted(false);
    requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <section ref={sectionRef} id="rsvp" className="scroll-mt-4 py-24 bg-[#050505] text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {error && <p role="alert" className="rounded-xl bg-red-950 p-4">{error}</p>}
        {saving && <p role="status">Guardando tu respuesta…</p>}
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Confirmación Oficial</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Confirmar Asistencia (RSVP)
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Por favor confirmá tu presencia antes del <strong className="text-[#C0C0C0] font-semibold">{new Date(`${config.rsvpDeadline}T12:00:00`).toLocaleDateString('es-AR')}</strong> y contanos si necesitás un menú especial.
          </p>
        </div>

        {submitted ? (
          /* Confirmation Screen */
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#C0C0C0]/20 border border-[#C0C0C0] text-[#C0C0C0] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#C0C0C0]" />
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-2">
              {status === 'CONFIRMED' ? '¡Asistencia Confirmada!' : 'Respuesta Registrada'}
            </h3>
            <p className="text-zinc-300 text-sm max-w-md mx-auto mb-8 font-light">
              {status === 'CONFIRMED'
                ? `¡Gracias, ${name}! ${members.length === 1 ? 'Tu respuesta quedó guardada' : `Quedaron guardadas las ${members.length} confirmaciones de tu grupo`}.`
                : 'Agradecemos que nos hayas avisado. ¡Te enviaremos las fotos y el resumen de la fiesta!'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={sendWhatsAppConfirmation}
                className="px-8 py-3.5 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#C0C0C0]/20 hover:bg-[#E0E0E0] transition-all"
              >
                <Share2 className="w-4 h-4" /> Enviar por WhatsApp
              </button>
              <button
                onClick={resetForAnotherGuest}
                className="px-8 py-3.5 rounded-full bg-zinc-900 border border-white/10 text-white text-xs font-semibold tracking-wider uppercase hover:border-[#C0C0C0]/30 transition-all"
              >
                Confirmar otro grupo
              </button>
            </div>
          </div>
        ) : (
          /* RSVP Form */
          <form onSubmit={handleSubmit} onFocusCapture={() => { if (!hasTrackedStart.current) { hasTrackedStart.current = true; void trackEvent('rsvp_start'); } }} className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-xl">
            
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

              {!isMinor && <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  WhatsApp / Celular *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Edad (Años) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="1"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ej. 15"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
                <p className="mt-1 text-xs text-zinc-500">Si tiene menos de un año, ingresá 0.</p>
              </div>

              {!isMinor && <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Email <span className="text-zinc-500 font-normal lowercase">(opcional, como dato de contacto)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>}
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#C0C0C0]" />
                <h3 className="font-serif text-xl font-semibold">Grupo familiar o acompañantes</h3>
              </div>
              <p className="text-xs text-zinc-400">Agregá a todas las personas en una sola confirmación. Cada integrante tendrá su propio registro para el ingreso y el menú.</p>
              {otherMembers.map((member, index) => {
                const memberAge = parseGuestAge(member.age);
                const memberIsMinor = isMinorGuest(memberAge);
                return <div key={member.id} className="rounded-2xl border border-white/15 bg-zinc-900/60 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold">Persona {index + 2}</h4>
                    <button type="button" onClick={() => setOtherMembers(previous => previous.filter(item => item.id !== member.id))} aria-label={`Quitar persona ${index + 2}`} className="flex items-center gap-1 rounded-lg p-2 text-xs text-rose-300 hover:bg-rose-950/40"><Trash2 className="h-4 w-4" /> Quitar</button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="text-xs text-zinc-300">Nombre *
                      <input type="text" required value={member.name} onChange={event => updateMember(member.id, { name: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white" />
                    </label>
                    <label className="text-xs text-zinc-300">Apellido *
                      <input type="text" required value={member.lastName} onChange={event => updateMember(member.id, { lastName: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white" />
                    </label>
                    <label className="text-xs text-zinc-300">Edad (años) *
                      <input type="number" min="0" max="99" step="1" required value={member.age} onChange={event => updateMember(member.id, { age: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white" />
                    </label>
                    {memberAge !== null && !memberIsMinor && <label className="text-xs text-zinc-300">WhatsApp / Celular *
                      <input type="tel" required value={member.phone} onChange={event => updateMember(member.id, { phone: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white" />
                    </label>}
                    {memberAge !== null && !memberIsMinor && <label className="text-xs text-zinc-300 sm:col-span-2">Email (opcional)
                      <input type="email" value={member.email} onChange={event => updateMember(member.id, { email: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white" />
                    </label>}
                  </div>
                  {status === 'CONFIRMED' && <div>
                    <p className="mb-2 text-xs text-zinc-300">Menú especial de esta persona</p>
                    <div className="flex flex-wrap gap-2">{dietaryOptions.map(option => <button key={option} type="button" onClick={() => {
                      const current = member.dietaryRestrictions;
                      updateMember(member.id, { dietaryRestrictions: option.startsWith('Ninguna') ? [option] : current.includes(option) ? current.filter(item => item !== option) : [...current.filter(item => !item.startsWith('Ninguna')), option] });
                    }} className={`rounded-xl border px-3 py-2 text-xs ${member.dietaryRestrictions.includes(option) ? 'border-[#C0C0C0] bg-white/10 text-white' : 'border-white/10 text-zinc-400'}`}>{option}</button>)}</div>
                  </div>}
                  {status === 'CONFIRMED' && memberIsMinor && adults.length > 1 && <label className="block text-xs text-zinc-300">Adulto responsable de esta persona
                    <select value={member.responsibleAdultId || adults[0].id} onChange={event => updateMember(member.id, { responsibleAdultId: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white">
                      {adults.map(adult => <option key={adult.id} value={adult.id}>{adult.name} {adult.lastName}</option>)}
                    </select>
                  </label>}
                  {status === 'CONFIRMED' && memberIsMinor && adults.length === 1 && <p className="text-xs text-zinc-400">Contacto responsable: {adults[0].name} {adults[0].lastName}</p>}
                </div>;
              })}
              <button type="button" onClick={addMember} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#C0C0C0]/40 px-4 py-3 text-sm font-semibold text-[#C0C0C0] hover:bg-white/10"><Plus className="h-4 w-4" /> Agregar otra persona</button>
            </div>

            {status === 'CONFIRMED' && isMinor && adults.length > 1 && <label className="block text-xs text-zinc-300">Adulto responsable de {name || 'la primera persona'}
              <select value={primaryResponsibleAdultId || adults[0].id} onChange={event => setPrimaryResponsibleAdultId(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white">
                {adults.map(adult => <option key={adult.id} value={adult.id}>{adult.name} {adult.lastName}</option>)}
              </select>
            </label>}

            {/* Conditional Tutor/Guardian Section for Guests Under 18 */}
            {status === 'CONFIRMED' && hasMinor && adults.length === 0 && (
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-[#C0C0C0]/30 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C0C0C0]">
                  <ShieldCheck className="w-4 h-4 text-[#C0C0C0]" />
                  <span>Contacto de Padre, Madre o Tutor Responsable</span>
                  <span className="text-[10px] lowercase px-2 py-0.5 rounded-full bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 text-zinc-300 font-normal">
                    requerido para menores de 18
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-light">
                  No agregaste un adulto al grupo. Ingresá un solo contacto responsable para todos los menores.
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

            {ORGANIZER_EMAIL_ENABLED && <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-4 text-sm text-zinc-300">
              <input type="checkbox" checked={wantsEmailNotification} onChange={event => setWantsEmailNotification(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C0C0C0]" />
              <span>Avisar también por email al organizador <span className="block text-xs text-zinc-500">El aviso se enviará automáticamente. Tu confirmación siempre quedará visible en el panel.</span></span>
            </label>}

            {/* Submit Button */}
            <button
              type="submit" disabled={saving}
              className="w-full py-4 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs tracking-widest uppercase hover:bg-[#E0E0E0] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#C0C0C0]/10"
            >
              <Send className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : `Registrar ${members.length} ${members.length === 1 ? 'persona' : 'personas'}`}</span>
            </button>

          </form>
        )}

      </div>
    </section>
  );
};
