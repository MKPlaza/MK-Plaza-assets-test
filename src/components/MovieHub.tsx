import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { MOVIES } from '../movieData';
import { motion } from 'motion/react';

export default function MovieHub() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovies = MOVIES.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.year.includes(searchTerm)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-[var(--mk-gold)] drop-shadow-[0_0_10px_var(--mk-gold)] mb-4">
          MKPlaza's M0v13s
        </h1>
        <p className="text-[var(--mk-silver)] opacity-70 italic">
          Find a movie or sumn idk man you ask me
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mk-gold)] w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search movies..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[var(--mk-midnight)]/80 border border-yellow-400/30 text-[var(--mk-silver)] py-3 pl-12 pr-4 rounded-xl outline-none focus:border-[var(--mk-gold)] transition-all shadow-xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredMovies.map((movie, idx) => (
          <motion.a
            key={idx}
            href={movie.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-[var(--glass-heavy)] backdrop-blur-xl border border-yellow-400/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col group"
          >
            <div className="aspect-[2/3] relative overflow-hidden">
              <img 
                src={movie.imageUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--mk-midnight)] to-transparent opacity-60" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-[var(--mk-gold)] mb-2 line-clamp-1">{movie.title}</h3>
              <p className="text-xs text-[var(--mk-silver)]/70 mb-4 line-clamp-3 flex-1">{movie.description}</p>
              <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--mk-gold)]/50">
                {movie.year}
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="text-center py-20 text-[var(--mk-silver)] opacity-50">
          No movies found. Try another search!
        </div>
      )}

      <div className="mt-12 text-center text-[10px] uppercase tracking-widest text-[var(--mk-gold)]/40">
        Showing {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
