"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Music } from "lucide-react";
import { useSoundtrack } from "@/context/SoundtrackContext";

export default function FloatingAudioWidget() {
  const { activeTrack, isPlaying, togglePlay, setIsModalOpen } = useSoundtrack();

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking play button
    togglePlay();
  };

  return (
    <div
      onClick={() => setIsModalOpen(true)}
      className="relative bg-glass border border-glass p-1.5 pl-3.5 pr-3 rounded-full flex items-center gap-2.5 shadow-[0_4px_15px_rgba(0,0,0,0.5)] cursor-pointer hover:border-white/20 hover:scale-105 transition-all duration-300 select-none group"
    >
      {/* Dynamic Waveform or Rotating CD */}
      <div className="relative w-7 h-7 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="w-full h-full rounded-full bg-black flex items-center justify-center relative"
        >
          {/* Micro grooves */}
          <div className="absolute inset-1 rounded-full border border-neutral-800" />
          <div className="absolute inset-2 rounded-full border border-neutral-800" />
          <Music className="w-3 h-3 text-pink-glow" />
        </motion.div>
        
        {/* Play State Glow Ring */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full border border-pink-glow animate-ping opacity-25 pointer-events-none" />
        )}
      </div>

      {/* Song Info */}
      <div className="flex flex-col max-w-[100px] md:max-w-[130px] text-left pr-1 overflow-hidden">
        <span className="text-[10px] font-serif text-white truncate font-medium group-hover:text-pink-glow transition-colors">
          {activeTrack.title}
        </span>
        <span className="text-[7px] font-sans text-text-secondary uppercase tracking-widest truncate">
          {isPlaying ? "Playing" : "Paused"}
        </span>
      </div>

      {/* Control Button */}
      <button
        onClick={handlePlayToggle}
        className={`p-1.5 rounded-full border transition-all duration-300 ${
          isPlaying
            ? "bg-pink-glow/20 border-pink-glow/40 text-pink-glow hover:bg-pink-glow/30"
            : "bg-white/5 border-white/5 text-text-secondary hover:text-white hover:bg-white/10"
        }`}
        title={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <Pause className="w-2.5 h-2.5 fill-pink-glow" />
        ) : (
          <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
        )}
      </button>
    </div>
  );
}
