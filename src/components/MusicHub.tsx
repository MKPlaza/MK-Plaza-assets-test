import React, { useState, useEffect, useRef } from 'react';
import './MusicHub.css';

const CONFIG = {
  YT_KEY: "AIzaSyAf62uxazE_nFYZhq1St7jPjSL9l7-mzV8",
  LYRIC_EP: "https://lrclib.net/api/get",
  SEARCH_EP: "https://itunes.apple.com/search?term=",
  BASE_URL: "https://music-player-eight-omega.vercel.app"
};

interface MusicHubProps {
  currentSongIndex: number;
  setCurrentSongIndex: (index: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
}

interface Track {
  title: string;
  artist: string;
  artwork: string;
}

interface SearchResult {
  trackName: string;
  artistName: string;
  artworkUrl100: string;
}

interface LyricLine {
  time: number;
  text: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function MusicHub({ 
  currentSongIndex, 
  setCurrentSongIndex, 
  isPlaying: globalIsPlaying, 
  togglePlay: globalTogglePlay 
}: MusicHubProps) {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showingLyrics, setShowingLyrics] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>({
    title: "Not Playing",
    artist: "Select a song to start",
    artwork: `${CONFIG.BASE_URL}/empty-art.png`
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<string | LyricLine[]>("No lyrics available.");
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [notification, setNotification] = useState<{message: string, type: string} | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lyricsSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const albumCoverRef = useRef<HTMLImageElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const lyricsContentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (lyricsSyncIntervalRef.current) clearInterval(lyricsSyncIntervalRef.current);
    };
  }, []);

  const initializePlayer = () => {
    if (window.YT && window.YT.Player) {
      new window.YT.Player("ytPlayer", {
        height: "360",
        width: "640",
        videoId: "",
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          playsinline: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
    }
  };

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
    showNotification("Player ready!", "success");
    startProgressUpdater();
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    if (!window.YT) return;

    switch (playerState) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        break;
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        if (isLooping) {
          event.target.seekTo(0);
          event.target.playVideo();
        }
        break;
      case window.YT.PlayerState.BUFFERING:
        showNotification("Buffering...", "info");
        break;
    }
  };

  const onPlayerError = (event: any) => {
    console.error("YouTube player error:", event.data);
    showNotification("Playback error occurred", "error");
  };

