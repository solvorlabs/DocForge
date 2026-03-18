// src/pages/games/NumericalSpeedRace.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Home, Trophy, RotateCcw, Target, Settings, Lock } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useGames } from '../hooks/useGames';
import { createClickEffect } from '../../../shared/utils/gameUtils';
import GameSettingsModal from '../../../shared/components/modals/GameSettingsModal';
import '../../../styles/themes/doodle.css';

const NumericalSpeedRace = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, login } = useAuth();
  const { fetchNumericalQuestions, saveGameResult } = useGames();
  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [score, setScore] = useState(0);
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [questionMetadata, setQuestionMetadata] = useState({
    subjects: {},
    difficultyRange: { min: 1, max: 10 }
  });

  useEffect(() => {
    if (isLoggedIn && user) {
      setUsername(user.username);
    }
  }, [isLoggedIn, user]);

  // Fetch question metadata for settings
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SOCKET_URL}/api/question-metadata`);
        const data = await response.json();
        setQuestionMetadata(data);
      } catch (error) {
        console.error('Failed to fetch question metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver]);

  const handleSettingsSubmit = async (settings) => {
    setGameSettings(settings);
    setShowSettings(false);
    setLoading(true);

    try {
      console.log('Fetching game questions with settings:', settings);
      const gameData = await fetchNumericalQuestions({
        count: settings.totalQuestions,
        subjects: settings.selectedSubjects,
        difficultyRange: settings.difficultyRange,
        timePerQuestion: settings.timePerQuestion
      });
      
      console.log('Fetched questions:', gameData);
      setQuestions(gameData.questions);
      setCurrentQuestion(gameData.questions[0]);
      setGameStarted(true);
      setTimeLeft(settings.totalTime);
      setScore(0);
      setQuestionsAttempted(0);
      setCorrectAnswers(0);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setGameOver(false);
      setShowResult(false);
      setLastAnswerCorrect(null);
      console.log('Game state initialized, gameStarted set to true');
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
    setLoading(false);
  };

  const openSettings = (e) => {
    createClickEffect(e);
    if (!isLoggedIn) {
      alert('Please log in to play games');
      return;
    }
    setShowSettings(true);
  };

  const submitAnswer = (e) => {
    createClickEffect(e);
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newQuestionsAttempted = questionsAttempted + 1;
    
    setQuestionsAttempted(newQuestionsAttempted);
    if (isCorrect) {
      const points = Math.max(1, Math.floor(timeLeft / 30)); // More points for faster answers
      setScore(score + points);
      setCorrectAnswers(correctAnswers + 1);
      setLastAnswerCorrect(true);
    } else {
      setLastAnswerCorrect(false);
    }

    setShowResult(true);
    
    setTimeout(() => {
      setShowResult(false);
      setLastAnswerCorrect(null);
      nextQuestion();
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      endGame();
      return;
    }
    
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentQuestion(questions[nextIndex]);
    setSelectedAnswer(null);
  };

  const endGame = async () => {
    setGameOver(true);
    const accuracy = questionsAttempted > 0 ? ((correctAnswers / questionsAttempted) * 100).toFixed(1) : 0;
    try {
      await saveGameResult('numerical-speed-race', {
        score,
        questionsAnswered: questionsAttempted,
        correctAnswers,
        accuracy: parseFloat(accuracy),
        timeSpent: 300 - timeLeft,
        gameSpecificData: {
          questionsAttempted
        }
      });
    } catch (error) {
      console.error('Failed to save game result:', error);
    }
  };

  const resetGame = (e) => {
    createClickEffect(e);
    setGameStarted(false);
    setGameOver(false);
    setShowResult(false);
    setCurrentIndex(0);
    setScore(0);
    setQuestionsAttempted(0);
    setCorrectAnswers(0);
    setLastAnswerCorrect(null);
    setGameSettings(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Authentication gate - show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="doodle-avatar" style={{ marginBottom: '20px', background: 'var(--doodle-accent)' }}>
              <Lock size={40} color="#fff" />
            </div>
            <h1 className="doodle-title">Authentication Required</h1>
            <p className="doodle-subtitle">
              Please log in to play Numerical Speed Race and track your progress!
            </p>
            
            <div style={{ 
              background: 'var(--doodle-paper)', 
              padding: '20px', 
              borderRadius: '8px', 
              margin: '20px 0',
              border: '2px solid var(--doodle-sketch)'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                🎯 Customize difficulty and subjects<br/>
                🏆 Compete on leaderboards<br/>
                📊 Track your progress<br/>
                ⚡ Save your high scores
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="doodle-btn" onClick={() => navigate('/')}>
                <Home size={20} style={{ marginRight: '8px' }} />
                Back to Home
              </button>
              <button 
                className="doodle-btn doodle-btn-primary" 
                onClick={() => navigate('/login')}
              >
                <Target size={20} style={{ marginRight: '8px' }} />
                Log In to Play
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    // Show the start screen if game hasn't started
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="doodle-avatar" style={{ marginBottom: '20px' }}>
              <Target size={40} color="#fff" />
            </div>
            <h1 className="doodle-title">Numerical Speed Race</h1>
            <p className="doodle-subtitle">
              Solve as many numerical problems as possible in the time limit!
            </p>
            
            {/* Show logged in user info */}
            <div style={{ 
              background: 'var(--doodle-paper)', 
              padding: '15px', 
              borderRadius: '8px', 
              margin: '20px 0',
              border: '2px solid var(--doodle-green)'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--doodle-ink)' }}>
                Welcome back, <strong>{username}</strong>! 🎯
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="doodle-btn" onClick={() => navigate('/')}>
                <Home size={20} style={{ marginRight: '8px' }} />
                Back
              </button>
              <button 
                className="doodle-btn doodle-btn-primary" 
                onClick={openSettings}
                disabled={loading}
              >
                <Settings size={20} style={{ marginRight: '8px' }} />
                Configure & Start
              </button>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <GameSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onStart={handleSettingsSubmit}
          gameType="numerical-speed-race"
          loading={loading}
          questionMetadata={questionMetadata}
        />
      </div>
    );
  }

  if (gameOver) {
    const accuracy = questionsAttempted > 0 ? ((correctAnswers / questionsAttempted) * 100).toFixed(1) : 0;
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="doodle-avatar" style={{ marginBottom: '20px' }}>
              <Trophy size={40} color="#fff" />
            </div>
            <h1 className="doodle-title">Race Complete!</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
                  {score}
                </div>
                <div>Final Score</div>
              </div>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>
                  {questionsAttempted}
                </div>
                <div>Questions Attempted</div>
              </div>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-yellow)' }}>
                  {correctAnswers}
                </div>
                <div>Correct Answers</div>
              </div>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-purple)' }}>
                  {accuracy}%
                </div>
                <div>Accuracy</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="doodle-btn" onClick={() => navigate('/')}>
                <Home size={20} style={{ marginRight: '8px' }} />
                Home
              </button>
              <button className="doodle-btn doodle-btn-primary" onClick={resetGame}>
                <RotateCcw size={20} style={{ marginRight: '8px' }} />
                Race Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 className="doodle-title" style={{ fontSize: '1.5rem', margin: 0 }}>Numerical Speed Race</h2>
            <p style={{ margin: 0, color: 'var(--doodle-secondary)' }}>Player: {username}</p>
          </div>
          
          <div className="doodle-timer" style={{ fontSize: '1.2rem' }}>
            <Clock size={24} style={{ marginRight: '8px' }} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div className="doodle-badge" style={{ background: 'var(--doodle-blue)', padding: '10px 20px' }}>
            Score: {score}
          </div>
          <div className="doodle-badge" style={{ background: 'var(--doodle-green)', padding: '10px 20px' }}>
            Attempted: {questionsAttempted}
          </div>
          <div className="doodle-badge" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)', padding: '10px 20px' }}>
            Correct: {correctAnswers}
          </div>
          <div className="doodle-badge" style={{ background: 'var(--doodle-purple)', padding: '10px 20px' }}>
            Accuracy: {questionsAttempted > 0 ? ((correctAnswers / questionsAttempted) * 100).toFixed(1) : 0}%
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="doodle-card" style={{ padding: '30px', marginBottom: '30px', transform: `rotate(${Math.random() * 2 - 1}deg)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                Question {currentIndex + 1}
              </span>
              {showResult && (
                <span className={`doodle-badge ${lastAnswerCorrect ? 'doodle-success' : 'doodle-error'}`}>
                  {lastAnswerCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              )}
            </div>
            
            <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: 'var(--doodle-ink)' }}>
              {currentQuestion.question}
            </h3>

            <div style={{ display: 'grid', gap: '15px' }}>
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="doodle-radio" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="answer"
                    checked={selectedAnswer === index}
                    onChange={() => setSelectedAnswer(index)}
                  />
                  <div className="doodle-radio-custom"></div>
                  <span className="doodle-radio-label" style={{ fontSize: '1rem' }}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            className="doodle-btn doodle-btn-primary"
            disabled={selectedAnswer === null || showResult}
            onClick={submitAnswer}
            style={{ minWidth: '150px' }}
          >
            <Zap size={20} style={{ marginRight: '8px' }} />
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumericalSpeedRace;