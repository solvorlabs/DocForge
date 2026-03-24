'use client';

import { useEffect, useState } from 'react';

export function CursorAura() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setPos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="rb-custom-cursor pointer-events-none fixed z-[70]"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="rb-cursor-core" />
      <div className="rb-cursor-glow" />
    </div>
  );
}
