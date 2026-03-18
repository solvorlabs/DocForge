// Doodle UI Utilities
// doodle-svg-icons.jsx
// Set of hand-drawn "doodle" SVG React components for the emojis you requested.
// Usage: import { Hourglass, Popcorn, FingersCrossed, XMark, Handshake, TwoDots, PointUp, PointDown, Sparkles, WarningDoodle, FireDoodle, FinishFlag } from './doodle-svg-icons'

import React from 'react';

const baseProps = (size, color) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2.3, strokeLinecap: 'round', strokeLinejoin: 'round' });

export const Hourglass = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    {/* top glass */}
    <path d="M7 2h10" />
    <path d="M7 22h10" />
    <path d="M8 3.5c0 3 4 4.8 4 6.5s-4 3.5-4 6.5" />
    <path d="M16 3.5c0 3-4 4.8-4 6.5s4 3.5 4 6.5" />
    {/* sand pile */}
    <path d="M9.2 14.8c1 .8 3 .8 4.2 0" strokeWidth={1.6} opacity={0.9} />
    <path d="M11.5 11.5v1.8" strokeWidth={1.6} opacity={0.9} />
  </svg>
);

export const Popcorn = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    {/* popcorn cloud */}
    <path d="M6 9c-.6-1.6.2-3.5 1.8-4.1C8.6 3.8 10.2 4 11 5c.9-1.2 2.6-1.5 3.7-.4 1.8.1 2.8 1.9 2.4 3.6" />
    <path d="M4.5 12.5c.6 3 1.8 4.5 3.5 5.2 2 .9 6.5.9 8.5 0 1.4-.7 2.1-2.4 2.6-4.3" />
    {/* bucket */}
    <path d="M7 8.5l-1 6.5c-.2 1 .3 1.5 1.2 1.5h8c.9 0 1.4-.5 1.2-1.5L17 8.5" />
    <path d="M9 13l.6 3" strokeWidth={1.6} opacity={0.85} />
  </svg>
);

export const FingersCrossed = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    {/* two fingers crossed */}
    <path d="M6 14l6-7" />
    <path d="M18 14l-6-7" />
    <path d="M9 11c1.5 1 4 2.4 6 2" strokeWidth={1.6} opacity={0.9} />
    <path d="M7 18c.6-1 2-2 4-2s3.4 1 4 2" strokeWidth={1.6} opacity={0.9} />
  </svg>
);

export const XMark = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M6.5 6.5l11 11" />
    <path d="M17.5 6.5l-11 11" />
    {/* little doodle flicks */}
    <path d="M5 6h1" strokeWidth={1.3} opacity={0.8} />
    <path d="M19 18h1" strokeWidth={1.3} opacity={0.8} />
  </svg>
);

export const Handshake = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M3.5 12.5c2-2 4-3.2 6-3.6l2.5 2" />
    <path d="M20.5 11.5c-1.8-1.5-3.8-2-6-1.5l-2 2" />
    <path d="M9 14l6-2" strokeWidth={1.6} opacity={0.9} />
    <path d="M7 16c.6 1 2 1.6 4 1.6s3.4-.6 4-1.6" strokeWidth={1.6} opacity={0.85} />
  </svg>
);

export const TwoDots = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <circle cx="8" cy="12" r="3" strokeWidth={1.6} />
    <circle cx="16" cy="12" r="3" strokeWidth={1.6} />
    {/* small doodle rings */}
    <path d="M5.5 9.5c.6-.6 1.8-1 2.5-1" strokeWidth={1.2} opacity={0.7} />
    <path d="M18.5 14.5c-.6.6-1.8 1-2.5 1" strokeWidth={1.2} opacity={0.7} />
  </svg>
);

export const PointUp = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M12 2v8" />
    <path d="M9 6l3-4 3 4" />
    <path d="M8 21c.5-2 1.5-3 4-3s3.5 1 4 3" strokeWidth={1.6} opacity={0.9} />
  </svg>
);

export const PointDown = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M12 22v-8" />
    <path d="M9 18l3 4 3-4" />
    <path d="M8 3c.5 2 1.5 3 4 3s3.5-1 4-3" strokeWidth={1.6} opacity={0.9} />
  </svg>
);

