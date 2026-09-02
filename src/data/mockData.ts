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

export const initialEventConfig: EventConfig = {
  id: 'evt-clara-15',
  honoree: 'Clara Hoggan',
  eventType: 'Mis 15',
  subTitle: 'Noche Disco, Brillo y Celebración',
  date: '2026-10-17T20:00:00',
  venue: 'Salón de Eventos Gala',
  address: 'Av. Libertador 2450',
  city: 'Buenos Aires, Argentina',
  googleMapsUrl: 'https://maps.google.com/?q=Buenos+Aires+Argentina',
  wazeUrl: 'https://waze.com/ul?q=Buenos+Aires',
  appleMapsUrl: 'https://maps.apple.com/?q=Buenos+Aires',
  dressCode: 'Elegante / Disco Chic',
  dressCodeDetails: 'Traje oscuro o camisa elegante para ellos. Vestidos con brillo, plata o negro disco para ellas.',
  suggestedColors: ['Plata', 'Negro', 'Gris Plomo', 'Blanco', 'Brillos Metálicos'],
  forbiddenColors: ['Colores exclusivos de la Quinceañera'],
  cbu: '0000003100098765432100',
  cvu: '0000000000011223344556',
  alias: 'CLARA.MIS15',
  mpQrUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
  payPalUrl: 'https://paypal.me/clara15',
  theme: 'silver-disco',
  fontHeading: 'cormorant',
  fontBody: 'jakarta',
  enableHero: true,
  enableCountdown: true,
  enableTimeline: true,
  enableDressCode: true,
  enableGifts: true,
  enableGuestbook: true,
  enableTrivia: true,
  enableAI: true,
  backgroundMusicUrl: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_a1cd1f5795.mp3?filename=retro-wave-style-track-112345.mp3',
  customHashtag: '#Clara15Disco',
  rsvpDeadline: '2026-10-01',
  welcomeMessage: 'Un sueño de quince años que comenzó en familia y hoy quiero celebrar bailando contigo.',
  heroImageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80',
  adminEmails: ['antonella.brizuela18@gmail.com', 'matiaspa380@gmail.com'],
};

export const initialGuests: Guest[] = [
  {
    id: 'gst-1',
    name: 'Valentina',
    lastName: 'Rossi',
    email: 'valentina.rossi@example.com',
    phone: '+5491145678901',
    status: 'CONFIRMED',
    adultsCount: 2,
    kidsCount: 0,
    tableNumber: 1,
    dietaryRestrictions: ['Vegetariano'],
    notes: '¡No veo la hora de bailar en la pista!',
    qrCode: 'QR-CLARA15-GST1-VALENTINA',
    checkInTime: '20:15',
    uniqueInviteUrl: '/invitacion/valentina-rossi'
  },
  {
    id: 'gst-2',
    name: 'Mateo',
    lastName: 'Gómez',
    email: 'mateo.gomez@example.com',
    phone: '+5491156789012',
    status: 'CONFIRMED',
    adultsCount: 1,
    kidsCount: 0,
    tableNumber: 2,
    dietaryRestrictions: ['Sin TACC / Celíaco'],
    notes: 'Acompañante de la corte de honor.',
    qrCode: 'QR-CLARA15-GST2-MATEO',
    uniqueInviteUrl: '/invitacion/mateo-gomez'
  },
  {
    id: 'gst-3',
    name: 'Familia',
    lastName: 'Hoggan',
    email: 'familia.hoggan@example.com',
    phone: '+5491167890123',
    status: 'CONFIRMED',
    adultsCount: 4,
    kidsCount: 1,
    tableNumber: 1,
    dietaryRestrictions: [],
    notes: 'Mesa Principal de Familia.',
    qrCode: 'QR-CLARA15-GST3-HOGGAN',
    checkInTime: '19:50',
    uniqueInviteUrl: '/invitacion/familia-hoggan'
  },
  {
    id: 'gst-4',
    name: 'Camila',
    lastName: 'Fernández',
    email: 'camila.f@example.com',
    phone: '+5491178901234',
    status: 'PENDING',
    adultsCount: 2,
    kidsCount: 0,
    tableNumber: 3,
    dietaryRestrictions: ['Sin lactosa'],
    notes: 'Amiga del colegio secondary.',
    qrCode: 'QR-CLARA15-GST4-CAMILA',
    uniqueInviteUrl: '/invitacion/camila-fernandez'
  },
  {
    id: 'gst-5',
    name: 'Santiago',
    lastName: 'Pérez',
    email: 'santi.perez@example.com',
    phone: '+5491189012345',
    status: 'CONFIRMED',
    adultsCount: 2,
    kidsCount: 0,
    tableNumber: 2,
    dietaryRestrictions: [],
    notes: 'Preparado para el show de DJ!',
    qrCode: 'QR-CLARA15-GST5-SANTIAGO',
    uniqueInviteUrl: '/invitacion/santiago-perez'
  }
];

