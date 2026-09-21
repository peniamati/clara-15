import React, { useState } from 'react';
import { Check, Copy, Gift, Mail } from 'lucide-react';
import { useEvent } from '../context/EventContext';

export const GiftsSection: React.FC = () => {
  const { config } = useEvent();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const bankDetails = [
    { label: 'Alias', value: config.alias },
    { label: 'CVU', value: config.cvu || config.cbu },
    { label: 'Nombre', value: config.honoree },
  ].filter(item => item.value);

  return (
    <section id="regalos" className="relative bg-[#050505] py-24 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C0C0C0]/30 bg-zinc-900/80 px-4 py-1.5 text-xs uppercase tracking-widest text-[#C0C0C0]">
            <Gift className="h-3.5 w-3.5" />
            <span>Regalos</span>
          </div>
          <h2 className="mb-4 font-serif text-4xl font-semibold silver-gradient-text sm:text-6xl">Tu presencia es lo más importante</h2>
          <p className="text-sm font-light leading-relaxed text-zinc-300 sm:text-base">
            Para mí lo más importante es tu presencia, pero si quisieras hacerme un regalo, te dejo mis datos bancarios.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0F0F0F] p-6 shadow-2xl sm:p-10">
          <div className="grid gap-3">
            {bankDetails.map(item => (
              <div key={item.label} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{item.label}</span>
                  <span className="break-all font-mono text-base font-bold text-white">{item.value}</span>
                </div>
                {item.label !== 'Nombre' && (
                  <button type="button" onClick={() => copyToClipboard(item.value, item.label)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#C0C0C0] bg-[#C0C0C0]/20 px-4 text-xs font-semibold uppercase tracking-wider text-[#C0C0C0]">
                    {copiedField === item.label ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedField === item.label ? 'Copiado' : 'Copiar'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#C0C0C0]/20 bg-[#C0C0C0]/5 p-5 text-sm leading-relaxed text-zinc-200">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#C0C0C0]" />
            <p>En el salón habrá una urna por si preferís dejar un sobre.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