export const Sparkles = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M12 2l1.7 3.6L17 7l-3.3 1.4L12 12 10.3 8.4 7 7l3.3-1.4L12 2z" />
    <path d="M4 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" strokeWidth={1.2} opacity={0.85} />
  </svg>
);

export const WarningDoodle = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M12 3l9 16H3l9-16z" />
    <path d="M12 9v4" strokeWidth={1.5} opacity={0.95} />
    <path d="M12 17v.5" strokeWidth={1.5} opacity={0.95} />
  </svg>
);

export const FireDoodle = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M12 3s3 3 2.2 6.2C13.8 11 15 12.5 15 14c0 2-2 4-3 4s-3-2-3-4c0-1.5 1.2-3 1.8-4.8C10.8 6 12 3 12 3z" />
    <path d="M12 9s-1 1.4 0 3" strokeWidth={1.4} opacity={0.9} />
  </svg>
);

export const FinishFlag = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M6 3v18" />
    <path d="M6 6c3-1 5.5-1 8 0s5 1 5 1-1.5 1.5-5 2c-3.2.6-5.3-.3-8-1" />
    <path d="M6 12c3-1 5.5-1 8 0s5 1 5 1-1.5 1.5-5 2c-3.2.6-5.3-.3-8-1" strokeWidth={1.4} opacity={0.9} />
  </svg>
);
export const SwordCross = ({ size = 24, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    {/* left sword */}
    <path d="M5 3l6 6" />
    <path d="M3 5l6 6" />
    <path d="M11 9l-1 1-6-6 1-1z" opacity={0.8} />
    <path d="M9 11l-2 2" />
    {/* right sword */}
    <path d="M19 3l-6 6" />
    <path d="M21 5l-6 6" />
    <path d="M13 9l1 1 6-6-1-1z" opacity={0.8} />
    <path d="M15 11l2 2" />
  </svg>
);
export const SwordEmoji = ({ size = 24, color = "currentColor", strokeWidth = 1.6, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    role="img"
    aria-label="Crossed swords emoji"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Left-to-right sword */}
    <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* blade */}
      <path d="M3.5 5.5L14.8 16.8" />
      {/* fuller (inner line) */}
      <path d="M5 7L15.3 17.3" opacity="0.18" />
      {/* guard */}
      <path d="M11.2 15.1l1.6 1.6a0.9 0.9 0 0 1 0 1.27l-1.8 1.8" />
      {/* handle */}
      <path d="M13.4 18.1l1.6 1.6c.5.5.4 1.3-.2 1.7l-1.6 1.1a1.1 1.1 0 0 1-1.4-.3L11.1 21" />
      {/* pommel */}
      <circle cx="15.3" cy="21.6" r="0.5" fill={color} />
    </g>

    {/* Right-to-left sword */}
    <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* blade */}
      <path d="M20.5 5.5L9.2 16.8" />
      {/* fuller (inner line) */}
      <path d="M19 7L8.7 17.3" opacity="0.18" />
      {/* guard */}
      <path d="M12.8 15.1l-1.6 1.6a0.9 0.9 0 0 0 0 1.27l1.8 1.8" />
      {/* handle */}
      <path d="M10.6 18.1l-1.6 1.6c-.5.5-.4 1.3.2 1.7l1.6 1.1c.5.36 1.2.26 1.5-.36L12.9 21" />
      {/* pommel */}
      <circle cx="8.7" cy="21.6" r="0.5" fill={color} />
    </g>

    {/* small sparkle / accent to give emoji feel */}
    <g fill={color} opacity="0.95">
      <path d="M12 3.2l.45.9.99.32-.99.32L12 5.66l-.45-.9-.99-.32.99-.32L12 3.2z" opacity="0.12" />
    </g>
  </svg>
);
// Default export: grouped object (optional)
export default {
  Hourglass,
  Popcorn,
  FingersCrossed,
  SwordCross,
  XMark,
  SwordEmoji,
  Handshake,
  TwoDots,
  PointUp,
  PointDown,
  Sparkles,
  WarningDoodle,
  FireDoodle,
  FinishFlag,
};

