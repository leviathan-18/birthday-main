"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Mail, X, BookOpen, Sparkles } from "lucide-react";

interface GiftBoxProps {
  collectedKeysCount: number;
  onOpenSuccess: () => void;
}

interface Letter {
  id: string;
  title: string;
  date: string;
  content: string;
}

export default function GiftBox({ collectedKeysCount, onOpenSuccess }: GiftBoxProps) {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizError, setQuizError] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showRedGlow, setShowRedGlow] = useState(false);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const options = [
    { id: "A", text: "The Coffee Shop Laughs", isCorrect: true },
    { id: "B", text: "Chasing the Sunset", isCorrect: false },
    { id: "C", text: "Campfire Starry Nights", isCorrect: false },
    { id: "D", text: "Winter Walks & Warmth", isCorrect: false },
  ];

  const letters: Letter[] = [
    {
      id: "letter-1",
      title: "Midnight Reflections",
      date: "Nov 14, 2025",
      content: `Entry #12 • Midnight Reflections\n\nI think about the way you laugh when you are completely exhausted, the quiet way your presence settles the chaos in a room, and how you notice things in the world that everyone else rushes past.\n\nThere are so many words I write in my mind that never find their way to my lips. Some feelings are too delicate to be spoken aloud—they belong here, preserved in the quiet pages of a heart that holds onto you.`,
    },
    {
      id: "letter-2",
      title: "Pieces of You",
      date: "Dec 20, 2025",
      content: `Entry #15 • Pieces of You\n\nSometimes it's the smallest things. The way you stop to look at the sky when the clouds turn pink. The silent sanctuary you create just by listening. Your soft laughter that makes the entire room feel lighter.\n\nEvery memory with you is a tiny piece of a puzzle I didn't know I was trying to solve, and now that it's complete, I see a beautiful picture of us.`,
    },
    {
      id: "letter-3",
      title: "When My Heart Speaks",
      date: "Feb 14, 2026",
      content: `Entry #21 • When My Heart Speaks\n\nYou became the calm that I didn't know my soul was searching for. In a world full of temporary things, your connection is the only thing that feels permanent, warm, and true.\n\nIf my heart could speak, it would tell you that you are my favorite page in this long story.`,
    },
  ];

  const handleBoxClick = () => {
    if (collectedKeysCount < 3) {
      // Trigger vibration shake and red glow flash
      setIsShaking(true);
      setShowRedGlow(true);
      setTimeout(() => {
        setIsShaking(false);
        setShowRedGlow(false);
      }, 500);
      return;
    }

    if (!isOpened) {
      setIsQuizOpen(true);
    }
  };

  const handleQuizSubmit = () => {
    const selected = options.find((o) => o.id === selectedOption);
    if (selected?.isCorrect) {
      setIsQuizOpen(false);
      setIsOpened(true);
      onOpenSuccess();
      triggerSparkFountain();
    } else {
      setQuizError(true);
      setTimeout(() => setQuizError(false), 2000);
    }
  };

  // Spark Fountain canvas particle engine
  const triggerSparkFountain = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = canvas.parentElement?.clientHeight || 400;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }

    const particles: Particle[] = [];
    const colors = ["#FBBF24", "#EC4899", "#A78BFA", "#F472B6", "#FFFFFF"];

    const spawnParticles = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height - 40;
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy,
          vx: (Math.random() - 0.5) * 5,
          vy: -(Math.random() * 8 + 4),
          size: Math.random() * 3.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: Math.random() * 0.015 + 0.008,
        });
      }
    };

    let elapsedFrames = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsedFrames < 120) {
        spawnParticles();
      }

      elapsedFrames++;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.x < 0 || p.x > canvas.width || p.y > canvas.height) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        const safeR = Math.max(0.1, isFinite(p.size) ? p.size : 0.1);
        ctx.arc(p.x, p.y, safeR, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = canvas.width >= 768 ? p.size * 2 : 0;
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <section id="gift-box" className="w-full py-28 bg-[#030304] border-t border-glass relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-glow/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center gap-8 select-none w-full">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-sans text-[10px] tracking-widest text-text-secondary uppercase">
              Final Milestone
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight mt-1 text-glow">
            The Locked Gift Box
          </h2>
          <p className="text-xs md:text-sm font-sans text-text-secondary max-w-md leading-relaxed mt-1">
            {isOpened
              ? "The box has unlocked. Click any of the letters inside to read the private letters."
              : "Explore the website and find all 3 hidden keys. Once you have them, you can open the gift and reveal the surprise inside."}
          </p>
        </div>

        {/* Gift Box Display Area */}
        <div className="relative w-72 h-80 flex flex-col items-center justify-center">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />

          <motion.div
            animate={isShaking ? { 
              x: [-8, 8, -6, 6, -3, 3, 0],
              rotate: [-2, 2, -1.5, 1.5, -1, 1, 0]
            } : {}}
            transition={{ duration: 0.5 }}
            onClick={handleBoxClick}
            className={`relative z-10 transition-all duration-300 flex flex-col items-center gap-4 ${
              collectedKeysCount >= 3 
                ? "cursor-pointer hover:scale-105 active:scale-95" 
                : "cursor-pointer hover:scale-102"
            }`}
            style={{
              filter: showRedGlow ? "drop-shadow(0 0 25px rgba(239, 68, 68, 0.75))" : undefined
            }}
          >
            {/* SVG Gift box */}
            <svg viewBox="0 0 100 100" className="w-52 h-52 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
              <defs>
                <linearGradient id="gold-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#AA7C11" />
                </linearGradient>
              </defs>

              {/* Box shadow */}
              <ellipse cx="50" cy="85" rx="32" ry="6" fill="rgba(0,0,0,0.5)" />

              {/* Box Base */}
              <rect x="25" y="45" width="50" height="35" rx="4" fill="#580C1F" stroke="#3D000F" strokeWidth="1" />

              {/* Box Lid */}
              <motion.rect
                animate={isOpened ? { y: -20, opacity: 0 } : {}}
                transition={{ duration: 0.8 }}
                x="22"
                y="38"
                width="56"
                height="10"
                rx="2"
                fill="#7209B7"
                stroke="#3D000F"
                strokeWidth="1"
              />

              {/* Gold Ribbon Vertical */}
              <rect x="46" y="45" width="8" height="35" fill="url(#gold-ribbon)" />
              <motion.rect
                animate={isOpened ? { y: -20, opacity: 0 } : {}}
                transition={{ duration: 0.8 }}
                x="46"
                y="38"
                width="8"
                height="10"
                fill="url(#gold-ribbon)"
              />

              {/* Gold Ribbon Horizontal */}
              <rect x="25" y="60" width="50" height="5" fill="url(#gold-ribbon)" />

              {/* Ribbon Bow */}
              <motion.g
                animate={isOpened ? { y: -30, opacity: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <path d="M 50,38 C 45,30 35,32 46,38 Z" fill="url(#gold-ribbon)" stroke="#D4AF37" strokeWidth="0.5" />
                <path d="M 50,38 C 55,30 65,32 54,38 Z" fill="url(#gold-ribbon)" stroke="#D4AF37" strokeWidth="0.5" />
              </motion.g>

              {/* Lock status visual badge */}
              {!isOpened && (
                <g transform="translate(42, 53) scale(0.6)">
                  <rect x="5" y="10" width="16" height="12" rx="2" fill={collectedKeysCount >= 3 ? "#10B981" : "#EF4444"} />
                  <path
                    d={collectedKeysCount >= 3 ? "M 8,10 L 8,7 C 8,4.5 10,4.5 13,4.5 C 16,4.5 18,4.5 18,7" : "M 8,10 L 8,6 C 8,3.5 10,2.5 13,2.5 C 16,2.5 18,3.5 18,6 L 18,10"}
                    fill="none"
                    stroke={collectedKeysCount >= 3 ? "#10B981" : "#EF4444"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="13" cy="15" r="1.5" fill="#FFF" />
                </g>
              )}
            </svg>

            {/* Lock / Unlock State Instructions */}
            <div className="flex flex-col items-center">
              {isOpened ? (
                <span className="text-pink-glow text-xs uppercase tracking-widest font-sans flex items-center gap-1.5 font-bold">
                  <Unlock className="w-3.5 h-3.5" /> Box Opened!
                </span>
              ) : collectedKeysCount >= 3 ? (
                <span className="text-emerald-400 text-xs uppercase tracking-widest font-sans flex items-center gap-1.5 font-bold animate-pulse">
                  <Unlock className="w-3.5 h-3.5 animate-bounce" /> Click to Unlock Box
                </span>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-rose-500 text-xs uppercase tracking-widest font-sans flex items-center gap-1.5 font-semibold">
                    <Lock className="w-3.5 h-3.5" /> Locked ({collectedKeysCount}/3 Keys)
                  </span>
                  <span className="text-[9px] font-sans text-text-secondary tracking-widest uppercase">
                    Find the 3 hidden keys to unlock
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Opened Box Letters Reveal UI */}
        <AnimatePresence>
          {isOpened && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-8"
            >
              {letters.map((letter) => (
                <motion.div
                  key={letter.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => setActiveLetter(letter)}
                  className="p-6 rounded-2xl bg-white/5 border border-[#D9C4A9]/20 hover:border-amber-300/40 cursor-pointer flex flex-col items-center justify-between text-center gap-4 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-300/20 group-hover:border-amber-300/50 transition-all duration-300">
                    <Mail className="w-5 h-5 text-amber-300" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="font-serif text-white group-hover:text-amber-300 transition-colors duration-300 text-base">
                      {letter.title}
                    </h4>
                    <span className="text-[10px] text-text-secondary font-sans uppercase tracking-widest">
                      {letter.date}
                    </span>
                  </div>

                  <span className="text-[9px] font-sans uppercase tracking-widest text-amber-300/80 group-hover:text-amber-200 flex items-center gap-1">
                    <BookOpen className="w-3" /> Read Letter
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiz Modal Overlay */}
      <AnimatePresence>
        {isQuizOpen && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setIsQuizOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="relative max-w-md w-full p-8 rounded-3xl border border-glass bg-[#121114] shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col gap-6"
            >
              <button
                onClick={() => setIsQuizOpen(false)}
                className="absolute top-5 right-5 text-text-secondary hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-pink-glow/10 flex items-center justify-center border border-pink-glow/20">
                  <Sparkles className="w-5 h-5 text-pink-glow animate-pulse" />
                </div>
                <h3 className="font-serif text-xl text-white mt-2">One Last Question...</h3>
                <p className="text-xs text-text-secondary">Which memory started it all?</p>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`p-4 rounded-xl border text-left font-sans text-xs uppercase tracking-wider transition-all duration-300 ${
                      selectedOption === option.id
                        ? "bg-accent-gradient border-glass text-white shadow-[0_4px_15px_rgba(139,92,246,0.2)]"
                        : "bg-white/5 border-white/5 text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    <span className="font-bold mr-2 text-pink-glow">{option.id}.</span>
                    {option.text}
                  </button>
                ))}
              </div>

              {quizError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-rose-500 font-sans text-[10px] uppercase tracking-widest font-semibold"
                >
                  Not quite. Try again.
                </motion.div>
              )}

              <button
                onClick={handleQuizSubmit}
                disabled={!selectedOption}
                className="mt-2 w-full py-3 rounded-full bg-white/95 text-neutral-950 font-sans font-bold text-xs uppercase tracking-widest hover:bg-white active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
              >
                Submit Answer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fully Typewriter Styled Fullscreen Diary Reader Overlay */}
      <AnimatePresence>
        {activeLetter && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg">
            <div className="absolute inset-0" onClick={() => setActiveLetter(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
              transition={{ duration: 0.4 }}
              className="relative max-w-2xl w-full p-8 md:p-12 rounded-3xl border border-[#D9C4A9]/30 bg-[#161517] bg-gradient-to-tr from-[#161517] via-[#1E1C1F] to-[#161517] shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col gap-6"
            >
              <button
                onClick={() => setActiveLetter(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-text-secondary hover:text-white transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute inset-4 border border-[#D9C4A9]/10 rounded-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#D9C4A9]/10 pb-4 z-10">
                <span className="font-serif italic text-sm text-pink-glow">
                  {activeLetter.title}
                </span>
                <span className="font-sans text-[10px] tracking-widest text-[#D9C4A9] uppercase font-bold">
                  {activeLetter.date}
                </span>
              </div>

              {/* Letter content in Typewriter typewriter font layout */}
              <div className="font-serif italic text-base md:text-lg text-white/90 leading-relaxed whitespace-pre-wrap text-left z-10 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {activeLetter.content}
              </div>

              <div className="flex justify-end mt-4 items-center border-t border-[#D9C4A9]/10 pt-4 z-10">
                <span className="font-serif text-xs text-text-secondary italic">
                  Yours, always.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subtle Scroll Down Prompt */}
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
