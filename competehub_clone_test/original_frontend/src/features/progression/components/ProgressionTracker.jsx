// components/progression/ProgressionTracker.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

const ProgressionTracker = ({ showDetails = false, compact = false }) => {
  const { user, addXP, updateHighScore, updateStats } = useUser();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

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

  // Function to add XP (can be called from parent components)
  const handleAddXP = async (amount, source = 'challenge') => {
    try {
      const result = await addXP(amount, source);
      if (result.leveledUp) {
        setLevelUpData(result);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  };

  // Function to update high score
  const handleUpdateHighScore = async (scoreData) => {
    try {
      await updateHighScore(scoreData);
    } catch (error) {
      console.error('Failed to update high score:', error);
    }
  };

  // Function to update stats
  const handleUpdateStats = async (statsData) => {
    try {
      await updateStats(statsData);
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };

  // Expose functions for parent components
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    addXP: handleAddXP,
    updateHighScore: handleUpdateHighScore,
    updateStats: handleUpdateStats
  }));

  if (!user) {
    return (
      <div className="doodle-card" style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{   opacity: '0.7' }}>
          Please log in to track your progression
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Avatar */}
        <div style={{ fontSize: '2rem' }}>
          {getAvatarEmoji(user.avatar)}
        </div>

        {/* Level & XP */}
        <div>
          <div style={{ 
              
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>
            Level {user.level}
          </div>
          <div className="doodle-progress" style={{ width: '100px', height: '8px' }}>
            <div 
              className="doodle-progress-fill" 
              style={{ 
                width: `${(user.currentLevelXP / user.nextLevelXP) * 100}%`,
                background: 'var(--doodle-yellow)'
              }}
            ></div>
          </div>
        </div>

        {/* Rank Badge */}
        <div style={{ 
          padding: '4px 8px',
          background: getRankColor(user.rank),
          color: user.rank === 'Gold' || user.rank === 'Silver' ? 'var(--doodle-ink)' : 'white',
          borderRadius: '10px',
          fontSize: '0.8rem',
           
          fontWeight: '600'
        }}>
          {user.rank}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="doodle-card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            marginBottom: '20px' 
          }}>
            <div style={{ fontSize: '2.5rem' }}>
              {getAvatarEmoji(user.avatar)}
            </div>
            <div>
              <h3 style={{ 
                fontFamily: 'Architects Daughter, cursive', 
                margin: '0 0 5px 0',
                fontSize: '1.5rem'
              }}>
                {user.username}
              </h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}>
                <span style={{ 
                  padding: '4px 8px',
                  background: getRankColor(user.rank),
                  color: user.rank === 'Gold' || user.rank === 'Silver' ? 'var(--doodle-ink)' : 'white',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                   
                  fontWeight: '600'
                }}>
                  {user.rank}
                </span>
                <span style={{ 
                    
                  fontSize: '0.9rem',
                  opacity: '0.7'
                }}>
                  Level {user.level}
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px' 
            }}>
              <span style={{   fontWeight: '600' }}>
                Experience Points
              </span>
              <span style={{ 
                  
                fontSize: '0.9rem',
                opacity: '0.7'
              }}>
                {user.currentLevelXP} / {user.nextLevelXP}
              </span>
            </div>
            <div className="doodle-progress">
              <div 
                className="doodle-progress-fill" 
                style={{ 
                  width: `${(user.currentLevelXP / user.nextLevelXP) * 100}%`,
                  background: 'var(--doodle-yellow)'
                }}
              ></div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '5px',
               
              fontSize: '0.8rem',
              opacity: '0.7'
            }}>
              Total XP: {user.xp}
            </div>
          </div>

          {/* Streak */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: showDetails ? '20px' : '0'
          }}>
            <DoodleIcons.Timer size={20} color="var(--doodle-orange)" />
            <span style={{   fontWeight: '600' }}>
              Login Streak: {user.loginStreak} days 🔥
            </span>
          </div>

          {/* Additional Details */}
          {showDetails && (
            <div style={{ 
              borderTop: '1px solid var(--doodle-ink)', 
              opacity: '0.3',
              paddingTop: '15px',
              marginTop: '15px'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '15px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ 
                      
                    fontWeight: '600',
                    fontSize: '1.2rem'
                  }}>
                    {user.totalQuestionsAnswered || 0}
                  </div>
                  <div style={{ 
                      
                    fontSize: '0.8rem',
                    opacity: '0.7'
                  }}>
                    Questions
                  </div>
                </div>
                <div>
                  <div style={{ 
                      
                    fontWeight: '600',
                    fontSize: '1.2rem'
                  }}>
                    {user.averageAccuracy?.toFixed(1) || 0}%
                  </div>
                  <div style={{ 
                      
                    fontSize: '0.8rem',
                    opacity: '0.7'
                  }}>
                    Accuracy
                  </div>
                </div>
                <div>
                  <div style={{ 
                      
                    fontWeight: '600',
                    fontSize: '1.2rem'
                  }}>
                    {user.longestStreak}
                  </div>
                  <div style={{ 
                      
                    fontSize: '0.8rem',
                    opacity: '0.7'
                  }}>
                    Best Streak
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Level Up Animation */}
      {showLevelUp && levelUpData && (
        <div 
          className="doodle-level-up"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--doodle-yellow)',
            color: 'var(--doodle-ink)',
            padding: '30px',
            borderRadius: '20px',
            textAlign: 'center',
            zIndex: 2000,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            animation: 'doodle-bounce 0.6s ease-out'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
            🎉
          </div>
          <h3 style={{ 
            fontFamily: 'Architects Daughter, cursive', 
            margin: '0 0 10px 0',
            fontSize: '1.5rem'
          }}>
            Level Up!
          </h3>
          <p style={{ 
              
            margin: '0',
            fontSize: '1.1rem'
          }}>
            You reached Level {levelUpData.level}!
          </p>
          {levelUpData.rankChanged && (
            <p style={{ 
                
              margin: '5px 0 0 0',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              New Rank: {levelUpData.rank}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default ProgressionTracker;
