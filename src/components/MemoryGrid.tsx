"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Compass, Flame, Snowflake, Cake, Sparkles, X, Volume2, VolumeX, Key } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicText from "./CinematicText";
import { useSoundtrack } from "../context/SoundtrackContext";


interface MemoryCard {
  id: number;
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  videoUrl: string;
}

interface MemoryGridProps {
  showKey?: boolean;
  onCollectKey?: (e: React.MouseEvent) => void;
}

export default function MemoryGrid({ showKey = false, onCollectKey = () => {} }: MemoryGridProps) {
  const { setIsPlaying, setIsVideoActive } = useSoundtrack();
  const [activeCard, setActiveCard] = useState<MemoryCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoFadeOut, setVideoFadeOut] = useState(false);
  const [keyCardId, setKeyCardId] = useState(1);

  useEffect(() => {
    setKeyCardId(Math.floor(Math.random() * 6) + 1);
  }, []);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const grid = gridRef.current;
    if (!grid) return;

    const cardsEl = grid.querySelectorAll(".memory-card-wrapper");

    // Stagger reveal entrance animation
    const revealTimeline = gsap.fromTo(cardsEl, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 82%",
          toggleActions: "play none none reverse",
        }
      }
    );

    return () => {
      revealTimeline.scrollTrigger?.kill();
      revealTimeline.kill();
    };
  }, []);

  const cards: MemoryCard[] = [
    {
      id: 1,
      date: "Sept 15, 2025",
      title: "She Crossed My Mind Again",
      description: "No reason, no occasion — her thought just arrived, quietly, like it always does. And I smiled without meaning to.",
      icon: <Coffee className="w-5 h-5 text-amber-400" />,
      accent: "rgba(251, 191, 36, 0.15)",
      videoUrl: "/videos/sapna-apna-chand.mp4",
    },
    {
      id: 2,
      date: "Oct 20, 2025",
      title: "The Sky Reminded Me Of Her",
      description: "The colors were too beautiful to witness alone. Everything beautiful always finds a way back to her.",
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      accent: "rgba(52, 211, 153, 0.15)",
      videoUrl: "/videos/heart-to-be-at-peace.mp4",
    },
    {
      id: 3,
      date: "Nov 12, 2025",
      title: "I Counted Stars, Thought Of Her",
      description: "The night was still, the world was quiet — but inside, her name kept echoing like a soft, endless song.",
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      accent: "rgba(251, 146, 60, 0.15)",
      videoUrl: "/videos/samndr-sa-ek-dil.mp4",
    },
    {
      id: 4,
      date: "Dec 25, 2025",
      title: "Cold Outside, Warm Because Of Her",
      description: "The cold had no chance — the thought of her wrapped around me like the warmest thing I have ever known.",
      icon: <Snowflake className="w-5 h-5 text-sky-400" />,
      accent: "rgba(56, 189, 248, 0.15)",
      videoUrl: "/videos/ohabbat-me-harke.mp4",
    },
    {
      id: 5,
      date: "Feb 14, 2026",
      title: "Even The Mess Made Me Think Of Her",
      description: "Everything fell apart a little — and the first thing I thought was, she would have laughed so beautifully at this.",
      icon: <Cake className="w-5 h-5 text-rose-400" />,
      accent: "rgba(251, 113, 133, 0.15)",
      videoUrl: "/videos/searched-for-you.mp4",
    },
    {
      id: 6,
      date: "April 05, 2026",
      title: "Silence That Felt Like Her",
      description: "No sound, no rush — just that gentle, familiar feeling that she was somehow still present in the quiet.",
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
      accent: "rgba(167, 139, 250, 0.15)",
      videoUrl: "/videos/adhoori-chahat.mp4",
    },
  ];

  // Auto flip card to 3D back after center animation completes
  const handleCardClick = (card: MemoryCard) => {
    setIsPlaying(false);
    setIsVideoActive(true);
    setActiveCard(card);
    setIsFlipped(false);
    setIsVideoReady(false);
    setVideoFadeOut(false);
    setIsMuted(false);
    
    // Slight delay before starting 3D flip to let card settle in center
    setTimeout(() => {
      setIsFlipped(true);
    }, 450);
  };

  const handleClose = () => {
    setVideoFadeOut(true);
    setIsVideoReady(false);
    setIsVideoActive(false);
    
    // Flip card back first
    setTimeout(() => {
      setIsFlipped(false);
    }, 200);

    // Close the overlay modal after flip animation finishes
    setTimeout(() => {
      setActiveCard(null);
    }, 850);
  };

  // Video ended callback
  useEffect(() => {
    if (isVideoReady && videoRef.current) {
      videoRef.current.volume = 1.0;
      videoRef.current.play().catch((err) => console.log("Autoplay failed:", err));
    }
  }, [isVideoReady]);
  return (
    <section id="journey" className="w-full py-32 bg-[#0A0A0C] border-t border-glass relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-glow/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-glow/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.3em] text-pink-glow font-sans font-semibold block mb-2">
            WRITTEN IN YOUR NAME
          </span>
          <CinematicText
            text="You Are Every Thought I Have"
            className="text-4xl md:text-5xl font-serif text-white tracking-tight text-glow"
          />
          <div className="w-16 h-[1px] bg-accent-gradient mx-auto mt-6 mb-4" />
        </div>

        {/* Cards Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8"
        >
          {cards.map((card) => (
            <div key={card.id} className="memory-card-wrapper opacity-0 h-full">
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                onClick={() => handleCardClick(card)}
                className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-glass border border-glass h-full transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group cursor-pointer"
              >
              {/* Highlight Background Glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 10% 10%, ${card.accent} 0%, transparent 60%)`,
                }}
              />

              {/* Hidden key floating above card */}
              {showKey && card.id === keyCardId && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollectKey(e);
                  }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-neutral-950/95 border border-amber-400 text-amber-300 z-30 cursor-pointer animate-float-slow flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.8)] hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
                  title="Golden Key"
                >
                  <Key className="w-5 h-5 text-amber-300" />
                </div>
              )}

              <div className="flex flex-col gap-3 sm:gap-4 relative z-10 h-full justify-between">
                <div>
                  {/* Icon & Date Header */}
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 shadow-inner">
                      {card.icon}
                    </div>
                    <span className="font-serif italic text-[10px] sm:text-xs text-text-secondary">
                      {card.date}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm sm:text-lg font-serif text-white tracking-wide mt-3 sm:mt-5 group-hover:text-pink-glow transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-sans text-text-secondary leading-relaxed mt-2 sm:mt-3">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 sm:pt-6 sm:mt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="font-sans text-[8px] sm:text-[9px] tracking-widest text-text-secondary uppercase">
                    THOUGHT 0{card.id}
                  </span>
                  <div className="flex items-center gap-1 px-3 py-1 bg-white/10 border border-pink-glow/30 text-white/90 rounded-[20px] font-medium text-[10px] tracking-wider transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.15)] group-hover:bg-gradient-to-br group-hover:from-accent-glow group-hover:to-pink-glow group-hover:border-pink-glow/60 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                    <span className="text-[8px] translate-y-[-0.5px]">▶</span>
                    <span>PLAY</span>
                  </div>
                </div>
              </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Immersive Fullscreen Card View Overlay */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4"
          >
            {/* Ambient surrounding glow in overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-pink-glow/5 rounded-full blur-[150px] pointer-events-none" />

            {/* Back to Grid / Exit Trigger overlay */}
            <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

            {/* 3D Flip Card Container */}
            <motion.div
              initial={{ scale: 0.82, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.82, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="relative w-full max-w-[340px] md:max-w-[420px] h-[500px] md:h-[580px] perspective-1000 z-10"
            >
              {/* Inner Card preserving 3D space */}
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                onAnimationComplete={() => {
                  if (isFlipped) setIsVideoReady(true);
                }}
                className="w-full h-full relative preserve-3d"
              >
                {/* 1. FRONT FACE (Grid Card detail scale-up) */}
                <div className="absolute inset-0 w-full h-full backface-hidden p-8 rounded-3xl bg-luxury-card border border-glass flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                        {activeCard.icon}
                      </div>
                      <span className="font-serif italic text-sm text-pink-glow">
                        {activeCard.date}
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif text-white tracking-wide mt-8">
                      {activeCard.title}
                    </h3>
                    
                    <p className="text-sm font-sans text-text-secondary leading-relaxed mt-4">
                      {activeCard.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="font-sans text-[10px] tracking-widest text-text-secondary uppercase">
                      THOUGHT 0{activeCard.id}
                    </span>
                    <span className="text-[10px] font-sans text-text-secondary uppercase tracking-widest animate-pulse">
                      Flipping open...
                    </span>
                  </div>
                </div>

                {/* 2. BACK FACE (Autoplaying romantic loop player) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-neutral-950 border border-glass rotate-y-180 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col justify-between p-4">
                  {/* Floating Action Header inside Video */}
                  <div className="flex justify-between items-center z-20 px-2 py-1">
                    <div className="flex flex-col">
                      <span className="font-serif italic text-[10px] text-pink-glow">
                        Memory Loop
                      </span>
                      <span className="text-xs font-serif text-white tracking-wide">
                        {activeCard.title}
                      </span>
                    </div>

                    {/* Audio Controls */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="p-2 rounded-full bg-black/40 border border-white/10 text-white hover:bg-black/70 transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Video Screen Container */}
                  <div className="absolute inset-0 w-full h-full bg-neutral-900 rounded-3xl overflow-hidden z-10">
                    <motion.div
                      animate={{ opacity: videoFadeOut ? 0 : 1 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full relative flex items-center justify-center"
                    >
                      {isVideoReady && (
                        <video
                          key={activeCard.videoUrl}
                          ref={videoRef}
                          src={activeCard.videoUrl}
                          autoPlay
                          playsInline
                          loop={false}
                          preload="auto"
                          muted={isMuted}
                          onEnded={handleClose}
                          className="block w-full h-full object-contain rounded-3xl"
                        />
                      )}
                    </motion.div>
                  </div>

                  {/* Video Loading Placeholder */}
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/80 z-20">
                      <div className="w-6 h-6 border-2 border-pink-glow/30 border-t-pink-glow rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Exit Close Button inside flipped card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="absolute bottom-6 right-6 p-3 rounded-full bg-black/55 hover:bg-black/85 text-white border border-white/10 z-20 hover:scale-105 active:scale-95 transition-all duration-300"
                    title="Close memory"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