export const initialTimeline: TimelineItem[] = [
  {
    id: 'tl-1',
    year: '2011',
    title: 'El comienzo de una hermosa historia',
    category: 'Nacimiento',
    description: 'Nací un 17 de octubre bajo el sol de primavera. La primera nieta de la familia.',
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80'
  },
  {
    id: 'tl-2',
    year: '2015',
    title: 'Mis primeros pasos y sonrisas',
    category: 'Infancia',
    description: 'Descubriendo el jardín, las clases de danza clásica y el amor incondicional por los animales.',
    imageUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80'
  },
  {
    id: 'tl-3',
    year: '2017',
    title: 'Primer día de Colegio Primario',
    category: 'Colegio',
    description: 'Acompañada de mamá y papá con mi mochilita brillante, comenzando amistades para toda la vida.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80'
  },
  {
    id: 'tl-4',
    year: '2021',
    title: 'Viaje inolvidable a Bariloche y San Martin',
    category: 'Viajes',
    description: 'Conectando con la naturaleza, las montañas nevadas y los paseos a caballo en familia.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
  },
  {
    id: 'tl-5',
    year: '2024',
    title: 'Mis mejores amigas y la secundaria',
    category: 'Amigos',
    description: 'Años llenos de risas, festivales de música, pijamadas interminables y confidencias.',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'
  },
  {
    id: 'tl-6',
    year: '2026',
    title: 'Llegaron los 15 años',
    category: 'Hoy',
    description: 'Un año de preparativos, vestidos de gala, sueños que se cumplen y una noche que nunca olvidaremos.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'
  }
];

export const initialSchedule: ScheduleItem[] = [
  { time: '20:00', title: 'Recepción & Cocktails', description: 'Recepción al aire libre con sushi bar, fondues y barra de mocktails y tragos.', iconName: 'GlassWater', isUnlocked: true },
  { time: '21:30', title: 'Ingreso Triunfal & Saludo', description: 'Ingreso emocionante de Clara bajo cortina de luces disco y aplausos.', iconName: 'Sparkles', isUnlocked: false },
  { time: '22:00', title: 'Cena Gourmet', description: 'Menú especial diseñado por chefs ejecutivos.', iconName: 'Utensils', isUnlocked: false },
  { time: '23:30', title: 'El Tradicional Vals & Baile', description: 'Apertura de vals y coreografía especial junto a la familia y amigos.', iconName: 'Heart', isUnlocked: false },
  { time: '00:00', title: 'Apertura de Pista Disco Principal', description: 'Luces robóticas, DJ set en vivo y cotillón neón.', iconName: 'Music', isUnlocked: false },
  { time: '01:30', title: 'Video Emotivo & Sorpresa', description: 'Momentos especiales proyectados en pantalla gigante.', iconName: 'Film', isUnlocked: false },
  { time: '02:30', title: 'Torta de 15 & Brindis', description: 'Corte de torta, tirada de cintas y brindis con todos los invitados.', iconName: 'Cake', isUnlocked: false },
  { time: '04:00', title: 'Show Carioca & Neón LED', description: 'Banda en vivo, cotillón lumínico y explosión disco.', iconName: 'PartyPopper', isUnlocked: false },
  { time: '06:00', title: 'Desayuno de Despedida', description: 'Churros calentitos con dulce de leche y café express.', iconName: 'Coffee', isUnlocked: false }
];

