import React, { useState } from 'react';
import { EventConfig } from '../types';

const groups = {
  gallery: { title: 'Galería del book', fields: { title: 'Título', url: 'URL de foto' }, defaults: { category: 'books', size: 'normal' } },
  schedule: { title: 'Cronograma', fields: { time: 'Hora (21:30)', title: 'Actividad', description: 'Descripción' }, defaults: { iconName: 'Music' } },
} as const;

export function ContentEditor({ config, onChange }: { config: EventConfig; onChange: (key: keyof EventConfig, value: any) => void }) {
  const [group, setGroup] = useState<keyof typeof groups>('gallery');
  const schema = groups[group];
  const items = (config[group] || []) as any[];

  return <section className="space-y-4 rounded-xl border border-white/10 p-4">
    <h4 className="text-xl font-semibold">Contenido del evento</h4>
    <p className="text-sm text-zinc-400">Cargá las fotos del book y el cronograma real. Las secciones vacías muestran un aviso claro, sin contenido de ejemplo.</p>
    <select aria-label="Contenido a editar" className="w-full rounded-lg bg-zinc-900 p-3" value={group} onChange={e => setGroup(e.target.value as keyof typeof groups)}>{Object.entries(groups).map(([key, value]) => <option key={key} value={key}>{value.title}</option>)}</select>
    {items.map((item, index) => <fieldset key={item.id ?? index} className="grid gap-3 rounded-xl bg-zinc-900 p-4 sm:grid-cols-2">
      <legend>{schema.title} {index + 1}</legend>
      {Object.entries(schema.fields).map(([key, label]) => <label key={key} className="text-sm">{label}<input type="text" value={item[key] ?? ''} onChange={e => onChange(group, items.map((row, i) => i === index ? { ...row, [key]: e.target.value } : row))} className="mt-1 w-full rounded-lg bg-black p-3" /></label>)}
      <button type="button" className="p-2 text-red-300" onClick={() => onChange(group, items.filter((_, i) => i !== index))}>Quitar este elemento</button>
    </fieldset>)}
    <button type="button" className="rounded-lg border border-white/20 p-3" onClick={() => onChange(group, [...items, { id: group === 'gallery' ? Date.now() : crypto.randomUUID(), ...schema.defaults }])}>Agregar a {schema.title.toLowerCase()}</button>
  </section>;
}
