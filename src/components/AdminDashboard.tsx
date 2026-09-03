import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { auth } from '../lib/firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import discoHero from '../assets/disco-hero-unsplash.jpg';
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
    setPreviewConfig,
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'error' } | null>(null);

  // Customizer state
  const [localConfig, setLocalConfig] = useState(config);
  
  React.useEffect(() => {
    setPreviewConfig(localConfig);
    return () => setPreviewConfig(null);
  }, [localConfig, setPreviewConfig]);

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
        setNotice({ title: 'Acceso denegado', message: 'Tu cuenta no tiene permisos de organizador para este evento.', tone: 'error' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setNotice({ title: 'No se pudo iniciar sesión', message: error.message || 'Verificá tus credenciales e intentá nuevamente.', tone: 'error' });
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
      setNotice({ title: 'No se puede quitar', message: 'Debe haber al menos un administrador en la plataforma.', tone: 'error' });
      return;
    }
    updateConfig({ adminEmails: currentAdmins.filter(e => e !== emailToRemove) });
  };

  const fontMap: Record<string, string> = {
    'cormorant': '"Cormorant Garamond", serif',
    'playfair': '"Playfair Display", serif',
    'montserrat': '"Montserrat", sans-serif',
    'lato': '"Lato", sans-serif',
    'inter': '"Inter", sans-serif',
    'jakarta': '"Plus Jakarta Sans", sans-serif',
    'roboto': '"Roboto", sans-serif',
    'opensans': '"Open Sans", sans-serif',
    'poppins': '"Poppins", sans-serif',
    'raleway': '"Raleway", sans-serif',
    'nunito': '"Nunito", sans-serif',
    'merriweather': '"Merriweather", serif',
    'lora': '"Lora", serif',
    'cinzel': '"Cinzel", serif',
    'dancing': '"Dancing Script", cursive',
    'greatvibes': '"Great Vibes", cursive',
    'dmsans': '"DM Sans", sans-serif',
    'quicksand': '"Quicksand", sans-serif',
    'oswald': '"Oswald", sans-serif',
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(localConfig);
    setNotice({ title: 'Cambios guardados', message: 'La configuración se actualizó correctamente para tus invitados.', tone: 'success' });
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

  if (isPreviewMode) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#0A0A0A]/95 border border-white/20 p-4 px-6 rounded-full backdrop-blur-2xl flex items-center gap-6 shadow-2xl shadow-black">
        <span className="text-zinc-300 font-semibold text-sm hidden sm:block">👀 Viendo Vista Previa</span>
        <button onClick={() => setIsPreviewMode(false)} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-colors">
          Volver al Editor
        </button>
        <button onClick={handleSaveConfig} className="px-5 py-2.5 bg-[#C0C0C0] hover:bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full transition-colors shadow-lg shadow-[#C0C0C0]/20">
          Guardar Cambios
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 p-0 backdrop-blur-2xl sm:p-6">
      <div className="relative h-full w-full overflow-y-auto overscroll-contain bg-[#0F0F0F] p-4 pt-5 shadow-2xl sm:mx-auto sm:max-h-[calc(100dvh-3rem)] sm:max-w-6xl sm:rounded-3xl sm:p-10">
        
        <div className="sticky top-0 z-30 -mx-4 -mt-5 mb-5 border-b border-white/10 bg-[#0F0F0F]/95 px-4 pt-5 backdrop-blur-xl sm:-mx-10 sm:-mt-10 sm:mb-6 sm:px-10 sm:pt-10">
        <div className="mb-5 flex items-center justify-end gap-2 sm:absolute sm:right-6 sm:top-6 sm:mb-0">
          <button
            onClick={handleLogout}
            className="p-2 px-3 flex items-center gap-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
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
        <div className="flex flex-col items-stretch gap-5 pb-5 sm:pr-32">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#C0C0C0]/20 border border-[#C0C0C0] flex items-center justify-center text-[#C0C0C0]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl leading-tight sm:text-3xl font-semibold text-white break-words">Panel Organizador · {config.honoree}</h2>
              <span className="block text-xs font-light text-zinc-400">Panel de organización del evento</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
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
                className={`flex min-w-0 items-center justify-center px-2 py-2.5 text-center sm:px-4 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider transition-all ${
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
          <form onSubmit={handleSaveConfig} className="mx-auto max-w-3xl space-y-6 pb-24">
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center">
              <h3 className="font-serif text-2xl font-semibold text-white">Personalización del Sitio</h3>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className="px-3 py-2.5 sm:px-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-[10px] sm:text-xs uppercase tracking-wide sm:tracking-widest transition-colors flex items-center justify-center gap-2"
                  title="Ocultar panel temporalmente para ver cómo luce el sitio"
                >
                  <span>👁️</span> Vista Previa
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 sm:px-6 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-[10px] sm:text-xs uppercase tracking-wide sm:tracking-widest shadow-lg shadow-[#C0C0C0]/10 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>

            {/* Customizer Sub-tabs */}
            <div className="grid grid-cols-2 gap-1.5 border-b border-white/10 pb-3 mb-5 sm:flex sm:overflow-x-auto sm:pb-2 sm:gap-2 no-scrollbar">
              <button
                type="button"
                onClick={() => setCustomizerTab('general')}
                className={`flex items-center justify-center px-2 py-2 text-center text-[10px] sm:px-4 sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider whitespace-normal sm:whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'general' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                General & Textos
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab('location')}
                className={`flex items-center justify-center px-2 py-2 text-center text-[10px] sm:px-4 sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider whitespace-normal sm:whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'location' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Ubicación & Dress Code
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab('gifts')}
                className={`flex items-center justify-center px-2 py-2 text-center text-[10px] sm:px-4 sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider whitespace-normal sm:whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'gifts' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Regalos & Cuentas
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab('appearance')}
                className={`flex items-center justify-center px-2 py-2 text-center text-[10px] sm:px-4 sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider whitespace-normal sm:whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'appearance' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Apariencia & Multimedia
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab('modules')}
                className={`col-span-2 flex items-center justify-center px-2 py-2 text-center text-[10px] sm:col-auto sm:px-4 sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider whitespace-normal sm:whitespace-nowrap transition-colors border-b-2 ${
                  customizerTab === 'modules' ? 'text-[#C0C0C0] border-[#C0C0C0]' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                Módulos & Secciones
              </button>
            </div>

            <div className="bg-black border border-white/10 rounded-2xl p-4 sm:p-6">
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
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-wider text-zinc-300">Portada de la invitación</label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleLocalConfigChange('heroImageUrl', discoHero)}
                        aria-pressed={localConfig.heroImageUrl === discoHero}
                        className={`overflow-hidden rounded-2xl border-2 p-1 text-left ${localConfig.heroImageUrl === discoHero ? 'border-[#C0C0C0] shadow-lg shadow-[#C0C0C0]/10' : 'border-white/10'}`}
                      >
                        <img src={discoHero} alt="Portada disco con bolas de espejo" className="h-28 w-full rounded-xl object-cover" />
                        <span className="block px-2 pb-1 pt-2 text-xs font-semibold text-white">Bolas disco · recomendada</span>
                      </button>
                      <label className="cursor-pointer rounded-2xl border border-dashed border-white/20 bg-zinc-900/60 p-4 text-sm text-zinc-300 transition-colors hover:border-[#C0C0C0]/60">
                        <span className="mb-2 block font-semibold text-white">Usar otra imagen</span>
                        <span className="block text-xs text-zinc-500">Pegá una URL en el campo de abajo para personalizar la portada.</span>
                      </label>
                    </div>
                  </div>
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
                    <div className="mt-3 p-4 rounded-xl border border-white/5 bg-black flex flex-col gap-3">
                      <span className="text-[10px] uppercase text-zinc-500 tracking-wider">Paleta Previa:</span>
                      <div className="flex gap-2">
                        {localConfig.theme === 'silver-disco' && ['#050505', '#C0C0C0', '#E0E0E0', '#808080'].map(c => <div key={c} className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: c }} />)}
                        {localConfig.theme === 'gold-emerald' && ['#022B1A', '#D4AF37', '#F3E5AB', '#997A00'].map(c => <div key={c} className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: c }} />)}
                        {localConfig.theme === 'rose-gold' && ['#1C0E11', '#B76E79', '#E0BFB8', '#904B56'].map(c => <div key={c} className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: c }} />)}
                        {localConfig.theme === 'royal-violet' && ['#140026', '#8A2BE2', '#D8BFD8', '#4B0082'].map(c => <div key={c} className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: c }} />)}
                        {localConfig.theme === 'champagne' && ['#12100B', '#F7E7CE', '#FFFFF0', '#C2B280'].map(c => <div key={c} className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: c }} />)}
                      </div>
                    </div>
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
                      <option value="merriweather">Merriweather (Clásica y Formal)</option>
                      <option value="lora">Lora (Poética y Refinada)</option>
                      <option value="cinzel">Cinzel (Cinematográfica / Mayúsculas)</option>
                      <option value="dancing">Dancing Script (Cursiva Relajada)</option>
                      <option value="greatvibes">Great Vibes (Cursiva Elegante)</option>
                      <option value="oswald">Oswald (Impactante e Industrial)</option>
                      <option value="montserrat">Montserrat (Moderna Geométrica)</option>
                      <option value="lato">Lato (Limpia y Amigable)</option>
                      <option value="inter">Inter (Minimalista Neutra)</option>
                      <option value="jakarta">Plus Jakarta (Moderna Fresca)</option>
                      <option value="roboto">Roboto (Clásica y Funcional)</option>
                      <option value="opensans">Open Sans (Versátil y Amigable)</option>
                      <option value="poppins">Poppins (Redonda y Amigable)</option>
                      <option value="raleway">Raleway (Elegante y Delgada)</option>
                      <option value="nunito">Nunito (Suave y Balanceada)</option>
                      <option value="dmsans">DM Sans (Limpia Tecnológica)</option>
                      <option value="quicksand">Quicksand (Moderna Redondeada)</option>
                    </select>
                    <div className="mt-3 p-4 rounded-xl border border-white/5 bg-black">
                      <span className="text-[10px] uppercase text-zinc-500 mb-2 block tracking-wider">Muestra en Título:</span>
                      <p className="text-xl text-white" style={{ fontFamily: fontMap[localConfig.fontHeading || 'cormorant'] }}>
                        Antonella & Matías
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Fuente de Textos (Cuerpo)</label>
                    <select
                      value={localConfig.fontBody || 'jakarta'}
                      onChange={e => handleLocalConfigChange('fontBody', e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                    >
                      <option value="jakarta">Plus Jakarta Sans (Moderna Fresca)</option>
                      <option value="inter">Inter (Legible Neutra)</option>
                      <option value="montserrat">Montserrat (Geométrica)</option>
                      <option value="lato">Lato (Clásica y Amigable)</option>
                      <option value="roboto">Roboto (Clásica y Funcional)</option>
                      <option value="opensans">Open Sans (Versátil y Amigable)</option>
                      <option value="poppins">Poppins (Redonda y Amigable)</option>
                      <option value="raleway">Raleway (Elegante y Delgada)</option>
                      <option value="nunito">Nunito (Suave y Balanceada)</option>
                      <option value="dmsans">DM Sans (Limpia Tecnológica)</option>
                      <option value="quicksand">Quicksand (Moderna Redondeada)</option>
                      <option value="cormorant">Cormorant Garamond (Elegante Clásica)</option>
                      <option value="playfair">Playfair Display (Premium Editorial)</option>
                      <option value="merriweather">Merriweather (Clásica y Formal)</option>
                      <option value="lora">Lora (Poética y Refinada)</option>
                    </select>
                    <div className="mt-3 p-4 rounded-xl border border-white/5 bg-black">
                      <span className="text-[10px] uppercase text-zinc-500 mb-2 block tracking-wider">Muestra en Texto:</span>
                      <p className="text-sm text-zinc-300" style={{ fontFamily: fontMap[localConfig.fontBody || 'jakarta'] }}>
                        Te invitamos a compartir con nosotros este día tan especial. Será una noche inolvidable llena de momentos mágicos y mucha alegría.
                      </p>
                    </div>
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
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-300">Música de Fondo (URL o ID de YouTube)</label>
                    <input type="url" value={localConfig.backgroundMusicUrl} onChange={e => handleLocalConfigChange('backgroundMusicUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=nNEb2k_EmMg" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-base text-white outline-none focus:border-[#C0C0C0] sm:text-sm" />
                    <p className="mt-1.5 text-xs text-zinc-500">Al abrir la invitación se reproduce el video; al silenciar se pausa. Podés pegar una URL de YouTube, su ID de 11 caracteres o una URL directa a MP3.</p>
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

        {activeTab === 'customizer' && (
          <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-white/10 bg-[#0A0A0A]/95 p-3 backdrop-blur-xl sm:bottom-6 sm:border sm:rounded-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:p-2.5">
            <div className="flex w-full max-w-md items-center justify-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className="flex-1 rounded-full border border-white/10 bg-zinc-800 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white sm:flex-none"
              >
                Vista previa
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex-1 rounded-full bg-[#C0C0C0] px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-[#C0C0C0]/20 sm:flex-none"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        )}

        {notice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="notice-title">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#121212] p-6 text-center shadow-2xl">
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${notice.tone === 'error' ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                {notice.tone === 'error' ? <XCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
              </div>
              <h3 id="notice-title" className="mb-2 font-serif text-2xl font-semibold text-white">{notice.title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-zinc-400">{notice.message}</p>
              <button type="button" onClick={() => setNotice(null)} className="w-full rounded-full bg-[#C0C0C0] px-5 py-3 text-xs font-bold uppercase tracking-wider text-black">
                Entendido
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
