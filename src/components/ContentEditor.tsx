import React, { useState } from 'react';
import { EventConfig } from '../types';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const groups = {
  timeline: { title: 'Historia', fields: { year: 'Año', title: 'Título', description: 'Descripción', imageUrl: 'URL de foto', category: 'Categoría (Nacimiento, Infancia, Colegio, Viajes, Familia, Amigos, Hoy)' }, defaults: { category: 'Hoy' } },
  gallery: { title: 'Galería', fields: { title: 'Título', url: 'URL de foto', category: 'Categoría (books, backstage, fiesta)' }, defaults: { category: 'books', size: 'normal' } },
  schedule: { title: 'Cronograma', fields: { time: 'Hora (20:00)', title: 'Actividad', description: 'Descripción' }, defaults: { iconName: 'Music' } },
  gifts: { title: 'Regalos', fields: { title: 'Nombre', category: 'Categoría', imageUrl: 'URL de foto', targetAmount: 'Objetivo ($)', currentAmount: 'Recibido ($), actualizar manualmente' }, defaults: { targetAmount: 0, currentAmount: 0 } },
  tables: { title: 'Mesas', fields: { number: 'Número', name: 'Nombre', capacity: 'Capacidad' }, defaults: { number: 1, capacity: 10, assignedGuests: [], position: { x: 50, y: 50 } } },
} as const;

export function ContentEditor({ config, onChange }: { config: EventConfig; onChange: (key: keyof EventConfig, value: any) => void }) {
  const [group, setGroup] = useState<keyof typeof groups>('timeline');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState('');
  const [pollStatus, setPollStatus] = useState('');
  const schema = groups[group];
  const items = (config[group] || []) as any[];
  return <section className="space-y-4 rounded-xl border border-white/10 p-4">
    <h4 className="text-xl font-semibold">Contenido del evento</h4>
    <p className="text-sm text-zinc-400">Agregá tus datos y fotos reales. Las secciones vacías no incluyen ejemplos. Usá Guardar cambios al terminar.</p>
    <select aria-label="Contenido a editar" className="w-full rounded-lg bg-zinc-900 p-3" value={group} onChange={e => setGroup(e.target.value as keyof typeof groups)}>{Object.entries(groups).map(([key, value]) => <option key={key} value={key}>{value.title}</option>)}</select>
    {items.map((item, index) => <fieldset key={index} className="grid gap-3 rounded-xl bg-zinc-900 p-4 sm:grid-cols-2">
      <legend>{schema.title} {index + 1}</legend>
      {Object.entries(schema.fields).map(([key, label]) => <label key={key} className="text-sm">{label}<input type={['number', 'capacity', 'targetAmount', 'currentAmount'].includes(key) ? 'number' : 'text'} value={item[key] ?? ''} onChange={e => onChange(group, items.map((row, i) => i === index ? { ...row, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value } : row))} className="mt-1 w-full rounded-lg bg-black p-3" /></label>)}
      <button type="button" className="p-2 text-red-300" onClick={() => onChange(group, items.filter((_, i) => i !== index))}>Quitar este elemento</button>
    </fieldset>)}
    <button type="button" className="rounded-lg border border-white/20 p-3" onClick={() => onChange(group, [...items, { id: group === 'gallery' ? Date.now() : crypto.randomUUID(), ...schema.defaults }])}>Agregar a {schema.title.toLowerCase()}</button>
    <h4 className="pt-4 text-lg font-semibold">Trivia</h4>
    {(config.trivia || []).map((q, index) => <fieldset key={q.id} className="space-y-2 rounded-lg bg-zinc-900 p-3">
      <label className="block">Pregunta<input className="block w-full bg-black p-2" value={q.question} onChange={e => onChange('trivia', config.trivia!.map((x, i) => i === index ? { ...x, question: e.target.value } : x))} /></label>
      {q.options.map((option, n) => <label className="block" key={n}>Respuesta {n + 1}<input className="block w-full bg-black p-2" value={option} onChange={e => onChange('trivia', config.trivia!.map((x, i) => i === index ? { ...x, options: x.options.map((v, j) => j === n ? e.target.value : v) } : x))} /></label>)}
      <label>Respuesta correcta<select className="ml-2 bg-black p-2" value={q.correctAnswer} onChange={e => onChange('trivia', config.trivia!.map((x, i) => i === index ? { ...x, correctAnswer: Number(e.target.value) } : x))}>{q.options.map((_, n) => <option key={n} value={n}>{n + 1}</option>)}</select></label>
      <button type="button" className="ml-3 p-2 text-red-300" onClick={() => onChange('trivia', config.trivia!.filter((_, i) => i !== index))}>Quitar pregunta</button>
    </fieldset>)}
    <button type="button" className="rounded border p-3" onClick={() => onChange('trivia', [...(config.trivia || []), { id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }])}>Agregar pregunta</button>
    <h4 className="pt-4 text-lg font-semibold">Publicar una encuesta</h4>
    <input className="block w-full rounded bg-zinc-900 p-3" aria-label="Pregunta de encuesta" placeholder="Pregunta" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} />
    <textarea className="block w-full rounded bg-zinc-900 p-3" aria-label="Opciones de encuesta" placeholder="Una opción por línea" value={pollOptions} onChange={e => setPollOptions(e.target.value)} />
    <button type="button" className="rounded border p-3" onClick={async () => {
      const options = pollOptions.split('\n').map(s => s.trim()).filter(Boolean);
      if (!pollQuestion.trim() || options.length < 2) { setPollStatus('Escribí una pregunta y al menos dos opciones.'); return; }
      try {
        await setDoc(doc(collection(db, 'polls')), { question: pollQuestion.trim(), options: options.map((label, i) => ({ id: String(i), label, votes: 0 })) });
        setPollQuestion(''); setPollOptions(''); setPollStatus('Encuesta publicada.');
      } catch { setPollStatus('No se pudo publicar. Revisá los permisos y reintentá.'); }
    }}>Publicar encuesta ahora</button>
    <p role="status">{pollStatus}</p>
  </section>;
}
