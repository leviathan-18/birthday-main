"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import FloatingAudioWidget from "./FloatingAudioWidget";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-5 ${
        isScrolled
          ? "bg-glass border-glass border-b py-4 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Heart className="w-5 h-5 text-pink-glow fill-pink-glow/20 transition-transform duration-500 group-hover:scale-125" />
          <span className="font-serif tracking-widest text-lg font-semibold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            DEAREST
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: "Journey", id: "journey" },
            { label: "Moments", id: "moments" },
            { label: "Wishes", id: "wishes" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-sans tracking-widest text-text-secondary hover:text-white transition-colors duration-300 relative group py-1"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-pink-glow transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* Right: Sound Control Widget */}
        <div>
          <FloatingAudioWidget />
        </div>
      </div>
    </nav>
  );
}