export const initialSongs: SongRequest[] = [
  { id: 's1', title: 'Dance the Night', artist: 'Dua Lipa', submittedBy: 'Valentina R.', votes: 28, approved: true, spotifyUrl: 'https://open.spotify.com' },
  { id: 's2', title: 'Despechá', artist: 'Rosalía', submittedBy: 'Mateo G.', votes: 22, approved: true, spotifyUrl: 'https://open.spotify.com' },
  { id: 's3', title: 'Cruel Summer', artist: 'Taylor Swift', submittedBy: 'Camila F.', votes: 35, approved: true, spotifyUrl: 'https://open.spotify.com' },
  { id: 's4', title: 'Starboy', artist: 'The Weeknd', submittedBy: 'Santiago P.', votes: 19, approved: true },
  { id: 's5', title: 'Vagabundo', artist: 'Sebastián Yatra, Manuel Turizo', submittedBy: 'Lucía M.', votes: 15, approved: true }
];

export const initialGuestbook: GuestbookMessage[] = [
  {
    id: 'gb-1',
    guestName: 'Tía Mariana & Tío Carlos',
    message: '¡Clari hermosa! No podemos creer lo rápido que pasaron los años. Te deseamos una noche mágica como vos.',
    reactions: { love: 18, sparkle: 12, cheer: 9 },
    createdAt: '2026-07-15T14:20:00',
    approved: true
  },
  {
    id: 'gb-2',
    guestName: 'Valen & Cami',
    message: '¡La mejor noche de nuestras vidas! Te amamos infinito Clari, ¡a romper la pista hoy!',
    reactions: { love: 25, sparkle: 30, cheer: 14 },
    createdAt: '2026-07-20T18:45:00',
    approved: true
  }
];

export const initialTimeCapsule: TimeCapsuleMessage[] = [
  {
    id: 'tc-1',
    author: 'Papá y Mamá',
    message: 'Clari de nuestro corazón: guardamos este mensaje para cuando cumplas 21 años. Nunca olvides lo orgullosos que estamos de la mujer brillante en la que te has convertido.',
    unlockAge: 21,
    createdAt: '2026-07-01T10:00:00'
  }
];

export const initialPhotobooth: PhotoboothImage[] = [
  {
    id: 'pb-1',
    guestName: 'Clari & Amigas',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
    filter: 'Golden Hour',
    sticker: '✨ Mis 15 Clara',
    caption: '¡Comenzó la cuenta regresiva!',
    createdAt: '2026-07-28T21:00:00',
    likes: 42,
    approved: true
  },
  {
    id: 'pb-2',
    guestName: 'Valentina R.',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    filter: 'Glamour Black & White',
    sticker: '👑 Noche Soñada',
    caption: 'Listas para brillar',
    createdAt: '2026-07-29T19:30:00',
    likes: 31,
    approved: true
  }
];

