import { useRef, type ReactNode, type CSSProperties } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  style,
  spotlightColor = 'rgba(168, 85, 247, 0.15)',
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = divRef.current?.getBoundingClientRect();
    if (!rect || !overlayRef.current) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    overlayRef.current.style.background = `radial-gradient(300px circle at ${x}px ${y}px, ${spotlightColor}, transparent 70%)`;
    overlayRef.current.style.opacity = '1';
  }

  function onMouseLeave() {
    if (overlayRef.current) overlayRef.current.style.opacity = '0';
  }

  return (
    <div
      ref={divRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={overlayRef}
        style={{
          position: 'absolute', inset: 0, opacity: 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}
