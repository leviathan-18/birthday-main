"use client";

import { useRef, useState, useEffect } from "react";
import { useScroll, motion, useTransform } from "framer-motion";
import FloatingPhotos from "./FloatingPhotos";
import QuoteOverlay from "./QuoteOverlay";
import dynamic from "next/dynamic";

const PhysicsCanvas = dynamic(() => import("./PhysicsCanvas"), { ssr: false });

interface MemorySequenceProps {
  introStage: 'intro-silence' | 'intro-shooting' | 'intro-vortex' | 'intro-explode' | 'char-enter' | 'done';
  setIntroStage: React.Dispatch<React.SetStateAction<'intro-silence' | 'intro-shooting' | 'intro-vortex' | 'intro-explode' | 'char-enter' | 'done'>>;
  showKey?: boolean;
  onCollectKey?: (e: React.MouseEvent) => void;
}

export default function MemorySequence({ introStage, setIntroStage, showKey = false, onCollectKey = () => {} }: MemorySequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showPhysics, setShowPhysics] = useState(true);

  // Lock scrolling until intro finishes
  useEffect(() => {
    if (introStage !== 'done') {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [introStage]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Background glow opacities relative to scroll
  const glowOpacity1 = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.15, 0.05, 0.1, 0.05]);
  const glowOpacity2 = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.05, 0.15, 0.05, 0.15]);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      // Unmount the canvas animation if the user has scrolled past 95% of the main section
      if (latest >= 0.95) {
        setShowPhysics(false);
      } else {
        setShowPhysics(true);
      }
    });
  }, [scrollYProgress]);

  return (
    <div
      id="memories"
      ref={containerRef}
      className="relative w-full h-[500vh] bg-transparent"
    >
      {/* Sticky fullscreen content view with relative positioning containment */}
      <div className="relative sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Strictly confined physics layer */}
        {showPhysics && <PhysicsCanvas />}

        {/* Soft background glows moving on scroll */}
        <motion.div
          style={{ opacity: glowOpacity1 }}
          className="absolute -top-1/4 -left-1/4 w-[40vw] h-[40vh] md:w-[80vw] md:h-[80vh] bg-accent-glow rounded-full blur-[60px] md:blur-[150px] pointer-events-none"
        />
        <motion.div
          style={{ opacity: glowOpacity2 }}
          className="absolute -bottom-1/4 -right-1/4 w-[40vw] h-[40vh] md:w-[80vw] md:h-[80vh] bg-pink-glow rounded-full blur-[60px] md:blur-[150px] pointer-events-none"
        />

        {/* Floating Photos Scene */}
        <FloatingPhotos scrollYProgress={scrollYProgress} showKey={showKey} onCollectKey={onCollectKey} />

        {/* Cinematic Headline Overlay with integrated intro */}
        <QuoteOverlay 
          scrollYProgress={scrollYProgress} 
          introStage={introStage}
          setIntroStage={setIntroStage}
          introCompleted={introCompleted}
          onIntroComplete={() => {
            setIntroCompleted(true);
            setIntroStage('done');
          }}
        />
      </div>
    </div>
  );
}
