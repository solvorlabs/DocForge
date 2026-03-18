import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import { Swords } from 'lucide-react';

const RankedProfile = () => {
  const navigate = useNavigate();
  const { user, getToken } = useUser();
  const [rankedProfile, setRankedProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRankedData = async () => {
      try {
        const token = getToken();
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        
        if (!profile.userId || !token) {
          console.log('No user data found');
          setIsLoading(false);
          return;
        }

        // Fetch ranked profile
        const profileResponse = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}/ranked/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: profile.userId,
            username: profile.username
          })
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setRankedProfile(profileData);
        }

        // Fetch match history
        const historyResponse = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}/ranked/history/${profile.userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setMatches(historyData);
        }

      } catch (error) {
        console.error('Error loading ranked data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankedData();
  }, [getToken]);

  const getRankFromElo = (elo) => {
    if (elo >= 2000) return { name: 'Grandmaster', color: '#FF1493' };
    if (elo >= 1800) return { name: 'Master', color: '#8A2BE2' };
    if (elo >= 1600) return { name: 'Diamond', color: '#B9F2FF' };
    if (elo >= 1400) return { name: 'Platinum', color: '#E5E4E2' };
    if (elo >= 1200) return { name: 'Gold', color: '#FFD700' };
    if (elo >= 1000) return { name: 'Silver', color: '#C0C0C0' };
    return { name: 'Bronze', color: '#CD7F32' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="doodle-container" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="doodle-spinner" style={{ margin: '40px auto' }}></div>
        <p style={{   }}>Loading ranked profile...</p>
      </div>
    );
  }

  if (!rankedProfile) {
    return (
      <div className="doodle-container" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="doodle-card">
          <h2 className="doodle-title">Ranked Profile Not Found</h2>
          <p style={{   marginBottom: '20px' }}>
            Unable to load your ranked profile. Please try again.
          </p>
          <button 
            className="doodle-btn doodle-btn-primary"
            style={{background: 'var(--doodle-sketch)'}}
            onClick={() => navigate('/ranked')}
          >
            Back to Ranked
          </button>
        </div>
      </div>
    );
  }

  const rank = getRankFromElo(rankedProfile.elo);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #f7fafc 25%, transparent 25%), linear-gradient(-45deg, #f7fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7fafc 75%), linear-gradient(-45deg, transparent 75%, #f7fafc 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#edf2f7',
      padding: '20px',
       
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/ranked')}
          className="doodle-btn"
          style={{
            marginBottom: '20px',
            background: 'var(--doodle-sketch)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Ranked
        </button>

        {/* Hero Section - Profile Header */}
        <div className="doodle-card" style={{ 
          marginBottom: '20px',
          padding: '0',
          overflow: 'hidden',
          border: '3px solid var(--doodle-ink)',
          boxShadow: '5px 5px 0 rgba(0, 0, 0, 0.15)'
        }}>
          {/* Gradient Background Header */}
          <div style={{
            background: `linear-gradient(135deg, ${rank.color}dd 0%, ${rank.color}aa 100%)`,
            padding: '25px 20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Elements */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }}></div>

            <div style={{ 
              position: 'relative', 
              zIndex: 1, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              {/* Avatar with Rank Badge */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div className="doodle-avatar" style={{ 
                  width: '80px', 
                  height: '80px',
                  background: 'white',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
                  border: '3px solid white'
                }}>
                  <Swords size={40} color={rank.color} />
                </div>
                {/* Rank Badge below Avatar */}
                <div style={{
                  background: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: '2px solid var(--doodle-ink)',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  color: rank.color === '#FFD700' || rank.color === '#C0C0C0' ? 'var(--doodle-ink)' : rank.color,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  {rank.name}
                </div>
              </div>

                {/* Username */}
                <h1 style={{ 
                  fontFamily: 'Architects Daughter, cursive',
                  fontSize: '1.8rem',
                  color: 'black',
                  textShadow: '2px 2px 0 rgba(0, 0, 0, 0.3)',
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  {rankedProfile.username}
                </h1>

                {/* ELO with Label */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '10px 30px',
                  borderRadius: '30px',
                  border: '2px solid var(--doodle-ink)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                }}>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--doodle-secondary)',
                    marginBottom: '3px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ELO Rating
                  </div>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: rank.color === '#FFD700' || rank.color === '#C0C0C0' ? 'var(--doodle-ink)' : rank.color,
                    lineHeight: '1'
                  }}>
                    {rankedProfile.elo}
                  </div>
                </div>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            background: 'white',
            borderTop: '2px solid var(--doodle-ink)'
          }}>
            {/* Games Played */}
            <div style={{ 
              padding: '15px 10px', 
              textAlign: 'center',
              borderRight: '1px solid var(--doodle-paper)'
            }}>
              <DoodleIcons.Brain size={22} style={{ color: 'var(--doodle-blue)', marginBottom: '6px' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--doodle-ink)', marginBottom: '3px' }}>
                {rankedProfile.gamesPlayed}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--doodle-secondary)', fontWeight: '600' }}>
                Games
              </div>
            </div>

            {/* Wins */}
            <div style={{ 
              padding: '15px 10px', 
              textAlign: 'center',
              borderRight: '1px solid var(--doodle-paper)'
            }}>
              <DoodleIcons.Trophy size={22} style={{ color: 'var(--doodle-green)', marginBottom: '6px' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--doodle-green)', marginBottom: '3px' }}>
                {rankedProfile.wins}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--doodle-secondary)', fontWeight: '600' }}>
                Wins
              </div>
            </div>

            {/* Losses */}
            <div style={{ 
              padding: '15px 10px', 
              textAlign: 'center',
              borderRight: '1px solid var(--doodle-paper)'
            }}>
              <DoodleIcons.X size={22} style={{ color: 'var(--doodle-accent)', marginBottom: '6px' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--doodle-accent)', marginBottom: '3px' }}>
                {rankedProfile.losses}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--doodle-secondary)', fontWeight: '600' }}>
                Losses
              </div>
            </div>

            {/* Win Rate */}
            <div style={{ 
              padding: '15px 10px', 
              textAlign: 'center'
            }}>
              <DoodleIcons.Star size={22} style={{ color: 'var(--doodle-yellow)', marginBottom: '6px' }} />
              <div style={{ 
                fontSize: '1.4rem', 
                fontWeight: 'bold', 
                marginBottom: '3px',
                color: rankedProfile.gamesPlayed > 0 && (rankedProfile.wins / rankedProfile.gamesPlayed) >= 0.6 ? 'var(--doodle-green)' : 
                       rankedProfile.gamesPlayed > 0 && (rankedProfile.wins / rankedProfile.gamesPlayed) >= 0.4 ? 'var(--doodle-yellow)' : 'var(--doodle-accent)'
              }}>
                {rankedProfile.gamesPlayed > 0 ? Math.round((rankedProfile.wins / rankedProfile.gamesPlayed) * 100) : 0}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--doodle-secondary)', fontWeight: '600' }}>
                Win Rate
              </div>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="doodle-card" style={{
          border: '3px solid var(--doodle-ink)',
          boxShadow: '5px 5px 0 rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '15px',
            paddingBottom: '12px',
            borderBottom: '2px solid var(--doodle-paper)'
          }}>
            <div className="doodle-avatar" style={{ width: '32px', height: '32px' }}>
              <DoodleIcons.Timer size={18} color="#fff" />
            </div>
            <h2 style={{ 
              fontFamily: 'Architects Daughter, cursive', 
              fontSize: '1.4rem',
              margin: 0,
              color: 'var(--doodle-ink)'
            }}>
              Recent Matches
            </h2>
          </div>
          
          {matches.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              background: 'linear-gradient(135deg, var(--doodle-paper) 0%, #fafafa 100%)',
              borderRadius: '12px',
              border: '2px dashed var(--doodle-secondary)'
            }}>
              <div className="doodle-avatar" style={{ 
                margin: '0 auto 15px',
                width: '60px',
                height: '60px',
                background: 'var(--doodle-blue)'
              }}>
                <DoodleIcons.Trophy size={30} color="#fff" />
              </div>
              <p style={{ 
                fontSize: '1.1rem',
                marginBottom: '8px',
                fontWeight: '600',
                color: 'var(--doodle-ink)'
              }}>
                No matches played yet
              </p>
              <p style={{ 
                opacity: '0.7', 
                fontSize: '0.9rem',
                marginBottom: '20px'
              }}>
                Start your ranked journey!
              </p>
              <button 
                className="doodle-btn doodle-btn-primary"
                onClick={() => navigate('/ranked/search')}
                style={{ 
                  padding: '10px 25px',
                  fontSize: '1rem'
                }}
              >
                <DoodleIcons.Trophy size={18} style={{ marginRight: '6px' }} />
                Find Match
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matches.slice(0, 10).map((match) => {
                const userPlayer = match.players.find(p => p.user?.toString() === user?.id);
                const opponent = match.players.find(p => p.user?.toString() !== user?.id);
                const userScore = match.scores?.find(s => s.playerIndex === match.players.findIndex(p => p.user?.toString() === user?.id))?.points || 0;
                const opponentScore = match.scores?.find(s => s.playerIndex === match.players.findIndex(p => p.user?.toString() !== user?.id))?.points || 0;
                const isWin = userScore > opponentScore;
                const isDraw = userScore === opponentScore;

                return (
                  <div 
                    key={match._id} 
                    className="doodle-card"
                    style={{ 
                      padding: '0',
                      border: `2px solid ${isWin ? 'var(--doodle-green)' : isDraw ? 'var(--doodle-yellow)' : 'var(--doodle-accent)'}`,
                      boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* Status Bar */}
                      <div style={{ 
                        width: '8px', 
                        background: isWin ? 'var(--doodle-green)' : isDraw ? 'var(--doodle-yellow)' : 'var(--doodle-accent)',
                        flexShrink: 0
                      }}></div>
                      
                      {/* Match Info */}
                      <div style={{ 
                        flex: 1,
                        padding: '12px 15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        flexWrap: 'wrap'
                      }}>
                        {/* Result Badge */}
                        <div style={{
                          background: isWin ? 'var(--doodle-green)' : isDraw ? 'var(--doodle-yellow)' : 'var(--doodle-accent)',
                          color: 'white',
                          padding: '5px 12px',
                          borderRadius: '15px',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          border: '2px solid var(--doodle-ink)',
                          boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.15)',
                          flexShrink: 0
                        }}>
                          {isWin ? '🏆 WIN' : isDraw ? '🤝 DRAW' : '💔 LOSS'}
                        </div>

                        {/* Opponent Info */}
                        <div style={{ flex: 1, minWidth: '150px' }}>
                          <div style={{ 
                            fontWeight: '600', 
                            fontSize: '0.95rem',
                            marginBottom: '4px',
                            color: 'var(--doodle-ink)'
                          }}>
                            vs {opponent?.username || 'Unknown'}
                            {opponent?.isBot && (
                              <span style={{ 
                                marginLeft: '6px',
                                fontSize: '0.75rem',
                                padding: '2px 6px',
                                background: 'var(--doodle-paper)',
                                borderRadius: '6px',
                                opacity: '0.7'
                              }}>
                                🤖 Bot
                              </span>
                            )}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--doodle-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <DoodleIcons.Timer size={12} />
                            {formatDate(match.createdAt)}
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div style={{ 
                          textAlign: 'center',
                          padding: '8px 15px',
                          background: 'var(--doodle-paper)',
                          borderRadius: '10px',
                          border: '2px solid var(--doodle-ink)',
                          flexShrink: 0
                        }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: '1.2rem',
                            color: isWin ? 'var(--doodle-green)' : isDraw ? 'var(--doodle-yellow)' : 'var(--doodle-accent)',
                            lineHeight: '1'
                          }}>
                            {userScore} - {opponentScore}
                          </div>
                          <div style={{
                            fontSize: '0.65rem',
                            color: 'var(--doodle-secondary)',
                            marginTop: '3px'
                          }}>
                            Score
                          </div>
                        </div>
                        
                        {/* ELO Change */}
                        <div style={{ 
                          textAlign: 'center',
                          flexShrink: 0
                        }}>
                          <div style={{ 
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            color: (userPlayer?.eloDelta >= 0) ? 'var(--doodle-green)' : 'var(--doodle-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            {(userPlayer?.eloDelta >= 0) ? '↗' : '↘'}
                            {(userPlayer?.eloDelta >= 0) ? '+' : ''}{userPlayer?.eloDelta || 0}
                          </div>
                          <div style={{
                            fontSize: '0.65rem',
                            color: 'var(--doodle-secondary)',
                            marginTop: '2px'
                          }}>
                            ELO
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {matches.length > 10 && (
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button 
                    className="doodle-btn doodle-btn-secondary"
                    onClick={() => navigate('/ranked/history')}
                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                  >
                    View All {matches.length} Matches →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'center',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/ranked/search')}
            className="doodle-btn doodle-btn-primary"
            style={{ 
              padding: '12px 25px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <DoodleIcons.Trophy size={20} />
            Find Match
          </button>
          <button
            onClick={() => navigate('/ranked/leaderboard')}
            className="doodle-btn"
            style={{ 
              padding: '12px 25px',
              fontSize: '1rem',
              background: 'var(--doodle-yellow)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <DoodleIcons.Star size={20} />
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankedProfile;