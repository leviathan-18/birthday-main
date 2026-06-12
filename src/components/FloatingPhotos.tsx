"use client";

import { useState, useEffect } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { Key } from "lucide-react";

interface FloatingPhotosProps {
  scrollYProgress: MotionValue<number>;
  showKey?: boolean;
  onCollectKey?: (e: React.MouseEvent) => void;
}

export default function FloatingPhotos({ scrollYProgress, showKey = false, onCollectKey = () => {} }: FloatingPhotosProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Photo 1: Laugh (Cozy Cafe) - Phase A (0.25 - 0.44)
  const p1Opacity = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], [0, 1, 1, 0]);
  const p1X = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], ["35vw", "22vw", "22vw", "35vw"]);
  const p1Y = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], ["-25vh", "-18vh", "-18vh", "-25vh"]);
  const p1Scale = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], [0.92, 1, 1, 0.92]);
  const p1Blur = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  const p1Rotate = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], [15, 6, 6, 12]);

  // Photo 2: Adventure (Sunset Drive) - Phase A (0.25 - 0.44)
  const p2Opacity = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], [0, 1, 1, 0]);
  const p2X = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], ["-35vw", "-24vw", "-24vw", "-35vw"]);
  const p2Y = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], ["25vh", "18vh", "18vh", "25vh"]);
  const p2Scale = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], [0.92, 1, 1, 0.92]);
  const p2Blur = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  const p2Rotate = useTransform(scrollYProgress, [0.25, 0.31, 0.38, 0.44], [-15, -8, -8, -12]);

  // Photo 3: Cozy (Twilight Room) - Phase B (0.53 - 0.72)
  const p3Opacity = useTransform(scrollYProgress, [0.53, 0.59, 0.66, 0.72], [0, 1, 1, 0]);
  const p3X = useTransform(scrollYProgress, [0.53, 0.59, 0.66, 0.72], ["-35vw", "-22vw", "-22vw", "-35vw"]);
  const p3Y = useTransform(scrollYProgress, [0.53, 0.59, 0.66, 0.72], ["-15vh", "-10vh", "-10vh", "-15vh"]);
  const p3Scale = useTransform(scrollYProgress, [0.53, 0.59, 0.66, 0.72], [0.92, 1, 1, 0.92]);
  const p3Blur = useTransform(scrollYProgress, [0.53, 0.59, 0.66, 0.72], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  const p3Rotate = useTransform(scrollYProgress, [0.53, 0.59, 0.66, 0.72], [-10, -3, -3, -8]);

  // Photo 4: Starry (Campfire Lake) - Phase B (0.53 - 0.72)
  const p4Opacity = useTransform(scrollYProgress, [0.56, 0.62, 0.66, 0.72], [0, 1, 1, 0]);
  const p4X = useTransform(scrollYProgress, [0.56, 0.62, 0.66, 0.72], ["35vw", "22vw", "22vw", "35vw"]);
  const p4Y = useTransform(scrollYProgress, [0.56, 0.62, 0.66, 0.72], ["15vh", "8vh", "8vh", "15vh"]);
  const p4Scale = useTransform(scrollYProgress, [0.56, 0.62, 0.66, 0.72], [0.92, 1, 1, 0.92]);
  const p4Blur = useTransform(scrollYProgress, [0.56, 0.62, 0.66, 0.72], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  const p4Rotate = useTransform(scrollYProgress, [0.56, 0.62, 0.66, 0.72], [10, 4, 4, 8]);

  // Photo 5: Celebrate (Sparkler) - Phase C (0.80 - 0.98)
  const p5Opacity = useTransform(scrollYProgress, [0.80, 0.86, 0.94, 0.98], [0, 1, 1, 0]);
  const p5X = useTransform(scrollYProgress, [0.80, 0.86, 0.94, 0.98], ["0vw", "0vw", "0vw", "0vw"]);
  const p5Y = useTransform(scrollYProgress, [0.80, 0.86, 0.94, 0.98], ["12vh", "0vh", "0vh", "-12vh"]);
  const p5Scale = useTransform(scrollYProgress, [0.80, 0.86, 0.94, 0.98], [0.95, 1, 1, 0.95]);
  const p5Blur = useTransform(scrollYProgress, [0.80, 0.86, 0.94, 0.98], ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  const p5Rotate = useTransform(scrollYProgress, [0.80, 0.86, 0.94, 0.98], [0, 2, 2, -2]);

  const photos = [
    {
      src: "/images/fr-1.png",
      alt: "Laughter in cozy light",
      date: "2026",
      caption: "A reflection of our names, yours and mine.",
      opacity: p1Opacity,
      x: p1X,
      y: p1Y,
      scale: p1Scale,
      blur: p1Blur,
      rotate: p1Rotate,
      zIndex: 10,
      isLarge: false,
    },
    {
      src: "/images/fr-5.jpg",
      alt: "Sunset road trip driving",
      date: "2026",
      caption: "Rotate your phone clockwise to discover the name of my angel.",
      opacity: p2Opacity,
      x: p2X,
      y: p2Y,
      scale: p2Scale,
      blur: p2Blur,
      rotate: p2Rotate,
      zIndex: 10,
      isLarge: false,
    },
    {
      src: "/images/fr-2.jpg",
      alt: "Twilight room cozy lights",
      date: "2023",
      caption: "My Fr. is slowly fading away from my life.",
      opacity: p3Opacity,
      x: p3X,
      y: p3Y,
      scale: p3Scale,
      blur: p3Blur,
      rotate: p3Rotate,
      zIndex: 12,
      isLarge: false,
    },
    {
      src: "/images/fr-4.png",
      alt: "Campfire by the lake at night",
      date: "2021",
      caption: "My love for you knows no limits; it is eternal and endless.",
      opacity: p4Opacity,
      x: p4X,
      y: p4Y,
      scale: p4Scale,
      blur: p4Blur,
      rotate: p4Rotate,
      zIndex: 12,
      isLarge: false,
    },
    {
      src: "/images/fr_celebrate.png",
      alt: "Holding sparklers at twilight",
      date: "Dec 2025",
      caption: "Finally found my Fr",
      opacity: p5Opacity,
      x: p5X,
      y: p5Y,
      scale: p5Scale,
      blur: p5Blur,
      rotate: p5Rotate,
      zIndex: 15,
      isLarge: true,
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
      {photos.map((photo, idx) => (
        <motion.div
          key={idx}
          style={{
            opacity: photo.opacity,
            x: photo.x,
            y: photo.y,
            rotate: photo.rotate,
            zIndex: photo.zIndex,
            scale: photo.scale,
            filter: isMobile ? "none" : photo.blur,
          }}
          className={`absolute select-none ${
            photo.isLarge
              ? "w-[260px] h-[340px] md:w-[340px] md:h-[450px]"
              : "w-[200px] h-[260px] md:w-[260px] md:h-[340px]"
          }`}
        >
          {/* Inner card container with custom slow vertical float delay offsets */}
          <div 
            className="w-full h-full p-3 bg-luxury-card border border-glass rounded-2xl flex flex-col gap-3 shadow-[0_30px_60px_rgba(0,0,0,0.85),0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-md animate-float-slow"
            style={{ animationDelay: `${idx * 0.9}s` }}
          >
            {/* Image Container */}
            <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={photo.isLarge ? "(max-width: 768px) 260px, 340px" : "(max-width: 768px) 200px, 260px"}
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority={photo.isLarge || idx < 2}
                quality={95}
              />
              {/* Leaning against the photo */}
              {showKey && photo.src.includes("fr-5") && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollectKey(e);
                  }}
                  className="absolute bottom-2 right-2 p-1 bg-amber-500/20 hover:bg-amber-500/40 rounded-full border border-amber-400 text-amber-300 z-30 cursor-pointer animate-pulse hover:scale-115 transition-all duration-300 pointer-events-auto shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                  title="Secret Key"
                >
                  <Key className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            {/* Info / Captions */}
            <div className="flex flex-col gap-0.5 text-left pl-1">
              <span
                className="font-serif italic text-[11px] text-pink-glow"
                dangerouslySetInnerHTML={{ __html: photo.date }}
              />
              <span className="font-sans text-[9px] font-medium tracking-wider text-text-secondary uppercase">
                {photo.caption}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
