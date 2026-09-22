import { notify } from '../lib/notify';
import React, { useRef, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { 
  Camera, 
  Download, 
  Heart, 
  Sparkles, 
  Upload, 
  FolderUp, 
  ExternalLink, 
  Image as ImageIcon,
  CheckCircle2,
  Share2,
  Link as LinkIcon,
  HelpCircle,
  X,
  Flame,
  Info
} from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL, extractDriveFileId, getDriveDirectImageUrl } from '../lib/driveUtils';

const MAX_BASE64_SIZE = 700000; // ~680 KB, stays well within Firestore's 1MB document limit

// Converts file to optimized Base64 WebP/JPEG data URL for instant Firestore storage without fees
const compressPhotoToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  if (!file.type.startsWith('image/')) {
    reject(new Error('El archivo seleccionado debe ser una imagen (JPG, PNG, WebP, HEIC).'));
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    reject(new Error('La foto supera los 20 MB. Subíla directo a Google Drive en calidad original.'));
    return;
  }

  const source = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    try {
      let scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
      let result = '';
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No se pudo inicializar el procesador de imágenes.');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        result = canvas.toDataURL('image/webp', Math.max(0.40, 0.80 - attempt * 0.08));
        if (result.length <= MAX_BASE64_SIZE) break;
        scale *= 0.80;
      }
      if (!result || result.length > MAX_BASE64_SIZE) {
        throw new Error('La imagen es demasiado pesada para el visor rápido. Te sugerimos subirla a Google Drive.');
      }
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      URL.revokeObjectURL(source);
    }
  };
  image.onerror = () => {
    URL.revokeObjectURL(source);
    reject(new Error('No pudimos procesar esa foto. Verificá el formato.'));
  };
  image.src = source;
});

