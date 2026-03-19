import { useEffect, useRef, useState } from 'react';

interface FuzzyTextProps {
  children: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  className?: string;
}

export function FuzzyText({
  children,
  fontSize = 'inherit',
  fontWeight = 'inherit',
  fontFamily = 'inherit',
  color = 'currentColor',
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  className = '',
}: FuzzyTextProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);
  const filterId = useRef(`fuzzy-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const animate = () => {
      const feTurb = svgRef.current?.querySelector('feTurbulence');
      if (feTurb) {
        const intensity = isHovered ? hoverIntensity : baseIntensity;
        const freq = (Math.random() * intensity * 0.02).toFixed(4);
        feTurb.setAttribute('baseFrequency', freq);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isHovered, baseIntensity, hoverIntensity]);

  return (
    <span
      className={className}
      style={{ display: 'inline-block', cursor: enableHover ? 'default' : undefined }}
      onMouseEnter={() => enableHover && setIsHovered(true)}
      onMouseLeave={() => enableHover && setIsHovered(false)}
    >
      <svg
        ref={svgRef}
        style={{ overflow: 'visible', display: 'block' }}
        width="1em"
        height="1em"
        viewBox="0 0 1 1"
      >
        <defs>
          <filter id={filterId.current}>
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isHovered ? 6 : 3} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <span
        style={{
          display: 'inline-block',
          fontSize,
          fontWeight,
          fontFamily,
          color,
          filter: `url(#${filterId.current})`,
        }}
      >
        {children}
      </span>
    </span>
  );
}
