import { useEffect, useRef } from 'react';

interface LetterGlitchProps {
  text?: string;
  className?: string;
  glitchColors?: string[];
  glitchSpeed?: number; // ms between glitches
  smooth?: boolean;
}

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>?/|\\[]{}~';

export function LetterGlitch({
  text = '',
  className = '',
  glitchColors = ['#FCEE09', '#ef4444', '#06b6d4', '#ffffff'],
  glitchSpeed = 50,
  smooth = false,
}: LetterGlitchProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalText = useRef(text);

  useEffect(() => {
    originalText.current = text;
    const container = containerRef.current;
    if (!container) return;

    // Initialize spans for each character
    container.innerHTML = '';
    const spans: HTMLSpanElement[] = [];
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.transition = smooth ? 'color 0.1s' : 'none';
      container.appendChild(span);
      spans.push(span);
    });

    let frame = 0;
    intervalRef.current = setInterval(() => {
      frame++;
      spans.forEach((span, i) => {
        // Each letter has a random chance to glitch
        if (Math.random() < 0.03) {
          span.textContent = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          span.style.color = glitchColors[Math.floor(Math.random() * glitchColors.length)];
          span.style.textShadow = `0 0 8px ${glitchColors[Math.floor(Math.random() * glitchColors.length)]}`;
          // Restore after 1-3 frames
          setTimeout(() => {
            if (span) {
              span.textContent = originalText.current[i] || '';
              span.style.color = '';
              span.style.textShadow = '';
            }
          }, glitchSpeed * (1 + Math.floor(Math.random() * 3)));
        }
      });
    }, glitchSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, glitchSpeed, glitchColors, smooth]);

  return <span ref={containerRef} className={className} />;
}