export const initialGifts: GiftIdea[] = [
  { id: 'g1', title: 'Viaje Soñado de 15 a Europa', category: 'Experiencias', targetAmount: 500000, currentAmount: 380000, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80' },
  { id: 'g2', title: 'Cámara Fotográfica Instantánea & Lentes', category: 'Tecnología', targetAmount: 180000, currentAmount: 180000, imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80' },
  { id: 'g3', title: 'Equipamiento de Música & Auriculares Pro', category: 'Música', targetAmount: 120000, currentAmount: 85000, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
  { id: 'g4', title: 'Sesión Fotográfica Profesional & Álbum', category: 'Recuerdos', targetAmount: 150000, currentAmount: 110000, imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80' }
];

export const initialTrivia: TriviaQuestion[] = [
  { id: 1, question: '¿En qué año y mes nació Clara?', options: ['Octubre 2011', 'Noviembre 2011', 'Diciembre 2011', 'Enero 2012'], correctAnswer: 0, explanation: 'Clara nació en Octubre de 2011.' },
  { id: 2, question: '¿Cuál es el postre y dulce favorito incondicional de Clara?', options: ['Volcán de Chocolate', 'Mousse de Frutilla', 'Chocotorta con Dulce de Leche', 'Helado de Menta Chip'], correctAnswer: 2, explanation: '¡La Chocotorta es su devoción absoluta!' },
  { id: 3, question: '¿Qué disciplina artística o deporte practica Clara?', options: ['Danza y Coreografías', 'Gimnasia Olímpica', 'Violín y Piano', 'Patinaje Artístico'], correctAnswer: 0, explanation: 'Ama bailar y las coreografías de música disco.' },
  { id: 4, question: '¿Cuál es el destino soñado al que viajará Clara?', options: ['Nueva York', 'París y Roma', 'Tokio', 'Disney World & Miami'], correctAnswer: 1, explanation: 'Su gran sueño es recorrer las luces de Europa.' }
];

export const initialPolls: Poll[] = [
  {
    id: 'p1',
    question: '¿Qué ritmo querés que explote primero en la pista de baile?',
    options: [
      { id: 'o1', label: 'Cumbia & Reggaeton Old School', votes: 45 },
      { id: 'o2', label: 'Pop Internacional & TikTok Hits', votes: 38 },
      { id: 'o3', label: 'Electronic & Disco House Beats', votes: 20 }
    ]
  },
  {
    id: 'p2',
    question: '¿Qué trago o bebida sin alcohol de la barra es el favorito de la noche?',
    options: [
      { id: 'o1', label: 'Lemonade de Frutos Rojos con Menta', votes: 30 },
      { id: 'o2', label: 'Mocktail Maracuyá & Coco', votes: 42 },
      { id: 'o3', label: 'Smoothie de Frutilla & Durazno', votes: 15 }
    ]
  }
];

export const initialTables: TableInfo[] = [
  { number: 1, name: 'Mesa 1 - Familia Hoggan & Padrinos', capacity: 10, assignedGuests: ['Familia Hoggan', 'Tío Carlos', 'Tía Mariana'], position: { x: 20, y: 30 } },
  { number: 2, name: 'Mesa 2 - Corte de Honor & Amigos Cercanos', capacity: 12, assignedGuests: ['Mateo Gómez', 'Santiago Pérez', 'Ignacio Silva'], position: { x: 50, y: 30 } },
  { number: 3, name: 'Mesa 3 - Amigas del Colegio Secundario', capacity: 10, assignedGuests: ['Valentina Rossi', 'Camila Fernández', 'Lucía Martínez'], position: { x: 80, y: 30 } },
  { number: 4, name: 'Mesa 4 - Primos & Juventud', capacity: 10, assignedGuests: ['Joaquín H.', 'Florencia H.'], position: { x: 35, y: 70 } },
  { number: 5, name: 'Mesa 5 - Amigos de la Danza y Música', capacity: 10, assignedGuests: ['Martina B.', 'Paula K.'], position: { x: 65, y: 70 } }
];

export const initialFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'General',
    question: '¿A qué hora debemos llegar al salón?',
    answer: 'La recepción comienza puntualmente a las 20:00 hs. Les sugerimos llegar 15 minutos antes para el check-in.'
  },
  {
    id: 'faq-2',
    category: 'Ubicación',
    question: '¿El lugar cuenta con estacionamiento privado y seguridad?',
    answer: 'Sí, el salón cuenta con estacionamiento privado interno gratuito con seguridad.'
  },
  {
    id: 'faq-3',
    category: 'Dress Code',
    question: '¿Qué significa el Dress Code "Elegante / Disco Chic"?',
    answer: 'Para los caballeros se sugiere traje o vestimenta elegante. Para las damas, vestidos con toques brillantes, plata o tonos oscuros.'
  },
  {
    id: 'faq-4',
    category: 'Regalos',
    question: '¿Dónde puedo transferir o colaborar con el regalo de Clara?',
    answer: 'Pueden realizar su regalo mediante transferencia bancaria al CBU / Alias especificado en la sección "Regalos", o participar de la lista de experiencias.'
  },
  {
    id: 'faq-5',
    category: 'Niños',
    question: '¿Puedo concurrir con niños pequeños?',
    answer: 'Al ser un evento de gala y baile, contamos con registro de menú infantil y datos de adulto de contacto para emergencias.'
  }
];
