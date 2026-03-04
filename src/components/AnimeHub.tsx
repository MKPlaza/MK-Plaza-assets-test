import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { ANIME } from '../animeData';
import { motion, AnimatePresence } from 'motion/react';
import { Anime } from '../types';

export default function AnimeHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  const filteredAnime = ANIME.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.year?.includes(searchTerm) ?? false)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-[var(--mk-gold)] drop-shadow-[0_0_10px_var(--mk-gold)] mb-4">
          MKPlaza's An1m3
        </h1>
        <p className="text-[var(--mk-silver)] opacity-70 italic">
          Explore the world of animation
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mk-gold)] w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search anime..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[var(--mk-midnight)]/80 border border-yellow-400/30 text-[var(--mk-silver)] py-3 pl-12 pr-4 rounded-xl outline-none focus:border-[var(--mk-gold)] transition-all shadow-xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredAnime.map((item, idx) => (
          <motion.div
            key={idx}
            onClick={() => {
              if (item.link) {
                window.open(item.link, '_blank');
              } else {
                setSelectedAnime(item);
              }
            }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-[var(--glass-heavy)] backdrop-blur-xl border border-yellow-400/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col group cursor-pointer"
          >
            <div className="aspect-[2/3] relative overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--mk-midnight)] to-transparent opacity-60" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-[var(--mk-gold)] mb-2 line-clamp-1">{item.title}</h3>
              {item.description && <p className="text-xs text-[var(--mk-silver)]/70 mb-4 line-clamp-3 flex-1">{item.description}</p>}
              <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--mk-gold)]/50 mt-auto">
                {item.year || 'Anime'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedAnime && (
          <div 
            className="fixed inset-0 bg-black/80 z-[5000] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedAnime(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--mk-midnight)] border border-yellow-400/30 rounded-2xl p-8 max-w-lg w-full relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedAnime(null)}
                className="absolute top-4 right-4 text-[var(--mk-silver)] hover:text-[var(--mk-gold)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-[var(--mk-gold)] mb-6">{selectedAnime.title}</h2>
              <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedAnime.links?.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-400/10 border border-yellow-400/20 hover:bg-yellow-400/20 hover:border-yellow-400/40 text-[var(--mk-silver)] py-3 px-4 rounded-xl text-center font-bold transition-all"
                  >
                    {link.part}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filteredAnime.length === 0 && (
        <div className="text-center py-20 text-[var(--mk-silver)] opacity-50">
          No anime found. Try another search!
        </div>
      )}
    </div>
  );
}
