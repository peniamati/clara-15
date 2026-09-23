import React, { Suspense, useEffect, useRef, useState } from 'react';
import { EventProvider, useEvent } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { HeroWelcome } from './components/HeroWelcome';
import { Countdown } from './components/Countdown';
import { LifeTimeline } from './components/LifeTimeline';
import { GalleryMasonry } from './components/GalleryMasonry';
import { MomentosDeLaNoche } from './components/MomentosDeLaNoche';
import { EventInfoDetails } from './components/EventInfoDetails';
import { RsvpForm } from './components/RsvpForm';
import { CollaborativePlaylist } from './components/CollaborativePlaylist';
import { LibroDeFirmas } from './components/LibroDeFirmas';
import { GiftsSection } from './components/GiftsSection';
import { DressCodeMoodboard } from './components/DressCodeMoodboard';
import { InteractiveGames } from './components/InteractiveGames';
import { Footer } from './components/Footer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BackgroundMusic } from './components/BackgroundMusic';
import { Notice } from './components/Notice';
import { AsyncPanelBoundary } from './components/AsyncPanelBoundary';

const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ReceptionCheckInApp = React.lazy(() => import('./components/ReceptionCheckInApp').then(module => ({ default: module.ReceptionCheckInApp })));

const AppContent: React.FC = () => {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(window.location.hash === '#organizador');
  const [adminPreview, setAdminPreview] = useState(false);
  useEffect(() => {
    const navigate = () => setShowAdminModal(window.location.hash === '#organizador');
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  const { config, isConfigReady, isPlayingMusic, setIsPlayingMusic, syncError, clearSyncError, trackEvent } = useEvent();
  const [isInvitationOpened, setIsInvitationOpened] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.hash.includes('organizador') ||
      sessionStorage.getItem('clara15_invitation_opened') === 'true'
    );
  });
  const [isInvitationReady, setIsInvitationReady] = useState(false);
  const hasLoadedInitialInvitation = useRef(false);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!isConfigReady || showAdminModal || hasTrackedView.current) return;
    hasTrackedView.current = true;
    void trackEvent('invitation_view');
  }, [isConfigReady, showAdminModal, trackEvent]);

  const fontMap: Record<string, string> = {
    'cormorant': '"Cormorant Garamond", serif',
    'eyesome': '"Eyesome Script", cursive',
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

  const rootStyle = {
    '--font-hero': fontMap[config.heroFont || 'eyesome'],
    '--font-heading': fontMap[config.fontHeading || 'cormorant'],
    '--font-body': fontMap[config.fontBody || 'jakarta'],
    fontSize: ({ compact: '15px', normal: '16px', large: '17px' } as const)[config.bodyScale || 'normal'],
  } as React.CSSProperties;

  useEffect(() => {
    if (!isConfigReady || hasLoadedInitialInvitation.current) return;

    let cancelled = false;
    const fontRoot = document.querySelector('#root > div') || document.documentElement;
    const styles = getComputedStyle(fontRoot);
    const heading = styles.getPropertyValue('--font-heading').trim();
    const hero = styles.getPropertyValue('--font-hero').trim();
    const body = styles.getPropertyValue('--font-body').trim();

    const fontTimeout = new Promise<void>(resolve => window.setTimeout(resolve, 3000));
    Promise.race([Promise.all([
      document.fonts.ready,
      document.fonts.load(`600 1em ${heading}`),
      document.fonts.load(`400 1em ${hero}`),
      document.fonts.load(`400 1em ${body}`),
    ]), fontTimeout]).catch(() => undefined).finally(() => {
      if (!cancelled) {
        hasLoadedInitialInvitation.current = true;
        setIsInvitationReady(true);
      }
    });

    return () => { cancelled = true; };
  }, [config.fontBody, config.fontHeading, config.heroFont, isConfigReady]);

  if (!isConfigReady || (!isInvitationReady && !showAdminModal)) {
    return <div className="min-h-[100dvh] bg-[#050505]" style={rootStyle} aria-label="Cargando invitación" />;
  }

  // Cover page before guest opens the invitation
  if (!isInvitationOpened && !showAdminModal) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden" style={rootStyle}>
        <WelcomeScreen
          onOpen={() => {
            setIsInvitationOpened(true);
            sessionStorage.setItem('clara15_invitation_opened', 'true');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          onOpenAdmin={() => {
            setShowAdminModal(true);
            window.location.hash = 'organizador';
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#C0C0C0] selection:text-black overflow-x-hidden" style={rootStyle}>
      
      {syncError && <div role="alert" className="fixed bottom-4 left-4 right-4 z-[200] rounded-xl border border-red-400 bg-red-950 p-4 text-white"><p>{syncError}</p><button className="mt-2 underline" onClick={clearSyncError}>Entendido</button></div>}
      <Notice />
      <div hidden={showAdminModal && !adminPreview}>
      <BackgroundMusic
        source={config.backgroundMusicUrl}
        isPlaying={isPlayingMusic && !showAdminModal}
        onPlaybackError={() => setIsPlayingMusic(false)}
      />

      {/* Navigation Bar */}
      <Navbar
        onOpenCheckIn={() => setShowCheckInModal(true)}
        onOpenAdmin={() => { window.location.hash = 'organizador'; }}
      />

      {/* Main Sections Stack */}
      <main>
        {config.enableHero !== false && <HeroWelcome />}
        {config.enableCountdown !== false && <Countdown />}
        <EventInfoDetails />
        <RsvpForm />
        {config.enableTimeline !== false && <LifeTimeline />}
        <GalleryMasonry />
        <MomentosDeLaNoche />
        <CollaborativePlaylist />
        {config.enableGuestbook !== false && <LibroDeFirmas />}
        {config.enableGifts !== false && <GiftsSection />}
        {config.enableDressCode !== false && <DressCodeMoodboard />}
        {config.enableTrivia !== false && <InteractiveGames />}
      </main>

      {/* Reception Check-In App Drawer */}
      {showCheckInModal && (
        <AsyncPanelBoundary label="el ingreso"><Suspense fallback={<div role="status" className="fixed inset-0 z-50 grid place-items-center bg-black text-white">Abriendo ingreso…</div>}><ReceptionCheckInApp onClose={() => setShowCheckInModal(false)} /></Suspense></AsyncPanelBoundary>
      )}

      <Footer />
      </div>
      {/* Independent organizer screen */}
      {showAdminModal && (
        <AsyncPanelBoundary label="el organizador"><Suspense fallback={<div role="status" className="fixed inset-0 z-50 grid place-items-center bg-black text-white">Abriendo panel…</div>}><AdminDashboard onClose={() => { window.location.hash = 'inicio'; }} onPreviewChange={setAdminPreview} /></Suspense></AsyncPanelBoundary>
      )}

    </div>
  );
};

export function App() {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
}

export default App;
