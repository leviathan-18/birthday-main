"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface CinematicTextProps {
  text: string;
  className?: string;
  delay?: number;
  scrub?: boolean;
}

export default function CinematicText({
  text,
  className = "",
  delay = 0,
  scrub = false,
}: CinematicTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);
    const element = containerRef.current;
    if (!element) return;

    // Split text into words and wrap them
    const words = text.split(" ");
    element.innerHTML = words
      .map(
        (word) =>
          `<span class="inline-block overflow-hidden pb-[0.1em]"><span class="reveal-word inline-block origin-bottom-left translate-y-[110%] rotate-[4deg] opacity-0 filter blur-[3px] transition-filter duration-300">${word}&nbsp;</span></span>`
      )
      .join("");

    const targets = element.querySelectorAll(".reveal-word");

    const t = gsap.to(targets, {
      y: 0,
      rotate: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 1.0,
      stagger: 0.04,
      ease: "power4.out",
      delay: delay,
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        end: "bottom 55%",
        scrub: scrub ? 0.4 : false,
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, [text, delay, scrub]);

  // Fallback content for SSR
  return (
    <div ref={containerRef} className={`cinematic-text select-none ${className}`}>
      {text}
    </div>
  );
}
