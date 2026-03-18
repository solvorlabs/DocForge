// components/user/UserMenu.jsx
import React, { useState } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import UserProfile from './UserProfile';
import '../../../styles/themes/doodle.css';

const UserMenu = () => {
  const { user, isAuthenticated, logout } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Check if user needs profile completion
  const needsProfileCompletion = user?.needsProfileCompletion || false;

  const getAvatarEmoji = (avatar) => {
    const avatars = {
      'default': '👤',
      'brain': '🧠',
      'trophy': '🏆',
      'lightning': '⚡',
      'book': '📚',
      'star': '⭐'
    };
    return avatars[avatar] || '👤';
  };

  const getRankColor = (rank) => {
    const colors = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Platinum': '#E5E4E2',
      'Diamond': '#B9F2FF',
      'Master': '#8A2BE2',
      'Grandmaster': '#FF1493'
    };
    return colors[rank] || '#CD7F32';
  };

  const handleMenuToggle = (e) => {
    createClickEffect(e);
    setShowMenu(!showMenu);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowMenu(false);
  };

  const handleCompleteProfileClick = () => {
    window.location.href = '/complete-profile';
    setShowMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* User Avatar Button */}
        <button
          onClick={handleMenuToggle}
          className="doodle-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            color: 'black',
            borderRadius: '25px',
            border: needsProfileCompletion ? '2px solid var(--doodle-yellow)' : 'none',
            background: needsProfileCompletion ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))' : 'transparent',
            cursor: 'pointer',
            fontWeight: '600',
            position: 'relative',
            animation: needsProfileCompletion ? 'pulse 2s infinite' : 'none'
          }}
        >
          <span>{user.username}</span>
          <span style={{ 
            fontSize: '0.8rem',
            background: getRankColor(user.rank),
            color: user.rank === 'Gold' || user.rank === 'Silver' ? 'var(--doodle-ink)' : 'black',
            padding: '2px 6px',
            borderRadius: '10px'
          }}>
            {user.rank}
          </span>
          {needsProfileCompletion && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '12px',
              height: '12px',
              background: 'var(--doodle-accent)',
              borderRadius: '50%',
              animation: 'blink 1.5s infinite'
            }}></span>
          )}
          <span style={{ fontSize: '0.8rem' }}>
            {showMenu ? '▲' : '▼'}
          </span>
        </button>

        {/* Add pulse animation styles */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(255, 215, 0, 0);
            }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>

        {/* Dropdown Menu */}
        {showMenu && (
          <div 
            className="doodle-card"
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '5px',
              minWidth: '200px',
              zIndex: 1000,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ padding: '10px 0' }}>
              {/* Profile Completion Banner - Show if profile needs completion */}
              {needsProfileCompletion && (
                <div style={{
                  padding: '15px',
                  margin: '10px',
                  // background: 'linear-gradient(135deg, var(--doodle-yellow), var(--doodle-accent))',
                  borderRadius: '12px',
                  marginBottom: '15px',
                  cursor: 'pointer',
                  // boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                  transition: 'transform 0.2s',
                  border: '2px solid var(--doodle-yellow)'
                }}
                onClick={handleCompleteProfileClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                >
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    color: 'var(--doodle-ink)',
                    marginBottom: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {/* <DoodleIcons.Star size={18} color="var(--doodle-ink)" /> */}
                    Complete Your Profile Now!
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(0, 0, 0, 0.7)',
                    lineHeight: '1.3'
                  }}>
                    Unlock all features and have a max experience
                  </div>
                </div>
              )}

              {/* User Info */}
              <div style={{ 
                padding: '10px 15px', 
                borderBottom: '1px solid var(--doodle-ink)', 
                // opacity: '0.3',
                marginBottom: '10px'
              }}>
                <div style={{   fontWeight: '600' }}>
                  {user.username}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  opacity: '0.7',
                   
                }}>
                  Level {user.level} • {user.rank}
                </div>
              </div>

              {/* Menu Items */}
              <button
                onClick={handleProfileClick}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                   
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--doodle-yellow)';
                  e.target.style.color = 'var(--doodle-ink)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = 'inherit';
                }}
              >
                <DoodleIcons.Users size={16} />
                View Profile
              </button>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                   
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--doodle-accent)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--doodle-accent)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = 'var(--doodle-accent)';
                }}
              >
                <DoodleIcons.Users size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => setShowProfile(false)}
        >
          <div 
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              maxWidth: '90vw'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <UserProfile onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};

export default UserMenu;
