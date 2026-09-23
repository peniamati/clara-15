import React, { useState } from 'react';
import { EventConfig } from '../types';

const groups = {
  gallery: { title: 'Fotos del book', fields: { title: 'Nombre de la foto', url: 'Enlace de la foto' }, defaults: { category: 'books', size: 'normal' } },
  schedule: { title: 'Programa de la noche', fields: { time: 'Hora (por ejemplo, 21:30)', title: 'Actividad', description: 'Descripción' }, defaults: { iconName: 'Music' } },
} as const;

export function ContentEditor({ config, onChange }: { config: EventConfig; onChange: (key: keyof EventConfig, value: any) => void }) {
  const [group, setGroup] = useState<keyof typeof groups>('gallery');
  const schema = groups[group];
  const items = (config[group] || []) as any[];

  return <section className="space-y-4 rounded-xl border border-white/10 p-4">
    <h4 className="text-xl font-semibold">Fotos y programa</h4>
    <p className="text-sm text-zinc-400">Elegí qué querés editar. Podés dejar una parte vacía si todavía no está definida.</p>
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Contenido a editar">{Object.entries(groups).map(([key, value]) => <button key={key} type="button" aria-pressed={group === key} onClick={() => setGroup(key as keyof typeof groups)} className={`min-h-12 rounded-xl border px-3 text-sm font-semibold ${group === key ? 'border-[#C0C0C0] bg-[#C0C0C0] text-black' : 'border-white/10 bg-zinc-900 text-white'}`}>{value.title}</button>)}</div>
    {items.length === 0 && <p className="rounded-xl bg-zinc-900 p-4 text-sm text-zinc-400">Todavía no hay elementos en {schema.title.toLowerCase()}.</p>}
    {items.map((item, index) => <fieldset key={item.id ?? index} className="grid gap-3 rounded-xl bg-zinc-900 p-4 sm:grid-cols-2">
      <legend>{schema.title} {index + 1}</legend>
      {Object.entries(schema.fields).map(([key, label]) => <label key={key} className="text-sm">{label}<input type="text" value={item[key] ?? ''} onChange={e => onChange(group, items.map((row, i) => i === index ? { ...row, [key]: e.target.value } : row))} className="mt-1 w-full rounded-lg bg-black p-3" /></label>)}
      <button type="button" className="min-h-11 rounded-lg border border-red-500/20 p-2 text-red-300" onClick={() => onChange(group, items.filter((_, i) => i !== index))}>Quitar este elemento</button>
    </fieldset>)}
    <button type="button" className="min-h-11 w-full rounded-xl border border-white/20 p-3 font-semibold" onClick={() => onChange(group, [...items, { id: group === 'gallery' ? Date.now() : crypto.randomUUID(), ...schema.defaults }])}>Agregar {group === 'gallery' ? 'foto' : 'actividad'}</button>
  </section>;
}
