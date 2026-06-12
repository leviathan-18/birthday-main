"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Key } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicText from "./CinematicText";

interface TimeDiff {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface RelationshipCounterProps {
  showKey?: boolean;
  onCollectKey?: (e: React.MouseEvent) => void;
}

export default function RelationshipCounter({ showKey = false, onCollectKey = () => {} }: RelationshipCounterProps) {
  const [timeLeft, setTimeLeft] = useState<TimeDiff | null>(null);
  const [keyCardIdx, setKeyCardIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKeyCardIdx(Math.floor(Math.random() * 6));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(".counter-card");

    const t = gsap.fromTo(cards,
      { opacity: 0, scale: 0.85, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
          toggleActions: "play none none reverse",
        }
      }
    );

    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, [timeLeft]);

  useEffect(() => {
    const calculateTimeDiff = () => {
      const start = new Date("2020-12-17T00:00:00");
      const now = new Date();

      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      // Adjust days if date subtraction went negative
      if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }

      // Adjust months if month subtraction went negative
      if (months < 0) {
        months += 12;
        years--;
      }

      const diffMs = now.getTime() - start.getTime();
      const totalSeconds = Math.floor(diffMs / 1000);
      const seconds = totalSeconds % 60;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const hours = Math.floor(totalSeconds / 3600) % 24;

      return { years, months, days, hours, minutes, seconds };
    };

    // Initial run
    setTimeLeft(calculateTimeDiff());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeDiff());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  const counterUnits = [
    { label: "Years", value: timeLeft.years },
    { label: "Months", value: timeLeft.months },
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section ref={sectionRef} className="w-full py-32 bg-[#0A0A0C] border-t border-glass relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-glow/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-xl mx-auto flex flex-col items-center">
          <div className="inline-flex p-2.5 rounded-full bg-white/5 border border-white/5 mb-4 shadow-inner">
            <Heart className="w-4 h-4 text-pink-glow fill-pink-glow/20" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-pink-glow font-sans font-semibold block mb-2">
            Our Timeline
          </span>
          <CinematicText
            text="Ya-ruh-al-ruh"
            className="text-4xl md:text-5xl font-serif text-white tracking-tight text-glow"
          />
          <CinematicText
            text="You are in my heart, you shall be there forever. My Greatest wish is that you are happy when you think of me, I am when I think of you!  "
            className="text-sm font-sans text-text-secondary leading-relaxed mt-4"
          />
        </div>

        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {counterUnits.map((unit, idx) => (
            <motion.div
              key={unit.label}
              whileHover={{ scale: 1.03, borderColor: "rgba(236,72,153,0.25)" }}
              className="counter-card opacity-0 p-5 rounded-2xl bg-glass border border-glass flex flex-col items-center justify-center text-center shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
              {showKey && idx === keyCardIdx && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollectKey(e);
                  }}
                  className="absolute -top-1 right-2 w-7 h-7 rounded-full bg-neutral-950/95 border border-amber-400 text-amber-300 z-30 cursor-pointer animate-float-slow flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
                  title="Golden Key"
                >
                  <Key className="w-3.5 h-3.5 text-amber-300" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-tr from-accent-glow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Digit Value */}
              <span className="text-4xl md:text-5xl font-serif text-gradient font-bold tracking-tight text-glow select-none">
                {String(unit.value).padStart(2, "0")}
              </span>
              
              {/* Tag Label */}
              <span className="text-[10px] font-sans text-text-secondary uppercase tracking-[0.2em] mt-3 block">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <span className="font-serif italic text-xs text-text-secondary">
            &ldquo;It&rsquo;s officially been 9 years. To know the full story, unlock the box.&rdquo; ✨
          </span>
        </div>

      </div>
    </section>
  );
}
