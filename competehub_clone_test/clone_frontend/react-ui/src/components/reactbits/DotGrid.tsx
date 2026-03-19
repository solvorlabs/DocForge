import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Dot {
  x: number;
  y: number;
  el: HTMLDivElement;
}

export function DotGrid({
  dotSize = 4,
  gap = 24,
  baseColor = 'rgba(252,238,9,0.1)',
  activeColor = '#FCEE09',
  proximity = 100,
  className = '',
  style,
}: DotGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function buildGrid() {
      const w = container!.offsetWidth;
      const h = container!.offsetHeight;
      container!.innerHTML = '';
      dotsRef.current = [];

      const cols = Math.floor(w / gap);
      const rows = Math.floor(h / gap);
      const xPad = (w - cols * gap) / 2;
      const yPad = (h - rows * gap) / 2;

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const el = document.createElement('div');
          el.style.cssText = `
            position:absolute;
            width:${dotSize}px; height:${dotSize}px;
            border-radius:50%;
            background:${baseColor};
            transform:translate(-50%,-50%);
            transition:background 0.1s, transform 0.1s, box-shadow 0.1s;
            pointer-events:none;
          `;
          const x = xPad + c * gap;
          const y = yPad + r * gap;
          el.style.left = x + 'px';
          el.style.top = y + 'px';
          container!.appendChild(el);
          dotsRef.current.push({ x, y, el });
        }
      }
    }

    buildGrid();

    const ro = new ResizeObserver(buildGrid);
    ro.observe(container);

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    function animate() {
      const { x: mx, y: my } = mouseRef.current;
      dotsRef.current.forEach(({ x, y, el }) => {
        const dx = mx - x, dy = my - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < proximity) {
          const t = 1 - dist / proximity;
          const scale = 1 + t * 2;
          el.style.background = `color-mix(in oklch, ${activeColor} ${Math.round(t * 100)}%, ${baseColor})`;
          el.style.transform = `translate(-50%,-50%) scale(${scale})`;
          el.style.boxShadow = `0 0 ${t * 10}px ${activeColor}`;
        } else {
          el.style.background = baseColor;
          el.style.transform = 'translate(-50%,-50%) scale(1)';
          el.style.boxShadow = 'none';
        }
      });
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [dotSize, gap, baseColor, activeColor, proximity]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}
    />
  );
}
