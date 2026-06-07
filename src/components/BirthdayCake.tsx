"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicText from "./CinematicText";

interface CandleState {
  id: number;
  lit: boolean;
  x: number;
  y: number;
  height: number;
}

interface SparkParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'ember' | 'spark' | 'smoke' | 'wick-ember';
  angle?: number;
  speed?: number;
}

interface BirthdayCakeProps {
  showKey?: boolean;
  onCollectKey?: (e: React.MouseEvent) => void;
}

export default function BirthdayCake({ showKey = false, onCollectKey = () => {} }: BirthdayCakeProps) {
  const [candles, setCandles] = useState<CandleState[]>([
    { id: 0, lit: true, x: 70, y: 77, height: 40 },
    { id: 1, lit: true, x: 85, y: 74, height: 43 },
    { id: 2, lit: true, x: 100, y: 73, height: 45 },
    { id: 3, lit: true, x: 115, y: 74, height: 43 },
    { id: 4, lit: true, x: 130, y: 77, height: 40 },
  ]);

  const [micStatus, setMicStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [blowLevel, setBlowLevel] = useState(0);
  const [climaxTriggered, setClimaxTriggered] = useState(false);
  const [keyTransform, setKeyTransform] = useState("translate(156, 172) scale(0.075)");

  useEffect(() => {
    setKeyTransform(Math.random() < 0.5 ? "translate(32, 172) scale(0.075)" : "translate(156, 172) scale(0.075)");
  }, []);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const blowDurationRef = useRef<number>(0);
  const blowStartTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SparkParticle[]>([]);
  const candlesRef = useRef<CandleState[]>(candles);

  const sectionRef = useRef<HTMLDivElement>(null);
  const blowLevelRef = useRef(0);
  const isCakeVisibleRef = useRef(false);
  const particlesLoopRef = useRef<(() => void) | null>(null);
  const isParticlesLoopRunningRef = useRef(false);
  const micLoopRef = useRef<(() => void) | null>(null);
  const isMicLoopRunningRef = useRef(false);

  const cakeWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const cakeWrapper = cakeWrapperRef.current;
    if (!section || !cakeWrapper) return;

    const t = gsap.fromTo(cakeWrapper,
      { y: 25 },
      {
        y: -25,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      }
    );

    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, []);

  // Sync state to ref for canvas loop read
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      isCakeVisibleRef.current = visible;
      
      // Resume canvas loop if visible
      if (visible && !isParticlesLoopRunningRef.current && particlesLoopRef.current) {
        particlesLoopRef.current();
      }
      
      // Resume mic loop if visible, status is granted, and not climaxed
      if (visible && !isMicLoopRunningRef.current && micLoopRef.current && micStatus === 'granted' && !climaxTriggered) {
        isMicLoopRunningRef.current = true;
        micLoopRef.current();
      }
    }, { threshold: 0 });
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, [micStatus, climaxTriggered]);

  // Trigger luxury confetti explosion
  const triggerConfettiCelebration = () => {
    const colors = ["#8B5CF6", "#EC4899", "#A78BFA", "#F472B6", "#FFE082"];
    const defaults = { spread: 360, ticks: 100, gravity: 0.8, decay: 0.94, startVelocity: 30, colors };

    confetti({ ...defaults, particleCount: 140, scalar: 1.2, origin: { x: 0.5, y: 0.4 } });
    
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 80, scalar: 1, origin: { x: 0.3, y: 0.5 } });
    }, 200);

    setTimeout(() => {
      confetti({ ...defaults, particleCount: 80, scalar: 1, origin: { x: 0.7, y: 0.5 } });
    }, 400);
  };

  // Request Mic Access
  const activateMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      setMicStatus('granted');
      detectBlowing();
    } catch (err) {
      console.warn("Microphone access denied or failed:", err);
      setMicStatus('denied');
    }
  };

  // Detect blowing frequency & volume with high sensitivity
  const detectBlowing = () => {
    const analyser = analyserRef.current;
    const audioCtx = audioContextRef.current;
    if (!analyser || !audioCtx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkMic = () => {
      // Pause checking if offscreen
      if (!isCakeVisibleRef.current) {
        isMicLoopRunningRef.current = false;
        return;
      }
      isMicLoopRunningRef.current = true;

      analyser.getByteFrequencyData(dataArray);
      
      const sampleRate = audioCtx.sampleRate;
      const hzPerBin = sampleRate / analyser.fftSize;

      // Low frequency range (80hz - 300hz)
      const lowBinMin = Math.max(0, Math.floor(80 / hzPerBin));
      const lowBinMax = Math.min(dataArray.length - 1, Math.ceil(300 / hzPerBin));

      let lowSum = 0;
      for (let i = lowBinMin; i <= lowBinMax; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowBinMax - lowBinMin + 1);

      // Frequencies above 300Hz
      let highSum = 0;
      for (let i = lowBinMax + 1; i < dataArray.length; i++) {
        highSum += dataArray[i];
      }
      const highEnergy = highSum / (dataArray.length - lowBinMax - 1);

      // Blow detection conditions:
      // a) Volume (average low frequency amplitude) > 100 (out of 255)
      // b) Low frequency range (80hz-300hz) is dominant
      const hasVolume = lowEnergy > 100;
      const isLowDominant = lowEnergy > highEnergy * 1.5;
      const isValidFrame = hasVolume && isLowDominant;

      if (isValidFrame) {
        if (blowStartTimeRef.current === null) {
          blowStartTimeRef.current = Date.now();
        }
        
        const elapsed = Date.now() - blowStartTimeRef.current;
        if (elapsed >= 150) {
          // Map lowEnergy (100 to 255) to 0 to 100 blowLevel
          const blowStrength = ((lowEnergy - 100) / 155) * 100;
          const roundedBlow = Math.round(Math.min(Math.max(blowStrength * 1.5, 10), 100));
          setBlowLevel(roundedBlow);
          blowLevelRef.current = roundedBlow;

          blowDurationRef.current += 35;
          const interval = 130;
          const maxExtinguish = 5;

          setCandles(prev => {
            const next = prev.map(c => ({ ...c }));
            const litCandles = next.filter(c => c.lit);
            const currentBlownCount = 5 - litCandles.length;
            
            if (litCandles.length > 0) {
              const elapsedCandles = Math.floor(blowDurationRef.current / interval);
              if (elapsedCandles > currentBlownCount && elapsedCandles <= maxExtinguish) {
                const idxToBlow = next.findIndex(c => c.lit);
                if (idxToBlow !== -1) {
                  next[idxToBlow].lit = false;
                  spawnExtinguishBurst(next[idxToBlow]);
                }
              }
            }
            return next;
          });
        }
      } else {
        blowStartTimeRef.current = null;
        setBlowLevel(0);
        blowLevelRef.current = 0;
        blowDurationRef.current = Math.max(0, blowDurationRef.current - 12);
      }

      animationRef.current = requestAnimationFrame(checkMic);
    };

    micLoopRef.current = checkMic;
    isMicLoopRunningRef.current = true;
    checkMic();
  };

  // Spawn smoke and extra sparks when candle goes out
  const spawnExtinguishBurst = (c: CandleState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = canvas.width / 200;
    const scaleY = canvas.height / 200;
    const fx = c.x * scaleX;
    const fy = (c.y - c.height - 10) * scaleY;

    // Sparks
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1;
      particlesRef.current.push({
        id: Math.random(),
        x: fx,
        y: fy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: Math.random() * 2.5 + 1.2,
        color: "rgba(251, 191, 36,",
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        type: 'spark'
      });
    }

    // Smoke
    for (let i = 0; i < 12; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x: fx + (Math.random() - 0.5) * 6,
        y: fy,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 1.2 + 0.6),
        size: Math.random() * 6 + 4,
        color: "rgba(107, 114, 128,",
        alpha: 0.6,
        decay: Math.random() * 0.015 + 0.008,
        type: 'smoke'
      });
    }

    // Glow ember at the wick tip that slowly cools down
    particlesRef.current.push({
      id: Math.random(),
      x: fx,
      y: (c.y - c.height - 3) * scaleY,
      vx: 0,
      vy: 0,
      size: 2.5,
      color: "rgba(239, 68, 68,", // bright red
      alpha: 1.0,
      decay: 0.008, // decays in ~125 frames (2 seconds)
      type: 'wick-ember'
    });
  };

  // Canvas particle logic loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const isMobile = window.innerWidth < 768;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const updateParticles = () => {
      if (!isCakeVisibleRef.current) {
        isParticlesLoopRunningRef.current = false;
        return;
      }
      isParticlesLoopRunningRef.current = true;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const activeCandles = candlesRef.current;
      const scaleX = canvas.width / 200;
      const scaleY = canvas.height / 200;

      // 1. Spawning natural embers randomly near the bottom of the viewport
      if (Math.random() < (isMobile ? 0.08 : 0.25)) {
        particlesRef.current.push({
          id: Math.random(),
          x: Math.random() * canvas.width,
          y: canvas.height - 20,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(Math.random() * 0.8 + 0.5),
          size: Math.random() * 1.8 + 0.6,
          color: "rgba(251, 146, 60,", // orange
          alpha: Math.random() * 0.7 + 0.3,
          decay: Math.random() * 0.002 + 0.001,
          type: 'ember'
        });
      }

      // 2. Spawning active candle spark particles
      activeCandles.forEach(c => {
        if (c.lit && Math.random() < (isMobile ? 0.15 : 0.35)) {
          const fx = c.x * scaleX;
          const fy = (c.y - c.height - 10) * scaleY;

          // Wind push if blowing
          const wind = blowLevelRef.current > 10 ? (blowLevelRef.current / 100) * 3.5 : 0;

          particlesRef.current.push({
            id: Math.random(),
            x: fx + (Math.random() - 0.5) * 4,
            y: fy + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 0.8 + wind * 0.75, // push horizontally in blow direction
            vy: -(Math.random() * 0.8 + 0.2) - (blowLevelRef.current > 10 ? Math.random() * 0.5 : 0),
            size: Math.random() * 2 + 0.8,
            color: Math.random() < 0.6 ? "rgba(253, 224, 71," : "rgba(251, 191, 36,", // yellow/gold
            alpha: 0.9,
            decay: Math.random() * 0.02 + 0.015,
            type: 'spark'
          });
        }
      });

      // 3. Update & render particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) return false;

        // Custom behaviors per type
        if (p.type === 'ember') {
          // Drifts like real embers in waves
          p.vx += Math.sin(Date.now() * 0.003 + p.id) * 0.02;
        } else if (p.type === 'smoke') {
          // Smoke expands and drifts wavy
          p.size += 0.07;
          p.vx += Math.sin(Date.now() * 0.008 + p.id) * 0.03;
        } else if (p.type === 'wick-ember') {
          // Tip of the wick stays stationary
          p.vx = 0;
          p.vy = 0;
        }

        ctx.beginPath();
        if (p.type === 'spark') {
          const safeSize = Math.max(0.1, isFinite(p.size) ? p.size : 0.1);
          ctx.fillStyle = p.color + `${p.alpha})`;
          ctx.shadowBlur = isMobile ? 0 : safeSize * 2;
          ctx.shadowColor = "#FBBF24";
          ctx.arc(p.x, p.y, safeSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ember') {
          const safeSize = Math.max(0.1, isFinite(p.size) ? p.size : 0.1);
          ctx.fillStyle = p.color + `${p.alpha})`;
          ctx.shadowBlur = isMobile ? 0 : safeSize * 1.5;
          ctx.shadowColor = "#F97316";
          ctx.arc(p.x, p.y, safeSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'wick-ember') {
          // Thermodynamic cooling color mapping based on alpha decay
          let r = 239, g = 68, b = 68;
          let currentEmberSize = p.size;
          
          if (p.alpha > 0.6) {
            // Hot bright yellow-orange-red glow
            r = 251;
            g = Math.round(146 + (p.alpha - 0.6) * 272.5); // gold/yellow tint
            b = Math.round(60 * (1 - (p.alpha - 0.6) * 0.5));
            currentEmberSize = p.size * (0.85 + p.alpha * 0.3);
          } else if (p.alpha > 0.2) {
            // Cool down to deep crimson red
            r = Math.round(100 + (p.alpha - 0.2) * 347.5);
            g = Math.round(10 + (p.alpha - 0.2) * 145);
            b = Math.round(10 + (p.alpha - 0.2) * 125);
            currentEmberSize = p.size * (0.65 + p.alpha * 0.25);
          } else {
            // Fade into dark charcoal ash grey
            const scale = p.alpha / 0.2;
            r = Math.round(40 * scale);
            g = Math.round(40 * scale);
            b = Math.round(40 * scale);
            currentEmberSize = p.size * 0.55;
          }

          const safeSize = Math.max(0.1, isFinite(currentEmberSize) ? currentEmberSize : 0.1);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
          ctx.shadowBlur = isMobile ? 0 : safeSize * 3.5 * p.alpha;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
          ctx.arc(p.x, p.y, safeSize, 0, Math.PI * 2);
          ctx.fill();
        } else { // smoke
          const safeSize = Math.max(0.1, isFinite(p.size) ? p.size : 0.1);
          ctx.fillStyle = p.color + `${p.alpha})`;
          ctx.shadowBlur = 0;
          ctx.arc(p.x, p.y, safeSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.shadowBlur = 0; // reset
        return true;
      });

      animId = requestAnimationFrame(updateParticles);
    };

    particlesLoopRef.current = updateParticles;
    isParticlesLoopRunningRef.current = true;
    updateParticles();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      particlesLoopRef.current = null;
    };
  }, []);

  // Tap Fallback
  const handleCandleClick = (id: number) => {
    setCandles(prev =>
      prev.map(c => {
        if (c.id === id && c.lit) {
          const updated = { ...c, lit: false };
          spawnExtinguishBurst(updated);
          return updated;
        }
        return c;
      })
    );
  };

  // Monitor when all candles are blown out
  useEffect(() => {
    const litCount = candles.filter(c => c.lit).length;
    if (litCount === 0 && !climaxTriggered) {
      setClimaxTriggered(true);
      triggerConfettiCelebration();

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [candles, climaxTriggered]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <section 
      id="journey-cake"
      ref={sectionRef}
      className="w-full min-h-screen py-24 bg-[#030304] border-t border-glass relative flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-pink-glow/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-accent-glow/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      <div className="max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center gap-8 select-none">
        
        <AnimatePresence mode="wait">
          {!climaxTriggered ? (
            <motion.div
              key="blow-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
                <span className="font-sans text-[10px] tracking-widest text-text-secondary uppercase">
                  Make A Wish
                </span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <CinematicText
                  text="Blow Out The Candles"
                  className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-tight mt-1 text-glow"
                />
                <CinematicText
                  text="Activate your microphone and blow gently to extinguish the flames, or tap the candles directly to blow them out"
                  className="text-xs font-sans text-text-secondary max-w-sm leading-relaxed mt-1"
                />
              </div>

              <div className="flex flex-col items-center gap-3">
                {micStatus === 'idle' && (
                  <button
                    onClick={activateMicrophone}
                    className="px-6 py-3 rounded-full font-sans tracking-widest text-xs uppercase bg-accent-gradient text-white flex items-center gap-2.5 shadow-[0_10px_25px_rgba(139,92,246,0.3)] hover:shadow-[0_15px_35px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    Activate Microphone
                  </button>
                )}

                {micStatus === 'granted' && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans text-[10px] uppercase tracking-widest">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      Mic Listening... Blow Now!
                    </div>
                    <div className="w-36 h-[3px] bg-white/10 rounded-full overflow-hidden relative mt-1">
                      <motion.div
                        style={{ width: `${blowLevel}%` }}
                        className="h-full bg-gradient-to-r from-pink-glow to-yellow-300 shadow-[0_0_8px_#EC4899]"
                      />
                    </div>
                  </div>
                )}

                {micStatus === 'denied' && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-sans text-[10px] uppercase tracking-widest">
                    <MicOff className="w-3.5 h-3.5" />
                    Mic blocked &bull; Tap candles to blow out
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="wish-granted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-5 max-w-lg mt-6"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-300/15 border border-yellow-300/20 flex items-center justify-center relative">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
                <div className="absolute inset-0 rounded-full border border-yellow-300/30 animate-ping opacity-35" />
              </div>
              
              <CinematicText
                text="Wish Granted ✨"
                className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-none text-glow select-none mt-2"
              />
              
              <CinematicText
                text="
                Tum jis khwaab me aankhein kholo, uska roop amar.
                Tum jis rung ka kapda pehne uss mausam ka rung.
                Tum jis phool ko hass kr dekho, kabhi na woh murjhay.
                Tum jis harf pr ungli rakh do, woh roshan ho jaye!"
                className="text-base md:text-lg font-sans text-text-secondary leading-relaxed font-light mt-1 font-size 0.85rem"
              />
              
              <div className="w-16 h-[1.5px] bg-accent-gradient mt-4" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D-looking Luxury SVG Birthday Cake Plate & Container */}
        <div ref={cakeWrapperRef} className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] flex items-center justify-center mt-6">
          
          {/* Canvas Overlay for ember/spark particles */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
          />

          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] z-10">
            <defs>
              <linearGradient id="plate-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A3B18" />
                <stop offset="30%" stopColor="#F5D061" />
                <stop offset="50%" stopColor="#FFF2B2" />
                <stop offset="70%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#6E5620" />
              </linearGradient>
              <linearGradient id="plate-stand" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#B59410" />
                <stop offset="100%" stopColor="#302603" />
              </linearGradient>
              <linearGradient id="cake-shading" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
              </linearGradient>
              
              <linearGradient id="layer-bottom" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B091C" />
                <stop offset="50%" stopColor="#1C2147" />
                <stop offset="100%" stopColor="#070512" />
              </linearGradient>
              <linearGradient id="layer-mid" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22073D" />
                <stop offset="50%" stopColor="#551880" />
                <stop offset="100%" stopColor="#17032B" />
              </linearGradient>
              <linearGradient id="layer-top" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#430735" />
                <stop offset="50%" stopColor="#8A1869" />
                <stop offset="100%" stopColor="#25031E" />
              </linearGradient>

              <linearGradient id="cream-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FCE7F3" />
              </linearGradient>
              <linearGradient id="gold-deco" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C5A028" />
                <stop offset="50%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#9A700E" />
              </linearGradient>
              
              <linearGradient id="candle-pink" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#BE185D" />
              </linearGradient>
              <linearGradient id="candle-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>

              <linearGradient id="flame-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#FFFFFF" opacity="0.95" />
              </linearGradient>

              <filter id="cake-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Stand / Plate */}
            <ellipse cx="100" cy="180" rx="72" ry="10" fill="url(#plate-grad)" stroke="#D4AF37" strokeWidth="0.5" />
            <path d="M 40,180 L 40,186 C 40,192 160,192 160,186 L 160,180 Z" fill="url(#plate-stand)" />

            {/* Hidden key leaning on the cake plate */}
            {showKey && (
              <g
                onClick={(e) => {
                  e.stopPropagation();
                  onCollectKey(e);
                }}
                className="cursor-pointer animate-pulse pointer-events-auto shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                transform={keyTransform}
              >
                <circle cx="50" cy="50" r="40" fill="none" stroke="#FBBF24" strokeWidth="8" />
                <rect x="46" y="90" width="8" height="60" fill="#FBBF24" />
                <rect x="46" y="120" width="20" height="8" fill="#FBBF24" />
                <rect x="46" y="140" width="20" height="8" fill="#FBBF24" />
                <circle cx="50" cy="50" r="10" fill="#FBBF24" />
              </g>
            )}

            {/* 1. Cake Layer Bottom */}
            <path d="M 32,145 L 32,172 C 32,184 168,184 168,172 L 168,145 Z" fill="url(#layer-bottom)" />
            <ellipse cx="100" cy="145" rx="68" ry="12" fill="#202550" />
            <path d="M 32,145 L 32,172 C 32,184 168,184 168,172 L 168,145 Z" fill="url(#cake-shading)" />
            {/* Gold Deco Trim Bottom Layer */}
            <ellipse cx="100" cy="172" rx="67.5" ry="11.5" fill="none" stroke="url(#gold-deco)" strokeWidth="1.0" />
            <path d="M 32,145 Q 49,152 66,145 Q 83,152 100,145 Q 117,152 134,145 Q 151,152 168,145 L 168,149 C 168,157 32,157 32,149 Z" fill="#F472B6" opacity="0.65" />

            {/* 2. Cake Layer Middle */}
            <path d="M 46,110 L 46,137 C 46,147 154,147 154,137 L 154,110 Z" fill="url(#layer-mid)" />
            <ellipse cx="100" cy="110" rx="54" ry="10" fill="#4C1777" />
            <path d="M 46,110 L 46,137 C 46,147 154,147 154,137 L 154,110 Z" fill="url(#cake-shading)" />
            {/* Constellation gold stars on middle layer */}
            <polygon points="56,124 57,121 60,121 58,119 59,116 56,118 53,116 54,119 52,121 55,121" fill="url(#gold-deco)" />
            <polygon points="100,125 101,122 104,122 102,120 103,117 100,119 97,117 98,120 96,122 99,122" fill="url(#gold-deco)" />
            <polygon points="144,124 145,121 148,121 146,119 147,116 144,118 141,116 142,119 140,121 143,121" fill="url(#gold-deco)" />
            <ellipse cx="100" cy="137" rx="53.5" ry="9.5" fill="none" stroke="url(#gold-deco)" strokeWidth="0.8" strokeDasharray="3,3" />

            {/* 3. Cake Layer Top */}
            <path d="M 60,75 L 60,102 C 60,110 140,110 140,102 L 140,75 Z" fill="url(#layer-top)" />
            <ellipse cx="100" cy="75" rx="40" ry="8" fill="#701556" />
            <path d="M 60,75 L 60,102 C 60,110 140,110 140,102 L 140,75 Z" fill="url(#cake-shading)" />
            {/* Top Layer Cream Frosting Swirls */}
            <path d="M 60,75 Q 68,84 76,75 Q 84,84 92,75 Q 100,84 108,75 Q 116,84 124,75 Q 132,84 140,75 L 140,78 C 140,84 60,84 60,78 Z" fill="url(#cream-grad)" opacity="0.85" />
            {/* Gold Pearls around top rim */}
            <circle cx="65" cy="73" r="1.5" fill="url(#gold-deco)" />
            <circle cx="82.5" cy="70.5" r="1.5" fill="url(#gold-deco)" />
            <circle cx="100" cy="69.5" r="1.5" fill="url(#gold-deco)" />
            <circle cx="117.5" cy="70.5" r="1.5" fill="url(#gold-deco)" />
            <circle cx="135" cy="73" r="1.5" fill="url(#gold-deco)" />

            {/* 4. Taller Symmetrical Candles & Flickering Flames */}
            {candles.map(c => {
              // Flame wobble & wind push bends
              const blowFactor = blowLevel > 5 ? blowLevel / 100 : 0;
              const wobbleSpeed = 0.015 + blowFactor * 0.035;
              const wobbleAmpX = 0.6 + blowFactor * 3.8;
              const wobbleAmpY = 0.4 + blowFactor * 1.6;

              const wobbleX = Math.sin(Date.now() * wobbleSpeed + c.id * 10) * wobbleAmpX;
              const wobbleY = Math.cos(Date.now() * (wobbleSpeed + 0.005) + c.id * 5) * wobbleAmpY;
              
              // Wind push pushes the flame horizontally to the right
              const windOffset = blowLevel > 5 ? (blowLevel / 100) * 16 : 0;
              
              const peakX = c.x + wobbleX + windOffset;
              const peakY = c.y - c.height - 19.5 + wobbleY + (blowLevel > 5 ? (blowLevel / 100) * 5 : 0);

              const flamePath = `M ${c.x},${c.y - c.height - 4.5} 
                                 C ${c.x - 3.8 + windOffset * 0.3},${c.y - c.height - 10.5} 
                                   ${c.x - 2.8 + windOffset * 0.6},${c.y - c.height - 16.5} 
                                   ${peakX},${peakY} 
                                 C ${c.x + 2.8 + windOffset * 0.6},${c.y - c.height - 16.5} 
                                   ${c.x + 3.8 + windOffset * 0.3},${c.y - c.height - 10.5} 
                                   ${c.x},${c.y - c.height - 4.5} Z`;

              return (
                <g 
                  key={c.id} 
                  className="cursor-pointer pointer-events-auto" 
                  onClick={() => handleCandleClick(c.id)}
                >
                  {/* Warm Light Emission Halo behind flame */}
                  {c.lit && (
                    <ellipse
                      cx={c.x + windOffset * 0.5}
                      cy={c.y - c.height - 12 + wobbleY * 0.3}
                      rx={Math.max(4, 14 + Math.sin(Date.now() * 0.01 + c.id) * 1.2 - blowFactor * 6)}
                      ry={Math.max(4, 18 + Math.cos(Date.now() * 0.01 + c.id) * 1.2 - blowFactor * 8)}
                      fill="rgba(251, 146, 60, 0.18)"
                      filter="url(#cake-glow)"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Candle Stand Base */}
                  <ellipse 
                    cx={c.x} 
                    cy={c.y} 
                    rx="3.5" 
                    ry="1.0" 
                    fill="#0B091C" 
                    stroke="#FFE082" 
                    strokeWidth="0.3" 
                  />

                  {/* Candle Stick */}
                  <rect
                    x={c.x - 1.8}
                    y={c.y - c.height}
                    width="3.6"
                    height={c.height}
                    fill={c.id % 2 === 0 ? "url(#candle-pink)" : "url(#candle-purple)"}
                    rx="0.8"
                  />

                  {/* White Stripe Details */}
                  <path d={`M ${c.x - 1.8},${c.y - c.height + 6} L ${c.x + 1.8},${c.y - c.height + 9}`} stroke="#FFF" strokeWidth="0.8" opacity="0.85" />
                  <path d={`M ${c.x - 1.8},${c.y - c.height + 15} L ${c.x + 1.8},${c.y - c.height + 18}`} stroke="#FFF" strokeWidth="0.8" opacity="0.85" />
                  <path d={`M ${c.x - 1.8},${c.y - c.height + 24} L ${c.x + 1.8},${c.y - c.height + 27}`} stroke="#FFF" strokeWidth="0.8" opacity="0.85" />

                  {/* Wick */}
                  <line
                    x1={c.x}
                    y1={c.y - c.height}
                    x2={c.x}
                    y2={c.y - c.height - 5}
                    stroke="#111827"
                    strokeWidth="1.0"
                  />

                  {/* Animated Candle Flames */}
                  <AnimatePresence>
                    {c.lit && (
                      <motion.path
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [1, 0.92, 1, 0.88, 1], // flicker opacity
                          scale: micStatus === 'granted' && blowLevel > 5 
                            ? [1, 0.55 - blowFactor * 0.2, 1.1 - blowFactor * 0.3, 0.45, 1 - blowFactor * 0.2] 
                            : [1, 1.04, 0.96, 1],
                          rotate: micStatus === 'granted' && blowLevel > 5 
                            ? [0, -15 * blowFactor, 15 * blowFactor, -10 * blowFactor, 0] 
                            : [0, -2, 2, -2, 0],
                          y: micStatus === 'granted' && blowLevel > 5 ? -1.5 : 0
                        }}
                        exit={{ 
                          opacity: 0, 
                          scale: 0,
                          y: -18,
                          filter: "blur(4px)"
                        }}
                        transition={{
                          opacity: { repeat: Infinity, duration: 0.15 },
                          scale: { repeat: Infinity, duration: micStatus === 'granted' && blowLevel > 5 ? 0.08 : 0.6, ease: "easeInOut" },
                          rotate: { repeat: Infinity, duration: 0.25, ease: "easeInOut" }
                        }}
                        d={flamePath}
                        fill="url(#flame-gradient)"
                        filter="url(#cake-glow)"
                        style={{ originX: `${c.x}px`, originY: `${c.y - c.height - 4.5}px` }}
                      />
                    )}
                  </AnimatePresence>

                  {/* smoke tail */}
                  <AnimatePresence>
                    {!c.lit && (
                      <motion.path
                        initial={{ opacity: 0.6, scale: 0.4, y: 0 }}
                        animate={{ opacity: 0, scale: 1.6, y: -24, x: [0, -4, 4, -2] }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                        d={`M ${c.x},${c.y - c.height - 5} Q ${c.x - 3},${c.y - c.height - 12} ${c.x},${c.y - c.height - 20}`}
                        fill="none"
                        stroke="rgba(156, 163, 175, 0.45)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    )}
                  </AnimatePresence>
                </g>
              );
            })}
          </svg>
        </div>

      </div>
    </section>
  );
}
