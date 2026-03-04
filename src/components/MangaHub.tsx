import React from 'react';
import { MANGA } from '../mangaData';
import { motion } from 'motion/react';

export default function MangaHub() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-[var(--mk-gold)] drop-shadow-[0_0_10px_var(--mk-gold)] mb-4">
          MK-PLAZA MANGA
        </h1>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
          Aetherium Archive v2.0
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {MANGA.map((manga, idx) => (
          <motion.a
            key={idx}
            href={manga.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-[var(--glass-heavy)] backdrop-blur-xl border border-yellow-400/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col group"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img 
                src={manga.imageUrl} 
                alt={manga.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--mk-midnight)] to-transparent opacity-60" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-[var(--mk-gold)] text-center">{manga.title}</h3>
            </div>
          </motion.a>
        ))}
      </div>

      {MANGA.length === 0 && (
        <div className="text-center py-20 text-[var(--mk-silver)] opacity-50">
          No manga found in the archive.
        </div>
      )}
    </div>
  );
}
