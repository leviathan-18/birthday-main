"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Film, Play } from "lucide-react";
import { useSoundtrack } from "@/context/SoundtrackContext";


import CountdownScreen from "./CountdownScreen";

interface IntroLoaderProps {
  onEnter: () => void;
  isCountdownActive?: boolean;
  targetDate: Date;
}

export default function IntroLoader({ onEnter, isCountdownActive = false, targetDate }: IntroLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdownFinished, setCountdownFinished] = useState(false);
  const { setIsPlaying } = useSoundtrack();

  // Simulated Loading timeline
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setIsLoaded(true);
          return 100;
        }
        const diff = Math.random() * 8 + 4; // Organic loading speeds
        return Math.min(oldProgress + diff, 100);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    // Start background music globally (autoplay workaround)
    setIsPlaying(true);
    onEnter();
  };

  const backgroundImages = [
    "/images/memory_laugh.png",
    "/images/memory_adventure.png",
    "/images/memory_cozy.png",
    "/images/memory_starry.png",
    "/images/memory_celebrate.jpg",
  ];

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-50 flex items-center justify-center overflow-hidden">
      {/* 1. Cinematic Film Grain Overlay (via SVG Filter) */}
      <svg className="absolute w-0 h-0 hidden" aria-hidden="true">
        <filter id="loader-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.12 0" />
        </filter>
      </svg>
      <div 
        className="absolute inset-0 pointer-events-none z-30 opacity-70 bg-transparent mix-blend-overlay"
        style={{ filter: "url(#loader-grain)" }}
      />

      {/* 2. Floating Blurry Memory Outlines in Background */}
      <div 
        className="absolute inset-0 w-full h-full -z-10 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: 0.25 }}
      >
        {backgroundImages.map((src, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{
              opacity: [0, 0.45, 0],
              scale: [1.15, 1.05, 1.15],
              x: [Math.random() * 50 - 25, Math.random() * 50 - 25],
              y: [Math.random() * 50 - 25, Math.random() * 50 - 25]
            }}
            transition={{
              duration: 9,
              delay: idx * 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-[280px] h-[380px] md:w-[380px] md:h-[480px] rounded-3xl overflow-hidden blur-[45px]"
            style={{
              top: `${10 + (idx * 16) % 70}%`,
              left: `${8 + (idx * 22) % 80}%`,
            }}
          >
            <Image
              src={src}
              alt="Blur backdrop"
              fill
              sizes="(max-width: 768px) 280px, 380px"
              priority={idx === 0}
              className="object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* 3. Vignette Border Frame */}
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]" />

      {/* 4. Center Storyboards */}
      <div className="relative z-10 max-w-md px-6 text-center flex flex-col items-center gap-6 select-none">
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              <span className="font-serif italic text-2xl md:text-3xl text-white/90 tracking-wide text-glow">
                Loading our memories...
              </span>
              
              {/* Progress bar container */}
              <div className="w-48 md:w-56 h-[1px] bg-white/10 rounded-full overflow-hidden relative mt-4">
                <motion.div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-accent-gradient shadow-[0_0_8px_#EC4899]"
                />
              </div>

              <span className="font-sans text-[9px] tracking-[0.25em] text-text-secondary uppercase">
                {Math.round(progress)}% Complete
              </span>
            </motion.div>
          ) : isCountdownActive && !countdownFinished ? (
            <CountdownScreen
              key="countdown"
              targetDate={targetDate}
              onComplete={() => setCountdownFinished(true)}
            />
          ) : (
            <motion.div
              key="enter"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 shadow-inner">
                <Film className="w-3.5 h-3.5 text-pink-glow animate-pulse" />
                <span className="font-sans text-[9px] tracking-widest text-text-secondary uppercase">
                  Made with Love
                </span>
              </div>
              
              <p style={{ direction: "rtl", textAlign: "center" }} className="font-serif text-5xl md:text-6xl text-white tracking-wide">
                أنتِ قلبي يا فرحين
              </p>
              
              <p className="text-xs font-sans text-text-secondary leading-relaxed max-w-xs">
                Tap on my heart to see my feelings, and this button, to see my website
              </p>

              <button
                onClick={handleEnter}
                className="mt-4 px-7 py-3 rounded-full font-sans tracking-widest text-xs uppercase bg-accent-gradient text-white flex items-center gap-2 shadow-[0_10px_25px_rgba(139,92,246,0.3)] hover:shadow-[0_15px_35px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 group"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Open with Love
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  );
}
