import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;        // chars revealed per frame
  scrambleChars?: string;
  revealDirection?: 'start' | 'end' | 'random';
  animateOn?: 'view' | 'hover';
  onAnimationComplete?: () => void;
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>?';

export function DecryptedText({
  text,
  className = '',
  speed = 2,
  scrambleChars = DEFAULT_CHARS,
  revealDirection = 'start',
  animateOn = 'view',
  onAnimationComplete,
}: DecryptedTextProps) {
  const [displayed, setDisplayed] = useState<string[]>(() => text.split('').map(() => ''));
  const [revealedCount, setRevealedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '0px' });
  const rafRef = useRef<number>(0);

  function getRevealOrder(len: number) {
    const indices = Array.from({ length: len }, (_, i) => i);
    if (revealDirection === 'end') return indices.reverse();
    if (revealDirection === 'random') return indices.sort(() => Math.random() - 0.5);
    return indices;
  }

  function startAnimation() {
    if (isAnimating) return;
    setIsAnimating(true);
    setRevealedCount(0);
    setDisplayed(text.split('').map(() => scrambleChars[Math.floor(Math.random() * scrambleChars.length)]));

    const order = getRevealOrder(text.length);
    let revealed = 0;
    let frame = 0;

    function animate() {
      frame++;
      // Scramble unrevealed chars
      setDisplayed(prev => {
        const next = [...prev];
        order.slice(revealed).forEach(i => {
          if (text[i] === ' ') next[i] = ' ';
          else next[i] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        });
        return next;
      });

      // Reveal some chars each speed frames
      if (frame % Math.max(1, Math.round(3 / speed)) === 0) {
        const toReveal = order.slice(revealed, revealed + speed);
        toReveal.forEach(i => {
          setDisplayed(prev => { const next = [...prev]; next[i] = text[i]; return next; });
        });
        revealed += speed;
        if (revealed >= text.length) {
          setDisplayed(text.split(''));
          setIsAnimating(false);
          onAnimationComplete?.();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (animateOn === 'view' && isInView) startAnimation();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isInView, animateOn]);

  const handleMouseEnter = () => {
    if (animateOn === 'hover') startAnimation();
  };

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      style={{ display: 'inline' }}
    >
      {displayed.map((char, i) => (
        <span
          key={i}
          style={{
            color: char !== text[i] ? '#a855f7' : 'inherit',
            transition: 'color 0.05s',
          }}
        >
          {char || '\u00A0'}
        </span>
      ))}
    </span>
  );
}
