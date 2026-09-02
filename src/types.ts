export type ThemeColor = 'gold-emerald' | 'rose-gold' | 'royal-violet' | 'midnight-silver' | 'champagne' | 'silver-disco';

export type FontFamily = 'cormorant' | 'playfair' | 'montserrat' | 'lato' | 'inter' | 'jakarta' | 'roboto' | 'opensans' | 'poppins' | 'raleway' | 'nunito' | 'merriweather' | 'lora' | 'cinzel' | 'dancing' | 'greatvibes' | 'dmsans' | 'quicksand' | 'oswald';

export interface EventConfig {
  id: string;
  honoree: string;
  eventType: string; // "Mis 15" | "Boda" | "Cumpleaños"
  subTitle: string;
  date: string;
  venue: string;
  address: string;
  city: string;
  googleMapsUrl: string;
  wazeUrl: string;
  appleMapsUrl: string;
  dressCode: string;
  dressCodeDetails: string;
  suggestedColors: string[];
  forbiddenColors: string[];
  cbu: string;
  cvu: string;
  alias: string;
  mpQrUrl: string;
  payPalUrl: string;
  theme: ThemeColor;
  fontHeading?: FontFamily;
  fontBody?: FontFamily;
  enableHero?: boolean;
  enableCountdown?: boolean;
  enableTimeline?: boolean;
  enableDressCode?: boolean;
  enableGifts?: boolean;
  enableGuestbook?: boolean;
  enableTrivia?: boolean;
  enableAI?: boolean;
  backgroundMusicUrl: string;
  customHashtag: string;
  rsvpDeadline: string;
  welcomeMessage: string;
  heroVideoUrl?: string;
  heroImageUrl: string;
  adminEmails?: string[];
}

export interface Guest {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  age?: number;
  tutorName?: string;
  tutorPhone?: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'CHECKED_IN';
  adultsCount: number;
  kidsCount: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  tableNumber: number;
  dietaryRestrictions: string[];
  notes: string;
  qrCode: string;
  checkInTime?: string;
  uniqueInviteUrl: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  category: 'Nacimiento' | 'Infancia' | 'Colegio' | 'Viajes' | 'Familia' | 'Amigos' | 'Hoy';
  description: string;
  imageUrl: string;
  videoUrl?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  iconName: string;
  isUnlocked?: boolean;
}

export interface SongRequest {
  id: string;
  title: string;
  artist: string;
  submittedBy: string;
  votes: number;
  approved: boolean;
  spotifyUrl?: string;
  youtubeUrl?: string;
}

export interface GuestbookMessage {
  id: string;
  guestName: string;
  message: string;
  reactions: { love: number; sparkle: number; cheer: number };
  photoUrl?: string;
  voiceAudioUrl?: string;
  createdAt: string;
  approved: boolean;
}

export interface TimeCapsuleMessage {
  id: string;
  author: string;
  message: string;
  unlockAge: 18 | 21;
  createdAt: string;
}

export interface PhotoboothImage {
  id: string;
  guestName: string;
  imageUrl: string;
  filter: string;
  sticker: string;
  caption: string;
  createdAt: string;
  likes: number;
  approved: boolean;
}

export interface GiftIdea {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string;
}

export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export interface TableInfo {
  number: number;
  name: string;
  capacity: number;
  assignedGuests: string[];
  position: { x: number; y: number };
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Ubicación' | 'Dress Code' | 'Regalos' | 'Niños';
}
