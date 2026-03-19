import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;           // base delay in seconds
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  threshold?: number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

export function BlurText({
  text,
  className = '',
  delay = 0,
  animateBy = 'words',
  direction = 'bottom',
  threshold = 0.3,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const tokens = animateBy === 'words' ? text.split(' ') : text.split('');

  const getOffset = () => {
    switch (direction) {
      case 'top': return { y: -20 };
      case 'bottom': return { y: 20 };
      case 'left': return { x: -20 };
      case 'right': return { x: 20 };
      default: return {};
    }
  };

  const variants = {
    hidden: { opacity: 0, filter: 'blur(10px)', ...getOffset() },
    visible: { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 },
  };

  return (
    <span ref={ref} className={className} style={{ display: 'inline' }}>
      {tokens.map((token, i) => (
        <motion.span
          key={i}
          variants={variants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{
            duration: stepDuration,
            delay: delay + i * (stepDuration * 0.5),
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          onAnimationComplete={i === tokens.length - 1 ? onAnimationComplete : undefined}
        >
          {token}{animateBy === 'words' && i < tokens.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  );
}
