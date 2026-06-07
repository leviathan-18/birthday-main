"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundtrack } from "@/context/SoundtrackContext";

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number; // 3D depth
  vx: number;
  vy: number;
  vz: number; // 3D velocity Z
  size: number;
  color: string;
  alpha: number;
  
  // Spiral galaxy properties
  angle: number;
  radius: number;
  speed: number;
  
  // Target mapping
  targetX: number;
  targetY: number;
  
  // Custom offsets
  jitterX: number;
  jitterY: number;

  // 3D orbits
  orbitAngle?: number;
  orbitSpeed?: number;
  orbitRadius?: number;

  // Trail history for premium trails
  history?: Array<{ x: number; y: number; z: number }>;
}

// Mathematical 3D Volumetric Heart Points Generator
const getPointsFor3DHeart = (count: number): Array<{ x: number; y: number; z: number }> => {
  const points: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i < count; i++) {
    // Generate parametric angle t
    const t = Math.random() * Math.PI * 2;
    
    // Classic heart shape formulas
    const x2d = 16 * Math.pow(Math.sin(t), 3);
    const y2d = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    
    // Center it vertically: yCenter calculation
    const yCentered = -(y2d + 2.5);
    
    // Proportional normalizers
    const bx = x2d / 17.5;
    const by = yCentered / 15.0;
    
    // 75% on the sharp boundary shell, 25% filled inside
    const isOutline = Math.random() < 0.75;
    const r = isOutline ? 1.0 : (0.15 + Math.random() * 0.85);
    
    let x = bx * r;
    let y = by * r;
    
    // Add micro-noise spread for stardust glow texture
    const noise = 0.015 * (Math.random() - 0.5);
    x += noise;
    y += noise;
    
    // Clean volumetric depth thickness
    const z = (Math.random() - 0.5) * 0.32; 
    
    points.push({ x, y, z });
  }
  return points;
};

