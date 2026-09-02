import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { auth } from '../lib/firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import {
  ShieldCheck,
  Users,
  Music,
  MessageSquare,
  Gift,
  Palette,
  Download,
  CheckCircle2,
  XCircle,
  Lock,
  X,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  LogOut
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const {
    config,
    updateConfig,
    guests,
    addOrUpdateGuestRsvp,
    songs,
    toggleApproveSong,
    guestbook,
    photoboothImages,
    gifts,
    tables,
    isAdminLoggedIn
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'stats' | 'guests' | 'moderation' | 'customizer' | 'exports' | 'collabs'>('stats');

  // Customizer state
  const [localConfig, setLocalConfig] = useState(config);
  const [customizerTab, setCustomizerTab] = useState<'general' | 'location' | 'gifts' | 'appearance' | 'modules'>('general');

  const handleLocalConfigChange = (field: keyof typeof config, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const allowedAdmins = config.adminEmails || ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com'];
      if (!allowedAdmins.map(e => e.toLowerCase()).includes(result.user.email?.toLowerCase() || '')) {
        await signOut(auth);
        alert('Acceso denegado: Tu cuenta de Google no tiene permisos de organizador para este evento.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Error al iniciar sesión: ' + (error.message || 'Credenciales inválidas.'));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const handleAddAdmin = () => {
    if (!newAdminEmail.trim()) return;
    const email = newAdminEmail.trim().toLowerCase();
    const currentAdmins = config.adminEmails || ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com'];
    if (!currentAdmins.includes(email)) {
      updateConfig({ adminEmails: [...currentAdmins, email] });
    }
    setNewAdminEmail('');
  };

  const handleRemoveAdmin = (emailToRemove: string) => {
    const currentAdmins = config.adminEmails || ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com'];
    if (currentAdmins.length <= 1) {
      alert('Debe haber al menos un administrador en la plataforma.');
      return;
    }
    updateConfig({ adminEmails: currentAdmins.filter(e => e !== emailToRemove) });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(localConfig);
    alert('¡Configuración de la plataforma actualizada exitosamente!');
  };

  const exportCsv = () => {
    const headers = ['Nombre', 'Apellido', 'Edad', 'MenorDeEdad', 'TutorNombre', 'TutorTelefono', 'Telefono', 'Email', 'Estado', 'Mesa', 'MenuEspecial', 'Notas'];
    const rows = guests.map(g => {
      const isMinor = g.age ? g.age < 18 : false;
      return [
        `"${g.name}"`,
        `"${g.lastName}"`,
        g.age || '',
        isMinor ? 'SI' : 'NO',
        `"${g.tutorName || g.emergencyContactName || ''}"`,
        `"${g.tutorPhone || g.emergencyContactPhone || ''}"`,
        `"${g.phone}"`,
        `"${g.email}"`,
        g.status,
        g.tableNumber,
        `"${g.dietaryRestrictions.join(', ')}"`,
        `"${(g.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lista_Invitados_${config.honoree.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl p-4 flex items-center justify-center">
        <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <Lock className="w-12 h-12 text-[#C0C0C0] mx-auto mb-3" />
          <h2 className="font-serif text-3xl font-semibold text-white mb-1">Acceso Organizador</h2>
          <p className="text-zinc-400 text-xs mb-6 font-light">Iniciá sesión para administrar la plataforma</p>

          <button
            onClick={handleLogin}
            className="w-full py-3.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4" />
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  // Calculated Stats
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.status === 'CONFIRMED' || g.status === 'CHECKED_IN').length;
  const checkedInGuests = guests.filter(g => g.status === 'CHECKED_IN').length;
  const dietaryCount = guests.filter(g => g.dietaryRestrictions.length > 0 && !g.dietaryRestrictions.includes('Ninguna')).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto flex items-center justify-center">
      <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-10 max-w-6xl w-full shadow-2xl relative">
        
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 px-4 flex items-center gap-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-xs font-semibold uppercase tracking-wider"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C0C0C0]/20 border border-[#C0C0C0] flex items-center justify-center text-[#C0C0C0]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-semibold text-white">Panel Organizador · {config.honoree}</h2>
              <span className="text-xs text-zinc-400 block font-light">SaaS Event Platform · Nivel Empresa</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'stats', label: '📊 Estadísticas' },
              { id: 'guests', label: '👥 Invitados' },
              { id: 'moderation', label: '🎵 Moderación' },
              { id: 'customizer', label: '🎨 Personalizar' },
              { id: 'exports', label: '📥 Exportar' },
              { id: 'collabs', label: '🛡️ Administradores' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#C0C0C0] text-black font-bold shadow-lg shadow-[#C0C0C0]/10'
                    : 'bg-black border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-black border border-white/10">
                <span className="text-xs text-zinc-400 font-light uppercase tracking-wider">Total Registrados</span>
                <span className="font-serif text-3xl font-bold text-[#C0C0C0] block mt-1">{totalGuests}</span>
              </div>
              <div className="p-5 rounded-2xl bg-black border border-white/10">
                <span className="text-xs text-zinc-400 font-light uppercase tracking-wider">Confirmados</span>
                <span className="font-serif text-3xl font-bold text-emerald-400 block mt-1">{confirmedGuests}</span>
              </div>
              <div className="p-5 rounded-2xl bg-black border border-white/10">
                <span className="text-xs text-zinc-400 font-light uppercase tracking-wider">Ingresados (Check-in)</span>
                <span className="font-serif text-3xl font-bold text-cyan-400 block mt-1">{checkedInGuests}</span>
              </div>
              <div className="p-5 rounded-2xl bg-black border border-white/10">
                <span className="text-xs text-zinc-400 font-light uppercase tracking-wider">Menús Especiales</span>
                <span className="font-serif text-3xl font-bold text-[#C0C0C0] block mt-1">{dietaryCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-black border border-white/10">
                <h4 className="font-serif text-xl font-semibold text-white mb-3">Canciones Recomendadas ({songs.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {songs.map(s => (
                    <div key={s.id} className="text-xs text-zinc-300 flex justify-between p-2.5 bg-zinc-900 rounded-lg">
                      <span>{s.title} - {s.artist}</span>
                      <span className="text-[#C0C0C0] font-bold">{s.votes} votos</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-black border border-white/10">
                <h4 className="font-serif text-xl font-semibold text-white mb-3">Resumen de Mesas ({tables.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tables.map(t => (
                    <div key={t.number} className="text-xs text-zinc-300 flex justify-between p-2.5 bg-zinc-900 rounded-lg">
                      <span>{t.name}</span>
                      <span className="text-[#C0C0C0] font-bold">{t.assignedGuests.length}/{t.capacity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Guest List */}
        {activeTab === 'guests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-serif text-2xl font-semibold text-white">Lista Completa de Invitados</h3>
              <button
                onClick={exportCsv}
                className="px-4 py-2 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
              {guests.map(g => {
                const isMinor = g.age ? g.age < 18 : false;
                const tutor = g.tutorName || g.emergencyContactName;
                const tutorTel = g.tutorPhone || g.emergencyContactPhone;
                return (
                  <div key={g.id} className="p-4 rounded-xl bg-black border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
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
                            Menor de 18
                          </span>
                        )}
                      </div>
                      <span className="text-zinc-400 font-light block mt-0.5">
                        {g.phone ? `WhatsApp: ${g.phone} · ` : ''}Mesa #{g.tableNumber} · Menú: {g.dietaryRestrictions.join(', ') || 'Estándar'}
                      </span>
                      {isMinor && tutor && (
                        <span className="text-zinc-400 text-[11px] block mt-0.5 text-amber-200/90">
                          Tutor Responsable: <strong>{tutor}</strong> {tutorTel && `(${tutorTel})`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        g.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                        g.status === 'CHECKED_IN' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        'bg-[#C0C0C0]/20 text-[#C0C0C0] border border-[#C0C0C0]/30'
                      }`}>
                        {g.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Customizer */}
        {activeTab === 'customizer' && (
          <form onSubmit={handleSaveConfig} className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-2xl font-semibold text-white">Personalización del Sitio</h3>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>

            {/* Customizer Sub-tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 border-b border-white/10 mb-6 no-scrollbar">
              <button
                type="button"
                onClick={() => setCustomizerTab('general')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'general' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                General & Textos
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab('location')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'location' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Ubicación & Dress Code
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab('gifts')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'gifts' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Regalos & Cuentas
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab('appearance')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'appearance' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Apariencia & Multimedia
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab('modules')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'modules' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Módulos & Secciones
              </button>
            </div>

            <div className="bg-black border border-white/10 rounded-2xl p-6">
              {customizerTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Homenajeada</label>
                    <input type="text" value={localConfig.honoree} onChange={e => handleLocalConfigChange('honoree', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Tipo de Evento</label>
                    <input type="text" value={localConfig.eventType} onChange={e => handleLocalConfigChange('eventType', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" placeholder="Mis 15, Boda, etc." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Subtítulo (Bajo el título principal)</label>
                    <input type="text" value={localConfig.subTitle} onChange={e => handleLocalConfigChange('subTitle', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Mensaje de Bienvenida</label>
                    <textarea rows={3} value={localConfig.welcomeMessage} onChange={e => handleLocalConfigChange('welcomeMessage', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Fecha del Evento</label>
                    <input type="datetime-local" value={localConfig.date ? new Date(localConfig.date).toISOString().slice(0, 16) : ''} onChange={e => handleLocalConfigChange('date', new Date(e.target.value).toISOString())} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Fecha Límite Confirmación (RSVP)</label>
                    <input type="date" value={localConfig.rsvpDeadline} onChange={e => handleLocalConfigChange('rsvpDeadline', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                </div>
              )}

              {customizerTab === 'location' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Nombre del Salón / Venue</label>
                    <input type="text" value={localConfig.venue} onChange={e => handleLocalConfigChange('venue', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Ciudad</label>
                    <input type="text" value={localConfig.city} onChange={e => handleLocalConfigChange('city', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Dirección Exacta</label>
                    <input type="text" value={localConfig.address} onChange={e => handleLocalConfigChange('address', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Link Google Maps</label>
                    <input type="url" value={localConfig.googleMapsUrl} onChange={e => handleLocalConfigChange('googleMapsUrl', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
                    <h4 className="font-serif text-lg font-semibold text-white mb-4">Código de Vestimenta (Dress Code)</h4>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Estilo Corto (Ej: Elegante)</label>
                    <input type="text" value={localConfig.dressCode} onChange={e => handleLocalConfigChange('dressCode', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Detalles del Dress Code</label>
                    <textarea rows={2} value={localConfig.dressCodeDetails} onChange={e => handleLocalConfigChange('dressCodeDetails', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Colores Prohibidos (Separados por coma)</label>
                    <input type="text" value={localConfig.forbiddenColors?.join(', ')} onChange={e => handleLocalConfigChange('forbiddenColors', e.target.value.split(',').map(s => s.trim()))} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" placeholder="Blanco, Verde..." />
                  </div>
                </div>
              )}

              {customizerTab === 'gifts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Alias (Transferencia)</label>
                    <input type="text" value={localConfig.alias} onChange={e => handleLocalConfigChange('alias', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">CBU / CVU</label>
                    <input type="text" value={localConfig.cbu} onChange={e => handleLocalConfigChange('cbu', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Link de MercadoPago (URL o QR)</label>
                    <input type="url" value={localConfig.mpQrUrl} onChange={e => handleLocalConfigChange('mpQrUrl', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Link de PayPal</label>
                    <input type="url" value={localConfig.payPalUrl || ''} onChange={e => handleLocalConfigChange('payPalUrl', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                </div>
              )}

              {customizerTab === 'appearance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Temática de Color</label>
                    <select
                      value={localConfig.theme}
                      onChange={e => handleLocalConfigChange('theme', e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                    >
                      <option value="silver-disco">Silver Disco (Plata & Negro)</option>
                      <option value="gold-emerald">Gold Emerald (Dorado & Esmeralda)</option>
                      <option value="rose-gold">Rose Gold (Rosa & Dorado)</option>
                      <option value="royal-violet">Royal Violet (Violeta & Oro)</option>
                      <option value="champagne">Champagne (Neutros)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Fuente de Títulos</label>
                    <select
                      value={localConfig.fontHeading || 'cormorant'}
                      onChange={e => handleLocalConfigChange('fontHeading', e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                    >
                      <option value="cormorant">Cormorant Garamond (Elegante Clásica)</option>
                      <option value="playfair">Playfair Display (Premium Editorial)</option>
                      <option value="montserrat">Montserrat (Moderna Geométrica)</option>
                      <option value="lato">Lato (Limpia y Amigable)</option>
                      <option value="inter">Inter (Minimalista Neutra)</option>
                      <option value="jakarta">Plus Jakarta (Moderna Fresca)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Fuente de Textos (Cuerpo)</label>
                    <select
                      value={localConfig.fontBody || 'jakarta'}
                      onChange={e => handleLocalConfigChange('fontBody', e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                    >
                      <option value="jakarta">Plus Jakarta Sans (Moderna)</option>
                      <option value="inter">Inter (Legible Neutra)</option>
                      <option value="montserrat">Montserrat (Geométrica)</option>
                      <option value="lato">Lato (Clásica y Amigable)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">URL Imagen Principal (Portada)</label>
                    <input type="url" value={localConfig.heroImageUrl} onChange={e => handleLocalConfigChange('heroImageUrl', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                    {localConfig.heroImageUrl && (
                      <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-white/10">
                        <img src={localConfig.heroImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Hashtag de Instagram</label>
                    <input type="text" value={localConfig.customHashtag} onChange={e => handleLocalConfigChange('customHashtag', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Música de Fondo (URL MP3)</label>
                    <input type="url" value={localConfig.backgroundMusicUrl} onChange={e => handleLocalConfigChange('backgroundMusicUrl', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                </div>
              )}

              {customizerTab === 'modules' && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="border-b border-white/10 pb-4">
                    <h4 className="font-serif text-xl font-semibold text-white mb-2">Activar/Desactivar Secciones</h4>
                    <p className="text-zinc-400 text-xs font-light">Controla qué módulos se muestran a tus invitados en la página web.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'enableHero', label: 'Cabecera Principal (Portada)' },
                      { id: 'enableCountdown', label: 'Cuenta Regresiva' },
                      { id: 'enableTimeline', label: 'Cronograma del Evento' },
                      { id: 'enableDressCode', label: 'Dress Code & Outfit' },
                      { id: 'enableGifts', label: 'Sección de Regalos' },
                      { id: 'enableGuestbook', label: 'Libro de Firmas Virtual' },
                      { id: 'enableTrivia', label: 'Juegos & Trivia' },
                      { id: 'enableAI', label: 'Asistente IA (Chatbot)' },
                    ].map((mod) => (
                      <label key={mod.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                        <span className="text-sm font-medium text-white">{mod.label}</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${localConfig[mod.id as keyof typeof config] !== false ? 'bg-[#C0C0C0]' : 'bg-zinc-700'}`}>
                          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${localConfig[mod.id as keyof typeof config] !== false ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={localConfig[mod.id as keyof typeof config] !== false}
                          onChange={(e) => handleLocalConfigChange(mod.id as keyof typeof config, e.target.checked)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Tab 4: Exports */}
        {activeTab === 'exports' && (
          <div className="text-center py-8 max-w-md mx-auto space-y-4">
            <FileSpreadsheet className="w-12 h-12 text-[#C0C0C0] mx-auto" />
            <h3 className="font-serif text-2xl font-semibold text-white">Exportación de Reportes</h3>
            <p className="text-xs text-zinc-400 font-light">Descargá reportes completos en formato CSV o PDF para catering y recepción.</p>

            <button
              onClick={exportCsv}
              className="w-full py-3.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10"
            >
              Descargar Lista CSV Completa
            </button>
          </div>
        )}

        {/* Tab 6: Collabs / Admins */}
        {activeTab === 'collabs' && (
          <div className="max-w-xl mx-auto">
            <h3 className="font-serif text-2xl font-semibold text-white mb-2">Administradores del Sitio</h3>
            <p className="text-xs text-zinc-400 font-light mb-6">Gestioná los correos de Google (Gmail) que tienen permiso para acceder a este panel de control y modificar la página.</p>
            
            <div className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="nuevo.admin@gmail.com"
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
              />
              <button
                onClick={handleAddAdmin}
                className="px-6 py-2.5 rounded-xl bg-[#C0C0C0] text-black font-semibold text-xs tracking-wider hover:bg-white transition-colors uppercase"
              >
                Agregar
              </button>
            </div>

            <div className="space-y-3">
              {(config.adminEmails || ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com']).map(email => (
                <div key={email} className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/10">
                  <span className="text-sm text-zinc-300 font-medium">{email}</span>
                  <button
                    onClick={() => handleRemoveAdmin(email)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Eliminar administrador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