  const startProgressUpdater = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (player && player.getCurrentTime && !isDragging) {
        const curr = player.getCurrentTime();
        const dur = player.getDuration();
        setCurrentTime(curr || 0);
        setDuration(dur || 0);
      }
    }, 500);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (query.length > 1) {
      searchTimeoutRef.current = setTimeout(() => searchSongs(query), 300);
    } else {
      setSearchResults([]);
    }
  };

  const searchSongs = async (query: string) => {
    try {
      setIsSearching(true);
      const url = `${CONFIG.SEARCH_EP}${encodeURIComponent(query)}&media=music&limit=12`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      showNotification("Search failed", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const playSong = async (title: string, artist: string, artwork: string) => {
    try {
      const highResArtwork = artwork ? artwork.replace("100x100", "600x600") : `${CONFIG.BASE_URL}/empty-art.png`;
      
      setCurrentTrack({ title, artist, artwork: highResArtwork });
      setSearchResults([]);
      setSearchQuery("");
      
      if (showingLyrics) {
        await fetchLyrics(artist, title);
      }

      const searchQuery = `${title} ${artist}`;
      await searchAndPlayYouTube(searchQuery);
      
      showNotification(`Now playing: ${title}`, "success");
    } catch (error) {
      console.error("Error playing song:", error);
      showNotification("Failed to play song", "error");
    }
  };

  const searchAndPlayYouTube = async (query: string) => {
    try {
      const searchUrl = `/api/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error("Search failed");
      }
      
      const data = await response.json();
      
      if (data.videoId) {
        const videoId = data.videoId;
        if (player && player.loadVideoById) {
          player.loadVideoById(videoId);
          player.playVideo();
          if (isMuted) player.mute();
        }
      } else {
        throw new Error("No video found");
      }
    } catch (error) {
      console.error("YouTube search error:", error);
      showNotification("Could not find video", "error");
    }
  };

  const fetchLyrics = async (artist: string, title: string) => {
    try {
      setLyrics("Loading lyrics...");
      const cleanArtist = encodeURIComponent(artist.trim());
      const cleanTitle = encodeURIComponent(title.trim());
      const url = `${CONFIG.LYRIC_EP}?artist_name=${cleanArtist}&track_name=${cleanTitle}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Lyrics not found");
      
      const data = await response.json();
      
      if (data.syncedLyrics) {
        const lines = data.syncedLyrics.trim().split("\n").map((line: string) => {
          const match = line.match(/^\[(\d+):(\d+\.\d+)](.*)$/);
          if (match) {
            const time = parseInt(match[1], 10) * 60 + parseFloat(match[2]);
            const text = match[3].trim();
            return { time, text };
          }
          return null;
        }).filter(Boolean) as LyricLine[];
        setLyrics(lines);
        startLyricsSync(lines);
      } else if (data.plainLyrics) {
        setLyrics(data.plainLyrics);
        if (lyricsSyncIntervalRef.current) clearInterval(lyricsSyncIntervalRef.current);
      } else {
        setLyrics("No lyrics available.");
      }
    } catch (error) {
      console.warn("Lyrics fetch failed:", error);
      setLyrics("No lyrics available.");
    }
  };

  const startLyricsSync = (lines: LyricLine[]) => {
    if (lyricsSyncIntervalRef.current) clearInterval(lyricsSyncIntervalRef.current);
    
    lyricsSyncIntervalRef.current = setInterval(() => {
      if (!player || !player.getCurrentTime) return;
      
      const curr = player.getCurrentTime();
      let activeIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (curr >= lines[i].time) {
          activeIndex = i;
        } else {
          break;
        }
      }
      
      setActiveLyricIndex(activeIndex);
      
      if (activeIndex !== -1 && lyricsContentRef.current) {
        const activeEl = document.getElementById(`lyric-${activeIndex}`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 500);
  };

  const togglePlayback = () => {
    if (!player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  };

  const toggleMute = () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    showNotification(!isLooping ? "Loop enabled" : "Loop disabled", "info");
  };

  const toggleLyricsView = () => {
    const newShowingLyrics = !showingLyrics;
    setShowingLyrics(newShowingLyrics);
    if (newShowingLyrics) {
      fetchLyrics(currentTrack.artist, currentTrack.title);
    } else {
      if (lyricsSyncIntervalRef.current) clearInterval(lyricsSyncIntervalRef.current);
    }
  };

  const skipTime = (seconds: number) => {
    if (!player || !player.getCurrentTime) return;
    const curr = player.getCurrentTime();
    const dur = player.getDuration();
    const newTime = Math.max(0, Math.min(curr + seconds, dur));
    player.seekTo(newTime, true);
  };

  const handleSeekMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSeekPosition(e);
  };

  const handleSeekMouseMove = (e: React.MouseEvent) => {
    if (isDragging) updateSeekPosition(e);
  };

  const handleSeekMouseUp = () => {
    setIsDragging(false);
  };

  const updateSeekPosition = (e: React.MouseEvent) => {
    if (!player || !player.getDuration || !seekBarRef.current) return;
    
    const rect = seekBarRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const percent = Math.min(Math.max(position, 0), 1);
    
    const dur = player.getDuration();
    player.seekTo(percent * dur, true);
    setCurrentTime(percent * dur);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const showNotification = (message: string, type: string = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="music-hub-container" onMouseMove={handleSeekMouseMove} onMouseUp={handleSeekMouseUp}>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for any song..."
          value={searchQuery}
          onChange={handleSearchInput}
          autoComplete="off"
        />
        <div className={`search-results ${searchResults.length > 0 ? 'active' : ''}`}>
          {isSearching ? (
            <div className="loading">Searching...</div>
          ) : (
            searchResults.map((item, index) => (
              <div 
                key={index} 
                className="result-item"
                onClick={() => playSong(item.trackName, item.artistName, item.artworkUrl100)}
              >
                <div className="result-img">
                  <img src={item.artworkUrl100 || `${CONFIG.BASE_URL}/empty-art.png`} alt={item.trackName} loading="lazy" />
                </div>
                <div className="result-info">
                  <div className="result-title">{item.trackName}</div>
                  <div className="result-artist">{item.artistName}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="player">
        {!showingLyrics && (
          <div className="album-art">
            <img
              ref={albumCoverRef}
              src={currentTrack.artwork}
              alt="Album artwork"
              crossOrigin="anonymous"
            />
          </div>
        )}
        
        {showingLyrics ? (
          <div className="lyrics-info" style={{ display: 'flex' }}>
            <div className="lyrics-content" ref={lyricsContentRef}>
              {Array.isArray(lyrics) ? (
                lyrics.map((line, index) => (
                  <div 
                    key={index} 
                    id={`lyric-${index}`}
                    className={`lyric-line ${index === activeLyricIndex ? 'active' : ''} ${index === activeLyricIndex - 1 ? 'prev' : ''} ${index === activeLyricIndex + 1 ? 'next' : ''}`}
                  >
                    {line.text}
                  </div>
                ))
              ) : (
                <div dangerouslySetInnerHTML={{ __html: lyrics.replace(/\n/g, "<br>") }} />
              )}
            </div>
          </div>
        ) : (
          <div className="info">
            <div className="track-title">{currentTrack.title}</div>
            <div className="artist">{currentTrack.artist}</div>
            
            <div className="controls">
              <i 
                className={`fa-solid fa-repeat control-btn ${isLooping ? 'active' : ''}`} 
                onClick={toggleLoop}
                title="Toggle loop"
              ></i>
              <i className="fas fa-backward control-btn" onClick={() => skipTime(-10)} title="Rewind 10s"></i>
              <i className="fa-solid fa-chevron-left control-btn" onClick={() => skipTime(-5)} title="Rewind 5s"></i>
              <i 
                className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} control-btn primary`} 
                onClick={togglePlayback}
                title="Play/Pause"
              ></i>
              <i className="fa-solid fa-chevron-right control-btn" onClick={() => skipTime(5)} title="Forward 5s"></i>
              <i className="fas fa-forward control-btn" onClick={() => skipTime(10)} title="Forward 10s"></i>
            </div>
            
            <div 
              className={`seekbar ${isDragging ? 'active' : ''}`} 
              ref={seekBarRef}
              onMouseDown={handleSeekMouseDown}
            >
              <div 
                id="progress" 
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="timecodes">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(duration - currentTime)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bottom-controls">
        <div className="bottom-btn" onClick={toggleMute}>
          <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
          <span>{isMuted ? 'Muted' : 'Volume'}</span>
        </div>
        
        <div className="bottom-btn" onClick={toggleLyricsView}>
          <i className={`fa-solid ${showingLyrics ? 'fa-music' : 'fa-align-left'}`}></i>
          <span>{showingLyrics ? 'Player' : 'Lyrics'}</span>
        </div>
      </div>

      <div id="player-container" style={{ position: 'absolute', top: -9999, left: -9999 }}>
        <div id="ytPlayer"></div>
      </div>

      <div className={`notification ${notification ? 'show' : ''} ${notification?.type || ''}`}>
        {notification?.message}
      </div>
    </div>
  );
}
