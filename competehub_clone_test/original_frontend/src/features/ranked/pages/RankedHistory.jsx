import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../app/providers/UserContext';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import { Handshake, Heart, Trophy } from 'lucide-react';

export default function RankedHistory() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, getToken } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        console.log('[RankedHistory] Loaded profile:', profile);
        
        if (!profile.userId) {
          console.log('No userId found in profile');
          setIsLoading(false);
          return;
        }

        const token = getToken();
        const response = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}/ranked/history/${profile.userId}`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[RankedHistory] Fetched matches:', data);
          setMatches(data);
        } else {
          console.error('[RankedHistory] Failed to fetch matches:', response.status);
        }
      } catch (err) {
        console.error('[RankedHistory] Fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [getToken]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="doodle-container" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="doodle-spinner" style={{ margin: '40px auto' }}></div>
        <p style={{   }}>Loading match history...</p>
      </div>
    );
  }

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
          onClick={() => navigate('/ranked/profile')}
          className="doodle-btn"
          style={{
            marginBottom: '20px',
            background: 'var(--doodle-sketch)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </button>

        {/* Header Card */}
        <div className="doodle-card" style={{ 
          marginBottom: '20px',
          background: 'linear-gradient(135deg, var(--doodle-primary)dd 0%, var(--doodle-primary)aa 100%)',
          border: '3px solid var(--doodle-ink)',
          boxShadow: '5px 5px 0 rgba(0, 0, 0, 0.15)',
          padding: '30px 25px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
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
          
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '2rem',
              color: 'black',
              textShadow: '2px 2px 0 rgba(0, 0, 0, 0.3)',
              margin: '0 0 10px 0',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <DoodleIcons.Timer size={32} />
              Match History
            </h1>
            <p style={{ 
                
              fontSize: '0.95rem',
              color: 'rgba(0, 0, 0, 0.7)',
              margin: 0
            }}>
              Your complete ranked match history
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="doodle-card" style={{ 
            textAlign: 'center', 
            padding: '50px 30px',
            border: '3px solid var(--doodle-ink)',
            boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div className="doodle-avatar" style={{ 
              width: '80px', 
              height: '80px',
              margin: '0 auto 20px',
              background: 'var(--doodle-gray)'
            }}>
              <Trophy size={40} color="var(--doodle-secondary)" />
            </div>
            <h2 style={{ 
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '1.5rem',
              marginBottom: '12px',
              color: 'var(--doodle-ink)'
            }}>
              No Matches Yet
            </h2>
            <p style={{ 
                
              color: 'var(--doodle-secondary)', 
              marginBottom: '25px', 
              fontSize: '1rem' 
            }}>
              Start playing ranked matches to see your history here!
            </p>
            <button 
              className="doodle-btn doodle-btn-primary"
              onClick={() => navigate('/ranked/search')}
              style={{
                padding: '12px 28px',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <DoodleIcons.Trophy size={20} />
              Find Match
            </button>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '15px', 
              marginBottom: '20px' 
            }}>
              <div className="doodle-card" style={{ 
                textAlign: 'center', 
                padding: '20px 15px',
                border: '2px solid var(--doodle-ink)',
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0, 0, 0, 0.1)';
              }}>
                <DoodleIcons.Trophy size={24} style={{ marginBottom: '8px', color: 'var(--doodle-primary)' }} />
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 'bold', 
                  marginBottom: '5px',
                  fontFamily: 'Architects Daughter, cursive',
                  color: 'var(--doodle-ink)'
                }}>
                  {matches.length}
                </div>
                <p style={{   fontSize: '0.85rem', color: 'var(--doodle-secondary)', margin: 0 }}>
                  Total Matches
                </p>
              </div>
              
              <div className="doodle-card" style={{ 
                textAlign: 'center', 
                padding: '20px 15px',
                border: '2px solid var(--doodle-ink)',
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0, 0, 0, 0.1)';
              }}>
                <Trophy size={24} style={{ marginBottom: '8px', color: 'var(--doodle-green)' }} />
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 'bold', 
                  marginBottom: '5px', 
                  color: 'var(--doodle-green)',
                  fontFamily: 'Architects Daughter, cursive'
                }}>
                  {matches.filter(m => {
                    const userPlayerIndex = m.players.findIndex(p => p.user?.toString() === user?.id);
                    const userScore = m.scores?.find(s => s.playerIndex === userPlayerIndex)?.points || 0;
                    const opponentScore = m.scores?.find(s => s.playerIndex !== userPlayerIndex)?.points || 0;
                    return userScore > opponentScore;
                  }).length}
                </div>
                <p style={{   fontSize: '0.85rem', color: 'var(--doodle-secondary)', margin: 0 }}>
                  Wins
                </p>
              </div>
              
              <div className="doodle-card" style={{ 
                textAlign: 'center', 
                padding: '20px 15px',
                border: '2px solid var(--doodle-ink)',
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0, 0, 0, 0.1)';
              }}>
                <Heart size={24} style={{ marginBottom: '8px', color: 'var(--doodle-accent)' }} />
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 'bold', 
                  marginBottom: '5px', 
                  color: 'var(--doodle-accent)',
                  fontFamily: 'Architects Daughter, cursive'
                }}>
                  {matches.filter(m => {
                    const userPlayerIndex = m.players.findIndex(p => p.user?.toString() === user?.id);
                    const userScore = m.scores?.find(s => s.playerIndex === userPlayerIndex)?.points || 0;
                    const opponentScore = m.scores?.find(s => s.playerIndex !== userPlayerIndex)?.points || 0;
                    return userScore < opponentScore;
                  }).length}
                </div>
                <p style={{   fontSize: '0.85rem', color: 'var(--doodle-secondary)', margin: 0 }}>
                  Losses
                </p>
              </div>
              
              <div className="doodle-card" style={{ 
                textAlign: 'center', 
                padding: '20px 15px',
                border: '2px solid var(--doodle-ink)',
                boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0, 0, 0, 0.1)';
              }}>
                <DoodleIcons.Star size={24} style={{ marginBottom: '8px', color: '#d97706' }} />
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 'bold', 
                  marginBottom: '5px', 
                  color: '#d97706',
                  fontFamily: 'Architects Daughter, cursive'
                }}>
                  {matches.length > 0 ? Math.round((matches.filter(m => {
                    const userPlayerIndex = m.players.findIndex(p => p.user?.toString() === user?.id);
                    const userScore = m.scores?.find(s => s.playerIndex === userPlayerIndex)?.points || 0;
                    const opponentScore = m.scores?.find(s => s.playerIndex !== userPlayerIndex)?.points || 0;
                    return userScore > opponentScore;
                  }).length / matches.length) * 100) : 0}%
                </div>
                <p style={{   fontSize: '0.85rem', color: 'var(--doodle-secondary)', margin: 0 }}>
                  Win Rate
                </p>
              </div>
            </div>

            {/* Match List */}
            <div className="doodle-card" style={{
              border: '3px solid var(--doodle-ink)',
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)',
              padding: '25px 20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid var(--doodle-gray)'
              }}>
                <div className="doodle-avatar" style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--doodle-primary)',
                  flexShrink: 0
                }}>
                  <DoodleIcons.Timer size={20} />
                </div>
                <h2 style={{ 
                  fontFamily: 'Architects Daughter, cursive',
                  fontSize: '1.5rem',
                  margin: 0,
                  color: 'var(--doodle-ink)'
                }}>
                  Recent Matches
                </h2>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {matches.map((match) => {
                  const userPlayer = match.players.find(p => p.user?.toString() === user?.id);
                  const opponent = match.players.find(p => p.user?.toString() !== user?.id);
                  const userPlayerIndex = match.players.findIndex(p => p.user?.toString() === user?.id);
                  const opponentIndex = match.players.findIndex(p => p.user?.toString() !== user?.id);
                  const userScore = match.scores?.find(s => s.playerIndex === userPlayerIndex)?.points || 0;
                  const opponentScore = match.scores?.find(s => s.playerIndex === opponentIndex)?.points || 0;
                  const isWin = userScore > opponentScore;
                  const isDraw = userScore === opponentScore;

                  return (
                    <div 
                      key={match._id} 
                      className="doodle-card"
                      style={{ 
                        border: '2px solid var(--doodle-ink)',
                        borderLeft: `8px solid ${isWin ? 'var(--doodle-green)' : isDraw ? 'var(--doodle-yellow)' : 'var(--doodle-accent)'}`,
                        margin: '0',
                        padding: '15px 12px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'pointer',
                        boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.08)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0, 0, 0, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0, 0, 0, 0.08)';
                      }}
                    >
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'auto 1fr auto auto', 
                        alignItems: 'center', 
                        gap: '15px'
                      }}>
                        {/* Result Icon */}
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: isWin ? 'var(--doodle-green)' : isDraw ? 'var(--doodle-yellow)' : 'var(--doodle-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid var(--doodle-ink)',
                          flexShrink: 0
                        }}>
                          {isWin ? <Trophy size={24} color="white" /> : isDraw ? <Handshake size={24} color="white" /> : <Heart size={24} color="white" />}
                        </div>
                        
                        {/* Match Info */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ 
                            fontFamily: 'Architects Daughter, cursive', 
                            fontWeight: '600', 
                            marginBottom: '6px',
                            fontSize: '1.1rem',
                            color: 'var(--doodle-ink)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <span>vs {opponent?.username || 'Unknown'}</span>
                            {opponent?.isBot && (
                              <span style={{ 
                                background: 'var(--doodle-gray)',
                                color: 'var(--doodle-secondary)',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                border: '1px solid var(--doodle-ink)',
                                 
                              }}>
                                Bot
                              </span>
                            )}
                          </div>
                          <div style={{ 
                              
                            fontSize: '0.8rem', 
                            color: 'var(--doodle-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <DoodleIcons.Timer size={14} />
                              {formatDate(match.createdAt)}
                            </span>
                            <span style={{ 
                              background: 'var(--doodle-sketch)',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              border: '1px solid var(--doodle-ink)'
                            }}>
                              {match.roomCode}
                            </span>
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ 
                            fontFamily: 'Architects Daughter, cursive', 
                            fontWeight: 'bold', 
                            fontSize: '1.6rem',
                            color: isWin ? 'var(--doodle-green)' : isDraw ? '#d97706' : 'var(--doodle-accent)',
                            marginBottom: '4px',
                            lineHeight: '1'
                          }}>
                            {userScore} - {opponentScore}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem',
                            fontWeight: '600',
                             
                            color: isWin ? 'var(--doodle-green)' : isDraw ? '#d97706' : 'var(--doodle-accent)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {isWin ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                          </div>
                        </div>
                        
                        {/* ELO Change */}
                        <div style={{ 
                          textAlign: 'center',
                          background: (userPlayer?.eloDelta || 0) >= 0 ? 'var(--doodle-green)' : 'var(--doodle-accent)',
                          color: 'white',
                          padding: '10px 18px',
                          borderRadius: '12px',
                          border: '2px solid var(--doodle-ink)',
                          minWidth: '80px',
                          flexShrink: 0
                        }}>
                          <div style={{ 
                            fontFamily: 'Architects Daughter, cursive', 
                            fontWeight: 'bold',
                            fontSize: '1.3rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            marginBottom: '2px'
                          }}>
                            {(userPlayer?.eloDelta || 0) >= 0 ? '↗' : '↘'}
                            {(userPlayer?.eloDelta || 0) >= 0 ? '+' : ''}{userPlayer?.eloDelta || 0}
                          </div>
                          <div style={{ 
                            fontSize: '0.7rem',
                             
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            opacity: '0.9'
                          }}>
                            ELO
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={{ 
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/ranked/profile')}
            className="doodle-btn"
            style={{ 
              background: 'var(--doodle-sketch)',
              padding: '12px 25px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <DoodleIcons.Users size={20} />
            View Profile
          </button>
          <button
            onClick={() => navigate('/ranked')}
            className="doodle-btn"
            style={{
              background: 'var(--doodle-sketch)',
              padding: '12px 25px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <DoodleIcons.Trophy size={20} />
            Back to Ranked
          </button>
        </div>
      </div>
    </div>
  );
}


