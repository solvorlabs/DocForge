import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../../../app/providers/GameContext';
import '../../../../styles/themes/doodle.css';
import { createClickEffect, DoodleIcons } from '../../../../shared/utils/doodleUtils';
import HostControls from '../../components/HostControls';
import ChatWindow from '../../../../features/social/components/ChatWindow';
import { Eye, MessageCircle } from 'lucide-react';
import VolumeControl from '../../../../shared/components/audio/VolumeControl';

// Main GameRoom Component
function GameRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const {
    username,
    gameData,
    isHost,
    error,
    clearError,
    loading,
    joinTeam,
    spectate,
    startGame,
    isInRedTeam,
    isInBlueTeam,
    isSpectator
  } = useGame();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [issmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [chatOpen, setChatOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions for team membership
  const isUserInRedTeam = () => {
    if (typeof isInRedTeam === 'function') {
      return isInRedTeam();
    }
    return gameData?.redTeam?.some(player => player.username === username);
  };

  const isUserInBlueTeam = () => {
    if (typeof isInBlueTeam === 'function') {
      return isInBlueTeam();
    }
    return gameData?.blueTeam?.some(player => player.username === username);
  };

  const isUserSpectator = () => {
    if (typeof isSpectator === 'function') {
      return isSpectator();
    }
    return gameData?.spectators?.some(spectator => spectator.username === username);
  };

  // Redirect to home if no username is set (unless coming from room link)
  useEffect(() => {
    if (!username && !window.location.pathname.includes('/join/')) {
      navigate('/');
    }
  }, [username, navigate]);

  // Redirect to game board if game has started
  useEffect(() => {
    if (gameData && gameData.status === 'playing') {
      navigate(`/game/${roomCode}`);
    }
  }, [gameData, navigate, roomCode]);

  const handleJoinTeam = (team, e) => {
    createClickEffect(e);
    joinTeam(team);
  };

  const handleSpectate = (e) => {
    createClickEffect(e);
    spectate();
  };

  const handleStartGame = (e) => {
    createClickEffect(e);
    startGame();
  };

  const canStartGame = () => {
    if (!gameData) return false;

    return (
      isHost &&
      gameData.redTeam.length > 0 &&
      gameData.blueTeam.length > 0 &&
      gameData.redTeam.length <= 5 &&
      gameData.blueTeam.length <= 5
    );
  };

  const calculateTotalQuestions = () => {
    const maxTeamSize = Math.max(
      gameData?.redTeam?.length || 0,
      gameData?.blueTeam?.length || 0
    );
    const rounds = gameData?.rounds || gameData?.gameSettings?.rounds || 1;
    const faceoffsPerPerson = gameData?.gameSettings?.faceoffsPerPerson || 1;

    return maxTeamSize * rounds * faceoffsPerPerson;
  };

  if (loading) {
    return (
      <div className="doodle-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          padding: '20px'
        }}>
          <div className="doodle-spinner" style={{ marginBottom: '20px' }}></div>
          <p style={{
             
            color: 'var(--doodle-secondary)',
            fontSize: '1.2rem'
          }}>
            Loading game room...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(45deg, #f7fafc 25%, transparent 25%), linear-gradient(-45deg, #f7fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7fafc 75%), linear-gradient(-45deg, transparent 75%, #f7fafc 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#edf2f7',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Top Left - Exit Game Button */}
      <button
        onClick={() => navigate('/home')}
        className="doodle-btn"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'var(--doodle-sketch)',
          width: '48px',
          height: '48px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 10
        }}
        title="Exit Game"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Top Right - How to Play Button */}
      <button
        onClick={() => setShowRules(true)}
        className="doodle-btn"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--doodle-blue)',
          width: '48px',
          height: '48px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 10
        }}
        title="How to Play"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Top Header Bar */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        {/* Center - Title and Room Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="doodle-avatar" style={{ width: '32px', height: '32px' }}>
              <DoodleIcons.Gamepad size={22} color="#fff" />
            </div>
            <h1 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              margin: 0,
              color: 'var(--doodle-ink)'
            }}>
              CompeteHub 5v5
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="doodle-badge" style={{
              background: 'var(--doodle-yellow)',
              color: 'var(--doodle-ink)',
              padding: '6px 12px',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
              onClick={(e) => {
                navigator.clipboard.writeText(roomCode);
                createClickEffect(e);
                // Optional: Show a brief "Copied!" message
                const badge = e.currentTarget;
                const originalText = badge.innerHTML;
                badge.innerHTML = '<span style="display: flex; align-items: center; gap: 8px;"><svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!</span>';
                setTimeout(() => {
                  badge.innerHTML = originalText;
                }, 1500);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Click to copy room code"
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Room: {roomCode}
            </div>
            <div className="doodle-badge" style={{
              background: 'var(--doodle-blue)',
              padding: '6px 12px',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
              onClick={(e) => {
                const shareableLink = `${window.location.origin}/join/${roomCode}`;
                navigator.clipboard.writeText(shareableLink);
                createClickEffect(e);
                // Show a brief "Copied!" message
                const badge = e.currentTarget;
                const originalText = badge.innerHTML;
                badge.innerHTML = '<span style="display: flex; align-items: center; gap: 8px;"><svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Link Copied!</span>';
                setTimeout(() => {
                  badge.innerHTML = originalText;
                }, 1500);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Click to copy shareable link"
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {isMobile ? 'Link' : 'Share Link'}
            </div>
            <div className="doodle-badge" style={{
              background: isUserInRedTeam() ? 'var(--doodle-accent)' :
                isUserInBlueTeam() ? 'var(--doodle-blue)' : 'var(--doodle-yellow)',
              padding: '6px 12px',
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}>
              {username}
            </div>
          </div>
          {/* <VolumeControl /> */}

          {/* Host Controls - Inline with other content */}
          {/* {isHost && (
            <div>
              <HostControls />
            </div>
          )} */}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="doodle-alert" style={{
          margin: '10px 20px 0',
          fontSize: isMobile ? '0.9rem' : '1rem'
        }}>
          {error}
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              float: 'right',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content Area - Fixed Height, No Scroll */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: isMobile || isTablet ? '' : '1fr 350px',
        gap: isMobile ? '0' : '20px',
        padding: '20px',
        overflow: 'hidden',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Left Side - Game Content (Scrollable) */}
        <div style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: '10px',
          paddingRight: isMobile ? '0' : '10px'
        }}>
          {/* Teams Section */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: isMobile || isTablet ? '16px' : '24px',
            marginBottom: isMobile ? '12px' : '16px'
          }}>
            {/* Red Team */}
            <div
              className="doodle-card doodle-team-red"
              style={{
                border: isUserInRedTeam() ? '3px solid gold' : '2px solid var(--doodle-accent)',
                height: 'fit-content',
                padding: isMobile ? '12px' : '14px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div>
                <h3 style={{
                  fontFamily: 'Architects Daughter, cursive',
                  color: 'var(--doodle-accent)',
                  marginBottom: '8px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '1rem' : '1.1rem'
                }}>
                  <DoodleIcons.Users size={16} style={{ marginRight: '6px' }} />
                  Red Team
                </h3>

                <div style={{
                  textAlign: 'center',
                  marginBottom: '8px',
                   
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}>
                  {gameData?.redTeam?.length || 0}/5 Players
                </div>

                {/* Compact Player List - Fixed Height, No Scroll */}
                <div style={{
                  display: 'grid',
                  gap: '3px',
                  marginBottom: '10px'
                }}>
                  {Array.from({ length: 5 }).map((_, index) => {
                    const player = gameData?.redTeam?.[index];
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: isMobile ? '4px 6px' : '5px 8px',
                          background: player ? 'rgba(229, 62, 62, 0.2)' : 'rgba(255,255,255,0.3)',
                          borderRadius: '6px',
                          border: '1px dashed var(--doodle-accent)',
                          fontSize: isMobile ? '0.75rem' : '0.85rem'
                        }}
                      >
                        <div style={{
                          width: isMobile ? '18px' : '20px',
                          height: isMobile ? '18px' : '20px',
                          borderRadius: '50%',
                          background: player ? 'var(--doodle-accent)' : 'var(--doodle-secondary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          marginRight: '6px',
                          fontSize: isMobile ? '0.65rem' : '0.7rem'
                        }}>
                          {index + 1}
                        </div>
                        <span style={{
                           
                          fontWeight: player ? 'bold' : 'normal',
                          color: player ? 'var(--doodle-ink)' : 'var(--doodle-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}>
                          {player ? player.username : 'Empty Slot'}
                          {player?.username === username && ' (You)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {isUserInRedTeam() ? (
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(229, 62, 62, 0.3)',
                      borderRadius: '8px',
                      border: '2px solid var(--doodle-accent)',
                       
                      fontWeight: 'bold',
                      color: 'var(--doodle-accent)',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}>
                      ✓ You're in this team
                    </div>
                  ) : (
                    <button
                      className="doodle-btn doodle-btn-danger"
                      onClick={(e) => handleJoinTeam('red', e)}
                      disabled={gameData?.redTeam?.length >= 5 || gameData?.status !== 'waiting'}
                      style={{
                        width: '100px',
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        padding: isMobile ? '8px' : '10px'
                      }}
                    >
                      {isUserInBlueTeam() ? 'Switch' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Center Section - Hidden on mobile, simplified on tablet */}
            {!issmallMobile && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                minWidth: isTablet ? '' : '140px'
              }}>
                <div className="doodle-sticky" style={{
                  minWidth: isTablet ? '120px' : '140px',
                  padding: '12px'
                }}>
                  <h4 style={{ textAlign: 'center', margin: '0 0 8px 0', fontSize: '1rem' }}>
                    Spectators ({gameData?.spectators?.length || 0})
                  </h4>

                  <div style={{
                    maxHeight: '80px',
                    overflow: 'auto',
                    marginBottom: '8px',
                    fontSize: '0.8rem'
                  }}>
                    {gameData?.spectators?.slice(0, 3).map((spectator, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '2px 6px',
                          margin: '1px 0',
                          background: 'rgba(255,255,255,0.7)',
                          borderRadius: '4px',
                           
                          textAlign: 'center'
                        }}
                      >
                        {spectator.username.length > 8 ? spectator.username.slice(0, 8) + '...' : spectator.username}
                      </div>
                    ))}
                    {(gameData?.spectators?.length || 0) > 3 && (
                      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--doodle-secondary)' }}>
                        +{gameData.spectators.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="doodle-btn"
                  onClick={handleSpectate}
                  disabled={isUserSpectator()}
                  style={{
                    background: 'var(--doodle-sketch)',
                    color: 'white',
                    fontSize: '0.85rem',
                    padding: '8px 12px',
                    minWidth: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* <DoodleIcons.Eye size={14} style={{ marginRight: '4px' }} /> */}
                  <Eye size={14} style={{ marginRight: '4px' }} />
                  Spectate
                </button>
                {isHost && (
                  <div>
                    <HostControls />
                  </div>
                )}
                {/* Start Game Button */}
                {isHost ? (
                  <button
                    className="doodle-btn doodle-btn-primary"
                    onClick={handleStartGame}
                    disabled={!canStartGame()}
                    style={{
                      fontSize: isTablet ? '1rem' : '1.1rem',
                      fontWeight: 'bold',
                      background: canStartGame() ? 'linear-gradient(1deg, var(--doodle-blue), var(--doodle-green))' : undefined,
                      animation: canStartGame() ? 'glow 2s infinite alternate' : 'none',
                      minWidth: isTablet ? '120px' : '140px',
                      padding: '12px'
                    }}
                  >
                    {canStartGame() ? (
                      <>
                        {/* <DoodleIcons.Lightning size={16} style={{ marginRight: '4px' }} /> */}
                        START!
                      </>
                    ) : (
                      'Start Game'
                    )}
                  </button>
                ) : (
                  <div style={{
                    textAlign: 'center',
                     
                    color: 'var(--doodle-secondary)',
                    fontSize: '0.9rem',
                    maxWidth: '120px',
                    lineHeight: '1.2'
                  }}>
                    Waiting for host...
                  </div>
                )}
              </div>
            )}

            {/* Blue Team */}
            <div
              className="doodle-card doodle-team-blue"
              style={{
                border: isUserInBlueTeam() ? '3px solid gold' : '2px solid var(--doodle-blue)',
                height: 'fit-content',
                padding: isMobile ? '12px' : '14px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div>
                <h3 style={{
                  fontFamily: 'Architects Daughter, cursive',
                  color: 'var(--doodle-blue)',
                  marginBottom: '8px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '1rem' : '1.1rem'
                }}>
                  <DoodleIcons.Users size={16} style={{ marginRight: '6px' }} />
                  Blue Team
                </h3>

                <div style={{
                  textAlign: 'center',
                  marginBottom: '8px',
                   
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}>
                  {gameData?.blueTeam?.length || 0}/5 Players
                </div>

                {/* Compact Player List - Fixed Height, No Scroll */}
                <div style={{
                  display: 'grid',
                  gap: '3px',
                  marginBottom: '10px'
                }}>
                  {Array.from({ length: 5 }).map((_, index) => {
                    const player = gameData?.blueTeam?.[index];
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: isMobile ? '4px 6px' : '5px 8px',
                          background: player ? 'rgba(49, 130, 206, 0.2)' : 'rgba(255,255,255,0.3)',
                          borderRadius: '6px',
                          border: '1px dashed var(--doodle-blue)',
                          fontSize: isMobile ? '0.75rem' : '0.85rem'
                        }}
                      >
                        <div style={{
                          width: isMobile ? '18px' : '20px',
                          height: isMobile ? '18px' : '20px',
                          borderRadius: '50%',
                          background: player ? 'var(--doodle-blue)' : 'var(--doodle-secondary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          marginRight: '6px',
                          fontSize: isMobile ? '0.65rem' : '0.7rem'
                        }}>
                          {index + 1}
                        </div>
                        <span style={{
                           
                          fontWeight: player ? 'bold' : 'normal',
                          color: player ? 'var(--doodle-ink)' : 'var(--doodle-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}>
                          {player ? player.username : 'Empty Slot'}
                          {player?.username === username && ' (You)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {isUserInBlueTeam() ? (
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(49, 130, 206, 0.3)',
                      borderRadius: '8px',
                      border: '2px solid var(--doodle-blue)',
                       
                      fontWeight: 'bold',
                      color: 'var(--doodle-blue)',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}>
                      ✓ You're in this team
                    </div>
                  ) : (
                    <button
                      className="doodle-btn doodle-btn-primary"
                      onClick={(e) => handleJoinTeam('blue', e)}
                      disabled={gameData?.blueTeam?.length >= 5 || gameData?.status !== 'waiting'}
                      style={{
                        width: '100px',
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        padding: isMobile ? '8px' : '10px'
                      }}
                    >
                      {isUserInRedTeam() ? 'Switch' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Controls */}
          {/* {isMobile && (
            <section style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '20px',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                width: '100%',
                maxWidth: '400px'
              }}>
                <button
                  className="doodle-btn"
                  onClick={handleSpectate}
                  disabled={isUserSpectator()}
                  style={{
                    flex: 1,
                    background: 'var(--doodle-sketch)',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                >
                  <DoodleIcons.Eye size={16} style={{ marginRight: '6px' }} />
                  Spectate
                </button>

                {isHost && (
                  <button
                    className="doodle-btn doodle-btn-primary"
                    onClick={handleStartGame}
                    disabled={!canStartGame()}
                    style={{
                      flex: 2,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      background: canStartGame() ? 'linear-gradient(45deg, var(--doodle-blue), var(--doodle-green))' : undefined,
                      animation: canStartGame() ? 'glow 2s infinite alternate' : 'none'
                    }}
                  >
                    {canStartGame() ? (
                      <>
                        <DoodleIcons.Lightning size={16} style={{ marginRight: '6px' }} />
                        START GAME!
                      </>
                    ) : (
                      'Start Game'
                    )}
                  </button>
                )}
              </div>

              <div style={{
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--doodle-secondary)',
                 
              }}>
                Spectators: {gameData?.spectators?.length || 0}
              </div>
            </section>
          )} */}

          {/* Compact Game Configuration */}
          <section
            className="doodle-paper"
            style={{
              marginBottom: isMobile ? '12px' : '16px',
              padding: isMobile ? '12px' : '14px'
            }}
          >
            <div>
              <h3 style={{
                fontFamily: 'Architects Daughter, cursive',
                color: 'var(--doodle-ink)',
                marginBottom: '12px',
                textAlign: 'center',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '1rem' : '1.1rem',
              }}>
                <DoodleIcons.Settings size={16} style={{ marginRight: '6px' }} />
                Game Settings

              </h3>


              {/* Key Stats - Always Visible */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: isMobile ? '8px' : '10px',
                marginBottom: '12px'
              }}>
                <div className="stat-card">
                  <div className="stat-value">{gameData?.rounds || gameData?.gameSettings?.rounds || 1}</div>
                  <div className="stat-label">Rounds</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{gameData?.gameSettings?.faceoffsPerPerson || 1}</div>
                  <div className="stat-label">Faceoffs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{gameData?.gameSettings?.questionTimer || 120}s</div>
                  <div className="stat-label">Timer</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{calculateTotalQuestions()}</div>
                  <div className="stat-label">Questions</div>
                </div>
              </div>

              {/* Game Status */}
              {canStartGame() ? (
                <div className="doodle-alert" style={{
                  background: 'var(--doodle-green)',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  padding: isMobile ? '8px' : '10px'
                }}>
                  Ready to start!
                </div>
              ) : (
                <div className="doodle-alert" style={{
                  background: 'var(--doodle-sketch)',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  padding: isMobile ? '8px' : '10px'
                }}>
                  Need players in both teams
                </div>
              )}

              {/* Expandable Filters Section */}
              {/* <details style={{ marginTop: '12px' }}>
                  <summary style={{
                    cursor: 'pointer',
                     
                    fontWeight: 'bold',
                    color: 'var(--doodle-blue)',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    padding: '6px 0'
                  }}>
                    Question Filters
                  </summary>
                  
                  <div style={{ paddingTop: '12px' }}>
                    {gameData?.gameSettings?.selectedSubjects?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{ 
                            
                          marginBottom: '6px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem' 
                        }}>Subjects:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {gameData.gameSettings.selectedSubjects.slice(0, isMobile ? 6 : 10).map((subject, index) => (
                            <span 
                              key={index}
                              className="doodle-badge"
                              style={{ 
                                background: 'var(--doodle-blue)',
                                fontSize: '0.7rem',
                                padding: '4px 8px'
                              }}
                            >
                              {subject}
                            </span>
                          ))}
                          {gameData.gameSettings.selectedSubjects.length > (isMobile ? 6 : 10) && (
                            <span className="doodle-badge" style={{ background: 'var(--doodle-secondary)' }}>
                              +{gameData.gameSettings.selectedSubjects.length - (isMobile ? 6 : 10)} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {gameData?.gameSettings?.selectedExamTypes?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{ 
                            
                          marginBottom: '6px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem'
                        }}>Exam Types:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {gameData.gameSettings.selectedExamTypes.slice(0, isMobile ? 6 : 10).map((examType, index) => (
                            <span 
                              key={index}
                              className="doodle-badge"
                              style={{ 
                                background: 'var(--doodle-green)',
                                fontSize: '0.7rem',
                                padding: '4px 8px'
                              }}
                            >
                              {examType}
                            </span>
                          ))}
                          {gameData.gameSettings.selectedExamTypes.length > (isMobile ? 6 : 10) && (
                            <span className="doodle-badge" style={{ background: 'var(--doodle-secondary)' }}>
                              +{gameData.gameSettings.selectedExamTypes.length - (isMobile ? 6 : 10)} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {gameData?.gameSettings?.selectedTags?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{ 
                            
                          marginBottom: '6px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem'
                        }}>Topics:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {gameData.gameSettings.selectedTags.slice(0, isMobile ? 4 : 8).map((tag, index) => (
                            <span 
                              key={index}
                              className="doodle-badge"
                              style={{ 
                                background: 'var(--doodle-yellow)',
                                color: 'var(--doodle-ink)',
                                fontSize: '0.65rem',
                                padding: '3px 6px'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {gameData.gameSettings.selectedTags.length > (isMobile ? 4 : 8) && (
                            <span className="doodle-badge" style={{ 
                              background: 'var(--doodle-secondary)',
                              fontSize: '0.65rem',
                              padding: '3px 6px'
                            }}>
                              +{gameData.gameSettings.selectedTags.length - (isMobile ? 4 : 8)} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {gameData?.gameSettings?.difficultyRange && (
                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{ 
                            
                          marginBottom: '6px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem'
                        }}>
                          Difficulty: {gameData.gameSettings.difficultyRange.min} - {gameData.gameSettings.difficultyRange.max}
                        </h4>
                        <div className="doodle-progress" style={{ height: '8px' }}>
                          <div 
                            className="doodle-progress-fill" 
                            style={{ 
                              width: `${(gameData.gameSettings.difficultyRange.max / 10) * 100}%`,
                              background: 'linear-gradient(to right, var(--doodle-green), var(--doodle-yellow), var(--doodle-accent))'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {gameData?.gameSettings?.conceptLevels?.length > 0 && (
                      <div>
                        <h4 style={{ 
                            
                          marginBottom: '6px',
                          fontSize: isMobile ? '0.85rem' : '0.9rem'
                        }}>Concept Levels:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {gameData.gameSettings.conceptLevels.map((level, index) => (
                            <span 
                              key={index}
                              className="doodle-badge"
                              style={{ 
                                background: 'var(--doodle-purple)',
                                fontSize: '0.7rem',
                                padding: '4px 8px'
                              }}
                            >
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details> */}
            </div>
          </section>
        </div>

        {/* Right Side - Chat (Desktop only) */}
        {!isMobile && !isTablet && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}>
            <ChatWindow height="100%" />
          </div>
        )}

        {/* Mobile/Tablet Chat - Bottom Sheet Style */}
        {(isMobile || isTablet) && (
          <div style={{
            position: 'fixed',
            bottom: isTablet ? 0 : 70,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'white',
            borderTop: '3px solid var(--doodle-ink)',
            boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
            transform: chatOpen ? 'translateY(0)' : 'translateY(calc(100% - 50px))',
            transition: 'transform 0.3s ease',
            height: '60vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              style={{
                padding: '12px',
                background: 'var(--doodle-blue)',
                color: 'white',
                border: 'none',
                 
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <MessageCircle size={20} />
              Chat {chatOpen ? '▼' : '▲'}
            </button>
            {chatOpen && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <ChatWindow height="100%" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add CSS for stat cards */}
      <style>{`
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: ${isMobile ? '8px' : '10px'};
          background: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
          border: 2px solid var(--doodle-ink);
          text-align: center;
        }
        
        .stat-value {
           
          font-size: ${isMobile ? '1rem' : '1.2rem'};
          font-weight: bold;
          color: var(--doodle-blue);
          line-height: 1;
        }
        
        .stat-label {
           
          font-size: ${isMobile ? '0.7rem' : '0.75rem'};
          color: var(--doodle-secondary);
          margin-top: 3px;
        }

        /* Custom Scrollbar */
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb {
          background: var(--doodle-blue);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: var(--doodle-accent);
        }

        /* Smooth transitions */
        .doodle-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .doodle-card:hover {
          transform: translateY(-2px);
        }
      `}</style>

      {/* Rules Modal */}
      {showRules && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowRules(false)}
        >
          <div
            className="doodle-card"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '30px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="doodle-title" style={{ fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>
              🎮 How to Play Custom Room
            </h2>

            <div style={{   fontSize: '1.1rem', lineHeight: '1.8' }}>
              <p><strong>🎯 Teams:</strong> Join either the Red Team or Blue Team, or spectate the game.</p>

              <p><strong>👑 Host Controls:</strong> The host can:</p>
              <ul style={{ marginLeft: '20px' }}>
                <li>Start the game when ready</li>
                <li>Configure game settings</li>
                <li>Manage teams</li>
              </ul>

              <p><strong>⚡ Gameplay:</strong></p>
              <ul style={{ marginLeft: '20px' }}>
                <li>Answer questions correctly to earn points for your team</li>
                <li>Be quick! Faster answers may earn bonus points</li>
                <li>Work together with your team to win</li>
              </ul>

              <p><strong>💬 Chat:</strong> Communicate with other players using the chat feature (desktop: right sidebar, mobile: bottom chat button).</p>

              <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--doodle-blue)', fontWeight: 'bold' }}>
                Have fun and play fair! 🎉
              </p>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="doodle-btn"
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameRoom;