import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../../../app/providers/GameContext';
import { createClickEffect, DoodleIcons, FinishFlag, FireDoodle } from '../../../../shared/utils/doodleUtils';
import { Star, Trophy, Users, ChevronDown, ChevronUp } from 'lucide-react';
import ChatWindow from '../../../../features/social/components/ChatWindow';
import { QuestionText, OptionText, ExplanationText, QuestionImages, QuestionMetadata } from '../../../../shared/components/ui/QuestionContent';

// Timeline Event Component
function TimelineEvent({ event }) {
  let icon = null;
  let content = null;
  let secondaryText = new Date(event.time).toLocaleTimeString();

  switch (event.event) {
    case 'round_started':
      content = `Round ${event.round || ''} Started`;
      icon = <span className="doodle-badge"><FireDoodle size={20} /></span>;
      break;
    case 'round_ended':
      content = `Round Ended`;
      icon = <span className="doodle-badge"><FinishFlag size={20} /></span>;
      break;
    case 'correct_answer':
      content = `${event.player} (${event.team === 'red' ? 'Red' : 'Blue'}) answered correctly`;
      secondaryText = `+${event.points} points • ${secondaryText}`;
      icon = <span className="doodle-badge" style={{ background: 'var(--doodle-green)' }}>✓</span>;
      break;
    case 'incorrect_answer':
      content = `${event.player} (${event.team === 'red' ? 'Red' : 'Blue'}) answered incorrectly`;
      secondaryText = `${event.points} points • ${secondaryText}`;
      icon = <span className="doodle-badge" style={{ background: 'var(--doodle-accent)' }}>✗</span>;
      break;
    case 'game_ended':
      content = 'Game Ended';
      secondaryText = event.team
        ? `Winner: ${event.team === 'red' ? 'Red Team' : 'Blue Team'} • ${secondaryText}`
        : `It's a tie! • ${secondaryText}`;
      icon = <span className="doodle-badge" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }}><Trophy size={16} /></span>;
      break;
    default:
      content = event.event;
      icon = <span className="doodle-badge">•</span>;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '8px',
      borderBottom: '1px dashed var(--doodle-sketch)',
      fontSize: '0.9rem'
    }}>
      <div style={{ minWidth: '40px' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{   fontWeight: '600' }}>
          {content}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--doodle-secondary)',   }}>
          {secondaryText}
        </div>
      </div>
    </div>
  );
}

