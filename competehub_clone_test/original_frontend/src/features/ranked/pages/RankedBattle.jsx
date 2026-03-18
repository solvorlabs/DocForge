import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRankedSocket } from '../components/RankedSocketProvider.jsx';
import { DoodleIcons, createClickEffect } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

export default function RankedBattle() {
  const { socket } = useRankedSocket();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [roomCode, setRoomCode] = useState(state?.roomCode);
  const [players] = useState(state?.players || []);
  const [chat, setChat] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answeredPlayers, setAnsweredPlayers] = useState(new Set());
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    console.log('[RankedBattle] useEffect socket:', socket, 'state:', state);
    if (!socket) return;
    
    const onGameStart = () => { 
      console.log('[RankedBattle] Game started');
    };
    
    const onQuestion = (payload) => {
      console.log('[RankedBattle] Received question:', payload);
      setQuestion({ text: payload.question, options: payload.options });
      setRound(payload.round);
      setTotalRounds(payload.totalRounds);
      setTimeLeft(payload.timerSec || 30);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setAnsweredPlayers(new Set());
    };
    
    const onAnswerUpdate = ({ playerIndex, answered }) => {
      console.log('[RankedBattle] Answer update:', { playerIndex, answered });
      if (answered) {
        setAnsweredPlayers(prev => new Set(prev.add(playerIndex)));
      }
    };
    
    const onRoundResult = ({ correctAnswer, pointsAwarded, scores: newScores }) => {
      console.log('[RankedBattle] Round result:', { correctAnswer, pointsAwarded, newScores });
      setScores(newScores);
      // Reset for next round
      setTimeout(() => {
        setSelectedAnswer(null);
        setHasAnswered(false);
        setAnsweredPlayers(new Set());
      }, 2000);
    };
    
    const onGameEnd = (payload) => {
      console.log('[RankedBattle] Game ended:', payload);
      // Don't override the updated players data from payload with old players data
      navigate('/ranked/result', { state: { ...payload, roomCode, originalPlayers: players } });
    };
    
    const onChat = ({ username, message }) => {
      console.log('[RankedBattle] Chat message:', { username, message });
      setChat((c) => [...c, { username, message }]);
    };
    
    socket.on('game_start', onGameStart);
    socket.on('question', onQuestion);
    socket.on('answer_update', onAnswerUpdate);
    socket.on('round_result', onRoundResult);
    socket.on('game_end', onGameEnd);
    socket.on('chat_message', onChat);
    
    return () => {
      socket.off('game_start', onGameStart);
      socket.off('question', onQuestion);
      socket.off('answer_update', onAnswerUpdate);
      socket.off('round_result', onRoundResult);
      socket.off('game_end', onGameEnd);
      socket.off('chat_message', onChat);
    };
  }, [socket, navigate, players, roomCode]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0 && question && !hasAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, question, hasAnswered]);

  const handleAnswerSelect = (idx) => {
    if (hasAnswered) return;
    createClickEffect(event);
    setSelectedAnswer(idx);
  };

  const handleAnswerConfirm = (e) => {
    if (hasAnswered || selectedAnswer === null) return;
    createClickEffect(e);
    console.log('[RankedBattle] Sending answer:', selectedAnswer);
    setHasAnswered(true);
    if (socket && roomCode != null) {
      socket.emit('answer', { roomCode, option: selectedAnswer });
    }
  };
 
  const sendChat = (e) => {
    e.preventDefault();
    const form = e.target;
    const input = form.elements.message;
    const message = input.value.trim();
    if (!message) return;
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    console.log('[RankedBattle] Sending chat:', message, 'by', profile.username);
    socket.emit('chat', { roomCode, message, username: profile.username || 'You' });
    input.value = '';
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return 'var(--doodle-green)';
    if (timeLeft > 10) return 'var(--doodle-yellow)';
    return 'var(--doodle-accent)';
  };

  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  const currentPlayerIndex = players.findIndex(p => p.username === profile.username);

  return (
    <div className="doodle-container" style={{ minHeight: '95vh', position: 'relative' }}>
      {/* Top Left - Exit Game Button */}
      <button
        onClick={() => navigate('/ranked')}
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* Game Header */}
        <div className="doodle-card" style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            alignItems: 'center',
            padding: '10px'
          }}>
            {/* Round Info */}
            <div style={{ textAlign: 'center' }}>
              <h2 className="doodle-title" style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                Round {round} of {totalRounds}
              </h2>
              <div style={{ 
                 
                fontSize: '1.2rem',
                color: 'var(--doodle-blue)'
              }}>
                ⚔️ Ranked Battle
              </div>
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: getTimerColor(),
                 
                marginBottom: '5px'
              }}>
                <DoodleIcons.Timer size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {timeLeft}s
              </div>
              <div className="doodle-progress" style={{ width: '100px', margin: '0 auto' }}>
                <div 
                  className="doodle-progress-fill"
                  style={{ 
                    width: `${(timeLeft / 30) * 100}%`,
                    background: getTimerColor(),
                    transition: 'width 1s linear'
                  }}
                />
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                 
                marginBottom: '5px'
              }}>
                {scores[0]} - {scores[1]}
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                opacity: '0.7',
                 
              }}>
                Score
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          
          {/* Main Game Area */}
          <div>
            {/* Players Status */}
            <div className="doodle-card" style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px',
                padding: '15px'
              }}>
                {players.map((player, idx) => {
                  const isCurrentPlayer = idx === currentPlayerIndex;
                  const hasPlayerAnswered = answeredPlayers.has(idx);
                  
                  return (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        background: isCurrentPlayer ? 'var(--doodle-blue-light)' : 'transparent',
                        borderRadius: '8px',
                        border: isCurrentPlayer ? '2px solid var(--doodle-blue)' : '2px solid transparent'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem' }}>
                        {player.isBot ? '🤖' : '👤'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                            
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}>
                          {player.username}
                          {isCurrentPlayer && <span style={{ color: 'var(--doodle-blue)', marginLeft: '5px' }}>(You)</span>}
                        </div>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          opacity: '0.7',
                           
                        }}>
                          ELO: {player.elo || 1200}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem',
                        color: hasPlayerAnswered ? 'var(--doodle-green)' : 'var(--doodle-gray)'
                      }}>
                        {hasPlayerAnswered ? '✓' : '⏳'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Question Area */}
            {question && (
              <div className="doodle-card">
                <div style={{ padding: '10px' }}>
                  <h3 style={{ 
                    fontFamily: 'Architects Daughter, cursive', 
                    fontSize: '1.3rem',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                  }}>
                    {question.text}
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gap: '12px',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
                  }}>
                    {question.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswerSelect(i)}
                        disabled={hasAnswered}
                        className={`doodle-btn ${
                          selectedAnswer === i ? 'doodle-btn-primary' : 'doodle-btn-secondary'
                        }`}
                        style={{
                          padding: '15px',
                          fontSize: '1rem',
                          textAlign: 'left',
                          minHeight: '60px',
                          opacity: hasAnswered ? 0.6 : 1,
                          cursor: hasAnswered ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <span style={{ 
                          fontWeight: 'bold', 
                          marginRight: '8px',
                          color: 'var(--doodle-accent)'
                        }}>
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>

                  {/* Confirm Button */}
                  {selectedAnswer !== null && !hasAnswered && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <button
                        onClick={handleAnswerConfirm}
                        className="doodle-btn doodle-btn-primary"
                        style={{ 
                          fontSize: '1.2rem',
                          padding: '12px 30px',
                          animation: 'doodle-pulse 2s infinite'
                        }}
                      >
                        <DoodleIcons.Trophy size={20} style={{ marginRight: '8px' }} />
                        Confirm Answer
                      </button>
                    </div>
                  )}

                  {/* Answered Status */}
                  {hasAnswered && (
                    <div style={{ 
                      textAlign: 'center', 
                      marginTop: '20px',
                      padding: '15px',
                      background: 'var(--doodle-green-light)',
                      borderRadius: '8px',
                      border: '2px solid var(--doodle-green)'
                    }}>
                      <div style={{ 
                        fontSize: '1.1rem',
                         
                        color: 'var(--doodle-green)',
                        fontWeight: 'bold'
                      }}>
                        ✓ Answer Submitted! Waiting for opponent...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="doodle-card">
            <h4 style={{ 
              fontFamily: 'Architects Daughter, cursive',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <DoodleIcons.Users size={20} />
              Chat
            </h4>
            
            <div style={{ 
              border: '2px solid var(--doodle-sketch)', 
              borderRadius: '8px',
              height: '300px', 
              overflow: 'auto', 
              padding: '10px', 
              marginBottom: '10px',
              background: 'var(--doodle-paper)'
            }}>
              {chat.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'var(--doodle-secondary)',
                   
                  fontSize: '0.9rem',
                  marginTop: '50px'
                }}>
                  No messages yet...
                </div>
              ) : (
                chat.map((m, idx) => (
                  <div key={idx} style={{ 
                    marginBottom: '8px',
                    padding: '6px',
                    borderRadius: '6px',
                    background: m.username === profile.username ? 'var(--doodle-blue-light)' : 'transparent'
                  }}>
                    <strong style={{ 
                       
                      color: 'var(--doodle-blue)'
                    }}>
                      {m.username}:
                    </strong>
                    <span style={{ 
                      marginLeft: '8px',
                       
                    }}>
                      {m.message}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={sendChat} style={{ display: 'flex', gap: '8px' }}>
              <input
                name="message"
                placeholder="Type message..."
                className="doodle-input"
                style={{ flex: 1 }}
                maxLength={100}
              />
              <button 
                type="submit"
                className="doodle-btn doodle-btn-secondary"
                style={{ padding: '8px 12px' }}
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Decorative Elements */}
        
      </div>

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
              ⚔️ How to Play Ranked Battle
            </h2>
            
            <div style={{   fontSize: '1.1rem', lineHeight: '1.8' }}>
              <p><strong>🎯 Objective:</strong> Compete head-to-head with another player in a battle of wits!</p>
              
              <p><strong>⏱️ Time Limit:</strong> You have 30 seconds to answer each question.</p>
              
              <p><strong>🏆 Scoring:</strong></p>
              <ul style={{ marginLeft: '20px' }}>
                <li>Correct answer = Points based on difficulty</li>
                <li>Wrong answer = No points</li>
                <li>Fastest correct answer gets bonus points!</li>
              </ul>
              
              <p><strong>📊 ELO Rating:</strong> Your performance affects your ranked rating. Win to climb the leaderboard!</p>
              
              <p><strong>💬 Chat:</strong> Communicate with your opponent during the battle using the chat feature.</p>
              
              <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--doodle-blue)', fontWeight: 'bold' }}>
                May the best player win! 🎮
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


