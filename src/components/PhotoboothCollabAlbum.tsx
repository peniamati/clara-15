import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Camera, Download, Heart, Sparkles, Filter, Smile, Share2, Upload } from 'lucide-react';

export const PhotoboothCollabAlbum: React.FC = () => {
  const { photoboothImages, addPhotoboothImage, likePhotoboothImage, config } = useEvent();

  const [guestName, setGuestName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Golden Hour');
  const [selectedSticker, setSelectedSticker] = useState(`✨ Mis 15 ${config.honoree}`);
  const [showUploader, setShowUploader] = useState(false);

  const filters = ['Normal', 'Golden Hour', 'Glamour B&W', 'Hollywood Glow', 'Neon Party'];
  const stickers = [`✨ Mis 15 ${config.honoree}`, '👑 Noche Mágica', '🥂 Brindis Disco', '🎉 Party Mode', `❤️ Te Queremos ${config.honoree.split(' ')[0]}`];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Por favor selecciona o sube una fotografía.');
      return;
    }

    addPhotoboothImage({
      guestName: guestName || 'Invitado Especial',
      imageUrl,
      filter: selectedFilter,
      sticker: selectedSticker,
      caption: caption || '¡Momentos inolvidables!'
    });

    setImageUrl('');
    setCaption('');
    setShowUploader(false);
    alert('¡Tu selfie ha sido agregada a la Cabina de Fotos & Mosaico en Vivo!');
  };

  return (
    <section id="photobooth" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Camera className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Photobooth Virtual & Mosaico</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Cabina de Fotos Virtual en Vivo
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Sacate una selfie, aplicá filtros de gala, pegale un sticker oficial y compartila en el mosaico gigante del evento.
          </p>

          <button
            onClick={() => setShowUploader(!showUploader)}
            className="mt-6 px-8 py-3.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-xl shadow-[#C0C0C0]/10 transition-all inline-flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>{showUploader ? 'Cerrar Cabina' : '✨ Sacarme / Subir una Foto'}</span>
          </button>
        </div>

        {/* Uploader / Photobooth Tool Drawer */}
        {showUploader && (
          <div className="max-w-2xl mx-auto bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mb-12 animate-fade-in">
            <h3 className="font-serif text-3xl font-semibold text-white mb-6 text-center">
              Personalizar tu Foto de Gala
            </h3>

            <form onSubmit={handlePublishPhoto} className="space-y-6">
              {/* File input / camera */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">Seleccionar o Sacar Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#C0C0C0] file:text-black hover:file:bg-[#E0E0E0] cursor-pointer"
                />
              </div>

              {/* Photo Preview Canvas */}
              {imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#C0C0C0]/40 bg-black aspect-square max-w-sm mx-auto shadow-2xl">
                  <img
                    src={imageUrl}
                    alt="Photobooth preview"
                    className={`w-full h-full object-cover ${
                      selectedFilter === 'Glamour B&W' ? 'grayscale contrast-125' : selectedFilter === 'Golden Hour' ? 'sepia-[0.3] contrast-110 saturate-150' : selectedFilter === 'Hollywood Glow' ? 'brightness-110 contrast-125' : selectedFilter === 'Neon Party' ? 'hue-rotate-90 saturate-200' : ''
                    }`}
                  />
                  {/* Sticker Overlay */}
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-[#C0C0C0]/50 text-[#C0C0C0] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {selectedSticker}
                  </div>
                  {/* Footer Frame */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-3 text-center border-t border-white/10">
                    <span className="font-serif text-xs font-bold text-[#C0C0C0]">{config.honoree} · Mis 15</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 text-xs">
                  <Upload className="w-8 h-8 mb-2 text-[#C0C0C0]" />
                  <span>Sube una foto desde tu dispositivo</span>
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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${
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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${
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
                  placeholder="Escribe un epígrafe..."
                  className="px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:border-[#C0C0C0] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10"
              >
                🚀 Publicar en Mosaico en Vivo
              </button>
            </form>
          </div>
        )}

        {/* Live Mosaic Grid Stream */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photoboothImages.map(img => (
            <div key={img.id} className="bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-[#C0C0C0]/30 transition-all">
              <div className="relative aspect-square overflow-hidden bg-black">
                <img
                  src={img.imageUrl}
                  alt={img.caption}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                    img.filter === 'Glamour B&W' ? 'grayscale contrast-125' : img.filter === 'Golden Hour' ? 'sepia-[0.3] contrast-110 saturate-150' : img.filter === 'Hollywood Glow' ? 'brightness-110 contrast-125' : img.filter === 'Neon Party' ? 'hue-rotate-90 saturate-200' : ''
                  }`}
                />
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-[#C0C0C0]/50 text-[#C0C0C0] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  {img.sticker}
                </div>
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

                  <a
                    href={img.imageUrl}
                    download="Clara_15_Photobooth.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-zinc-400 hover:text-[#C0C0C0] flex items-center gap-1 uppercase tracking-wider"
                  >
                    <Download className="w-3 h-3" /> Descargar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
