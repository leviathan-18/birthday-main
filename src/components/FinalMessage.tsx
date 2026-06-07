"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function FinalMessage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  // Trigger confetti burst
  const triggerConfetti = () => {
    const colors = ["#8B5CF6", "#EC4899", "#A78BFA", "#F472B6", "#ffffff"];

    confetti({
      particleCount: 80,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.8 },
      colors: colors,
    });

    confetti({
      particleCount: 80,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.8 },
      colors: colors,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: colors,
      });
    }, 250);
  };

  const handleViewportEnter = () => {
    if (!hasTriggeredRef.current) {
      triggerConfetti();
      hasTriggeredRef.current = true;
    }
  };

  return (
    <section
      id="wishes"
      ref={containerRef}
      className="relative w-full h-screen bg-[#0A0A0C] border-t border-glass overflow-hidden flex items-center justify-center"
    >
      {/* Background large heart-like radial glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] bg-pink-glow/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Centered content block */}
      <div className="relative w-full max-w-3xl mx-auto px-6 select-none flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onViewportEnter={handleViewportEnter}
          className="flex flex-col items-center gap-6"
        >
          {/* Decorative badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-pink-glow" />
            <span className="font-sans text-[10px] tracking-widest text-text-secondary uppercase">
              A Final Thought
            </span>
          </div>

          {/* Large cinematic ending headline */}
          <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-none text-glow">
            Thank you for existing.
          </h2>

          {/* Supporting quote moved from the second section */}
          <p className="text-base md:text-lg font-sans text-text-secondary max-w-xl leading-relaxed font-light mt-4">
            This world became softer, happier, and infinitely more beautiful with you in it. May this new year of your life be filled with peace, laughter, and endless stardust.
          </p>

          {/* Interactive sparks of joy button */}
          <div className="mt-6">
            <button
              onClick={triggerConfetti}
              className="px-8 py-3 rounded-full font-sans tracking-widest text-xs uppercase border border-[#D9C4A9]/40 bg-[#161517] bg-gradient-to-r from-[#161517] to-[#1E1C1F] text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.35)] hover:border-pink-glow/40 hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer"
            >
              Sparks of Joy ✨
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle Scroll Down Prompt - Perfectly Centered, Bold & Highly Visible */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.55 }}
        viewport={{ once: true }}
        animate={{ y: [0, 5, 0] }}
        transition={{ 
          opacity: { duration: 0.5 },
          y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-8 left-0 right-0 mx-auto w-max z-30 flex flex-col items-center gap-1.5 pointer-events-none select-none"
      >
        <span className="font-sans text-[9px] tracking-[0.25em] text-white uppercase font-bold">
          Scroll Down
        </span>
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
