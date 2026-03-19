// @ts-nocheck
import { useEffect, useRef } from 'react';

interface LightningProps {
  hue?: number;         // 0-360, default 270 (violet)
  xOffset?: number;     // fraction of width, default 0
  speed?: number;       // default 1
  intensity?: number;   // 0-1, default 1
  size?: number;        // stroke width base, default 1
  className?: string;
  style?: React.CSSProperties;
}

interface Bolt {
  points: { x: number; y: number }[];
  alpha: number;
  life: number;
  maxLife: number;
  width: number;
  hue: number;
  branches: Bolt[];
}

function createBolt(
  x1: number, y1: number, x2: number, y2: number,
  roughness: number, depth: number, hue: number, width: number
): Bolt {
  const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const segments = Math.max(4, Math.floor(dist / 40));

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const px = x1 + dx * t + (Math.random() - 0.5) * roughness * dist * 0.5;
    const py = y1 + dy * t + (Math.random() - 0.5) * roughness * dist * 0.2;
    points.push({ x: px, y: py });
  }
  points.push({ x: x2, y: y2 });

  const branches: Bolt[] = [];
  if (depth > 0) {
    const branchCount = depth > 1 ? 2 : 1;
    for (let b = 0; b < branchCount; b++) {
      const idx = Math.floor(Math.random() * (points.length - 2)) + 1;
      const pt = points[idx];
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
      const len = dist * (0.3 + Math.random() * 0.4);
      branches.push(createBolt(
        pt.x, pt.y,
        pt.x + Math.cos(angle) * len,
        pt.y + Math.sin(angle) * len,
        roughness * 0.8, depth - 1, hue + (Math.random() - 0.5) * 30, width * 0.5
      ));
    }
  }

  return {
    points, alpha: 0.9 + Math.random() * 0.1,
    life: 0, maxLife: 8 + Math.floor(Math.random() * 8),
    width, hue, branches,
  };
}

function drawBolt(ctx: CanvasRenderingContext2D, bolt: Bolt, alpha: number) {
  if (bolt.points.length < 2) return;
  const progress = bolt.life / bolt.maxLife;
  const opacity = alpha * bolt.alpha * (1 - progress);

  ctx.beginPath();
  ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
  for (let i = 1; i < bolt.points.length; i++) {
    ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
  }
  ctx.strokeStyle = `hsla(${bolt.hue}, 100%, 80%, ${opacity})`;
  ctx.lineWidth = bolt.width * (1 - progress * 0.7);
  ctx.shadowColor = `hsla(${bolt.hue}, 100%, 70%, ${opacity * 0.8})`;
  ctx.shadowBlur = 12;
  ctx.stroke();

  // Core white flash
  ctx.beginPath();
  ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
  for (let i = 1; i < bolt.points.length; i++) ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
  ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.6})`;
  ctx.lineWidth = bolt.width * 0.3 * (1 - progress);
  ctx.shadowBlur = 4;
  ctx.stroke();

  bolt.branches.forEach(b => drawBolt(ctx, b, alpha * 0.7));
}

export function Lightning({
  hue = 55,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
  className = '',
  style,
}: LightningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    const bolts: Bolt[] = [];
    let frameCount = 0;

    const spawnRate = Math.max(2, Math.round(20 / speed / intensity));

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawn() {
      const w = canvas.width, h = canvas.height;
      const x = w * (0.3 + xOffset + (Math.random() - 0.5) * 0.4);
      bolts.push(createBolt(x, 0, x + (Math.random() - 0.5) * w * 0.3, h * (0.6 + Math.random() * 0.4), 1.2, 2, hue + (Math.random() - 0.5) * 40, (1.5 + Math.random()) * size));
    }

    function render() {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frameCount % spawnRate === 0) spawn();

      for (let i = bolts.length - 1; i >= 0; i--) {
        drawBolt(ctx, bolts[i], 1);
        bolts[i].life++;
        if (bolts[i].life >= bolts[i].maxLife) bolts.splice(i, 1);
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
