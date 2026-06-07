"use client";

import { useEffect, useRef, useState } from "react";
import { Key } from "lucide-react";
import { useScroll, motion, useTransform, useMotionValue } from "framer-motion";


interface StarParticle {
  id: number;
  letterIdx: number;
  // Normalized target coordinates [-0.5 to 0.5]
  tx: number;
  ty: number;
  // Scattered initial coordinates [-1.2 to 1.2]
  sx: number;
  sy: number;
  // Twinkle properties
  twinkleSpeed: number;
  phase: number;
  size: number;
}

interface BackgroundStar {
  x: number;
  y: number;
  size: number;
  speedY: number;
  brightness: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  active: boolean;
}

interface ConstellationRevealProps {
  showKey?: boolean;
  onCollectKey?: (e: React.MouseEvent) => void;
}

export default function ConstellationReveal({ showKey = false, onCollectKey = () => {} }: ConstellationRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Monitor scroll progress across 150vh
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [hasScrolledIn, setHasScrolledIn] = useState(false);
  const [keyCoords, setKeyCoords] = useState({ top: "35%", left: "22%" });

  useEffect(() => {
    const top = Math.floor(Math.random() * 20) + 25; // 25% - 45%
    const left = Math.floor(Math.random() * 20) + 15; // 15% - 35%
    setKeyCoords({ top: `${top}%`, left: `${left}%` });
  }, []);

  const revealProgressMV = useMotionValue(0);

  // Quote fade in at the end of scroll (mapped to revealProgressMV)
  const quoteOpacity = useTransform(revealProgressMV, [0.70, 0.88, 1.0], [0, 1, 1]);
  const textBlur = useTransform(revealProgressMV, [0.70, 0.88, 1.0], ["blur(10px)", "blur(0px)", "blur(0px)"]);
  const textY = useTransform(revealProgressMV, [0.70, 0.88, 1.0], [30, 0, 0]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      if (latest > 0.05) setHasScrolledIn(true);
      else setHasScrolledIn(false);

      revealProgressMV.set(latest);
    });
    return () => unsubscribe();
  }, [scrollYProgress, revealProgressMV]);

  // Define normalized points for "DEAREST"
  // Horizontal bounds: -0.42 to 0.42
  // Letter box: width = 0.07, height = 0.18
  // Columns: -0.42, -0.28, -0.14, 0, 0.14, 0.28, 0.42
  const isVisibleRef = useRef(false);
  const loopRef = useRef<(() => void) | null>(null);
  const isLoopRunningRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      isVisibleRef.current = visible;
      
      if (visible && !isLoopRunningRef.current && loopRef.current) {
        loopRef.current();
      }
    }, { threshold: 0 });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Define normalized points for "DEAREST"
  // Horizontal bounds: -0.42 to 0.42
  // Letter box: width = 0.07, height = 0.18
  // Columns: -0.42, -0.28, -0.14, 0, 0.14, 0.28, 0.42
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const isMobile = window.innerWidth < 768;
    
    // Generate letter stars
    const stars: StarParticle[] = [];
    const columns = [-0.42, -0.28, -0.14, 0, 0.14, 0.28, 0.42];
    
    const letterPaths: Array<(cx: number) => Array<{x: number, y: number}>> = [
      // D
      (cx) => [
        { x: cx - 0.035, y: -0.09 }, { x: cx - 0.035, y: -0.054 }, { x: cx - 0.035, y: -0.018 },
        { x: cx - 0.035, y: 0.018 }, { x: cx - 0.035, y: 0.054 }, { x: cx - 0.035, y: 0.09 },
        { x: cx - 0.015, y: -0.09 }, { x: cx + 0.01, y: -0.09 }, { x: cx + 0.03, y: -0.06 },
        { x: cx + 0.035, y: -0.02 }, { x: cx + 0.035, y: 0.02 }, { x: cx + 0.03, y: 0.06 },
        { x: cx + 0.01, y: 0.09 }, { x: cx - 0.015, y: 0.09 }
      ],
      // E
      (cx) => [
        { x: cx - 0.035, y: -0.09 }, { x: cx - 0.035, y: -0.054 }, { x: cx - 0.035, y: -0.018 },
        { x: cx - 0.035, y: 0.018 }, { x: cx - 0.035, y: 0.054 }, { x: cx - 0.035, y: 0.09 },
        { x: cx - 0.01, y: -0.09 }, { x: cx + 0.015, y: -0.09 }, { x: cx + 0.035, y: -0.09 },
        { x: cx - 0.01, y: 0 }, { x: cx + 0.015, y: 0 },
        { x: cx - 0.01, y: 0.09 }, { x: cx + 0.015, y: 0.09 }, { x: cx + 0.035, y: 0.09 }
      ],
      // A
      (cx) => [
        { x: cx - 0.035, y: 0.09 }, { x: cx - 0.02, y: 0.045 }, { x: cx - 0.01, y: 0 },
        { x: cx, y: -0.045 }, { x: cx, y: -0.09 }, { x: cx + 0.01, y: -0.045 },
        { x: cx + 0.02, y: 0 }, { x: cx + 0.03, y: 0.045 }, { x: cx + 0.035, y: 0.09 },
        { x: cx - 0.015, y: 0.025 }, { x: cx, y: 0.025 }, { x: cx + 0.015, y: 0.025 }
      ],
      // R
      (cx) => [
        { x: cx - 0.035, y: -0.09 }, { x: cx - 0.035, y: -0.054 }, { x: cx - 0.035, y: -0.018 },
        { x: cx - 0.035, y: 0.018 }, { x: cx - 0.035, y: 0.054 }, { x: cx - 0.035, y: 0.09 },
        { x: cx - 0.01, y: -0.09 }, { x: cx + 0.015, y: -0.09 }, { x: cx + 0.035, y: -0.065 },
        { x: cx + 0.035, y: -0.025 }, { x: cx + 0.015, y: 0 }, { x: cx - 0.01, y: 0 },
        { x: cx + 0.005, y: 0.025 }, { x: cx + 0.018, y: 0.05 }, { x: cx + 0.03, y: 0.075 }, { x: cx + 0.038, y: 0.09 }
      ],
      // E (Same)
      (cx) => [
        { x: cx - 0.035, y: -0.09 }, { x: cx - 0.035, y: -0.054 }, { x: cx - 0.035, y: -0.018 },
        { x: cx - 0.035, y: 0.018 }, { x: cx - 0.035, y: 0.054 }, { x: cx - 0.035, y: 0.09 },
        { x: cx - 0.01, y: -0.09 }, { x: cx + 0.015, y: -0.09 }, { x: cx + 0.035, y: -0.09 },
        { x: cx - 0.01, y: 0 }, { x: cx + 0.015, y: 0 },
        { x: cx - 0.01, y: 0.09 }, { x: cx + 0.015, y: 0.09 }, { x: cx + 0.035, y: 0.09 }
      ],
      // S
      (cx) => [
        { x: cx + 0.035, y: -0.075 }, { x: cx + 0.02, y: -0.09 }, { x: cx - 0.01, y: -0.09 }, { x: cx - 0.035, y: -0.06 },
        { x: cx - 0.02, y: -0.025 }, { x: cx, y: 0 }, { x: cx + 0.02, y: 0.025 },
        { x: cx + 0.035, y: 0.06 }, { x: cx + 0.01, y: 0.09 }, { x: cx - 0.02, y: 0.09 }, { x: cx - 0.035, y: 0.075 }
      ],
      // T
      (cx) => [
        { x: cx - 0.035, y: -0.09 }, { x: cx - 0.018, y: -0.09 }, { x: cx, y: -0.09 }, { x: cx + 0.018, y: -0.09 }, { x: cx + 0.035, y: -0.09 },
        { x: cx, y: -0.054 }, { x: cx, y: -0.018 }, { x: cx, y: 0.018 }, { x: cx, y: 0.054 }, { x: cx, y: 0.09 }
      ]
    ];

    let idAcc = 0;
    columns.forEach((cx, colIdx) => {
      const getPoints = letterPaths[colIdx];
      const pts = getPoints(cx);
      pts.forEach((pt) => {
        stars.push({
          id: idAcc++,
          letterIdx: colIdx,
          tx: pt.x,
          ty: pt.y,
          // Scattered far outside
          sx: (Math.random() - 0.5) * 2.5,
          sy: (Math.random() - 0.5) * 2.5,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          phase: Math.random() * Math.PI * 2,
          size: Math.random() * 1.5 + 1.2
        });
      });
    });

    // Background cosmic dust stars (reduced on mobile)
    const bgStarsCount = isMobile ? 60 : 200;
    const bgStars: BackgroundStar[] = [];
    for (let i = 0; i < bgStarsCount; i++) {
      bgStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 0.9 + 0.2,
        speedY: -(Math.random() * 0.015 + 0.005),
        brightness: Math.random() * 0.7 + 0.2
      });
    }

    // Shooting stars (reduced on mobile)
    const shootingStarsCount = isMobile ? 1 : 2;
    const shootingStars: ShootingStar[] = [];
    for (let i = 0; i < shootingStarsCount; i++) {
      shootingStars.push({ x: 0, y: 0, length: 0, speed: 0, angle: 0, active: false });
    }

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Main render loop
    const render = () => {
      if (!canvas || !ctx) return;

      // Offscreen pause check
      if (!isVisibleRef.current) {
        isLoopRunningRef.current = false;
        return;
      }
      isLoopRunningRef.current = true;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const progress = revealProgressMV.get();

      // Scale calculations for responsive letters mapping
      const maxLetterWidth = Math.min(canvas.width * 0.7, 750);
      const letterScale = maxLetterWidth;

      // 1. Draw Space background & Radial Vignette
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.75
      );
      // Darkens when scrolled in
      bgGrad.addColorStop(0, `rgba(8, 8, 12, ${progress > 0.1 ? 0.98 : 0.88})`);
      bgGrad.addColorStop(1, `#020203`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render & Update Background Stars (slow vertical drift)
      ctx.fillStyle = "#ffffff";
      bgStars.forEach(s => {
        const sx = s.x * canvas.width;
        s.y += s.speedY / 60; // slow drift
        if (s.y < 0) s.y = 1;
        const sy = s.y * canvas.height;

        // Twinkle factor
        const tw = s.brightness * (0.6 + Math.sin(Date.now() * 0.002 + s.x * 100) * 0.4);
        ctx.fillStyle = `rgba(255, 255, 255, ${tw})`;
        ctx.beginPath();
        const safeSize = Math.max(0.1, isFinite(s.size) ? s.size : 0.1);
        ctx.arc(sx, sy, safeSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Render Shooting Stars
      shootingStars.forEach(ss => {
        if (!ss.active) {
          if (Math.random() < 0.004) {
            ss.active = true;
            ss.x = Math.random() * canvas.width * 0.7;
            ss.y = Math.random() * canvas.height * 0.4;
            ss.length = Math.random() * 80 + 50;
            ss.speed = Math.random() * 12 + 6;
            ss.angle = Math.PI / 6 + (Math.random() - 0.5) * 0.1; // roughly 30 deg drift
          }
        } else {
          // Draw line
          const endX = ss.x - Math.cos(ss.angle) * ss.length;
          const endY = ss.y - Math.sin(ss.angle) * ss.length;
          
          const g = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
          g.addColorStop(0, "rgba(255, 255, 255, 0.75)");
          g.addColorStop(0.3, "rgba(236, 72, 153, 0.35)");
          g.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.strokeStyle = g;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Move
          ss.x += Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;

          if (ss.x > canvas.width || ss.y > canvas.height) {
            ss.active = false;
          }
        }
      });

      // 4. Calculate star coordinates and map interpolated points
      const mappedPoints: Array<{ x: number; y: number; s: StarParticle }> = [];

      stars.forEach(s => {
        // Linear scroll interpolation
        const currentNX = progress * s.tx + (1 - progress) * s.sx;
        const currentNY = progress * s.ty + (1 - progress) * s.sy;

        // Map to screen dimensions (centered)
        const screenX = canvas.width / 2 + currentNX * letterScale;
        const screenY = canvas.height * 0.46 + currentNY * letterScale * 0.8;

        mappedPoints.push({ x: screenX, y: screenY, s });
      });

      // 5. Connect Constellation Lines (Only when scroll progress is above 0.35)
      if (progress > 0.35) {
        const lineProgress = Math.min((progress - 0.35) / 0.35, 1); // fades in lines
        ctx.lineWidth = 0.8;

        // Draw connections
        for (let i = 0; i < mappedPoints.length; i++) {
          const p1 = mappedPoints[i];
          for (let j = i + 1; j < mappedPoints.length; j++) {
            const p2 = mappedPoints[j];
            // Only connect if they belong to the same letter
            if (p1.s.letterIdx === p2.s.letterIdx) {
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // Responsive max line distance threshold (tightened on mobile)
              const maxLineDist = isMobile ? letterScale * 0.03 : letterScale * 0.055;
              if (dist < maxLineDist) {
                const alpha = (1 - dist / maxLineDist) * 0.28 * lineProgress;
                ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`; // glowing violet line
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // 6. Draw Constellation Stars
      mappedPoints.forEach(p => {
        // Twinkling animation logic
        const twinkle = 0.5 + Math.sin(Date.now() * p.s.twinkleSpeed + p.s.phase) * 0.45;
        const alpha = Math.min(progress * 1.5, 0.4) + twinkle * 0.6;

        // Drawing a tiny glowing star
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        
        const safeSize = Math.max(0.1, isFinite(p.s.size) ? p.s.size : 0.1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, safeSize, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft star glow for fully formed letters
        if (progress > 0.75) {
          const glowAlpha = (progress - 0.75) * 4 * 0.28 * twinkle;
          const safeGlowRadius = Math.max(0.1, isFinite(p.s.size) ? p.s.size * 6 : 0.1);
          const radial = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, safeGlowRadius);
          radial.addColorStop(0, `rgba(236, 72, 153, ${glowAlpha})`);
          radial.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(p.x, p.y, safeGlowRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    loopRef.current = render;
    isLoopRunningRef.current = true;
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      loopRef.current = null;
    };
  }, [scrollYProgress, revealProgressMV]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[150vh] bg-black select-none"
    >
      {/* Canvas view sticky top */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />



        {/* Hidden key in the constellation sky */}
        {showKey && (
          <div
            onClick={(e) => {
              onCollectKey(e);
            }}
            style={{ top: keyCoords.top, left: keyCoords.left }}
            className="absolute w-11 h-11 rounded-full bg-neutral-950/80 border border-amber-400 text-amber-300 z-30 cursor-pointer animate-float-slow flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.75)] hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
            title="Star Key"
          >
            <Key className="w-5 h-5 text-amber-300" />
          </div>
        )}

        {/* Ambient radial vignette overlays */}
        <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]" />
        
        {/* Soft Background nebulas */}
        {hasScrolledIn && (
          <div className="absolute w-[80vw] h-[80vh] rounded-full bg-accent-glow/5 blur-[160px] pointer-events-none z-0 transition-opacity duration-[2s] opacity-60 animate-pulse-slow" style={{ top: "10%", left: "10%" }} />
        )}

        {/* Final revealed quotes below the constellation */}
        <motion.div
          style={{
            opacity: quoteOpacity,
            filter: textBlur,
            y: textY,
          }}
          className="absolute bottom-[20%] text-center px-6 z-30 max-w-xl flex flex-col items-center gap-4"
        >
          <motion.p
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 1 }}
  dir="rtl"
  className="text-lg md:text-xl text-white/95 leading-loose font-[Noto_Nastaliq_Urdu]"
>
  میرے بے ترتیب الفاظ کچھ بھی ہوں،
  میرا تذکرہ تم ہو، تشریح تم ہو، محبت تم ہو۔
</motion.p>
          <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent mt-2" />
        </motion.div>

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
      </div>
    </section>
  );
}
