import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, where, runTransaction, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { visitorId } from '../lib/visitor';
import { db, auth, firebaseConfigurationIssues } from '../lib/firebase';
import { describePersistenceError, validatePhotoSource } from '../lib/photoUpload';
import { listDriveImages } from '../lib/driveUtils';
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
  TimeCapsuleMessage,
  AnalyticsEvent,
  AnalyticsEventType
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
  syncError: string;
  clearSyncError: () => void;
  moderateContent: (group: string, id: string, approved: boolean) => Promise<boolean>;
  deleteContent: (group: string, id: string) => Promise<boolean>;
  config: EventConfig;
  previewConfig: EventConfig | null;
  setPreviewConfig: (config: EventConfig | null) => void;
  activeConfig: EventConfig;
  updateConfig: (newConfig: Partial<EventConfig>) => Promise<void>;
  guests: Guest[];
  addOrUpdateGuestRsvp: (guestData: Partial<Guest>) => Promise<Guest>;
  checkInGuest: (guestId: string) => Promise<boolean>;
  assignGuestTable: (guestId: string, tableNumber: number) => Promise<boolean>;
  timeline: TimelineItem[];
  schedule: ScheduleItem[];
  unlockScheduleStage: (index: number) => void;
  songs: SongRequest[];
  addSongRequest: (song: { title: string; artist: string; submittedBy: string; note?: string; spotifyUrl?: string }) => Promise<boolean>;
  voteSong: (songId: string) => Promise<boolean>;
  toggleApproveSong: (songId: string) => Promise<boolean>;
  guestbook: GuestbookMessage[];
  addGuestbookMessage: (msg: { guestName: string; message: string; photoUrl?: string }) => Promise<boolean>;
  reactToMessage: (id: string, type: 'love' | 'sparkle' | 'cheer') => Promise<boolean>;
  timeCapsule: TimeCapsuleMessage[];
  addTimeCapsuleMessage: (msg: { author: string; message: string; unlockAge: 18 | 21 }) => Promise<boolean>;
  photoboothImages: PhotoboothImage[];
  addPhotoboothImage: (img: { guestName: string; imageUrl: string; filter: string; sticker: string; caption: string }) => Promise<boolean>;
  likePhotoboothImage: (id: string) => Promise<boolean>;
  gifts: GiftIdea[];
  triviaQuestions: TriviaQuestion[];
  polls: Poll[];
  votePoll: (pollId: string, optionId: string) => Promise<boolean>;
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
  setIsAdminLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isConfigReady: boolean;
  analyticsEvents: AnalyticsEvent[];
  trackEvent: (type: AnalyticsEventType) => Promise<boolean>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncError, setSyncError] = useState(() => firebaseConfigurationIssues.length
    ? `El despliegue no tiene configurado Firebase (${firebaseConfigurationIssues.join(', ')}).`
    : '');
  const [config, setConfig] = useState<EventConfig>(initialEventConfig);
  const [isConfigReady, setIsConfigReady] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<EventConfig | null>(null);
  const activeConfig = previewConfig || config;
  const [guests, setGuests] = useState<Guest[]>([]);
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
    if (firebaseConfigurationIssues.length) {
      setIsConfigReady(true);
      return;
    }
    const configDocRef = doc(db, 'settings', 'config');
    const unsubscribe = onSnapshot(configDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const fetchedConfig = docSnapshot.data() as EventConfig;
        setConfig({ ...initialEventConfig, ...fetchedConfig });
      }
      setIsConfigReady(true);
    }, (error) => {
      console.error('Error fetching config:', error);
      setSyncError('No pudimos cargar la configuración. Revisá conexión y permisos.');
      // Keep the invitation usable with bundled data if Firestore is unavailable.
      setIsConfigReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore synchronization for guests
  useEffect(() => {
    if (!isAdminLoggedIn) { setGuests([]); return; }
    const guestsRef = collection(db, 'guests');
    const unsubscribe = onSnapshot(guestsRef, (snapshot) => {
      const fetchedGuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guest));
      setGuests(fetchedGuests);
    }, (error) => {
      console.error('Error fetching guests:', error);
      setSyncError('No pudimos cargar las confirmaciones. Revisá los permisos de tu cuenta.');
    });
    return () => unsubscribe();
  }, [isAdminLoggedIn]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [songs, setSongs] = useState<SongRequest[]>(() => firebaseConfigurationIssues.length ? initialSongs : []);
  const [spotifySongs, setSpotifySongs] = useState<SongRequest[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookMessage[]>(() => firebaseConfigurationIssues.length ? initialGuestbook : []);
  const [timeCapsule, setTimeCapsule] = useState<TimeCapsuleMessage[]>([]);
  const [photoboothImages, setPhotoboothImages] = useState<PhotoboothImage[]>(() => firebaseConfigurationIssues.length ? initialPhotobooth : []);
  const [driveImages, setDriveImages] = useState<PhotoboothImage[]>([]);
  const [polls, setPolls] = useState<Poll[]>(() => firebaseConfigurationIssues.length ? initialPolls : []);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [tables, setTables] = useState<TableInfo[]>(initialTables);
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/spotify-playlist', { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((payload: { tracks?: Array<Pick<SongRequest, 'id' | 'title' | 'artist' | 'spotifyUrl'>> }) => {
        if (!Array.isArray(payload.tracks)) return;
        setSpotifySongs(payload.tracks.map(track => ({
          ...track,
          submittedBy: 'Playlist Oficial',
          votes: 0,
          approved: true,
          createdAt: new Date().toISOString()
        })));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let active = true;
    const syncDrive = () => listDriveImages().then(images => {
      if (!active) return;
      setDriveImages(images.map(image => ({
        id: `drive-${image.id}`,
        guestName: 'Google Drive',
        imageUrl: image.imageUrl,
        filter: 'Normal',
        sticker: 'Sin sticker',
        caption: image.name,
        likes: 0,
        approved: true,
        createdAt: image.createdAt
      })));
    }).catch(error => {
      if (active) setSyncError(error instanceof Error ? error.message : 'No se pudo sincronizar Google Drive.');
    });
    void syncDrive();
    const timer = window.setInterval(syncDrive, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

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
    if (firebaseConfigurationIssues.length) return;
    const stops = [
      ['songs', setSongs], ['guestbook', setGuestbook], ['photobooth', setPhotoboothImages],
      ['polls', setPolls],
    ].map(([name, setter]) => {
      const source = collection(db, name as string);
      const readable = name === 'polls' || isAdminLoggedIn ? source : query(source, where('approved', '==', true));
      return onSnapshot(readable, snap => {
        const remoteItems = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        if (name === 'songs') {
          const remoteKeys = new Set(remoteItems.map((item: any) => `${item.title}|${item.artist}`.toLocaleLowerCase('es')));
          (setter as (items: any[]) => void)([
            ...remoteItems,
            ...initialSongs.filter(item => !remoteKeys.has(`${item.title}|${item.artist}`.toLocaleLowerCase('es')))
          ]);
        } else {
          (setter as (items: any[]) => void)(remoteItems);
        }
      }, () => setSyncError('No se pudieron sincronizar los contenidos. Revisá la conexión y los permisos.'));
    });
    if (isAdminLoggedIn) stops.push(onSnapshot(collection(db, 'capsules'), snap => {
      setTimeCapsule(snap.docs.map(d => ({ ...d.data(), id: d.id } as TimeCapsuleMessage)));
    }, () => setSyncError('No se pudieron cargar las cápsulas.')));
    else setTimeCapsule([]);
    return () => stops.forEach(stop => stop());
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (!isAdminLoggedIn) { setAnalyticsEvents([]); return; }
    return onSnapshot(collection(db, 'analytics'), snap => {
      setAnalyticsEvents(snap.docs.map(item => ({ id: item.id, ...item.data() } as AnalyticsEvent)));
    }, () => setSyncError('No se pudieron cargar las métricas de la invitación.'));
  }, [isAdminLoggedIn]);

  const persist = async (operation: () => Promise<unknown>): Promise<boolean> => {
    try { await operation(); return true; }
    catch (error) {
      console.error(error);
      setSyncError(describePersistenceError(error));
      return false;
    }
  };
  const moderateContent = (group: string, id: string, approved: boolean) =>
    persist(() => updateDoc(doc(db, group, id), { approved }));
  const deleteContent = (group: string, id: string) =>
    persist(() => deleteDoc(doc(db, group, id)));

  const updateConfig = async (newConfig: Partial<EventConfig>) => {
    await setDoc(doc(db, 'settings', 'config'), newConfig, { merge: true });
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const addOrUpdateGuestRsvp = async (guestData: Partial<Guest>): Promise<Guest> => {
    // Never match on an optional email: two empty emails are different guests.
    const ownerUid = await visitorId();
    const id = crypto.randomUUID();
    const guest: Guest = {
      id, name: guestData.name || '', lastName: guestData.lastName || '',
      email: guestData.email || '', phone: guestData.phone || '',
      status: guestData.status || 'CONFIRMED', adultsCount: 1, kidsCount: 0,
      tableNumber: 0, dietaryRestrictions: [], notes: '',
      ...guestData,
      qrCode: id, uniqueInviteUrl: '',
    };
    const clean = JSON.parse(JSON.stringify({ ...guest, ownerUid, createdAt: new Date().toISOString() }));
    await setDoc(doc(db, 'guests', id), clean);
    setActiveGuest(clean);
    return clean;
  };

  const checkInGuest = (guestId: string) => persist(() => updateDoc(doc(db, 'guests', guestId), {
    status: 'CHECKED_IN', checkInTime: new Date().toISOString()
  }));
  const assignGuestTable = (guestId: string, tableNumber: number) =>
    persist(() => updateDoc(doc(db, 'guests', guestId), { tableNumber }));
  const unlockScheduleStage = (index: number) => {
    setSchedule(prev => prev.map((item, idx) => idx === index ? { ...item, isUnlocked: true } : item));
  };
  const createContent = (group: string, data: object) => persist(async () => {
    const ownerUid = await visitorId();
    await setDoc(doc(collection(db, group)), JSON.parse(JSON.stringify({
      ...data, ownerUid, createdAt: new Date().toISOString()
    })));
  });
  const trackEvent = (type: AnalyticsEventType) => persist(async () => {
    const ownerUid = await visitorId();
    let sessionId = sessionStorage.getItem('invitation-session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('invitation-session-id', sessionId);
    }
    await setDoc(doc(collection(db, 'analytics')), { type, ownerUid, sessionId, createdAt: new Date().toISOString() });
  });
  const addSongRequest = (song: { title: string; artist: string; submittedBy: string; note?: string; spotifyUrl?: string }) =>
    createContent('songs', { ...song, votes: 0, approved: true });
  const addGuestbookMessage = (msg: { guestName: string; message: string; photoUrl?: string }) =>
    createContent('guestbook', { ...msg, reactions: { love: 0, sparkle: 0, cheer: 0 }, approved: true });
  const addTimeCapsuleMessage = (msg: { author: string; message: string; unlockAge: 18 | 21 }) =>
    createContent('capsules', msg);
  const addPhotoboothImage = (img: { guestName: string; imageUrl: string; filter: string; sticker: string; caption: string }) =>
    persist(async () => {
      const ownerUid = await visitorId();
      const id = crypto.randomUUID();
      const validationError = validatePhotoSource(img.imageUrl);
      if (validationError) throw new Error(validationError);
      const optimisticPhoto: PhotoboothImage = {
        id,
        guestName: img.guestName,
        imageUrl: img.imageUrl,
        filter: img.filter,
        sticker: img.sticker,
        caption: img.caption,
        likes: 0,
        approved: true,
        ownerUid,
        createdAt: new Date().toISOString()
      };
      setPhotoboothImages(prev => [optimisticPhoto, ...prev]);
      try {
        await setDoc(doc(db, 'photobooth', id), { ...img, ownerUid, approved: true, likes: 0, createdAt: new Date().toISOString() });
      } catch (error) {
        setPhotoboothImages(prev => prev.filter(item => item.id !== id));
        throw error;
      }
    });
  const vote = (group: string, id: string, field: string) => persist(async () => {
    const uid = await visitorId();
    const target = doc(db, group, id);
    const receipt = doc(db, group, id, 'votes', uid + '-' + field.replaceAll('.', '-'));
    try {
      await runTransaction(db, async tx => {
        const existing = await tx.get(receipt);
        if (existing.exists()) return;
        tx.set(receipt, { ownerUid: uid, field });
        tx.update(target, { [field]: increment(1) });
      });
    } catch {
      await updateDoc(target, { [field]: increment(1) });
    }
  });
  const voteSong = (id: string) => {
    const bundledSong = initialSongs.find(song => song.id === id) || spotifySongs.find(song => song.id === id);
    const persistedSong = songs.find(song => song.id === id && song.ownerUid);
    if (!bundledSong || persistedSong) return vote('songs', id, 'votes');
    return persist(async () => {
      const ownerUid = await visitorId();
      await setDoc(doc(db, 'songs', id), {
        ...bundledSong,
        votes: (bundledSong.votes || 0) + 1,
        approved: true,
        ownerUid,
        createdAt: new Date().toISOString()
      });
    });
  };
  const toggleApproveSong = (id: string) => moderateContent('songs', id, !songs.find(s => s.id === id)?.approved);
  const reactToMessage = (id: string, type: 'love' | 'sparkle' | 'cheer') => vote('guestbook', id, 'reactions.' + type);
  const likePhotoboothImage = (id: string) => {
    const driveImage = driveImages.find(image => image.id === id);
    const persistedImage = photoboothImages.find(image => image.id === id);
    if (!driveImage || persistedImage) return vote('photobooth', id, 'likes');
    return persist(async () => {
      const ownerUid = await visitorId();
      await setDoc(doc(db, 'photobooth', id), { ...driveImage, likes: 1, ownerUid });
    });
  };
  const votePoll = (id: string, optionId: string) => persist(async () => {
    const uid = await visitorId();
    await setDoc(doc(db, 'polls', id, 'votes', uid), { ownerUid: uid, optionId });
  });

  const pollIds = polls.map(p => p.id).join(',');
  useEffect(() => {
    if (!pollIds) return;
    const stops = pollIds.split(',').map(id => onSnapshot(collection(db, 'polls', id, 'votes'), snap => {
      const votes = snap.docs.map(d => d.data().optionId);
      setPolls(prev => prev.map(p => p.id === id ? { ...p, options: p.options.map(o => ({ ...o, votes: votes.filter(v => v === o.id).length })) } : p));
    }));
    return () => stops.forEach(stop => stop());
  }, [pollIds]);

  const mergedSongs = spotifySongs.length
    ? [...songs, ...spotifySongs.filter(spotifySong => !songs.some(song => song.id === spotifySong.id || (`${song.title}|${song.artist}`.toLocaleLowerCase('es') === `${spotifySong.title}|${spotifySong.artist}`.toLocaleLowerCase('es'))))]
    : songs;
  const mergedPhotoboothImages = [
    ...photoboothImages,
    ...driveImages.filter(driveImage => !photoboothImages.some(image => image.id === driveImage.id || image.imageUrl === driveImage.imageUrl))
  ].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  return (
    <EventContext.Provider
      value={{
        syncError, clearSyncError: () => setSyncError(''), moderateContent, deleteContent,
        config: activeConfig,
        previewConfig,
        setPreviewConfig,
        activeConfig,
        updateConfig,
        guests,
        addOrUpdateGuestRsvp,
        checkInGuest,
        assignGuestTable,
        timeline: config.timeline || [],
        schedule: config.schedule || [],
        unlockScheduleStage,
        songs: mergedSongs,
        addSongRequest,
        voteSong,
        toggleApproveSong,
        guestbook,
        addGuestbookMessage,
        reactToMessage,
        timeCapsule,
        addTimeCapsuleMessage,
        photoboothImages: mergedPhotoboothImages,
        addPhotoboothImage,
        likePhotoboothImage,
        gifts: config.gifts || [],
        triviaQuestions: config.trivia || [],
        polls,
        votePoll,
        tables: (config.tables || []).map(t => ({ ...t, assignedGuests: guests.filter(g => g.tableNumber === t.number).map(g => g.id) })),
        faqs: initialFaqs,
        activeGuest,
        setActiveGuest,
        isPlayingMusic,
        setIsPlayingMusic,
        accessibility,
        setAccessibility,
        isAdminLoggedIn,
        isConfigReady,
        analyticsEvents,
        trackEvent,
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
