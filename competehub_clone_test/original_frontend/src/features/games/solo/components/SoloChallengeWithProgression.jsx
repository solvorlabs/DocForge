// components/integration/SoloChallengeWithProgression.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import ProgressionTracker from '../../../features/progression/components/ProgressionTracker';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

// This is an example of how to integrate the progression system with the solo challenge
const SoloChallengeWithProgression = () => {
  const { user, isAuthenticated, addXP, updateHighScore, updateStats } = useUser();
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [answers, setAnswers] = useState([]);
  const progressionRef = useRef();

  // Sample questions for demonstration
  const sampleQuestions = [
    {
      id: 1,
      question: "What is the derivative of x²?",
      options: ["2x", "x", "2", "x²"],
      correctAnswer: 0,
      subject: "Mathematics",
      difficulty: 3
    },
    {
      id: 2,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2,
      subject: "General Knowledge",
      difficulty: 1
    },
    {
      id: 3,
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctAnswer: 2,
      subject: "Chemistry",
      difficulty: 2
    }
  ];

  const [questions] = useState(sampleQuestions);

  useEffect(() => {
    let interval;
    if (challengeStarted && currentQuestion < questions.length) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [challengeStarted, currentQuestion, questions.length]);

  const handleAnswerSelect = (answerIndex) => {
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, { 
      questionId: questions[currentQuestion].id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpent: timeElapsed
    }];

    setAnswers(newAnswers);
    setScore(prev => prev + (isCorrect ? 10 : 0));

    // Move to next question or finish challenge
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeElapsed(0);
    } else {
      finishChallenge(newAnswers);
    }
  };

  const finishChallenge = async (finalAnswers) => {
    setChallengeStarted(false);
    
    const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = finalAnswers.length;
    const finalScore = correctAnswers * 10;
    const totalTime = finalAnswers.reduce((sum, a) => sum + a.timeSpent, 0);

    // Calculate XP based on performance
    let xpEarned = 0;
    xpEarned += correctAnswers * 5; // 5 XP per correct answer
    xpEarned += Math.max(0, 10 - Math.floor(totalTime / 10)); // Bonus for speed
    if (correctAnswers === totalQuestions) xpEarned += 20; // Perfect score bonus

    // Update progression if user is authenticated
    if (isAuthenticated && user) {
      try {
        // Add XP
        await addXP(xpEarned, 'solo_challenge');

        // Update high score
        await updateHighScore({
          score: finalScore,
          questionsCount: totalQuestions,
          subject: 'Overall'
        });

        // Update statistics
        await updateStats({
          questionsAnswered: totalQuestions,
          correctAnswers: correctAnswers,
          timeSpent: totalTime
        });

        console.log(`Challenge completed! Earned ${xpEarned} XP`);
      } catch (error) {
        console.error('Failed to update progression:', error);
      }
    }
  };

  const startChallenge = () => {
    setChallengeStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeElapsed(0);
    setAnswers([]);
  };

  const resetChallenge = () => {
    setChallengeStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setTimeElapsed(0);
    setAnswers([]);
  };

  if (!challengeStarted && answers.length === 0) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          {/* Progression Tracker */}
          {isAuthenticated && (
            <ProgressionTracker showDetails={true} />
          )}

          {/* Challenge Setup */}
          <div className="doodle-card" style={{ marginBottom: '20px' }}>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div className="doodle-avatar doodle-float" style={{ margin: '0 auto 20px' }}>
                <DoodleIcons.Brain size={40} color="#fff" />
              </div>
              <h2 className="doodle-title">Solo Challenge</h2>
              <p className="doodle-subtitle">
                Test your knowledge and earn XP!
              </p>
              
              <div style={{ margin: '30px 0' }}>
                <div className="doodle-badge" style={{ 
                  background: 'var(--doodle-blue)', 
                  margin: '5px',
                  padding: '8px 16px'
                }}>
                  {questions.length} Questions
                </div>
                <div className="doodle-badge" style={{ 
                  background: 'var(--doodle-green)', 
                  margin: '5px',
                  padding: '8px 16px'
                }}>
                  +5 XP per correct answer
                </div>
                <div className="doodle-badge" style={{ 
                  background: 'var(--doodle-yellow)', 
                  color: 'var(--doodle-ink)',
                  margin: '5px',
                  padding: '8px 16px'
                }}>
                  Speed bonus available
                </div>
              </div>

              <button
                onClick={startChallenge}
                className="doodle-btn doodle-btn-primary"
                style={{ fontSize: '1.2rem', padding: '15px 30px' }}
              >
                <DoodleIcons.Lightning size={24} style={{ marginRight: '10px' }} />
                Start Challenge
              </button>
            </div>
          </div>

          {/* Not logged in message */}
          {!isAuthenticated && (
            <div className="doodle-alert" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }}>
              <strong>Tip:</strong> Log in to track your progress, earn XP, and compete on leaderboards!
            </div>
          )}
        </div>
      </div>
    );
  }

  if (challengeStarted && currentQuestion < questions.length) {
    const question = questions[currentQuestion];
    
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          {/* Compact Progression Tracker */}
          {isAuthenticated && (
            <ProgressionTracker compact={true} />
          )}

          {/* Question Card */}
          <div className="doodle-card" style={{ marginBottom: '20px' }}>
            <div style={{ padding: '30px' }}>
              {/* Progress */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{   fontWeight: '600' }}>
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <div style={{   fontWeight: '600' }}>
                  Score: {score}
                </div>
              </div>

              <div className="doodle-progress" style={{ marginBottom: '20px' }}>
                <div 
                  className="doodle-progress-fill" 
                  style={{ 
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    background: 'var(--doodle-blue)'
                  }}
                ></div>
              </div>

              {/* Question */}
              <h3 style={{ 
                fontFamily: 'Architects Daughter, cursive', 
                fontSize: '1.5rem',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {question.question}
              </h3>

              {/* Options */}
              <div style={{ display: 'grid', gap: '10px' }}>
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className="doodle-btn doodle-btn-secondary"
                    style={{ 
                      padding: '15px',
                      textAlign: 'left',
                      fontSize: '1rem'
                    }}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>

              {/* Timer */}
              <div style={{ 
                textAlign: 'center', 
                marginTop: '20px',
                 
                fontSize: '1.2rem',
                color: 'var(--doodle-orange)'
              }}>
                ⏱️ {timeElapsed}s
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const totalQuestions = answers.length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const xpEarned = correctAnswers * 5 + Math.max(0, 10 - Math.floor(answers.reduce((sum, a) => sum + a.timeSpent, 0) / 10));

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Progression Tracker */}
        {isAuthenticated && (
          <ProgressionTracker showDetails={true} />
        )}

        {/* Results Card */}
        <div className="doodle-card" style={{ marginBottom: '20px' }}>
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
              {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
            </div>
            <h2 className="doodle-title">Challenge Complete!</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '20px',
              margin: '30px 0'
            }}>
              <div className="doodle-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
                  {score}
                </div>
                <div style={{   }}>Score</div>
              </div>
              <div className="doodle-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>
                  {accuracy}%
                </div>
                <div style={{   }}>Accuracy</div>
              </div>
              <div className="doodle-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--doodle-yellow)' }}>
                  {xpEarned}
                </div>
                <div style={{   }}>XP Earned</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={startChallenge}
                className="doodle-btn doodle-btn-primary"
              >
                <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
                Try Again
              </button>
              <button
                onClick={resetChallenge}
                className="doodle-btn doodle-btn-secondary"
              >
                <DoodleIcons.Users size={20} style={{ marginRight: '8px' }} />
                New Challenge
              </button>
            </div>
          </div>
        </div>

        {/* XP Breakdown */}
        {isAuthenticated && (
          <div className="doodle-card">
            <div style={{ padding: '20px' }}>
              <h3 style={{ 
                fontFamily: 'Architects Daughter, cursive', 
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                XP Breakdown
              </h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                   
                }}>
                  <span>Correct Answers ({correctAnswers}):</span>
                  <span>+{correctAnswers * 5} XP</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                   
                }}>
                  <span>Speed Bonus:</span>
                  <span>+{Math.max(0, 10 - Math.floor(answers.reduce((sum, a) => sum + a.timeSpent, 0) / 10))} XP</span>
                </div>
                {correctAnswers === totalQuestions && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                     
                    color: 'var(--doodle-green)',
                    fontWeight: '600'
                  }}>
                    <span>Perfect Score Bonus:</span>
                    <span>+20 XP</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoloChallengeWithProgression;
