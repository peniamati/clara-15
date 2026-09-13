import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, BarChart3, CalendarDays, Check, ChevronLeft, ChevronRight,
  CirclePlay, Eye, Heart, MapPin, Menu, MessageCircle, Music2, Palette,
  QrCode, ShieldCheck, Sparkles, Users, X
} from 'lucide-react';

type Draft = {
  eventType: string;
  name: string;
  date: string;
  venue: string;
  style: string;
  modules: string[];
};

const templates = [
  { id: 'disco', name: 'Disco editorial', hint: 'Negro, plata y reflejos', colors: 'from-zinc-950 via-zinc-800 to-neutral-950' },
  { id: 'aurora', name: 'Aurora', hint: 'Violeta, azul y luz', colors: 'from-violet-950 via-indigo-700 to-cyan-800' },
  { id: 'jardin', name: 'Jardín moderno', hint: 'Verde, marfil y calma', colors: 'from-emerald-950 via-emerald-700 to-stone-300' },
  { id: 'editorial', name: 'Editorial bold', hint: 'Color, tipografía y actitud', colors: 'from-rose-600 via-orange-400 to-amber-200' },
];

const features = [
  [Users, 'RSVP inteligente', 'Confirmaciones, acompañantes, menores, menú y contactos en un solo lugar.'],
  [BarChart3, 'Panel en tiempo real', 'Embudo de visitas, respuestas, pendientes, asistencia y exportación.'],
  [QrCode, 'Pases y check-in QR', 'Ingreso ordenado, búsqueda rápida y asignación de mesas.'],
  [Music2, 'Música y playlist', 'Canción de apertura y sugerencias moderadas para el DJ.'],
  [Palette, 'Diseño realmente flexible', 'Plantillas, portada, tipografías, tamaños, colores y módulos.'],
  [ShieldCheck, 'Datos protegidos', 'Permisos por evento, moderación y prácticas de seguridad desde el diseño.'],
] as const;

const plans = [
  { name: 'Esencial', price: '14.900', copy: 'Para celebraciones simples y hermosas.', features: ['Invitación animada', 'RSVP y mapa', 'Cuenta regresiva', 'Cambios ilimitados'] },
  { name: 'Completa', price: '24.900', copy: 'Todo para organizar sin planillas.', popular: true, features: ['Todo Esencial', 'Panel y estadísticas', 'Galería, música y regalos', 'Playlist, QR y mesas', 'Soporte prioritario'] },
  { name: 'Única', price: '39.900', copy: 'Una experiencia con dirección creativa.', features: ['Todo Completa', 'Diseño y animación a medida', 'Carga inicial asistida', 'Acompañamiento por WhatsApp'] },
];

const moduleOptions = ['RSVP', 'Galería', 'Música', 'Dress code', 'Regalos', 'Playlist', 'Mesas y QR', 'Juegos'];

