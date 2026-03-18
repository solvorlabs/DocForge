// src/pages/SoloChallenge.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../../styles/themes/doodle.css';
import { createClickEffect, DoodleIcons, getRandomDoodleDecoration, getRandomRotation } from '../../../../shared/utils/doodleUtils';
import TagDropdown from '../../../../shared/components/ui/TagDropdown'; // Import the new TagDropdown component
import { Brain } from 'lucide-react';
import { useUser } from '../../../../app/providers/UserContext';

function SoloChallenge() {
  const navigate = useNavigate();
  const { user } = useUser();

  // States for setup
  const username = user?.username || 'Guest';
  const [questionsCount, setQuestionsCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [challengeSettings, setChallengeSettings] = useState({
    selectedSubjects: [],
    selectedExamTypes: [],
    selectedTags: [],
    difficultyRange: { min: 1, max: 10 },
    conceptLevels: []
  });
  const [questionMetadata, setQuestionMetadata] = useState({
    subjects: {},
    difficultyRange: { min: 1, max: 10 },
    conceptLevels: []
  });
  const [availableExamTypes, setAvailableExamTypes] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState(0);
  const [tagSearch, setTagSearch] = useState('');
  const [showRules, setShowRules] = useState(false);

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

  // Fetch question metadata when component mounts
  useEffect(() => {
    fetchQuestionMetadata();
  }, []);

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
      const response = await axios.get(`${import.meta.env.VITE_SOCKET_URL}/api/question-metadata`);
      setQuestionMetadata(response.data);
    } catch (err) {
      setError('Failed to load question metadata');
      setQuestionMetadata({
        subjects: {},
        difficultyRange: { min: 1, max: 10 },
        conceptLevels: []
      });
    }
  };

  // Update available exam types and tags when subjects change
  useEffect(() => {
    const updateAvailableOptions = (selectedSubjects) => {
      if (selectedSubjects.length === 0) {
        setAvailableExamTypes([]);
        setAvailableTags([]);
        return;
      }

      // Get union of all exam types and tags from selected subjects
      const allExamTypes = new Set();
      const allTags = new Set();

      selectedSubjects.forEach(subject => {
        const subjectData = questionMetadata.subjects[subject];
        if (subjectData) {
          subjectData.examTypes?.forEach(examType => allExamTypes.add(examType));
          subjectData.tags?.forEach(tag => allTags.add(tag));
        }
      });

      setAvailableExamTypes(Array.from(allExamTypes));
      setAvailableTags(Array.from(allTags));
    };

    updateAvailableOptions(challengeSettings.selectedSubjects);
  }, [challengeSettings.selectedSubjects, questionMetadata]);

  // Format time in mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle input changes
  const handleQuestionsCountChange = (e) => {
    setQuestionsCount(Number(e.target.value));
  };

  const handleChallengeSettingsChange = (field, value) => {
    setChallengeSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Start the challenge
  const startChallenge = async (e) => {
    console.log('Starting challenge with settings:', {username, questionsCount, challengeSettings});
    createClickEffect(e);
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${import.meta.env.VITE_SOCKET_URL}/api/solo-challenge`, {
        username,
        questionsCount,
        challengeSettings
      });
      setQuestions(response.data.questions);
      setAvailableQuestions(response.data.availableQuestions || 0);
      setChallengeStarted(true);
      setTimerRunning(true);
      setAnswers(new Array(response.data.questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setTimeElapsed(0);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start challenge');
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
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
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
    let totalScore = 0;
    let correct = 0;
    let incorrect = 0;
    const performanceBySubject = {};
    questions.forEach((question, index) => {
      const userAnswer = finalAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) {
        totalScore += 4;
        correct++;
      } else if (userAnswer !== null) {
        totalScore -= 1;
        incorrect++;
      }
      // Track subject performance
      if (question.subjects && Array.isArray(question.subjects)) {
        question.subjects.forEach(subject => {
          if (!performanceBySubject[subject]) {
            performanceBySubject[subject] = {
              subject,
              totalQuestions: 0,
              correctAnswers: 0,
              averageTime: 0
            };
          }
          performanceBySubject[subject].totalQuestions++;
          if (isCorrect) {
            performanceBySubject[subject].correctAnswers++;
          }
        });
      }
    });
    Object.values(performanceBySubject).forEach(subjectPerf => {
      subjectPerf.averageTime = subjectPerf.totalQuestions > 0
        ? Math.round(timeElapsed / subjectPerf.totalQuestions)
        : 0;
    });
    setScore(totalScore);
    setCorrectCount(correct);
    setIncorrectCount(incorrect);
    setShowResults(true);
    // Save results to server
    try {
      await axios.post(`${import.meta.env.VITE_SOCKET_URL}/api/solo-challenge/complete`, {
        username,
        questionsCount,
        score: totalScore,
        timeElapsed,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        challengeSettings,
        performanceBySubject: Object.values(performanceBySubject)
      });
    } catch (err) {
      console.error('Failed to save results:', err);
      setError('Your results were calculated but could not be saved to the leaderboard');
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

  // Setup screen (default)
  if (!challengeStarted && !showResults) {
    return (
      <>
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
        position: 'relative'
      }}>
        {/* Top Left - Back to Arena Icon */}
        <button
          onClick={() => navigate('/home')}
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
          title="Back to Arena"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Top Right - How to Play Icon */}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          maxWidth: '1600px',
          width: '100%',
          flexWrap: 'wrap'
        }}>
          {/* Left Side - Game Setup Form */}
          <div style={{
            maxWidth: '600px',
            width: '100%',
            flex: '1 1 auto',
            background: 'var(--doodle-paper)',
            border: '4px solid var(--doodle-ink)',
            borderRadius: '25px',
            padding: '40px 35px',
            boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
            transform: 'rotate(-0.5deg)'
          }}>
            <div className="text-center mb-8">
              <h1 className="doodle-title text-4xl mb-3" >Solo Challenge</h1>
              <p className="doodle-subtitle text-lg mb-8">
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
              <div className="mb-8 space-y-6">

                <div className="text-left">
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                    Number of Questions
                  </label>
                  <select
                    className="doodle-input w-full max-w-md mx-auto"
                    value={questionsCount}
                    onChange={handleQuestionsCountChange}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>

              {/* Subject Selection */}
              <div>
                <h3 className="text-xl mb-4" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                  Select Subjects ({challengeSettings.selectedSubjects.length === 0 ? 'All' : challengeSettings.selectedSubjects.length} selected)
                </h3>
                <p className="text-sm mb-4" style={{  color: 'var(--doodle-secondary)'}}>
                  Choose which subjects to include
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-2 rounded-lg" style={{background: 'var(--doodle-paper)'}}>
                  {Object.keys(questionMetadata.subjects).map(subject => {
                    const isSelected = challengeSettings.selectedSubjects.includes(subject);
                    
                    return (
                      <button
                        key={subject}
                        onClick={() => {
                          const newSubjects = isSelected
                            ? challengeSettings.selectedSubjects.filter(s => s !== subject)
                            : [...challengeSettings.selectedSubjects, subject];
                          handleChallengeSettingsChange('selectedSubjects', newSubjects);
                        }}
                        className={`doodle-card p-3 transition-all text-left ${
                          isSelected
                            ? 'shadow-lg scale-105'
                            : 'hover:shadow-md'
                        }`}
                        style={isSelected ? {
                          backgroundColor: '#dbeafe',
                          borderColor: 'var(--doodle-blue)'
                        } : {}}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div 
                              className="w-4 h-4 rounded-full shrink-0"
                              style={{ backgroundColor: 'var(--doodle-blue)' }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate" style={{color: 'var(--doodle-ink)'}}>{subject}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {challengeSettings.selectedSubjects.length === 0 && (
                  <p className="text-sm mt-3" style={{  color: 'var(--doodle-secondary)'}}>
                    No subjects selected - all subjects will be included
                  </p>
                )}
              </div>

              {/* Exam Types */}
              {challengeSettings.selectedSubjects.length > 0 && availableExamTypes.length > 0 && (
                <div>
                  <h3 className="text-xl mb-4" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                    Exam Types ({challengeSettings.selectedExamTypes.length === 0 ? 'All' : challengeSettings.selectedExamTypes.length} selected)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {availableExamTypes.map(examType => (
                      <label key={examType} className="doodle-radio">
                        <input
                          type="checkbox"
                          checked={challengeSettings.selectedExamTypes.includes(examType)}
                          onChange={(e) => {
                            const newExamTypes = e.target.checked
                              ? [...challengeSettings.selectedExamTypes, examType]
                              : challengeSettings.selectedExamTypes.filter(e => e !== examType);
                            handleChallengeSettingsChange('selectedExamTypes', newExamTypes);
                          }}
                        />
                        <div className="doodle-radio-custom" style={{
                          borderRadius: '4px',
                          transform: `rotate(${getRandomRotation()}deg)`
                        }}></div>
                        <span className="doodle-radio-label">{examType}</span>
                      </label>
                    ))}
                  </div>
                  {challengeSettings.selectedExamTypes.length === 0 && (
                    <p className="text-sm mt-3" style={{  color: 'var(--doodle-secondary)'}}>
                      No exam types selected - all available exam types will be included
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {challengeSettings.selectedSubjects.length > 0 && availableTags.length > 0 && (
                <div>
                  <h3 className="text-xl mb-4" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                    Topics ({challengeSettings.selectedTags.length === 0 ? 'All' : challengeSettings.selectedTags.length} selected)
                  </h3>
                  {/* Searchable Dropdown */}
                  <TagDropdown
                    availableTags={availableTags}
                    selectedTags={challengeSettings.selectedTags}
                    setSelectedTags={tags => handleChallengeSettingsChange('selectedTags', tags)}
                  />
                  {challengeSettings.selectedTags.length === 0 && (
                    <p className="text-sm mt-3" style={{  color: 'var(--doodle-secondary)'}}>
                      No topics selected - all available topics will be included
                    </p>
                  )}
                </div>
              )}

              {/* Difficulty Range */}
              <div className="text-left">
                <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                  Difficulty Range: {challengeSettings.difficultyRange.min} - {challengeSettings.difficultyRange.max}
                </label>
                {/* <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center' }}> */}
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  {/* Min Difficulty Slider */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{ minWidth: '30px' }}>Min:</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={challengeSettings.difficultyRange.min}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value);
                        const currentMax = challengeSettings.difficultyRange.max;
                        handleChallengeSettingsChange('difficultyRange', {
                          min: newMin,
                          max: Math.max(newMin, currentMax) // Ensure max is never less than min
                        });
                      }}
                      style={{ flex: 1 }}
                    />
                    <span style={{ minWidth: '30px' }}>{challengeSettings.difficultyRange.min}</span>
                  </div>

                  {/* Max Difficulty Slider */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{ minWidth: '30px' }}>Max:</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={challengeSettings.difficultyRange.max}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value);
                        const currentMin = challengeSettings.difficultyRange.min;
                        handleChallengeSettingsChange('difficultyRange', {
                          min: Math.min(currentMin, newMax), // Ensure min is never greater than max
                          max: newMax
                        });
                      }}
                      style={{ flex: 1 }}
                    />
                    <span style={{ minWidth: '30px' }}>{challengeSettings.difficultyRange.max}</span>
                  </div>
                </div>
              </div>
            </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
                  onClick={startChallenge}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="doodle-spinner" style={{ margin: '0 auto' }}></div>
                  ) : (
                    <>
                      Start Challenge
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="doodle-btn flex-1 flex items-center justify-center gap-2"
                    onClick={goToHome}
                    style={{background: 'var(--doodle-sketch)', color: 'white'}}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Arena
                  </button>
                  <button
                    className="doodle-btn flex-1 flex items-center justify-center gap-2"
                    onClick={() => setShowRules(true)}
                    style={{background: 'var(--doodle-blue)', color: 'white'}}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to Play
                  </button>
                  
                </div>
              </div>
          </div>

          {/* Right Side - Doodle Solo Character */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          maxWidth: '500px'
        }}>
          <img 
            src="/doodiesolo.png" 
            alt="Doodle Solo" 
            style={{ 
              animation: 'bounce 2s infinite', 
              width: '100%', 
              maxWidth: '400px',
              height: 'auto'
            }} 
          />
          
          {/* Message Bubble */}
          <div style={{
            background: 'white',
            border: '3px solid var(--doodle-ink)',
            borderRadius: '20px',
            padding: '20px 30px',
            boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.2)',
            transform: 'rotate(1deg)',
            maxWidth: '350px',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--doodle-ink)',
              lineHeight: 1.4
            }}>
             CHALLENGE YOURSELF! 
              <br />
              <span style={{ color: '#6c5ce7' }}>GO SOLO!</span>
            </p>
          </div>
        </div>
        </div>
      </div>
      
      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">How to Play Solo Challenge</h2>
                <button
                  onClick={() => setShowRules(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🎯 Objective</h3>
                  <p>Test your knowledge by completing a customized solo challenge with questions tailored to your preferences!</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">⚙️ Setup</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Question Count:</strong> Choose how many questions you want (5-50)</li>
                    <li><strong>Subjects:</strong> Select one or more subjects to test yourself on</li>
                    <li><strong>Exam Types:</strong> Filter by specific exam formats (JEE, GATE, etc.)</li>
                    <li><strong>Difficulty:</strong> Set minimum and maximum difficulty levels (1-10)</li>
                    <li><strong>Tags:</strong> Narrow down to specific topics or concepts</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🎮 Gameplay</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Answer questions one by one at your own pace</li>
                    <li>No time pressure - focus on accuracy</li>
                    <li>Select your answer and click "Submit Answer"</li>
                    <li>Immediate feedback after each question</li>
                    <li>Track your progress as you go</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Scoring</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>+10 points</strong> for each correct answer</li>
                    <li>No penalty for wrong answers</li>
                    <li>Bonus points for faster completion times</li>
                    <li>Time bonus decreases as you take longer</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📈 Results</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>View your final score and total time</li>
                    <li>See correct vs incorrect answer breakdown</li>
                    <li>Review performance by subject</li>
                    <li>Check your accuracy percentage</li>
                    <li>Results are saved to your profile</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Tips</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Start with fewer questions to warm up</li>
                    <li>Select familiar subjects first</li>
                    <li>Use difficulty filters to match your skill level</li>
                    <li>Take your time - accuracy matters more than speed</li>
                    <li>Review results to identify improvement areas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🏆 Challenge Yourself</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Try increasing difficulty levels as you improve</li>
                    <li>Mix multiple subjects for variety</li>
                    <li>Attempt longer challenges (30-50 questions)</li>
                    <li>Track your improvement over time</li>
                    <li>Compete with your own high scores</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="doodle-btn doodle-btn-secondary w-full mt-8 px-6 py-4"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  // Results screen
  if (showResults) {
    // Good performance if accuracy >= 70% or score >= 500
    const totalQuestions = correctCount + incorrectCount;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const isGoodPerformance = accuracy >= 70 || score >= 500;
    
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
          {/* Left Side - Stats */}
          <div style={{
            flex: '1 1 400px',
            minWidth: '300px',
            maxWidth: '500px'
          }}>
            <div className="doodle-paper" style={{
              padding: '30px',
              border: '4px solid var(--doodle-ink)',
              borderRadius: '25px',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
              transform: 'rotate(-1deg)',
              textAlign: 'center'
            }}>
              <div className="doodle-avatar" style={{ marginBottom: '15px', margin: '0 auto 15px' }}>
                <DoodleIcons.Trophy size={40} color="#fff" />
              </div>

              <h1 className="doodle-title" style={{
                fontSize: '2rem',
                marginBottom: '10px',
                fontFamily: 'Architects Daughter, cursive',
                color: 'var(--doodle-ink)'
              }}>
                {isGoodPerformance ? '🎉 Great Job!' : 'Challenge Complete!'}
              </h1>

              {/* Score Display */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{
                   
                  fontSize: '1.5rem',
                  color: 'var(--doodle-green)',
                  marginBottom: '20px'
                }}>
                  Final Score: {score} points
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="doodle-card" style={{ padding: '15px', transform: 'rotate(-2deg)' }}>
                    <DoodleIcons.Target size={25} color="var(--doodle-green)" />
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>
                        {correctCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--doodle-secondary)' }}>
                        Correct
                      </div>
                    </div>
                  </div>

                  <div className="doodle-card" style={{ padding: '15px', transform: 'rotate(1deg)' }}>
                    <DoodleIcons.Timer size={25} color="var(--doodle-blue)" />
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
                        {formatTime(timeElapsed)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--doodle-secondary)' }}>
                        Time Taken
                      </div>
                    </div>
                  </div>

                  <div className="doodle-card" style={{ padding: '15px', transform: 'rotate(-1deg)' }}>
                    <span style={{ fontSize: '25px', color: 'var(--doodle-accent)' }}>✗</span>
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--doodle-accent)' }}>
                        {incorrectCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--doodle-secondary)' }}>
                        Incorrect
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="doodle-btn doodle-btn-primary"
                  style={{ flex: '1 1 auto', padding: '10px 20px', minWidth: '140px' }}
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
                  <DoodleIcons.Lightning size={18} style={{ marginRight: '8px' }} />
                  Try Again
                </button>

                <button
                  className="doodle-btn"
                  onClick={viewLeaderboard}
                  style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)', flex: '1 1 auto', padding: '10px 20px', minWidth: '140px' }}
                >
                  <DoodleIcons.Trophy size={18} style={{ marginRight: '8px' }} />
                  Leaderboard
                </button>

                <button
                  className="doodle-btn"
                  onClick={goToHome}
                  style={{ background: 'var(--doodle-sketch)', color: 'white', flex: '1 1 auto', padding: '10px 20px', minWidth: '140px' }}
                >
                  <DoodleIcons.Home size={18} style={{ marginRight: '8px' }} />
                  Home
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
          }}
          className="hidden md:flex">
            <img 
              src={isGoodPerformance ? '/doodiegameoverhappy.png' : '/doodiegameoversad.png'}
              alt={isGoodPerformance ? 'Happy Doodle' : 'Sad Doodle'}
              style={{ 
                width: '100%', 
                maxWidth: '350px',
                height: 'auto',
                transform: 'rotate(2deg)',
                filter: 'drop-shadow(8px 8px 12px rgba(0, 0, 0, 0.2))'
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
                    WELL DONE! 🎉
                    <br />
                    <span style={{ color: '#6c5ce7' }}>CHALLENGE CONQUERED!</span>
                  </>
                ) : (
                  <>
                    NOT BAD! 💪
                    <br />
                    <span style={{ color: '#6c5ce7' }}>TRY AGAIN!</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Challenge screen
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
      padding: '20px',
       
      position: 'relative'
    }}>
      {/* Top Left - Exit Game Button */}
      <button
        onClick={() => navigate('/home')}
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

      <div style={{ 
        maxWidth: '1000px', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {/* Header Card */}
        <div className="doodle-card" style={{
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '1.5rem',
            color: 'var(--doodle-ink)',
            margin: 0
          }}>
            Solo Challenge
          </h2>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <div className="doodle-badge" style={{
              background: 'var(--doodle-blue)',
              padding: '8px 15px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Q {currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            
            <div className="doodle-badge" style={{
              background: 'var(--doodle-green)',
              padding: '8px 15px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <DoodleIcons.Timer size={18} />
              {formatTime(timeElapsed)}
            </div>
          </div>
        </div>

        {questions.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '15px',
            alignItems: 'start'
          }}>
            {/* Left Side - Question & Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Question Card */}
              <div className="doodle-card" style={{ 
                padding: '25px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.2)',
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <h3 style={{
                   
                  fontSize: '1.2rem',
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  {questions[currentQuestionIndex].question}
                </h3>
              </div>

              {/* Answer Options */}
              <div className="doodle-card" style={{
                padding: '20px',
                boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)',
                flex: 1
              }}>
                <h4 style={{
                   
                  color: 'var(--doodle-ink)',
                  marginBottom: '15px',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  📝 Select your answer:
                </h4>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <label 
                      key={index} 
                      className="doodle-radio"
                      style={{
                        padding: '15px',
                        border: selectedAnswer === index ? '3px solid var(--doodle-blue)' : '3px solid var(--doodle-sketch)',
                        borderRadius: '12px',
                        background: selectedAnswer === index ? '#e0f2fe' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <input
                        type="radio"
                        name="answer"
                        checked={selectedAnswer === index}
                        onChange={() => handleAnswerSelect(index)}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '3px solid var(--doodle-ink)',
                        background: selectedAnswer === index ? 'var(--doodle-blue)' : 'white',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selectedAnswer === index && (
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'white'
                          }} />
                        )}
                      </div>
                      <span style={{ 
                        fontSize: '1rem',
                         
                        flex: 1,
                        fontWeight: selectedAnswer === index ? '600' : '400'
                      }}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Actions & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
              {/* Progress Bar */}
              <div className="doodle-card" style={{
                padding: '12px 20px',
                boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  <span>Progress</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="doodle-progress" style={{ height: '12px' }}>
                  <div
                    className="doodle-progress-fill"
                    style={{ 
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="doodle-card" style={{
                padding: '20px',
                boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <button
                  className="doodle-btn doodle-btn-primary"
                  disabled={selectedAnswer === null}
                  onClick={submitAnswer}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Next Question →
                    </>
                  ) : (
                    <>
                      Finish Challenge ✓
                    </>
                  )}
                </button>

                <button
                  className="doodle-btn"
                  onClick={goToHome}
                  style={{ 
                    background: 'var(--doodle-accent)', 
                    // color: 'white',
                    width: '100%',
                    padding: '12px'
                  }}
                >
                  Quit Challenge
                </button>
              </div>

              {/* Quick Stats */}
              <div className="doodle-card" style={{
                padding: '20px',
                boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)',
                background: 'wheat'
              }}>
                <h4 style={{
                  fontFamily: 'Architects Daughter, cursive',
                  fontSize: '1rem',
                  marginBottom: '15px',
                  color: 'var(--doodle-ink)'
                }}>
                  📊 Quick Stats
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Answered:</span>
                    <strong>{currentQuestionIndex} / {questions.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Remaining:</span>
                    <strong>{questions.length - currentQuestionIndex}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Time:</span>
                    <strong>{formatTime(timeElapsed)}</strong>
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="doodle-card" style={{
                padding: '15px',
                boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                textAlign: 'center'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--doodle-ink)'
                }}>
                  {currentQuestionIndex < questions.length / 2 
                    ? "💪 Keep going!"
                    : currentQuestionIndex < questions.length - 1
                    ? "🔥 Almost there!"
                    : "🏁 Final question!"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">How to Play Solo Challenge</h2>
                <button
                  onClick={() => setShowRules(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🎯 Objective</h3>
                  <p>Test your knowledge by completing a customized solo challenge with questions tailored to your preferences!</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🎮 Gameplay</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Answer questions one by one at your own pace</li>
                    <li>No time pressure - focus on accuracy</li>
                    <li>Select your answer and click "Submit Answer"</li>
                    <li>Immediate feedback after each question</li>
                    <li>Track your progress as you go</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Scoring</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>+10 points</strong> for each correct answer</li>
                    <li>No penalty for wrong answers</li>
                    <li>Bonus points for faster completion times</li>
                    <li>Time bonus decreases as you take longer</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Tips</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Take your time - accuracy matters more than speed</li>
                    <li>Read each question carefully</li>
                    <li>Review your progress in the Quick Stats panel</li>
                    <li>Stay motivated and keep going!</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="doodle-btn doodle-btn-secondary w-full mt-8 px-6 py-4"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: '2fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .doodle-card {
            padding: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default SoloChallenge;


