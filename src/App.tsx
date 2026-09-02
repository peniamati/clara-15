import React, { useState, useEffect, useRef } from 'react';
import { EventProvider, useEvent } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { HeroWelcome } from './components/HeroWelcome';
import { Countdown } from './components/Countdown';
import { LifeTimeline } from './components/LifeTimeline';
import { GalleryMasonry } from './components/GalleryMasonry';
import { VideoSection } from './components/VideoSection';
import { EventInfoDetails } from './components/EventInfoDetails';
import { SeatingChart } from './components/SeatingChart';
import { RsvpForm } from './components/RsvpForm';
import { CollaborativePlaylist } from './components/CollaborativePlaylist';
import { Guestbook } from './components/Guestbook';
import { GiftsSection } from './components/GiftsSection';
import { DressCodeMoodboard } from './components/DressCodeMoodboard';
import { PhotoboothCollabAlbum } from './components/PhotoboothCollabAlbum';
import { InteractiveGames } from './components/InteractiveGames';
import { AiConciergeModal } from './components/AiConciergeModal';
import { ReceptionCheckInApp } from './components/ReceptionCheckInApp';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { WelcomeScreen } from './components/WelcomeScreen';

const AppContent: React.FC = () => {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { config, isPlayingMusic } = useEvent();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.play().catch(e => console.log('Autoplay blocked:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlayingMusic]);

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

  const rootStyle = {
    '--font-heading': fontMap[config.fontHeading || 'cormorant'],
    '--font-body': fontMap[config.fontBody || 'jakarta'],
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#C0C0C0] selection:text-black overflow-x-hidden" style={rootStyle}>
      
      {/* Background audio loop simulator - Upbeat/Disco track */}
      <audio
        ref={audioRef}
        id="bg-audio"
        loop
        src={config.backgroundMusicUrl || "https://cdn.pixabay.com/download/audio/2022/10/25/audio_a1cd1f5795.mp3?filename=retro-wave-style-track-112345.mp3"}
      />

      {/* Welcome Screen for Autoplay Audio */}
      <WelcomeScreen />

      {/* Navigation Bar */}
      <Navbar
        onOpenCheckIn={() => setShowCheckInModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* Main Sections Stack */}
      <main>
        {config.enableHero !== false && <HeroWelcome />}
        {config.enableCountdown !== false && <Countdown />}
        {config.enableTimeline !== false && <LifeTimeline />}
        <GalleryMasonry />
        <VideoSection />
        <EventInfoDetails />
        <SeatingChart />
        <RsvpForm />
        <CollaborativePlaylist />
        {config.enableGuestbook !== false && <Guestbook />}
        {config.enableGifts !== false && <GiftsSection />}
        {config.enableDressCode !== false && <DressCodeMoodboard />}
        <PhotoboothCollabAlbum />
        {config.enableTrivia !== false && <InteractiveGames />}
      </main>

      {/* AI Concierge Floating Assistant */}
      {config.enableAI !== false && <AiConciergeModal />}

      {/* Reception Check-In App Drawer */}
      {showCheckInModal && (
        <ReceptionCheckInApp onClose={() => setShowCheckInModal(false)} />
      )}

      {/* SaaS Admin Control Dashboard */}
      {showAdminModal && (
        <AdminDashboard onClose={() => setShowAdminModal(false)} />
      )}

      {/* Footer & Credits */}
      <Footer />
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
