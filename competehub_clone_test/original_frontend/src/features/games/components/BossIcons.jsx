// src/components/BossIcons.jsx
import React from 'react';

// SVG Boss Icon Components
export const MathBossIcon = ({ size = 80, color = "#3182ce" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Math symbols and geometric shapes */}
    <circle cx="50" cy="50" r="45" fill={color} stroke="#1a202c" strokeWidth="3"/>
    <circle cx="35" cy="35" r="8" fill="#fff"/>
    <circle cx="65" cy="35" r="8" fill="#fff"/>
    <circle cx="35" cy="35" r="3" fill="#1a202c"/>
    <circle cx="65" cy="35" r="3" fill="#1a202c"/>
    {/* Math symbols on face */}
    <text x="50" y="65" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">∑</text>
    <path d="M20 20 L25 25 M25 20 L20 25" stroke="#fff" strokeWidth="2"/>
    <path d="M75 20 L80 25 M80 20 L75 25" stroke="#fff" strokeWidth="2"/>
    {/* Additional geometric decorations */}
    <polygon points="50,15 55,25 45,25" fill="#fff"/>
  </svg>
);

export const PhysicsBossIcon = ({ size = 80, color = "#38a169" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Physics-themed with atom and lightning */}
    <circle cx="50" cy="50" r="45" fill={color} stroke="#1a202c" strokeWidth="3"/>
    <circle cx="35" cy="35" r="8" fill="#fff"/>
    <circle cx="65" cy="35" r="8" fill="#fff"/>
    <circle cx="35" cy="35" r="3" fill="#1a202c"/>
    <circle cx="65" cy="35" r="3" fill="#1a202c"/>
    {/* Atom symbol */}
    <circle cx="50" cy="55" r="12" fill="none" stroke="#fff" strokeWidth="2"/>
    <ellipse cx="50" cy="55" rx="20" ry="8" fill="none" stroke="#fff" strokeWidth="2"/>
    <ellipse cx="50" cy="55" rx="8" ry="20" fill="none" stroke="#fff" strokeWidth="2"/>
    <circle cx="50" cy="55" r="3" fill="#fff"/>
    {/* Lightning bolts */}
    <path d="M15 15 L20 25 L15 30 L25 35" stroke="#fff" strokeWidth="2" fill="none"/>
    <path d="M85 15 L80 25 L85 30 L75 35" stroke="#fff" strokeWidth="2" fill="none"/>
  </svg>
);

export const ChemistryBossIcon = ({ size = 80, color = "#d53f8c" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chemistry-themed with molecules and flask */}
    <circle cx="50" cy="50" r="45" fill={color} stroke="#1a202c" strokeWidth="3"/>
    <circle cx="35" cy="35" r="8" fill="#fff"/>
    <circle cx="65" cy="35" r="8" fill="#fff"/>
    <circle cx="35" cy="35" r="3" fill="#1a202c"/>
    <circle cx="65" cy="35" r="3" fill="#1a202c"/>
    {/* Molecule structure */}
    <circle cx="40" cy="60" r="4" fill="#fff"/>
    <circle cx="50" cy="55" r="4" fill="#fff"/>
    <circle cx="60" cy="60" r="4" fill="#fff"/>
    <line x1="40" y1="60" x2="50" y2="55" stroke="#fff" strokeWidth="2"/>
    <line x1="50" y1="55" x2="60" y2="60" stroke="#fff" strokeWidth="2"/>
    {/* Flask decorations */}
    <path d="M20 20 Q25 15 30 20" stroke="#fff" strokeWidth="2" fill="none"/>
    <path d="M70 20 Q75 15 80 20" stroke="#fff" strokeWidth="2" fill="none"/>
  </svg>
);

export const BiologyBossIcon = ({ size = 80, color = "#38a169" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Biology-themed with DNA helix and cells */}
    <circle cx="50" cy="50" r="45" fill={color} stroke="#1a202c" strokeWidth="3"/>
    <circle cx="35" cy="35" r="8" fill="#fff"/>
    <circle cx="65" cy="35" r="8" fill="#fff"/>
    <circle cx="35" cy="35" r="3" fill="#1a202c"/>
    <circle cx="65" cy="35" r="3" fill="#1a202c"/>
    {/* DNA helix */}
    <path d="M45 45 Q50 50 45 55 Q40 60 45 65 Q50 70 45 75" stroke="#fff" strokeWidth="2" fill="none"/>
    <path d="M55 45 Q50 50 55 55 Q60 60 55 65 Q50 70 55 75" stroke="#fff" strokeWidth="2" fill="none"/>
    <line x1="45" y1="50" x2="55" y2="50" stroke="#fff" strokeWidth="1"/>
    <line x1="45" y1="60" x2="55" y2="60" stroke="#fff" strokeWidth="1"/>
    <line x1="45" y1="70" x2="55" y2="70" stroke="#fff" strokeWidth="1"/>
    {/* Leaf decorations */}
    <path d="M20 25 Q15 20 20 15 Q25 20 20 25" fill="#fff"/>
    <path d="M80 25 Q85 20 80 15 Q75 20 80 25" fill="#fff"/>
  </svg>
);

export const GeneralBossIcon = ({ size = 80, color = "#805ad5" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* General knowledge boss with crown and book */}
    <circle cx="50" cy="50" r="45" fill={color} stroke="#1a202c" strokeWidth="3"/>
    <circle cx="35" cy="35" r="8" fill="#fff"/>
    <circle cx="65" cy="35" r="8" fill="#fff"/>
    <circle cx="35" cy="35" r="3" fill="#1a202c"/>
    <circle cx="65" cy="35" r="3" fill="#1a202c"/>
    {/* Crown */}
    <polygon points="35,15 40,25 50,20 60,25 65,15 50,10" fill="#fff" stroke="#1a202c" strokeWidth="1"/>
    <circle cx="50" cy="15" r="3" fill="#d69e2e"/>
    {/* Book symbol */}
    <rect x="42" y="55" width="16" height="12" fill="#fff" stroke="#1a202c" strokeWidth="1"/>
    <line x1="50" y1="55" x2="50" y2="67" stroke="#1a202c" strokeWidth="1"/>
    <line x1="44" y1="58" x2="48" y2="58" stroke="#1a202c" strokeWidth="0.5"/>
    <line x1="52" y1="58" x2="56" y2="58" stroke="#1a202c" strokeWidth="0.5"/>
  </svg>
);

// Boss icon mapper function
export const getBossIcon = (bossType, size = 80, color) => {
  const iconProps = { size, color };
  
  switch (bossType?.toLowerCase()) {
    case 'math':
    case 'mathematics':
      return <MathBossIcon {...iconProps} color={color || "#3182ce"} />;
    case 'physics':
      return <PhysicsBossIcon {...iconProps} color={color || "#38a169"} />;
    case 'chemistry':
      return <ChemistryBossIcon {...iconProps} color={color || "#d53f8c"} />;
    case 'biology':
      return <BiologyBossIcon {...iconProps} color={color || "#38a169"} />;
    default:
      return <GeneralBossIcon {...iconProps} color={color || "#805ad5"} />;
  }
};