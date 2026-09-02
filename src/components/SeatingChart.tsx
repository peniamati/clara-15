import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Users, Search, Sparkles, Music, Utensils, Wine, Camera } from 'lucide-react';

export const SeatingChart: React.FC = () => {
  const { tables, guests, activeGuest, config } = useEvent();
  const [selectedTable, setSelectedTable] = useState<number | null>(activeGuest?.tableNumber || 1);
  const [searchTerm, setSearchTerm] = useState('');

  const tableData = tables.find(t => t.number === selectedTable);
  const tableGuests = guests.filter(g => g.tableNumber === selectedTable);

  const searchedGuest = searchTerm
    ? guests.find(g => (g.name + ' ' + g.lastName).toLowerCase().includes(searchTerm.toLowerCase()))
    : null;

  return (
    <section className="py-24 bg-[#050505] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Users className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Distribución de Salón</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Plano Interactivo & Mesas
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Consultá la ubicación de tu mesa en el salón principal de {config.venue}.
          </p>

          {/* Quick Table Search */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="¿Dónde me siento? Buscá tu nombre..."
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none shadow-xl placeholder:text-zinc-500"
            />
          </div>

          {searchedGuest && (
            <div className="mt-4 p-4 rounded-2xl bg-[#C0C0C0]/20 border border-[#C0C0C0] text-[#C0C0C0] text-sm font-serif font-semibold">
              📍 {searchedGuest.name} {searchedGuest.lastName} está en la <strong className="text-white">Mesa #{searchedGuest.tableNumber}</strong>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Interactive Visual Salon Map */}
          <div className="lg:col-span-8 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative min-h-[420px] flex flex-col justify-between overflow-hidden">
            
            {/* Stage / DJ / Dance Floor Visual Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-white/10 text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#C0C0C0]" /> Escenario Principal</span>
              <span className="flex items-center gap-1.5"><Music className="w-4 h-4 text-[#C0C0C0]" /> Cabina DJ</span>
              <span className="flex items-center gap-1.5"><Wine className="w-4 h-4 text-[#C0C0C0]" /> Barra Premium</span>
              <span className="flex items-center gap-1.5"><Camera className="w-4 h-4 text-[#C0C0C0]" /> Photobooth</span>
            </div>

            {/* Tables Layout Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-8">
              {tables.map(t => {
                const isSelected = t.number === selectedTable;
                return (
                  <button
                    key={t.number}
                    onClick={() => setSelectedTable(t.number)}
                    className={`p-6 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-white shadow-xl shadow-[#C0C0C0]/20 scale-105 font-bold'
                        : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-[#C0C0C0]/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full border border-[#C0C0C0]/40 flex items-center justify-center font-bold text-sm mb-2 text-[#C0C0C0]">
                      #{t.number}
                    </div>
                    <span className="text-xs font-medium text-center">{t.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-center text-[11px] text-zinc-500 uppercase tracking-wider">
              Haz clic en cualquier mesa para consultar los comensales asignados.
            </div>

          </div>

          {/* Selected Table Details Panel */}
          <div className="lg:col-span-4 bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {tableData ? (
              <div>
                <span className="text-xs text-[#C0C0C0] font-bold uppercase tracking-widest block mb-1">Detalles de Ubicación</span>
                <h3 className="font-serif text-3xl font-semibold text-white mb-2">{tableData.name}</h3>
                <p className="text-xs text-zinc-400 mb-6 font-light">Capacidad total: {tableData.capacity} Personas</p>

                <h4 className="font-semibold text-xs text-zinc-300 uppercase tracking-widest mb-3">Invitados Asignados:</h4>
                <div className="space-y-2">
                  {tableGuests.length > 0 ? (
                    tableGuests.map(g => (
                      <div key={g.id} className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{g.name} {g.lastName}</span>
                        {g.dietaryRestrictions.length > 0 && (
                          <span className="text-[10px] text-[#C0C0C0] bg-[#C0C0C0]/10 px-2.5 py-0.5 rounded-full font-bold uppercase">
                            {g.dietaryRestrictions[0]}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 italic">Mesa disponible.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-xs">Seleccioná una mesa para ver los detalles.</div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
