import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useEvent } from '../context/EventContext';
import { ContentEditor } from './ContentEditor';
import { OrganizerHelp } from './OrganizerHelp';
import { auth } from '../lib/firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { DEFAULT_HERO_IMAGE, resolveHeroImage } from '../lib/heroMedia';
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
  LogOut,
  LayoutDashboard,
  Settings2,
  UserCog,
  Bell
} from 'lucide-react';
import { initialSongs } from '../data/mockData';
import { findOfficialTrack } from '../lib/playlist';

interface AdminDashboardProps {
  onClose: () => void;
  onPreviewChange: (preview: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onPreviewChange }) => {
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
    isAdminLoggedIn, moderateContent, deleteContent, checkInGuest, analyticsEvents
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'stats' | 'guests' | 'moderation' | 'customizer' | 'collabs'>('stats');
  const organizerTabs = [
    { id: 'stats', label: 'Inicio', description: 'Qué hacer ahora', icon: LayoutDashboard },
    { id: 'guests', label: 'Asistencia', description: 'Invitados y mesas', icon: Users },
    { id: 'moderation', label: 'Publicaciones', description: 'Fotos, firmas y música', icon: Music },
    { id: 'customizer', label: 'Invitación', description: 'Textos y diseño', icon: Settings2 },
    { id: 'collabs', label: 'Accesos', description: 'Administradores', icon: UserCog },
  ] as const;
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  React.useEffect(() => {
    onPreviewChange(isPreviewMode);
    return () => onPreviewChange(false);
  }, [isPreviewMode, onPreviewChange]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone?: 'success' | 'error' } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationStorageKey = `clara-organizer-seen-${auth.currentUser?.email || 'local'}`;
  const [lastSeenAt, setLastSeenAt] = useState(() => {
    try { return Number(window.localStorage.getItem(notificationStorageKey) || 0); } catch { return 0; }
  });
  React.useEffect(() => {
    try { setLastSeenAt(Number(window.localStorage.getItem(notificationStorageKey) || 0)); } catch { setLastSeenAt(0); }
  }, [notificationStorageKey]);
  const markNotificationsSeen = () => {
    const now = Date.now();
    setLastSeenAt(now);
    try { window.localStorage.setItem(notificationStorageKey, String(now)); } catch { /* La sesión actual sigue funcionando. */ }
  };
  React.useEffect(() => {
    if (!showNotifications) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node) && !(event.target as Element).closest('[data-notification-trigger]')) setShowNotifications(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowNotifications(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showNotifications]);

  // Customizer state
  const [localConfig, setLocalConfig] = useState(config);
  
  React.useEffect(() => {
    setPreviewConfig(localConfig);
    return () => setPreviewConfig(null);
  }, [localConfig, setPreviewConfig]);

  const [customizerTab, setCustomizerTab] = useState<'general' | 'location' | 'gifts' | 'appearance' | 'content' | 'modules'>('general');
  const customizerSections = [
    { id: 'general', label: 'Datos y mensaje', help: 'Nombre, fecha y bienvenida' },
    { id: 'location', label: 'Lugar y vestimenta', help: 'Salón, mapa y ropa' },
    { id: 'gifts', label: 'Regalos', help: 'Alias y cuenta' },
    { id: 'content', label: 'Fotos y programa', help: 'Book y horarios' },
    { id: 'appearance', label: 'Portada y estilo', help: 'Imagen, colores y música' },
    { id: 'modules', label: 'Secciones visibles', help: 'Mostrar u ocultar partes' },
  ] as const;
  const selectedCustomizerSection = customizerSections.find(section => section.id === customizerTab)!;
  const hasUnsavedChanges = JSON.stringify(localConfig) !== JSON.stringify(config);
  const localDateTimeValue = localConfig.date ? (() => {
    const date = new Date(localConfig.date);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  })() : '';

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
      void updateConfig({ adminEmails: [...currentAdmins, email] }).catch(() => setNotice({ title: 'No se pudo guardar', message: 'No se agregó el administrador.', tone: 'error' }));
    }
    setNewAdminEmail('');
  };

  const handleRemoveAdmin = (emailToRemove: string) => {
    const currentAdmins = config.adminEmails || ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com'];
    if (currentAdmins.length <= 1) {
      setNotice({ title: 'No se puede quitar', message: 'Debe haber al menos un administrador en la plataforma.', tone: 'error' });
      return;
    }
    void updateConfig({ adminEmails: currentAdmins.filter(e => e !== emailToRemove) }).catch(() => setNotice({ title: 'No se pudo guardar', message: 'No se quitó el administrador.', tone: 'error' }));
  };

  const fontMap: Record<string, string> = {
    'eyesome': '"Eyesome Script", cursive',
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

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await updateConfig(localConfig);
      setNotice({ title: 'Cambios guardados', message: 'La configuración quedó guardada en la base de datos.', tone: 'success' });
    } catch {
      setNotice({ title: 'No se pudo guardar', message: 'Tus cambios siguen en el editor. Revisá la conexión y los permisos de Firebase antes de reintentar.', tone: 'error' });
    } finally { setSaving(false); }
  };

  const exportGuestTable = () => {
    const rows = guests.map(g => ({
      Nombre: g.name,
      Apellido: g.lastName,
      Edad: g.age ?? '',
      'Menor de edad': g.age && g.age < 18 ? 'Sí' : 'No',
      Tutor: g.tutorName || g.emergencyContactName || '',
      'Teléfono del tutor': g.tutorPhone || g.emergencyContactPhone || '',
      Teléfono: g.phone || '',
      Email: g.email || '',
      Estado: g.status,
      Mesa: g.tableNumber || 'Sin asignar',
      'Menú especial': g.dietaryRestrictions.join(', '),
      Notas: g.notes || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 18 }, { wch: 18 }, { wch: 8 }, { wch: 15 }, { wch: 24 }, { wch: 20 },
      { wch: 18 }, { wch: 28 }, { wch: 15 }, { wch: 14 }, { wch: 28 }, { wch: 36 },
    ];
    worksheet['!autofilter'] = { ref: worksheet['!ref'] || 'A1:L1' };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');
    XLSX.writeFile(workbook, `Invitados_${config.honoree.replace(/\s+/g, '_')}.xls`, { bookType: 'biff8' });
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
  const invitationViews = analyticsEvents.filter(event => event.type === 'invitation_view').length;
  const uniqueVisitors = new Set(analyticsEvents.filter(event => event.type === 'invitation_view').map(event => event.ownerUid)).size;
  const invitationOpens = analyticsEvents.filter(event => event.type === 'invitation_open').length;
  const rsvpStarts = analyticsEvents.filter(event => event.type === 'rsvp_start').length;
  const rsvpCompletions = analyticsEvents.filter(event => event.type === 'rsvp_complete' || event.type === 'rsvp_declined').length;
  const conversion = invitationOpens ? Math.round((rsvpCompletions / invitationOpens) * 100) : 0;
  const publicationChecks = [
    ['Nombre y tipo de evento', Boolean(config.honoree && config.eventType)],
    ['Fecha y límite RSVP', Boolean(config.date && config.rsvpDeadline)],
    ['Lugar y mapa', Boolean(config.venue && config.address && config.googleMapsUrl)],
    ['Portada', Boolean(config.heroImageUrl)],
    ['Música de apertura', /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(config.backgroundMusicUrl || '')],
    ['Administradores', Boolean(config.adminEmails?.length)],
  ] as const;
  const readyChecks = publicationChecks.filter(([, ready]) => ready).length;
  const confirmedGuests = guests.filter(g => g.status === 'CONFIRMED' || g.status === 'CHECKED_IN').length;
  const checkedInGuests = guests.filter(g => g.status === 'CHECKED_IN').length;
  const dietaryCount = guests.filter(g => g.dietaryRestrictions.length > 0 && !g.dietaryRestrictions.includes('Ninguna')).length;
  const pendingSongRequests = songs.filter(song => !song.isInOfficialPlaylist && !findOfficialTrack(song, initialSongs));
  const newSongRequests = pendingSongRequests.filter(song => Date.parse(song.createdAt || '') > lastSeenAt).length;
  const newConfirmations = guests.filter(guest => guest.status === 'CONFIRMED' && Date.parse(guest.createdAt || '') > lastSeenAt).length;
  const newGuestbookMessages = guestbook.filter(message => Date.parse(message.createdAt || '') > lastSeenAt).length;
  const newPhotos = photoboothImages.filter(photo => photo.ownerUid && Date.parse(photo.createdAt || '') > lastSeenAt).length;
  const notificationCount = newSongRequests + newConfirmations + newGuestbookMessages + newPhotos;

  if (isPreviewMode) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#0A0A0A]/95 border border-white/20 p-4 px-6 rounded-full backdrop-blur-2xl flex items-center gap-6 shadow-2xl shadow-black">
        <span className="text-zinc-300 font-semibold text-sm hidden sm:block">👀 Viendo Vista Previa</span>
        <button onClick={() => setIsPreviewMode(false)} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-colors">
          Volver al Editor
        </button>
        <button onClick={handleSaveConfig} disabled={saving} className="px-5 py-2.5 bg-[#C0C0C0] hover:bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full transition-colors shadow-lg shadow-[#C0C0C0]/20">
          Guardar Cambios
        </button>
      </div>
    );
  }

  return (
    <div className="organizer fixed inset-0 z-50 bg-[#0F0F0F] text-white">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
        
        <div className="relative z-30 shrink-0 border-b border-white/10 bg-[#151515] px-4 pt-3 sm:px-8 sm:pt-5">
        <div className="mb-2 flex items-center justify-end gap-2 sm:absolute sm:right-6 sm:top-4 sm:mb-0">
          <button type="button" data-notification-trigger onClick={() => { if (!showNotifications) markNotificationsSeen(); setShowNotifications(open => !open); }} aria-label={`Notificaciones: ${notificationCount}`} aria-expanded={showNotifications} className="relative flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-zinc-900 px-3 text-xs font-semibold text-white hover:border-white/30"><Bell className="h-4 w-4" /><span>Notificaciones</span>{notificationCount > 0 && <span className="rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold text-black">{notificationCount}</span>}</button>
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
        {showNotifications && <div ref={notificationsRef} role="region" aria-label="Novedades del organizador" className="absolute right-4 top-14 z-50 max-h-[70dvh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/20 bg-[#171717] p-4 shadow-2xl sm:right-6 sm:top-16">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">Novedades</h3><button type="button" onClick={markNotificationsSeen} className="text-xs text-[#C0C0C0] underline">Marcar como vistas</button></div>
          <p className="mt-1 text-xs text-zinc-400">Las propuestas de canciones siguen pendientes hasta estar en Spotify.</p>
          <div className="mt-4 space-y-2">
            <button type="button" onClick={() => { setActiveTab('moderation'); setShowNotifications(false); }} className="w-full rounded-xl bg-zinc-900 p-3 text-left text-sm"><strong className="block text-white">{pendingSongRequests.length} canciones pendientes</strong><span className="text-xs text-zinc-400">Abrir propuestas para la playlist oficial</span></button>
            <button type="button" onClick={() => { setActiveTab('guests'); setShowNotifications(false); }} className="w-full rounded-xl bg-zinc-900 p-3 text-left text-sm"><strong className="block text-white">{confirmedGuests} confirmaciones</strong><span className="text-xs text-zinc-400">{newConfirmations} nuevas desde la última revisión</span></button>
            <button type="button" onClick={() => { setActiveTab('moderation'); setShowNotifications(false); }} className="w-full rounded-xl bg-zinc-900 p-3 text-left text-sm"><strong className="block text-white">Firmas y fotos</strong><span className="text-xs text-zinc-400">{newGuestbookMessages} firmas y {newPhotos} fotos nuevas</span></button>
          </div>
        </div>}

        {/* Dashboard Header */}
        <div className="flex flex-col items-stretch pb-3 sm:pr-64">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#C0C0C0]/20 border border-[#C0C0C0] flex items-center justify-center text-[#C0C0C0]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="!font-sans text-2xl leading-tight sm:text-3xl font-semibold text-white break-words">Organizá los 15 de {config.honoree}</h2>
              <span className="block text-xs font-light text-zinc-400">Elegí una tarea para empezar; tus cambios quedan guardados cuando lo indicamos.</span>
            </div>
          </div>
        </div>

        <div className="py-3" role="navigation" aria-label="Secciones del organizador">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {organizerTabs.map(tab => {
              const TabIcon = tab.icon;
              return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`flex min-w-[104px] shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all sm:min-w-[150px] sm:px-4 ${
                  activeTab === tab.id
                    ? 'border-[#C0C0C0] bg-[#C0C0C0] text-black shadow-lg shadow-[#C0C0C0]/10'
                    : 'border-white/10 bg-black text-zinc-400 hover:border-white/25 hover:text-white'
                }`}
              >
                <TabIcon className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-xs font-bold">{tab.label}</span>
                  <span className={`hidden truncate text-[10px] sm:block ${activeTab === tab.id ? 'text-black/65' : 'text-zinc-500'}`}>{tab.description}</span>
                </span>
              </button>
            )})}
          </div>
        </div>
        </div>

        {/* Tab 1: Stats */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 pb-28 sm:px-8">
        <div className="mx-auto max-w-6xl">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <OrganizerHelp />
            <section aria-labelledby="quick-actions-title">
              <div className="mb-3"><p className="text-xs uppercase tracking-widest text-[#C0C0C0]">Empezá por acá</p><h3 id="quick-actions-title" className="text-xl font-semibold">¿Qué necesitás hacer?</h3></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'Ver quién viene', detail: `${confirmedGuests} personas confirmadas · buscar, asignar mesa o descargar la lista`, tab: 'guests' as const, icon: Users },
                  { title: 'Revisar propuestas y publicaciones', detail: `${pendingSongRequests.length} canciones pendientes · fotos y firmas de los invitados`, tab: 'moderation' as const, icon: Music },
                  { title: 'Cambiar la invitación', detail: 'Fecha, lugar, textos, regalos y apariencia', tab: 'customizer' as const, icon: Settings2 },
                  { title: 'Dar acceso a otra persona', detail: 'Agregar o quitar cuentas de organización', tab: 'collabs' as const, icon: UserCog },
                ].map(action => <button key={action.tab} type="button" onClick={() => setActiveTab(action.tab)} className="flex min-h-24 items-start gap-4 rounded-2xl border border-white/10 bg-black p-4 text-left transition-colors hover:border-[#C0C0C0]/60 focus-visible:outline-2 focus-visible:outline-[#C0C0C0]"><action.icon className="mt-1 h-5 w-5 shrink-0 text-[#C0C0C0]" /><span><strong className="block text-base text-white">{action.title}</strong><span className="mt-1 block text-sm leading-snug text-zinc-400">{action.detail}</span></span></button>)}
              </div>
            </section>
            <section className="rounded-2xl border border-white/10 bg-black p-5" aria-labelledby="publication-title">
              <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-[#C0C0C0]">Estado de publicación</p><h3 id="publication-title" className="text-xl font-semibold">{readyChecks === publicationChecks.length ? 'La información esencial está completa' : `${readyChecks} de ${publicationChecks.length} puntos listos`}</h3></div><button onClick={() => setActiveTab('customizer')} className="min-h-11 rounded-full bg-white px-5 text-xs font-bold uppercase tracking-wider text-black">Revisar datos</button></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{publicationChecks.map(([label,ready]) => <div key={label} className="flex items-center gap-2 rounded-xl bg-zinc-900 p-3 text-sm">{ready ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-amber-300" />}<span className={ready ? 'text-zinc-200' : 'text-amber-100'}>{label}</span></div>)}</div>
            </section>
            <details className="rounded-2xl border border-violet-400/20 bg-violet-400/[.06] p-5">
              <summary className="cursor-pointer text-sm font-semibold text-violet-200">Ver estadísticas de la invitación</summary>
              <section className="mt-5" aria-labelledby="funnel-title">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs uppercase tracking-widest text-violet-300">Trazabilidad de la invitación</p><h3 id="funnel-title" className="text-xl font-semibold">Embudo de interacción</h3></div><p className="text-xs text-zinc-400">No incluye nombres ni mensajes</p></div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                {[['Visitas', invitationViews], ['Personas únicas', uniqueVisitors], ['Aperturas', invitationOpens], ['Iniciaron RSVP', rsvpStarts], ['Respondieron', rsvpCompletions], ['Conversión', `${conversion}%`]].map(([label,value]) => <div key={label} className="rounded-xl border border-white/10 bg-black/50 p-4"><span className="block text-[11px] uppercase tracking-wide text-zinc-400">{label}</span><strong className="mt-1 block text-2xl text-white">{value}</strong></div>)}
              </div>
              </section>
            </details>
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

          </div>
        )}

        {/* Tab 2: Guest List */}
        {activeTab === 'guests' && (
          <div className="space-y-4">
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C0C0C0]">Lista operativa</p>
                <h3 className="font-serif text-2xl font-semibold text-white">Confirmaciones y detalles</h3>
              </div>
              <button
                onClick={exportGuestTable}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C0C0C0] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black sm:w-auto"
              >
                <FileSpreadsheet className="w-4 h-4" /> Descargar XLS
              </button>
            </div>

            <p className="text-sm text-zinc-400">Respuestas guardadas en Firebase. Podés consultarlas desde cualquier dispositivo con tu cuenta autorizada.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input aria-label="Buscar invitado" placeholder="Nombre, teléfono o correo" value={search} onChange={e => setSearch(e.target.value)} className="rounded-xl bg-zinc-900 p-3" />
              <select aria-label="Estado de respuesta" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl bg-zinc-900 p-3"><option value="ALL">Todas las respuestas</option><option value="CONFIRMED">Confirmaron</option><option value="DECLINED">No asistirán</option><option value="CHECKED_IN">Ingresaron</option></select>
            </div>
            {guests.length === 0 && <p className="p-6">No hay respuestas cargadas. No se muestran invitados de ejemplo.</p>}
            <div className="space-y-2">
              {guests.filter(g => (statusFilter === 'ALL' || g.status === statusFilter) && `${g.name} ${g.lastName} ${g.phone} ${g.email}`.toLowerCase().includes(search.toLowerCase())).map(g => {
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
                        {g.phone ? `WhatsApp: ${g.phone} · ` : ''}Menú: {g.dietaryRestrictions.join(', ') || 'Estándar'}
                      </span>
                      <p className="mt-2">Correo: {g.email || 'No informado'} · Mensaje: {g.notes || 'Sin mensaje'}</p>
                      {isMinor && tutor && (
                        <span className="text-zinc-400 text-[11px] block mt-0.5 text-amber-200/90">
                          Tutor Responsable: <strong>{tutor}</strong> {tutorTel && `(${tutorTel})`}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {g.status === 'CONFIRMED' && <button className="min-h-11 rounded-lg border border-white/20 px-3" onClick={() => checkInGuest(g.id)}>Registrar ingreso</button>}
                      <button className="min-h-11 rounded-lg border border-red-500/30 px-3 text-red-300" onClick={() => deleteContent('guests', g.id)}><Trash2 className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Eliminar invitado</span></button>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        g.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                        g.status === 'CHECKED_IN' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        'bg-[#C0C0C0]/20 text-[#C0C0C0] border border-[#C0C0C0]/30'
                      }`}>
                        {{CONFIRMED: 'Confirmó', DECLINED: 'No asistirá', CHECKED_IN: 'Ingresó', PENDING: 'Pendiente'}[g.status]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && <section className="space-y-6">
          <h3 className="text-2xl font-semibold">Propuestas y publicaciones</h3>
          <p className="text-zinc-400">Las canciones propuestas no aparecen en la invitación hasta que estén en la playlist oficial. Las firmas y fotos sí se publican al enviarse; podés ocultarlas o eliminarlas.</p>
          {[
            { group: 'songs', title: `Canciones pendientes (${pendingSongRequests.length})`, items: pendingSongRequests },
            { group: 'guestbook', title: 'Firmas', items: guestbook },
            { group: 'photobooth', title: 'Fotos', items: photoboothImages }
          ].map(section => <div key={section.group} className="space-y-3">
            <h4 className="text-lg font-semibold">{section.title}</h4>
            {section.items.length === 0 && <p className="text-zinc-400">Todavía no hay contenido.</p>}
            {section.items.map((item: any) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-900 p-4">
              <div><p>{item.title || item.guestName}</p><p className="text-sm text-zinc-400">{item.artist || item.message || item.caption}</p>{item.imageUrl && <img src={item.imageUrl} alt="Foto enviada" className="mt-2 h-32 rounded-lg" />}</div>
              <div className="flex w-full gap-2 sm:w-auto">{section.group === 'songs' ? <a href={item.spotifyUrl || 'https://open.spotify.com/playlist/408drhVBzu4Jxrt501CwOL'} target="_blank" rel="noreferrer" className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[#1DB954]/40 px-3 text-sm text-[#1DB954] sm:flex-none">Abrir Spotify</a> : <button className="min-h-11 flex-1 rounded-lg border border-white/20 px-3 sm:flex-none" onClick={() => moderateContent(section.group, item.id, !item.approved)}>{item.approved ? 'Ocultar' : 'Mostrar'}</button>}<button className="min-h-11 flex-1 rounded-lg border border-red-500/30 px-3 text-red-300 sm:flex-none" onClick={() => deleteContent(section.group, item.id)}><Trash2 className="mr-1 inline h-4 w-4" />Eliminar</button></div>
            </article>)}
            {section.group === 'songs' && <p className="text-xs text-zinc-500">Cuando agregues un tema a Spotify, se mostrará en la web después de la próxima sincronización. Eliminar una propuesta no quita canciones de Spotify.</p>}
          </div>)}
        </section>}
        {/* Tab 3: Customizer */}
        {activeTab === 'customizer' && (
          <form onSubmit={handleSaveConfig} className="mx-auto max-w-6xl space-y-5 pb-24">
            <div className="mb-4">
              <h3 className="font-serif text-2xl font-semibold text-white">Editar la invitación</h3>
              <p className="mt-1 text-sm text-zinc-400">Elegí qué querés cambiar. Podés revisar todo antes de guardar.</p>
              <p role="status" className={`mt-2 text-xs font-semibold ${hasUnsavedChanges ? 'text-amber-300' : 'text-emerald-300'}`}>{hasUnsavedChanges ? 'Tenés cambios sin guardar' : 'Todo está guardado'}</p>
            </div>
            <nav aria-label="Partes de la invitación" className="grid grid-cols-2 gap-2 lg:hidden">
              {customizerSections.map(section => <button key={section.id} type="button" onClick={() => setCustomizerTab(section.id)} aria-current={customizerTab === section.id ? 'page' : undefined} className={`min-h-16 rounded-xl border px-3 py-2 text-left text-xs font-semibold leading-tight transition-colors ${customizerTab === section.id ? 'border-[#C0C0C0] bg-[#C0C0C0] text-black' : 'border-white/10 bg-zinc-900 text-white'}`}>{section.label}</button>)}
            </nav>
            <div className="lg:flex lg:items-start lg:gap-6">
              <nav aria-label="Partes de la invitación" className="hidden lg:sticky lg:top-0 lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:gap-2">
                {customizerSections.map(section => <button key={section.id} type="button" onClick={() => setCustomizerTab(section.id)} aria-current={customizerTab === section.id ? 'page' : undefined} className={`rounded-xl border px-4 py-3 text-left transition-colors ${customizerTab === section.id ? 'border-[#C0C0C0] bg-[#C0C0C0] text-black' : 'border-white/10 bg-zinc-900 text-white hover:border-white/30'}`}><span className="block text-sm font-semibold">{section.label}</span><span className={`mt-1 block text-xs ${customizerTab === section.id ? 'text-black/70' : 'text-zinc-400'}`}>{section.help}</span></button>)}
              </nav>
              <div className="min-w-0 flex-1 space-y-4">
                <div><p className="text-xs uppercase tracking-widest text-[#C0C0C0]">Invitación</p><h4 className="text-xl font-semibold text-white">{selectedCustomizerSection.label}</h4><p className="text-sm text-zinc-400">{selectedCustomizerSection.help}</p></div>
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
                    <input type="datetime-local" value={localDateTimeValue} onChange={e => handleLocalConfigChange('date', e.target.value ? new Date(e.target.value).toISOString() : '')} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
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
                    <input type="text" value={localConfig.cvu} onChange={e => handleLocalConfigChange('cvu', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                </div>
              )}

              {customizerTab === 'content' && (
                <div className="space-y-6">
                  <ContentEditor config={localConfig} onChange={handleLocalConfigChange} />
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Enlace a un álbum compartido (opcional)</label>
                    <input type="url" value={localConfig.eventAlbumUrl || ''} onChange={e => handleLocalConfigChange('eventAlbumUrl', e.target.value)} placeholder="https://photos.app.goo.gl/..." className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
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
                        onClick={() => handleLocalConfigChange('heroImageUrl', DEFAULT_HERO_IMAGE)}
                        aria-pressed={localConfig.heroImageUrl === DEFAULT_HERO_IMAGE}
                        className={`overflow-hidden rounded-2xl border-2 p-1 text-left ${localConfig.heroImageUrl === DEFAULT_HERO_IMAGE ? 'border-[#C0C0C0] shadow-lg shadow-[#C0C0C0]/10' : 'border-white/10'}`}
                      >
                        <img src={resolveHeroImage(DEFAULT_HERO_IMAGE)} alt="Portada disco con bolas de espejo" className="h-28 w-full rounded-xl object-cover" />
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
                  <details className="md:col-span-2 rounded-xl border border-white/10 bg-zinc-900/40 p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-white">Opciones avanzadas de letras y tamaños</summary>
                    <p className="mt-2 text-xs text-zinc-400">No necesitás cambiar esto para publicar la invitación.</p>
                    <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Letra del nombre principal</label>
                    <select value={localConfig.heroFont || 'eyesome'} onChange={e => handleLocalConfigChange('heroFont', e.target.value as any)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none">
                      <option value="eyesome">Eyesome Script</option>
                      <option value="greatvibes">Great Vibes</option>
                      <option value="cormorant">Cormorant Garamond</option>
                    </select>
                    <p className="mt-3 break-words text-4xl text-white" style={{ fontFamily: fontMap[localConfig.heroFont || 'eyesome'] }}>Clara Hoggan</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-300">Tamaño de títulos</label>
                    <select value={localConfig.headingScale || 'normal'} onChange={e => handleLocalConfigChange('headingScale', e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-[#C0C0C0]">
                      <option value="compact">Compacto</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Fuente de Títulos</label>
                    <select
                      value={localConfig.fontHeading || 'cormorant'}
                      onChange={e => handleLocalConfigChange('fontHeading', e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                    >
                      <option value="eyesome">Eyesome Script (Firma Elegante)</option>
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
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-300">Tamaño de textos</label>
                    <select value={localConfig.bodyScale || 'normal'} onChange={e => handleLocalConfigChange('bodyScale', e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-[#C0C0C0]">
                      <option value="compact">Compacto</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>
                    </div>
                  </details>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Enlace de otra imagen para la portada (opcional)</label>
                    <input type="url" value={localConfig.heroImageUrl === DEFAULT_HERO_IMAGE ? '' : localConfig.heroImageUrl} onChange={e => handleLocalConfigChange('heroImageUrl', e.target.value || DEFAULT_HERO_IMAGE)} placeholder="https://ejemplo.com/mi-portada.jpg" className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                    {localConfig.heroImageUrl && (
                      <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-white/10">
                        <img src={resolveHeroImage(localConfig.heroImageUrl)} alt="Vista previa de portada" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5">Hashtag de Instagram</label>
                    <input type="text" value={localConfig.customHashtag} onChange={e => handleLocalConfigChange('customHashtag', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-300">Música al abrir la invitación (opcional)</label>
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
                      { id: 'enableTimeline', label: 'Historia / Trayectoria' },
                      { id: 'enableDressCode', label: 'Guía visual de vestimenta' },
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
              </div>
            </div>
          </form>
        )}

        {/* Tab 5: Collabs / Admins */}
        {activeTab === 'collabs' && (
          <div className="max-w-xl mx-auto">
            <h3 className="font-serif text-2xl font-semibold text-white mb-2">Administradores del Sitio</h3>
            <p className="text-xs text-zinc-400 font-light mb-6">Gestioná los correos de Google (Gmail) que tienen permiso para acceder a este panel de control y modificar la página.</p>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <input
                type="email"
                placeholder="nuevo.admin@gmail.com"
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
                className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
              />
              <button
                onClick={handleAddAdmin}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C0C0C0] text-black font-semibold text-xs tracking-wider hover:bg-white transition-colors uppercase"
              >
                Agregar
              </button>
            </div>

            <div className="space-y-3">
              {(config.adminEmails || ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com']).map(email => (
                <div key={email} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-black border border-white/10">
                  <span className="min-w-0 break-all text-sm text-zinc-300 font-medium">{email}</span>
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
          <div className="fixed bottom-3 left-3 right-3 z-40 flex justify-center rounded-2xl border border-white/10 bg-[#0A0A0A]/95 p-2.5 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
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
                onClick={handleSaveConfig} disabled={saving}
                className="flex-1 rounded-full bg-[#C0C0C0] px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-[#C0C0C0]/20 sm:flex-none"
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        )}

        </div>
        </div>
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