const Builder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ eventType: 'Mis 15', name: '', date: '', venue: '', style: 'disco', modules: ['RSVP', 'Galería', 'Música', 'Dress code'] });
  const selectedTemplate = templates.find(template => template.id === draft.style) || templates[0];
  const canContinue = step !== 0 || Boolean(draft.name.trim() && draft.date);

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  const toggleModule = (name: string) => setDraft(previous => ({
    ...previous,
    modules: previous.modules.includes(name) ? previous.modules.filter(item => item !== name) : [...previous.modules, name],
  }));

  return (
    <motion.div className="fixed inset-0 z-[200] overflow-y-auto bg-black/80 p-3 backdrop-blur-xl sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="builder-title">
      <div className="mx-auto grid min-h-full max-w-6xl place-items-center">
        <motion.div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0d] shadow-2xl" initial={{ y: 24, scale: .98 }} animate={{ y: 0, scale: 1 }}>
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
            <div><p className="text-xs uppercase tracking-[.2em] text-violet-300">Vista previa sin compromiso</p><h2 id="builder-title" className="text-xl font-semibold text-white sm:text-2xl">Armá tu idea en 2 minutos</h2></div>
            <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-white/5 text-white" aria-label="Cerrar configurador"><X /></button>
          </header>
          <div className="grid lg:grid-cols-[1fr_.9fr]">
            <div className="p-5 sm:p-8">
              <div className="mb-8 flex gap-2" aria-label={`Paso ${step + 1} de 4`}>{[0,1,2,3].map(index => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-violet-400' : 'bg-white/10'}`} />)}</div>
              {step === 0 && <div className="space-y-5"><h3 className="text-3xl text-white">Empecemos por lo esencial</h3><label className="block text-sm text-zinc-300">Tipo de evento<select value={draft.eventType} onChange={event => setDraft({...draft,eventType:event.target.value})} className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white"><option>Mis 15</option><option>Casamiento</option><option>Cumpleaños</option><option>Baby shower</option><option>Evento especial</option></select></label><label className="block text-sm text-zinc-300">Nombre protagonista<input value={draft.name} onChange={event => setDraft({...draft,name:event.target.value})} placeholder="Ej. Clara" className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-zinc-300">Fecha<input type="date" value={draft.date} onChange={event => setDraft({...draft,date:event.target.value})} className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white" /></label><label className="block text-sm text-zinc-300">Lugar<input value={draft.venue} onChange={event => setDraft({...draft,venue:event.target.value})} placeholder="Salón o ciudad" className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white" /></label></div></div>}
              {step === 1 && <div><h3 className="mb-2 text-3xl text-white">Elegí una dirección visual</h3><p className="mb-6 text-zinc-400">Después podés cambiar colores, fotos, fuentes y tamaños.</p><div className="grid gap-3 sm:grid-cols-2">{templates.map(template => <button key={template.id} onClick={() => setDraft({...draft,style:template.id})} className={`rounded-2xl border p-3 text-left ${draft.style === template.id ? 'border-violet-400 bg-violet-400/10' : 'border-white/10 bg-white/[.03]'}`}><span className={`mb-3 block h-24 rounded-xl bg-gradient-to-br ${template.colors}`} /><strong className="block text-white">{template.name}</strong><span className="text-sm text-zinc-400">{template.hint}</span></button>)}</div></div>}
              {step === 2 && <div><h3 className="mb-2 text-3xl text-white">Sumá solo lo que necesitás</h3><p className="mb-6 text-zinc-400">La experiencia queda clara, corta y personal.</p><div className="grid gap-3 sm:grid-cols-2">{moduleOptions.map(name => <button key={name} aria-pressed={draft.modules.includes(name)} onClick={() => toggleModule(name)} className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left ${draft.modules.includes(name) ? 'border-violet-400 bg-violet-400/10 text-white' : 'border-white/10 text-zinc-400'}`}><span>{name}</span>{draft.modules.includes(name) && <Check className="h-5 w-5" />}</button>)}</div></div>}
              {step === 3 && <div className="space-y-5"><div className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300"><Check className="mr-2 h-5 w-5" />Tu idea está lista</div><h3 className="text-4xl text-white">Ya tenés una base para {draft.eventType.toLowerCase()}.</h3><p className="text-zinc-400">El siguiente paso conecta el pago, crea tu enlace privado y abre el editor con estos datos cargados. No publicamos nada sin tu confirmación.</p><a href="#precios" onClick={onClose} className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-semibold text-black">Ver planes <ArrowRight className="ml-2 h-4 w-4" /></a></div>}
              <div className="mt-9 flex items-center justify-between"><button onClick={() => setStep(Math.max(0,step-1))} disabled={step===0} className="inline-flex min-h-12 items-center px-3 text-zinc-300 disabled:opacity-30"><ChevronLeft className="mr-1" /> Atrás</button>{step<3 && <button onClick={() => setStep(step+1)} disabled={!canContinue} className="inline-flex min-h-12 items-center rounded-full bg-violet-300 px-6 font-semibold text-black disabled:opacity-40">Continuar <ChevronRight className="ml-1" /></button>}</div>
            </div>
            <aside className={`relative hidden min-h-[620px] overflow-hidden bg-gradient-to-br p-10 lg:flex ${selectedTemplate.colors}`} aria-label="Vista previa de portada">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.24),transparent_25%)]" />
              <div className="relative m-auto w-full max-w-sm rounded-[2rem] border border-white/20 bg-black/35 p-8 text-center text-white shadow-2xl backdrop-blur-md"><Sparkles className="mx-auto mb-8" /><p className="mb-4 text-xs uppercase tracking-[.25em]">{draft.eventType}</p><h3 className="break-words text-6xl leading-none">{draft.name || 'Tu nombre'}</h3><p className="mt-7 text-sm">{draft.date ? new Date(`${draft.date}T12:00:00`).toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'}) : 'Elegí una fecha'}</p><p className="mt-2 text-sm text-white/70">{draft.venue || 'Tu lugar especial'}</p><span className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-black">Abrir invitación</span></div>
            </aside>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const ProductLanding: React.FC = () => {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const schema = useMemo(() => ({ '@context':'https://schema.org','@type':'Product',name:'Invitación digital interactiva',description:'Invitación digital personalizable con RSVP y panel de organización',offers:plans.map(plan => ({'@type':'Offer',priceCurrency:'ARS',price:plan.price.replace('.',''),availability:'https://schema.org/InStock'})) }), []);
  return <div className="min-h-screen bg-[#070707] text-white font-sans selection:bg-violet-300 selection:text-black">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070707]/90 backdrop-blur-xl"><div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5"><a href="#inicio" className="flex items-center gap-2 text-lg font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-300 text-black"><Sparkles className="h-5 w-5" /></span>Tu Invitación</a><nav className="hidden items-center gap-7 text-sm text-zinc-300 md:flex" aria-label="Principal"><a href="#disenos">Diseños</a><a href="#funciones">Funciones</a><a href="#como-funciona">Cómo funciona</a><a href="#precios">Precios</a></nav><button onClick={() => setBuilderOpen(true)} className="hidden min-h-11 rounded-full bg-white px-5 text-sm font-bold text-black sm:block">Crear mi invitación</button><button onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 md:hidden" aria-label="Abrir menú" aria-expanded={menuOpen}><Menu /></button></div>{menuOpen && <nav className="grid gap-1 border-t border-white/10 p-4 md:hidden"><a className="p-3" href="#disenos">Diseños</a><a className="p-3" href="#funciones">Funciones</a><a className="p-3" href="#precios">Precios</a><button onClick={() => setBuilderOpen(true)} className="mt-2 rounded-full bg-white p-3 font-bold text-black">Crear mi invitación</button></nav>}</header>
    <main id="contenido">
      <section id="inicio" className="relative overflow-hidden px-5 pb-24 pt-20 sm:pt-28"><div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" /><div className="relative mx-auto max-w-6xl text-center"><span className="inline-flex items-center rounded-full border border-violet-300/30 bg-violet-300/10 px-4 py-2 text-xs uppercase tracking-[.2em] text-violet-200"><Sparkles className="mr-2 h-4 w-4" />Tu evento empieza antes de la fiesta</span><h1 className="mx-auto mt-8 max-w-5xl text-5xl font-semibold leading-[.95] sm:text-7xl lg:text-8xl">Una invitación que nadie quiere cerrar.</h1><p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">Elegí un estilo, cargá tus datos y compartí una experiencia animada con RSVP, música, mapas, fotos, regalos y organización en tiempo real.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => setBuilderOpen(true)} className="inline-flex min-h-14 items-center justify-center rounded-full bg-violet-300 px-8 font-bold text-black">Crear una vista previa <ArrowRight className="ml-2 h-5 w-5" /></button><a href="#disenos" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/15 px-8 font-semibold"><Eye className="mr-2 h-5 w-5" />Ver estilos</a></div><p className="mt-5 text-sm text-zinc-500">Sin tarjeta · Probala antes de elegir un plan</p></div></section>
      <section id="disenos" className="mx-auto max-w-7xl px-5 py-20"><div className="mb-10 max-w-2xl"><p className="text-sm uppercase tracking-[.2em] text-violet-300">Diseños vivos</p><h2 className="mt-3 text-4xl sm:text-6xl">No son plantillas quietas.</h2><p className="mt-4 text-zinc-400">Entradas cinematográficas, capas con profundidad, tipografía protagonista y microinteracciones que acompañan la historia.</p></div><div className="grid gap-5 md:grid-cols-2">{templates.map((template,index)=><motion.button key={template.id} onClick={()=>setBuilderOpen(true)} whileHover={{y:-4}} className={`group relative min-h-[320px] overflow-hidden rounded-[2rem] bg-gradient-to-br p-7 text-left ${template.colors}`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,.3),transparent_25%)] transition-transform duration-700 group-hover:scale-110" /><span className="relative text-xs uppercase tracking-[.2em] text-white/70">Estilo {String(index+1).padStart(2,'0')}</span><div className="absolute bottom-7 left-7 right-7"><h3 className="text-4xl">{template.name}</h3><p className="mt-2 text-white/70">{template.hint}</p></div></motion.button>)}</div></section>
      <section id="funciones" className="border-y border-white/10 bg-white/[.025] px-5 py-24"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm uppercase tracking-[.2em] text-violet-300">Mucho más que una tarjeta</p><h2 className="mt-3 text-4xl sm:text-6xl">Todo el evento, conectado.</h2></div><div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,title,copy])=><article key={title} className="bg-[#0d0d0d] p-7"><Icon className="mb-8 h-7 w-7 text-violet-300" /><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 leading-relaxed text-zinc-400">{copy}</p></article>)}</div></div></section>
      <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-24"><h2 className="max-w-3xl text-4xl sm:text-6xl">De una idea a un enlace listo para WhatsApp.</h2><ol className="mt-14 grid gap-8 md:grid-cols-3">{[['01','Elegí el estilo','Probá diseños y módulos con una vista previa instantánea.'],['02','Cargá lo esencial','Nombre, fecha, lugar, fotos, música y datos de confirmación.'],['03','Publicá y administrá','Compartí el enlace y seguí respuestas, mesas e ingreso desde el panel.']].map(([n,title,copy])=><li key={n} className="border-t border-white/20 pt-6"><span className="text-sm text-violet-300">{n}</span><h3 className="mt-8 text-2xl">{title}</h3><p className="mt-3 text-zinc-400">{copy}</p></li>)}</ol></section>
      <section id="precios" className="bg-zinc-100 px-5 py-24 text-black"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-3xl text-center"><p className="text-sm uppercase tracking-[.2em] text-violet-700">Precio por evento · lanzamiento</p><h2 className="mt-3 text-4xl sm:text-6xl">Simple de elegir. Completa de usar.</h2><p className="mt-5 text-zinc-600">Pago único en pesos argentinos. Invitados y cambios ilimitados durante el evento.</p></div><div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">{plans.map(plan=><article key={plan.name} className={`relative flex flex-col rounded-[2rem] border p-7 ${plan.popular?'border-violet-600 bg-[#111] text-white shadow-2xl':'border-zinc-300 bg-white'}`}>{plan.popular&&<span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-violet-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black">Más elegido</span>}<h3 className="text-2xl font-semibold">{plan.name}</h3><p className={`mt-2 text-sm ${plan.popular?'text-zinc-400':'text-zinc-600'}`}>{plan.copy}</p><p className="mt-8"><span className="text-sm">ARS $</span><strong className="text-5xl">{plan.price}</strong></p><ul className="my-8 space-y-3">{plan.features.map(item=><li key={item} className="flex items-center gap-3 text-sm"><Check className="h-5 w-5 text-violet-500" />{item}</li>)}</ul><button onClick={()=>setBuilderOpen(true)} className={`mt-auto min-h-13 rounded-full px-5 font-bold ${plan.popular?'bg-violet-300 text-black':'bg-black text-white'}`}>Empezar con {plan.name}</button></article>)}</div><p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-relaxed text-zinc-500">Precios de lanzamiento sujetos a actualización. Servicios externos o desarrollos especiales se cotizan antes de confirmar.</p></div></section>
      <section className="mx-auto max-w-5xl px-5 py-24" aria-labelledby="faq-title"><p className="text-sm uppercase tracking-[.2em] text-violet-300">Preguntas frecuentes</p><h2 id="faq-title" className="mt-3 text-4xl sm:text-6xl">Antes de empezar.</h2><div className="mt-10 divide-y divide-white/10 border-y border-white/10">{[
        ['¿Cuánto tarda en estar lista?', 'La configuración guiada toma pocos minutos. Después del pago y la activación, podés publicar cuando termines de cargar textos y fotos.'],
        ['¿Puedo cambiarla después de compartirla?', 'Sí. Conservás el mismo enlace y los cambios se reflejan sin volver a enviarlo.'],
        ['¿Los invitados tienen que instalar algo?', 'No. La invitación funciona desde el navegador del celular y se comparte por enlace o WhatsApp.'],
        ['¿Dónde veo las confirmaciones?', 'En el panel privado del organizador, con búsqueda, filtros, detalles, mesas, QR y exportación.'],
        ['¿Qué pasa con los datos?', 'Solo se solicitan los datos necesarios para organizar el evento. El acceso administrativo se restringe a las cuentas autorizadas.'],
      ].map(([question,answer])=><details key={question} className="group py-5"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">{question}<span className="text-violet-300 transition-transform group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-3 pr-10 leading-relaxed text-zinc-400">{answer}</p></details>)}</div></section>
      <section className="px-5 py-24"><div className="mx-auto max-w-5xl rounded-[2.5rem] bg-gradient-to-br from-violet-500 to-indigo-700 p-8 text-center sm:p-16"><Heart className="mx-auto h-9 w-9" /><h2 className="mx-auto mt-6 max-w-3xl text-4xl sm:text-6xl">Tu invitación puede estar tomando forma hoy.</h2><p className="mx-auto mt-5 max-w-xl text-white/75">Probá una combinación sin registrarte. Cuando te guste, elegís el plan y terminás de cargarla.</p><button onClick={()=>setBuilderOpen(true)} className="mt-8 min-h-14 rounded-full bg-white px-8 font-bold text-black">Crear vista previa</button></div></section>
    </main>
    <footer className="border-t border-white/10 px-5 py-10"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Tu Invitación. Experiencias digitales para celebrar.</p><div className="flex flex-wrap gap-5"><a href="#precios">Precios</a><button onClick={()=>setBuilderOpen(true)} className="text-left">Contacto</button><a href="#contenido">Volver arriba</a></div></div></footer>
    <AnimatePresence>{builderOpen&&<Builder onClose={()=>setBuilderOpen(false)} />}</AnimatePresence>
  </div>;
};
