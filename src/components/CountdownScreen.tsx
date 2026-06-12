"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownScreenProps {
  targetDate: Date;
  onComplete: () => void;
}

export default function CountdownScreen({ targetDate, onComplete }: CountdownScreenProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        onComplete();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initialize
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const formatNumber = (num: number) => {
    return String(num).padStart(2, "0");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 w-full h-full bg-[#050505] z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Background ambient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-glow/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative stars / dust in the background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center z-10 px-6 max-w-xl flex flex-col items-center gap-10"
      >
        {/* Heart Icon Pulsing */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full bg-pink-glow/10 border border-pink-glow/30 flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.15)]"
        >
          <span className="text-pink-glow text-xl">❤️</span>
        </motion.div>

        {/* Live Timer Grid */}
        <div className="flex items-center gap-4 md:gap-6 font-serif">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={item.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-bold bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent tracking-tight text-glow select-none">
                  {formatNumber(item.value)}
                </span>
                <span className="text-[10px] font-sans text-text-secondary uppercase tracking-[0.2em] mt-2 block font-semibold">
                  {item.label}
                </span>
              </div>
              {idx < 3 && (
                <span className="text-2xl md:text-4xl font-light text-white/20 ml-4 md:ml-6 self-start mt-2">
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Instruction Info */}
        <p className="font-serif italic text-sm md:text-base text-text-secondary/80 leading-relaxed tracking-wide mt-2">
          The website will open once the countdown reaches zero.
        </p>
      </motion.div>
    </motion.div>
  );
}
