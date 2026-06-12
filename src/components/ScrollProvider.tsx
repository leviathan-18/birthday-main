"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    lastScrollVelocity?: number;
    lenisInstance?: { stop: () => void; start: () => void };
  }
}

export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    window.lenisInstance = lenis;

    // Track scroll velocity for Matter.js physics
    lenis.on("scroll", (e: unknown) => {
      ScrollTrigger.update();
      if (typeof window !== "undefined") {
        const event = e as { velocity?: number };
        window.lastScrollVelocity = event.velocity || 0;
      }
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Force ScrollTrigger to recalculate layout offsets on resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    const triggers: ScrollTrigger[] = [];

    let idleId: number | null = null;

    // Trigger stagger entrance animations for all un-animated texts, dividers, and static images/icons
    const animTimeout = setTimeout(() => {
      const runAnimationInit = () => {
        const sections = document.querySelectorAll(
          "section, [id='memories'], [id='moments'], [id='journey'], [id='journey-cake'], footer"
        );

        sections.forEach((section) => {
          const candidates = section.querySelectorAll(
            "h1, h2, h3, h4, h5, h6, p, span, div.bg-accent-gradient, hr, img, svg"
          );

          const filtered: HTMLElement[] = [];

          candidates.forEach((elNode) => {
            const el = elNode as HTMLElement;

            // Check if Locomotive / Lenis data-scroll attributes are present
            if (el.hasAttribute("data-scroll") || el.hasAttribute("data-scroll-speed")) return;

            // Filter out existing motion and UI interactive classes
            const classes = el.className || "";
            if (typeof classes === "string") {
              const cLower = classes.toLowerCase();
              if (
                cLower.includes("motion") ||
                cLower.includes("animate") ||
                cLower.includes("tween") ||
                cLower.includes("gsap") ||
                cLower.includes("char-") ||
                cLower.includes("reveal-") ||
                cLower.includes("cinematic-text") ||
                cLower.includes("floating") ||
                cLower.includes("rain") ||
                cLower.includes("audio") ||
                cLower.includes("vinyl") ||
                cLower.includes("wish-card") ||
                cLower.includes("counter-card") ||
                cLower.includes("flame") ||
                cLower.includes("candle") ||
                cLower.includes("cake") ||
                cLower.includes("loading")
              ) {
                return;
              }
            }

            // Check if parent is already animated
            let parent = el.parentElement;
            let hasAnimatedParent = false;
            while (parent) {
              const pClasses = parent.className || "";
              if (typeof pClasses === "string") {
                const pLower = pClasses.toLowerCase();
                if (
                  pLower.includes("motion") ||
                  pLower.includes("animate") ||
                  pLower.includes("framer-") ||
                  pLower.includes("quoteoverlay") ||
                  pLower.includes("constellation") ||
                  pLower.includes("ending") ||
                  pLower.includes("cake") ||
                  pLower.includes("vinyl") ||
                  pLower.includes("audio") ||
                  pLower.includes("navbar") ||
                  pLower.includes("counter-card")
                ) {
                  hasAnimatedParent = true;
                  break;
                }
              }
              if (parent.hasAttribute("data-scroll") || parent.hasAttribute("data-scroll-speed")) {
                hasAnimatedParent = true;
                break;
              }
              parent = parent.parentElement;
            }

            if (!hasAnimatedParent) {
              filtered.push(el);
            }
          });

          if (filtered.length > 0) {
            // Set initial animation properties
            gsap.set(filtered, { opacity: 0, y: 30 });

            // Animate on scroll triggered by section
            const tween = gsap.to(filtered, {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.15,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            });

            if (tween.scrollTrigger) {
              triggers.push(tween.scrollTrigger);
            }
          }
        });
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => runAnimationInit(), { timeout: 2000 });
      } else {
        runAnimationInit();
      }
    }, 1200);

    return () => {
      lenis.destroy();
      window.lenisInstance = undefined;
      window.removeEventListener("resize", handleResize);
      clearTimeout(animTimeout);
      if (idleId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return <div ref={containerRef} className="relative w-full">{children}</div>;
}
