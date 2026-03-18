import { Moon, Sun } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const DARK_MODE_STYLE_ID = 'soothing-dark-mode-style';
const DARK_MODE_CSS = `
  html, body, * {
    background-color: #121212 !important;
    color: #E0E0E0 !important;
    border-color: #BBBBBB !important;
  }
  button, input, select, textarea {
    background-color: #1E1E1E !important;
    color: #F5F5F5 !important;
    border: 1px solid #BBBBBB !important;
  }
  a {
    color: #80CBC4 !important;
  }
  button:hover, a:hover {
    border-color: #80CBC4 !important;
    color: #FFFFFF !important;
  }
    .transparent-bg{
      background: transparent !important;
    }
`;


function ThemeToggler() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const styleTag = document.getElementById(DARK_MODE_STYLE_ID);
    if (darkMode) {
      if (!styleTag) {
        const style = document.createElement('style');
        style.id = DARK_MODE_STYLE_ID;
        style.innerHTML = DARK_MODE_CSS;
        document.head.appendChild(style);
        console.log('✅ Soothing dark mode applied.');
      }
    } else {
      if (styleTag) {
        styleTag.remove();
        console.log('🌞 Light mode restored.');
      }
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((prev) => !prev)}
      style={{
        background: darkMode ? '#222' : '#fffbe6',
        color: darkMode ? '#fffbe6' : '#222',
        border: '2.5px dashed #fbbf24',
        borderRadius: '18px',
        padding: '8px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        boxShadow: '2px 2px 0 #fbbf24, 0 2px 8px rgba(0,0,0,0.08)',
        fontWeight: 600,
        transform: `rotate(${darkMode ? -2 : 2}deg)`,
        transition: 'all 0.2s',
        outline: 'none',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      aria-label="Toggle doodle dark mode"
      className="doodle-theme-toggler"
    >
      <span className='transparent-bg' style={{ fontSize: '1.3rem', 
        // animation: 'doodle-bounce 1.5s infinite'
         }}>
        {darkMode ? <Moon className='transparent-bg'/> : <Sun className='transparent-bg'/>}
      </span>
      {/* <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '1px' }}>
        {darkMode ? 'Doodle Dark' : 'Doodle Light'}
      </span> */}
      
      <style>{`
        @keyframes doodle-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }
        @keyframes doodle-float {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50% { transform: translateY(-5px) rotate(-10deg); }
        }
        .doodle-theme-toggler:hover {
        //   background: #fffde4 !important;
          color: #222 !important;
          transform: scale(1.05) rotate(0deg) !important;
          box-shadow: 2px 2px 0 #fbbf24, 0 4px 12px rgba(0,0,0,0.12);
        }
      `}</style>
    </button>
  );
}

export default ThemeToggler;
