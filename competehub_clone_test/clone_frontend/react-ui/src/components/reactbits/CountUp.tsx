import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;   // seconds
  delay?: number;      // seconds
  separator?: string;
  className?: string;
  suffix?: string;
  prefix?: string;
  onEnd?: () => void;
  startWhen?: boolean; // if false, waits for view
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({
  to, from = 0, duration = 1.5, delay = 0,
  separator = '', className = '', suffix = '', prefix = '',
  onEnd, startWhen = true,
}: CountUpProps) {
  const [value, setValue] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isInView || !startWhen) return;

    const startTime = performance.now() + delay * 1000;

    function animate(now: number) {
      if (now < startTime) { rafRef.current = requestAnimationFrame(animate); return; }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = easeOutExpo(progress);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else { setValue(to); onEnd?.(); }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isInView, startWhen, from, to, duration, delay]);

  const formatted = separator
    ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : value.toString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
