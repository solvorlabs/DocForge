import { type ReactNode } from 'react';

interface StarBorderProps {
  children: ReactNode;
  color?: string;
  speed?: number;
  className?: string;
  as?: 'div' | 'button' | 'span';
  onClick?: () => void;
}

export function StarBorder({
  children,
  color = '#a855f7',
  speed = 4,
  className,
  as: Tag = 'div',
  onClick,
}: StarBorderProps) {
  return (
    <Tag
      className={`relative inline-block overflow-hidden rounded-xl ${className ?? ''}`}
      onClick={onClick}
      style={{
        background: `oklch(0.12 0.025 280)`,
        border: '1px solid transparent',
      }}
    >
      {/* top rotating shine */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animation: `star-border-h ${speed}s linear infinite`,
        }}
      />
      {/* bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animation: `star-border-h ${speed}s linear infinite reverse`,
          animationDelay: `${speed / 2}s`,
        }}
      />
      {/* left */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[1px]"
        style={{
          background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          animation: `star-border-v ${speed}s linear infinite`,
        }}
      />
      {/* right */}
      <div
        className="absolute top-0 bottom-0 right-0 w-[1px]"
        style={{
          background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          animation: `star-border-v ${speed}s linear infinite reverse`,
          animationDelay: `${speed / 2}s`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
