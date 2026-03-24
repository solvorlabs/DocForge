import { cn } from '@/lib/utils';

interface MarqueeRowProps {
  items: string[];
  className?: string;
}

export function MarqueeRow({ items, className }: MarqueeRowProps) {
  return (
    <div className={cn('rb-marquee', className)}>
      <div className="rb-marquee-track">
        {[...items, ...items].map((item, idx) => (
          <span key={`${item}-${idx}`} className="rb-marquee-chip">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
