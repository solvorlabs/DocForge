import { useRef, useCallback, type ReactNode } from 'react';

interface Spark {
  x: number; y: number; angle: number; life: number; speed: number;
}

interface ClickSparkProps {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  className?: string;
}

export function ClickSpark({
  children,
  sparkColor = '#a855f7',
  sparkSize = 4,
  sparkRadius = 28,
  sparkCount = 10,
  className,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparksRef.current = sparksRef.current.filter(s => s.life > 0);

    sparksRef.current.forEach(s => {
      const t = 1 - s.life;
      const x = s.x + Math.cos(s.angle) * sparkRadius * t;
      const y = s.y + Math.sin(s.angle) * sparkRadius * t;
      ctx.save();
      ctx.globalAlpha = s.life;
      ctx.fillStyle = sparkColor;
      ctx.shadowColor = sparkColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, sparkSize * s.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      s.life -= 0.035;
    });

    if (sparksRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [sparkColor, sparkRadius, sparkSize]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x, y,
      angle: (i / sparkCount) * Math.PI * 2,
      life: 1,
      speed: 1 + Math.random() * 0.5,
    }));
    sparksRef.current.push(...newSparks);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  }, [sparkCount, draw]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`} onClick={handleClick}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20 w-full h-full" />
      {children}
    </div>
  );
}
