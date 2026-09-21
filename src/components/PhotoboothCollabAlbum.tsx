import { notify } from '../lib/notify';
import React, { useRef, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Camera, Download, Heart, Sparkles, Filter, Smile, Share2, Upload, FolderUp, ExternalLink, Image as ImageIcon } from 'lucide-react';

const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1vD5IpM96K5bMCfJbVpTmEMS9WwE1Y4sH';
const MAX_PHOTO_DATA_LENGTH = 700000;

const compressPhoto = (file: File): Promise<string> => new Promise((resolve, reject) => {
  if (!file.type.startsWith('image/')) {
    reject(new Error('El archivo seleccionado no es una imagen.'));
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    reject(new Error('La foto original supera 12 MB. Elegí una imagen más liviana.'));
    return;
  }

  const source = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    try {
      let scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
      let result = '';
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Este navegador no pudo preparar la foto.');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        result = canvas.toDataURL('image/webp', Math.max(0.42, 0.78 - attempt * 0.07));
        if (result.length <= MAX_PHOTO_DATA_LENGTH) break;
        scale *= 0.82;
      }
      if (!result || result.length > MAX_PHOTO_DATA_LENGTH) throw new Error('No se pudo comprimir la foto. Probá con otra imagen.');
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      URL.revokeObjectURL(source);
    }
  };
  image.onerror = () => {
    URL.revokeObjectURL(source);
    reject(new Error('No pudimos leer esa imagen. Probá con JPG, PNG o WebP.'));
  };
  image.src = source;
});