// Click spreading ink effect
export const createClickEffect = (event) => {
  const effect = document.createElement('div');
  effect.className = 'click-effect';

  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  effect.style.left = (rect.left + x - 25) + 'px';
  effect.style.top = (rect.top + y - 25) + 'px';
  effect.style.background = 'radial-gradient(circle, rgba(45,55,72,0.3) 0%, transparent 70%)';
  effect.style.border = '2px solid rgba(45,55,72,0.5)';

  document.body.appendChild(effect);

  setTimeout(() => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect);
    }
  }, 600);
};

// Doodle Icons (SVG Components)
export const DoodleIcons = {
  Users: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle decorations */}
      <circle cx="12" cy="2" r="1" fill={color} opacity="0.6" />
      <circle cx="20" cy="4" r="0.5" fill={color} opacity="0.4" />
    </svg>
  ),

  User: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle decorations */}
      <circle cx="8" cy="3" r="0.5" fill={color} opacity="0.4" />
      <circle cx="16" cy="3" r="0.5" fill={color} opacity="0.4" />
    </svg>
  ),

  Timer: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <circle cx="12" cy="13" r="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9v4l2 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 1h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.5 7.5l-1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle tick marks */}
      <path d="M12 5v2" strokeWidth="1" opacity="0.6" />
      <path d="M19 13h-2" strokeWidth="1" opacity="0.6" />
      <path d="M12 21v-2" strokeWidth="1" opacity="0.6" />
      <path d="M5 13h2" strokeWidth="1" opacity="0.6" />
    </svg>
  ),

  Trophy: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 22H6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14.66V17a3 3 0 0 0 3 3h4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle stars */}
      <path d="M12 6l0.5 1.5L14 8l-1.5 0.5L12 10l-0.5-1.5L10 8l1.5-0.5z" fill={color} opacity="0.6" />
    </svg>
  ),

  Brain: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 1 17 4.5c0 .28-.06.54-.17.78a2 2 0 0 1 .17-.28c.24-.32.66-.5 1.07-.5A2.5 2.5 0 0 1 20.5 7c0 .36-.06.7-.19 1.02.02-.02.03-.04.05-.06A2.5 2.5 0 0 1 22 10.5c0 .81-.38 1.53-.97 2-.02.01-.05.02-.07.02A2.5 2.5 0 0 1 22 15c0 .44-.11.86-.31 1.22-.01.02-.02.04-.04.06a2.5 2.5 0 0 1-1.65 2.22c0 .02-.01.04-.02.06A2.5 2.5 0 0 1 17.5 22a2.5 2.5 0 0 1-2-.99A2.5 2.5 0 0 1 12 19.5a2.5 2.5 0 0 1-3.5 1.51A2.5 2.5 0 0 1 6.5 22a2.5 2.5 0 0 1-2.48-3.44c-.01-.02-.02-.04-.02-.06A2.5 2.5 0 0 1 2.35 16.28c-.02-.02-.03-.04-.04-.06A2.5 2.5 0 0 1 2 15a2.5 2.5 0 0 1 1.04-2.02c-.02 0-.05-.01-.07-.02A2.5 2.5 0 0 1 2 10.5a2.5 2.5 0 0 1 1.64-2.36c.02.02.03.04.05.06A2.5 2.5 0 0 1 3.5 7a2.5 2.5 0 0 1 1.07.5c.41 0 .83.18 1.07.5.11-.24.17-.5.17-.78A2.5 2.5 0 0 1 8.31 4.5a2.5 2.5 0 0 1 1.19-2.5z" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle thought bubbles */}
      <circle cx="8" cy="8" r="0.5" fill={color} opacity="0.4" />
      <circle cx="16" cy="10" r="0.5" fill={color} opacity="0.4" />
      <circle cx="12" cy="12" r="0.5" fill={color} opacity="0.4" />
    </svg>
  ),

  Gamepad: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <rect x="2" y="7" width="20" height="10" rx="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="12" r="1" fill={color} />
      <circle cx="16" cy="12" r="1" fill={color} />
      <path d="M6 15v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle elements */}
      <path d="M8 10v4M6 12h4" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="10" r="0.5" fill={color} />
      <circle cx="18" cy="12" r="0.5" fill={color} />
    </svg>
  ),

  Star: ({ size = 24, color = 'currentColor', filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle sparkles */}
      <circle cx="18" cy="6" r="0.5" fill={color} opacity="0.6" />
      <circle cx="6" cy="18" r="0.5" fill={color} opacity="0.6" />
    </svg>
  ),

  Lightning: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
      {/* Doodle energy lines */}
      <path d="M16 7l2-1M18 11l2 1M16 15l2 1" strokeWidth="1" opacity="0.6" />
    </svg>
  ),

  Book: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle bookmark */}
      <path d="M16 2v8l-2-1-2 1V2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.2" />
      {/* Doodle page lines */}
      <path d="M8 8h8M8 12h6M8 16h7" strokeWidth="1" opacity="0.4" />
    </svg>
  ),

  Target: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" strokeLinecap="round" strokeLinejoin="round" fill={color} />
      {/* Doodle arrows */}
      <path d="M22 12h-4M2 12h4M12 2v4M12 18v4" strokeWidth="1.5" opacity="0.6" />
    </svg>
  ),

  Settings: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  Home: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle chimney smoke */}
      <path d="M16 7c0.5-0.5 1-0.5 1.5 0s1 0.5 1.5 0" strokeWidth="1" opacity="0.4" />
      <path d="M16 5c0.5-0.5 1-0.5 1.5 0s1 0.5 1.5 0" strokeWidth="1" opacity="0.3" />
    </svg>
  ),
  X: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
      {/* Doodle emphasis */}
      <circle cx="5" cy="5" r="0.5" fill={color} opacity="0.4" />
      <circle cx="19" cy="19" r="0.5" fill={color} opacity="0.4" />
    </svg>
  ),

  Eye: ({ size = 24, color = 'currentColor' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer eye (loose/doodle shape) */}
      <path
        d="M2 12c3.5-6 10.5-6 11.5-6s8 0 11.5 6c-3.5 6-10.5 6-11.5 6S5.5 18 2 12z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Iris */}
      <circle
        cx="12"
        cy="12"
        r="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pupil (solid-ish) */}
      <circle
        cx="12"
        cy="12"
        r="1.2"
        fill={color}
        stroke="none"
        opacity="0.95"
      />

      {/* Doodle: tiny highlight on iris */}
      <path
        d="M10.5 10.2c0.4-0.4 1-0.4 1.4 0"
        strokeWidth="1"
        opacity="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Doodle: gentle broadcast/spectate waves to indicate watching */}
      <path
        d="M18.5 6.5c0.9-0.9 2-0.9 2.9 0"
        strokeWidth="1"
        opacity="0.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 4.5c0.9-0.9 2-0.9 2.9 0"
        strokeWidth="1"
        opacity="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Doodle: small motion lines at the outer corner */}
      <polyline
        points="21,13 22,13 22.8,12.2"
        strokeWidth="1"
        opacity="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Optional: tiny sparkle near top-left */}
      <path
        d="M6.2 6.6l0.9 0.2 0.2 0.9-0.2-0.9-0.9-0.2z"
        strokeWidth="0.9"
        opacity="0.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(15 6.6 7)"
      />
    </svg>
  )
};

// Random doodle decorations
export const getRandomDoodleDecoration = () => {
  const decorations = ['✦', '★', '✧', '◆', '◇', '○', '●', '△', '▲', '♦', '♢'];
  return decorations[Math.floor(Math.random() * decorations.length)];
};

// Random rotation for doodle elements
export const getRandomRotation = (min = -3, max = 3) => {
  return Math.random() * (max - min) + min;
};

// Doodle theme colors
export const doodleColors = {
  primary: '#2d3748',
  secondary: '#4a5568',
  accent: '#e53e3e',
  blue: '#3182ce',
  green: '#38a169',
  yellow: '#d69e2e',
  purple: '#805ad5',
  pink: '#d53f8c',
  orange: '#dd6b20',
  paper: '#fefefe',
  ink: '#1a202c',
  sketch: '#718096'
};
