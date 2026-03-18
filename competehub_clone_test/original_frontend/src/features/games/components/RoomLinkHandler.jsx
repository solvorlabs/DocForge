import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../../app/providers/GameContext';
import { useSocket } from '../../../app/providers/SocketContext';
import { useUser } from '../../../app/providers/UserContext';
import '../../../styles/themes/doodle.css';
import { createClickEffect, DoodleIcons, getRandomDoodleDecoration } from '../../../shared/utils/doodleUtils';

function RoomLinkHandler() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { gameData, joinRoom, error, clearError } = useGame();
  const { user, isAuthenticated } = useUser();
  
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomExists, setRoomExists] = useState(null); // null = checking, true = exists, false = doesn't exist
  const [autoJoined, setAutoJoined] = useState(false);

  // Check if room exists when component mounts
  useEffect(() => {
    if (connected && socket) {
      checkRoomExists();
    }
  }, [connected, socket, roomCode]);

  // Auto-join for logged-in users
  useEffect(() => {
    if (isAuthenticated && user && roomExists && !autoJoined && connected && socket) {
      const usernameToUse = user.username || user.name || user.email?.split('@')[0] || 'User';
      setUsername(usernameToUse);
      setLoading(true);
      joinRoom(usernameToUse, roomCode);
      setAutoJoined(true);
    }
  }, [isAuthenticated, user, roomExists, autoJoined, connected, socket, roomCode, joinRoom]);

  // Redirect if game data is available
  useEffect(() => {
    if (gameData && gameData.roomCode === roomCode) {
      if (gameData.status === 'playing') {
        navigate(`/game/${roomCode}`);
      } else {
        navigate(`/room/${roomCode}`);
      }
    }
  }, [gameData, roomCode, navigate]);

  const checkRoomExists = async () => {
    try {
      setLoading(true);
      // Emit a check_room event to verify room exists
      socket.emit('check_room', { roomCode }, (response) => {
        setRoomExists(response.exists);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error checking room:', error);
      setRoomExists(false);
      setLoading(false);
    }
  };

  const handleJoinRoom = (e) => {
    createClickEffect(e);
    if (!username.trim()) {
      return;
    }
    
    joinRoom(username.trim(), roomCode);
  };

  const handleGoHome = (e) => {
    createClickEffect(e);
    navigate('/');
  };

  if (loading || (isAuthenticated && roomExists && !gameData)) {
    return (
      <div className="doodle-container">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="doodle-spinner" style={{ margin: '0 auto 20px' }}></div>
          <p style={{   color: 'var(--doodle-secondary)' }}>
            {isAuthenticated && roomExists ? 'Joining room...' : 'Checking room...'}
          </p>
        </div>
      </div>
    );
  }

  if (roomExists === false) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-paper">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="doodle-avatar" style={{ marginBottom: '20px' }}>
                <DoodleIcons.Users size={40} color="#fff" />
              </div>
              
              <h1 className="doodle-title">Room Not Found</h1>
              <p className="doodle-subtitle">
                The room code "{roomCode}" doesn't exist or has expired.
              </p>
              
              <div style={{ marginTop: '30px' }}>
                <button 
                  className="doodle-btn doodle-btn-primary"
                  onClick={handleGoHome}
                >
                  <DoodleIcons.Home size={20} style={{ marginRight: '8px' }} />
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="doodle-paper">
          <div style={{ padding: '40px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="doodle-avatar doodle-float" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                <DoodleIcons.Gamepad size={40} color="#fff" />
              </div>
              <h1 className="doodle-title">Join Game Room</h1>
              <p className="doodle-subtitle">
                {isAuthenticated && user ? (
                  <>
                    Welcome <strong>{user.username || user.name || 'User'}</strong>! Joining room: <strong>{roomCode}</strong>
                  </>
                ) : (
                  <>
                    Enter your name to join room: <strong>{roomCode}</strong>
                  </>
                )}
              </p>
              <div className="doodle-stars">{getRandomDoodleDecoration()}</div>
            </div>

            {error && (
              <div className="doodle-alert" style={{ marginBottom: '20px' }}>
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

            {/* Username Input */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '10px',
                 
                fontWeight: '600',
                color: 'var(--doodle-ink)'
              }}>
                Your Name:
              </label>
              <input
                type="text"
                className="doodle-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                style={{ width: '100%' }}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom(e)}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                className="doodle-btn"
                onClick={handleGoHome}
                style={{ background: 'var(--doodle-sketch)', color: 'white' , display: 'flex', alignItems: 'center' , gap: '8px' }}
              >
                <DoodleIcons.Home size={20} style={{ marginRight: '8px' }} />
                Back to Home
              </button>
              
              <button 
                className="doodle-btn doodle-btn-primary"
                onClick={handleJoinRoom}
                disabled={!username.trim() || loading}
                style={{ minWidth: '150px', display: 'flex', alignItems: 'center' , gap: '8px'  }}
              >
                {loading ? (
                  <div className="doodle-spinner" style={{ margin: '0 auto' }}></div>
                ) : (
                  <>
                    <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
                    Join Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomLinkHandler;
