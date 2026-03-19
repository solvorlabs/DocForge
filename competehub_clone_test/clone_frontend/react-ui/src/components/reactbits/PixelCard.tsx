import { useRef, useEffect, type ReactNode } from 'react';

interface PixelCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'yellow' | 'blue' | 'pink' | 'red';
  gap?: number;
  speed?: number;
  noFocus?: boolean;
}

const VARIANTS: Record<string, string[]> = {
  default: ['#a855f7', '#7c3aed', '#c084fc', '#ef4444'],
  yellow: ['#fbbf24', '#f59e0b', '#fde68a'],
  blue:   ['#3b82f6', '#06b6d4', '#93c5fd'],
  pink:   ['#ec4899', '#f472b6', '#a855f7'],
  red:    ['#ef4444', '#dc2626', '#f97316'],
};

interface Pixel {
  x: number; y: number;
  color: string; speed: number;
  size: number; active: boolean;
  target: number; current: number;
}

export function PixelCard({
  children, className = '', variant = 'default', gap = 6, speed = 30, noFocus = false,
}: PixelCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animRef = useRef<number>(0);
  const colors = VARIANTS[variant] || VARIANTS.default;

  function initPixels() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width, h = canvas.height;
    const pixels: Pixel[] = [];
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        pixels.push({
          x, y, color: colors[Math.floor(Math.random() * colors.length)],
          speed: 0.3 + Math.random() * 0.6, size: gap * 0.85,
          active: false, target: 0, current: 0,
        });
      }
    }
    pixelsRef.current = pixels;
  }

  function drawPixels() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pixelsRef.current.forEach(p => {
      if (p.current > 0) {
        ctx.globalAlpha = p.current;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    });
  }

  function animateIn() {
    cancelAnimationFrame(animRef.current);
    pixelsRef.current.forEach(p => { p.active = true; p.target = 1; });
    function step() {
      let done = true;
      pixelsRef.current.forEach(p => {
        if (p.active) {
          p.current = Math.min(p.current + p.speed * 0.05, p.target);
          if (Math.abs(p.current - p.target) > 0.01) done = false;
        }
      });
      drawPixels();
      if (!done) animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
  }

  function animateOut() {
    cancelAnimationFrame(animRef.current);
    pixelsRef.current.forEach(p => { p.target = 0; });
    function step() {
      let done = true;
      pixelsRef.current.forEach(p => {
        p.current = Math.max(p.current - p.speed * 0.05, p.target);
        if (Math.abs(p.current - p.target) > 0.01) done = false;
      });
      drawPixels();
      if (!done) animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
  }

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      initPixels();
    });
    ro.observe(container);
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    initPixels();
    return () => { ro.disconnect(); cancelAnimationFrame(animRef.current); };
  }, [gap, variant]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
      onFocus={noFocus ? undefined : animateIn}
      onBlur={noFocus ? undefined : animateOut}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}
