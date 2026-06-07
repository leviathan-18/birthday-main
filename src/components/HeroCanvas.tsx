"use client";

import { useEffect, useRef } from "react";

interface NebulaCloud {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface Star {
  x: number;
  y: number;
  depth: number;
  size: number;
  twinkleSpeed: number;
  twinklePhase: number;
  baseAlpha: number;
}

interface LightOrb {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobblePhase: number;
  wobbleAmp: number;
  color: string;
}

interface CosmicDust {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  thickness: number;
}

interface LightStreak {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  thickness: number;
  alpha: number;
  fadeSpeed: number;
}

interface HeroCanvasProps {
  introStage: 'intro-silence' | 'intro-shooting' | 'intro-vortex' | 'intro-explode' | 'char-enter' | 'done';
}

export default function HeroCanvas({ introStage }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });
  const introStageRef = useRef(introStage);

  useEffect(() => {
    introStageRef.current = introStage;
  }, [introStage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isCanvasVisible = true;
    let isLoopRunning = true;
    const isMobile = window.innerWidth < 768;

    // Safe Canvas Arc Drawing Helper
    const safeArc = (c: CanvasRenderingContext2D, px: number, py: number, r: number) => {
      const sx = isFinite(px) ? px : 0;
      const sy = isFinite(py) ? py : 0;
      const sr = Math.max(0.1, isFinite(r) ? r : 0.1);
      c.arc(sx, sy, sr, 0, Math.PI * 2);
    };

    // 1. Initialize Nebula Clouds (Layer 2)
    const baseDim = Math.max(window.innerWidth, window.innerHeight);
    const nebulaClouds: NebulaCloud[] = [
      {
        x: window.innerWidth * 0.25,
        y: window.innerHeight * 0.3,
        baseRadius: baseDim * 0.5,
        radius: baseDim * 0.5,
        color: "rgba(29, 17, 53, 0.45)", // Deep royal indigo
        vx: 0.12,
        vy: -0.04,
        pulseSpeed: 0.0006,
        pulsePhase: 0,
      },
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight * 0.7,
        baseRadius: baseDim * 0.6,
        radius: baseDim * 0.6,
        color: "rgba(43, 15, 61, 0.4)", // Dark violet / purple
        vx: -0.08,
        vy: 0.06,
        pulseSpeed: 0.0004,
        pulsePhase: Math.PI / 3,
      },
      {
        x: window.innerWidth * 0.45,
        y: window.innerHeight * 0.6,
        baseRadius: baseDim * 0.45,
        radius: baseDim * 0.45,
        color: "rgba(236, 72, 153, 0.08)", // Soft pink
        vx: 0.06,
        vy: 0.10,
        pulseSpeed: 0.0009,
        pulsePhase: Math.PI / 2,
      },
      {
        x: window.innerWidth * 0.65,
        y: window.innerHeight * 0.25,
        baseRadius: baseDim * 0.4,
        radius: baseDim * 0.4,
        color: "rgba(59, 130, 246, 0.06)", // Soft blue
        vx: -0.09,
        vy: -0.08,
        pulseSpeed: 0.00075,
        pulsePhase: Math.PI / 4,
      }
    ];

    // Set dimensions
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const newBaseDim = Math.max(canvas.width, canvas.height);
      nebulaClouds[0].baseRadius = newBaseDim * 0.5;
      nebulaClouds[1].baseRadius = newBaseDim * 0.6;
      nebulaClouds[2].baseRadius = newBaseDim * 0.45;
      nebulaClouds[3].baseRadius = newBaseDim * 0.4;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 2. Initialize Living Star Field (Layer 1: bg, depth 1: mid, depth 2: fg)
    const stars: Star[] = [];
    const starCount = isMobile ? 120 : 420; // Expanded to 420 stars for high-density stars, reduced on mobile
    for (let i = 0; i < starCount; i++) {
      const depth = Math.floor(Math.random() * 3); // 0 (far/bg), 1 (mid), 2 (near/fg)
      let size = 0;
      let twinkleSpeed = 0;
      let baseAlpha = 0;
      
      if (depth === 0) {
        size = Math.random() * 0.7 + 0.3;
        twinkleSpeed = Math.random() * 0.006 + 0.003;
        baseAlpha = Math.random() * 0.35 + 0.15;
      } else if (depth === 1) {
        size = Math.random() * 0.8 + 0.6;
        twinkleSpeed = Math.random() * 0.012 + 0.006;
        baseAlpha = Math.random() * 0.45 + 0.35;
      } else {
        size = Math.random() * 1.0 + 1.2;
        twinkleSpeed = Math.random() * 0.02 + 0.01;
        baseAlpha = Math.random() * 0.4 + 0.5;
      }
      
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        depth,
        size,
        twinkleSpeed,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha,
      });
    }

    // 3. Initialize Floating Light Orbs (Layer 3/Foreground)
    const lightOrbs: LightOrb[] = [];
    const orbCount = isMobile ? 8 : 22; // 22 on desktop, reduced to 8 on mobile to save GPU cycles
    const orbColors = [
      "rgba(139, 92, 246, ",  // violet
      "rgba(236, 72, 153, ",  // pink
      "rgba(59, 130, 246, ",  // blue
      "rgba(167, 139, 250, "  // lavender
    ];
    for (let i = 0; i < orbCount; i++) {
      lightOrbs.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 5 + 3,
        alpha: Math.random() * 0.18 + 0.07,
        speedY: -(Math.random() * 0.2 + 0.08), // slow drift upward
        speedX: (Math.random() - 0.5) * 0.1,
        wobbleSpeed: Math.random() * 0.002 + 0.001,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: Math.random() * 0.4 + 0.2,
        color: orbColors[i % orbColors.length]
      });
    }

    // 4. Initialize Cosmic Dust Field (Layer 3)
    const cosmicDust: CosmicDust[] = [];
    const dustCount = isMobile ? 30 : 110; // Expanded to 110 stardust on desktop, reduced to 30 on mobile
    for (let i = 0; i < dustCount; i++) {
      const dustAngle = Math.random() * Math.PI * 2;
      cosmicDust.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.35 + 0.1,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        angle: dustAngle,
        speed: Math.random() * 0.005 + 0.002
      });
    }

    // 5. Initialize Diagonal Light Streaks (Layer 5)
    const lightStreaks: LightStreak[] = [];
    const streakCount = isMobile ? 1 : 4; // 4 on desktop, 1 on mobile
    for (let i = 0; i < streakCount; i++) {
      lightStreaks.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.6,
        length: Math.random() * 250 + 150,
        angle: Math.PI / 6 + (Math.random() - 0.5) * 0.1, // diagonal slant
        speed: Math.random() * 0.35 + 0.15, // very slow movement
        thickness: Math.random() * 0.8 + 0.3,
        alpha: Math.random() * 0.25 + 0.05,
        fadeSpeed: Math.random() * 0.0005 + 0.0002
      });
    }

    // 6. Shooting Stars Array (Layer 4)
    const shootingStars: ShootingStar[] = [];

    // Intro elements
    let introShootingStar: ShootingStar | null = null;
    const introVortexParticles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string; angle: number; radius: number }> = [];
    let introExplosionActive = false;
    const introExplosionParticles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }> = [];

    // Trigger immediate page-load "Wow" shooting stars
    const triggerWowLoadStars = () => {
      // Wow star 1: Left-to-right zoom behind the title
      setTimeout(() => {
        shootingStars.push({
          x: window.innerWidth * 0.05,
          y: window.innerHeight * 0.12,
          length: 260,
          vx: 21,
          vy: 8,
          alpha: 1.0,
          life: 50,
          maxLife: 50,
          thickness: 2.8
        });
      }, 300);

      // Wow star 2: Right-to-left crossing zoom behind the title
      setTimeout(() => {
        shootingStars.push({
          x: window.innerWidth * 0.95,
          y: window.innerHeight * 0.18,
          length: 200,
          vx: -19,
          vy: 9,
          alpha: 1.0,
          life: 44,
          maxLife: 44,
          thickness: 2.2
        });
      }, 950);
    };

    triggerWowLoadStars();

    // Mouse listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Scroll opacity fadeout & cleanup listener
    const handleScroll = () => {
      if (!canvas) return;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const startFade = vh * 0.40; // 40vh
      const endFade = vh * 0.80;   // 80vh

      if (scrollY >= endFade) {
        canvas.style.opacity = "0";
        canvas.style.display = "none";
        isCanvasVisible = false;
      } else if (scrollY <= startFade) {
        canvas.style.opacity = "1";
        canvas.style.display = "block";
        isCanvasVisible = true;
      } else {
        const progress = (scrollY - startFade) / (endFade - startFade);
        const opacity = 1 - progress;
        canvas.style.opacity = opacity.toString();
        canvas.style.display = "block";
        isCanvasVisible = true;
      }

      // Resume loop if it was paused and canvas became visible
      if (isCanvasVisible && !isLoopRunning) {
        isLoopRunning = true;
        render();
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger initial scroll check

    // Render loop
    const render = () => {
      if (!canvas || !ctx) return;

      // Stop loop if canvas is not visible
      if (!isCanvasVisible) {
        isLoopRunning = false;
        return;
      }

      isLoopRunning = true;

      // Base black background fill
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#030008"; // Ultra-premium luxury dark space background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Subtle continuous camera drift panning
      const camX = Math.sin(Date.now() * 0.0003) * 25;
      const camY = Math.cos(Date.now() * 0.00025) * 18;

      const currentIntroStage = introStageRef.current;

      // ==========================================
      // LAYER 1: TWINKLING DISTANT STARS (Twinkles & drifts on all stages)
      // ==========================================
      stars.forEach(star => {
        if (star.depth !== 0) return;

        // Move background star (very slow drift)
        star.x += 0.015;
        if (star.x > canvas.width) {
          star.x = 0;
          star.y = Math.random() * canvas.height;
        }

        // Twinkle
        star.twinklePhase += star.twinkleSpeed;
        const currentAlpha = star.baseAlpha * (0.35 + 0.65 * (Math.sin(star.twinklePhase) * 0.5 + 0.5));

        const sx = (star.x + camX + canvas.width) % canvas.width;
        const sy = (star.y + camY + canvas.height) % canvas.height;

        ctx.beginPath();
        safeArc(ctx, sx, sy, star.size);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
      });

      // ==========================================
      // INTRO MODE STAGE GRAPHICS
      // ==========================================
      if (currentIntroStage === 'intro-silence') {
        // Phase 1: Everything starts black. Silence. Only tiny stars (Layer 1) are visible.
        // Handled above.
      } 
      
      else if (currentIntroStage === 'intro-shooting') {
        // Phase 2: A massive shooting star crosses the screen.
        if (introShootingStar === null) {
          introShootingStar = {
            x: -200,
            y: canvas.height * 0.20,
            length: 290,
            vx: (canvas.width + 400) / 45, // cross in 45 frames
            vy: (canvas.height * 0.35) / 45,
            alpha: 1.0,
            life: 45,
            maxLife: 45,
            thickness: 4.5
          };
        }

        const ss = introShootingStar;
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life--;

        // Spawn trailing vortex particles
        if (ss.life > 0 && Math.random() < 0.95) {
          for (let k = 0; k < 2; k++) {
            introVortexParticles.push({
              x: ss.x - ss.vx * (Math.random() * 2),
              y: ss.y - ss.vy * (Math.random() * 2),
              vx: (Math.random() - 0.5) * 1.5 - ss.vx * 0.12,
              vy: (Math.random() - 0.5) * 1.5 - ss.vy * 0.12,
              size: Math.random() * 2.8 + 1.2,
              alpha: 1.0,
              color: Math.random() < 0.4 ? "#3B82F6" : Math.random() < 0.7 ? "#EC4899" : "#8B5CF6",
              angle: Math.random() * Math.PI * 2,
              radius: Math.random() * 120 + 60
            });
          }
        }

        if (ss.life > 0) {
          const pct = ss.life / ss.maxLife;
          const sx = ss.x - ss.vx * (ss.length / 8) * pct;
          const sy = ss.y - ss.vy * (ss.length / 8) * pct;

          ctx.globalCompositeOperation = "screen";
          const grad = ctx.createLinearGradient(sx, sy, ss.x, ss.y);
          grad.addColorStop(0, "rgba(139, 92, 246, 0)");
          grad.addColorStop(0.5, `rgba(236, 72, 153, ${pct * 0.55})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${pct})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = ss.thickness;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ss.x, ss.y);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        }

        // Draw and update active trail particles
        introVortexParticles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.008;
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.alpha})`);
          ctx.beginPath();
          safeArc(ctx, p.x, p.y, p.size);
          ctx.fill();
        });
      }

      else if (currentIntroStage === 'intro-vortex') {
        // Phase 3: Particles swirl into a galaxy-like central vortex.
        ctx.globalCompositeOperation = "screen";
        introVortexParticles.forEach(p => {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const d = Math.sqrt(dx*dx + dy*dy) || 1;

          // Spiral acceleration force (radial attraction + tangential velocity)
          const pull = 0.22;
          const orbit = 0.95;

          p.vx += -(dx / d) * pull + (-dy / d) * orbit;
          p.vy += -(dy / d) * pull + (dx / d) * orbit;

          p.vx *= 0.94;
          p.vy *= 0.94;

          p.x += p.vx;
          p.y += p.vy;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          safeArc(ctx, p.x, p.y, p.size * 1.15);
          ctx.fill();
        });
        ctx.globalCompositeOperation = "source-over";
      }

      else if (currentIntroStage === 'intro-explode') {
        // Phase 4: Galaxy vortex explodes outward.
        if (!introExplosionActive) {
          introExplosionActive = true;
          // Spawn colorful stardust explosion particles from center (fewer on mobile)
          const explodeCount = isMobile ? 80 : 240;
          for (let i = 0; i < explodeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 14 + 7.5;
            introExplosionParticles.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 3.8 + 1.2,
              alpha: 1.0,
              color: i % 3 === 0 ? "#3B82F6" : i % 3 === 1 ? "#EC4899" : "#8B5CF6"
            });
          }
        }

        ctx.globalCompositeOperation = "screen";
        introExplosionParticles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.018; // Fade out
          p.vx *= 0.975;
          p.vy *= 0.975;

          if (p.alpha > 0) {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            safeArc(ctx, p.x, p.y, p.size);
            ctx.fill();
          }
        });
        ctx.globalCompositeOperation = "source-over";
      }

      // ==========================================
      // ACTIVE STAGES: LAYERED SYSTEMS (L1 - L5)
      // ==========================================
      else {
        // Clean up intro references
        introShootingStar = null;
        introExplosionActive = false;
        introVortexParticles.length = 0;
        introExplosionParticles.length = 0;

        // ==========================================
        // LAYER 2: NEBULA CLOUDS (Shifting atmospheric glows)
        // ==========================================
        ctx.globalCompositeOperation = "screen";
        nebulaClouds.forEach(cloud => {
          cloud.x += cloud.vx;
          cloud.y += cloud.vy;

          if (cloud.x - cloud.radius > canvas.width) cloud.x = -cloud.radius;
          if (cloud.x + cloud.radius < 0) cloud.x = canvas.width + cloud.radius;
          if (cloud.y - cloud.radius > canvas.height) cloud.y = -cloud.radius;
          if (cloud.y + cloud.radius < 0) cloud.y = canvas.height + cloud.radius;

          cloud.pulsePhase += cloud.pulseSpeed;
          cloud.radius = cloud.baseRadius * (1 + 0.12 * Math.sin(cloud.pulsePhase));

          const cloudGrad = ctx.createRadialGradient(
            cloud.x + camX * 0.3,
            cloud.y + camY * 0.3,
            0,
            cloud.x + camX * 0.3,
            cloud.y + camY * 0.3,
            cloud.radius
          );
          cloudGrad.addColorStop(0, cloud.color);
          cloudGrad.addColorStop(0.4, cloud.color.replace(/[\d.]+\)$/, `${parseFloat(cloud.color.match(/[\d.]+\)$/)?.[0] || "0.2") * 0.5})`));
          cloudGrad.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          safeArc(ctx, cloud.x + camX * 0.3, cloud.y + camY * 0.3, cloud.radius);
          ctx.fill();
        });
        ctx.globalCompositeOperation = "source-over";

        // Draw middle depth stars (Layer 1 - depth 1)
        stars.forEach(star => {
          if (star.depth !== 1) return;

          star.x += 0.045;
          if (star.x > canvas.width) {
            star.x = 0;
            star.y = Math.random() * canvas.height;
          }

          star.twinklePhase += star.twinkleSpeed;
          const currentAlpha = star.baseAlpha * (0.35 + 0.65 * (Math.sin(star.twinklePhase) * 0.5 + 0.5));

          const sx = (star.x + camX * 1.5 + canvas.width) % canvas.width;
          const sy = (star.y + camY * 1.5 + canvas.height) % canvas.height;

          ctx.beginPath();
          safeArc(ctx, sx, sy, star.size);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          ctx.fill();
        });

        // ==========================================
        // LAYER 5: DIAGONAL LIGHT STREAKS
        // ==========================================
        ctx.globalCompositeOperation = "screen";
        lightStreaks.forEach((streak, idx) => {
          streak.x += Math.cos(streak.angle) * streak.speed;
          streak.y += Math.sin(streak.angle) * streak.speed;
          
          streak.alpha -= streak.fadeSpeed;
          if (streak.alpha <= 0) {
            lightStreaks[idx] = {
              x: Math.random() * canvas.width * 0.4,
              y: Math.random() * canvas.height * 0.6,
              length: Math.random() * 260 + 140,
              angle: Math.PI / 6 + (Math.random() - 0.5) * 0.08,
              speed: Math.random() * 0.4 + 0.2,
              thickness: Math.random() * 0.7 + 0.3,
              alpha: Math.random() * 0.22 + 0.05,
              fadeSpeed: Math.random() * 0.0006 + 0.0002
            };
          }

          const grad = ctx.createLinearGradient(
            streak.x + camX * 0.6, streak.y + camY * 0.6,
            streak.x + camX * 0.6 + Math.cos(streak.angle) * streak.length,
            streak.y + camY * 0.6 + Math.sin(streak.angle) * streak.length
          );
          grad.addColorStop(0, "rgba(139, 92, 246, 0)");
          grad.addColorStop(0.5, `rgba(236, 72, 153, ${streak.alpha * 0.4})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${streak.alpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = streak.thickness;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(streak.x + camX * 0.6, streak.y + camY * 0.6);
          ctx.lineTo(
            streak.x + camX * 0.6 + Math.cos(streak.angle) * streak.length,
            streak.y + camY * 0.6 + Math.sin(streak.angle) * streak.length
          );
          ctx.stroke();
        });
        ctx.globalCompositeOperation = "source-over";

        // ==========================================
        // LAYER 3: FOREGROUND STARS, DUST & ORBS
        // ==========================================
        // Near Stars (Layer 1 - depth 2)
        stars.forEach(star => {
          if (star.depth !== 2) return;

          star.x += 0.095;
          if (star.x > canvas.width) {
            star.x = 0;
            star.y = Math.random() * canvas.height;
          }

          star.twinklePhase += star.twinkleSpeed;
          const currentAlpha = star.baseAlpha * (0.35 + 0.65 * (Math.sin(star.twinklePhase) * 0.5 + 0.5));

          const sx = (star.x + camX * 2.2 + canvas.width) % canvas.width;
          const sy = (star.y + camY * 2.2 + canvas.height) % canvas.height;

          ctx.beginPath();
          safeArc(ctx, sx, sy, star.size);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          
          ctx.shadowColor = "#ffffff";
          if (canvas.width >= 768) {
            ctx.shadowBlur = star.size * 2.5;
          }
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        });

        // Mouse Aura Glow (only on non-mobile devices)
        if (!isMobile) {
          const mouse = mouseRef.current;
          mouse.x += (mouse.targetX - mouse.x) * 0.08;
          mouse.y += (mouse.targetY - mouse.y) * 0.08;

          if (mouse.active) {
            ctx.globalCompositeOperation = "screen";
            const aura = ctx.createRadialGradient(
              mouse.x,
              mouse.y,
              0,
              mouse.x,
              mouse.y,
              260
            );
            aura.addColorStop(0, "rgba(139, 92, 246, 0.08)");
            aura.addColorStop(0.5, "rgba(236, 72, 153, 0.035)");
            aura.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = aura;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = "source-over";
          }
        }

        // Floating Light Orbs (Composite screen)
        ctx.globalCompositeOperation = "screen";
        lightOrbs.forEach(orb => {
          orb.y += orb.speedY;
          orb.x += orb.speedX;

          orb.wobblePhase += orb.wobbleSpeed;
          const currentX = orb.x + Math.sin(orb.wobblePhase) * orb.wobbleAmp * 15;

          if (orb.y < -20) {
            orb.y = canvas.height + 20;
            orb.x = Math.random() * canvas.width;
          }
          if (orb.x < -20) orb.x = canvas.width + 20;
          if (orb.x > canvas.width + 20) orb.x = -20;

          const orbGrad = ctx.createRadialGradient(
            currentX + camX * 1.8, orb.y + camY * 1.8, 0,
            currentX + camX * 1.8, orb.y + camY * 1.8, orb.size
          );
          orbGrad.addColorStop(0, orb.color + `${orb.alpha})`);
          orbGrad.addColorStop(0.5, orb.color + `${orb.alpha * 0.45})`);
          orbGrad.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          safeArc(ctx, currentX + camX * 1.8, orb.y + camY * 1.8, orb.size);
          ctx.fill();
        });

        // Drifting Cosmic Dust
        cosmicDust.forEach(dust => {
          dust.angle += dust.speed * 0.2;
          dust.x += Math.cos(dust.angle) * dust.speed * 12 + dust.vx;
          dust.y += Math.sin(dust.angle) * dust.speed * 12 + dust.vy;

          if (dust.x < 0) dust.x = canvas.width;
          if (dust.x > canvas.width) dust.x = 0;
          if (dust.y < 0) dust.y = canvas.height;
          if (dust.y > canvas.height) dust.y = 0;

          const pulseAlpha = dust.alpha * (0.65 + Math.sin(Date.now() * 0.001 + dust.size) * 0.35);

          ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.38})`;
          ctx.beginPath();
          safeArc(ctx, dust.x + camX * 2.0, dust.y + camY * 2.0, dust.size);
          ctx.fill();
        });
        ctx.globalCompositeOperation = "source-over";

        // ==========================================
        // LAYER 4: SHOOTING STARS
        // ==========================================
        if (Math.random() < 0.008 && shootingStars.length < (isMobile ? 2 : 5)) {
          const goLeft = Math.random() < 0.4;
          const startX = goLeft ? canvas.width * (0.6 + Math.random() * 0.3) : canvas.width * (0.1 + Math.random() * 0.3);
          const startY = Math.random() * canvas.height * 0.4;
          
          const baseAngle = goLeft ? Math.PI * 0.8 : Math.PI * 0.15;
          const angle = baseAngle + (Math.random() - 0.5) * (Math.PI / 8);
          const speed = Math.random() * 10 + 12;
          const length = Math.random() * 120 + 70;
          const maxLife = Math.random() * 28 + 18;

          shootingStars.push({
            x: startX,
            y: startY,
            length,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1.0,
            life: maxLife,
            maxLife,
            thickness: Math.random() * 1.5 + 0.6
          });
        }

        ctx.globalCompositeOperation = "screen";
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const ss = shootingStars[i];
          ss.x += ss.vx;
          ss.y += ss.vy;
          ss.life--;

          if (ss.life <= 0) {
            shootingStars.splice(i, 1);
            continue;
          }

          ss.alpha = ss.life / ss.maxLife;

          const trailFactor = 1.6;
          const sx = ss.x - ss.vx * (ss.length / 10) * ss.alpha * trailFactor;
          const sy = ss.y - ss.vy * (ss.length / 10) * ss.alpha * trailFactor;

          const gradient = ctx.createLinearGradient(sx, sy, ss.x, ss.y);
          gradient.addColorStop(0, "rgba(139, 92, 246, 0)");
          gradient.addColorStop(0.5, `rgba(236, 72, 153, ${ss.alpha * 0.45})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = ss.thickness;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ss.x, ss.y);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 block pointer-events-none transition-opacity duration-300"
    />
  );
}
