import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import {
  EventConfig,
  Guest,
  TimelineItem,
  ScheduleItem,
  SongRequest,
  GuestbookMessage,
  PhotoboothImage,
  GiftIdea,
  TriviaQuestion,
  Poll,
  TableInfo,
  FaqItem,
  TimeCapsuleMessage
} from '../types';
import {
  initialEventConfig,
  initialGuests,
  initialTimeline,
  initialSchedule,
  initialSongs,
  initialGuestbook,
  initialPhotobooth,
  initialGifts,
  initialTrivia,
  initialPolls,
  initialTables,
  initialFaqs,
  initialTimeCapsule
} from '../data/mockData';

interface EventContextType {
  config: EventConfig;
  previewConfig: EventConfig | null;
  setPreviewConfig: (config: EventConfig | null) => void;
  activeConfig: EventConfig;
  updateConfig: (newConfig: Partial<EventConfig>) => void;
  guests: Guest[];
  addOrUpdateGuestRsvp: (guestData: Partial<Guest>) => Guest;
  checkInGuest: (guestId: string) => void;
  assignGuestTable: (guestId: string, tableNumber: number) => void;
  timeline: TimelineItem[];
  schedule: ScheduleItem[];
  unlockScheduleStage: (index: number) => void;
  songs: SongRequest[];
  addSongRequest: (song: { title: string; artist: string; submittedBy: string; spotifyUrl?: string }) => void;
  voteSong: (songId: string) => void;
  toggleApproveSong: (songId: string) => void;
  guestbook: GuestbookMessage[];
  addGuestbookMessage: (msg: { guestName: string; message: string; photoUrl?: string }) => void;
  reactToMessage: (id: string, type: 'love' | 'sparkle' | 'cheer') => void;
  timeCapsule: TimeCapsuleMessage[];
  addTimeCapsuleMessage: (msg: { author: string; message: string; unlockAge: 18 | 21 }) => void;
  photoboothImages: PhotoboothImage[];
  addPhotoboothImage: (img: { guestName: string; imageUrl: string; filter: string; sticker: string; caption: string }) => void;
  likePhotoboothImage: (id: string) => void;
  gifts: GiftIdea[];
  triviaQuestions: TriviaQuestion[];
  polls: Poll[];
  votePoll: (pollId: string, optionId: string) => void;
  tables: TableInfo[];
  faqs: FaqItem[];
  activeGuest: Guest | null;
  setActiveGuest: (guest: Guest | null) => void;
  isPlayingMusic: boolean;
  setIsPlayingMusic: React.Dispatch<React.SetStateAction<boolean>>;
  accessibility: {
    fontSize: 'normal' | 'large' | 'xlarge';
    highContrast: boolean;
    darkMode: boolean;
  };
  setAccessibility: React.Dispatch<React.SetStateAction<{
    fontSize: 'normal' | 'large' | 'xlarge';
    highContrast: boolean;
    darkMode: boolean;
  }>>;
  isAdminLoggedIn: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<EventConfig>(initialEventConfig);
  const [previewConfig, setPreviewConfig] = useState<EventConfig | null>(null);
  const activeConfig = previewConfig || config;
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.email) {
      const allowedAdmins = config.adminEmails || ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com'];
      if (allowedAdmins.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase())) {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    } else {
      setIsAdminLoggedIn(false);
    }
  }, [currentUser, config.adminEmails]);

  // Firestore synchronization for config
  useEffect(() => {
    const configDocRef = doc(db, 'settings', 'config');
    const unsubscribe = onSnapshot(configDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const fetchedConfig = docSnapshot.data() as EventConfig;
        setConfig({ ...initialEventConfig, ...fetchedConfig });
      } else {
        // If it doesn't exist in Firestore, initialize it
        setDoc(configDocRef, initialEventConfig).catch(console.error);
      }
    }, (error) => {
      console.error('Error fetching config:', error);
    });
    return () => unsubscribe();
  }, []);

  // Firestore synchronization for guests
  useEffect(() => {
    const guestsRef = collection(db, 'guests');
    const unsubscribe = onSnapshot(guestsRef, (snapshot) => {
      const fetchedGuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guest));
      if (fetchedGuests.length > 0) {
        setGuests(fetchedGuests);
      }
    }, (error) => {
      console.error('Error fetching guests:', error);
    });
    return () => unsubscribe();
  }, []);

  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [songs, setSongs] = useState<SongRequest[]>(() => {
    const saved = localStorage.getItem('maestro_songs');
    return saved ? JSON.parse(saved) : initialSongs;
  });

  const [guestbook, setGuestbook] = useState<GuestbookMessage[]>(() => {
    const saved = localStorage.getItem('maestro_guestbook');
    return saved ? JSON.parse(saved) : initialGuestbook;
  });

  const [timeCapsule, setTimeCapsule] = useState<TimeCapsuleMessage[]>(initialTimeCapsule);
  const [photoboothImages, setPhotoboothImages] = useState<PhotoboothImage[]>(() => {
    const saved = localStorage.getItem('maestro_photobooth');
    return saved ? JSON.parse(saved) : initialPhotobooth;
  });

  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [tables, setTables] = useState<TableInfo[]>(initialTables);
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);

  const [accessibility, setAccessibility] = useState<{
    fontSize: 'normal' | 'large' | 'xlarge';
    highContrast: boolean;
    darkMode: boolean;
  }>({
    fontSize: 'normal',
    highContrast: false,
    darkMode: true
  });

  useEffect(() => {
    localStorage.setItem('maestro_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('maestro_guestbook', JSON.stringify(guestbook));
  }, [guestbook]);

  useEffect(() => {
    localStorage.setItem('maestro_photobooth', JSON.stringify(photoboothImages));
  }, [photoboothImages]);

  const updateConfig = (newConfig: Partial<EventConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    const configDocRef = doc(db, 'settings', 'config');
    updateDoc(configDocRef, newConfig).catch((err) => {
      console.error('Error updating config:', err);
    });
  };

  const addOrUpdateGuestRsvp = (guestData: Partial<Guest>): Guest => {
    const existingIndex = guests.findIndex(
      g => (guestData.id && g.id === guestData.id) ||
           (g.email.toLowerCase() === (guestData.email || '').toLowerCase())
    );

    let updatedGuest: Guest;
    if (existingIndex >= 0) {
      updatedGuest = {
        ...guests[existingIndex],
        ...guestData,
        status: guestData.status || 'CONFIRMED'
      };
      
      setGuests(prev => {
        const next = [...prev];
        next[existingIndex] = updatedGuest;
        return next;
      });

      const guestDocRef = doc(db, 'guests', updatedGuest.id);
      setDoc(guestDocRef, updatedGuest).catch((err) => {
        console.warn('Firestore sync note:', err?.message || err);
      });

    } else {
      const newId = `gst-${Date.now()}`;
      const name = guestData.name || 'Invitado';
      const lastName = guestData.lastName || '';
      updatedGuest = {
        id: newId,
        name,
        lastName,
        email: guestData.email || '',
        phone: guestData.phone || '',
        age: guestData.age,
        tutorName: guestData.tutorName || guestData.emergencyContactName,
        tutorPhone: guestData.tutorPhone || guestData.emergencyContactPhone,
        status: guestData.status || 'CONFIRMED',
        adultsCount: guestData.adultsCount ?? 1,
        kidsCount: guestData.kidsCount ?? 0,
        tableNumber: Math.floor(Math.random() * 5) + 1,
        dietaryRestrictions: guestData.dietaryRestrictions || [],
        emergencyContactName: guestData.tutorName || guestData.emergencyContactName,
        emergencyContactPhone: guestData.tutorPhone || guestData.emergencyContactPhone,
        notes: guestData.notes || '',
        qrCode: `QR-CLARA15-${newId}-${name.toUpperCase().replace(/\s+/g, '')}`,
        uniqueInviteUrl: `/invitacion/${name.toLowerCase().replace(/\s+/g, '-')}-${lastName.toLowerCase().replace(/\s+/g, '-')}`
      };
      
      setGuests(prev => [updatedGuest, ...prev]);

      const guestDocRef = doc(db, 'guests', updatedGuest.id);
      setDoc(guestDocRef, updatedGuest).catch((err) => {
        console.warn('Firestore sync note:', err?.message || err);
      });
    }

    setActiveGuest(updatedGuest);
    return updatedGuest;
  };

  const checkInGuest = (guestId: string) => {
    const nowTime = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    setGuests(prev =>
      prev.map(g => g.id === guestId ? { ...g, status: 'CHECKED_IN', checkInTime: nowTime } : g)
    );
    const guestDocRef = doc(db, 'guests', guestId);
    updateDoc(guestDocRef, {
      status: 'CHECKED_IN',
      checkInTime: nowTime
    }).catch((err) => {
      console.warn('Firestore check-in sync note:', err?.message || err);
    });
  };

  const assignGuestTable = (guestId: string, tableNumber: number) => {
    setGuests(prev =>
      prev.map(g => g.id === guestId ? { ...g, tableNumber } : g)
    );
    const guestDocRef = doc(db, 'guests', guestId);
    updateDoc(guestDocRef, { tableNumber }).catch((err) => {
      console.warn('Firestore table assign sync note:', err?.message || err);
    });
  };

  const unlockScheduleStage = (index: number) => {
    setSchedule(prev =>
      prev.map((item, idx) => idx === index ? { ...item, isUnlocked: true } : item)
    );
  };

  const addSongRequest = (songData: { title: string; artist: string; submittedBy: string; spotifyUrl?: string }) => {
    const newSong: SongRequest = {
      id: `s-${Date.now()}`,
      title: songData.title,
      artist: songData.artist,
      submittedBy: songData.submittedBy || 'Invitado',
      votes: 1,
      approved: true,
      spotifyUrl: songData.spotifyUrl
    };
    setSongs(prev => [newSong, ...prev]);
  };

  const voteSong = (songId: string) => {
    setSongs(prev =>
      prev.map(s => s.id === songId ? { ...s, votes: s.votes + 1 } : s)
    );
  };

  const toggleApproveSong = (songId: string) => {
    setSongs(prev =>
      prev.map(s => s.id === songId ? { ...s, approved: !s.approved } : s)
    );
  };

  const addGuestbookMessage = (msg: { guestName: string; message: string; photoUrl?: string }) => {
    const newMsg: GuestbookMessage = {
      id: `gb-${Date.now()}`,
      guestName: msg.guestName || `Amigo de ${config.honoree}`,
      message: msg.message,
      reactions: { love: 1, sparkle: 1, cheer: 1 },
      photoUrl: msg.photoUrl,
      createdAt: new Date().toISOString(),
      approved: true
    };
    setGuestbook(prev => [newMsg, ...prev]);
  };

  const reactToMessage = (id: string, type: 'love' | 'sparkle' | 'cheer') => {
    setGuestbook(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            reactions: {
              ...item.reactions,
              [type]: item.reactions[type] + 1
            }
          };
        }
        return item;
      })
    );
  };

  const addTimeCapsuleMessage = (msg: { author: string; message: string; unlockAge: 18 | 21 }) => {
    const newCapsule: TimeCapsuleMessage = {
      id: `tc-${Date.now()}`,
      author: msg.author,
      message: msg.message,
      unlockAge: msg.unlockAge,
      createdAt: new Date().toISOString()
    };
    setTimeCapsule(prev => [newCapsule, ...prev]);
  };

  const addPhotoboothImage = (img: { guestName: string; imageUrl: string; filter: string; sticker: string; caption: string }) => {
    const newImg: PhotoboothImage = {
      id: `pb-${Date.now()}`,
      guestName: img.guestName || `Invitado de ${config.honoree}`,
      imageUrl: img.imageUrl,
      filter: img.filter,
      sticker: img.sticker,
      caption: img.caption,
      createdAt: new Date().toISOString(),
      likes: 1,
      approved: true
    };
    setPhotoboothImages(prev => [newImg, ...prev]);
  };

  const likePhotoboothImage = (id: string) => {
    setPhotoboothImages(prev =>
      prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item)
    );
  };

  const votePoll = (pollId: string, optionId: string) => {
    setPolls(prev =>
      prev.map(p => {
        if (p.id === pollId) {
          return {
            ...p,
            options: p.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)
          };
        }
        return p;
      })
    );
  };

  return (
    <EventContext.Provider
      value={{
        config: activeConfig,
        previewConfig,
        setPreviewConfig,
        activeConfig,
        updateConfig,
        guests,
        addOrUpdateGuestRsvp,
        checkInGuest,
        assignGuestTable,
        timeline: initialTimeline,
        schedule,
        unlockScheduleStage,
        songs,
        addSongRequest,
        voteSong,
        toggleApproveSong,
        guestbook,
        addGuestbookMessage,
        reactToMessage,
        timeCapsule,
        addTimeCapsuleMessage,
        photoboothImages,
        addPhotoboothImage,
        likePhotoboothImage,
        gifts: initialGifts,
        triviaQuestions: initialTrivia,
        polls,
        votePoll,
        tables,
        faqs: initialFaqs,
        activeGuest,
        setActiveGuest,
        isPlayingMusic,
        setIsPlayingMusic,
        accessibility,
        setAccessibility,
        isAdminLoggedIn,
        setIsAdminLoggedIn
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
