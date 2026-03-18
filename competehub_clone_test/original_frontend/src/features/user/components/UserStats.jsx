import React from 'react';
import { Users, Gamepad, Bell, Crown, Zap, Brain, Puzzle, Star, TrendingUp, Globe } from 'lucide-react';
import './UserStats.css';

const UserStats = ({ userStats, isAuthenticated }) => {
  const getRatingIcon = (ratingType) => {
    switch (ratingType) {
      case 'ranked': return <Crown size={16} />;
      case 'blitz': return <Zap size={16} />;
      case 'classical': return <Brain size={16} />;
      case 'puzzle': return <Puzzle size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getRatingColor = (ratingType) => {
    switch (ratingType) {
      case 'ranked': return 'var(--doodle-accent)';
      case 'blitz': return 'var(--doodle-green)';
      case 'classical': return 'var(--doodle-blue)';
      case 'puzzle': return 'var(--doodle-purple)';
      default: return 'var(--doodle-secondary)';
    }
  };

  const ratings = [
    {
      label: 'RANKED',
      rating: userStats.ratings.ranked,
      icon: Crown,
      color: 'var(--doodle-accent)',
      featured: true
    },
    // Uncomment these when you want to show more ratings
    // { 
    //   label: 'BLITZ', 
    //   rating: userStats.ratings.blitz, 
    //   icon: Zap, 
    //   color: 'var(--doodle-green)' 
    // },
    // { 
    //   label: 'CLASSICAL', 
    //   rating: userStats.ratings.classical, 
    //   icon: Brain, 
    //   color: 'var(--doodle-blue)' 
    // },
    // { 
    //   label: 'PUZZLE', 
    //   rating: userStats.ratings.puzzle, 
    //   icon: Puzzle, 
    //   color: 'var(--doodle-purple)' 
    // }
  ];

  return (
    <>
      <img
        src="/note2.png"
        alt=""
        style={{
          position: 'absolute',
          top: -10,
          left: 0,
          width: '200px',
          height: '200px',
          objectFit: 'cover',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      <div className="user-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>

        {/* Header Stats - Always show global stats */}
        <div className="header-stats sticky-note">
          {/* Tape top right */}

          {/* Tape bottom left */}

          <div className="stat-item">
            <div className="stat-icon competers-icon">
              <Globe size={18} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{'Competers'}</div>
              <div className="stat-value">{userStats.competers.toLocaleString()}</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon games-icon">
              <Gamepad size={18} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{isAuthenticated ? 'Your Games' : 'Games Played'}</div>
              <div className="stat-value">{userStats.gamesPlayed.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* User Profile Section - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="user-profile-section sticky-note" style={{ position: 'relative' }}>
            {/* Tape top right */}

            {/* Tape bottom left */}

            {/* <div className="notification-icon">
              <Bell size={20} style={{ color: 'var(--doodle-secondary)', cursor: 'pointer' }} />
            </div> */}

            <div className="user-info" style={{ marginLeft: '10px' }}>
              <div className="user-details">
                <div className="user-level">
                  <span className="level-badge">{userStats.level}</span>
                  <span className="xp-text">{userStats.xp} XP</span>
                  {/* <span className="currency-text">{userStats.currency}</span> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest CTA - Show for non-authenticated users */}
        {!isAuthenticated && (
          <div className="user-profile-section sticky-note" style={{ background: '', color: 'black', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--doodle-secondary)', position: 'relative', marginTop: '50px' }}>
            {/* Tape top right */}

            <a href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Crown size={24} style={{ color: 'black' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Login to Track Progress</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Save scores & compete globally!</div>
                </div>
              </div>
            </a>
          </div>
        )}

      </div>
    </>
  );
};

export default UserStats;
