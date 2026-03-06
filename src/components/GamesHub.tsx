import React, { useState } from 'react';
import { Search, Star, Box, Play, Puzzle, Bomb, Beer, Plane, Leaf, Skull, Bike, Trophy, Zap, Hand, Target, Sprout, Rocket, Ghost, Gamepad2, Swords, Dribbble, Eye, Camera, Crown, Triangle, Bug, Pizza } from 'lucide-react';
import { GAMES } from '../gameData';
import { FavoriteItem, Game } from '../types';
import { motion } from 'motion/react';

interface GamesHubProps {
  favorites: FavoriteItem[];
  onToggleFavorite: (item: FavoriteItem) => void;
  setSelectedGame: (game: Game | null) => void;
}

const iconMap: Record<string, any> = {
  Puzzle, Bomb, Beer, Plane, Leaf, Skull, Bike, Trophy, Zap, Hand, Target, Sprout, Rocket, Ghost, Gamepad2, Swords, Dribbble, Eye, Camera, Crown, Box, Triangle, Bug, Pizza
};

export default function GamesHub({ favorites, onToggleFavorite, setSelectedGame }: GamesHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('ALL');

  const filteredGames = GAMES.filter(game => {
    const matchesFilter = currentFilter === 'ALL' || game.platform === currentFilter;
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.system.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = ['ALL', 'Nintendo', 'Sega', 'PlayStation', 'PC', 'Other'];

  return (
    <motion.div  
      key="grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 max-w-7xl mx-auto pb-32"
    >
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-4 leading-none text-white select-none">
          MK'S GAME <span className="text-[var(--mk-gold)]" style={{ textShadow: '0 0 15px rgba(255,204,0,0.4)' }}>COLLECTION</span>
        </h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-8 bg-white/10"></div>
          <span className="text-[11px] font-black tracking-[0.3em] uppercase text-neutral-400">
            {filteredGames.length.toString().padStart(2, '0')} <span className="text-red-600/60">TITLES</span> IN THE {currentFilter} VAULT
          </span>
          <div className="h-px w-8 bg-white/10"></div>
        </div>
      </div>

      <div className="relative max-w-2xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mk-gold)] w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search the vault (Title, system, or tag)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white py-4 pl-14 pr-6 rounded-full outline-none focus:border-[var(--mk-gold)]/50 focus:bg-white/10 transition-all font-medium"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setCurrentFilter(filter)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
              currentFilter === filter 
                ? 'bg-[var(--mk-gold)] border-yellow-200 text-[var(--mk-midnight)] scale-105 shadow-[0_10px_15px_-3px_rgba(255,204,0,0.3)]' 
                : 'border-white/5 bg-white/5 text-neutral-500 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGames.map((game) => {
          const isFavorited = favorites.some(f => f.id === game.id);
          const IconComponent = iconMap[game.icon] || Gamepad2;
          
          return (
            <motion.div
              key={game.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-[#0a1128] border border-white/10 rounded-3xl overflow-hidden flex flex-col min-h-[300px] hover:border-[var(--mk-gold)]/40 hover:bg-[#0e1a3d] transition-all duration-500 shadow-2xl"
            >
              <div className={`relative z-10 h-1.5 w-full bg-gradient-to-r ${game.color} opacity-80`}></div>
              
              <div className="relative z-10 p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white/5 backdrop-blur-sm rounded-2xl transition-colors group-hover:bg-white/10">
                      <IconComponent className={`w-6 h-6 ${game.iconColor} drop-shadow-md`} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-black text-white/40 tracking-widest uppercase drop-shadow-md">{game.system}</span>
                      <span className="text-[10px] font-bold text-red-500 bg-red-600/10 backdrop-blur-md px-2 py-0.5 rounded-md border border-red-600/20">{game.year}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">{game.title}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite({
                          id: game.id,
                          type: 'game',
                          title: game.title,
                          imageUrl: game.image || 'https://picsum.photos/seed/game/400/600',
                          link: game.link || '#'
                        });
                      }}
                      className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                        isFavorited 
                          ? 'bg-[var(--mk-gold)] border-[var(--mk-gold)] text-[var(--mk-midnight)]' 
                          : 'bg-black/40 border-white/10 text-white hover:border-[var(--mk-gold)] hover:text-[var(--mk-gold)]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-neutral-400 mb-8 leading-relaxed italic h-12 line-clamp-2 drop-shadow-md">"{game.desc}"</p>
                </div>
                
                <button 
                  onClick={() => setSelectedGame(game)}
                  className="relative w-full py-4 bg-white text-black rounded-2xl font-black text-[11px] tracking-[0.15em] transition-all active:scale-[0.98] mt-auto overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-[var(--mk-gold)] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-black transition-colors">
                    LAUNCH INTERFACE <Play className="w-3 h-3 fill-current" />
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-neutral-600 text-6xl mb-6"><Box className="w-16 h-16 mx-auto" /></div>
          <h3 className="text-xl font-bold text-white mb-2">No data found in this sector</h3>
          <p className="text-neutral-500 text-sm mb-8 italic">"Try a different search query or clear your filters"</p>
          <button 
            onClick={() => { setSearchTerm(''); setCurrentFilter('ALL'); }}
            className="px-6 py-3 border border-yellow-500/30 text-[var(--mk-gold)] text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-yellow-500/10 transition-all"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </motion.div>
  );
}
