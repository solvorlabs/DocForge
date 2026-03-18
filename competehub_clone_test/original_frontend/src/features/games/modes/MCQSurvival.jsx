// src/pages/games/MCQSurvival.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Home, Trophy, RotateCcw, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useGames } from '../games/hooks/useGames';
import { createClickEffect } from '../../../shared/utils/gameUtils';
import '../../../styles/themes/doodle.css';

const MCQSurvival = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, login } = useAuth();
  const { fetchGameQuestions, saveGameResult } = useGames();
  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    if (isLoggedIn && user) {
      setUsername(user.username);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver && !showResult && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver, showResult]);

  const startGame = async (e) => {
    createClickEffect(e);
    if (!username.trim()) return;
    
    if (!isLoggedIn) {
      login(username);
    }
    
    setLoading(true);
    try {
      const gameQuestions = await fetchGameQuestions('mcq-survival');
      setQuestions(gameQuestions);
      setCurrentQuestion(gameQuestions[0]);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setLoading(false);
      return;
    }
    setGameStarted(true);
    setLives(5);
    setScore(0);
    setQuestionIndex(0);
    setTimePerQuestion(30);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setGameOver(false);
    setShowResult(false);
    setLastAnswerCorrect(null);
    setStreak(0);
    setMaxStreak(0);
    setLoading(false);
  };

  const handleTimeUp = () => {
    setLastAnswerCorrect(false);
    setLives(lives - 1);
    setStreak(0);
    setShowResult(true);
    
    if (lives <= 1) {
      setTimeout(() => endGame(), 1500);
    } else {
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  const submitAnswer = (e) => {
    createClickEffect(e);
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setLastAnswerCorrect(isCorrect);
    
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 5);
      const streakBonus = streak * 2;
      const points = 10 + timeBonus + streakBonus;
      setScore(score + points);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
      
      // Speed up the game every 5 correct answers
      if (newStreak % 5 === 0 && timePerQuestion > 15) {
        setTimePerQuestion(timePerQuestion - 2);
      }
    } else {
      setLives(lives - 1);
      setStreak(0);
    }

    setShowResult(true);
    
    if (!isCorrect && lives <= 1) {
      setTimeout(() => endGame(), 1500);
    } else {
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= questions.length) {
      // Reshuffle questions for endless mode
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setQuestionIndex(0);
      setCurrentQuestion(shuffled[0]);
    } else {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
    }
    
    setSelectedAnswer(null);
    setTimeLeft(timePerQuestion);
    setShowResult(false);
    setLastAnswerCorrect(null);
  };

  const endGame = async () => {
    setGameOver(true);
    try {
      await saveGameResult('mcq-survival', {
        score,
        questionsAnswered: questionIndex + 1,
        correctAnswers: questionIndex + 1 - (5 - lives), // Estimate correct answers based on lives lost
        accuracy: ((questionIndex + 1 - (5 - lives)) / (questionIndex + 1)) * 100,
        timeSpent: 0, // MCQ Survival doesn't track total time
        gameSpecificData: {
          finalLives: lives,
          maxStreak
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
    setQuestionIndex(0);
    setScore(0);
    setLives(5);
    setStreak(0);
    setMaxStreak(0);
    setTimePerQuestion(30);
  };

  if (!gameStarted) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="doodle-avatar" style={{ marginBottom: '20px' }}>
              <Shield size={40} color="#fff" />
            </div>
            <h1 className="doodle-title">MCQ Survival Mode</h1>
            <p className="doodle-subtitle">Survive the endless stream of questions! Timer speeds up as you progress.</p>
            
            <input
              type="text"
              className="doodle-input"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginBottom: '20px', width: '100%' }}
            />
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="doodle-btn" onClick={() => navigate('/')}>
                <Home size={20} style={{ marginRight: '8px' }} />
                Back
              </button>
              <button 
                className="doodle-btn doodle-btn-primary" 
                onClick={startGame}
                disabled={!username.trim() || loading}
              >
                {loading ? 'Loading...' : 'Start Survival'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-card doodle-shake" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="doodle-avatar" style={{ marginBottom: '20px', background: 'var(--doodle-accent)' }}>
              <AlertTriangle size={40} color="#fff" />
            </div>
            <h1 className="doodle-title">Survival Ended!</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
                  {score}
                </div>
                <div>Final Score</div>
              </div>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>
                  {questionIndex + 1}
                </div>
                <div>Questions Survived</div>
              </div>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-yellow)' }}>
                  {maxStreak}
                </div>
                <div>Best Streak</div>
              </div>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-purple)' }}>
                  {30 - timePerQuestion + 2}s
                </div>
                <div>Speed Reached</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="doodle-btn" onClick={() => navigate('/')}>
                <Home size={20} style={{ marginRight: '8px' }} />
                Home
              </button>
              <button className="doodle-btn doodle-btn-primary" onClick={resetGame}>
                <RotateCcw size={20} style={{ marginRight: '8px' }} />
                Try Again
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
            <h2 className="doodle-title" style={{ fontSize: '1.5rem', margin: 0 }}>MCQ Survival</h2>
            <p style={{ margin: 0, color: 'var(--doodle-secondary)' }}>Player: {username}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className="doodle-timer" style={{ 
              background: timeLeft <= 10 ? 'var(--doodle-accent)' : 'var(--doodle-blue)',
              animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none'
            }}>
              {timeLeft}s
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '25px',
                    height: '25px',
                    background: i < lives ? 'var(--doodle-accent)' : 'var(--doodle-sketch)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart size={12} color={i < lives ? 'white' : 'gray'} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div className="doodle-badge" style={{ background: 'var(--doodle-blue)', padding: '10px 20px' }}>
            Score: {score}
          </div>
          <div className="doodle-badge" style={{ background: 'var(--doodle-green)', padding: '10px 20px' }}>
            Question: {questionIndex + 1}
          </div>
          <div className="doodle-badge" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)', padding: '10px 20px' }}>
            Streak: {streak}
          </div>
          <div className="doodle-badge" style={{ background: 'var(--doodle-purple)', padding: '10px 20px' }}>
            Speed: {timePerQuestion}s
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className={`doodle-card ${showResult ? (lastAnswerCorrect ? 'doodle-success' : 'doodle-error doodle-shake') : ''}`} 
               style={{ padding: '30px', marginBottom: '30px', transform: `rotate(${Math.random() * 2 - 1}deg)` }}>
            
            {showResult && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span className="doodle-badge" 
                      style={{ background: lastAnswerCorrect ? 'var(--doodle-green)' : 'var(--doodle-accent)' }}>
                  {lastAnswerCorrect ? '✓ Correct!' : '✗ Wrong Answer!'}
                </span>
                {!lastAnswerCorrect && (
                  <div style={{ marginTop: '10px', color: 'var(--doodle-secondary)' }}>
                    Correct answer: {currentQuestion.options[currentQuestion.correctAnswer]}
                  </div>
                )}
              </div>
            )}
            
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
                    disabled={showResult}
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

export default MCQSurvival;