import type { ReactNode } from 'react';

interface GlitchTextProps {
  children: ReactNode;
  speed?: number; // 1-5, default 1
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

export function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = false,
  className = '',
}: GlitchTextProps) {
  const duration = (0.5 / speed).toFixed(2);

  const style: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...(enableOnHover ? {} : {
      animation: `glitch-main ${duration}s steps(1) infinite`,
    }),
  };

  return (
    <>
      <style>{`
        @keyframes glitch-main {
          0%   { clip-path: inset(0 0 100% 0); transform: translate(0); }
          10%  { clip-path: inset(30% 0 50% 0); transform: translate(-2px, 1px); color: #ef4444; }
          20%  { clip-path: inset(60% 0 20% 0); transform: translate(2px, -1px); color: #FCEE09; }
          30%  { clip-path: inset(10% 0 80% 0); transform: translate(-1px, 2px); }
          40%  { clip-path: inset(80% 0 5%  0); transform: translate(1px, -2px); color: #06b6d4; }
          50%  { clip-path: inset(0); transform: translate(0); color: inherit; }
          100% { clip-path: inset(0); transform: translate(0); color: inherit; }
        }
        @keyframes glitch-before {
          0%   { clip-path: inset(0 0 100% 0); transform: translate(0); }
          15%  { clip-path: inset(10% 0 70% 0); transform: translate(3px, -1px); }
          35%  { clip-path: inset(50% 0 30% 0); transform: translate(-3px, 2px); }
          55%  { clip-path: inset(20% 0 60% 0); transform: translate(2px, 1px); }
          75%  { clip-path: inset(70% 0 15% 0); transform: translate(-2px, -1px); }
          100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
        }
        @keyframes glitch-after {
          0%   { clip-path: inset(0 0 100% 0); transform: translate(0); }
          20%  { clip-path: inset(40% 0 40% 0); transform: translate(-3px, 2px); }
          40%  { clip-path: inset(80% 0 10% 0); transform: translate(3px, -1px); }
          60%  { clip-path: inset(5%  0 85% 0); transform: translate(-1px, 3px); }
          80%  { clip-path: inset(60% 0 25% 0); transform: translate(2px, -2px); }
          100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
        }
        .glitch-wrap:hover .glitch-before,
        .glitch-wrap:hover .glitch-after {
          opacity: 1 !important;
          animation-play-state: running !important;
        }
        .glitch-wrap:hover {
          animation: glitch-main ${duration}s steps(1) infinite !important;
        }
      `}</style>
      <span
        className={`glitch-wrap ${className}`}
        style={{ position: 'relative', display: 'inline-block', ...(enableOnHover ? {} : style) }}
      >
        {children}
        {enableShadows && (
          <>
            <span
              className="glitch-before"
              aria-hidden="true"
              style={{
                content: '""',
                position: 'absolute',
                inset: 0,
                opacity: enableOnHover ? 0 : 1,
                color: '#ef4444',
                animation: `glitch-before ${duration}s steps(1) infinite`,
                animationDelay: '0.1s',
                pointerEvents: 'none',
              }}
            >
              {children}
            </span>
            <span
              className="glitch-after"
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                opacity: enableOnHover ? 0 : 1,
                color: '#06b6d4',
                animation: `glitch-after ${duration}s steps(1) infinite`,
                animationDelay: '0.2s',
                pointerEvents: 'none',
              }}
            >
              {children}
            </span>
          </>
        )}
      </span>
    </>
  );
}
