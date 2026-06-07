"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

declare global {
  interface Window {
    lastScrollVelocity?: number;
  }
}

interface PhysicsBodyData {
  type: "balloon" | "confetti" | "star" | "icon";
  color?: string;
  size: number;
  emoji?: string;
}

interface CustomBody extends Matter.Body {
  customData: PhysicsBodyData;
}

export default function PhysicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Matter.js engine modules
    const { Engine, Bodies, Composite } = Matter;

    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = -0.3; // Default antigravity (float up)

    const isMobile = window.innerWidth < 768;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Track touch coordinates for mobile devices
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    window.addEventListener("touchmove", handleTouchMove);

    // Clean up mouse position when cursor leaves window
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mouseleave", handleMouseLeave);

    // Spawners configurations
    const colors = [
      "#EC4899", // pink-glow
      "#8B5CF6", // violet-glow
      "#A78BFA", // lavender
      "#F472B6", // light pink
      "#FFE082", // gold
      "#3B82F6", // elegant blue
    ];
    
    const emojis = ["🎵", "❤️", "🎁", "✨", "🎈"];

    const bodies: CustomBody[] = [];

    // Create left/right boundary walls to keep elements inside screen bounds
    const wallOptions = { isStatic: true, friction: 0, restitution: 0.8 };
    let leftWall = Bodies.rectangle(-20, canvas.height / 2, 40, canvas.height * 2, wallOptions);
    let rightWall = Bodies.rectangle(canvas.width + 20, canvas.height / 2, 40, canvas.height * 2, wallOptions);
    Composite.add(engine.world, [leftWall, rightWall]);

    // Spawner Helper
    const spawnParticle = (
      type: "balloon" | "confetti" | "star" | "icon",
      yPos: number
    ) => {
      const rx = Math.random() * canvas.width;
      let body: Matter.Body;

      if (type === "balloon") {
        const size = Math.random() * 12 + 16; // Balloon radius
        body = Bodies.circle(rx, yPos, size, {
          frictionAir: Math.random() * 0.02 + 0.03, // float slowly
          restitution: 0.7,
          density: 0.001,
        });
        const cBody = body as CustomBody;
        cBody.customData = {
          type,
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
        };

      } else if (type === "confetti") {
        const size = Math.random() * 4 + 8; // Confetti size
        body = Bodies.rectangle(rx, yPos, size, size * 1.5, {
          frictionAir: Math.random() * 0.03 + 0.04,
          restitution: 0.5,
          angle: Math.random() * Math.PI * 2,
        });
        const cBody = body as CustomBody;
        cBody.customData = {
          type,
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
        };

      } else if (type === "star") {
        const size = Math.random() * 6 + 10; // Star outer radius
        body = Bodies.circle(rx, yPos, size, {
          frictionAir: Math.random() * 0.025 + 0.035,
          restitution: 0.6,
        });
        const cBody = body as CustomBody;
        cBody.customData = {
          type,
          size,
        };

      } else {
        // Emojis / Floating icons
        const size = Math.random() * 5 + 12; // Text/Icon size
        body = Bodies.circle(rx, yPos, size, {
          frictionAir: Math.random() * 0.02 + 0.03,
          restitution: 0.65,
        });
        const cBody = body as CustomBody;
        cBody.customData = {
          type,
          size,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        };
      }

      bodies.push(body as CustomBody);
      Composite.add(engine.world, body);
    };

    // Initial Spawning spread across viewport height
    const totalBalloons = isMobile ? 3 : 8;
    const totalConfetti = isMobile ? 8 : 22;
    const totalStars = isMobile ? 4 : 12;
    const totalIcons = isMobile ? 4 : 10;

    for (let i = 0; i < totalBalloons; i++) spawnParticle("balloon", Math.random() * canvas.height);
    for (let i = 0; i < totalConfetti; i++) spawnParticle("confetti", Math.random() * canvas.height);
    for (let i = 0; i < totalStars; i++) spawnParticle("star", Math.random() * canvas.height);
    for (let i = 0; i < totalIcons; i++) spawnParticle("icon", Math.random() * canvas.height);

    let animationFrameId: number;

    const renderLoop = () => {
      // 1. Progress Matter.js physics engine
      Engine.update(engine, 16.666); // standard 60fps tick duration

      // 2. Clear canvas drawing frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Recreate walls if viewport size changes
      if (leftWall.position.y !== canvas.height / 2 || rightWall.position.x !== canvas.width + 20) {
        Composite.remove(engine.world, [leftWall, rightWall]);
        leftWall = Bodies.rectangle(-20, canvas.height / 2, 40, canvas.height * 2, wallOptions);
        rightWall = Bodies.rectangle(canvas.width + 20, canvas.height / 2, 40, canvas.height * 2, wallOptions);
        Composite.add(engine.world, [leftWall, rightWall]);
      }

      // 3. Process each particle body
      bodies.forEach((body) => {
        const data = body.customData;
        if (!data) return;

        // Reset particle if it floats off top edge
        if (body.position.y < -data.size * 2.5) {
          Matter.Body.setPosition(body, {
            x: Math.random() * canvas.width,
            y: canvas.height + data.size * 2,
          });
          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 1.5,
            y: -Math.random() * 1.5 - 0.5,
          });
        }

        // Horizontal screen wrap helper
        if (body.position.x < -data.size * 2) {
          Matter.Body.setPosition(body, { x: canvas.width + data.size, y: body.position.y });
        } else if (body.position.x > canvas.width + data.size * 2) {
          Matter.Body.setPosition(body, { x: -data.size, y: body.position.y });
        }

        // Apply mouse constraint push force (cursor repulsion)
        const dx = body.position.x - mouseRef.current.x;
        const dy = body.position.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) * 0.000028;
          const angle = Math.atan2(dy, dx);
          Matter.Body.applyForce(body, body.position, {
            x: Math.cos(angle) * force,
            y: Math.sin(angle) * force,
          });
        }

        // 4. Draw customized shapes onto 2D Canvas
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        if (data.type === "balloon") {
          // Draw glossy balloon body
          ctx.beginPath();
          ctx.fillStyle = data.color || "#FFF";
          ctx.ellipse(0, 0, data.size * 0.78, data.size, 0, 0, Math.PI * 2);
          ctx.fill();

          // Highlight/Specular Reflection sheen
          ctx.beginPath();
          ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
          ctx.ellipse(-data.size * 0.22, -data.size * 0.35, data.size * 0.2, data.size * 0.35, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          // Bottom tie node
          ctx.beginPath();
          ctx.moveTo(0, data.size);
          ctx.lineTo(-4, data.size + 5);
          ctx.lineTo(4, data.size + 5);
          ctx.closePath();
          ctx.fillStyle = data.color || "#FFF";
          ctx.fill();

          // Balloon thread line string
          ctx.beginPath();
          ctx.moveTo(0, data.size + 5);
          ctx.bezierCurveTo(-2, data.size + 14, 2, data.size + 24, 0, data.size + 36);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
          ctx.lineWidth = 0.8;
          ctx.stroke();

        } else if (data.type === "confetti") {
          ctx.beginPath();
          ctx.rect(-data.size / 2, -data.size * 0.7, data.size, data.size * 1.4);
          ctx.fillStyle = data.color || "#FFF";
          ctx.fill();

        } else if (data.type === "star") {
          ctx.beginPath();
          ctx.fillStyle = "#FFE082"; // soft yellow gold
          ctx.shadowColor = "#FBBF24";
          ctx.shadowBlur = 3;
          
          const spikes = 5;
          const outerR = data.size;
          const innerR = data.size * 0.42;
          
          const angleStep = Math.PI / spikes;
          let currentAngle = (Math.PI / 2) * 3;
          
          ctx.moveTo(0, -outerR);
          for (let i = 0; i < spikes; i++) {
            let px = Math.cos(currentAngle) * outerR;
            let py = Math.sin(currentAngle) * outerR;
            ctx.lineTo(px, py);
            currentAngle += angleStep;

            px = Math.cos(currentAngle) * innerR;
            py = Math.sin(currentAngle) * innerR;
            ctx.lineTo(px, py);
            currentAngle += angleStep;
          }
          ctx.closePath();
          ctx.fill();

        } else if (data.type === "icon") {
          ctx.font = `${data.size * 1.45}px Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(data.emoji || "", 0, 0);
        }

        ctx.restore();
      });

      // 5. Adjust antigravity strength dynamically based on scroll velocity (Lenis delta)
      if (typeof window !== "undefined") {
        const vel = window.lastScrollVelocity || 0;
        
        // Decay the last scroll velocity smoothly to rest
        window.lastScrollVelocity = vel * 0.94;

        // Apply scroll delta to Matter.js gravity
        engine.gravity.y = -0.3 - Math.min(Math.abs(vel) * 0.08, 2.5); // float up faster when scrolling
        engine.gravity.x = Math.max(-0.8, Math.min(vel * 0.035, 0.8)); // sway sideways
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      Composite.clear(engine.world, false);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-15 mix-blend-screen"
    />
  );
}
