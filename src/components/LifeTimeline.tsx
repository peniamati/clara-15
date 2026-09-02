import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Sparkles, Calendar, Heart, Camera, X } from 'lucide-react';
import { TimelineItem } from '../types';

export const LifeTimeline: React.FC = () => {
  const { timeline, config } = useEvent();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedImage, setSelectedImage] = useState<TimelineItem | null>(null);

  const categories = ['Todos', 'Nacimiento', 'Infancia', 'Colegio', 'Viajes', 'Amigos', 'Hoy'];

  const filteredTimeline = selectedCategory === 'Todos'
    ? timeline
    : timeline.filter(item => item.category === selectedCategory);

  return (
    <section id="historia" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Mi Trayectoria</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-4">
            La Historia de {config.honoree}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
            15 años retratados en momentos inolvidables, risas, primeros logros y el amor incondicional de la familia y amigos.
          </p>

          {/* Era Filter Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all uppercase ${
                  selectedCategory === cat
                    ? 'bg-[#C0C0C0] text-black font-bold shadow-lg shadow-[#C0C0C0]/20'
                    : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white hover:border-[#C0C0C0]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Interactive Timeline */}
        <div className="relative border-l border-[#C0C0C0]/30 ml-4 sm:ml-32 space-y-12">
          {filteredTimeline.map((item, index) => (
            <div key={item.id} className="relative pl-8 sm:pl-12 group">
              
              {/* Timeline Year Marker */}
              <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-[#050505] border-2 border-[#C0C0C0] flex items-center justify-center shadow-lg shadow-[#C0C0C0]/20 group-hover:scale-125 transition-transform">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C0C0C0]" />
              </div>

              {/* Year Label for Desktop */}
              <div className="hidden sm:block absolute -left-28 top-2 text-right w-20 text-[#C0C0C0] font-serif font-bold text-xl">
                {item.year}
              </div>

              {/* Card Container */}
              <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl hover:border-[#C0C0C0]/40 transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Photo Thumbnail */}
                <div className="md:col-span-5 relative group/img overflow-hidden rounded-xl border border-white/10 cursor-pointer" onClick={() => setSelectedImage(item)}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-56 object-cover object-center group-hover/img:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#050505]/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[#C0C0C0] text-xs font-semibold gap-2 uppercase tracking-widest">
                    <Camera className="w-4 h-4" /> Ampliar Foto
                  </div>
                </div>

                {/* Details */}
                <div className="md:col-span-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="sm:hidden px-2.5 py-0.5 rounded-full bg-[#C0C0C0]/20 border border-[#C0C0C0]/30 text-[#C0C0C0] text-[10px] font-bold">
                      {item.year}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-[#C0C0C0] text-[10px] font-semibold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>

                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl p-4 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full max-h-[60vh] object-contain rounded-xl mb-4" />
            <div className="text-center">
              <span className="text-[#C0C0C0] text-xs font-bold uppercase tracking-widest">{selectedImage.year} · {selectedImage.category}</span>
              <h4 className="font-serif text-3xl font-semibold text-white mt-1 mb-2">{selectedImage.title}</h4>
              <p className="text-zinc-300 text-sm font-light">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
