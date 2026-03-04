import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Tv, 
  Gamepad2, 
  BookOpenText, 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  X, 
  Terminal, 
  Palette, 
  Ghost,
  Battery,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  Clock,
  Github,
  MessageSquare,
  ChevronLeft,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { THEMES, CLOAKS, PLAYLIST, MUSIC_BASE_URL } from './constants';
import { ThemePreset } from './types';
import MovieHub from './components/MovieHub';
import TVHub from './components/TVHub';
import AnimeHub from './components/AnimeHub';
import MangaHub from './components/MangaHub';
import MusicHub from './components/MusicHub';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>(THEMES.original);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [activeHub, setActiveHub] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  
  // Music Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cloak State
  const [cloakTarget, setCloakTarget] = useState('classroom');
  const [customCloakTitle, setCustomCloakTitle] = useState('');
  const [customCloakFavicon, setCustomCloakFavicon] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        const updateBattery = () => {
          setBattery({ level: Math.round(batt.level * 100), charging: batt.charging });
        };
        updateBattery();
        batt.addEventListener('levelchange', updateBattery);
        batt.addEventListener('chargingchange', updateBattery);
      });
    }

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Apply theme variables to root
    const root = document.documentElement;
    root.style.setProperty('--mk-midnight', currentTheme.midnight);
    root.style.setProperty('--mk-eye-glow', currentTheme.eyes);
    root.style.setProperty('--mk-gold', currentTheme.gold);
    
    if (currentTheme.pixel) {
      document.body.classList.add('pixel-theme');
    } else {
      document.body.classList.remove('pixel-theme');
    }
  }, [currentTheme]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (dir: number) => {
    const nextIndex = (currentSongIndex + dir + PLAYLIST.length) % PLAYLIST.length;
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
    // Audio source update is handled by useEffect or direct ref update
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = MUSIC_BASE_URL + encodeURIComponent(PLAYLIST[currentSongIndex].filename);
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentSongIndex]);

  const loadHub = (type: string) => {
    setActiveHub(type);
  };

  const goHome = () => {
    setActiveHub(null);
  };

  const initiateCloak = () => {
    let finalTitle, finalIcon;
    if (cloakTarget === 'custom') {
      finalTitle = customCloakTitle || "Home";
      finalIcon = customCloakFavicon || "https://www.google.com/favicon.ico";
    } else {
      finalTitle = CLOAKS[cloakTarget].title;
      finalIcon = CLOAKS[cloakTarget].icon;
    }

    const win = window.open('about:blank', '_blank');
    if (win) {
      const doc = win.document;
      doc.open();
      // We need to inject the current page's HTML into the new window
      // But since we are in a React app, we might want to just inject a simple iframe or the whole body
      doc.write(document.documentElement.outerHTML);
      doc.close();
      
      setTimeout(() => {
        win.document.title = finalTitle;
        const link = win.document.createElement('link');
        link.rel = 'icon';
        link.href = finalIcon;
        win.document.head.appendChild(link);
      }, 100);
    }
    setIsSettingsOpen(false);
  };

  const getBatteryIcon = () => {
    if (!battery) return <Battery className="w-4 h-4" />;
    if (battery.charging) return <BatteryCharging className="w-4 h-4" />;
    if (battery.level > 70) return <Battery className="w-4 h-4" />;
    if (battery.level > 30) return <BatteryMedium className="w-4 h-4" />;
    return <BatteryLow className="w-4 h-4" />;
  };

  return (
    <div 
      className="min-h-screen w-full relative transition-all duration-700 font-cinzel"
      style={{ 
        backgroundImage: `url(${currentTheme.bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Overlay */}
      {/* Removed overlay to show raw image as requested */}

      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-20 bg-[var(--glass)] backdrop-blur-xl flex items-center justify-between px-8 z-[2000] shadow-2xl border-b border-white/5">
        <div className="flex items-center gap-6">
          <motion.img 
            whileHover={{ scale: 1.1, rotate: 5 }}
            src={currentTheme.logo} 
            alt="Logo" 
            className="h-12 w-auto cursor-pointer drop-shadow-[0_0_8px_var(--mk-gold)]"
            onClick={goHome}
          />
          <div 
            className="text-xl font-black uppercase tracking-[3px] text-[var(--mk-gold)] drop-shadow-[0_0_12px_var(--mk-gold)] select-none"
          >
            MK-Plaza
          </div>
          
          <div className="flex items-center gap-5 bg-yellow-400/5 px-4 py-1.5 rounded-full border border-yellow-400/10 font-orbitron text-[11px] text-[var(--mk-gold)] shadow-[0_0_8px_rgba(255,215,0,0.1)]">
            <div className="flex items-center gap-2">
              {getBatteryIcon()}
              <span>{battery ? `${battery.level}%` : '--%'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            <a href="https://discord.gg/kZzGNnmjpv" target="_blank" className="text-[var(--mk-silver)] opacity-70 hover:opacity-100 hover:text-[var(--mk-gold)] transition-all hover:-translate-y-0.5">
              <MessageSquare className="w-6 h-6" />
            </a>
            <a href="https://github.com/MKPlaza" target="_blank" className="text-[var(--mk-silver)] opacity-70 hover:opacity-100 hover:text-[var(--mk-gold)] transition-all hover:-translate-y-0.5">
              <Github className="w-6 h-6" />
            </a>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-[var(--mk-silver)] opacity-70 hover:opacity-100 hover:text-[var(--mk-gold)] transition-all hover:rotate-45"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Sub-Nav */}
      <motion.nav 
        animate={{ 
          y: isNavCollapsed ? -140 : 0,
          opacity: isNavCollapsed ? 0 : 1
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="fixed top-20 left-0 w-full h-[60px] bg-[var(--glass-heavy)] backdrop-blur-2xl border-b border-yellow-400/15 flex items-center justify-center gap-4 px-5 z-[1999]"
      >
        {[
          { id: 'movies', label: 'Movies', icon: Film },
          { id: 'tv', label: 'TV Shows', icon: Tv },
          { id: 'anime', label: 'Anime', icon: Ghost },
          { id: 'manga', label: 'Manga', icon: BookOpenText },
          { id: 'games', label: 'Games', icon: Gamepad2 },
          { id: 'music', label: 'Music', icon: Music },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => loadHub(item.id)}
            className="flex items-center gap-2.5 text-[var(--mk-silver)] px-4 py-2 rounded-lg transition-all border border-transparent hover:bg-yellow-400/10 hover:border-yellow-400/30 hover:-translate-y-0.5 group"
          >
            <item.icon className="w-5 h-5 text-[var(--mk-eye-glow)] drop-shadow-[0_0_5px_var(--mk-eye-glow)]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}

        <button 
          onClick={() => setIsNavCollapsed(true)}
          className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 flex items-center justify-center bg-[var(--glass-heavy)] backdrop-blur-md border border-yellow-400/20 border-t-0 text-[var(--mk-gold)] w-[60px] h-[22px] rounded-b-xl hover:h-[26px] transition-all"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </motion.nav>

      {/* Restore Nav Button */}
      <AnimatePresence>
        {isNavCollapsed && (
          <motion.button 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => setIsNavCollapsed(false)}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[2001] bg-[var(--mk-gold)] text-[var(--mk-midnight)] w-[60px] h-[22px] rounded-b-xl flex items-center justify-center shadow-lg"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <main 
        className={`absolute left-0 w-full transition-all duration-500 z-50 bg-[var(--mk-midnight)]/90 overflow-y-auto ${activeHub ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ 
          top: isNavCollapsed ? '80px' : '140px',
          height: isNavCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 140px)'
        }}
      >
        {activeHub === 'movies' && <MovieHub />}
        {activeHub === 'tv' && <TVHub />}
        {activeHub === 'anime' && <AnimeHub />}
        {activeHub === 'manga' && <MangaHub />}
        {activeHub === 'music' && (
          <MusicHub 
            currentSongIndex={currentSongIndex} 
            setCurrentSongIndex={setCurrentSongIndex}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
          />
        )}
        {activeHub === 'games' && (
          <div className="flex items-center justify-center h-full text-[var(--mk-gold)] text-xl">
            GAMES Hub coming soon...
          </div>
        )}
      </main>

      {/* Music Player */}
      <motion.div 
        animate={{ left: isPlayerCollapsed ? -415 : 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="fixed bottom-[30px] flex items-center z-[1000]"
      >
        <div className="h-[54px] w-[400px] bg-[var(--mk-midnight)]/85 backdrop-blur-2xl rounded-full border border-yellow-400/10 flex items-center px-5 shadow-2xl">
          <div className="flex-1 overflow-hidden whitespace-nowrap mr-4 relative">
            <div className="inline-block text-sm text-[var(--mk-silver)] animate-marquee pl-full">
              {PLAYLIST[currentSongIndex].title}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => changeTrack(-1)} className="p-2 text-[var(--mk-silver)] hover:text-[var(--mk-gold)] transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={togglePlay} className="p-2 text-[var(--mk-silver)] hover:text-[var(--mk-gold)] transition-colors">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={() => changeTrack(1)} className="p-2 text-[var(--mk-silver)] hover:text-[var(--mk-gold)] transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsLooping(!isLooping)} 
              className={`p-2 transition-colors ${isLooping ? 'text-[var(--mk-gold)]' : 'text-[var(--mk-silver)] hover:text-[var(--mk-gold)]'}`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button 
          onClick={() => setIsPlayerCollapsed(!isPlayerCollapsed)}
          className="w-10 h-10 ml-3 bg-[var(--mk-midnight)]/85 backdrop-blur-md border border-yellow-400/15 rounded-full flex items-center justify-center text-[var(--mk-silver)] hover:text-[var(--mk-gold)] transition-all"
        >
          <motion.div animate={{ rotate: isPlayerCollapsed ? 180 : 0 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </button>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div 
            className="fixed inset-0 bg-black/10 z-[3000] flex items-center justify-end pr-12"
            onClick={(e) => e.target === e.currentTarget && setIsSettingsOpen(false)}
          >
            <motion.div 
              initial={{ x: 100, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.95 }}
              className="w-[400px] bg-[var(--glass-heavy)] backdrop-blur-2xl border border-yellow-400/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-[var(--mk-silver)]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-yellow-400/15 pb-3">
                <h2 className="text-sm font-bold text-[var(--mk-gold)] uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Settings
                </h2>
                <button onClick={() => setIsSettingsOpen(false)} className="hover:text-[var(--mk-gold)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Section */}
              <div className="mb-8">
                <div className="text-[11px] text-[var(--mk-eye-glow)] uppercase mb-4 font-bold flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Knight Presets
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-yellow-400/5 flex flex-col gap-2">
                  <span className="text-xs opacity-70">Active Theme Profile</span>
                  <select 
                    value={Object.keys(THEMES).find(key => THEMES[key] === currentTheme)}
                    onChange={(e) => setCurrentTheme(THEMES[e.target.value])}
                    className="bg-[var(--mk-midnight)]/80 border border-yellow-400/30 text-[var(--mk-silver)] p-2.5 rounded-lg w-full outline-none text-xs"
                  >
                    {Object.entries(THEMES).map(([key, theme]) => (
                      <option key={key} value={key}>{theme.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cloak Section */}
              <div>
                <div className="text-[11px] text-[var(--mk-eye-glow)] uppercase mb-4 font-bold flex items-center gap-2">
                  <Ghost className="w-4 h-4" /> Cloak Methods
                </div>
                <div className="flex flex-col gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-yellow-400/5 flex flex-col gap-2">
                    <span className="text-xs opacity-70">Cloak Site</span>
                    <select 
                      value={cloakTarget}
                      onChange={(e) => setCloakTarget(e.target.value)}
                      className="bg-[var(--mk-midnight)]/80 border border-yellow-400/30 text-[var(--mk-silver)] p-2.5 rounded-lg w-full outline-none text-xs"
                    >
                      {Object.entries(CLOAKS).map(([key, cloak]) => (
                        <option key={key} value={key}>{cloak.title}</option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {cloakTarget === 'custom' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="p-3 bg-white/5 rounded-xl border border-yellow-400/5 flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] opacity-70 uppercase">Custom Title</span>
                        <input 
                          type="text" 
                          value={customCloakTitle}
                          onChange={(e) => setCustomCloakTitle(e.target.value)}
                          placeholder="Enter custom title"
                          className="bg-[var(--mk-midnight)]/80 border border-yellow-400/30 text-[var(--mk-silver)] p-2 rounded-lg w-full outline-none text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] opacity-70 uppercase">Custom Favicon URL</span>
                        <input 
                          type="text" 
                          value={customCloakFavicon}
                          onChange={(e) => setCustomCloakFavicon(e.target.value)}
                          placeholder="https://example.com/favicon.ico"
                          className="bg-[var(--mk-midnight)]/80 border border-yellow-400/30 text-[var(--mk-silver)] p-2 rounded-lg w-full outline-none text-xs"
                        />
                      </div>
                    </motion.div>
                  )}

                  <button 
                    onClick={initiateCloak}
                    className="bg-[var(--mk-accent-red)] hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
                  >
                    Open Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <audio 
        ref={audioRef} 
        loop={isLooping}
        onEnded={() => !isLooping && changeTrack(1)}
      />
    </div>
  );
}