// Canvas compositor with photobooth frame, filter, and sticker
const composePhotoboothImage = (imageSrc: string, filter: string, sticker: string, honoree: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 1080;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSrc);

        // Apply visual filter
        ctx.save();
        if (filter === 'Glamour B&W') ctx.filter = 'grayscale(100%) contrast(130%)';
        else if (filter === 'Golden Hour') ctx.filter = 'sepia(35%) contrast(110%) saturate(150%)';
        else if (filter === 'Hollywood Glow') ctx.filter = 'brightness(112%) contrast(120%)';
        else if (filter === 'Neon Party') ctx.filter = 'hue-rotate(90deg) saturate(200%)';
        else if (filter === 'Disco Silver') ctx.filter = 'contrast(125%) saturate(85%) brightness(105%)';

        // Crop to square cover
        const aspect = img.naturalWidth / img.naturalHeight;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (aspect > 1) {
          sw = img.naturalHeight;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth;
          sy = (img.naturalHeight - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        ctx.restore();

        // Top sticker overlay badge
        if (sticker) {
          ctx.save();
          ctx.font = 'bold 30px sans-serif';
          const textWidth = ctx.measureText(sticker).width;
          const pillX = size - textWidth - 80;
          const pillY = 36;
          const pillW = textWidth + 48;
          const pillH = 54;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(pillX, pillY, pillW, pillH, 27);
          } else {
            ctx.rect(pillX, pillY, pillW, pillH);
          }
          ctx.fill();
          ctx.strokeStyle = 'rgba(192, 192, 192, 0.5)';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = '#C0C0C0';
          ctx.textBaseline = 'middle';
          ctx.fillText(sticker, pillX + 24, pillY + pillH / 2);
          ctx.restore();
        }

        // Bottom footer banner
        ctx.save();
        const footerH = 76;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
        ctx.fillRect(0, size - footerH, size, footerH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, size - footerH);
        ctx.lineTo(size, size - footerH);
        ctx.stroke();

        ctx.font = '600 28px serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`✨ ${honoree} · Momentos de la Noche ✨`, size / 2, size - footerH / 2);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.86));
      } catch {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

export const MomentosDeLaNoche: React.FC = () => {
  const { photoboothImages, addPhotoboothImage, likePhotoboothImage, config } = useEvent();

  // Photobooth interactive states
  const [photoSource, setPhotoSource] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Golden Hour');
  const [selectedSticker, setSelectedSticker] = useState(`✨ Mis 15 ${config.honoree}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showDriveUrlModal, setShowDriveUrlModal] = useState(false);
  const [driveUrlInput, setDriveUrlInput] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const filterOptions = ['Normal', 'Golden Hour', 'Glamour B&W', 'Hollywood Glow', 'Neon Party', 'Disco Silver'];
  const stickerOptions = [
    `✨ Mis 15 ${config.honoree}`,
    '👑 Noche Mágica',
    '🥂 Brindis Disco',
    '🎉 Party Mode',
    `❤️ Te Queremos ${config.honoree.split(' ')[0]}`
  ];

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const base64Data = await compressPhotoToBase64(file);
      setPhotoSource(base64Data);
      notify('¡Foto lista! Elegí tu filtro y sticker favoritos.');
    } catch (err) {
      setPhotoSource('');
      notify(err instanceof Error ? err.message : 'Error al procesar la imagen.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleDownloadBrandedPhoto = async () => {
    if (!photoSource) return;
    setIsPublishing(true);
    try {
      const finalImage = await composePhotoboothImage(photoSource, selectedFilter, selectedSticker, config.honoree);
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `Momento_${config.honoree.replace(/\s+/g, '')}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notify('¡Foto descargada en tu dispositivo!');
    } catch {
      notify('No se pudo descargar la imagen.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishToLiveWall = async () => {
    if (!photoSource) return;
    setIsPublishing(true);
    try {
      // If it's a base64 image, we brand it; if it's already an external Drive URL, we use it directly
      const finalImageUrl = photoSource.startsWith('data:')
        ? await composePhotoboothImage(photoSource, selectedFilter, selectedSticker, config.honoree)
        : photoSource;

      await addPhotoboothImage({
        guestName: guestName.trim() || 'Invitado de la Fiesta',
        imageUrl: finalImageUrl,
        filter: selectedFilter,
        sticker: selectedSticker,
        caption: caption.trim()
      });

      notify('¡Foto publicada con éxito en el Muro en vivo!');
      setPhotoSource('');
      setCaption('');
      setGuestName('');
    } catch {
      notify('Hubo un error al publicar la foto en el muro.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddFromDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrlInput.trim()) return;

    const fileId = extractDriveFileId(driveUrlInput.trim());
    if (!fileId) {
      notify('No pudimos detectar el ID de la foto de Google Drive. Asegurate de que el enlace sea de tipo "Cualquiera con el enlace puede ver".');
      return;
    }

    const highResUrl = getDriveDirectImageUrl(fileId, 1600);
    setPhotoSource(highResUrl);
    setShowDriveUrlModal(false);
    setDriveUrlInput('');
    notify('¡Foto de Google Drive vinculada con éxito!');
  };

  return (
    <section id="momentos" className="py-24 bg-[#050505] text-white relative border-t border-white/10">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C0C0C0]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Camera className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Photobooth & Muro en Vivo</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-4">
            Momentos de la Noche
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Sacá fotos en vivo con el photobooth de la fiesta, sumale filtros y stickers de los 15 de {config.honoree}, o subilas en calidad original a Google Drive para compartirlas en el muro.
          </p>
        </div>

        {/* Photobooth Studio Card */}
        <div className="mb-16 bg-[#0F0F0F] border border-[#C0C0C0]/25 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Left Description */}
            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-xs font-semibold uppercase tracking-wider text-[#C0C0C0] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Fotocabina Interactiva
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
                ¡Capturá tu momento de la fiesta!
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed mb-6">
                Podés sacarte una selfie ahora mismo, elegir una foto de tu galería o sincronizar tu álbum con Google Drive. Las fotos se optimizan y guardan automáticamente en la base de datos en tiempo real.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-6 py-3.5 rounded-full bg-[#C0C0C0] hover:bg-white text-black font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#C0C0C0]/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isProcessing ? 'Procesando...' : 'Tomar Foto'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-white font-semibold text-xs uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Elegir de Galería</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDriveUrlModal(true)}
                  className="px-5 py-3.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                  title="Vincular foto desde Google Drive"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Vincular de Drive</span>
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                accept="image/*"
                capture="user"
                ref={cameraInputRef}
                onChange={handleFileSelection}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                ref={galleryInputRef}
                onChange={handleFileSelection}
                className="hidden"
              />
            </div>

            {/* Right Card: Google Drive Direct Folder */}
            <div className="w-full lg:w-96 rounded-2xl bg-zinc-900/70 border border-white/10 p-6 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <FolderUp className="w-4 h-4" />
                  <span>Google Drive Oficial</span>
                </div>
                <h4 className="font-semibold text-white text-base mb-1">
                  Carpeta de Fotos en Calidad 100% Original
                </h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4">
                  Subí tus fotos y videos en alta resolución (sin ninguna pérdida de calidad) a la carpeta compartida de Google Drive de los 15 de {config.honoree}.
                </p>
              </div>

              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FolderUp className="w-4 h-4" />
                <span>Abrir Carpeta en Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Live Photobooth Editor (When a photo is taken or selected) */}
          {photoSource && (
            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-300">
              
              {/* Photo Preview with Filters and Stickers */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-white/20 relative shadow-2xl bg-black">
                  <img
                    src={photoSource}
                    alt="Preview Photobooth"
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      selectedFilter === 'Glamour B&W'
                        ? 'grayscale contrast-125'
                        : selectedFilter === 'Golden Hour'
                        ? 'sepia-[.35] contrast-110 saturate-150'
                        : selectedFilter === 'Hollywood Glow'
                        ? 'brightness-110 contrast-125'
                        : selectedFilter === 'Neon Party'
                        ? 'hue-rotate-90 saturate-200'
                        : selectedFilter === 'Disco Silver'
                        ? 'contrast-125 saturate-85 brightness-105'
                        : ''
                    }`}
                  />
                  {/* Active Sticker */}
                  {selectedSticker && (
                    <div className="absolute top-4 right-4 bg-black/85 border border-[#C0C0C0]/50 text-[#C0C0C0] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
                      {selectedSticker}
                    </div>
                  )}
                  {/* Bottom Watermark */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/85 border-t border-white/10 py-2.5 text-center text-xs font-serif text-white tracking-wider pointer-events-none">
                    ✨ {config.honoree} · Momentos de la Noche ✨
                  </div>
                </div>
              </div>

              {/* Controls and Customization */}
              <div className="md:col-span-6 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Filtro Photobooth
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelectedFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedFilter === f
                            ? 'bg-[#C0C0C0] text-black font-bold'
                            : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Sticker de la Noche
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {stickerOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSticker(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedSticker === s
                            ? 'bg-[#C0C0C0] text-black font-bold'
                            : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej: Amigos del colegio / Camila"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#C0C0C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Pie de Foto (Opcional)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Ej: ¡Explotó la pista de baile!"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#C0C0C0] outline-none"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePublishToLiveWall}
                    disabled={isPublishing}
                    className="flex-1 py-3 rounded-full bg-[#C0C0C0] hover:bg-white text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isPublishing ? 'Publicando...' : 'Publicar en el Muro'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBrandedPhoto}
                    disabled={isPublishing}
                    className="px-4 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors active:scale-95 disabled:opacity-50"
                    title="Descargar foto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoSource('')}
                    className="px-4 py-3 text-xs text-zinc-400 hover:text-white underline"
                  >
                    Descartar
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Live Photo Wall (Muro de Fotos en Tiempo Real) */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-serif text-3xl font-semibold text-white flex items-center gap-2.5">
                <ImageIcon className="w-6 h-6 text-[#C0C0C0]" />
                <span>Muro de Fotos de la Noche</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Todas las fotos que los invitados van compartiendo durante la fiesta en tiempo real.
              </p>
            </div>

            <span className="px-4 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-[#C0C0C0] font-semibold">
              {photoboothImages.length} fotos en el muro
            </span>
          </div>

          {photoboothImages.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-[#0F0F0F] border border-white/10">
              <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-white font-serif text-xl font-medium mb-1">
                El Muro está listo para estrenarse
              </h4>
              <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-md mx-auto">
                ¡Sé el primero en sacarte una foto o subir una desde tu celular para empezar a llenar los momentos de la noche!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photoboothImages.map((img) => (
                <div
                  key={img.id}
                  className="rounded-2xl overflow-hidden bg-[#0F0F0F] border border-white/10 hover:border-[#C0C0C0]/40 transition-all shadow-xl group flex flex-col justify-between"
                >
                  <div className="aspect-square w-full relative overflow-hidden bg-black">
                    <img
                      src={img.imageUrl}
                      alt={img.caption || `Momento por ${img.guestName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {img.sticker && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 border border-white/20 text-[10px] text-white font-medium">
                        {img.sticker}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between gap-3 bg-[#0F0F0F]">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {img.guestName}
                      </p>
                      {img.caption && (
                        <p className="text-[11px] text-zinc-400 font-light truncate mt-0.5">
                          {img.caption}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => likePhotoboothImage(img.id)}
                      className="shrink-0 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-[#C0C0C0]/50 text-xs text-rose-400 flex items-center gap-1.5 transition-all active:scale-95"
                      title="Dar me gusta"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-400" />
                      <span className="text-zinc-200 font-bold">{img.likes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal to link image from Google Drive */}
      {showDriveUrlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-[#0F0F0F] border border-[#C0C0C0]/40 p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setShowDriveUrlModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400">
              <LinkIcon className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-2xl font-semibold text-center text-white mb-2">
              Vincular Foto de Google Drive
            </h3>
            <p className="text-xs text-zinc-400 text-center mb-6">
              Pegá el enlace para compartir de una foto en Google Drive (asegurate de que esté configurado como &ldquo;Cualquiera con el enlace&rdquo;).
            </p>

            <form onSubmit={handleAddFromDrive} className="space-y-4">
              <input
                type="url"
                required
                value={driveUrlInput}
                onChange={(e) => setDriveUrlInput(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#C0C0C0] outline-none"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#C0C0C0] hover:bg-white text-black font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cargar Foto en Alta Calidad
              </button>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
