interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
  color?: string;
  shimmerColor?: string;
}

export function ShinyText({
  text,
  className,
  speed = 3,
  color = 'oklch(0.92 0.01 270)',
  shimmerColor = 'oklch(0.85 0.28 292)',
}: ShinyTextProps) {
  return (
    <span
      className={`relative inline-block ${className ?? ''}`}
      style={{
        background: `linear-gradient(120deg, ${color} 0%, ${color} 30%, ${shimmerColor} 50%, ${color} 70%, ${color} 100%)`,
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: `shiny-text-move ${speed}s linear infinite`,
      }}
    >
      {text}
    </span>
  );
}