// Helper to compose image with canvas filters, sticker, and bottom frame
const composeBrandedPhoto = (imageSrc: string, filter: string, sticker: string, honoree: string): Promise<string> => {
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

        // Filter rendering
        ctx.save();
        if (filter === 'Glamour B&W') ctx.filter = 'grayscale(100%) contrast(125%)';
        else if (filter === 'Golden Hour') ctx.filter = 'sepia(35%) contrast(110%) saturate(150%)';
        else if (filter === 'Hollywood Glow') ctx.filter = 'brightness(110%) contrast(125%)';
        else if (filter === 'Neon Party') ctx.filter = 'hue-rotate(90deg) saturate(200%)';

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

        // Top sticker pill
        ctx.save();
        ctx.font = 'bold 32px sans-serif';
        const textWidth = ctx.measureText(sticker).width;
        const pillX = size - textWidth - 80;
        const pillY = 40;
        const pillW = textWidth + 48;
        const pillH = 56;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(pillX, pillY, pillW, pillH, 28);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(192, 192, 192, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#C0C0C0';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker, pillX + 24, pillY + pillH / 2);
        ctx.restore();

        // Bottom footer watermark
        ctx.save();
        const frameH = 80;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, size - frameH, size, frameH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, size - frameH);
        ctx.lineTo(size, size - frameH);
        ctx.stroke();

        ctx.font = '600 30px serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${honoree} · Mis 15`, size / 2, size - frameH / 2);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

export const PhotoboothCollabAlbum: React.FC = () => {
  const { photoboothImages, addPhotoboothImage, likePhotoboothImage, config } = useEvent();

  const [guestName, setGuestName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Golden Hour');
  const [selectedSticker, setSelectedSticker] = useState(`✨ Mis 15 ${config.honoree}`);
  const [showUploader, setShowUploader] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const filters = ['Normal', 'Golden Hour', 'Glamour B&W', 'Hollywood Glow', 'Neon Party'];
  const stickers = [
    `✨ Mis 15 ${config.honoree}`,
    '👑 Noche Mágica',
    '🥂 Brindis Disco',
    '🎉 Party Mode',
    `❤️ Te Queremos ${config.honoree.split(' ')[0]}`
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsPreparingPhoto(true);
    try {
      setImageUrl(await compressPhoto(file));
      setShowUploader(true);
    } catch (error) {
      setImageUrl('');
      notify(error instanceof Error ? error.message : 'No pudimos preparar la foto.');
    } finally {
      setIsPreparingPhoto(false);
      e.target.value = '';
    }
  };

  // Download composed image
  const handleDownloadComposed = async () => {
    if (!imageUrl) return;
    setIsComposing(true);
    try {
      const finalImage = await composeBrandedPhoto(imageUrl, selectedFilter, selectedSticker, config.honoree);
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `Recuerdo_Clara15_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notify('¡Foto con filtros descargada con éxito!');
    } catch (err) {
      notify('Error al preparar la descarga.');
    } finally {
      setIsComposing(false);
    }
  };

  // Upload/Save to Google Drive flow
  const handleUploadToDrive = async () => {
    if (!imageUrl) return;
    setIsComposing(true);
    try {
      const finalImage = await composeBrandedPhoto(imageUrl, selectedFilter, selectedSticker, config.honoree);

      // Try native share with file if available (mobile Android / iOS allows picking Google Drive)
      if (navigator.canShare && typeof fetch === 'function') {
        try {
          const res = await fetch(finalImage);
          const blob = await res.blob();
          const file = new File([blob], `Recuerdo_Clara15_${Date.now()}.jpg`, { type: 'image/jpeg' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Recuerdos Mis 15 ${config.honoree}`,
              text: '¡Subiendo foto de recuerdo a Google Drive!'
            });
            window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
            return;
          }
        } catch {
          // Fallback to direct download + opening drive
        }
      }

      // Automatic download so the user has the file ready to drag/upload to Google Drive
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `Recuerdo_Clara15_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Open Google Drive folder in a new window/tab
      window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
      notify('¡Foto descargada! Se abrió la carpeta de Google Drive para que la subas.');
    } finally {
      setIsComposing(false);
    }
  };

  // Publish to the live web mosaic
  const handlePublishPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      notify('Por favor seleccioná o sacá una foto.');
      return;
    }

    setIsComposing(true);
    try {
      const composed = await composeBrandedPhoto(imageUrl, selectedFilter, selectedSticker, config.honoree);
      if (!await addPhotoboothImage({
        guestName: guestName || 'Invitado Especial',
        imageUrl: composed,
        filter: selectedFilter,
        sticker: selectedSticker,
        caption: caption || '¡Momentos inolvidables!'
      })) return;

      setImageUrl('');
      setCaption('');
      setShowUploader(false);
      notify('¡Tu foto se publicó en el mural de recuerdos en tiempo real!');
    } catch {
      notify('Ocurrió un error al publicar la foto.');
    } finally {
      setIsComposing(false);
    }
  };

  return (
    <section id="recuerdos" className="py-24 bg-[#050505] text-white relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Camera className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Recuerdos de la Fiesta & Cámara en Vivo</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Álbum de Recuerdos
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Sacate fotos en vivo desde tu celular o elegí de tu galería, aplicá filtros y stickers de la fiesta, y subilas directamente a nuestra carpeta compartida de Google Drive.
          </p>
        </div>

        {/* Google Drive Shared Folder Feature Banner */}
        <div className="mb-12 bg-gradient-to-r from-zinc-900 via-[#0F0F0F] to-zinc-900 border border-[#C0C0C0]/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#C0C0C0]/20 to-white/10 border border-[#C0C0C0]/40 flex items-center justify-center text-[#C0C0C0] shrink-0 shadow-lg">
              <FolderUp className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C0C0C0] block mb-1">
                Carpeta Compartida Oficial
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white">
                Google Drive de Recuerdos
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-light mt-0.5">
                Subí todas las fotos y videos que saques durante la fiesta para que Clara las conserve para siempre.
              </p>
            </div>
          </div>

          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-xl shadow-[#C0C0C0]/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <FolderUp className="w-4 h-4" />
            <span>Abrir Carpeta en Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile-First Trigger Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {/* Hidden Inputs for Camera and Gallery */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isPreparingPhoto}
            className="px-7 py-4 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#C0C0C0]/20 transition-all flex items-center gap-2.5 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>📸 Sacar Foto con Cámara</span>
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isPreparingPhoto}
            className="px-7 py-4 rounded-full bg-zinc-900 border border-white/20 hover:border-[#C0C0C0]/50 text-white font-semibold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2.5 active:scale-95"
          >
            <ImageIcon className="w-4 h-4 text-[#C0C0C0]" />
            <span>🖼️ Elegir de la Galería</span>
          </button>

          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-4 rounded-full bg-zinc-950 border border-white/10 hover:border-[#C0C0C0]/40 text-zinc-300 hover:text-white font-semibold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <FolderUp className="w-4 h-4 text-[#C0C0C0]" />
            <span>Subir Directo a Drive</span>
          </a>
        </div>

        {/* Uploader / Photobooth Customizer Drawer */}
        {showUploader && (
          <div className="max-w-2xl mx-auto bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mb-14 animate-fade-in">
            <h3 className="font-serif text-3xl font-semibold text-white mb-2 text-center">
              Personalizar Recuerdo
            </h3>
            <p className="text-xs text-zinc-400 text-center mb-6">
              Elegí un filtro y un sticker temático. Luego podés subirla directo a Google Drive o al mural en vivo.
            </p>

            <form onSubmit={handlePublishPhoto} className="space-y-6">
              {/* Photo Preview Canvas */}
              {imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#C0C0C0]/40 bg-black aspect-square max-w-sm mx-auto shadow-2xl">
                  <img
                    src={imageUrl}
                    alt="Preview de recuerdo"
                    className={`w-full h-full object-cover ${
                      selectedFilter === 'Glamour B&W' ? 'grayscale contrast-125' : selectedFilter === 'Golden Hour' ? 'sepia-[0.35] contrast-110 saturate-150' : selectedFilter === 'Hollywood Glow' ? 'brightness-110 contrast-125' : selectedFilter === 'Neon Party' ? 'hue-rotate-90 saturate-200' : ''
                    }`}
                  />
                  {/* Sticker Overlay */}
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-[#C0C0C0]/50 text-[#C0C0C0] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {selectedSticker}
                  </div>
                  {/* Footer Frame */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-3 text-center border-t border-white/10">
                    <span className="font-serif text-xs font-bold text-white">{config.honoree} · Mis 15</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 text-xs">
                  <Upload className="w-8 h-8 mb-2 text-[#C0C0C0]" />
                  <span>{isPreparingPhoto ? 'Preparando la foto…' : 'Seleccioná una foto para comenzar'}</span>
                </div>
              )}

              {/* Filters selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#C0C0C0]" /> Filtro de Foto
                </label>
                <div className="flex flex-wrap gap-2">
                  {filters.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFilter(f)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border uppercase tracking-wider transition-all ${
                        selectedFilter === f ? 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-[#C0C0C0]' : 'bg-zinc-900 border-white/10 text-zinc-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stickers selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-[#C0C0C0]" /> Sticker Oficial
                </label>
                <div className="flex flex-wrap gap-2">
                  {stickers.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSticker(s)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border uppercase tracking-wider transition-all ${
                        selectedSticker === s ? 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-[#C0C0C0]' : 'bg-zinc-900 border-white/10 text-zinc-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Tu Nombre"
                  className="px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escribí un epígrafe..."
                  className="px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              {/* Drive Action & Download Grid */}
              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleUploadToDrive}
                  disabled={isComposing || !imageUrl}
                  className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#C0C0C0] to-white hover:from-white hover:to-[#E0E0E0] text-black font-bold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <FolderUp className="w-4 h-4" />
                  <span>Subir a Google Drive</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadComposed}
                  disabled={isComposing || !imageUrl}
                  className="py-3.5 px-6 rounded-full bg-zinc-900 border border-white/20 hover:border-[#C0C0C0]/50 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              </div>

              {/* Publish to live mosaic */}
              <button
                type="submit"
                disabled={isComposing || isPreparingPhoto || !imageUrl}
                className="w-full py-3.5 rounded-full bg-zinc-900 border border-white/10 hover:border-[#C0C0C0]/40 text-zinc-300 hover:text-white font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#C0C0C0]" />
                <span>{isComposing ? 'Procesando…' : 'Publicar también en el Mural Web en Vivo'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Live Mosaic Grid Stream */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-semibold text-white">
            Mural de Recuerdos en Vivo
          </h3>
          <span className="text-xs text-zinc-400">
            {photoboothImages.length} momentos compartidos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photoboothImages.map(img => (
            <div key={img.id} className="bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-[#C0C0C0]/30 transition-all">
              <div className="relative aspect-square overflow-hidden bg-black">
                <img
                  src={img.imageUrl}
                  alt={img.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {img.sticker && (
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-[#C0C0C0]/50 text-[#C0C0C0] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {img.sticker}
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] text-[#C0C0C0] font-semibold uppercase tracking-wider block mb-1">Por {img.guestName}</span>
                  <p className="text-zinc-300 text-xs italic font-light">"{img.caption}"</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => likePhotoboothImage(img.id)}
                    className="text-xs text-rose-400 font-bold flex items-center gap-1.5 hover:scale-110 transition-transform"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" /> {img.likes}
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={GOOGLE_DRIVE_FOLDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver en Google Drive"
                      className="text-[10px] text-zinc-400 hover:text-[#C0C0C0] flex items-center gap-1 uppercase tracking-wider"
                    >
                      <FolderUp className="w-3 h-3" /> Drive
                    </a>
                    <a
                      href={img.imageUrl}
                      download="Clara_15_Recuerdo.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-zinc-400 hover:text-[#C0C0C0] flex items-center gap-1 uppercase tracking-wider"
                    >
                      <Download className="w-3 h-3" /> Guardar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {photoboothImages.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-white/15 bg-[#0F0F0F] px-6 py-14 text-center text-sm text-zinc-400">
              Todavía no se publicaron recuerdos. ¡Sé el primero en sacarte una foto o subirla a Google Drive!
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
