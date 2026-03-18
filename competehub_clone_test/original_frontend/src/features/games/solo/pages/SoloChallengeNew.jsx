// src/pages/SoloChallenge.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/themes/doodle.css';
import { createClickEffect, DoodleIcons, getRandomDoodleDecoration, getRandomRotation } from '../../../shared/utils/doodleUtils';

function SoloChallenge() {
  const navigate = useNavigate();
  
  // States for setup
  const [username, setUsername] = useState('');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [challengeSettings, setChallengeSettings] = useState({
    selectedSubjects: [],
    selectedExamTypes: [],
    selectedTags: [],
    difficultyRange: { min: 1, max: 10 },
    conceptLevels: ['Fundamental', 'Application', 'Analysis']
  });
  const [questionMetadata, setQuestionMetadata] = useState({
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    examTypes: ['JEE Main', 'JEE Advanced', 'NEET', 'BITSAT'],
    tags: ['Algebra', 'Mechanics', 'Organic', 'Genetics'],
    difficultyRange: { min: 1, max: 10 },
    conceptLevels: ['Fundamental', 'Application', 'Analysis']
  });
  const [availableQuestions, setAvailableQuestions] = useState(1000);
  
  // States for challenge
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // States for results
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerRunning) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerRunning]);

  const fetchQuestionMetadata = async () => {
    try {
      // Mock data for now
      setQuestionMetadata({
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
        examTypes: ['JEE Main', 'JEE Advanced', 'NEET', 'BITSAT'],
        tags: ['Algebra', 'Mechanics', 'Organic', 'Genetics'],
        difficultyRange: { min: 1, max: 10 },
        conceptLevels: ['Fundamental', 'Application', 'Analysis']
      });
    } catch (error) {
      setError('Failed to load question metadata');
    }
  };
  
  // Format time in mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle input changes
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  
  const handleQuestionsCountChange = (e) => {
    setQuestionsCount(e.target.value);
  };

  const handleChallengeSettingsChange = (field, value) => {
    setChallengeSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Start the challenge
  const startChallenge = async (e) => {
    createClickEffect(e);
    if (!username) {
      setError('Please enter your username');
      return;
    }
    
    try {
      setLoading(true);
      
      // Mock questions for demo
      const mockQuestions = Array.from({ length: questionsCount }, (_, i) => ({
        id: i + 1,
        question: `Sample question ${i + 1}: What is the answer to this challenging problem?`,
        options: [
          'Option A - First choice',
          'Option B - Second choice', 
          'Option C - Third choice',
          'Option D - Fourth choice'
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        subject: questionMetadata.subjects[Math.floor(Math.random() * questionMetadata.subjects.length)],
        difficulty: Math.floor(Math.random() * 10) + 1
      }));
      
      setQuestions(mockQuestions);
      setAnswers(new Array(mockQuestions.length).fill(null));
      setChallengeStarted(true);
      setTimerRunning(true);
      
    } catch (error) {
      setError('Failed to start challenge');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
  };
  
  // Submit answer and move to next question
  const submitAnswer = (e) => {
    createClickEffect(e);
    if (selectedAnswer === null) return;
    
    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
    
    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishChallenge(newAnswers);
    }
  };
  
  // Calculate results and finish challenge
  const finishChallenge = async (finalAnswers) => {
    setTimerRunning(false);
    
    // Calculate results
    let totalScore = 0;
    let correct = 0;
    let incorrect = 0;
    
    questions.forEach((question, index) => {
      if (finalAnswers[index] === question.correctAnswer) {
        correct++;
        totalScore += 10; // 10 points per correct answer
      } else {
        incorrect++;
      }
    });
    
    setScore(totalScore);
    setCorrectCount(correct);
    setIncorrectCount(incorrect);
    setShowResults(true);
    
    // Save results to server (mock for now)
    try {
      console.log('Saving results...', { username, score: totalScore, timeElapsed });
    } catch (error) {
      console.error('Failed to save results');
    }
  };
  
  // Return to home
  const goToHome = (e) => {
    createClickEffect(e);
    navigate('/');
  };
  
  // View leaderboard
  const viewLeaderboard = (e) => {
    createClickEffect(e);
    navigate('/leaderboard');
  };
  
  // Setup screen
  if (!challengeStarted) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-paper">
            <div style={{ padding: '40px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div className="doodle-avatar">
                  <DoodleIcons.Brain size={40} color="#fff" />
                </div>
                <h1 className="doodle-title">Solo Challenge Setup</h1>
                <p className="doodle-subtitle">
                  Customize your quiz experience and test your knowledge!
                </p>
              </div>

              {error && (
                <div className="doodle-alert" style={{ marginBottom: '20px' }}>
                  {error}
                  <button 
                    onClick={() => setError('')}
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

              {/* Setup Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div>
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
                    onChange={handleUsernameChange}
                    placeholder="Enter your name"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '10px',
                     
                    fontWeight: '600',
                    color: 'var(--doodle-ink)'
                  }}>
                    Number of Questions:
                  </label>
                  <select
                    className="doodle-input"
                    value={questionsCount}
                    onChange={handleQuestionsCountChange}
                    style={{ width: '100%' }}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
              </div>

              {/* Subject Selection */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '15px',
                   
                  fontWeight: '600',
                  color: 'var(--doodle-ink)'
                }}>
                  Select Subjects:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {questionMetadata.subjects.map((subject, index) => (
                    <label key={subject} className="doodle-radio">
                      <input
                        type="checkbox"
                        checked={challengeSettings.selectedSubjects.includes(subject)}
                        onChange={(e) => {
                          const newSubjects = e.target.checked 
                            ? [...challengeSettings.selectedSubjects, subject]
                            : challengeSettings.selectedSubjects.filter(s => s !== subject);
                          handleChallengeSettingsChange('selectedSubjects', newSubjects);
                        }}
                      />
                      <div className="doodle-radio-custom" style={{ 
                        borderRadius: '4px',
                        transform: `rotate(${getRandomRotation()}deg)`
                      }}></div>
                      <span className="doodle-radio-label">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Range */}
              <div style={{ marginBottom: '40px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '15px',
                   
                  fontWeight: '600',
                  color: 'var(--doodle-ink)'
                }}>
                  Difficulty Range: {challengeSettings.difficultyRange.min} - {challengeSettings.difficultyRange.max}
                </label>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ minWidth: '30px' }}>Easy</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={challengeSettings.difficultyRange.max}
                    onChange={(e) => handleChallengeSettingsChange('difficultyRange', {
                      ...challengeSettings.difficultyRange,
                      max: parseInt(e.target.value)
                    })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: '30px' }}>Hard</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button 
                  className="doodle-btn"
                  onClick={goToHome}
                  style={{ background: 'var(--doodle-sketch)', color: 'white' }}
                >
                  <DoodleIcons.Home size={20} style={{ marginRight: '8px' }} />
                  Back to Home
                </button>
                
                <button 
                  className="doodle-btn doodle-btn-secondary"
                  onClick={startChallenge}
                  disabled={!username || loading}
                  style={{ minWidth: '200px' }}
                >
                  {loading ? (
                    <div className="doodle-spinner" style={{ margin: '0 auto' }}></div>
                  ) : (
                    <>
                      <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
                      Start Challenge
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
  
  // Results screen
  if (showResults) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
          <div className="doodle-paper">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="doodle-avatar" style={{ marginBottom: '20px' }}>
                <DoodleIcons.Trophy size={40} color="#fff" />
              </div>
              
              <h1 className="doodle-title">Challenge Complete!</h1>
              
              {/* Score Display */}
              <div className="doodle-scoreboard" style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                  fontFamily: 'Architects Daughter, cursive',
                  fontSize: '2rem',
                  color: 'var(--doodle-ink)',
                  marginBottom: '20px'
                }}>
                  Final Score: {score} points
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div className="doodle-card" style={{ padding: '20px', transform: 'rotate(-2deg)' }}>
                    <DoodleIcons.Target size={30} color="var(--doodle-green)" />
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>
                        {correctCount}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                        Correct
                      </div>
                    </div>
                  </div>
                  
                  <div className="doodle-card" style={{ padding: '20px', transform: 'rotate(1deg)' }}>
                    <DoodleIcons.Timer size={30} color="var(--doodle-blue)" />
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
                        {formatTime(timeElapsed)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                        Time Taken
                      </div>
                    </div>
                  </div>
                  
                  <div className="doodle-card" style={{ padding: '20px', transform: 'rotate(-1deg)' }}>
                    <span style={{ fontSize: '30px', color: 'var(--doodle-accent)' }}>✗</span>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--doodle-accent)' }}>
                        {incorrectCount}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                        Incorrect
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button 
                  className="doodle-btn doodle-btn-primary"
                  onClick={() => {
                    setChallengeStarted(false);
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswer(null);
                    setAnswers([]);
                    setTimeElapsed(0);
                    setScore(0);
                    setCorrectCount(0);
                    setIncorrectCount(0);
                  }}
                >
                  <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
                  Try Again
                </button>
                
                <button 
                  className="doodle-btn"
                  onClick={viewLeaderboard}
                  style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }}
                >
                  <DoodleIcons.Trophy size={20} style={{ marginRight: '8px' }} />
                  Leaderboard
                </button>
                
                <button 
                  className="doodle-btn"
                  onClick={goToHome}
                  style={{ background: 'var(--doodle-sketch)', color: 'white' }}
                >
                  <DoodleIcons.Home size={20} style={{ marginRight: '8px' }} />
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Challenge screen
  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="doodle-paper">
          <div style={{ padding: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ 
                fontFamily: 'Architects Daughter, cursive',
                fontSize: '1.8rem',
                color: 'var(--doodle-ink)',
                margin: 0
              }}>
                Solo Challenge
              </h2>
              
              <div className="doodle-timer">
                <DoodleIcons.Timer size={20} style={{ marginRight: '8px' }} />
                {formatTime(timeElapsed)}
              </div>
            </div>
            
            {/* Progress */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10px',
                 
                fontWeight: '600'
              }}>
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
              </div>
              <div className="doodle-progress">
                <div 
                  className="doodle-progress-fill" 
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {questions.length > 0 && (
              <>
                {/* Question */}
                <div className="doodle-card" style={{ marginBottom: '30px', transform: 'rotate(-0.5deg)' }}>
                  <h3 style={{ 
                     
                    fontSize: '1.3rem',
                    color: 'var(--doodle-ink)',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {questions[currentQuestionIndex].question}
                  </h3>
                </div>
                
                {/* Answer Options */}
                <div style={{ marginBottom: '40px' }}>
                  <h4 style={{ 
                     
                    color: 'var(--doodle-ink)',
                    marginBottom: '20px'
                  }}>
                    Select your answer:
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <label key={index} className="doodle-radio">
                        <input
                          type="radio"
                          name="answer"
                          checked={selectedAnswer === index}
                          onChange={() => handleAnswerSelect(index)}
                        />
                        <div className="doodle-radio-custom"></div>
                        <span className="doodle-radio-label" style={{ fontSize: '1.1rem' }}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    className="doodle-btn"
                    onClick={goToHome}
                    style={{ background: 'var(--doodle-sketch)', color: 'white' }}
                  >
                    Quit Challenge
                  </button>
                  
                  <button
                    className="doodle-btn doodle-btn-primary"
                    disabled={selectedAnswer === null}
                    onClick={submitAnswer}
                    style={{ minWidth: '150px' }}
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Challenge'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoloChallenge;
