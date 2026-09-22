import { notify } from '../lib/notify';
import React, { useState, useEffect, useRef } from 'react';
import { useEvent } from '../context/EventContext';
import { 
  Camera, 
  ZoomIn, 
  Download, 
  Share2, 
  X, 
  Upload, 
  FolderPlus, 
  HardDrive, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { getDriveDirectImageUrl } from '../lib/driveUtils';

interface CustomPhotoItem {
  id: number;
  category: string;
  title: string;
  url: string;
  size: string;
  isCustom?: boolean;
}

export const GalleryMasonry: React.FC = () => {
  const { config } = useEvent();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'folder' | 'drive'>('upload');

  // Local storage for uploaded optimized photos
  const [localPhotos, setLocalPhotos] = useState<CustomPhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem('clara_custom_gallery');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drive link state for manual addition
  const [driveLinkInput, setDriveLinkInput] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('clara_custom_gallery', JSON.stringify(localPhotos));
    } catch {
      // ignore quota exceeded if any
    }
  }, [localPhotos]);

  // Combine config gallery with any locally loaded photos
  const defaultGallery = config.gallery || [];
  const displayPhotos: CustomPhotoItem[] = localPhotos.length > 0 ? localPhotos : defaultGallery;

  const handleShare = (url: string) => {
    if (navigator.share) {
      navigator.share({ title: `Galería ${config.honoree}`, url });
    } else {
      navigator.clipboard.writeText(url);
      notify('¡Enlace de imagen copiado al portapapeles!');
    }
  };

  // Compress image client-side to crisp WebP (<500 KB)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1920;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          // WebP at 0.82 reduces 9.8MB down to ~350-500KB
          const dataUrl = canvas.toDataURL('image/webp', 0.82);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsOptimizing(true);
    const newItems: CustomPhotoItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Optimizando imagen ${i + 1} de ${files.length} (${file.name})...`);
        
        const optimizedBase64 = await compressImage(file);
        
        // Clean up title from filename e.g. "047 - CLARA SESION.jpg" -> "Clara · Sesión 047"
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/CLARA SESION/i, 'Sesión')
          .replace(/[-_]/g, ' ')
          .trim();

        newItems.push({
          id: Date.now() + i,
          category: 'Book de 15',
          title: cleanName || `Foto ${i + 1}`,
          url: optimizedBase64,
          size: 'normal',
          isCustom: true
        });
      }

      setLocalPhotos((prev) => [...prev, ...newItems]);
      notify(`¡${newItems.length} foto(s) optimizada(s) y agregada(s) al Book con éxito!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      notify('Ocurrió un error al procesar las imágenes.');
    } finally {
      setIsOptimizing(false);
      setUploadProgress('');
    }
  };

  const handleAddDriveLink = () => {
    if (!driveLinkInput.trim()) {
      notify('Pegá el link de la foto en Google Drive.');
      return;
    }
    const directUrl = getDriveDirectImageUrl(driveLinkInput.trim());
    const newItem: CustomPhotoItem = {
      id: Date.now(),
      category: 'Book de 15 (Drive)',
      title: `Foto Drive ${localPhotos.length + 1}`,
      url: directUrl,
      size: 'normal',
      isCustom: true
    };
    setLocalPhotos(prev => [...prev, newItem]);
    setDriveLinkInput('');
    notify('Foto de Google Drive vinculada al Book.');
  };

  const handleResetToDefault = () => {
    setLocalPhotos([]);
    localStorage.removeItem('clara_custom_gallery');
    setFailedImages({});
    notify('Se restauró la lista por defecto del Book.');
  };

  const handleRemovePhoto = (id: number) => {
    setLocalPhotos(prev => prev.filter(p => p.id !== id));
    notify('Foto eliminada de la vista.');
  };

  return (
    <section id="galeria" className="py-24 bg-[#050505] text-white border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Camera className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Álbum de Producción</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-4">
            Galería Fotográfica
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Recorré las fotos oficiales del book de 15 de Clara. Hacé clic para verlas en alta definición.
          </p>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex rounded-full border border-white/10 bg-zinc-900/80 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#C0C0C0]">
              Book de 15 · {displayPhotos.length} Fotos
            </span>
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-[#C0C0C0]/30 text-white text-xs font-semibold uppercase tracking-wider transition-all hover:border-[#C0C0C0]"
            >
              <Upload className="w-3.5 h-3.5 text-[#C0C0C0]" />
              <span>Subir / Cargar Fotos</span>
            </button>
            {localPhotos.length > 0 && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors"
                title="Volver a las fotos predeterminadas"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            )}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPhotos.map(img => (
            <div
              key={img.id}
              onClick={() => {
                if (!failedImages[img.id]) setSelectedPhoto(img.url);
              }}
              className="relative group overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F0F] cursor-pointer shadow-2xl hover:border-[#C0C0C0]/40 transition-all duration-300"
            >
              {!failedImages[img.id] ? (
                <img
                  src={img.url}
                  alt={img.title}
                  onError={() => setFailedImages(prev => ({ ...prev, [img.id]: true }))}
                  className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-b from-zinc-900 to-black flex flex-col items-center justify-center p-6 text-center border border-white/5">
                  <div className="w-14 h-14 rounded-full bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 flex items-center justify-center text-[#C0C0C0] mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-[#C0C0C0]" />
                  </div>
                  <span className="text-zinc-200 font-serif text-base font-semibold">{img.title}</span>
                  <span className="text-[11px] text-[#C0C0C0]/80 mt-1 font-mono bg-zinc-950/80 px-3 py-1 rounded-full border border-white/10 max-w-[90%] truncate">
                    public{img.url}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsManageModalOpen(true);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3 h-3 text-[#C0C0C0]" />
                    <span>Cargar este archivo</span>
                  </button>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end pointer-events-none">
                <span className="text-[#C0C0C0] text-xs font-semibold uppercase tracking-widest">{img.category}</span>
                <h3 className="font-serif text-2xl font-semibold text-white mt-1">{img.title}</h3>
                {!failedImages[img.id] && (
                  <div className="flex items-center gap-3 mt-3 text-[#C0C0C0] text-xs uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5"/> Ampliar</span>
                  </div>
                )}
              </div>

              {/* Remove button for custom photos */}
              {img.isCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(img.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-rose-900/80 text-zinc-300 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  title="Eliminar de la vista"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {displayPhotos.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-white/15 bg-[#0F0F0F] px-6 py-14 text-center text-sm text-zinc-400">
              Las fotos del book se publicarán acá cuando estén listas.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Subir / Gestionar Fotos */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl p-4 flex items-center justify-center" onClick={() => setIsManageModalOpen(false)}>
          <div className="relative max-w-2xl w-full bg-[#0F0F0F] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-left" onClick={(e) => e.stopPropagation()}>
            
            <button
              onClick={() => setIsManageModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 flex items-center justify-center text-[#C0C0C0]">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                  Fotos del Book de 15
                </h3>
                <p className="text-xs text-zinc-400 font-light mt-0.5">
                  Elegí cómo querés cargar o vincular las fotos de la sesión de Clara.
                </p>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/10 mb-6 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`pb-3 px-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'border-[#C0C0C0] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir desde mi PC</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('folder')}
                className={`pb-3 px-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'folder'
                    ? 'border-[#C0C0C0] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Carpeta /public/gallery/</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('drive')}
                className={`pb-3 px-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'drive'
                    ? 'border-[#C0C0C0] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Google Drive</span>
              </button>
            </div>

            {/* TAB 1: Subir archivos desde PC */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-xs text-zinc-300 leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 text-[#C0C0C0] font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Compresión Inteligente Automática</span>
                  </div>
                  <p>
                    Tus fotos originales pesan entre <strong>6 MB y 9.8 MB</strong> cada una. Al seleccionarlas aquí, el optimizador las redimensiona automáticamente a <strong>Full HD WebP (~350 KB)</strong> manteniendo máxima nitidez.
                  </p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#C0C0C0]/30 hover:border-[#C0C0C0] rounded-2xl p-8 text-center cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/50 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-full bg-[#C0C0C0]/10 mx-auto flex items-center justify-center text-[#C0C0C0] mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-medium text-sm mb-1">
                    Hacé clic para seleccionar tus fotos de la sesión
                  </h4>
                  <p className="text-zinc-500 text-xs">
                    Podés seleccionar múltiples archivos a la vez (ej. 144, 141, 139, 065, etc.)
                  </p>
                </div>

                {isOptimizing && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-3 text-xs text-[#C0C0C0]">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C0C0C0]" />
                    <span>{uploadProgress}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Carpeta Local /public/gallery/ */}
            {activeTab === 'folder' && (
              <div className="space-y-4 text-xs text-zinc-300">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-[#C0C0C0]" />
                    <span>¿Cómo subirlas directo al proyecto?</span>
                  </h4>
                  <p className="leading-relaxed">
                    Si tenés los archivos en tu computadora, la opción más veloz y profesional es colocarlos en la carpeta <code className="bg-zinc-950 px-2 py-0.5 rounded text-[#C0C0C0] font-mono">public/gallery/</code>:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
                    <li>Arrastrá los archivos al explorador de archivos en <strong className="text-white">public/gallery/</strong>.</li>
                    <li>
                      La galería ya está configurada para reconocer exactamente tus nombres:
                      <div className="mt-1.5 grid grid-cols-2 gap-1 font-mono text-[11px] text-[#C0C0C0]">
                        <span>• 047 - CLARA SESION.jpg</span>
                        <span>• 048 - CLARA SESION.jpg</span>
                        <span>• 061 - CLARA SESION.jpg</span>
                        <span>• 065 - CLARA SESION.jpg</span>
                        <span>• 139 - CLARA SESION.jpg</span>
                        <span>• 141 - CLARA SESION.jpg</span>
                        <span>• 144 - CLARA SESION.jpg</span>
                      </div>
                    </li>
                    <li>No consume base de datos y se carga a máxima velocidad.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: Google Drive */}
            {activeTab === 'drive' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-xs text-zinc-300 leading-relaxed">
                  <p>
                    Podés subir las fotos a tu carpeta compartida de Google Drive y pegar el link para verlas en alta definición sin ocupar espacio en la base de datos.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Enlace de imagen de Google Drive
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={driveLinkInput}
                      onChange={(e) => setDriveLinkInput(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-[#C0C0C0] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddDriveLink}
                      className="px-5 py-3 rounded-xl bg-[#C0C0C0] hover:bg-white text-black font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Vincular
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold uppercase tracking-wider"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl p-4 flex items-center justify-center" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <img src={selectedPhoto} alt="Zoom preview" className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border border-white/10 object-contain" />

            <div className="mt-6 flex items-center gap-4">
              <a
                href={selectedPhoto}
                download="Clara_15_Foto.jpg"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#C0C0C0]/20 hover:bg-[#E0E0E0]"
              >
                <Download className="w-4 h-4" /> Descargar HD
              </a>
              <button
                onClick={() => handleShare(selectedPhoto)}
                className="px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 hover:border-[#C0C0C0]/40 hover:text-[#C0C0C0]"
              >
                <Share2 className="w-4 h-4" /> Compartir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

