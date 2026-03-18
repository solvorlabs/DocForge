import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRankedSocket } from '../components/RankedSocketProvider.jsx';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import { Gamepad } from 'lucide-react';

export default function RankedSearch() {
  const { socket, connected } = useRankedSocket();
  const [status, setStatus] = useState('Connecting...');
  const [searchTime, setSearchTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[RankedSearch] useEffect socket:', socket, 'connected:', connected);
    if (!socket) {
      console.log('[RankedSearch] No socket available');
      return;
    }

    const onSearching = () => {
      console.log('[RankedSearch] Searching...');
      setStatus('Searching for opponent...');
    };

    const onConnected = (payload) => {
      console.log('[RankedSearch] Connected:', payload);
      setStatus('Match found!');
      navigate('/ranked/battle', { state: payload });
    };

    socket.on('searching', onSearching);
    socket.on('connected', onConnected);

    return () => {
      socket.off('searching', onSearching);
      socket.off('connected', onConnected);
    };
  }, [socket, navigate, connected]);

  useEffect(() => {
    console.log('[RankedSearch] Second useEffect socket:', socket, 'connected:', connected);
    if (!socket || !connected) {
      console.log('[RankedSearch] Socket not ready - socket:', !!socket, 'connected:', connected);
      return;
    }

    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    console.log('[RankedSearch] Emitting search for profile:', profile);

    // Update status to show we're attempting to search
    setStatus('Starting search...');

    socket.emit('search', {
      userId: profile.userId,
      username: profile.username || 'Guest',
      elo: profile.elo || 1200,
      settings: {}
    });
  }, [socket, connected]);

  // Search timer effect
  useEffect(() => {
    let timer;
    if (status.includes('Searching')) {
      timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  const handleCancel = () => {
    console.log('[RankedSearch] Cancel search clicked');
    socket?.emit('cancel_search');
    navigate('/ranked');
  };

  const formatSearchTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const profile = JSON.parse(localStorage.getItem('profile') || '{}');

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>

        {/* Header */}
        <div className="doodle-card" style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 className="doodle-title" style={{ marginBottom: '10px' }}>
            <DoodleIcons.Target size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
            Ranked Matchmaking
          </h1>
          <p style={{   opacity: '0.8' }}>
            Finding the perfect opponent for you...
          </p>
        </div>

        {/* Player Info */}
        <div className="doodle-card" style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '10px'
          }}>
            <div style={{ fontSize: '3rem' }}>👤</div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                 
                marginBottom: '5px',
                fontSize: '1.3rem'
              }}>
                {profile.username || 'Guest'}
              </h3>
              <div style={{
                fontSize: '1.1rem',
                 
                color: 'var(--doodle-blue)'
              }}>
                ELO: {profile.elo || 1200}
              </div>
            </div>
            <div style={{
              padding: '8px 16px',
              background: 'var(--doodle-blue)',
              color: 'white',
              borderRadius: '20px',
               
              fontWeight: 'bold'
            }}>
              Ready
            </div>
          </div>
        </div>

        {/* Search Status */}
        <div className="doodle-card" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ padding: '40px 20px' }}>

            {/* Status Message */}
            <h2 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '1.5rem',
              marginBottom: '20px',
              color: connected ? 'var(--doodle-blue)' : 'var(--doodle-accent)'
            }}>
              {status}
            </h2>

            {/* Connection Status */}
            {!connected && (
              <div style={{
                marginBottom: '20px',
                padding: '10px',
                background: 'var(--doodle-accent-light)',
                borderRadius: '8px',
                border: '2px solid var(--doodle-accent)'
              }}>
                <p style={{
                  color: 'var(--doodle-accent)',
                   
                  margin: '0'
                }}>
                  Connection issue detected. Reconnecting...
                </p>
              </div>
            )}

            {/* Search Indicator */}
            <div style={{ marginBottom: '20px' }}>
              {connected && status.includes('Searching') ? (
                <div className="doodle-search-loader">
                  <div className="doodle-search-icon"><Gamepad /></div>
                </div>
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--doodle-gray)',
                    margin: '0 auto 15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                  }}
                >
                  ❌
                </div>
              )}
            </div>


            {/* Search Time */}
            {status.includes('Searching') && (
              <div style={{
                fontSize: '1.2rem',
                 
                marginBottom: '20px',
                color: 'var(--doodle-secondary)'
              }}>
                Search Time: {formatSearchTime(searchTime)}
              </div>
            )}

            {/* Search Tips */}
            <div style={{
              background: 'var(--doodle-yellow-light)',
              padding: '15px',
              borderRadius: '8px',
              border: '2px dashed var(--doodle-yellow)',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '0.95rem',
                 
                color: 'var(--doodle-ink)',
                lineHeight: '1.4'
              }}>
                💡 <strong>Matchmaking Tips:</strong><br />
                • We match you with players of similar ELO<br />
                • If no human opponent is found, you'll face a bot<br />
                • Average search time is 30-60 seconds
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleCancel}
            className="doodle-btn doodle-btn-danger"
            style={{
              fontSize: '1.1rem',
              padding: '12px 30px'
            }}
          >
            <DoodleIcons.X size={20} style={{ marginRight: '8px' }} />
            Cancel Search
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="doodle-arrow" style={{ top: '200px', right: '50px' }}>↗</div>
        <div style={{
          position: 'absolute',
          bottom: '150px',
          left: '50px',
          fontSize: '2rem',
          color: 'var(--doodle-blue)',
          transform: 'rotate(-15deg)',
          opacity: '0.6'
        }}>
          🎯
        </div>
      </div>
    </div>
  );
}


