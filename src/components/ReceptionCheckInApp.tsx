import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { QrCode, Search, CheckCircle2, UserCheck, X, Clock, Users } from 'lucide-react';

interface ReceptionCheckInAppProps {
  onClose: () => void;
}

export const ReceptionCheckInApp: React.FC<ReceptionCheckInAppProps> = ({ onClose }) => {
  const { guests, checkInGuest } = useEvent();
  const [searchTerm, setSearchTerm] = useState('');
  const [scannedCode, setScannedCode] = useState('');

  const filteredGuests = guests.filter(
    g => g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         g.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         g.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulateScan = (qrCode: string) => {
    const target = guests.find(g => g.qrCode === qrCode);
    if (target) {
      checkInGuest(target.id);
      alert(`¡Check-in exitoso para ${target.name} ${target.lastName}! Asignado a Mesa #${target.tableNumber}`);
    } else {
      alert('Código QR no encontrado en la lista de registrados.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto flex items-center justify-center">
      <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-10 max-w-4xl w-full shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#C0C0C0]/20 border border-[#C0C0C0] flex items-center justify-center text-[#C0C0C0]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-semibold text-white">Recepción Check-In App</h2>
            <p className="text-xs text-zinc-400 font-light">Control de ingreso de invitados y asignación instantánea de mesa</p>
          </div>
        </div>

        {/* Quick QR Code Scanner Simulator */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 mb-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            placeholder="Escanear o ingresar código QR (Ej: QR-CLARA15-GST1-VALENTINA)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-[#C0C0C0] outline-none"
          />
          <button
            onClick={() => handleSimulateScan(scannedCode)}
            className="px-6 py-2.5 rounded-xl bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-wider"
          >
            Registrar Ingreso
          </button>
        </div>

        {/* Guest Search Bar */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido o pase..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-black border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
          />
        </div>

        {/* Guest List Grid */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
          {filteredGuests.map((g) => {
            const isMinor = g.age ? g.age < 18 : false;
            const tutor = g.tutorName || g.emergencyContactName;
            const tutorTel = g.tutorPhone || g.emergencyContactPhone;

            return (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-black border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{g.name} {g.lastName}</span>
                    {g.age && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[#C0C0C0] text-[10px] font-medium">
                        {g.age} años
                      </span>
                    )}
                    {isMinor && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                        Menor
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      g.status === 'CHECKED_IN' ? 'bg-[#C0C0C0]/20 text-[#C0C0C0] border border-[#C0C0C0]/40' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {g.status === 'CHECKED_IN' ? 'INGRESÓ' : 'CONFIRMADO'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 flex flex-wrap gap-3 font-light">
                    <span>Mesa #{g.tableNumber}</span>
                    {g.phone && <span>WhatsApp: {g.phone}</span>}
                    {g.dietaryRestrictions.length > 0 && (
                      <span className="text-[#C0C0C0] font-medium">Menú: {g.dietaryRestrictions.join(', ')}</span>
                    )}
                    {g.checkInTime && <span className="text-emerald-400 font-mono">Ingreso: {g.checkInTime} HS</span>}
                  </div>
                  {isMinor && tutor && (
                    <div className="text-xs text-amber-200/90 mt-1.5 font-light">
                      Adulto Responsable / Tutor: <strong>{tutor}</strong> {tutorTel && `(${tutorTel})`}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => checkInGuest(g.id)}
                  disabled={g.status === 'CHECKED_IN'}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    g.status === 'CHECKED_IN'
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-bold'
                  }`}
                >
                  {g.status === 'CHECKED_IN' ? '✓ Ingresó' : 'Marcar Ingreso'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
