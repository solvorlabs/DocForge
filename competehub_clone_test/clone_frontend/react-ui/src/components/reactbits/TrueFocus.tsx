import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrueFocusProps {
  sentence: string;
  className?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
}

export function TrueFocus({
  sentence = '',
  className = '',
  separator = ' ',
  manualMode = false,
  blurAmount = 4,
  borderColor = '#FCEE09',
  glowColor = 'rgba(252,238,9,0.5)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
}: TrueFocusProps) {
  const words = sentence.split(separator);
  const [focusIndex, setFocusIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!manualMode);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setFocusIndex(i => (i + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
    return () => clearInterval(id);
  }, [isPlaying, words.length, animationDuration, pauseBetweenAnimations]);

  useEffect(() => {
    const span = spanRefs.current[focusIndex];
    const container = containerRef.current;
    if (span && container) {
      const spanRect = span.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setFocusRect({
        ...spanRect,
        left: spanRect.left - containerRect.left,
        top: spanRect.top - containerRect.top,
      } as DOMRect);
    }
  }, [focusIndex]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', display: 'inline-flex', gap: '0.3em', flexWrap: 'wrap' }}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={el => { spanRefs.current[i] = el; }}
          onClick={() => manualMode && setFocusIndex(i)}
          style={{
            filter: i === focusIndex ? 'none' : `blur(${blurAmount}px)`,
            opacity: i === focusIndex ? 1 : 0.5,
            transition: `filter ${animationDuration}s ease, opacity ${animationDuration}s ease`,
            cursor: manualMode ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
          }}
        >
          {word}
        </span>
      ))}
      {focusRect && (
        <motion.div
          animate={{
            left: focusRect.left - 4,
            top: focusRect.top - 4,
            width: focusRect.width + 8,
            height: focusRect.height + 8,
          }}
          transition={{ duration: animationDuration, ease: 'easeInOut' }}
          style={{
            position: 'absolute', pointerEvents: 'none',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 4,
            boxShadow: `0 0 12px ${glowColor}`,
          }}
        />
      )}
    </div>
  );
}
