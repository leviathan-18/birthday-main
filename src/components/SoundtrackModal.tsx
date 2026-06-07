"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Upload, Music } from "lucide-react";
import { useSoundtrack } from "@/context/SoundtrackContext";

export default function SoundtrackModal() {
  const {
    trackList,
    activeTrack,
    isPlaying,
    isModalOpen,
    playTrack,
    togglePlay,
    uploadTrack,
    setIsModalOpen,
  } = useSoundtrack();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadTrack(files[0]);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4"
        >
          {/* Close on overlay click */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsModalOpen(false)} />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="w-full max-w-md p-6 md:p-8 rounded-3xl bg-glass border border-glass shadow-[0_30px_70px_rgba(0,0,0,0.85)] relative z-10 flex flex-col gap-6 overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-glow/5 blur-[70px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-pink-glow" />
                <h3 className="font-serif text-lg md:text-xl text-white tracking-wide">
                  Select Soundtrack
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 border border-white/5 text-text-secondary hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tracklist Container */}
            <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
              {trackList.map((track) => {
                const isActive = activeTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      if (isActive) {
                        togglePlay();
                      } else {
                        playTrack(track.id);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? "bg-gradient-to-r from-accent-glow/20 to-pink-glow/10 border-pink-glow/30 shadow-[0_4px_20px_rgba(139,92,246,0.15)]"
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0 pr-4">
                      <span
                        className={`text-sm font-serif truncate transition-colors duration-300 ${
                          isActive ? "text-white text-glow" : "text-white/80 group-hover:text-white"
                        }`}
                      >
                        {track.title}
                      </span>
                      <span className="text-[10px] font-sans text-text-secondary uppercase tracking-wider truncate">
                        {track.artist}
                      </span>
                    </div>

                    {/* Equalizer Bars or Play Icon */}
                    <div className="flex items-center justify-center">
                      {isActive && isPlaying ? (
                        <div className="flex items-end gap-[3px] h-3.5">
                          {[1, 2, 3].map((bar) => (
                            <motion.div
                              key={bar}
                              animate={{ height: ["4px", "14px", "4px"] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.8 + bar * 0.15,
                                ease: "easeInOut",
                              }}
                              className="w-[3px] bg-pink-glow rounded-full"
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          className={`p-2 rounded-full border transition-all duration-300 ${
                            isActive
                              ? "bg-pink-glow text-white border-pink-glow shadow-[0_0_10px_#EC4899]"
                              : "bg-white/5 text-text-secondary border-white/5 group-hover:text-white group-hover:bg-white/10"
                          }`}
                        >
                          {isActive && !isPlaying ? (
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload Button */}
            <div className="border-t border-white/10 pt-4 mt-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                className="w-full py-3 rounded-full font-sans tracking-widest text-xs uppercase bg-accent-gradient text-white flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(139,92,246,0.25)] hover:shadow-[0_15px_35px_rgba(139,92,246,0.45)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Soundtrack
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
