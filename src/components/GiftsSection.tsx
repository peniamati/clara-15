import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Gift, Copy, Check, ExternalLink } from 'lucide-react';

export const GiftsSection: React.FC = () => {
  const { config, gifts } = useEvent();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <section id="regalos" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Gift className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Mesa de Regalos & Experiencias</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            El Mejor Regalo es tu Presencia
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Si deseas hacerme un obsequio para colaborar con mi viaje y proyectos de futuro, podés hacerlo mediante transferencia o lista de sueños.
          </p>
        </div>

        {/* Bank & Payment Details Card */}
        <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-4">
            <h3 className="font-serif text-3xl font-semibold text-white">Datos Bancarios para Transferencia</h3>
            
            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Alias Bancario</span>
                <span className="font-mono text-[#C0C0C0] font-bold text-base">{config.alias}</span>
              </div>
              <button
                onClick={() => copyToClipboard(config.alias, 'Alias')}
                className="px-4 py-2 rounded-full bg-[#C0C0C0]/20 border border-[#C0C0C0] text-[#C0C0C0] hover:bg-[#C0C0C0]/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              >
                {copiedField === 'Alias' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'Alias' ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">CBU / CVU</span>
                <span className="font-mono text-white font-semibold text-sm">{config.cbu}</span>
              </div>
              <button
                onClick={() => copyToClipboard(config.cbu, 'CBU')}
                className="px-4 py-2 rounded-full bg-[#C0C0C0]/20 border border-[#C0C0C0] text-[#C0C0C0] hover:bg-[#C0C0C0]/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              >
                {copiedField === 'CBU' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'CBU' ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={config.payPalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-full bg-zinc-900 border border-white/10 text-[#C0C0C0] hover:border-[#C0C0C0]/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Regalito por PayPal
              </a>
            </div>
          </div>

          {/* Mercado Pago QR */}
          <div className="text-center p-6 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col items-center">
            <span className="text-xs text-[#C0C0C0] font-semibold uppercase tracking-widest mb-2">Escaneo Mercado Pago</span>
            <img src={config.mpQrUrl} alt="Mercado Pago QR" className="w-44 h-44 rounded-xl border border-white/10 p-2 bg-white mb-3" />
            <span className="text-[10px] text-zinc-400 font-light">Escaneá directamente desde tu app bancaria o Mercado Pago</span>
          </div>

        </div>

        {/* Wishlist Dreams Grid */}
        <div className="mb-16">
          <h3 className="font-serif text-3xl font-semibold silver-gradient-text text-center mb-8">
            Lista de Sueños & Experiencias
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gifts.map((item) => {
              const progressPct = Math.min(100, Math.round((item.currentAmount / item.targetAmount) * 100));
              return (
                <div key={item.id} className="bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-[#C0C0C0]/30 transition-all">
                  <div>
                    <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                    <div className="p-5">
                      <span className="text-[10px] text-[#C0C0C0] uppercase tracking-widest font-bold">{item.category}</span>
                      <h4 className="font-serif text-xl font-semibold text-white mt-1 mb-2">{item.title}</h4>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden my-2">
                        <div className="h-full bg-[#C0C0C0]" style={{ width: `${progressPct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400 font-medium">
                        <span>Alcanzado: {progressPct}%</span>
                        <span className="text-[#C0C0C0] font-bold">${item.currentAmount.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => copyToClipboard(config.alias, item.title)}
                      className="w-full py-2.5 rounded-full bg-zinc-900 border border-white/10 text-[#C0C0C0] hover:border-[#C0C0C0]/40 text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      {copiedField === item.title ? '¡Alias Copiado!' : 'Regalar este Sueño'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
