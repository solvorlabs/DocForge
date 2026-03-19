import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number; // seconds
  showBorder?: boolean;
  direction?: number;      // angle in degrees
}

export function GradientText({
  children,
  className = '',
  colors = ['#FCEE09', '#f59e0b', '#ef4444', '#FCEE09'],
  animationSpeed = 4,
  showBorder = false,
  direction = 135,
}: GradientTextProps) {
  const gradient = `linear-gradient(${direction}deg, ${colors.join(', ')})`;

  return (
    <span className={className} style={{ display: 'inline-block', position: 'relative' }}>
      {showBorder && (
        <motion.span
          aria-hidden="true"
          style={{
            position: 'absolute', inset: '-2px', borderRadius: 'inherit',
            background: gradient, backgroundSize: '300% 100%',
            padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor', maskComposite: 'exclude',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: animationSpeed, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <motion.span
        style={{
          background: gradient,
          backgroundSize: '300% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: animationSpeed, repeat: Infinity, ease: 'linear' }}
      >
        {children}
      </motion.span>
    </span>
  );
}
