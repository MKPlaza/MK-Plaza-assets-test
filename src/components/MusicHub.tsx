import React from 'react';
import { Play, Pause, Music as MusicIcon, ListMusic, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import { PLAYLIST } from '../constants';

interface MusicHubProps {
  currentSongIndex: number;
  setCurrentSongIndex: (index: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
}

export default function MusicHub({ 
  currentSongIndex, 
  setCurrentSongIndex, 
  isPlaying, 
  togglePlay 
}: MusicHubProps) {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Now Playing Card */}
        <div className="w-full md:w-1/3 sticky top-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--glass-heavy)] backdrop-blur-2xl border border-yellow-400/20 rounded-3xl p-8 shadow-2xl text-center"
          >
            <div className="relative w-48 h-48 mx-auto mb-8">
              <motion.div 
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-full h-full rounded-full border-4 border-[var(--mk-gold)] flex items-center justify-center bg-[var(--mk-midnight)] shadow-[0_0_30px_rgba(255,215,0,0.2)]"
              >
                <Disc className="w-24 h-24 text-[var(--mk-gold)] opacity-50" />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[var(--mk-gold)] shadow-[0_0_10px_var(--mk-gold)]" />
              </div>
            </div>

            <h2 className="text-xl font-black text-[var(--mk-gold)] uppercase tracking-wider mb-2 drop-shadow-[0_0_8px_var(--mk-gold)]">
              Now Playing
            </h2>
            <p className="text-[var(--mk-silver)] text-sm mb-8 line-clamp-2 h-10">
              {PLAYLIST[currentSongIndex].title}
            </p>

            <button 
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-[var(--mk-gold)] text-[var(--mk-midnight)] flex items-center justify-center mx-auto hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.4)]"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
          </motion.div>
        </div>

        {/* Playlist Section */}
        <div className="w-full md:w-2/3">
          <div className="flex items-center gap-3 mb-8">
            <ListMusic className="w-6 h-6 text-[var(--mk-eye-glow)]" />
            <h2 className="text-2xl font-black text-[var(--mk-gold)] uppercase tracking-widest">
              The Knight's Playlist
            </h2>
          </div>

          <div className="grid gap-3">
            {PLAYLIST.map((song, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (currentSongIndex === index) {
                    togglePlay();
                  } else {
                    setCurrentSongIndex(index);
                  }
                }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${
                  currentSongIndex === index 
                    ? 'bg-yellow-400/15 border-yellow-400/40 shadow-[0_0_15px_rgba(255,215,0,0.1)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  currentSongIndex === index ? 'bg-[var(--mk-gold)] text-[var(--mk-midnight)]' : 'bg-[var(--mk-midnight)] text-[var(--mk-silver)] group-hover:text-[var(--mk-gold)]'
                }`}>
                  {currentSongIndex === index && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className={`w-5 h-5 ${currentSongIndex === index ? '' : 'ml-0.5'}`} />
                  )}
                </div>

                <div className="flex-1">
                  <div className={`text-sm font-bold uppercase tracking-wide transition-colors ${
                    currentSongIndex === index ? 'text-[var(--mk-gold)]' : 'text-[var(--mk-silver)] group-hover:text-white'
                  }`}>
                    {song.title}
                  </div>
                  <div className="text-[10px] text-[var(--mk-silver)] opacity-50 uppercase tracking-tighter">
                    Meta Knight Theme Collection
                  </div>
                </div>

                {currentSongIndex === index && isPlaying && (
                  <div className="flex gap-0.5 items-end h-4">
                    {[0.6, 0.8, 0.4, 0.9, 0.5].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['20%', '100%', '20%'] }}
                        transition={{ 
                          duration: 0.5 + Math.random() * 0.5, 
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                        className="w-1 bg-[var(--mk-gold)] rounded-full"
                        style={{ height: `${h * 100}%` }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
