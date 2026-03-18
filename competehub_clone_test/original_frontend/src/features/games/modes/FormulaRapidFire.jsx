// src/pages/games/FormulaRapidFire.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Zap, Home, Trophy, RotateCcw, ChevronRight, Heart } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useGames } from '../games/hooks/useGames';
import { createClickEffect } from '../../../shared/utils/gameUtils';
import '../../../styles/themes/doodle.css';

const FormulaRapidFire = () => {
  console.log("Rendering FormulaRapidFire component");
  const navigate = useNavigate();
  const { user, isLoggedIn, login } = useAuth();
  const { fetchGameQuestions, saveGameResult } = useGames();
  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      console.log('User is logged in:', user);
      setUsername(user.username);
    } else {
      console.log('User not logged in or user object missing.');
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    let timer;
    console.log('useEffect triggered with values:', {
      timeLeft,
      gameStarted,
      showAnswer,
      gameOver,
    });

    if (gameStarted && !showAnswer && !gameOver && timeLeft > 0) {
      console.log('Starting timer, timeLeft:', timeLeft);
      timer = setTimeout(() => {
        console.log('Decrementing timeLeft to:', timeLeft - 1);
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showAnswer) {
      console.log('Time is up! Calling handleTimeUp().');
      handleTimeUp();
    }

    return () => {
      if (timer) {
        console.log('Clearing timer.');
        clearTimeout(timer);
      }
    };
  }, [timeLeft, gameStarted, showAnswer, gameOver]);

  const startGame = async (e) => {
    createClickEffect(e);
    if (!username.trim()) return;

    if (!isLoggedIn) {
      login(username);
    }

    setLoading(true);
    try {
      const gameQuestions = await fetchGameQuestions('formula-rapid-fire');
      setQuestions(gameQuestions);
      console.log("Fetched Questions:", gameQuestions);
      setCurrentCard(gameQuestions[0]);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setLoading(false);
      return;
    }
    setGameStarted(true);
    setTimeLeft(10);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalCards(0);
    setCurrentIndex(0);
    setLives(3);
    setGameOver(false);
    setShowAnswer(false);
    setLoading(false);
    console.log("Game started with username:", username);
  };

  const handleTimeUp = () => {
    setShowAnswer(true);
    setLives(lives - 1);
    setStreak(0);
    console.log("Time up! Lives left:", lives - 1);
    if (lives <= 1) {
      endGame();
    }
  };

  const handleCorrect = (e) => {
    createClickEffect(e);
    const points = Math.max(1, timeLeft) * (streak + 1);
    setScore(score + points);
    const newStreak = streak + 1;
    setStreak(newStreak);
    setMaxStreak(Math.max(maxStreak, newStreak));
    console.log("Correct! Score:", score + points, "Streak:", newStreak);
    nextCard();
  };

  const handleIncorrect = (e) => {
    createClickEffect(e);
    setLives(lives - 1);
    setStreak(0);
    console.log("Incorrect! Lives left:", lives - 1);
    if (lives <= 1) {
      endGame();
    } else {
      nextCard();
    }
  };

  const nextCard = () => {
    setShowAnswer(false);
    setTotalCards(totalCards + 1);

    if (currentIndex + 1 >= questions.length) {
      console.log("No more questions. Ending game.");
      endGame();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentCard(questions[nextIndex]);
    setTimeLeft(10);
    console.log("Next card index:", nextIndex);
  };

  const endGame = async () => {
    setGameOver(true);
    console.log("Game over! Final score:", score, "Total cards:", totalCards, "Max streak:", maxStreak);
    try {
      await saveGameResult('formula-rapid-fire', {
        score,
        questionsAnswered: totalCards,
        correctAnswers: totalCards, // Assuming all completed cards were correct
        accuracy: 100,
        timeSpent: (totalCards + 1) * 10,
        gameSpecificData: {
          totalCards,
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
    setShowAnswer(false);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalCards(0);
    setLives(3);
    console.log("Game reset.");
  };

  // Show start screen for logged-in users before game starts
  if (isLoggedIn && username && !gameStarted) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="doodle-avatar" style={{ marginBottom: '20px' }}>
              <Zap size={40} color="#fff" />
            </div>
            <h1 className="doodle-title">Formula Rapid Fire</h1>
            <p className="doodle-subtitle">Test your formula recall speed! You have 10 seconds per card.</p>
            <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>Player: {username}</div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="doodle-btn" onClick={() => navigate('/')}>
                <Home size={20} style={{ marginRight: '8px' }} />
                Back
              </button>
              <button
                className="doodle-btn doodle-btn-primary"
                onClick={startGame}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Start Game'}
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
          <div className="doodle-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="doodle-avatar" style={{ marginBottom: '20px' }}>
              <Trophy size={40} color="#fff" />
            </div>
            <h1 className="doodle-title">Game Over!</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
                  {score}
                </div>
                <div>Final Score</div>
              </div>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>
                  {totalCards}
                </div>
                <div>Cards Completed</div>
              </div>
              <div className="doodle-sticky" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-yellow)' }}>
                  {maxStreak}
                </div>
                <div>Best Streak</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="doodle-btn" onClick={() => navigate('/')}>
                <Home size={20} style={{ marginRight: '8px' }} />
                Home
              </button>
              <button className="doodle-btn doodle-btn-primary" onClick={resetGame}>
                <RotateCcw size={20} style={{ marginRight: '8px' }} />
                Play Again
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 className="doodle-title" style={{ fontSize: '1.5rem', margin: 0 }}>Formula Rapid Fire</h2>
            <p style={{ margin: 0, color: 'var(--doodle-secondary)' }}>Player: {username}</p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="doodle-timer">
              <Timer size={20} style={{ marginRight: '8px' }} />
              {timeLeft}s
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '30px',
                    height: '30px',
                    background: i < lives ? 'var(--doodle-accent)' : 'var(--doodle-sketch)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <Heart size={16} color={i < lives ? 'white' : 'gray'} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div className="doodle-badge" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)', padding: '10px 20px' }}>
            Cards: {totalCards}
          </div>
        </div>

        {/* Card */}
        {currentCard && (
          <div className="doodle-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '30px', minHeight: '200px', transform: `rotate(${Math.random() * 4 - 2}deg)` }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--doodle-ink)' }}>
              {currentCard.question}
            </h3>

            {showAnswer && (
              <div className="doodle-alert" style={{ background: 'var(--doodle-blue)', marginTop: '20px' }}>
                <strong>Answer:</strong> {currentCard.options[currentCard.correctAnswer]}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {!showAnswer ? (
            <button
              className="doodle-btn doodle-btn-secondary"
              onClick={() => setShowAnswer(true)}
            >
              Show Answer
            </button>
          ) : (
            <>
              <button
                className="doodle-btn doodle-btn-danger"
                onClick={handleIncorrect}
              >
                Incorrect
              </button>
              <button
                className="doodle-btn doodle-btn-primary"
                onClick={handleCorrect}
              >
                Correct
                <ChevronRight size={20} style={{ marginLeft: '8px' }} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulaRapidFire;