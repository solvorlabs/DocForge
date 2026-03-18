// components/navigation/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../utils/doodleUtils';
import UserMenu from '../../../features/user/components/UserMenu';
import AuthModal from '../../../features/auth/components/AuthModal';
import '../../../styles/themes/doodle.css';
import VolumeControl from '../audio/VolumeControl';

const NavBar = () => {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Font toggle state - check localStorage on mount
  const [isDoodleFont, setIsDoodleFont] = useState(() => {
    const saved = localStorage.getItem('doodleFont');
    return saved === 'true';
  });

  // Apply font change to body element
  useEffect(() => {
    if (isDoodleFont) {
      document.body.style.setProperty('font-family', '"Shantell Sans", cursive', 'important');
      document.body.classList.add('doodle-font-active');
    } else {
      document.body.style.setProperty('font-family', 'sans-serif', 'important');
      document.body.classList.remove('doodle-font-active');
    }
    // Store preference
    localStorage.setItem('doodleFont', isDoodleFont.toString());
  }, [isDoodleFont]);

  const toggleDoodleFont = () => {
    setIsDoodleFont(!isDoodleFont);
  };

  const handleLoginClick = (e) => {
    createClickEffect(e);
    setAuthMode('login');
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleRegisterClick = (e) => {
    createClickEffect(e);
    setAuthMode('register');
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = (e) => {
    createClickEffect(e);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    // { path: '/', label: 'Home' },
    // { path: '/solo-challenge', label: 'Solo Challenge' },
    // { path: '/leaderboard', label: 'Leaderboard' },
    // ...(isAuthenticated ? [{ path: '/friends', label: 'Friends' }] : [])
  ];

  return (
    <>
      <nav
        className="doodle-navbar"
        style={{
          background: '#fff',
          padding: '2px 15px',
          display: 'flex',
          position: 'sticky',
          top: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1001,
          borderBottom: '4px solid #2563eb',
          borderImage: `url("data:image/svg+xml,%3csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m0,6 Q5,1 10,6 T20,6 Q25,11 30,6 T40,6 Q45,1 50,6 T60,6 Q65,11 70,6 T80,6 Q85,1 90,6 T100,6' stroke='%232563eb' fill='none' stroke-width='4'/%3e%3c/svg%3e") 30`,
          boxShadow: `
            0 4px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        {/* Left: Logo/Brand with doodly container */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-6px',
              top: '-6px',
              right: '-6px',
              bottom: '-6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              transform: 'rotate(-1deg)',
              zIndex: -1
            }}
          />
          <img
            src="/doodie.png"
            alt="Doodle Avatar"
            className="navbar-logo"
            style={{
              width: '48px',
              height: '48px',
              animation: 'doodle-bounce 2s infinite'
            }}
          />
          {/* <div className="doodle-avatar doodle-float" style={{ 
            margin: 0, 
            position: 'relative', 
            width: '48px', 
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gamepad size={24} color="#fff" />
          </div> */}
          <span
            className="doodle-title navbar-title"
            style={{
              color: 'black',
              fontSize: 'clamp(0.9rem, 3vw, 1.3rem)',
              fontWeight: '600',
              margin: 0,
              position: 'relative',
              // textShadow: '2px 2px 0 rgba(0, 0, 0, 0.3)'
            }}
          >
            CompeteHub
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              left: '0',
              right: '0',
              height: '2px',
              background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 5'%3e%3cpath d='M0,2.5 Q10,1 20,2.5 T40,2.5 Q50,4 60,2.5 T80,2.5 Q90,1 100,2.5' stroke='%23fbbf24' fill='none' stroke-width='2'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'repeat-x'
            }} />
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="desktop-nav" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          justifyContent: 'center'
        }}>
          {navigationItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`doodle-nav-link ${isActive(item.path) ? 'active' : ''}`}
              style={{
                color: 'black',
                textDecoration: 'none',
                fontFamily: 'Dekko, cursive',
                fontWeight: '600',
                padding: '6px 10px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                background: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                position: 'relative',
                border: isActive(item.path) ? '2px solid black' : '2px solid transparent',
                borderStyle: isActive(item.path) ? 'dashed' : 'solid',
                transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)`,
                textShadow: '1px 1px 0 rgba(0, 0, 0, 0.3)',
                fontSize: '0.9rem'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div
          className="question-bank-container"
          style={{
            position: 'relative',
            display: 'inline-block',
            margin: '10px 30px',
          }}
        >
          <button
            className="question-bank-btn"
            style={{
              background: 'var(--doodle-yellow-light)',
              border: '3px solid var(--doodle-ink)',
              color: 'var(--doodle-ink)',
              borderRadius: '15px',
              padding: '5px 10px',
               
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '3px 3px 0 var(--doodle-yellow)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              transform: 'rotate(-1deg)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'rotate(0deg) scale(1.05)';
              e.target.style.boxShadow = '5px 5px 0 var(--doodle-yellow)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'rotate(-1deg) scale(1)';
              e.target.style.boxShadow = '3px 3px 0 var(--doodle-yellow)';
            }}
            onClick={() => navigate('/question-bank')}
          >
            <span className="qb-text-full">Question Bank</span>
            <span className="qb-text-short">QB</span>
          </button>

          {/* "New" badge */}
          <div
            className="new-badge"
            style={{
              position: 'absolute',
              top: '-10px',
              right: '-15px',
              color: 'red',
              borderRadius: '50%',
              padding: '6px 10px',
              fontSize: '0.7rem',
               
              fontWeight: 'bold',
              border: '2px solid var(--doodle-ink)',
              transform: 'rotate(8deg)',
              animation: 'doodlePulseNew 1.5s infinite ease-in-out',
              boxShadow: '2px 2px 0 var(--doodle-ink)',
            }}
          >
            NEW
          </div>
        </div>

        {/* Right: Theme Toggler and Auth Section */}
        <div className="navbar-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* <ThemeToggler /> */}
          {/* Desktop Auth Section */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <UserMenu />
              {/* <div style={{
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                right: '-4px',
                bottom: '-4px',
                border: '1px dashed black',
                borderRadius: '50%',
                pointerEvents: 'none',
                transform: 'rotate(3deg)'
              }} /> */}
            </div>
          ) : (
            <div className="auth-buttons" style={{ display: 'flex', gap: '8px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '-8px',
                top: '-8px',
                right: '-8px',
                bottom: '-8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
                border: '2px dotted rgba(255, 255, 255, 0.2)',
                transform: 'rotate(1deg)',
                zIndex: -1
              }} />

              <button
                onClick={handleLoginClick}
                className="doodle-btn doodle-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  position: 'relative',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  borderStyle: 'dashed',
                  transform: 'rotate(-1deg)',
                  boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)'
                }}
              >
                <DoodleIcons.Users size={12} />
                <span className="btn-text">Login</span>
              </button>

              <button
                onClick={handleRegisterClick}
                className="doodle-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'var(--doodle-yellow)',
                  color: 'var(--doodle-ink)',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  position: 'relative',
                  border: '2px solid #f59e0b',
                  borderRadius: '12px',
                  borderStyle: 'dashed',
                  transform: 'rotate(1deg)',
                  boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)'
                }}
              >
                <DoodleIcons.Star size={12} />
                <span className="btn-text">Register</span>
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  fontSize: '8px',
                  animation: 'doodle-bounce 2s infinite'
                }}>⚡</div>
              </button>
            </div>
          )}
          
          {/* Font Toggle Slider */}
          <div
            onClick={toggleDoodleFont}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '4px 8px',
              background: isDoodleFont ? 'var(--doodle-yellow)' : 'rgba(255, 255, 255, 0.9)',
              border: '2px solid var(--doodle-ink)',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              position: 'relative',
              boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)'
            }}
            title={isDoodleFont ? 'Switch to Regular Font' : 'Switch to Doodle Font'}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--doodle-ink)' }}>∿</span>
            <div
              style={{
                width: '36px',
                height: '18px',
                background: isDoodleFont ? 'var(--doodle-green)' : '#ccc',
                borderRadius: '10px',
                position: 'relative',
                transition: 'all 0.3s ease',
                border: '2px solid var(--doodle-ink)'
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '0px',
                  left: isDoodleFont ? '18px' : '0px',
                  transition: 'all 0.3s ease',
                  border: '2px solid var(--doodle-ink)',
                  boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              />
            </div>
          </div>
          
          <VolumeControl />
        </div>

        {/* Mobile Menu Button */}
        {/* <button
          onClick={toggleMobileMenu}
          className="mobile-menu-btn doodle-btn"
          style={{
            display: 'none',
            background: 'var(--doodle-yellow)',
            border: '2px dashed #f59e0b',
            borderRadius: '10px',
            padding: '6px',
            position: 'relative',
            transform: `rotate(${isMobileMenuOpen ? 0 : 2}deg)`,
            transition: 'all 0.3s ease',
            boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)',
            zIndex: 1
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            width: '18px',
            height: '14px',
            transform: isMobileMenuOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              width: '100%',
              height: '2px',
              background: '#000',
              borderRadius: '1px',
              transform: isMobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none',
              transition: 'transform 0.3s ease'
            }} />
            <div style={{
              width: '100%',
              height: '2px',
              background: '#000',
              borderRadius: '1px',
              opacity: isMobileMenuOpen ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }} />
            <div style={{
              width: '100%',
              height: '2px',
              background: '#000',
              borderRadius: '1px',
              transform: isMobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
              transition: 'transform 0.3s ease'
            }} />
          </div>
          {!isMobileMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              fontSize: '7px',
              animation: 'doodle-bounce 3s infinite'
            }}>🎮</div>
          )}
        </button> */}
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className="mobile-menu-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 199,
          display: isMobileMenuOpen ? 'block' : 'none',
          opacity: isMobileMenuOpen ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onClick={closeMobileMenu}
      />

      {/* Mobile Menu */}
      <div
        className="mobile-menu"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '260px',
          height: '100vh',
          background: '#fff',
          zIndex: 200,
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
          border: '2px dashed #2563eb',
          borderRight: 'none',
          padding: '70px 16px 16px 16px',
          // Doodle background pattern
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 40% 60%, rgba(251, 191, 36, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 60px 60px, 20px 20px'
        }}
      >
        {/* Mobile Menu Close Button */}
        <button
          onClick={closeMobileMenu}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: '2px dashed #ef4444',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            cursor: 'pointer',
            transform: 'rotate(-5deg)',
            transition: 'all 0.3s ease'
          }}
        >
          ✕
        </button>

        {/* Mobile Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {navigationItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              style={{
                color: 'black',
                textDecoration: 'none',
                 
                fontWeight: '600',
                padding: '10px 14px',
                borderRadius: '16px',
                border: '2px dashed transparent',
                background: isActive(item.path) ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.7)',
                position: 'relative',
                transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)`,
                transition: 'all 0.3s ease',
                fontSize: '1rem',
                textShadow: '1px 1px 0 rgba(0, 0, 0, 0.2)',
                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {item.label}
              {isActive(item.path) && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '6px',
                  fontSize: '14px',
                  animation: 'doodle-bounce 2s infinite'
                }}>⭐</div>
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Auth Section */}
        {isAuthenticated ? (
          <div style={{
            padding: '16px 0',
            borderTop: '2px dashed rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <UserMenu />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px 0',
            borderTop: '2px dashed rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '14px',
              opacity: 0.3,
              animation: 'doodle-float 3s ease-in-out infinite'
            }}>🎨</div>

            <button
              onClick={handleLoginClick}
              className="doodle-btn doodle-btn-secondary mobile-auth-btn"
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                border: '2px dashed rgba(0, 0, 0, 0.3)',
                borderRadius: '16px',
                transform: 'rotate(-1deg)',
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
                width: '100%'
              }}
            >
              <DoodleIcons.Users size={14} />
              <span>Login</span>
            </button>

            <button
              onClick={handleRegisterClick}
              className="doodle-btn mobile-auth-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'var(--doodle-yellow)',
                color: 'var(--doodle-ink)',
                padding: '10px 14px',
                fontSize: '0.9rem',
                border: '2px dashed #f59e0b',
                borderRadius: '16px',
                transform: 'rotate(1deg)',
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
                width: '100%',
                position: 'relative'
              }}
            >
              <DoodleIcons.Star size={14} />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* Mobile Menu Decoration */}

      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {/* Responsive CSS */}
      <style jsx>{`
        @keyframes doodle-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }
        
        @keyframes doodle-float {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50% { transform: translateY(-5px) rotate(-10deg); }
        }
        
        .doodle-nav-link:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: rotate(0deg) scale(1.05) !important;
        }
        
        .mobile-nav-link:hover {
          background: rgba(251, 191, 36, 0.3) !important;
          transform: rotate(0deg) scale(1.02) !important;
        }
        
        .mobile-auth-btn:hover {
          transform: rotate(0deg) scale(1.02) !important;
        }

        /* Question Bank Button Responsive Text */
        @media (max-width: 600px) {
          .qb-text-full {
            display: none;
          }
          
          .qb-text-short {
            display: inline;
          }
          
          .question-bank-container {
            display: none !important;
            margin: 5px 10px !important;
          }
          
          .question-bank-btn {
            padding: 8px 12px !important;
            font-size: 0.85rem !important;
            border: 2px solid var(--doodle-ink) !important;
            box-shadow: 2px 2px 0 var(--doodle-yellow) !important;
          }
          
          .new-badge {
            padding: 4px 8px !important;
            font-size: 0.6rem !important;
            top: -8px !important;
            right: -10px !important;
          }
          
          .navbar-logo {
            width: 36px !important;
            height: 36px !important;
          }
          
          .navbar-right {
            gap: 6px !important;
          }
          
          .auth-buttons {
            gap: 4px !important;
          }
          
          .doodle-btn {
            padding: 6px 8px !important;
            font-size: 0.75rem !important;
          }
        }
        
        @media (min-width: 601px) {
          .qb-text-full {
            display: inline;
          }
          
          .qb-text-short {
            display: none;
          }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 1000px) {
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-menu-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          
          .doodle-navbar {
            padding: 10px 15px !important;
          }
        }

        @media (max-width: 480px) {
          .mobile-menu {
            width: 100vw !important;
            border: none !important;
          }
          
          .navbar-title {
            font-size: 1rem !important;
          }
          
          .btn-text {
            display: none;
          }
          
          .doodle-btn {
            padding: 8px !important;
          }
          
          .question-bank-btn {
            padding: 6px 10px !important;
            font-size: 0.8rem !important;
          }
        }

        @media (max-width: 360px) {
          .doodle-navbar {
            padding: 8px 10px !important;
          }
          
          .navbar-title {
            font-size: 0.85rem !important;
          }
          
          .question-bank-container {
            margin: 5px 8px !important;
          }
          
          .navbar-logo {
            width: 32px !important;
            height: 32px !important;
          }
        }
      `}</style>
    </>
  );
};

export default NavBar;