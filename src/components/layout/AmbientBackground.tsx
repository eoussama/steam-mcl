import { useEffect, useRef } from "react";



type TParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

const PARTICLE_DENSITY = 1 / 28_000;
const MAX_PARTICLES = 60;
const PARTICLE_RGB = "102, 192, 244";

/**
 * @description
 * Fixed ambient backdrop: soft glows plus a light canvas particle field. The canvas pauses while the tab is
 * hidden and stays still when the visitor prefers reduced motion.
 *
 * @returns The background layer.
 */
export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let frame = 0;
    let width = 0;
    let height = 0;
    let particles: Array<TParticle> = [];

    const seed = () => {
      const count = Math.min(MAX_PARTICLES, Math.round(width * height * PARTICLE_DENSITY));

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.35,
      }));
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        context.beginPath();
        context.fillStyle = `rgba(${PARTICLE_RGB}, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fill();
      }
    };

    const step = () => {
      for (const particle of particles) {
        particle.x = (particle.x + particle.vx + width) % width;
        particle.y = (particle.y + particle.vy + height) % height;
      }

      draw();
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      draw();

      if (!motionQuery.matches && !document.hidden) {
        frame = requestAnimationFrame(step);
      }
    };

    resize();
    start();

    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });

    observer.observe(canvas);
    motionQuery.addEventListener("change", start);
    document.addEventListener("visibilitychange", start);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motionQuery.removeEventListener("change", start);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden ambient-gradient">
      <div className="absolute -top-32 right-[-10%] size-[28rem] rounded-full bg-steam-blue/15 blur-3xl will-change-transform animate-float" />
      <div className="absolute bottom-[-20%] left-[-10%] size-[32rem] rounded-full bg-steam-slate/20 blur-3xl will-change-transform animate-float [animation-delay:-4s]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
};
