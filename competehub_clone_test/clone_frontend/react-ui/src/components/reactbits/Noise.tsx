interface NoiseProps {
  opacity?: number;
  className?: string;
}

export function Noise({ opacity = 0.035, className }: NoiseProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 ${className ?? ''}`}
      style={{ opacity }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>
    </div>
  );
}
