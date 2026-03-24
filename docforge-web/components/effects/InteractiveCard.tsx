'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export function InteractiveCard({ children, className }: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - py) * 8;
    const rotateY = (px - 0.5) * 10;

    ref.current.style.setProperty('--rb-x', `${(px * 100).toFixed(2)}%`);
    ref.current.style.setProperty('--rb-y', `${(py * 100).toFixed(2)}%`);
    ref.current.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  };

  const reset = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    ref.current.style.setProperty('--rb-x', '50%');
    ref.current.style.setProperty('--rb-y', '50%');
  };

  return (
    <div
      ref={ref}
      className={cn('rb-card', className)}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </div>
  );
}