export default function EndingScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heartbeatAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { isPlaying } = useSoundtrack();

  const [animStage, setAnimStage] = useState<'deep-space' | 'gathering' | 'vortex' | 'heart-form' | 'heart-light' | 'heart-hold' | 'fracture' | 'universe' | 'drift-final'>('deep-space');
  const [msgStage, setMsgStage] = useState<'none' | 'bigger' | 'moments' | 'birthday'>('none');
  const [hasStarted, setHasStarted] = useState(false);

  const fractureInitRef = useRef(false);
  const stageStartTimeRef = useRef(Date.now());

  useEffect(() => {
    stageStartTimeRef.current = Date.now();
  }, [animStage]);

  // Sync animStage to ref to avoid tearing down the canvas rendering thread
  const animStageRef = useRef(animStage);
  useEffect(() => {
    animStageRef.current = animStage;
    if (animStage !== 'fracture') {
      fractureInitRef.current = false;
    }
  }, [animStage]);

  // Trigger ending when container is in view & restart on re-entry
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimStage('deep-space');
          setMsgStage('none');
          setHasStarted(true);
        } else {
          setHasStarted(false);
          // Completely reset stages and message flows when scrolling away
          setAnimStage('deep-space');
          setMsgStage('none');
        }
      },
      { threshold: 0.25 } // viewport threshold
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Stage timeline controller
  useEffect(() => {
    if (!hasStarted) return;

    let t: NodeJS.Timeout;

    if (animStage === 'deep-space') {
      t = setTimeout(() => setAnimStage('gathering'), 500); // 0.5s deep space drift
    } else if (animStage === 'gathering') {
      t = setTimeout(() => setAnimStage('vortex'), 1500); // 1.5s gravity gathering
    } else if (animStage === 'vortex') {
      t = setTimeout(() => setAnimStage('heart-form'), 1500); // 1.5s swirl vortex
    } else if (animStage === 'heart-form') {
      t = setTimeout(() => setAnimStage('heart-light'), 1800); // 1.8s heart formation
    } else if (animStage === 'heart-light') {
      t = setTimeout(() => setAnimStage('heart-hold'), 2200); // 2.2s energy light-up wave
    } else if (animStage === 'heart-hold') {
      t = setTimeout(() => setAnimStage('fracture'), 1500); // 1.5s hold & single pulse
    } else if (animStage === 'fracture') {
      t = setTimeout(() => setAnimStage('universe'), 2200); // 2.2s slow-motion shatter explosion
    } else if (animStage === 'universe') {
      t = setTimeout(() => {
        setAnimStage('drift-final');
        setMsgStage('bigger');
      }, 1000); // 1.0s transition directly to drift-final and begin messages
    }

    return () => clearTimeout(t);
  }, [hasStarted, animStage]);

  // Sequential text overlay reveal timeline
  useEffect(() => {
    let tText: NodeJS.Timeout;

    if (animStage === 'drift-final') {
      if (msgStage === 'bigger') {
        tText = setTimeout(() => setMsgStage('moments'), 4500);
      } else if (msgStage === 'moments') {
        tText = setTimeout(() => setMsgStage('birthday'), 4500);
      }
    }

    return () => clearTimeout(tText);
  }, [animStage, msgStage]);



  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 800 : 2000; // compose heart of 2000 glowing particles on desktop, 800 on mobile
    const particles: Particle[] = [];

    const colors = [
      "#EC4899", // pink-glow
      "#8B5CF6", // violet-glow
      "#FFE082", // gold-glow
      "#A78BFA", // lavender
      "#FFFFFF"  // white
    ];

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Scan text targets
    const heartPoints3D = getPointsFor3DHeart(maxParticles);

    // Safe Canvas Arc Wrapper to prevent negative radius or non-finite errors
    const safeArc = (c: CanvasRenderingContext2D, px: number, py: number, r: number) => {
      const sx = isFinite(px) ? px : 0;
      const sy = isFinite(py) ? py : 0;
      const sr = Math.max(0.1, isFinite(r) ? r : 0.1);
      c.arc(sx, sy, sr, 0, Math.PI * 2);
    };

    const resetParticles = () => {
      particles.length = 0;
      // Spawn particles distributed along outer boundary borders in Z space
      for (let i = 0; i < maxParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(window.innerWidth, window.innerHeight) * (1.15 + Math.random() * 0.55);
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        const pz = (Math.random() - 0.5) * 800; // Deep Z-space spread

        particles.push({
          id: i,
          x: px, 
          y: py, 
          z: pz,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          vz: (Math.random() - 0.5) * 2.5,
          size: Math.random() * 1.8 + 0.6,
          color: colors[i % colors.length],
          alpha: Math.random() * 0.8 + 0.2,
          
          angle: Math.random() * Math.PI * 2,
          radius: Math.random() * Math.min(window.innerWidth, window.innerHeight) * 0.43 + 20,
          speed: (Math.random() * 0.010 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
          
          targetX: px,
          targetY: py,
          jitterX: (Math.random() - 0.5) * 4.5,
          jitterY: (Math.random() - 0.5) * 4.5,
          history: []
        });
      }
    };

    // Background cosmic space dust (reduced on mobile)
    const spaceStarsCount = isMobile ? 70 : 200;
    const spaceStars: Array<{ x: number; y: number; size: number; alpha: number; twinkle: number }> = [];
    for (let i = 0; i < spaceStarsCount; i++) {
      spaceStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 0.85 + 0.15,
        alpha: Math.random() * 0.55 + 0.15,
        twinkle: Math.random() * 0.025 + 0.008
      });
    }

    let scaleZoom = 1.0;
    let initialized = false;
    let camX = 0;
    let camY = 0;

    const render = () => {
      if (!canvas || !ctx) return;

      // Handle viewport re-entry reset triggers and memory clearing
      if (!hasStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initialized = false;
        particles.length = 0; // Completely empty state
        return;
      } else if (hasStarted && !initialized) {
        resetParticles();
        initialized = true;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Slow cinematic camera drift panning
      camX = Math.sin(Date.now() * 0.0003) * 35;
      camY = Math.cos(Date.now() * 0.00025) * 25;

      // Draw background space
      ctx.fillStyle = "#020203";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(canvas.width, canvas.height) * 0.6
      );
      radialGlow.addColorStop(0, "rgba(22, 16, 36, 0.55)"); 
      radialGlow.addColorStop(0.6, "rgba(5, 5, 7, 0.95)");
      radialGlow.addColorStop(1, "#020203");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Background stars with camera drift
      spaceStars.forEach(s => {
        const x = (s.x + camX + canvas.width) % canvas.width;
        const y = (s.y + camY + canvas.height) % canvas.height;
        const twinkleVal = s.alpha * (0.6 + Math.sin(Date.now() * s.twinkle) * 0.4);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkleVal})`;
        ctx.beginPath();
        safeArc(ctx, x, y, s.size);
        ctx.fill();
      });

      // Get current stage from ref to avoid teardowns
      const currentStage = animStageRef.current;

      // Update camera zoom scale
      if (hasStarted) {
        if (currentStage === 'deep-space') {
          scaleZoom = 1.0;
        } else if (currentStage === 'gathering') {
          scaleZoom += (0.80 - scaleZoom) * 0.006;
        } else if (currentStage === 'vortex') {
          scaleZoom += (0.68 - scaleZoom) * 0.008;
        } else if (currentStage === 'heart-form' || currentStage === 'heart-light' || currentStage === 'heart-hold') {
          scaleZoom += (0.75 - scaleZoom) * 0.01;
        } else if (currentStage === 'fracture') {
          scaleZoom += (0.90 - scaleZoom) * 0.03;
        } else if (currentStage === 'universe' || currentStage === 'drift-final') {
          scaleZoom += (1.05 - scaleZoom) * 0.008;
        }
      }

      // Draw volumetric heart center glow core (Bloom) & volumetric rays (only during heart stages)
      if (currentStage === 'heart-form' || currentStage === 'heart-light' || currentStage === 'heart-hold') {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const baseHeartRadius = Math.min(canvas.width, canvas.height) * 0.34;
        
        let pulse = 1.0;
        let bloomAlphaMult = 0.05; // very subtle during forming

        if (currentStage === 'heart-light') {
          const elapsed = Date.now() - stageStartTimeRef.current;
          const progress = Math.min(1.0, elapsed / 2500);
          bloomAlphaMult = 0.05 + 0.95 * progress; // scale up as it lights up
        } else if (currentStage === 'heart-hold') {
          const elapsed = Date.now() - stageStartTimeRef.current;
          const progress = Math.min(1.0, elapsed / 1500);
          const pulseVal = Math.sin(progress * Math.PI);
          pulse = 1.0 + 0.18 * Math.pow(pulseVal, 4); // single dramatic heartbeat
          bloomAlphaMult = 1.0 + 1.8 * Math.pow(pulseVal, 4);
        }
        
        const heartSize = baseHeartRadius * pulse;
        
        // Pulsing core size
        const corePulse = 1.0 + (currentStage === 'heart-hold' ? 0.15 * Math.pow(Math.sin((Date.now() - stageStartTimeRef.current) / 1500 * Math.PI), 4) : 0);
        
        const bloom = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          heartSize * 0.75 * corePulse
        );
        bloom.addColorStop(0, `rgba(236, 72, 153, ${0.40 * bloomAlphaMult})`); // Pulsing core glow
        bloom.addColorStop(0.25, `rgba(139, 92, 246, ${0.22 * bloomAlphaMult})`); // Violet glow
        bloom.addColorStop(0.65, `rgba(236, 72, 153, ${0.05 * bloomAlphaMult})`);
        bloom.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Volumetric light rays radiating and rotating (disabled on mobile)
        const numRays = isMobile ? 0 : 10;
        const rayAngle = Date.now() * 0.00012;
        for (let i = 0; i < numRays; i++) {
          const angle = rayAngle + (i * Math.PI * 2) / numRays;
          const rayGrad = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, heartSize * 1.7
          );
          rayGrad.addColorStop(0, `rgba(236, 72, 153, ${0.06 * bloomAlphaMult})`);
          rayGrad.addColorStop(0.4, `rgba(139, 92, 246, ${0.03 * bloomAlphaMult})`);
          rayGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, heartSize * 1.7, angle - 0.10, angle + 0.10);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // ==========================================
      // PHASE 1: DEEP SPACE (Only background spaceStars drift)
      // ==========================================
      if (currentStage === 'deep-space') {
        // Nothing to update inside particles collection, just wait
      }

      // ==========================================
      // PHASE 2: GRAVITY GATHERING
      // ==========================================
      else if (currentStage === 'gathering') {
        particles.forEach(p => {
          // Accumulate gravity pull inward towards center (0, 0, 0)
          const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1;
          
          p.vx += -(p.x / dist) * 0.16;
          p.vy += -(p.y / dist) * 0.16;
          p.vz += -(p.z / dist) * 0.16;

          // Introduce minor floating turbulence for stardust feel
          p.vx += (Math.random() - 0.5) * 0.18;
          p.vy += (Math.random() - 0.5) * 0.18;
          p.vz += (Math.random() - 0.5) * 0.18;

          p.vx *= 0.94;
          p.vy *= 0.94;
          p.vz *= 0.94;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          const fov = 380;
          const safeZ = Math.max(-370, p.z);
          const perspective = fov / (fov + safeZ);
          const px = centerX + p.x * perspective;
          const py = centerY + p.y * perspective;
          const size = Math.max(0.1, p.size * perspective * 1.1);

          ctx.fillStyle = p.color;
          ctx.beginPath();
          safeArc(ctx, px, py, size);
          ctx.fill();
        });
      }

      // ==========================================
      // PHASE 3: ORBITING SWIRLING VORTEX
      // ==========================================
      else if (currentStage === 'vortex') {
        particles.forEach(p => {
          const dist = Math.sqrt(p.x * p.x + p.y * p.y) || 1;
          const dist3d = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1;
          
          // Radial force pulling in + tangential force creating swirl
          const ax = -(p.x / dist) * 0.20;
          const ay = -(p.y / dist) * 0.20;
          const tx = (-p.y / dist) * 0.75;
          const ty = (p.x / dist) * 0.75;

          p.vx += ax + tx;
          p.vy += ay + ty;
          p.vz += -(p.z / dist3d) * 0.18; // Compress Z towards disk plane

          p.vx *= 0.95;
          p.vy *= 0.95;
          p.vz *= 0.94;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          const fov = 380;
          const safeZ = Math.max(-370, p.z);
          const perspective = fov / (fov + safeZ);
          const px = centerX + p.x * perspective;
          const py = centerY + p.y * perspective;
          const size = Math.max(0.1, p.size * perspective * 1.2);

          ctx.fillStyle = p.color;
          ctx.beginPath();
          safeArc(ctx, px, py, size);
          ctx.fill();
        });
      }

      // ==========================================
      // PHASE 4 & 5: 3D HEART FORM & HOLD (Double-axis tumbling + pulsing hold)
      // ==========================================
      else if (currentStage === 'heart-form' || currentStage === 'heart-light' || currentStage === 'heart-hold') {
        const baseHeartRadius = Math.min(canvas.width, canvas.height) * 0.34;
        
        let pulse = 1.0;
        let glowMultiplier = 1.0;
        let brightness = 1.0;
        let pulseVal = 0;

        if (currentStage === 'heart-form') {
          brightness = 0.2; // Dim forming baseline
        } else if (currentStage === 'heart-hold') {
          const elapsed = Date.now() - stageStartTimeRef.current;
          const progress = Math.min(1.0, elapsed / 1500);
          pulseVal = Math.sin(progress * Math.PI);
          pulse = 1.0 + 0.18 * Math.pow(pulseVal, 4); // single dramatic heartbeat
          glowMultiplier = 1.0 + 1.8 * Math.pow(pulseVal, 4);
        }

        const heartSize = baseHeartRadius * pulse;
        const rotY = Date.now() * 0.0007;
        const rotX = Date.now() * 0.00045;

        const projectedParticles: Array<{
          px: number;
          py: number;
          size: number;
          alpha: number;
          color: string;
          shadowColor: string;
          shadowBlur: number;
          z: number;
          isOrbiter: boolean;
          history: Array<{ x: number; y: number; z: number }>;
        }> = [];

        particles.forEach((p, idx) => {
          let tx = 0;
          let ty = 0;
          let tz = 0;

          const rawTarget = heartPoints3D[idx % heartPoints3D.length];

          // Spark Orbiters wrapping the sculpture
          if (idx % 16 === 0) {
            if (p.orbitAngle === undefined) {
              p.orbitAngle = Math.random() * Math.PI * 2;
              p.orbitSpeed = Math.random() * 0.01 + 0.004;
              p.orbitRadius = heartSize * (0.85 + Math.random() * 0.45);
            }
            p.orbitAngle += p.orbitSpeed!;

            const ox = Math.cos(p.orbitAngle) * p.orbitRadius!;
            const oz = Math.sin(p.orbitAngle) * p.orbitRadius!;
            const oy = Math.sin(p.orbitAngle * 2) * (heartSize * 0.25);

            // Orbit rotation coordinates
            const oxRot = ox * Math.cos(rotY) - oz * Math.sin(rotY);
            const ozRot = ox * Math.sin(rotY) + oz * Math.cos(rotY);
            ty = oy * Math.cos(rotX) - ozRot * Math.sin(rotX);
            tx = oxRot;
            tz = oy * Math.sin(rotX) + ozRot * Math.cos(rotX);
          } else {
            // 3D rotation projection matrices
            const x1 = rawTarget.x * Math.cos(rotY) - rawTarget.z * Math.sin(rotY);
            const z1 = rawTarget.x * Math.sin(rotY) + rawTarget.z * Math.cos(rotY);
            const y2 = rawTarget.y * Math.cos(rotX) - z1 * Math.sin(rotX);
            const z2 = rawTarget.y * Math.sin(rotX) + z1 * Math.cos(rotX);

            tx = x1 * heartSize;
            ty = y2 * heartSize;
            tz = z2 * heartSize;
          }

          // Interpolation transition speeds
          const easeSpeed = currentStage === 'heart-form' ? 0.055 : 0.12;
          p.x += (tx + p.jitterX - p.x) * easeSpeed;
          p.y += (ty + p.jitterY - p.y) * easeSpeed;
          p.z += (tz - p.z) * easeSpeed;

          // Track 3D trails
          if (!p.history) p.history = [];
          p.history.push({ x: p.x, y: p.y, z: p.z });
          if (p.history.length > 3) p.history.shift();

          const fov = 380;
          const safeZ = Math.max(-370, p.z);
          const perspective = fov / (fov + safeZ);
          const px = centerX + p.x * perspective;
          const py = centerY + p.y * perspective;
          const depthSize = Math.max(0.1, p.size * perspective * 1.45);
          const depthAlpha = Math.max(0.08, Math.min(1.0, p.alpha * perspective));

          // Calculate energy wave light-up factor
          let particleBrightness = brightness;
          if (currentStage === 'heart-light') {
            const elapsed = Date.now() - stageStartTimeRef.current;
            const progress = Math.min(1.0, elapsed / 2500);
            const targetNormY = (1.0 - rawTarget.y) / 2.0; // bottom is 0, top is 1
            const delta = progress - targetNormY;
            const transitionWidth = 0.12;
            const level = Math.min(1.0, Math.max(0.0, delta / transitionWidth));
            particleBrightness = 0.2 + 0.8 * level; // transitions from 0.2 to 1.0
          }

          let finalAlpha = depthAlpha * particleBrightness;
          if (currentStage === 'heart-hold') {
            // slightly amplify alpha at peak of heartbeat pulse
            finalAlpha = depthAlpha * (1.0 + 0.35 * Math.pow(pulseVal, 4));
          }

          const twinkle = 0.4 + Math.sin(Date.now() * 0.0055 + p.id) * 0.4;
          
          let color = "";
          let shadowColor = "";
          let shadowBlur = 0;
          const isOrbiter = idx % 16 === 0;

          if (isOrbiter) {
            color = `rgba(253, 224, 71, ${finalAlpha * (0.65 + twinkle * 0.35)})`; // glowing gold orbiters
            shadowColor = "#FDE047";
            if (canvas.width >= 768) {
              shadowBlur = depthSize * 2.8 * (currentStage === 'heart-hold' ? glowMultiplier : 1.0);
            }
          } else {
            // Apply depth fog cooling
            if (p.z > 80) {
              color = `rgba(139, 92, 246, ${finalAlpha * 0.45 * (0.7 + twinkle * 0.3)})`; // violet fog
              shadowColor = "#8B5CF6";
              if (canvas.width >= 768) {
                shadowBlur = depthSize * 1.2 * (currentStage === 'heart-hold' ? glowMultiplier : 1.0);
              }
            } else {
              color = idx % 2 === 0
                ? `rgba(236, 72, 153, ${finalAlpha * (0.85 + twinkle * 0.15)})` 
                : `rgba(244, 63, 94, ${finalAlpha * (0.85 + twinkle * 0.15)})`;
              shadowColor = "#EC4899";
              if (canvas.width >= 768) {
                shadowBlur = depthSize * 2.2 * (currentStage === 'heart-hold' ? glowMultiplier : 1.0);
              }
            }
          }

          projectedParticles.push({
            px,
            py,
            size: depthSize,
            alpha: finalAlpha,
            color,
            shadowColor,
            shadowBlur,
            z: p.z,
            isOrbiter,
            history: [...p.history]
          });
        });

        // Depth sorting
        projectedParticles.sort((a, b) => b.z - a.z);

        // Render sorted volumetric elements
        projectedParticles.forEach(pt => {
          if (pt.history.length > 1) {
            ctx.beginPath();
            const fov = 380;
            const trailStart = pt.history[0];
            const safeZt = Math.max(-370, trailStart.z);
            const trailStartPerspective = fov / (fov + safeZt);
            const sx = centerX + trailStart.x * trailStartPerspective;
            const sy = centerY + trailStart.y * trailStartPerspective;

            ctx.moveTo(sx, sy);
            ctx.lineTo(pt.px, pt.py);
            ctx.strokeStyle = pt.isOrbiter 
              ? `rgba(253, 224, 71, ${pt.alpha * 0.28})`
              : `rgba(236, 72, 153, ${pt.alpha * 0.14})`;
            ctx.lineWidth = pt.size * 0.58;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.fillStyle = pt.color;
          if (!isMobile && pt.shadowBlur > 0) {
            ctx.shadowColor = pt.shadowColor;
            ctx.shadowBlur = pt.shadowBlur;
          }
          safeArc(ctx, pt.px, pt.py, pt.size);
          ctx.fill();
          if (!isMobile) {
            ctx.shadowBlur = 0;
          }
        });
      }

      // ==========================================
      // PHASE 6: CRYSTAL FRACTURE (Physical crystal shattering & slow-motion explosion)
      // ==========================================
      else if (currentStage === 'fracture') {
        // Initialize explosion velocities once upon entry
        if (!fractureInitRef.current) {
          fractureInitRef.current = true;
          particles.forEach(p => {
            const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1;
            // Explosion force vector outward from center
            const speed = Math.random() * 8.5 + 5.5;
            p.vx = (p.x / dist) * speed + (Math.random() - 0.5) * 3.5;
            p.vy = (p.y / dist) * speed + (Math.random() - 0.5) * 3.5;
            p.vz = (p.z / dist) * speed + (Math.random() - 0.5) * 3.5;
            p.alpha = 1.0; // Bring to full flash brightness
            p.history = [];
          });
        }

        particles.forEach(p => {
          // Slow-motion physics loop update
          p.x += p.vx * 0.30;
          p.y += p.vy * 0.30;
          p.z += p.vz * 0.30;

          // Drag resistance
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.vz *= 0.985;

          // Shards slowly shrink and fade
          p.alpha -= 0.009;
          
          if (p.alpha > 0) {
            const fov = 380;
            const safeZ = Math.max(-370, p.z);
            const perspective = fov / (fov + safeZ);
            const px = centerX + p.x * perspective;
            const py = centerY + p.y * perspective;
            const size = Math.max(0.1, p.size * perspective * 1.5);

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate((p.id % 6 - 3) * 0.15 + (Date.now() * 0.001 * (p.id % 2 === 0 ? 1 : -1)));
            
            const hSize = size * 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -hSize * 0.3);
            ctx.bezierCurveTo(0, -hSize * 0.6, -hSize / 2, -hSize * 0.6, -hSize / 2, -hSize * 0.3);
            ctx.bezierCurveTo(-hSize / 2, hSize * 0.1, 0, hSize * 0.45, 0, hSize * 0.7);
            ctx.bezierCurveTo(0, hSize * 0.45, hSize / 2, hSize * 0.1, hSize / 2, -hSize * 0.3);
            ctx.bezierCurveTo(hSize / 2, -hSize * 0.6, 0, -hSize * 0.6, 0, -hSize * 0.3);
            ctx.closePath();
            
            ctx.fillStyle = p.id % 3 === 0 
              ? `rgba(239, 68, 68, ${p.alpha})`  // red
              : p.id % 3 === 1 
              ? `rgba(244, 63, 94, ${p.alpha})`  // rose
              : `rgba(236, 72, 153, ${p.alpha})`; // pink
            ctx.fill();
            ctx.restore();
          }
        });
      }

      // ==========================================
      // PHASE 7: UNIVERSE DRIFT (Crystalline shards disperse and cool down into spaceStars)
      // ==========================================
      else if (currentStage === 'universe') {
        particles.forEach(p => {
          // Attenuate speed towards a slow ambient drift in 3D
          p.vx += ((Math.random() - 0.5) * 0.08 - p.vx) * 0.04;
          p.vy += (-(Math.random() * 0.2 + 0.08) - p.vy) * 0.04;
          p.vz += (0 - p.vz) * 0.04;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          if (p.alpha < 0.65) p.alpha += 0.015;

          const fov = 380;
          const safeZ = Math.max(-370, p.z);
          const perspective = fov / (fov + safeZ);
          const px = centerX + p.x * perspective;
          const py = centerY + p.y * perspective;
          const size = Math.max(0.1, p.size * perspective * 0.85);

          const twinkle = 0.5 + Math.sin(Date.now() * 0.003 + p.id) * 0.5;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate((p.id % 6 - 3) * 0.15 + (Date.now() * 0.001 * (p.id % 2 === 0 ? 1 : -1)));
          
          const hSize = size * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -hSize * 0.3);
          ctx.bezierCurveTo(0, -hSize * 0.6, -hSize / 2, -hSize * 0.6, -hSize / 2, -hSize * 0.3);
          ctx.bezierCurveTo(-hSize / 2, hSize * 0.1, 0, hSize * 0.45, 0, hSize * 0.7);
          ctx.bezierCurveTo(0, hSize * 0.45, hSize / 2, hSize * 0.1, hSize / 2, -hSize * 0.3);
          ctx.bezierCurveTo(hSize / 2, -hSize * 0.6, 0, -hSize * 0.6, 0, -hSize * 0.3);
          ctx.closePath();

          ctx.fillStyle = p.id % 3 === 0 
            ? `rgba(239, 68, 68, ${p.alpha * twinkle * 0.85})` 
            : p.id % 3 === 1
            ? `rgba(244, 63, 94, ${p.alpha * twinkle * 0.85})` 
            : `rgba(236, 72, 153, ${p.alpha * twinkle * 0.85})`;
          ctx.fill();
          ctx.restore();
        });
      }

      // ==========================================
      // DRIFT-FINAL
      // ==========================================
      else if (currentStage === 'drift-final') {
        particles.forEach(p => {
          // Attenuate speed towards a slow ambient drift in 3D
          p.vx += ((Math.random() - 0.5) * 0.08 - p.vx) * 0.04;
          p.vy += (-(Math.random() * 0.2 + 0.08) - p.vy) * 0.04;
          p.vz += (0 - p.vz) * 0.04;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          if (p.alpha < 0.65) p.alpha += 0.015;

          const fov = 380;
          const safeZ = Math.max(-370, p.z);
          const perspective = fov / (fov + safeZ);
          const px = centerX + p.x * perspective;
          const py = centerY + p.y * perspective;
          const size = Math.max(0.1, p.size * perspective * 0.85);

          const twinkle = 0.5 + Math.sin(Date.now() * 0.003 + p.id) * 0.5;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate((p.id % 6 - 3) * 0.15 + (Date.now() * 0.001 * (p.id % 2 === 0 ? 1 : -1)));
          
          const hSize = size * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -hSize * 0.3);
          ctx.bezierCurveTo(0, -hSize * 0.6, -hSize / 2, -hSize * 0.6, -hSize / 2, -hSize * 0.3);
          ctx.bezierCurveTo(-hSize / 2, hSize * 0.1, 0, hSize * 0.45, 0, hSize * 0.7);
          ctx.bezierCurveTo(0, hSize * 0.45, hSize / 2, hSize * 0.1, hSize / 2, -hSize * 0.3);
          ctx.bezierCurveTo(hSize / 2, -hSize * 0.6, 0, -hSize * 0.6, 0, -hSize * 0.3);
          ctx.closePath();

          ctx.fillStyle = p.id % 3 === 0 
            ? `rgba(239, 68, 68, ${p.alpha * twinkle * 0.85})` 
            : p.id % 3 === 1
            ? `rgba(244, 63, 94, ${p.alpha * twinkle * 0.85})` 
            : `rgba(236, 72, 153, ${p.alpha * twinkle * 0.85})`;
          ctx.fill();
          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasStarted]);

  // Heartbeat sound & volume playback control - deferred until hasStarted
  useEffect(() => {
    if (!hasStarted) return;

    const heartbeat = new Audio("https://assets.mixkit.co/active_storage/sfx/2047/2047-preview.mp3");
    heartbeat.loop = true;
    heartbeat.volume = 0.5;
    heartbeatAudioRef.current = heartbeat;

    const globalAudio = document.getElementById("bg-soundtrack-audio") as HTMLAudioElement | null;

    if (isPlaying) {
      heartbeat.play().catch(e => console.log("Heartbeat play blocked:", e));
      if (globalAudio) {
        globalAudio.volume = 0.25;
      }
    }

    return () => {
      heartbeat.pause();
      heartbeatAudioRef.current = null;
      if (globalAudio) {
        globalAudio.volume = 1.0;
      }
    };
  }, [hasStarted, isPlaying]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-black relative flex flex-col items-center justify-center overflow-hidden z-10"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block -z-10" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] bg-accent-glow/5 rounded-full blur-[170px] pointer-events-none animate-pulse-slow" />

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.98)]" />

      {/* Sequential Text Overlay Messaging */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
        <AnimatePresence mode="wait">
          {msgStage === 'bigger' && (
            <motion.div
              key="msg-bigger"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-center px-6 max-w-xl"
            >
              <h2 className="font-serif italic text-2xl md:text-3xl text-white text-glow leading-relaxed">
                {"\"All I dream of is your eyes, and touch\""}
              </h2>
            </motion.div>
          )}

          {msgStage === 'moments' && (
            <motion.div
              key="msg-moments"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-center px-6 max-w-xl"
            >
              <h2 className="font-serif italic text-2xl md:text-3xl text-white text-glow leading-relaxed">
                {"\"You can say that I'm a fool\""}
              </h2>
            </motion.div>
          )}

          {msgStage === 'birthday' && (
            <motion.div
              key="msg-birthday"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-center px-6 max-w-xl"
            >
              <h2 className="font-serif italic text-2xl md:text-3xl text-white text-glow leading-relaxed">
                {"\"But I call this Love\""}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
