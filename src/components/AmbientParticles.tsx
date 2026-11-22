import React, { useEffect, useRef } from 'react';
import { useGrimoireStore } from '../store/useGrimoireStore';

export const AmbientParticles: React.FC = () => {
  const enabled = useGrimoireStore((s) => s.ambientParticles);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const flakes = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.9 + Math.random() * 1.6,
      vy: 0.25 + Math.random() * 0.45,
      vx: (Math.random() - 0.5) * 0.3,
      alpha: 0.14 + Math.random() * 0.25,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const f of flakes) {
        f.y += f.vy;
        f.x += f.vx;
        if (f.y > canvas.height) {
          f.y = -4;
          f.x = Math.random() * canvas.width;
        }
        if (f.x < 0) f.x = canvas.width;
        if (f.x > canvas.width) f.x = 0;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 215, 230, ${f.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10"
    />
  );
};
