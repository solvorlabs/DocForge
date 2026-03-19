import { useEffect, useState, useRef, type ElementType } from 'react';

interface TextTypeProps {
  text: string | string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorCharacter?: string;
  as?: ElementType;
}

export function TextType({
  text,
  className = '',
  typingSpeed = 60,
  deletingSpeed = 30,
  pauseDuration = 2000,
  loop = true,
  showCursor = true,
  cursorCharacter = '|',
  as: Tag = 'span' as ElementType,
}: TextTypeProps) {
  const texts = Array.isArray(text) ? text : [text];
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const current = texts[textIndex];

    if (phase === 'typing') {
      if (charIndex < current.length) {
        const id = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex(i => i + 1);
        }, typingSpeed);
        return () => clearTimeout(id);
      } else {
        const id = setTimeout(() => setPhase('pausing'), pauseDuration);
        return () => clearTimeout(id);
      }
    }

    if (phase === 'pausing') {
      if (loop || textIndex < texts.length - 1) {
        setPhase('deleting');
      }
    }

    if (phase === 'deleting') {
      if (charIndex > 0) {
        const id = setTimeout(() => {
          setCharIndex(i => i - 1);
          setDisplayed(current.slice(0, charIndex - 1));
        }, deletingSpeed);
        return () => clearTimeout(id);
      } else {
        const nextIdx = (textIndex + 1) % texts.length;
        setTextIndex(nextIdx);
        setPhase('typing');
      }
    }
  }, [phase, charIndex, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <Tag className={className}>
      {displayed}
      {showCursor && (
        <span style={{ opacity: cursorVisible ? 1 : 0, color: '#a855f7', transition: 'opacity 0.1s' }}>
          {cursorCharacter}
        </span>
      )}
    </Tag>
  );
}
