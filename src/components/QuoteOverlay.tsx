"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, MotionValue, useTransform, AnimatePresence } from "framer-motion";

interface QuoteOverlayProps {
  scrollYProgress: MotionValue<number>;
  introStage: 'intro-silence' | 'intro-shooting' | 'intro-vortex' | 'intro-explode' | 'char-enter' | 'done';
  setIntroStage: React.Dispatch<React.SetStateAction<'intro-silence' | 'intro-shooting' | 'intro-vortex' | 'intro-explode' | 'char-enter' | 'done'>>;
  introCompleted: boolean;
  onIntroComplete: () => void;
}

interface HeroParticle {
  id: number;
  type: 'ambient' | 'sparkle' | 'fiber' | 'dissolve';
  x: number; // relative to canvas center
  y: number; // relative to canvas center
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation?: number;
  rotSpeed?: number;
  decay: number;
}

// Letter Materialization Sub-component
const MaterializingLetter = ({ char, delay, active }: { char: string; delay: number; active: boolean }) => {
  const [formed, setFormed] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      setFormed(true);
    }, delay + 1000); // 1.0s for particles to converge
    return () => clearTimeout(t);
  }, [delay, active]);

  // Convg attraction particles
  const particleCount = 4;
  const particleOffsets = useRef(
    new Array(particleCount).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      scale: Math.random() * 0.6 + 0.4,
      delay: Math.random() * 0.15
    }))
  );

  return (
    <span className="relative inline-block">
      {/* Attraction Particles converging */}
      {active && !formed && (
        <>
          {particleOffsets.current.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
              animate={{ x: 0, y: 0, opacity: [0, 0.75, 0.75, 0], scale: [0, p.scale, p.scale, 0] }}
              transition={{
                duration: 1.0,
                delay: (delay / 1000) + p.delay,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-pink-glow rounded-full blur-[1px] pointer-events-none"
              style={{ top: "35%", left: "35%" }}
            />
          ))}
        </>
      )}

      {/* The Letter */}
      <motion.span
        initial={{ opacity: 0, filter: "blur(12px)", scale: 0.9 }}
        animate={(active && formed) ? { opacity: 1, filter: "blur(0px)", scale: 1 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="inline-block"
      >
        {char}
      </motion.span>
    </span>
  );
};

// Paper Segment Reveal Sub-component
const PaperNameSegment = ({ char, isTorn }: { char: string; isTorn: boolean }) => {
  return (
    <div className="relative w-11 sm:w-15 h-24 flex items-center justify-center overflow-visible">
      {/* Covered/Textured Paper Layers */}
      <AnimatePresence>
        {!isTorn && (
          <>
            {/* Top Paper Half */}
            <motion.div
              key="top"
              exit={{
                y: -65,
                rotate: -15,
                opacity: 0,
                filter: "blur(2px)"
              }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute inset-x-0.5 top-2 h-[41%] bg-[#FDFBF7] border-t border-x border-stone-300/40 rounded-t-md shadow-[0_2px_4px_rgba(0,0,0,0.12)] z-20 flex items-end justify-center select-none"
              style={{
                backgroundImage: "radial-gradient(rgba(139,92,246,0.02) 1px, transparent 0)",
                backgroundSize: "3px 3px",
                originX: 0,
                originY: 1
              }}
            >
              {/* Jagged bottom edge */}
              <div 
                className="w-full h-2.5 bg-[#FDFBF7] absolute -bottom-1"
                style={{
                  clipPath: "polygon(0% 0%, 15% 100%, 30% 0%, 50% 100%, 70% 0%, 85% 100%, 100% 0%)"
                }}
              />
            </motion.div>

            {/* Bottom Paper Half */}
            <motion.div
              key="bottom"
              exit={{
                y: 65,
                rotate: 15,
                opacity: 0,
                filter: "blur(2px)"
              }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute inset-x-0.5 bottom-2 h-[41%] bg-[#FDFBF7] border-b border-x border-stone-300/40 rounded-b-md shadow-[0_-2px_4px_rgba(0,0,0,0.12)] z-20 flex items-start justify-center select-none"
              style={{
                backgroundImage: "radial-gradient(rgba(139,92,246,0.02) 1px, transparent 0)",
                backgroundSize: "3px 3px",
                originX: 0,
                originY: 0
              }}
            >
              {/* Jagged top edge */}
              <div 
                className="w-full h-2.5 bg-[#FDFBF7] absolute -top-1"
                style={{
                  clipPath: "polygon(0% 100%, 15% 0%, 30% 100%, 50% 0%, 70% 100%, 85% 0%, 100% 100%)"
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Underneath Letter */}
      <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        animate={isTorn ? { opacity: 1, scale: [0.85, 1.2, 1] } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="font-serif italic text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white via-pink-100 to-purple-200 bg-clip-text text-transparent text-glow z-10 select-none"
      >
        {char}
      </motion.span>
    </div>
  );
};

const nameChars = ["F", "A", "R", "H", "E", "E", "N"];

export default function QuoteOverlay({ 
  scrollYProgress, 
  introStage,
  setIntroStage,
  introCompleted, 
  onIntroComplete 
}: QuoteOverlayProps) {
  // Hero Screen exit animations (0% - 20% scroll progress)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.10, 0.15, 0.20], [1, 1, 0.7, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.10, 0.15, 0.20], [1, 1, 0.98, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.10, 0.15, 0.20], [0, 0, -30, -120]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.10, 0.15, 0.20], ["blur(0px)", "blur(0px)", "blur(5px)", "blur(20px)"]);
  const heroPointerEvents = useTransform(scrollYProgress, [0, 0.19, 0.20], ["auto", "auto", "none"]);
  const heroZIndex = useTransform(scrollYProgress, [0, 0.19, 0.20], [20, 20, -10]);

  const [isHeroHidden, setIsHeroHidden] = useState(false);
  const isHeroHiddenRef = useRef(false);
  const animateRef = useRef<(() => void) | null>(null);
  const isLoopRunningRef = useRef(true);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const hidden = latest >= 0.20;
      setIsHeroHidden(hidden);
      const wasHidden = isHeroHiddenRef.current;
      isHeroHiddenRef.current = hidden;
      
      // Resume loop if it was stopped and we are visible again
      if (wasHidden && !hidden && animateRef.current) {
        animateRef.current();
      }
    });
  }, [scrollYProgress]);

  // Storytelling Beats (25%+ scroll progress)
  // Beat 1 (25% - 44%) - Visible with Photos 1 & 2
  const beat1Opacity = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], [0, 1, 1, 0]);
  const beat1Y = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], [40, 0, 0, -40]);

  // Beat 2 (48% - 59%) - Visible during first half of Photos 3 & 4
  const beat2Opacity = useTransform(scrollYProgress, [0.48, 0.52, 0.55, 0.59], [0, 1, 1, 0]);
  const beat2Y = useTransform(scrollYProgress, [0.48, 0.52, 0.55, 0.59], [40, 0, 0, -40]);

  // Beat 3 (59% - 72%) - Visible during second half of Photos 3 & 4
  const beat3Opacity = useTransform(scrollYProgress, [0.59, 0.63, 0.68, 0.72], [0, 1, 1, 0]);
  const beat3Y = useTransform(scrollYProgress, [0.59, 0.63, 0.68, 0.72], [40, 0, 0, -40]);

  // Beat 4 (76% - 88%) - Visible during first half of Photo 5
  const beat4Opacity = useTransform(scrollYProgress, [0.76, 0.80, 0.84, 0.88], [0, 1, 1, 0]);
  const beat4Y = useTransform(scrollYProgress, [0.76, 0.80, 0.84, 0.88], [40, 0, 0, -40]);

  // Beat 5 (90% - 100%) - Visible at final scroll bottom
  const beat5Opacity = useTransform(scrollYProgress, [0.90, 0.94, 1.0, 1.0], [0, 1, 1, 1]);
  const beat5Y = useTransform(scrollYProgress, [0.90, 0.94, 1.0], [40, 0, 0]);

  const beats = [
    {
      opacity: beat1Opacity,
      y: beat1Y,
      title: "Happy Birthday",
      text: "Some people make life brighter simply by existing.",
    },
    {
      opacity: beat2Opacity,
      y: beat2Y,
      title: "I have faith in what I see, now I know I have met an angel in person, she looks perfect.",
    },
    {
      opacity: beat3Opacity,
      y: beat3Y,
      title: "You became a beautiful part of life.",
    },
    {
      opacity: beat4Opacity,
      y: beat4Y,
      title: "May the universe give you back all the love and light you give to everyone else.",
    },
    {
      opacity: beat5Opacity,
      y: beat5Y,
      title: "May this year bring endless happiness ✨",
      text: "You deserve peace, love, success, beautiful memories, and countless reasons to smile.",
      isFinal: true,
    },
  ];

  // Character Stages Timeline
  const [stage, setStage] = useState<'intro-silence' | 'intro-shooting' | 'intro-vortex' | 'intro-explode' | 'char-enter' | 'char-notice-viewer' | 'char-notice-paper' | 'char-tear' | 'char-admire' | 'char-exit' | 'done'>('intro-silence');
  const [tornSegments, setTornSegments] = useState<boolean[]>(new Array(7).fill(false));
  const [shimmerActive, setShimmerActive] = useState(false);
  const [blink, setBlink] = useState(false);
  const [bloomActive, setBloomActive] = useState(false);

  // Random blink interval
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 3000 + 2000);
    return () => clearInterval(interval);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<HeroParticle[]>([]);
  const tearTimeRef = useRef<number>(0);

  const spawnExplosionBurst = () => {
    const plist = particlesRef.current;
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 35 : 180;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 6.5; // High speed outward
      plist.push({
        id: Math.random(),
        type: 'sparkle',
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.8 + 1.2,
        color: i % 2 === 0 ? "rgba(167, 139, 250," : "rgba(236, 72, 153,",
        alpha: 1.0,
        decay: Math.random() * 0.016 + 0.012
      });
    }
  };

  // Timeline coordinator
  useEffect(() => {
    let t: NodeJS.Timeout;

    if (introCompleted) {
      setTornSegments(new Array(7).fill(true));
      setStage('done');
      return;
    }

    if (introStage === 'intro-silence') {
      t = setTimeout(() => setIntroStage('intro-shooting'), 1800);
    } else if (introStage === 'intro-shooting') {
      t = setTimeout(() => setIntroStage('intro-vortex'), 1500);
    } else if (introStage === 'intro-vortex') {
      t = setTimeout(() => setIntroStage('intro-explode'), 2000);
    } else if (introStage === 'intro-explode') {
      // Explode! Trigger blast and shimmer
      spawnExplosionBurst();
      setShimmerActive(true);
      setBloomActive(true);
      setTimeout(() => setBloomActive(false), 800);

      // Play/unmute background music
      const globalAudio = document.getElementById("bg-soundtrack-audio") as HTMLAudioElement | null;
      if (globalAudio) {
        globalAudio.volume = 1.0;
        globalAudio.play().catch(e => console.log("Soundtrack play blocked:", e));
      }

      t = setTimeout(() => {
        setIntroStage('char-enter');
        setStage('char-enter');
      }, 1000);
    } else if (stage === 'char-enter') {
      t = setTimeout(() => setStage('char-notice-viewer'), 2200);
    } else if (stage === 'char-notice-viewer') {
      t = setTimeout(() => setStage('char-notice-paper'), 2500);
    } else if (stage === 'char-notice-paper') {
      t = setTimeout(() => setStage('char-tear'), 1500);
    } else if (stage === 'char-tear') {
      tearTimeRef.current = Date.now();

      // progressive segment tearing timeouts (matched to character's walking coordinate)
      const timeoutList = nameChars.map((_, idx) => {
        return setTimeout(() => {
          setTornSegments(prev => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
          spawnTearEffects(idx);
          setBloomActive(true);
          setTimeout(() => setBloomActive(false), 250); // Light leak flash bloom!
        }, 200 + idx * 500);
      });

      // Final Bloom flash when fully torn
      const tBloom = setTimeout(() => {
        setBloomActive(true);
        setTimeout(() => setBloomActive(false), 1200);
      }, 3400);

      t = setTimeout(() => setStage('char-admire'), 4000);

      return () => {
        clearTimeout(t);
        clearTimeout(tBloom);
        timeoutList.forEach(clearTimeout);
      };
    } else if (stage === 'char-admire') {
      t = setTimeout(() => {
        spawnDissolveEffects();
        setStage('char-exit');
      }, 2300);
    } else if (stage === 'char-exit') {
      t = setTimeout(() => setStage('done'), 1500);
    } else if (stage === 'done') {
      onIntroComplete();
    }

    return () => clearTimeout(t);
  }, [stage, introStage, introCompleted, onIntroComplete, setIntroStage]);

  // Sparkle, Fiber & Dissolve particle physics engine on Canvas (60fps optimized)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initial ambient particles
    for (let i = 0; i < 35; i++) {
      particlesRef.current.push({
        id: Math.random(),
        type: 'ambient',
        x: (Math.random() - 0.5) * window.innerWidth,
        y: (Math.random() - 0.5) * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.4 + 0.15),
        size: Math.random() * 2 + 0.8,
        color: "rgba(255, 255, 255,",
        alpha: Math.random() * 0.5 + 0.1,
        decay: Math.random() * 0.001 + 0.0003
      });
    }

    // Spawn 120 gathering particles that zoom into center to form the text
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 260 + Math.random() * 320;
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;
      
      // Converges in about 50 frames (1 second)
      const vx = -startX / (42 + Math.random() * 15);
      const vy = -startY / (42 + Math.random() * 15);

      particlesRef.current.push({
        id: Math.random(),
        type: 'sparkle',
        x: startX,
        y: startY,
        vx,
        vy,
        size: Math.random() * 2.6 + 1.2,
        color: i % 2 === 0 ? "rgba(167, 139, 250," : "rgba(236, 72, 153,",
        alpha: 0.9,
        decay: 0.006 // slow decay
      });
    }

    const animate = () => {
      if (!canvas || !ctx) return;

      if (isHeroHiddenRef.current) {
        isLoopRunningRef.current = false;
        return;
      }

      isLoopRunningRef.current = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Update & Draw Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.type === 'fiber' && p.rotation !== undefined && p.rotSpeed !== undefined) {
          p.rotation += p.rotSpeed;
        }

        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.beginPath();
        
        const dx = cx + p.x;
        const dy = cy + p.y;

        if (p.type === 'fiber') {
          // Rotating paper bits
          ctx.translate(dx, dy);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = `rgba(247, 243, 235, ${p.alpha})`;
          ctx.fillRect(-p.size, -p.size * 1.5, p.size * 2, p.size * 3);
        } else if (p.type === 'sparkle') {
          // Magical stars
          ctx.translate(dx, dy);
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.alpha})`);
          ctx.shadowColor = "#8B5CF6";
          const safeSize = Math.max(0.1, isFinite(p.size) ? p.size : 0.1);
          if (canvas.width >= 768) {
            ctx.shadowBlur = safeSize * 2.5;
          }
          ctx.arc(0, 0, safeSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Dust (ambient / dissolve)
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.alpha})`);
          const safeSize = Math.max(0.1, isFinite(p.size) ? p.size : 0.1);
          if (p.type === 'dissolve') {
            ctx.shadowColor = "#EC4899";
            if (canvas.width >= 768) {
              ctx.shadowBlur = safeSize * 2;
            }
          }
          ctx.arc(dx, dy, safeSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      // Maintain ambient particles
      const ambientCount = particlesRef.current.filter(p => p.type === 'ambient').length;
      if (ambientCount < 35 && Math.random() < 0.15) {
        particlesRef.current.push({
          id: Math.random(),
          type: 'ambient',
          x: (Math.random() - 0.5) * canvas.width,
          y: (Math.random() - 0.5) * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -(Math.random() * 0.4 + 0.15),
          size: Math.random() * 2 + 0.8,
          color: "rgba(255, 255, 255,",
          alpha: Math.random() * 0.5 + 0.1,
          decay: Math.random() * 0.001 + 0.0003
        });
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animateRef.current = animate;
    isLoopRunningRef.current = true;
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animFrameId);
      animateRef.current = null;
    };
  }, []);

  // Tearing particles trail following magic wand
  useEffect(() => {
    if (stage === 'char-tear') {
      const interval = setInterval(() => {
        const elapsed = Date.now() - tearTimeRef.current;
        const pct = Math.min(elapsed / 4000, 1);
        
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const startX = isMobile ? -150 : -222;
        const endX = isMobile ? 150 : 222;
        const currentX = startX + (endX - startX) * pct;

        const plist = particlesRef.current;
        const wandX = currentX + 22; // offset to wand hand
        const wandY = 25; // paper line relative Y coordinate

        for (let i = 0; i < 2; i++) {
          plist.push({
            id: Math.random(),
            type: 'sparkle',
            x: wandX + (Math.random() - 0.5) * 8,
            y: wandY + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.4,
            size: Math.random() * 2.2 + 1.2,
            color: Math.random() < 0.5 ? "rgba(59, 130, 246," : "rgba(236, 72, 153,",
            alpha: 1.0,
            decay: Math.random() * 0.02 + 0.015
          });
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [stage]);

  // Spawn fibers, light leaks, and stars upon paper rip segments
  const spawnTearEffects = (segmentIdx: number) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const spacing = isMobile ? 50 : 74; // center-to-center spacing
    const startX = isMobile ? -150 : -222; // starting center offset
    const segX = startX + segmentIdx * spacing;
    const segY = 15;

    const plist = particlesRef.current;

    // 1. Spawn falling cream paper bits (existing)
    const fiberCount = isMobile ? 2 : 6;
    for (let i = 0; i < fiberCount; i++) {
      plist.push({
        id: Math.random(),
        type: 'fiber',
        x: segX + (Math.random() - 0.5) * 10,
        y: segY + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 1.6,
        vy: Math.random() * 1.8 + 0.6, // falling down
        size: Math.random() * 2.5 + 1.5,
        color: "#FAF6EE",
        alpha: 0.9,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.16,
        decay: Math.random() * 0.014 + 0.008
      });
    }

    // 2. Spawn Light Leak Particles (high velocity golden/white glowing particles)
    const leakCount = isMobile ? 3 : 12;
    for (let i = 0; i < leakCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2; // spraying upward/outward
      const speed = Math.random() * 5.0 + 2.5;
      plist.push({
        id: Math.random(),
        type: 'sparkle',
        x: segX,
        y: segY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.8 + 1.2,
        color: i % 2 === 0 ? "rgba(255, 255, 255," : "rgba(167, 139, 250,",
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.015
      });
    }

    // 3. Small star sparkle trails
    const trailCount = isMobile ? 2 : 5;
    for (let i = 0; i < trailCount; i++) {
      plist.push({
        id: Math.random(),
        type: 'sparkle',
        x: segX + (Math.random() - 0.5) * 12,
        y: segY + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(Math.random() * 1.5 + 0.5), // drift up
        size: Math.random() * 2.0 + 1.0,
        color: "rgba(236, 72, 153,", // pink sparkles
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.01
      });
    }
  };

  // Spawn dissolve stars upon character exit
  const spawnDissolveEffects = () => {
    const plist = particlesRef.current;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const count = isMobile ? 45 : 150;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 3.2 + 0.6;
      
      plist.push({
        id: Math.random(),
        type: 'dissolve',
        x: (Math.random() - 0.5) * 25,
        y: 85 + (Math.random() - 0.5) * 25,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 0.7, // drifting upwards
        size: Math.random() * 2.8 + 1.2,
        color: i % 2 === 0 ? "rgba(167, 139, 250," : "rgba(236, 72, 153,",
        alpha: 1.0,
        decay: Math.random() * 0.014 + 0.008
      });
    }
  };



  // Walking body/face positioning keyframes
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const walkStart = isMobile ? -160 : -235;
  const walkEnd = isMobile ? 160 : 235;

  let charAnimate: Record<string, number | string> = { x: -300, y: 90, opacity: 0, scale: 0.8, scaleX: 1 };
  let charTransition: Record<string, number | string | Record<string, number>> = { duration: 0.5, scaleX: { duration: 0 } };

  if (stage === 'intro-silence' || stage === 'intro-shooting' || stage === 'intro-vortex' || stage === 'intro-explode') {
    charAnimate = { x: -300, y: 90, opacity: 0, scale: 0.8, scaleX: 1 };
    charTransition = { duration: 0.5, scaleX: { duration: 0 } };
  } else if (stage === 'char-enter') {
    charAnimate = { x: 0, y: 90, opacity: 1, scale: 1, scaleX: 1 };
    charTransition = { duration: 2.2, ease: "easeInOut", scaleX: { duration: 0 } };
  } else if (stage === 'char-notice-viewer') {
    charAnimate = { x: 0, y: 90, opacity: 1, scale: 1, scaleX: 1 };
    charTransition = { duration: 2.5, scaleX: { duration: 0 } };
  } else if (stage === 'char-notice-paper') {
    charAnimate = { x: walkStart, y: 90, opacity: 1, scale: 1, scaleX: -1 }; // faces left to walk left
    charTransition = { duration: 1.5, ease: "easeInOut", scaleX: { duration: 0 } };
  } else if (stage === 'char-tear') {
    charAnimate = { x: walkEnd, y: 90, opacity: 1, scale: 1, scaleX: 1 }; // faces right to walk right
    charTransition = { duration: 4.0, ease: "linear", scaleX: { duration: 0 } };
  } else if (stage === 'char-admire') {
    charAnimate = { x: 0, y: 90, opacity: 1, scale: 1, scaleX: 1 }; // walks back to center
    charTransition = { duration: 1.2, ease: "easeInOut", scaleX: { duration: 0 } };
  } else if (stage === 'char-exit') {
    charAnimate = { x: 0, y: 110, opacity: 0, scale: 0.85, scaleX: 1 }; // dissolves
    charTransition = { duration: 0.8, ease: "easeIn", scaleX: { duration: 0 } };
  }

  const isWalking = stage === 'char-enter' || stage === 'char-notice-paper' || stage === 'char-tear' || stage === 'char-admire';

  // Letter collections for "Happy Birthday" materialization
  const p1 = ["H", "a", "p", "p", "y"];
  const p2 = ["B", "i", "r", "t", "h", "d", "a", "y"];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-6">
      {/* 1. Canvas Sparkles & Dissolving Layers */}
      <canvas 
        ref={canvasRef} 
        style={{ display: isHeroHidden ? "none" : "block" }}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10" 
      />

      {/* 2. Radial Bloom Overlay */}
      {bloomActive && !isHeroHidden && (
        <div className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,rgba(255,245,250,0.8)_0%,rgba(139,92,246,0.55)_45%,rgba(0,0,0,0)_80%)] mix-blend-screen transition-opacity duration-300 pointer-events-none" />
      )}



      {/* 4. Fullscreen Camera Parallax Drifting Container */}
      {!isHeroHidden && (
        <motion.div
          animate={{ x: [0, 8, -5, 0], y: [0, -6, 4, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          style={{ 
            opacity: heroOpacity, 
            scale: heroScale, 
            y: heroY,
            filter: isMobileDevice ? undefined : heroBlur,
            pointerEvents: heroPointerEvents as unknown as React.CSSProperties["pointerEvents"],
            zIndex: heroZIndex
          }}
          className="text-center max-w-3xl flex flex-col items-center gap-5 relative z-20"
        >
          {/* Living atmospheric nebula clouds */}
          <div className="absolute w-[30vw] h-[20vh] md:w-[60vw] md:h-[40vh] rounded-full bg-pink-glow/5 blur-[50px] md:blur-[120px] pointer-events-none -top-[20%] -left-[10%] -z-10 animate-pulse-slow" />
          <div className="absolute w-[25vw] h-[15vh] md:w-[50vw] md:h-[30vh] rounded-full bg-accent-glow/5 blur-[45px] md:blur-[110px] pointer-events-none -bottom-[20%] -right-[10%] -z-10 animate-pulse-slow" />

          {/* Happy Birthday typography: Materializing letters */}
        <motion.h1 
          initial={{ opacity: 0, textShadow: "0 0 10px rgba(139,92,246,0.3)" }}
          animate={{ 
            opacity: (introStage === 'intro-silence' || introStage === 'intro-shooting' || introStage === 'intro-vortex') ? 0 : 1,
            textShadow: ["0 0 10px rgba(139,92,246,0.3)", "0 0 35px rgba(236,72,153,0.85)", "0 0 12px rgba(139,92,246,0.4)"] 
          }}
          transition={{ 
            opacity: { duration: 0.8, ease: "easeOut" },
            textShadow: { repeat: Infinity, duration: 2.2, delay: 0.4, ease: "easeInOut" }
          }}
          className="text-6xl md:text-8xl font-serif tracking-tight text-white leading-none select-none relative flex items-center justify-center flex-wrap gap-x-4 md:gap-x-6"
        >
          
          {/* Shimmer sweep effect */}
          {shimmerActive && (
            <motion.div
              initial={{ left: "-150%" }}
              animate={{ left: "150%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="absolute top-0 h-full w-[50%] bg-gradient-to-r from-transparent via-white/45 to-transparent -skew-x-12 pointer-events-none mix-blend-screen z-10"
            />
          )}

          <span className="flex gap-0.5 text-glow">
            {p1.map((char, idx) => (
              <MaterializingLetter 
                key={`p1-${idx}`} 
                char={char} 
                delay={idx * 140} 
                active={introStage !== 'intro-silence' && introStage !== 'intro-shooting' && introStage !== 'intro-vortex'}
              />
            ))}
          </span>
          <span className="flex gap-0.5 text-glow">
            {p2.map((char, idx) => (
              <MaterializingLetter 
                key={`p2-${idx}`} 
                char={char} 
                delay={(p1.length * 140) + idx * 140} 
                active={introStage !== 'intro-silence' && introStage !== 'intro-shooting' && introStage !== 'intro-vortex'}
              />
            ))}
          </span>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: (introStage === 'intro-silence' || introStage === 'intro-shooting' || introStage === 'intro-vortex') ? 0 : 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center justify-center gap-1.5 sm:gap-3.5 select-none h-28 mt-4 relative w-full max-w-[420px] sm:max-w-2xl mx-auto px-2 sm:px-4 overflow-visible"
        >
          {nameChars.map((char, idx) => (
            <PaperNameSegment
              key={idx}
              char={char}
              isTorn={tornSegments[idx]}
            />
          ))}
        </motion.div>

        {/* Pixar-inspired Cute SVG Character */}
        {stage !== 'done' && !introCompleted && (
          <motion.div
            initial={{ x: -300, y: 90, opacity: 0, scale: 0.8, scaleX: 1 }}
            animate={charAnimate}
            transition={charTransition}
            className="absolute w-24 h-24 pointer-events-none select-none z-30"
            style={{ 
              left: "calc(50% - 48px)", 
              top: "calc(50% + 22px)",
              originX: 0.5,
              originY: 1
            }}
          >
            <div className="animate-float-gentle w-full h-full">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(139,92,246,0.25)]">
                <defs>
                  <filter id="wand-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Walking bobbing body movement wrapper */}
                <motion.g
                  animate={{ 
                    y: isWalking ? [0, -4.5, 0] : [0, -1.8, 0] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: isWalking ? 0.35 : 1.8, 
                    ease: "easeInOut" 
                  }}
                >
                  {/* 1. Bunny/Fluffy Ears */}
                  <path d="M 31,44 C 23,30 29,26 34,35 C 36,39 34,44 32,44 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
                  <path d="M 69,44 C 77,30 71,26 66,35 C 64,39 66,44 68,44 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
                  
                  {/* Inner pink ears */}
                  <path d="M 31,42 C 26,32 30,29 33,36 C 34,39 33,42 32,42 Z" fill="#FFE4E6" />
                  <path d="M 69,42 C 74,32 70,29 67,36 C 66,39 67,42 68,42 Z" fill="#FFE4E6" />

                  {/* 2. Walking Legs Cycle */}
                  <motion.ellipse
                    cx="40"
                    cy="74"
                    rx="5"
                    ry="3"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="0.8"
                    style={{ originX: "40px", originY: "74px" }}
                    animate={isWalking ? { rotate: [-22, 22, -22] } : { rotate: 0 }}
                    transition={{ repeat: Infinity, duration: 0.35, ease: "linear" }}
                  />
                  <motion.ellipse
                    cx="60"
                    cy="74"
                    rx="5"
                    ry="3"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="0.8"
                    style={{ originX: "60px", originY: "74px" }}
                    animate={isWalking ? { rotate: [22, -22, 22] } : { rotate: 0 }}
                    transition={{ repeat: Infinity, duration: 0.35, ease: "linear" }}
                  />

                  {/* 3. Round Soft Body */}
                  <ellipse cx="50" cy="56" rx="22" ry="19.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
                  
                  {/* Soft belly badge */}
                  <ellipse cx="50" cy="62" rx="14" ry="11.5" fill="#FFFDF8" />

                  {/* 4. Head Group (Tilts toward walk/objects) */}
                  <motion.g
                    animate={
                      stage === 'char-notice-paper' 
                        ? { rotate: 12, y: 1.5 } 
                        : stage === 'char-admire'
                        ? { rotate: -14, y: -1 }
                        : { rotate: 0, y: 0 }
                    }
                    transition={{ duration: 0.6 }}
                    style={{ originX: "50px", originY: "56px" }}
                  >
                    {/* Eyes (Blinking) */}
                    <ellipse cx="41.5" cy="51" r="2.8" ry={blink ? 0.3 : 2.8} fill="#1E293B" />
                    <ellipse cx="58.5" cy="51" r="2.8" ry={blink ? 0.3 : 2.8} fill="#1E293B" />
                    
                    {/* Highlights */}
                    {!blink && (
                      <>
                        <circle cx="40.3" cy="49.8" r="0.9" fill="#FFFFFF" />
                        <circle cx="57.3" cy="49.8" r="0.9" fill="#FFFFFF" />
                      </>
                    )}

                    {/* Rosy Cheeks */}
                    <ellipse cx="35" cy="57" rx="3.5" ry="2.2" fill="#FDA4AF" opacity="0.65" />
                    <ellipse cx="65" cy="57" rx="3.5" ry="2.2" fill="#FDA4AF" opacity="0.65" />

                    {/* Mouth */}
                    <path d="M 48.5,58 C 48.5,58 50,59.5 51.5,58" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
                  </motion.g>

                  {/* 5. Stubby Left Arm */}
                  <path d="M 28,57 C 22,57 20,62 26,63 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.6" />

                  {/* 6. Right Arm & Magic Wand (Peels Paper) */}
                  <motion.g
                    style={{ originX: "70px", originY: "57px" }}
                    animate={
                      stage === 'char-notice-viewer' || stage === 'char-admire'
                        ? { rotate: [0, -35, 5, -35, 5, -35, 0] }
                        : stage === 'char-tear'
                        ? { rotate: [0, -45, -5, -45, -5, -45, 0] }
                        : { rotate: 0 }
                    }
                    transition={
                      stage === 'char-notice-viewer' || stage === 'char-admire'
                        ? { duration: 2.0, times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1] }
                        : stage === 'char-tear'
                        ? { repeat: Infinity, duration: 0.35, ease: "linear" }
                        : { duration: 0.5 }
                    }
                  >
                    {/* Right Arm */}
                    <path d="M 70,57 C 76,57 78,62 72,63 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.6" />
                    
                    {/* Wand Shaft */}
                    <line x1="72" y1="60" x2="82" y2="44" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
                    
                    {/* Wand Star Tip */}
                    <polygon
                      points="82,44 84,39 88,38 85,35 86,31 82,33 78,31 79,35 76,38 80,39"
                      fill="#FDE047"
                      filter="url(#wand-glow)"
                    />
                  </motion.g>
                </motion.g>
              </svg>
            </div>
          </motion.div>
        )}


        </motion.div>
      )}

      {/* Storytelling Beats (remain unchanged in scroll flow) */}
      {beats.map((beat, idx) => (
        <motion.div
          key={idx}
          style={{ opacity: beat.opacity, y: beat.y }}
          className="absolute text-center max-w-2xl flex flex-col items-center gap-5"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-accent-glow font-sans font-semibold">
            Beat 0{idx + 1}
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-tight">
            {beat.title}
          </h2>
          <p className="text-base md:text-lg font-sans text-text-secondary leading-relaxed font-light">
            {beat.text}
          </p>
          {beat.isFinal && (
            <motion.button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="mt-6 px-6 py-2.5 rounded-full font-sans tracking-widest text-xs uppercase border border-glass-glow bg-accent-gradient shadow-[0_0_20px_rgba(139,92,246,0.3)] pointer-events-auto hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Replay Memories
            </motion.button>
          )}
        </motion.div>
      ))}

      {/* Subtle Scroll Down Prompt */}
      {introCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 0.55,
            y: [0, 5, 0]
          }}
          transition={{ 
            opacity: { duration: 0.5 },
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-14 left-0 right-0 mx-auto w-max z-30 flex flex-col items-center gap-1.5 pointer-events-none select-none"
        >
          <span className="font-sans text-[9px] tracking-[0.25em] text-white uppercase font-bold">
            Scroll Down
          </span>
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
