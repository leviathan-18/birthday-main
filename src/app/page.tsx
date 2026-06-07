"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroCanvas from "@/components/HeroCanvas";
import MemorySequence from "@/components/MemorySequence";
import Footer from "@/components/Footer";
import { SoundtrackProvider } from "@/context/SoundtrackContext";
import SoundtrackModal from "@/components/SoundtrackModal";
import IntroLoader from "@/components/IntroLoader";
import dynamic from "next/dynamic";
import LazyMount from "@/components/LazyMount";

// Dynamically import heavy and below-the-fold components
const MemoryGrid = dynamic(() => import("@/components/MemoryGrid"), { ssr: false });
const FavoriteThings = dynamic(() => import("@/components/FavoriteThings"), { ssr: false });
const RelationshipCounter = dynamic(() => import("@/components/RelationshipCounter"), { ssr: false });
const ConstellationReveal = dynamic(() => import("@/components/ConstellationReveal"), { ssr: false });
const WishJar = dynamic(() => import("@/components/WishJar"), { ssr: false });
const BirthdayCake = dynamic(() => import("@/components/BirthdayCake"), { ssr: false });
const FinalMessage = dynamic(() => import("@/components/FinalMessage"), { ssr: false });
const GiftBox = dynamic(() => import("@/components/GiftBox"), { ssr: false });
const EndingScene = dynamic(() => import("@/components/EndingScene"), { ssr: false });

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const [introStage, setIntroStage] = useState<'intro-silence' | 'intro-shooting' | 'intro-vortex' | 'intro-explode' | 'char-enter' | 'done'>('intro-silence');
  
  // Advanced Story Experience Upgrade States
  const [collectedKeys, setCollectedKeys] = useState<string[]>([]);
  const [keyLocations, setKeyLocations] = useState<string[]>([]);
  const [flyingKeys, setFlyingKeys] = useState<Array<{ id: string; startX: number; startY: number }>>([]);

  // Shuffled key placement locations selection
  useEffect(() => {
    const allLocations = [
      'memory-grid',
      'melodies',
      'constellation',
      'wish-jar',
      'birthday-cake',
      'relationship'
    ];
    const shuffled = [...allLocations].sort(() => Math.random() - 0.5);
    setKeyLocations(shuffled.slice(0, 3));
  }, []);

  // Web Audio chime synthesizer
  const playKeyChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playNote(523.25, now, 0.7);      // C5
      playNote(659.25, now + 0.12, 0.8); // E5
      playNote(783.99, now + 0.24, 1.0); // G5
      playNote(1046.50, now + 0.36, 1.3); // C6
    } catch (e) {
      console.error("Failed to play key chime:", e);
    }
  };

  const handleCollectKey = (keyId: string, event: React.MouseEvent) => {
    if (collectedKeys.includes(keyId)) return;
    
    playKeyChime();
    setFlyingKeys((prev) => [...prev, { id: keyId, startX: event.clientX, startY: event.clientY }]);
    setCollectedKeys((prev) => [...prev, keyId]);
  };

  return (
    <SoundtrackProvider>
      {showLoader ? (
        <IntroLoader onEnter={() => setShowLoader(false)} />
      ) : (
        <main className="relative min-h-screen bg-luxury-dark selection:bg-accent-glow/30 selection:text-white">
          {/* Immersive weather backgrounds */}
          <HeroCanvas introStage={introStage} />

          {/* Floating Translucent Header Navigation */}
          <Navbar />

          {/* Fullscreen Cinematic Scroll Storytelling (0% - 100% Scroll Progress) */}
          <MemorySequence 
            introStage={introStage} 
            setIntroStage={setIntroStage} 
          />

          {/* Grid of Shared Memories */}
          <LazyMount fallback={<section id="journey" className="w-full py-32 bg-[#0A0A0C] border-t border-glass relative min-h-[600px] md:min-h-[800px] flex items-center justify-center" />}>
            <MemoryGrid 
              showKey={keyLocations.includes('memory-grid') && !collectedKeys.includes('memory-grid')}
              onCollectKey={(e) => handleCollectKey('memory-grid', e)}
            />
          </LazyMount>

          {/* Curated Sensory Favorite Coordinates */}
          <LazyMount fallback={<section id="moments" className="w-full py-32 bg-[#050505] border-t border-glass relative min-h-[600px] md:min-h-[800px] flex items-center justify-center" />}>
            <FavoriteThings 
              showKey={keyLocations.includes('melodies') && !collectedKeys.includes('melodies')}
              onCollectKey={(e) => handleCollectKey('melodies', e)}
            />
          </LazyMount>

          {/* Live Relationship Counter */}
          <LazyMount fallback={<section className="w-full py-32 bg-[#0A0A0C] border-t border-glass relative min-h-[400px] md:min-h-[500px] flex items-center justify-center" />}>
            <RelationshipCounter 
              showKey={keyLocations.includes('relationship') && !collectedKeys.includes('relationship')}
              onCollectKey={(e) => handleCollectKey('relationship', e)}
            />
          </LazyMount>

          {/* Constellation Name Reveal */}
          <LazyMount fallback={<section className="relative w-full h-[150vh] bg-black select-none flex items-center justify-center" />}>
            <ConstellationReveal 
              showKey={keyLocations.includes('constellation') && !collectedKeys.includes('constellation')}
              onCollectKey={(e) => handleCollectKey('constellation', e)}
            />
          </LazyMount>

          {/* Interactive Wish Jar */}
          <LazyMount fallback={<section className="w-full min-h-screen py-24 bg-[#050507] border-t border-glass relative flex flex-col items-center justify-center" />}>
            <WishJar 
              showKey={keyLocations.includes('wish-jar') && !collectedKeys.includes('wish-jar')}
              onCollectKey={(e) => handleCollectKey('wish-jar', e)}
            />
          </LazyMount>

          {/* Birthday Cake Candle Blow */}
          <LazyMount fallback={<section id="journey-cake" className="w-full min-h-screen py-24 bg-[#030304] border-t border-glass relative flex flex-col items-center justify-center" />}>
            <BirthdayCake 
              showKey={keyLocations.includes('birthday-cake') && !collectedKeys.includes('birthday-cake')}
              onCollectKey={(e) => handleCollectKey('birthday-cake', e)}
            />
          </LazyMount>

          {/* Fullscreen Climax Emotional Wishes & Confetti Burst */}
          <FinalMessage />

          {/* Interactive Locked Gift Box (Second Last Section) */}
          <LazyMount fallback={<section id="gift-box" className="w-full py-28 bg-[#030304] border-t border-glass relative flex flex-col items-center justify-center min-h-[500px] md:min-h-[700px]" />}>
            <GiftBox 
              collectedKeysCount={collectedKeys.length} 
              onOpenSuccess={() => {}}
            />
          </LazyMount>

          {/* Final Starry Climax & Heartbeat Fade Out */}
          <EndingScene />

          {/* Minimal luxury credits */}
          <Footer />

          {/* Floating Key Collection Indicator */}
          {collectedKeys.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 p-3 px-4 rounded-full bg-neutral-950/80 border border-amber-500/30 text-amber-400 font-sans text-xs uppercase tracking-widest flex items-center gap-2.5 shadow-[0_0_20px_rgba(245,158,11,0.15)] backdrop-blur-md"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Key className="w-4 h-4 text-amber-300 fill-amber-300/10" />
              </motion.div>
              <span>{collectedKeys.length} / 3 Keys Found</span>
            </motion.div>
          )}

          {/* Flying Key Animation Particles */}
          <AnimatePresence>
            {flyingKeys.map((fk) => (
              <motion.div
                key={fk.id}
                initial={{ x: fk.startX, y: fk.startY, scale: 1.5, opacity: 1, rotate: 0 }}
                animate={{
                  x: 32, 
                  y: typeof window !== "undefined" ? window.innerHeight - 64 : 600, 
                  scale: 0.5,
                  opacity: [1, 1, 0.8, 0],
                  rotate: 360,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                onAnimationComplete={() => {
                  setFlyingKeys((prev) => prev.filter((k) => k.id !== fk.id));
                }}
                className="fixed z-[9999] pointer-events-none"
              >
                <div className="w-10 h-10 bg-accent-gradient rounded-full flex items-center justify-center border border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                  <Key className="w-5 h-5 text-amber-300" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 0.8 }}
                    animate={{
                      x: (Math.random() - 0.5) * 40,
                      y: (Math.random() - 0.5) * 40,
                      scale: 0.2,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.6, delay: i * 0.05, repeat: Infinity }}
                    className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-amber-400 blur-[1px]"
                  />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Playlist Modal */}
          <SoundtrackModal />
        </main>
      )}
    </SoundtrackProvider>
  );
}
