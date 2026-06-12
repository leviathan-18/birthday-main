"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Gift, Key } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicText from "./CinematicText";

import Image from "next/image";


interface WishParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
}

interface WishJarProps {
  showKey?: boolean;
  onCollectKey?: (e: React.MouseEvent) => void;
}

const cuteImages = [
  "/images/cute_1.jpg",
  "/images/cute_2.jpg",
  "/images/cute_3.jpg",
  "/images/cute_4.jpg",
  "/images/cute_5.jpg",
  "/images/cute_6.jpg",
  "/images/cute_7.jpg",
  "/images/cute_8.jpg",
  "/images/cute_9.jpg",
  "/images/cute_10.png"
];

export default function WishJar({ showKey = false, onCollectKey = () => {} }: WishJarProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [unseenIndices, setUnseenIndices] = useState<number[]>([]);

  const [isJarBroken, setIsJarBroken] = useState(false);
  const [keyLeft, setKeyLeft] = useState("left-5");
  const containerRef = useRef<HTMLDivElement>(null);
  const jarWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKeyLeft(Math.random() < 0.5 ? "left-5" : "right-5");
  }, []);
  
  const isJarVisibleRef = useRef(false);
  const loopRef = useRef<(() => void) | null>(null);
  const isLoopRunningRef = useRef(false);
  const jarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const section = containerRef.current;
    const jarWrapper = jarWrapperRef.current;
    if (!section || !jarWrapper) return;

    const t = gsap.fromTo(jarWrapper,
      { y: 30 },
      {
        y: -30,
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

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      isJarVisibleRef.current = visible;
      if (visible && !isLoopRunningRef.current && loopRef.current) {
        loopRef.current();
      }
    }, { threshold: 0 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeImage) {
      document.body.classList.add("overflow-hidden");
      if (window.lenisInstance) {
        window.lenisInstance.stop();
      }
    } else {
      document.body.classList.remove("overflow-hidden");
      if (window.lenisInstance) {
        window.lenisInstance.start();
      }
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
      if (typeof window !== "undefined" && window.lenisInstance) {
        window.lenisInstance.start();
      }
    };
  }, [activeImage]);

  // Render loop for jar canvas
  useEffect(() => {
    const canvas = jarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 150;

    const particles: WishParticle[] = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 110 + 20,
        size: Math.random() * 4.5 + 2.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.6 + 0.3
      });
    }

    let animId: number;

    const render = () => {
      if (!isJarVisibleRef.current) {
        isLoopRunningRef.current = false;
        return;
      }
      isLoopRunningRef.current = true;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        const nx = p.x + p.speedX;
        const ny = p.y + p.speedY;

        // Bounce inside jar boundaries (95x135 box)
        if (nx < 8 || nx > 92) p.speedX = -p.speedX;
        if (ny < 15 || ny > 135) p.speedY = -p.speedY;

        p.x = Math.max(8, Math.min(nx, 92));
        p.y = Math.max(15, Math.min(ny, 135));
        p.alpha = 0.35 + Math.sin(Date.now() * 0.0015 + p.id) * 0.25;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.35, "#EC4899");
        grad.addColorStop(1, "rgba(236, 72, 153, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    loopRef.current = render;
    isLoopRunningRef.current = true;
    render();

    return () => {
      cancelAnimationFrame(animId);
      loopRef.current = null;
    };
  }, []);

  const handleJarClick = () => {
    if (isJarBroken) return;
    executeJarBreak();
  };

  const executeJarBreak = () => {
    let currentUnseen = [...unseenIndices];
    if (currentUnseen.length === 0) {
      currentUnseen = Array.from({ length: cuteImages.length }, (_, i) => i);
    }
    const poolIndex = Math.floor(Math.random() * currentUnseen.length);
    const chosenIndex = currentUnseen[poolIndex];
    currentUnseen.splice(poolIndex, 1);
    setUnseenIndices(currentUnseen);
    setActiveImage(cuteImages[chosenIndex]);
    setIsJarBroken(true);
  };

  const handleReturnToJar = () => {
    setActiveImage(null);
    setIsJarBroken(false);
  };

  return (
    <section 
      id="journey"
      ref={containerRef}
      className="w-full min-h-screen py-24 bg-[#050507] border-t border-glass relative flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-accent-glow/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-pink-glow/5 rounded-full blur-[110px] pointer-events-none animate-pulse-slow" />

      <div className="max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center gap-10 select-none">
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mb-2 shadow-inner">
            <Gift className="w-3.5 h-3.5 text-pink-glow animate-pulse" />
            <span className="font-sans text-[10px] tracking-widest text-text-secondary uppercase">
              Warning: Too Cute
            </span>
          </div>
          <CinematicText
            text="A Jar of Absolute Cuteness"
            className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight text-glow"
          />
          <CinematicText
            text="apne jaise cutie type logon ko dekhna h? then clik on the Jar!"
            className="text-xs md:text-sm font-sans text-text-secondary max-w-md leading-relaxed"
          />
        </div>

        {/* The Luxury Wish Jar Container */}
        <div ref={jarWrapperRef} className="relative w-64 h-80 flex items-center justify-center mt-4">


          {/* Leaning against the jar base */}
          {showKey && !isJarBroken && (
            <div
              onClick={(e) => {
                onCollectKey(e);
              }}
              className={`absolute bottom-6 ${keyLeft} p-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 z-30 cursor-pointer animate-pulse hover:bg-amber-500/40 hover:scale-115 transition-all duration-300 pointer-events-auto shadow-[0_0_15px_rgba(251,191,36,0.6)]`}
              title="Glowing Key"
            >
              <Key className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="relative w-64 h-80 flex items-center justify-center cursor-pointer z-10" onClick={handleJarClick}>
            {/* External Halo Glow */}
            {!isJarBroken && (
              <div className="absolute w-52 h-64 bg-pink-glow/10 rounded-full blur-[45px] animate-pulse-slow z-0" />
            )}
          
            {/* Glass Jar Body */}
            <motion.div
              whileHover={isJarBroken ? {} : { scale: 1.04, rotate: [0, -1, 1, -1, 0] }}
              whileTap={isJarBroken ? {} : { scale: 0.96 }}
              transition={{ duration: 0.4 }}
              style={{ opacity: isJarBroken ? 0 : 1, pointerEvents: isJarBroken ? "none" : "auto" }}
              className="transition-opacity duration-300 relative w-44 h-64 bg-white/5 border-[1.5px] border-white/20 rounded-[50px] shadow-[inset_0_15px_35px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col items-center justify-start overflow-hidden z-10"
            >
              {/* Jar Lid (Wood/Luxury Look) */}
              <div className="w-24 h-6 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-900 border-b border-neutral-600 rounded-b-lg shadow-md z-20 flex items-center justify-center">
                <div className="w-16 h-[2px] bg-neutral-500/30" />
              </div>
              
              {/* Jar Neck */}
              <div className="w-20 h-3.5 bg-white/10 border-x-[1.5px] border-b-[1.5px] border-white/20 shadow-inner z-10" />
 
              {/* Glowing Sparks Inside Jar */}
              <canvas
                ref={jarCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />
 
              {/* Glow Core */}
              <div className="absolute bottom-6 w-20 h-20 bg-pink-glow/20 rounded-full blur-2xl z-0" />
            </motion.div>
 
            {/* Prompt banner under jar */}
            {!isJarBroken && (
              <div className="absolute -bottom-8 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] text-text-secondary hover:text-white transition-colors">
                <Sparkles className="w-3 text-pink-glow animate-spin-slow" />
                Tap the jar to release cuteness
              </div>
            )}
          </div>
        </div>
 
        {/* Unfolding Parchment Cute Image Overlay */}
        <AnimatePresence>
          {activeImage && (
            <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm pointer-events-auto">
              {/* Clicking outside folds it back */}
              <div className="absolute inset-0" onClick={handleReturnToJar} />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotateX: -60, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.7, rotateX: 45, filter: "blur(8px)" }}
                transition={{ type: "spring", stiffness: 90, damping: 13 }}
                className="relative max-w-sm w-full p-6 rounded-3xl border-[1.5px] border-[#D9C4A9]/40 bg-[#161517] bg-gradient-to-tr from-[#161517] via-[#1F1E21] to-[#161517] shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(139,92,246,0.15)] flex flex-col items-center justify-center text-center gap-4 preserve-3d"
              >
                {/* Decorative border frame inside card */}
                <div className="absolute inset-2 border border-[#D9C4A9]/10 rounded-2xl pointer-events-none" />
 
                {/* Sparkling Icon */}
                <div className="w-8 h-8 rounded-full bg-pink-glow/10 border border-pink-glow/20 flex items-center justify-center relative z-10">
                  <Heart className="w-3.5 h-3.5 text-pink-glow fill-pink-glow/30 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-pink-glow/30 animate-ping opacity-35" />
                </div>
 
                <span className="font-sans text-[8px] tracking-[0.3em] text-[#D9C4A9] uppercase font-bold relative z-10">
                  Daily Dose of Cutie
                </span>
 
                {/* Random Cute Image Container */}
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 bg-neutral-900">
                  <Image
                    src={activeImage}
                    alt="Cute Capture"
                    fill
                    sizes="(max-width: 768px) 100vw, 384px"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
 
                <button
                  onClick={handleReturnToJar}
                  className="px-5 py-2 rounded-full font-sans tracking-widest text-[8px] uppercase border border-[#D9C4A9]/20 bg-white/5 text-[#D9C4A9] hover:bg-[#D9C4A9]/10 hover:text-white transition-all duration-300 pointer-events-auto relative z-10 shadow-inner"
                >
                  Close Jar
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
