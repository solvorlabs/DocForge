// src/components/layout/HamburgerButton.jsx
import React from 'react';
import { Menu } from 'lucide-react';

function HamburgerButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`hamburger-btn ${className}`}
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 1001,
        padding: '0.75rem',
        background: '#ffffff',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f3f4f6';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#ffffff';
        e.target.style.transform = 'scale(1)';
      }}
    >
      <Menu size={20} color="#374151" />
    </button>
  );
}

export default HamburgerButton;