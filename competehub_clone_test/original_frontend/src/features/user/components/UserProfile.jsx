// components/user/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

const UserProfile = ({ onClose }) => {
  const { user, logout, getProgression } = useUser();
  const [progression, setProgression] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgression = async () => {
      try {
        const data = await getProgression();
        setProgression(data);
      } catch (error) {
        console.error('Failed to load progression:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProgression();
    }
  }, [user, getProgression]);

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
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

  if (!user) return null;

  return (
    <div className="doodle-card" style={{ 
      maxWidth: '500px', 
      margin: '0 auto',
      padding: '25px',
      position: 'relative',
      maxHeight: '85vh',
      overflowY: 'auto'
    }}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'var(--doodle-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          ×
        </button>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {/* <div className="doodle-avatar doodle-float" style={{ 
          margin: '0 auto 12px',
          width: '60px',
          height: '60px',
          fontSize: '2rem'
        }}>
          {getAvatarEmoji(user.avatar)}
        </div> */}
        <h2 className="doodle-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          {user.username}
        </h2>
        <p className="doodle-subtitle" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
          {user.examTarget} • {user.email}
        </p>
        <div style={{ 
          display: 'inline-block',
          padding: '6px 12px',
          background: getRankColor(user.rank),
          color: user.rank === 'Gold' || user.rank === 'Silver' ? 'var(--doodle-ink)' : 'white',
          borderRadius: '15px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          {user.rank}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
        {/* Level & XP */}
        <div style={{ 
          padding: '12px', 
          background: 'rgba(255, 215, 0, 0.1)',
          borderRadius: '12px',
          border: '2px dashed var(--doodle-yellow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DoodleIcons.Trophy size={18} color="var(--doodle-yellow)" />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'Architects Daughter, cursive' }}>
              Level & XP
            </h4>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Level {user.level}
            </div>
            <div className="doodle-progress" style={{ marginBottom: '6px', height: '8px' }}>
              <div 
                className="doodle-progress-fill" 
                style={{ 
                  width: `${(user.currentLevelXP / user.nextLevelXP) * 100}%`,
                  background: 'var(--doodle-yellow)'
                }}
              ></div>
            </div>
            <p style={{ fontSize: '0.75rem', margin: '4px 0' }}>
              {user.currentLevelXP} / {user.nextLevelXP} XP
            </p>
            <p style={{ fontSize: '0.7rem', opacity: '0.7', margin: 0 }}>
              Total: {user.xp} XP
            </p>
          </div>
        </div>

        {/* Streaks */}
        <div style={{ 
          padding: '12px', 
          background: 'rgba(255, 107, 53, 0.1)',
          borderRadius: '12px',
          border: '2px dashed var(--doodle-orange)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DoodleIcons.Timer size={18} color="var(--doodle-orange)" />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'Architects Daughter, cursive' }}>
              Streaks
            </h4>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--doodle-orange)' }}>
              {user.loginStreak} 🔥
            </div>
            <p style={{ fontSize: '0.75rem', margin: '4px 0' }}>
              Current Streak
            </p>
            <p style={{ fontSize: '0.7rem', opacity: '0.7', margin: 0 }}>
              Best: {user.longestStreak} days
            </p>
          </div>
        </div>

        {/* Ranked Stats */}
        {user?.ranked && (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(37, 99, 235, 0.1)',
            borderRadius: '12px',
            border: '2px dashed var(--doodle-blue)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <DoodleIcons.Trophy size={18} color="var(--doodle-blue)" />
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'Architects Daughter, cursive' }}>
                Ranked Mode
              </h4>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                marginBottom: '6px',
                color: user.ranked.elo >= 1400 ? 'var(--doodle-yellow)' : 
                       user.ranked.elo >= 1200 ? 'var(--doodle-blue)' : 
                       'var(--doodle-orange)'
              }}>
                {user.ranked.elo}
              </div>
              <p style={{ fontSize: '0.75rem', marginBottom: '8px' }}>ELO Rating</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem' }}>
                <div>Games: <strong>{user.ranked.gamesPlayed}</strong></div>
                <div>Win Rate: <strong style={{ color: user.ranked.winRate >= 50 ? 'var(--doodle-green)' : 'var(--doodle-accent)' }}>{user.ranked.winRate}%</strong></div>
                <div>Wins: <strong style={{ color: 'var(--doodle-green)' }}>{user.ranked.wins}</strong></div>
                <div>Losses: <strong style={{ color: 'var(--doodle-accent)' }}>{user.ranked.losses}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div style={{ 
          padding: '12px', 
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '12px',
          border: '2px dashed var(--doodle-green)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DoodleIcons.Brain size={18} color="var(--doodle-green)" />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'Architects Daughter, cursive' }}>
              Statistics
            </h4>
          </div>
          {isLoading ? (
            <div className="doodle-spinner" style={{ margin: '10px auto', width: '30px', height: '30px' }}></div>
          ) : progression ? (
            <div style={{ fontSize: '0.75rem', display: 'grid', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Questions:</span>
                <strong>{progression.totalQuestionsAnswered || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Correct:</span>
                <strong>{progression.totalCorrectAnswers || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Accuracy:</span>
                <strong>{progression.averageAccuracy?.toFixed(1) || 0}%</strong>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.75rem', opacity: '0.7', textAlign: 'center', margin: 0 }}>
              No stats yet
            </p>
          )}
        </div>
      </div>

      {/* Achievements */}
      {progression?.achievements && progression.achievements.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', fontFamily: 'Architects Daughter, cursive', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DoodleIcons.Star size={18} color="var(--doodle-purple)" />
            Achievements
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {progression.achievements.slice(0, 6).map((achievement, index) => (
              <div 
                key={index}
                className="doodle-badge"
                style={{ 
                  background: 'var(--doodle-yellow)', 
                  color: 'var(--doodle-ink)',
                  padding: '4px 8px',
                  fontSize: '0.7rem'
                }}
              >
                {achievement.badgeName}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={handleLogout}
          className="doodle-btn doodle-btn-danger"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Logout
        </button>
      </div>

      
    </div>
  );
};

export default UserProfile;
