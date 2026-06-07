"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  isUploaded?: boolean;
}

interface SoundtrackContextProps {
  trackList: Track[];
  activeTrack: Track;
  isPlaying: boolean;
  isModalOpen: boolean;
  isVideoActive: boolean;
  playTrack: (trackId: string) => void;
  togglePlay: () => void;
  uploadTrack: (file: File) => void;
  setIsModalOpen: (open: boolean) => void;
  pauseBackgroundAudio: () => void;
  resumeBackgroundAudio: () => void;
  setIsPlaying: (playing: boolean) => void;
  setIsVideoActive: (active: boolean) => void;
}

const defaultTracks: Track[] = [
  {
    id: "2",
    title: "Golden Brown x Love Story",
    artist: "Local Background",
    url: "/music/u_n18hhc2jts-golden-brown-x-love-story-519024.mp3",
  },
  {
    id: "1",
    title: "Leberch Love",
    artist: "Local Background",
    url: "/music/leberch-love-516820.mp3",
  },
];

const SoundtrackContext = createContext<SoundtrackContextProps | undefined>(undefined);

export function SoundtrackProvider({ children }: { children: React.ReactNode }) {
  const [trackList, setTrackList] = useState<Track[]>(defaultTracks);
  const [activeTrack, setActiveTrack] = useState<Track>(defaultTracks[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pausedAudioTimeRef = useRef(0);

  // Synchronize main audio state when track URL or play status changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Audio play failed:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [activeTrack.url, isPlaying]);

  // Main soundtrack audio cleanup on unmount

  const playTrack = (trackId: string) => {
    const track = trackList.find((t) => t.id === trackId);
    if (track) {
      setActiveTrack(track);
      setIsPlaying(true);
      setIsModalOpen(false); // Close selection panel automatically on select
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const uploadTrack = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const newTrack: Track = {
      id: `uploaded-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // Strip file extension
      artist: "Local Upload",
      url: objectUrl,
      isUploaded: true,
    };

    setTrackList((prev) => [...prev, newTrack]);
    setActiveTrack(newTrack);
    setIsPlaying(true);
    setIsModalOpen(false);
  };

  // Seek helper

  const pauseBackgroundAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    pausedAudioTimeRef.current = audio.currentTime;
    audio.pause();
  };

  const resumeBackgroundAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = pausedAudioTimeRef.current;
    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Audio resume failed:", err);
      });
    }
  };

  return (
    <SoundtrackContext.Provider
      value={{
        trackList,
        activeTrack,
        isPlaying,
        isModalOpen,
        isVideoActive,
        playTrack,
        togglePlay,
        uploadTrack,
        setIsModalOpen,
        pauseBackgroundAudio,
        resumeBackgroundAudio,
        setIsPlaying,
        setIsVideoActive,
      }}
    >
      {children}
      {/* HTML5 Audio tags rendered directly in DOM */}
      <audio 
        ref={audioRef} 
        src={activeTrack.url} 
        loop 
        autoPlay
        preload="auto"
        id="bg-soundtrack-audio"
      />
    </SoundtrackContext.Provider>
  );
}

export function useSoundtrack() {
  const context = useContext(SoundtrackContext);
  if (!context) {
    throw new Error("useSoundtrack must be used within a SoundtrackProvider");
  }
  return context;
}