// Main GameBoard Component
function GameBoard() {

  const { roomCode } = useParams();
  const navigate = useNavigate();
  const {
    username,
    gameData,
    isHost,
    currentQuestion,
    currentFaceoff,
    selectedAnswer,
    confirmedAnswer,
    answerResult,
    error,
    clearError,
    loading,
    isInRedTeam,
    isInBlueTeam,
    isSpectator,
    isMyTurn,
    selectAnswer,
    confirmAnswer,
    endRound,
    returnToLobby,
    gameSettings
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(gameSettings?.questionTimer || 120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState(false);
  const [lastWrongAnswer, setLastWrongAnswer] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [chatOpen, setChatOpen] = useState(false);
  const [redTeamDropdownOpen, setRedTeamDropdownOpen] = useState(false);
  const [blueTeamDropdownOpen, setBlueTeamDropdownOpen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [roundCountdown, setRoundCountdown] = useState(null); // Countdown between rounds
  const [isTransitioning, setIsTransitioning] = useState(false); // Flag for round transition

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
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

  const isUserMyTurn = () => {
    if (typeof isMyTurn === 'function') {
      return isMyTurn();
    }
    // Check if current user is one of the players in the current faceoff
    if (currentFaceoff) {
      return currentFaceoff.redPlayer === username || currentFaceoff.bluePlayer === username;
    }
    if (currentQuestion) {
      return currentQuestion.redPlayer === username || currentQuestion.bluePlayer === username;
    }
    return false;
  };

  // Redirect to home if no username is set
  useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  // Redirect to game room if game has not started or has finished
  useEffect(() => {
    if (gameData && gameData.status === 'waiting') {
      navigate(`/room/${roomCode}`);
    }
  }, [gameData, navigate, roomCode]);

  // Set up timer when a new question/face-off is received
  useEffect(() => {
    if ((currentQuestion || currentFaceoff) && !isTransitioning) {
      const timerDuration = gameSettings?.questionTimer || 120;
      setTimeLeft(timerDuration);
      setTimerRunning(true);
      setShowExplanation(false); // Reset explanation visibility for new question
    } else if (!currentQuestion && !currentFaceoff) {
      setTimerRunning(false);
    }
  }, [currentQuestion, currentFaceoff, gameSettings, isTransitioning]);

  // Handle timer countdown
  useEffect(() => {
    let timer;
    if (timerRunning && timeLeft > 0 && !answerResult) {
      timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !answerResult) {
      setTimerRunning(false);
      // Time's up logic goes here
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timerRunning, timeLeft, answerResult]);

  // Stop timer when answers are evaluated and track user results
  useEffect(() => {
    if (answerResult) {
      setTimerRunning(false);

      // Check if current user got the answer right or wrong
      if (username === answerResult.redPlayer && isUserInRedTeam()) {
        if (answerResult.redCorrect) {
          setLastCorrectAnswer(true);
          setTimeout(() => setLastCorrectAnswer(false), 3000);
        } else {
          setLastWrongAnswer(true);
          setTimeout(() => setLastWrongAnswer(false), 3000);
        }
      } else if (username === answerResult.bluePlayer && isUserInBlueTeam()) {
        if (answerResult.blueCorrect) {
          setLastCorrectAnswer(true);
          setTimeout(() => setLastCorrectAnswer(false), 3000);
        } else {
          setLastWrongAnswer(true);
          setTimeout(() => setLastWrongAnswer(false), 3000);
        }
      }

      // Start countdown for next round/faceoff
      const breakTime = gameSettings?.breakTimer || 10;
      setRoundCountdown(breakTime);
      setIsTransitioning(true);
    }
  }, [answerResult, username, isUserInRedTeam, isUserInBlueTeam, gameSettings]);

  // Handle round countdown
  useEffect(() => {
    if (roundCountdown !== null && roundCountdown > 0) {
      const timer = setTimeout(() => {
        setRoundCountdown(roundCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (roundCountdown === 0) {
      setRoundCountdown(null);
      setIsTransitioning(false);
    }
  }, [roundCountdown]);

  // Reset countdown when new question arrives
  useEffect(() => {
    if ((currentQuestion || currentFaceoff) && !answerResult) {
      setRoundCountdown(null);
      setIsTransitioning(false);
      const timerDuration = gameSettings?.questionTimer || 120;
      setTimeLeft(timerDuration);
    }
  }, [currentQuestion, currentFaceoff, answerResult, gameSettings]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    if (selectAnswer) {
      selectAnswer(optionIndex);
    }
  };

  const handleAnswerConfirm = (e) => {
    createClickEffect(e);
    if (confirmAnswer) {
      confirmAnswer();
    }
  };

  const handleEndRound = (e) => {
    createClickEffect(e);
    if (endRound) {
      endRound();
    }
  };

  const handleReturnToLobby = (e) => {
    createClickEffect(e);
    if (returnToLobby) {
      returnToLobby();
    } else {
      navigate(`/room/${roomCode}`);
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 60) return 'var(--doodle-green)';
    if (timeLeft > 30) return 'var(--doodle-yellow)';
    return 'var(--doodle-accent)';
  };

  // Calculate progress percentage
  const totalTime = gameSettings?.questionTimer || 120;
  const timeProgress = ((totalTime - timeLeft) / totalTime) * 100;

  if (loading) {
    return (
      <div className="doodle-container">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="doodle-spinner" style={{ margin: '0 auto 20px' }}></div>
          <p style={{   color: 'var(--doodle-secondary)' }}>
            Loading game board...
          </p>
        </div>
      </div>
    );
  }

  // Use actual question data, fallback to mock only if no data
  const questionToUse = currentFaceoff || currentQuestion;

  if (!gameData) {
    return (
      <div className="doodle-container">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p style={{   color: 'var(--doodle-secondary)' }}>
            No game data available...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="doodle-container" style={{
      minHeight: '100vh',
      padding: isMobile ? '8px' : '12px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}>
        {/* Compact Header */}
        <header style={{
          marginBottom: isMobile ? '8px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="doodle-avatar" style={{ width: '28px', height: '28px' }}>
              <DoodleIcons.Gamepad size={16} color="#fff" />
            </div>
            <h1 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              margin: 0,
              color: 'var(--doodle-ink)'
            }}>
              5v5 Competehub
            </h1>
          </div>

          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{
              padding: '4px 10px',
              background: 'var(--doodle-yellow)',
              color: 'var(--doodle-ink)',
              borderRadius: '8px',
               
              fontWeight: 'bold',
              border: '2px solid var(--doodle-ink)',
              fontSize: isMobile ? '0.75rem' : '0.85rem'
            }}>
              Room: {roomCode}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px',
              background: isUserInRedTeam() ? 'var(--doodle-accent)' :
                isUserInBlueTeam() ? 'var(--doodle-blue)' : 'var(--doodle-sketch)',
              color: 'white',
              borderRadius: '8px',
               
              fontWeight: 'bold',
              border: isUserMyTurn() ? '2px solid gold' : '2px solid var(--doodle-ink)',
              fontSize: isMobile ? '0.75rem' : '0.85rem'
            }}>
              {username} {isUserMyTurn() ? <Star size={14} /> : ''}
            </div>
          </div>
        </header>

        {/* Main Layout - Side by Side on Desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 350px',
          gap: isMobile ? '8px' : '20px',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Game Area - Left Side (Scrollable) */}
          <main style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: isMobile ? '0' : '10px'
          }}>
            {/* Game Status Bar */}
            <section style={{
              marginBottom: isMobile ? '8px' : '12px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr auto 1fr',
                gap: isMobile ? '8px' : '12px',
                alignItems: 'center'
              }}>
                {/* Red Team Score with Dropdown */}
                <div className="score-card red-team" style={{ position: 'relative' }}>
                  <div
                    className="score-content"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setRedTeamDropdownOpen(!redTeamDropdownOpen)}
                  >
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      Red Team <Users size={14} />
                    </h3>
                    <div className="score-value">{gameData?.scores?.red || 0}</div>
                    <div style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', color: 'var(--doodle-secondary)' }}>
                      {gameData?.redTeam?.length || 0} players {redTeamDropdownOpen ? '▲' : '▼'}
                    </div>
                  </div>
                  {redTeamDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      background: 'var(--doodle-paper)',
                      border: '2px solid var(--doodle-accent)',
                      borderRadius: '8px',
                      padding: '8px',
                      marginTop: '4px',
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'
                    }}>
                      {gameData?.redTeam?.length > 0 ? (
                        gameData.redTeam.map((player, idx) => (
                          <div
                            key={player.socketId || idx}
                            style={{
                              padding: '4px 8px',
                              fontSize: isMobile ? '0.75rem' : '0.85rem',
                               
                              borderBottom: idx < gameData.redTeam.length - 1 ? '1px dashed var(--doodle-sketch)' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: player.isConnected !== false ? 'var(--doodle-green)' : 'var(--doodle-sketch)'
                            }}></span>
                            {player.username}
                            {currentFaceoff?.redPlayer === player.username &&
                              <Star size={12} style={{ color: 'gold' }} />
                            }
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--doodle-secondary)', textAlign: 'center' }}>
                          No players
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timer - Desktop/Tablet only */}
                {!isMobile && (
                  <div className="timer-container">
                    <div className="compact-timer" style={{
                      borderColor: getTimerColor(),
                      color: getTimerColor()
                    }}>
                      <div className="timer-value">{formatTime(timeLeft)}</div>
                      {timeLeft < 30 && (
                        <div className="timer-warning">HURRY!</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Blue Team Score with Dropdown */}
                <div className="score-card blue-team" style={{ position: 'relative' }}>
                  <div
                    className="score-content"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setBlueTeamDropdownOpen(!blueTeamDropdownOpen)}
                  >
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      Blue Team <Users size={14} />
                    </h3>
                    <div className="score-value">{gameData?.scores?.blue || 0}</div>
                    <div style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', color: 'var(--doodle-secondary)' }}>
                      {gameData?.blueTeam?.length || 0} players {blueTeamDropdownOpen ? '▲' : '▼'}
                    </div>
                  </div>
                  {blueTeamDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      background: 'var(--doodle-paper)',
                      border: '2px solid var(--doodle-blue)',
                      borderRadius: '8px',
                      padding: '8px',
                      marginTop: '4px',
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'
                    }}>
                      {gameData?.blueTeam?.length > 0 ? (
                        gameData.blueTeam.map((player, idx) => (
                          <div
                            key={player.socketId || idx}
                            style={{
                              padding: '4px 8px',
                              fontSize: isMobile ? '0.75rem' : '0.85rem',
                               
                              borderBottom: idx < gameData.blueTeam.length - 1 ? '1px dashed var(--doodle-sketch)' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: player.isConnected !== false ? 'var(--doodle-green)' : 'var(--doodle-sketch)'
                            }}></span>
                            {player.username}
                            {currentFaceoff?.bluePlayer === player.username &&
                              <Star size={12} style={{ color: 'gold' }} />
                            }
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--doodle-secondary)', textAlign: 'center' }}>
                          No players
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Timer */}
              {isMobile && (
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  <div className="compact-timer" style={{
                    borderColor: getTimerColor(),
                    color: getTimerColor(),
                    margin: '0 auto'
                  }}>
                    <div className="timer-value">{formatTime(timeLeft)}</div>
                    {timeLeft < 30 && (
                      <div className="timer-warning">HURRY!</div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {
              error && (
                <div className="doodle-alert" style={{
                  marginBottom: '16px',
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
              )
            }

            {/* Progress and Round Info */}
            <section style={{
              // marginBottom: isMobile ? '8px' : '12px'
            }}>
              <div className="game-progress">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                   
                  fontWeight: '600',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <span>Round {gameData?.currentRound || 0}/{gameData?.rounds || 0}</span>
                  {currentFaceoff && (
                    <span>
                      {currentFaceoff.redPlayer} vs {currentFaceoff.bluePlayer}
                    </span>
                  )}
                  {questionToUse?.difficultyRating && (
                    <span>
                      Difficulty: {questionToUse.difficultyRating}/10
                    </span>
                  )}
                </div>

                {/* Countdown below versus text */}
                {isTransitioning && roundCountdown !== null && roundCountdown > 0 && roundCountdown <= 10 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    marginBottom: '6px',
                    background: 'var(--doodle-yellow)',
                    border: '2px solid var(--doodle-ink)',
                    borderRadius: '8px',
                     
                    fontWeight: 'bold',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    color: roundCountdown <= 3 ? 'var(--doodle-accent)' : 'var(--doodle-ink)',
                    animation: roundCountdown <= 3 ? 'pulse 0.5s ease-in-out infinite' : 'none'
                  }}>
                    Round break {roundCountdown} seconds...
                  </div>
                )}

                <div className="doodle-progress">
                  <div
                    className="doodle-progress-fill"
                    style={{
                      width: `${timeProgress}%`,
                      background: timeLeft < 30 ? 'var(--doodle-accent)' :
                        timeLeft < 60 ? 'var(--doodle-yellow)' : 'var(--doodle-green)'
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Game Content */}
            {gameData?.status === 'playing' && questionToUse ? (
              <>
                {/* Question Card */}
                <div className={`doodle-card ${isUserMyTurn() ? 'doodle-glow' : ''}`} style={{
                  padding: isMobile ? '12px' : '16px',
                  marginBottom: isMobile ? '8px' : '12px'
                }}>
                  <div style={{ display: 'flex' , alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>

                    {/* Question Metadata */}
                    <QuestionMetadata
                      questionSource={questionToUse?.questionSource}
                      year={questionToUse?.year}
                      examType={questionToUse?.examType}
                      topic={questionToUse?.topic}
                      difficultyLevel={questionToUse?.difficultyLevel}
                      marksPositive={questionToUse?.marksPositive}
                      marksNegative={questionToUse?.marksNegative}
                      isMobile={isMobile}
                    />
                    {isUserMyTurn() &&
                      <>
                        <div style={{ border: '2px solid black', padding: '4px', borderRadius: '40px', fontSize: '0.7rem' }}>Your Turn</div>
                      </>
                      // <Star size={14} style={{ marginLeft: '6px', verticalAlign: 'middle' }} />
                    }

                  </div>

                  {/* Question Text */}
                  <div className="question-content">
                    <h2 className="question-text" style={{
                      fontSize: isMobile ? '0.95rem' : '1.1rem',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      <QuestionText
                        text={questionToUse?.question}
                        html={questionToUse?.questionHtml}
                      />
                    </h2>
                  </div>

                  {/* Question Images */}
                  {questionToUse?.hasImages && questionToUse?.imageUrls?.length > 0 && (
                    <QuestionImages imageUrls={questionToUse.imageUrls} />
                  )}
                </div>

                {/* Answer Section */}
                {isUserMyTurn() && !confirmedAnswer ? (
                  <div className="answer-section" style={{
                    marginBottom: isMobile ? '8px' : '12px'
                  }}>
                    <div className="answer-options" style={{
                      display: 'grid',
                      gap: isMobile ? '8px' : '10px',
                      marginBottom: isMobile ? '8px' : '12px'
                    }}>
                      {(questionToUse?.options || []).map((option, index) => {
                        const optionImageUrl = questionToUse?.hasOptionImages && questionToUse?.optionImageUrls?.[index];

                        return (
                          <label key={index} className={`answer-option ${selectedAnswer === index ? 'selected' : ''}`} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: isMobile ? '8px' : '12px',
                            padding: isMobile ? '8px' : '12px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="radio"
                              name="answer"
                              checked={selectedAnswer === index}
                              onChange={() => handleAnswerSelect(index)}
                              disabled={confirmedAnswer !== null}
                            />
                            <div className="option-indicator" style={{
                              width: isMobile ? '24px' : '28px',
                              height: isMobile ? '24px' : '28px',
                              fontSize: isMobile ? '0.75rem' : '0.85rem',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="option-text" style={{
                              fontSize: isMobile ? '0.85rem' : '0.95rem',
                              flex: 1
                            }}>
                              <OptionText text={option} imageUrl={optionImageUrl} />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <button
                      className="confirm-button"
                      onClick={handleAnswerConfirm}
                      disabled={selectedAnswer === null || confirmedAnswer !== null}
                      style={{
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        padding: isMobile ? '10px 20px' : '12px 24px'
                      }}
                    >
                      Lock Answer
                    </button>
                  </div>
                ) : isUserMyTurn() && confirmedAnswer !== null ? (
                  <div className="status-alert waiting" style={{
                    padding: isMobile ? '10px' : '12px',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    marginBottom: isMobile ? '8px' : '12px'
                  }}>
                    Answer locked! Waiting for opponent...
                  </div>
                ) : (
                  <div className={`status-alert ${isUserSpectator() ? 'spectating' : 'waiting-turn'}`} style={{
                    padding: isMobile ? '10px' : '12px',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    marginBottom: isMobile ? '8px' : '12px'
                  }}>
                    {isUserSpectator()
                      ? "You're spectating"
                      : "Not your turn - please wait"
                    }
                  </div>
                )}

                {/* Answer Results */}
                {answerResult && (
                  <div className="results-section" style={{
                    marginBottom: isMobile ? '8px' : '12px'
                  }}>
                    <div className="results-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: isMobile ? '8px' : '12px',
                      marginBottom: isMobile ? '8px' : '12px'
                    }}>
                      {/* Red Team Result */}
                      <div className={`result-card red ${answerResult.redCorrect ? 'correct' : 'incorrect'}`} style={{
                        padding: isMobile ? '12px' : '14px'
                      }}>
                        <h4 style={{ fontSize: isMobile ? '0.9rem' : '1rem', marginBottom: '6px' }}>Red Team</h4>
                        <div className="result-answer" style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', marginBottom: '6px' }}>
                          {answerResult.redAnswer !== undefined
                            ? <OptionText text={questionToUse.options[answerResult.redAnswer]} />
                            : "No answer"}
                        </div>
                        <div className="result-points" style={{
                          fontSize: isMobile ? '0.85rem' : '0.95rem',
                          padding: '4px 8px'
                        }}>
                          {answerResult.redCorrect ? 'Correct' : 'Wrong'}: {answerResult.redPoints > 0 ? `+${answerResult.redPoints}` : answerResult.redPoints}
                        </div>
                      </div>

                      {/* Blue Team Result */}
                      <div className={`result-card blue ${answerResult.blueCorrect ? 'correct' : 'incorrect'}`} style={{
                        padding: isMobile ? '12px' : '14px'
                      }}>
                        <h4 style={{ fontSize: isMobile ? '0.9rem' : '1rem', marginBottom: '6px' }}>Blue Team</h4>
                        <div className="result-answer" style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', marginBottom: '6px' }}>
                          {answerResult.blueAnswer !== undefined
                            ? <OptionText text={questionToUse.options[answerResult.blueAnswer]} />
                            : "No answer"}
                        </div>
                        <div className="result-points" style={{
                          fontSize: isMobile ? '0.85rem' : '0.95rem',
                          padding: '4px 8px'
                        }}>
                          {answerResult.blueCorrect ? 'Correct' : 'Wrong'}: {answerResult.bluePoints > 0 ? `+${answerResult.bluePoints}` : answerResult.bluePoints}
                        </div>
                      </div>
                    </div>

                    <div className="correct-answer" style={{
                      padding: isMobile ? '10px' : '12px'
                    }}>
                      <h4 style={{ fontSize: isMobile ? '0.85rem' : '0.95rem', marginBottom: '6px' }}>Correct Answer:</h4>
                      <div className="correct-option" style={{
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        padding: isMobile ? '8px' : '10px'
                      }}>
                        <span style={{ fontWeight: 'bold', marginRight: '4px' }}>
                          {String.fromCharCode(65 + answerResult.correctAnswer)}.
                        </span>
                        <OptionText text={questionToUse.options[answerResult.correctAnswer]} />
                      </div>
                    </div>

                    {/* Explanation Section */}
                    {questionToUse?.explanation && (
                      <div className="explanation-section" style={{
                        marginTop: isMobile ? '8px' : '12px',
                        border: '2px solid var(--doodle-blue)',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => setShowExplanation(!showExplanation)}
                          style={{
                            width: '100%',
                            padding: isMobile ? '8px 12px' : '10px 16px',
                            background: 'var(--doodle-blue)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                             
                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>📚 View Explanation</span>
                          <span style={{ transform: showExplanation ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        {showExplanation && (
                          <div style={{
                            padding: isMobile ? '10px' : '14px',
                            background: 'var(--doodle-paper)',
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                            lineHeight: 1.6
                          }}>
                            <ExplanationText
                              text={questionToUse.explanation}
                              hasImages={questionToUse.hasExplanationImages}
                              imageUrls={questionToUse.explanationImageUrls}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : gameData?.status === 'finished' ? (
              <div className="game-over" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '16px' : '24px',
                border: '2px solid var(--doodle-blue)',
                borderRadius: '0 0 8px 8px',
                background: 'var(--doodle-paper)'
              }}>
                <img src="/doodie.png" alt="Trophy" style={{ width: isMobile ? '60px' : '80px', height: isMobile ? '60px' : '80px', marginBottom: '12px' }} />

                <h2 className="game-over-title" style={{
                  fontSize: isMobile ? '1.4rem' : '1.8rem',
                  marginBottom: '12px'
                }}>Game Over!</h2>

                <div className="final-scores" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '12px' : '16px',
                  marginBottom: '12px'
                }}>
                  <div className="final-score red" style={{
                    borderRadius: '20px',
                    fontSize: isMobile ? '1.4rem' : '1.8rem',
                    padding: isMobile ? '8px 16px' : '12px 20px'
                  }}>
                    {gameData?.scores?.red || 0}
                  </div>

                  <span className="score-separator" style={{
                    fontSize: isMobile ? '1.2rem' : '1.5rem'
                  }}>-</span>

                  <div className="final-score blue" style={{
                    borderRadius: '20px',
                    fontSize: isMobile ? '1.4rem' : '1.8rem',
                    padding: isMobile ? '8px 16px' : '12px 20px'
                  }}>
                    {gameData?.scores?.blue || 0}
                  </div>
                </div>

                <h3 className="winner-announcement" style={{
                  fontSize: isMobile ? '1.1rem' : '1.3rem',
                  marginBottom: '16px'
                }}>
                  {gameData?.scores?.red > gameData?.scores?.blue
                    ? 'Red Team Wins!'
                    : gameData?.scores?.blue > gameData?.scores?.red
                      ? 'Blue Team Wins!'
                      : 'It\'s a Tie!'
                  }
                </h3>

                {isHost ? (
                  <button
                    className="return-lobby-button"
                    onClick={handleReturnToLobby}
                    style={{
                      borderRadius: '20px',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Users size={16} />
                    Return to Lobby
                  </button>
                ) : (
                  <div className="waiting-host" style={{
                    borderRadius: '20px',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    padding: isMobile ? '10px' : '12px'
                  }}>
                    Waiting for host...
                  </div>
                )}
              </div>
            ) : (
              <div className="loading-game">
                <div className="doodle-spinner" />
                <p>Loading game...</p>
              </div>
            )}
          </main>

          {/* Chat Panel - Right Side (Fixed on Desktop, Collapsible on Mobile) */}
          {isMobile || isTablet ? (
            <section style={{ marginTop: '8px' }}>
              <details open={chatOpen} onToggle={(e) => setChatOpen(e.target.open)}>
                <summary style={{
                  cursor: 'pointer',
                   
                  fontWeight: 'bold',
                  color: 'var(--doodle-blue)',
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  padding: isMobile ? '8px' : '10px',
                  background: 'var(--doodle-paper)',
                  borderRadius: '8px',
                  border: '2px solid var(--doodle-ink)',
                  textAlign: 'center',
                  listStyle: 'none'
                }}>
                  Chat {chatOpen ? '▼' : '▶'}
                </summary>
                <div style={{ marginTop: '8px' }}>
                  <ChatWindow height={isMobile ? 250 : 300} />
                </div>
              </details>
            </section>
          ) : (
            <aside style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0
            }}>
              {/* <div style={{
                 
                fontWeight: 'bold',
                color: 'var(--doodle-blue)',
                fontSize: '0.95rem',
                padding: '10px',
                background: 'var(--doodle-paper)',
                borderRadius: '8px 8px 0 0',
                border: '2px solid var(--doodle-ink)',
                borderBottom: 'none',
                textAlign: 'center'
              }}>
                Chat
              </div> */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <ChatWindow height="100%" />
              </div>
            </aside>
          )}
        </div>
      </div>

      <style jsx>{`
      .score-card {
        background: var(--doodle-paper);
        border: 2px solid var(--doodle-ink);
        border-radius: 12px;
        padding: ${isMobile ? '8px' : '10px'};
        text-align: center;
      }
      
      .score-content h3 {
        font-family: 'Architects Daughter, cursive';
        margin: 0 0 4px 0;
        font-size: ${isMobile ? '0.9rem' : '1rem'};
      }
      
      .red-team h3 {
        color: var(--doodle-accent);
      }
      
      .blue-team h3 {
        color: var(--doodle-blue);
      }
      
      .score-value {
        font-size: ${isMobile ? '1.6rem' : '2rem'};
        font-weight: bold;
        margin: 4px 0;
         
      }
      
      .red-team .score-value {
        color: var(--doodle-accent);
      }
      
      .blue-team .score-value {
        color: var(--doodle-blue);
      }
      
      .compact-timer {
        width: ${isMobile ? '70px' : '90px'};
        height: ${isMobile ? '70px' : '90px'};
        border: 3px solid var(--doodle-ink);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--doodle-paper);
         
        font-weight: bold;
        margin: 0 auto;
      }
      
      .timer-value {
        font-size: ${isMobile ? '0.95rem' : '1.1rem'};
        line-height: 1;
        color: var(--doodle-ink);
      }
      
      .timer-warning {
        font-size: ${isMobile ? '0.65rem' : '0.75rem'};
        margin-top: 2px;
        color: var(--doodle-accent);
        font-weight: bold;
      }
      
      .doodle-glow {
        border: 2px solid var(--doodle-yellow) !important;
      }
      
      .answer-option {
        display: flex;
        align-items: center;
        background: var(--doodle-paper);
        border: 2px solid var(--doodle-ink);
        border-radius: 12px;
         
        position: relative;
      }
      
      .answer-option.selected {
        border-color: var(--doodle-blue);
        background: rgba(59, 130, 246, 0.1);
      }
      
      .answer-option input {
        display: none;
      }
      
      .option-indicator {
        border-radius: 50%;
        background: var(--doodle-sketch);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
        border: 2px solid var(--doodle-ink);
      }
      
      .answer-option.selected .option-indicator {
        background: var(--doodle-blue);
        color: white;
      }
      
      .option-text {
        flex: 1;
        line-height: 1.5;
        font-weight: 600;
      }
      
      .confirm-button {
        border-radius: 16px;
        background: linear-gradient(45deg, var(--doodle-blue), var(--doodle-green));
        color: white;
        border: 2px solid var(--doodle-ink);
        font-weight: bold;
         
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }
      
      .confirm-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: var(--doodle-sketch);
      }
      
      .status-alert {
        color: white;
        border: 2px solid var(--doodle-ink);
        border-radius: 12px;
        text-align: center;
         
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      
      .status-alert.waiting {
        background: var(--doodle-blue);
      }
      
      .status-alert.spectating {
        background: var(--doodle-purple);
      }
      
      .status-alert.waiting-turn {
        background: var(--doodle-yellow);
        color: var(--doodle-ink);
      }
      
      .result-card {
        background: var(--doodle-paper);
        border: 2px solid var(--doodle-ink);
        border-radius: 12px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      
      .result-card.correct {
        background: linear-gradient(45deg, #c6f6d5, var(--doodle-paper));
      }
      
      .result-card.incorrect {
        background: linear-gradient(45deg, #fed7d7, var(--doodle-paper));
      }
      
      .result-card h4 {
        font-family: 'Architects Daughter, cursive';
        margin: 0;
      }
      
      .result-card.red h4 {
        color: var(--doodle-accent);
      }
      
      .result-card.blue h4 {
        color: var(--doodle-blue);
      }
      
      .result-answer {
        color: var(--doodle-ink);
         
        font-weight: 600;
        line-height: 1.4;
      }
      
      .result-points {
        font-weight: bold;
         
        background: var(--doodle-yellow);
        color: var(--doodle-ink);
        border-radius: 12px;
        border: 2px solid var(--doodle-ink);
      }
      
      .correct-answer {
        background: var(--doodle-paper);
        border: 2px solid var(--doodle-ink);
        border-radius: 12px;
        text-align: center;
        max-width: 600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .correct-answer h4 {
        font-family: 'Architects Daughter, cursive';
        color: var(--doodle-ink);
        margin: 0;
      }
      
      .correct-option {
        font-weight: bold;
        color: var(--doodle-green);
         
        border-radius: 12px;
        border: 2px solid var(--doodle-green);
      }
      
      .game-over-title {
        font-family: 'Architects Daughter, cursive';
        color: var(--doodle-ink);
        text-align: center;
        margin: 0;
      }
      
      .final-score {
        font-weight: bold;
        color: white;
        border: 2px solid var(--doodle-ink);
         
        text-align: center;
      }
      
      .final-score.red {
        background: var(--doodle-accent);
      }
      
      .final-score.blue {
        background: var(--doodle-blue);
      }
      
      .score-separator {
        font-weight: bold;
        color: var(--doodle-ink);
        font-family: 'Architects Daughter, cursive';
      }
      
      .winner-announcement {
        font-family: 'Architects Daughter, cursive';
        color: var(--doodle-ink);
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin: 0;
      }
      
      .return-lobby-button {
        color: black;
        border: 2px solid var(--doodle-ink);
        font-weight: bold;
         
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }
      
      .waiting-host {
        background: var(--doodle-yellow);
        color: var(--doodle-ink);
        border: 2px solid var(--doodle-ink);
         
        font-weight: 600;
        max-width: 450px;
        margin: 0 auto;
        text-align: center;
      }
      
      .loading-game {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        padding: 20px;
      }
      
      .loading-game p {
         
        color: var(--doodle-secondary);
        margin-top: 12px;
      }
    `}</style>
    </div >
  );
}

export default GameBoard;