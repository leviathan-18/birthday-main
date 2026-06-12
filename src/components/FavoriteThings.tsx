"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Upload, Key } from "lucide-react";
import { useSoundtrack } from "@/context/SoundtrackContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicText from "./CinematicText";

interface FavoriteThingsProps {
  showKey?: boolean;
  onCollectKey?: (e: React.MouseEvent) => void;
}

export default function FavoriteThings({ showKey = false, onCollectKey = () => {} }: FavoriteThingsProps) {
  const { trackList, activeTrack, isPlaying, togglePlay, playTrack, uploadTrack, isVideoActive } = useSoundtrack();
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'spotify'>('local');
  const [spotifyKey, setSpotifyKey] = useState(0);

  // Reload/Reset Spotify Player when local music starts or video opens (pauses Spotify immediately)
  useEffect(() => {
    if (isPlaying || isVideoActive) {
      setSpotifyKey((prev) => prev + 1);
    }
  }, [isPlaying, isVideoActive]);

  const vinylCardRef = useRef<HTMLDivElement>(null);
  const playlistCardRef = useRef<HTMLDivElement>(null);
  const spinningVinylRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // GSAP Entrance and Parallax Effects
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const vinylCard = vinylCardRef.current;
    const playlistCard = playlistCardRef.current;
    const spinningVinyl = spinningVinylRef.current;

    if (vinylCard && playlistCard) {
      gsap.fromTo(vinylCard,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none reverse",
          }
        }
      );

      gsap.fromTo(playlistCard,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    if (spinningVinyl) {
      gsap.fromTo(spinningVinyl,
        { y: -12 },
        {
          y: 12,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === section) t.kill();
      });
    };
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Pause ambient audio if user selects Spotify tab
  useEffect(() => {
    if (activeTab === "spotify" && isPlaying) {
      togglePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Prevent Spotify iframe focus auto-scroll jump
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastScrollY = window.scrollY;
    let lastScrollX = window.scrollX;
    let isRestoring = false;

    const handleScroll = () => {
      if (!isRestoring) {
        const activeEl = document.activeElement;
        const isIframeFocused = activeEl && activeEl.tagName === "IFRAME" && (activeEl.getAttribute("src") || "").includes("spotify");
        
        if (document.hasFocus() && !isIframeFocused) {
          lastScrollY = window.scrollY;
          lastScrollX = window.scrollX;
        }
      }
    };

    const restoreScrollAndRefocus = () => {
      if (document.activeElement && document.activeElement.tagName === "IFRAME") {
        const iframeSrc = document.activeElement.getAttribute("src") || "";
        if (iframeSrc.includes("spotify")) {
          isRestoring = true;
          window.scrollTo(lastScrollX, lastScrollY);
          window.focus();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          setTimeout(() => {
            isRestoring = false;
          }, 150);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("blur", restoreScrollAndRefocus);

    // Periodically verify focus to catch track changes when parent window is already blurred
    const interval = setInterval(restoreScrollAndRefocus, 250);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("blur", restoreScrollAndRefocus);
      clearInterval(interval);
    };
  }, []);

  // Sync seek slider and volume with global audio element
  useEffect(() => {
    const audio = document.getElementById("bg-soundtrack-audio") as HTMLAudioElement | null;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    // Initial check
    updateProgress();
    setVolume(audio.volume);
    setIsMuted(audio.muted);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [activeTrack.url]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById("bg-soundtrack-audio") as HTMLAudioElement | null;
    if (!audio) return;
    const value = parseFloat(e.target.value);
    audio.currentTime = value;
    setProgress(value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById("bg-soundtrack-audio") as HTMLAudioElement | null;
    if (!audio) return;
    const value = parseFloat(e.target.value);
    audio.volume = value;
    setVolume(value);
    if (value > 0) {
      audio.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = document.getElementById("bg-soundtrack-audio") as HTMLAudioElement | null;
    if (!audio) return;
    const nextMute = !audio.muted;
    audio.muted = nextMute;
    setIsMuted(nextMute);
  };

  const currentIndex = trackList.findIndex((t) => t.id === activeTrack.id);
  
  const playNext = () => {
    if (trackList.length === 0) return;
    const nextIdx = (currentIndex + 1) % trackList.length;
    playTrack(trackList[nextIdx].id);
  };

  const playPrev = () => {
    if (trackList.length === 0) return;
    const prevIdx = (currentIndex - 1 + trackList.length) % trackList.length;
    playTrack(trackList[prevIdx].id);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadTrack(file);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section id="moments" ref={sectionRef} className="w-full py-32 bg-[#050505] border-t border-glass relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-pink-glow/5 rounded-full blur-[60px] md:blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 select-none">
        
        {/* Section Header */}
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.3em] text-accent-glow font-sans font-semibold block mb-2">
            Chronicles in Sound
          </span>
          <CinematicText
            text="Soundtrack"
            className="text-4xl md:text-5xl font-serif text-white tracking-tight text-glow"
          />
          <div className="w-16 h-[1px] bg-accent-gradient mx-auto mt-6 mb-4" />
          <CinematicText
            text="I always knew that you are the missing sound of my Life!"
            className="text-sm font-sans text-text-secondary leading-relaxed max-w-xl mx-auto"
          />
        </div>

        {/* Audio Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Vinyl Control Station (7 columns) */}
          <div ref={vinylCardRef} className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-glass border border-glass flex flex-col justify-between relative overflow-hidden opacity-0">
            {/* Subtle backdrop glow */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-accent-glow/5 blur-[40px] md:blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              
              {/* Spinning Vinyl Frame */}
              <div ref={spinningVinylRef} className="relative w-36 h-36 md:w-44 md:h-44 group flex-shrink-0">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="w-full h-full rounded-full bg-neutral-950 border-[6px] border-neutral-800 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex items-center justify-center relative overflow-hidden"
                >
                  {/* Vinyl grooves */}
                  <div className="absolute inset-2 rounded-full border border-neutral-700/20" />
                  <div className="absolute inset-4 rounded-full border border-neutral-700/30" />
                  <div className="absolute inset-8 rounded-full border border-neutral-700/40" />
                  
                  {/* Vinyl Center Label */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent-gradient flex items-center justify-center border-4 border-neutral-900 z-10 shadow-inner">
                    <div className="w-3.5 h-3.5 rounded-full bg-neutral-950" />
                  </div>
                </motion.div>

              </div>

              {/* Live Info details */}
              <div className="flex-1 text-center md:text-left flex flex-col justify-center">
                <span className="font-serif italic text-xs text-accent-glow font-medium">Currently spinning</span>
                <h4 className="text-xl md:text-2xl font-serif text-white tracking-wide mt-1 truncate max-w-[280px] mx-auto md:mx-0">
                  {activeTrack.title}
                </h4>
                <span className="text-[9px] font-sans text-text-secondary uppercase tracking-widest mt-1 block">
                  By {activeTrack.artist}
                </span>

                {/* Waveform Equalizer animation */}
                <div className="flex items-end gap-[3px] h-8 justify-center md:justify-start mt-6 overflow-hidden max-w-[200px]">
                  {Array.from({ length: isMobile ? 10 : 25 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scaleY: (isVisible && isPlaying) ? [1, Math.random() * 2.8 + 1.2, 1] : 1,
                      }}
                      transition={{
                        repeat: (isVisible && isPlaying) ? Infinity : 0,
                        duration: (isVisible && isPlaying) ? 0.45 + i * 0.04 : 1.2,
                        ease: "easeInOut",
                      }}
                      className="w-0.5 rounded-full bg-gradient-to-t from-violet-600 via-pink-500 to-amber-300 origin-bottom"
                      style={{ height: "100%" }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Vintage Player Sliders & Controls */}
            <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-5 z-10">
              
              {/* Seeking Progress Slider */}
              <div className="flex items-center gap-3 w-full">
                <span className="text-[10px] font-sans text-text-secondary w-8 text-right font-medium">
                  {formatTime(progress)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-[3px] bg-white/10 hover:bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-glow focus:outline-none transition-colors"
                />
                <span className="text-[10px] font-sans text-text-secondary w-8 font-medium">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls Grid */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Control buttons */}
                <div className="flex items-center gap-5 relative">
                  {/* Hidden Key near player controls */}
                  {showKey && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onCollectKey(e);
                      }}
                      className="absolute -right-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-neutral-950/95 border border-amber-400 text-amber-300 z-30 cursor-pointer animate-float-slow flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.8)] hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
                      title="Golden Key"
                    >
                      <Key className="w-5 h-5 text-amber-300" />
                    </div>
                  )}

                  <button
                    onClick={playPrev}
                    className="p-2.5 rounded-full bg-white/5 border border-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-all duration-300"
                    title="Previous track"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-white text-neutral-950 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-neutral-950 text-neutral-950" />
                    ) : (
                      <Play className="w-5 h-5 fill-neutral-950 text-neutral-950 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={playNext}
                    className="p-2.5 rounded-full bg-white/5 border border-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-all duration-300"
                    title="Next track"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Volume bar sync */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-text-secondary hover:text-white transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 md:w-24 h-1 bg-white/10 hover:bg-white/20 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Audio Cards Tracklist Grid (5 columns) */}
          <div ref={playlistCardRef} className="lg:col-span-5 flex flex-col justify-between gap-6 p-6 rounded-3xl bg-glass border border-glass relative opacity-0">
            <div className="flex flex-col gap-4">
              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('local')}
                    className={`text-[10px] font-sans font-bold uppercase tracking-widest transition-colors pb-1 ${
                      activeTab === 'local' ? 'text-pink-glow border-b border-pink-glow' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Local Tracks
                  </button>
                  <button
                    onClick={() => setActiveTab('spotify')}
                    className={`text-[10px] font-sans font-bold uppercase tracking-widest transition-colors pb-1 ${
                      activeTab === 'spotify' ? 'text-pink-glow border-b border-pink-glow' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Spotify Playlist
                  </button>
                </div>
                <span className="text-[9px] font-sans text-text-secondary uppercase tracking-widest">
                  {activeTab === 'local' ? `${trackList.length} Tracks` : 'Spotify'}
                </span>
              </div>

              {activeTab === 'local' ? (
                <>
                  {/* Scrollable Tracklist */}
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {trackList.map((track) => {
                      const isActive = track.id === activeTrack.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track.id)}
                          className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                            isActive
                              ? "bg-white/10 border-pink-glow/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]"
                              : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/8"
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5 relative overflow-hidden flex-shrink-0">
                              <motion.div
                                animate={{ rotate: isActive && isPlaying ? 360 : 0 }}
                                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                                className="w-full h-full rounded-full flex items-center justify-center bg-zinc-900"
                              >
                                <Music className={`w-3.5 h-3.5 ${isActive ? "text-pink-glow" : "text-text-secondary"}`} />
                              </motion.div>
                              {isActive && isPlaying && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Pause className="w-2.5 h-2.5 text-white fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-left truncate">
                              <h4 className={`text-xs font-sans font-semibold tracking-wide truncate ${isActive ? "text-pink-glow" : "text-white"}`}>
                                {track.title}
                              </h4>
                              <span className="text-[9px] font-sans text-text-secondary uppercase tracking-widest mt-0.5 block truncate">
                                {track.artist}
                              </span>
                            </div>
                          </div>

                          {isActive && isPlaying && (
                            <div className="flex items-end gap-0.5 h-3.5 flex-shrink-0">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <motion.span
                                  key={i}
                                  animate={{ scaleY: [1, 2.8, 1] }}
                                  transition={{ repeat: Infinity, duration: 0.4 + i * 0.08, ease: "linear" }}
                                  className="w-[2px] h-3 bg-pink-glow origin-bottom"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Track Uploader Button */}
                  <div className="mt-4 border-t border-white/5 pt-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="audio/*"
                      className="hidden"
                    />
                    <button
                      onClick={handleUploadClick}
                      className="w-full py-3.5 rounded-2xl border border-dashed border-white/10 hover:border-amber-300/40 bg-white/5 hover:bg-white/8 font-sans text-[10px] text-text-secondary hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Your Own Song
                    </button>
                  </div>
                </>
              ) : (
                /* Spotify Embed Player Container */
                <div className="flex flex-col gap-4 py-2">
                  <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 p-1 shadow-inner">
                    <iframe 
                      key={spotifyKey}
                      data-testid="embed-iframe" 
                      style={{ borderRadius: "12px", border: "none" }} 
                      src="https://open.spotify.com/embed/playlist/6vpe0Gxm5eVh9JCtZ8iEed?utm_source=generator" 
                      width="100%" 
                      height="352" 
                      allowFullScreen={true} 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[10px] font-sans text-text-secondary leading-relaxed text-center px-1">
                    ℹ️ <span className="text-amber-300 font-semibold">Note:</span> Spotify embeds cannot autoplay due to browser security settings. Switch back to &quot;Local Tracks&quot; to play ambient music automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
