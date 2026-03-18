import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

export default function RankedResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Logging for debugging
  console.log('[RankedResult] Full state:', state);
  
  if (!state) {
    console.error('[RankedResult] No state received');
    return (
      <div className="doodle-container">
        <div className="doodle-card" style={{ textAlign: 'center' }}>
          <h1>No game data found</h1>
          <button onClick={() => navigate('/ranked')} className="doodle-btn doodle-btn-primary">
            Back to Ranked
          </button>
        </div>
      </div>
    );
  }

  // Extract data from state - backend sends updated player data in the game_end payload
  const { scores = [0, 0], players: gameEndPlayers = [], winnerIndex } = state;
  
  // Use the updated player data from game_end event (contains ELO changes)
  // Fall back to originalPlayers (initial connection data) only if gameEndPlayers is empty
  const players = gameEndPlayers.length > 0 ? gameEndPlayers : state.originalPlayers || [];
  
  console.log('[RankedResult] Processed data:', { scores, players, winnerIndex, gameEndPlayers });
  
  if (!players || players.length === 0) {
    console.error('[RankedResult] No players data found');
    return (
      <div className="doodle-container">
        <div className="doodle-card" style={{ textAlign: 'center' }}>
          <h1>No player data found</h1>
          <p>Debug info: {JSON.stringify(state, null, 2)}</p>
          <button onClick={() => navigate('/ranked')} className="doodle-btn doodle-btn-primary">
            Back to Ranked
          </button>
        </div>
      </div>
    );
  }

  const winner = winnerIndex === -1 ? 'Tie' : players[winnerIndex]?.username;

  const getResultMessage = () => {
    if (winnerIndex === -1) return "It's a Tie!";
    return `${winner} Wins!`;
  };

  const getResultIcon = () => {
    if (winnerIndex === -1) return '🤝';
    return '🏆';
  };

  const getResultColor = () => {
    if (winnerIndex === -1) return 'var(--doodle-yellow)';
    return 'var(--doodle-green)';
  };

  // Determine if user had good performance (won or drew)
  // The first player (index 0) is typically the current user
  const isGoodPerformance = winnerIndex === 0 || winnerIndex === -1;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #f7fafc 25%, transparent 25%), linear-gradient(-45deg, #f7fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7fafc 75%), linear-gradient(-45deg, transparent 75%, #f7fafc 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#edf2f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
       
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        maxWidth: '1200px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        {/* Left Side - Match Results */}
        <div style={{
          flex: '1 1 400px',
          minWidth: '300px',
          maxWidth: '500px'
        }}>
          <div className="doodle-card" style={{ 
            padding: '30px',
            border: '4px solid var(--doodle-ink)',
            borderRadius: '25px',
            boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
            transform: 'rotate(-1deg)',
            textAlign: 'center'
          }}>
            {/* Result Header */}
            <div style={{ marginBottom: '20px' }}>
              {/* <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                {getResultIcon()}
              </div> */}
              <h1 className="doodle-title" style={{ 
                color: getResultColor(),
                marginBottom: '10px',
                fontSize: '2rem',
                fontFamily: 'Architects Daughter, cursive'
              }}>
                {getResultMessage()}
              </h1>
              <div style={{ 
                fontSize: '1.3rem', 
                 
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                Final Score: {scores[0] || 0} - {scores[1] || 0}
              </div>
            </div>

            {/* Player Results */}
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
          {players.map((player, idx) => {
            const isWinner = winnerIndex === idx;
            const isDraw = winnerIndex === -1;
            const cardColor = isWinner ? 'var(--doodle-green)' : 
                            isDraw ? 'var(--doodle-yellow)' : 'var(--doodle-accent)';
            const newElo = (player.eloStart || 1200) + (player.eloDelta || 0);
            
            return (
              <div 
                key={idx} 
                className="doodle-card"
                style={{ 
                  borderLeft: `6px solid ${cardColor}`,
                  margin: '0',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background decoration for winner */}
                {isWinner && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    fontSize: '3rem',
                    opacity: '0.1',
                    transform: 'rotate(15deg)'
                  }}>
                    🏆
                  </div>
                )}

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'auto 1fr auto', 
                  alignItems: 'center', 
                  gap: '20px',
                  padding: '10px'
                }}>
                  {/* Player Avatar/Icon */}
                  <div style={{ 
                    fontSize: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {player.isBot ? '🤖' : '👤'}
                  </div>

                  {/* Player Info */}
                  <div>
                    <div style={{ 
                        
                      fontWeight: 'bold', 
                      fontSize: '1.3rem',
                      marginBottom: '8px',
                      color: 'var(--doodle-ink)'
                    }}>
                      {player.username} 
                      {player.isBot && (
                        <span style={{ 
                          fontSize: '0.8rem',
                          marginLeft: '8px',
                          background: 'var(--doodle-gray)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          opacity: '0.7'
                        }}>
                          Bot
                        </span>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px',
                       
                    }}>
                      <div>
                        <span style={{ fontSize: '0.9rem', opacity: '0.7' }}>Score: </span>
                        <strong style={{ fontSize: '1.1rem' }}>{scores[idx] || 0}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.9rem', opacity: '0.7' }}>ELO: </span>
                        {/* <strong style={{ fontSize: '1.1rem' }}>{player.eloStart || 1200}</strong> */}
                        <span style={{ 
                          marginLeft: '8px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          color: (player.eloDelta || 0) >= 0 ? 'var(--doodle-green)' : 'var(--doodle-accent)'
                        }}>
                          {(player.eloDelta || 0) >= 0 ? '+' : ''}{player.eloDelta || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Result Status */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem',
                      marginBottom: '5px'
                    }}>
                      {isWinner ? '🏆' : isDraw ? '🤝' : '💔'}
                    </div>
                    <div style={{ 
                       
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: cardColor
                    }}>
                      {newElo}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem',
                      opacity: '0.7',
                       
                    }}>
                      New ELO
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/ranked/search')}
            className="doodle-btn doodle-btn-primary"
            style={{ fontSize: '1.1rem', padding: '12px 24px' }}
          >
            <DoodleIcons.Trophy size={20} style={{ marginRight: '8px' }} />
            Play Again
          </button>
          <button
            onClick={() => navigate('/ranked/profile')}
            className="doodle-btn doodle-btn-secondary"
          >
            <DoodleIcons.Users size={20} style={{ marginRight: '8px' }} />
            View Profile
          </button>
          <button
            onClick={() => navigate('/ranked')}
            className="doodle-btn doodle-btn-secondary"
          >
            Back to Ranked
          </button>
        </div>
          </div>
        </div>

      {/* Right Side - Doodle Character */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        maxWidth: '400px'
      }}>
        <img 
          src={isGoodPerformance ? '/doodiegameoverhappy.png' : '/doodiegameoversad.png'}
          alt="Doodle Character"
          style={{
            maxWidth: '350px',
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(8px 8px 12px rgba(0, 0, 0, 0.2))',
            transform: 'rotate(2deg)'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        
        {/* Message Bubble */}
        <div style={{
          background: 'white',
          border: '3px solid var(--doodle-ink)',
          borderRadius: '20px',
          padding: '20px 30px',
          boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.2)',
          transform: 'rotate(-1deg)',
          maxWidth: '350px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'var(--doodle-ink)',
            lineHeight: 1.4
          }}>
            {isGoodPerformance ? (
              <>
                VICTORY! 🎉
                <br />
                <span style={{ color: '#6c5ce7' }}>YOU DOMINATED!</span>
              </>
            ) : (
              <>
                TOUGH MATCH! 💪
                <br />
                <span style={{ color: '#6c5ce7' }}>NEXT TIME!</span>
              </>
            )}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}


