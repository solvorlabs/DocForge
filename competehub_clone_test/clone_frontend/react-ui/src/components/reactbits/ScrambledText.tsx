import { useEffect, useRef, useState } from 'react';

interface ScrambledTextProps {
  children: string;
  className?: string;
  radius?: number;
  duration?: number;     // ms per reveal
  speed?: number;        // 1-5
  scrambleChars?: string;
  trigger?: 'hover' | 'view';
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>!?';

export function ScrambledText({
  children,
  className = '',
  radius = 80,
  duration = 800,
  speed = 2,
  scrambleChars = CHARS,
  trigger = 'hover',
}: ScrambledTextProps) {
  const [chars, setChars] = useState<{ char: string; revealed: boolean }[]>(
    () => children.split('').map(c => ({ char: c, revealed: true }))
  );
  const containerRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<number>(0);
  const isAnimating = useRef(false);

  function scramble() {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const original = children.split('');
    const totalChars = original.length;
    const revealInterval = duration / totalChars / speed;
    let revealed = 0;

    // Start all scrambled
    setChars(original.map(c => ({
      char: c === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)],
      revealed: false,
    })));

    const id = setInterval(() => {
      revealed += 1;
      setChars(prev => prev.map((item, i) => {
        if (i < revealed) return { char: original[i], revealed: true };
        return {
          char: original[i] === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)],
          revealed: false,
        };
      }));
      if (revealed >= totalChars) {
        clearInterval(id);
        isAnimating.current = false;
      }
    }, revealInterval);
  }

  useEffect(() => {
    if (trigger === 'view') {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { scramble(); observer.disconnect(); } },
        { threshold: 0.5 }
      );
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [trigger, children]);

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseEnter={trigger === 'hover' ? scramble : undefined}
      style={{ display: 'inline' }}
    >
      {chars.map((item, i) => (
        <span
          key={i}
          style={{
            color: item.revealed ? 'inherit' : '#a855f7',
            textShadow: item.revealed ? 'none' : '0 0 8px #a855f7',
            transition: 'color 0.05s',
          }}
        >
          {item.char}
        </span>
      ))}
    </span>
  );
}
