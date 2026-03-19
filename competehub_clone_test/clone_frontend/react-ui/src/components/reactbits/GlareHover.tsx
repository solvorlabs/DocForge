import { useRef, useCallback, type ReactNode } from 'react';

interface GlareHoverProps {
  children: ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function GlareHover({
  children,
  glareColor = 'white',
  glareOpacity = 0.12,
  glareSize = 55,
  className,
  style,
}: GlareHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    const glare = glareRef.current;
    if (!el || !glare) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    glare.style.background = `radial-gradient(circle at ${x}% ${y}%, ${glareColor} 0%, transparent ${glareSize}%)`;
    glare.style.opacity = String(glareOpacity);
  }, [glareColor, glareOpacity, glareSize]);

  const handleMouseLeave = useCallback(() => {
    const glare = glareRef.current;
    if (glare) glare.style.opacity = '0';
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${className ?? ''}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{ opacity: 0, borderRadius: 'inherit' }}
      />
      {children}
    </div>
  );
}
