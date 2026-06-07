"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazyMountProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}

export default function LazyMount({ children, fallback = null, rootMargin = "300px" }: LazyMountProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin }
    );

    const el = containerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) {
        observer.unobserve(el);
      }
      observer.disconnect();
    };
  }, [isInView, rootMargin]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[inherit]">
      {isInView ? children : fallback}
    </div>
  );
}
