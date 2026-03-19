import { type ReactNode } from 'react';

interface ElectricBorderProps {
  children: ReactNode;
  color?: string;
  speed?: number;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ElectricBorder({
  children,
  color = '#FCEE09',
  speed = 3,
  borderRadius = 12,
  className,
  style,
}: ElectricBorderProps) {
  return (
    <div
      className={`relative ${className ?? ''}`}
      style={{ borderRadius, ...style }}
    >
      {/* Animated border using conic gradient */}
      <div
        className="absolute -inset-[1.5px] rounded-[inherit] -z-10"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${color} 60deg, transparent 120deg, transparent 360deg)`,
          animation: `electric-spin ${speed}s linear infinite`,
          borderRadius: borderRadius + 2,
          filter: `blur(2px) drop-shadow(0 0 6px ${color})`,
        }}
      />
      <div
        className="absolute -inset-[1px] rounded-[inherit] -z-10 opacity-30"
        style={{
          background: `conic-gradient(from 180deg, transparent 0deg, ${color}80 60deg, transparent 120deg, transparent 360deg)`,
          animation: `electric-spin ${speed * 0.7}s linear infinite reverse`,
          borderRadius: borderRadius + 1,
        }}
      />
      {children}
    </div>
  );
}
