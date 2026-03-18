/**
 * Dragon Out Game
 * Fast-paced survival game where players answer questions to survive dragon attacks
 * Each colored dragon/obstacle corresponds to a topic
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../../question-bank/services/api';
import gamesAPI from '../services/gamesAPI';
import MathJaxContent from '../../../shared/components/ui/MathJaxContent';
import { checkAnswer, normalizeCorrectAnswer } from '../../../shared/utils/answerNormalization';

// Color palette for topics
const TOPIC_COLORS = [
  { primary: '#EF4444', secondary: '#FCA5A5', glow: '#FEE2E2', name: 'Red' },      // Red
  { primary: '#3B82F6', secondary: '#93C5FD', glow: '#DBEAFE', name: 'Blue' },     // Blue
  { primary: '#10B981', secondary: '#6EE7B7', glow: '#D1FAE5', name: 'Green' },    // Green
  { primary: '#F59E0B', secondary: '#FCD34D', glow: '#FEF3C7', name: 'Amber' },    // Amber
  { primary: '#8B5CF6', secondary: '#C4B5FD', glow: '#EDE9FE', name: 'Purple' },   // Purple
  { primary: '#EC4899', secondary: '#F9A8D4', glow: '#FCE7F3', name: 'Pink' }      // Pink
];

const DragonOutGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gameLoopRef = useRef(null);
  
  // Game states
  const [gameState, setGameState] = useState('menu'); // 'menu', 'loading', 'playing', 'paused', 'gameover'
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topicColors, setTopicColors] = useState({});
  const [questionsByTopic, setQuestionsByTopic] = useState({});
  const [usedQuestions, setUsedQuestions] = useState({});
  
  // Player state
  const [playerHealth, setPlayerHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  
  // Game objects
  const [dragons, setDragons] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(0.2);
  const [answerFeedback, setAnswerFeedback] = useState(null); // 'correct', 'incorrect', or null
  
  // Game settings (customizable)
  const [initialSpeed, setInitialSpeed] = useState(0.2); // 0.1-0.5, default 0.2 (recommended)
  const [spawnRate, setSpawnRate] = useState(0.1); // 0.1-0.5, default 0.1 (recommended)
  const [examType, setExamType] = useState('JEE'); // JEE or GATE

  // Stats
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    dragonsDefeated: 0,
    highScore: 0
  });
  const [showRules, setShowRules] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [resultsSaved, setResultsSaved] = useState(false);

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  // Reload topics when exam type changes
  useEffect(() => {
    loadTopics();
    setSelectedTopics([]); // Clear selected topics when exam type changes
  }, [examType]);

  const loadTopics = async () => {
    try {
      const topics = await quizService.getTopics(null, examType);
      setAvailableTopics(topics.filter(t => t.count >= 5)); // Only topics with 5+ questions
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const handleTopicSelection = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else if (selectedTopics.length < 6) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const startGame = async () => {
    if (selectedTopics.length < 2) {
      alert('Please select at least 2 topics to start the game!');
      return;
    }

    if (selectedTopics.length > 6) {
      alert('Maximum 6 topics allowed! Please deselect some topics.');
      return;
    }

    setGameState('loading');
    try {
      // Assign colors to topics
      const colors = {};
      selectedTopics.forEach((topic, index) => {
        colors[topic] = TOPIC_COLORS[index % TOPIC_COLORS.length];
      });
      setTopicColors(colors);

      // Fetch questions
      const data = await gamesAPI.startDragonOut(selectedTopics, 10, examType);
      setQuestionsByTopic(data.questionsByTopic);
      
      // Initialize used questions tracker
      const used = {};
      selectedTopics.forEach(topic => {
        used[topic] = [];
      });
      setUsedQuestions(used);
      
      // Reset game state
      setPlayerHealth(100);
      setScore(0);
      setLevel(1);
      setDragons([]);
      
      // Set initial game speed based on user selection (0.1-0.5)
      setGameSpeed(initialSpeed);
      setGameStartTime(Date.now());
      setResultsSaved(false);
      
      setGameState('playing');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
      setGameState('menu');
    }
  };

  const spawnDragon = useCallback(() => {
    const topic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
    const color = topicColors[topic];
    
    setDragons(prev => [...prev, {
      id: Date.now() + Math.random(),
      topic,
      color,
      x: 800,
      y: 100 + Math.random() * 300,
      size: 40,
      answered: false
    }]);
  }, [selectedTopics, topicColors]);

  const showQuestionForDragon = useCallback((dragon) => {
    const topicQuestions = questionsByTopic[dragon.topic] || [];
    const unused = topicQuestions.filter(q => 
      !usedQuestions[dragon.topic]?.includes(q.id)
    );
    
    if (unused.length === 0) return; // No more questions
    
    const question = unused[Math.floor(Math.random() * unused.length)];
    setCurrentQuestion({
      ...question,
      dragonId: dragon.id,
      topic: dragon.topic
    });
  }, [questionsByTopic, usedQuestions]);

  const handleWrongAnswer = useCallback(() => {
    setPlayerHealth(prev => Math.max(0, prev - 15));
    setStats(prev => ({
      ...prev,
      questionsAnswered: prev.questionsAnswered + 1
    }));
    
    setCurrentQuestion(null);
  }, []);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update dragons
    setDragons(prevDragons => {
      const updated = prevDragons.map(dragon => ({
        ...dragon,
        x: dragon.x - gameSpeed
      }));

      // Remove off-screen dragons and handle unanswered dragons that passed
      const onScreen = updated.filter(d => {
        if (d.x < 0 && !d.answered) {
          // Dragon passed without being answered - take damage
          setPlayerHealth(prev => Math.max(0, prev - 10));
          return false; // Remove dragon
        }
        return d.x > -100;
      });

      return onScreen;
    });

    // Spawn new dragons - use spawnRate directly (0.1-0.5 range)
    if (dragons.length === 0 || Math.random() < spawnRate / 100 + (level * 0.001)) {
      spawnDragon();
    }

    // Level up
    if (score > 0 && score % 500 === 0 && score !== stats.highScore) {
      setLevel(prev => prev + 1);
      setGameSpeed(prev => Math.min(prev + 0.5, 8));
    }

    // Game over
    if (playerHealth <= 0) {
      setGameState('gameover');
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, [gameState, gameSpeed, level, playerHealth, score, stats.highScore, dragons.length, spawnDragon, spawnRate]);

  // Save game results when game ends
  useEffect(() => {
    if (gameState === 'gameover' && !resultsSaved) {
      saveGameResults();
    }
  }, [gameState, resultsSaved]);

  const saveGameResults = async () => {
    if (resultsSaved) return; // Prevent duplicate saves
    setResultsSaved(true);
    
    const timeSpent = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
    const won = score >= 500 && stats.dragonsDefeated >= 10;
    const completed = stats.dragonsDefeated >= 5;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('No auth token, skipping save');
        return;
      }
      
      await fetch(`${API_BASE_URL}/api/games/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameType: 'dragon-out',
          score,
          level,
          questionsAnswered: stats.questionsAnswered,
          correctAnswers: stats.correctAnswers,
          accuracy: stats.questionsAnswered > 0 ? (stats.correctAnswers / stats.questionsAnswered) * 100 : 0,
          timeSpent,
          completed,
          won,
          gameSpecificData: {
            dragonsDefeated: stats.dragonsDefeated,
            dragonsEscaped: 0,
            finalHealth: playerHealth
          }
        })
      });
      
      console.log('Dragon Out game results saved successfully');
    } catch (error) {
      console.error('Failed to save Dragon Out game result:', error);
    }
  };

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        updateGame();
      }, 1000 / 60); // 60 FPS

      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameState, updateGame]);

  const checkAnswer = useCallback((userAnswer, correctAnswer, questionType) => {
    try {
      let parsed = normalizeCorrectAnswer(correctAnswer);

      if (questionType === 'Numerical' || questionType === 'NAT' || questionType === 'Integer') {
        const userNum = parseFloat(userAnswer);
        const correctNum = parseFloat(parsed);
        if (isNaN(userNum) || isNaN(correctNum)) return false;
        const tolerance = Math.max(Math.abs(correctNum) * 0.02, 0.01);
        return Math.abs(userNum - correctNum) <= tolerance;
      } else {
        return String(userAnswer).trim().toUpperCase() === String(parsed).trim().toUpperCase();
      }
    } catch {
      return false;
    }
  }, []);

  const handleAnswer = useCallback((answer) => {
    if (!currentQuestion) return;

    const isCorrect = checkAnswer(answer, currentQuestion.correctAnswer, currentQuestion.type);
    
    // Show feedback immediately
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      // Correct answer - destroy dragon and gain points
      setDragons(prev => prev.filter(d => d.id !== currentQuestion.dragonId));
      setScore(prev => prev + (currentQuestion.marksPositive || 4) * 10);
      setStats(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + 1,
        dragonsDefeated: prev.dragonsDefeated + 1
      }));
      
      // Mark question as used
      setUsedQuestions(prev => ({
        ...prev,
        [currentQuestion.topic]: [...(prev[currentQuestion.topic] || []), currentQuestion.id]
      }));
    } else {
      handleWrongAnswer();
    }

    // Close question after showing feedback
    setTimeout(() => {
      setCurrentQuestion(null);
      setAnswerFeedback(null);
    }, 1500);
  }, [currentQuestion, checkAnswer, handleWrongAnswer]);

  // Handle dragon clicks
  const handleCanvasClick = (e) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check if click hit any dragon
    for (const dragon of dragons) {
      if (dragon.answered) continue;
      
      const dx = clickX - dragon.x;
      const dy = clickY - dragon.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if click is within dragon's radius
      if (distance <= 2 * dragon.size) {
        // Reset answer feedback when switching to a new question
        setAnswerFeedback(null);
        showQuestionForDragon(dragon);
        break;
      }
    }
  };

  // Canvas rendering
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const render = () => {
        // Clear canvas
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, 0, 800, 500);
        
        // Draw background grid
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        for (let i = 0; i < 800; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 500);
          ctx.stroke();
        }
        for (let i = 0; i < 500; i += 40) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(800, i);
          ctx.stroke();
        }

        // Draw dragons
        dragons.forEach(dragon => {
          // Dragon body
          ctx.fillStyle = dragon.color.primary;
          ctx.shadowBlur = 15;
          ctx.shadowColor = dragon.color.glow;
          
          // Main body
          ctx.beginPath();
          ctx.arc(dragon.x, dragon.y, dragon.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          
          // Head
          ctx.beginPath();
          ctx.arc(dragon.x - dragon.size * 0.4, dragon.y - dragon.size * 0.3, dragon.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
          
          // Fangs
          ctx.fillStyle = dragon.color.secondary;
          ctx.beginPath();
          ctx.moveTo(dragon.x - dragon.size * 0.5, dragon.y - dragon.size * 0.2);
          ctx.lineTo(dragon.x - dragon.size * 0.6, dragon.y);
          ctx.lineTo(dragon.x - dragon.size * 0.4, dragon.y - dragon.size * 0.1);
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(dragon.x - dragon.size * 0.3, dragon.y - dragon.size * 0.2);
          ctx.lineTo(dragon.x - dragon.size * 0.4, dragon.y);
          ctx.lineTo(dragon.x - dragon.size * 0.2, dragon.y - dragon.size * 0.1);
          ctx.fill();
          
          // Eyes
          ctx.fillStyle = '#000';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(dragon.x - dragon.size * 0.5, dragon.y - dragon.size * 0.4, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Topic label
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(dragon.topic.substring(0, 12), dragon.x, dragon.y + dragon.size + 10);
          
          // Add hover effect indicator (cursor will show it's clickable)
          if (!dragon.answered) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(dragon.x, dragon.y, dragon.size * 0.8, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
        
        ctx.shadowBlur = 0;
        
        animationRef.current = requestAnimationFrame(render);
      };

      render();

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [gameState, dragons]);

  // Render functions
  const renderMenu = () => (
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
            <h1 className="doodle-title text-4xl mb-3" >Dragon Out!</h1>
            <p className="doodle-subtitle text-lg mb-8" >
              Survive the dragon attack by answering questions in time!
            </p>
          </div>

            {/* Exam Type Selector */}
            <div className="mb-8">
              <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Exam Type</label>
              <select
                className="doodle-input w-full max-w-md mx-auto"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                <option value="JEE">JEE (Joint Entrance Examination)</option>
                <option value="GATE">GATE (Graduate Aptitude Test)</option>
              </select>
            </div>

            <div className="mb-8">
              <h3 className="text-xl mb-4" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Select Topics (Min 2, Max 6)</h3>
              <p className="text-sm mb-4" style={{  color: 'var(--doodle-secondary)'}}>Each topic will have a different colored dragon</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-2 rounded-lg" style={{background: 'var(--doodle-paper)'}}>
                {availableTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.name);
                  const color = TOPIC_COLORS[selectedTopics.indexOf(topic.name)] || TOPIC_COLORS[0];
                  
                  return (
                    <button
                      key={topic.name}
                      onClick={() => handleTopicSelection(topic.name)}
                      disabled={!isSelected && selectedTopics.length >= 6}
                      className={`doodle-card p-3 transition-all text-left ${
                        isSelected
                          ? 'shadow-lg scale-105'
                          : 'hover:shadow-md'
                      }`}
                      style={isSelected ? {
                        backgroundColor: color.glow,
                        borderColor: color.primary
                      } : {}}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color.primary }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate" style={{color: 'var(--doodle-ink)'}}>{topic.name}</div>
                          {/* <div className="text-xs" style={{color: 'var(--doodle-secondary)'}}>{topic.count} questions</div> */}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* {selectedTopics.length > 0 && (
              <div className={`mb-6 doodle-card p-4 ${selectedTopics.length < 2 ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-gradient-to-r from-blue-50 to-cyan-50'}`} style={{borderColor: selectedTopics.length < 2 ? 'var(--doodle-accent)' : 'var(--doodle-blue)'}}>
                <p className="text-sm" style={{color: selectedTopics.length < 2 ? 'var(--doodle-accent)' : 'var(--doodle-blue)',  }}>
                  <strong>{selectedTopics.length}</strong> topic{selectedTopics.length > 1 ? 's' : ''} selected
                  {selectedTopics.length < 2 && ' (Select at least 2 to start)'}
                </p>
              </div>
            )} */}

            {/* Game Settings */}
            <div className="mb-6 space-y-6">
              {/* <h3 className="text-lg mb-4" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Game Settings</h3> */}
              
              <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Dragon Movement Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                      Dragon Movement Speed
                    </label>
                    <span className="text-sm font-bold" style={{color: 'var(--doodle-blue)'}}>
                      {initialSpeed.toFixed(1)} {initialSpeed === 0.2 && '(Recommended)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.1"
                    value={initialSpeed}
                    onChange={(e) => setInitialSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{color: 'var(--doodle-secondary)',  }}>
                    <span>Slower (0.1)</span>
                    <span>Faster (0.5)</span>
                  </div>
                </div>

                {/* Dragon Spawn Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                      Dragon Spawn Rate
                    </label>
                    <span className="text-sm font-bold" style={{color: 'var(--doodle-blue)'}}>
                      {spawnRate.toFixed(1)} {spawnRate === 0.1 && '(Recommended)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.1"
                    value={spawnRate}
                    onChange={(e) => setSpawnRate(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{color: 'var(--doodle-secondary)',  }}>
                    <span>Less Frequent (0.1)</span>
                    <span>More Frequent (0.5)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={startGame}
                disabled={selectedTopics.length === 0}
                className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
              >
                Start Game
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => navigate('/home')}
                  className="doodle-btn flex-1 flex items-center justify-center gap-2" style={{background: 'var(--doodle-sketch)', color: 'white'}}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Arena
                </button>
                <button
                  onClick={() => setShowRules(true)}
                  className="doodle-btn flex-1 flex items-center justify-center gap-2" style={{background: 'var(--doodle-blue)', color: 'white'}}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Play
                </button>
                
              </div>
            </div>
          </div>

        {/* Right Side - Doodle Dragon Character */}
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
            src="/doodiedragon.png" 
            alt="Doodle Dragon" 
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
              DEFEAT THE DRAGONS!
              <br />
              <span style={{ color: '#6c5ce7' }}>TAP & ANSWER FAST!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xl font-semibold">Loading Questions...</p>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game HUD */}
        <div className="doodle-paper p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setGameState('paused')}
                className="doodle-btn btn-sm" style={{background: 'var(--doodle-blue)', color: 'white'}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                Pause
              </button>
              
              {/* Health Bar */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <div className="w-48 h-4 rounded-full overflow-hidden" style={{backgroundColor: '#cbd5e1', border: '2px solid var(--doodle-ink)'}}>
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-300"
                    style={{ width: `${playerHealth}%` }}
                  />
                </div>
                <span className="font-bold" style={{color: 'var(--doodle-ink)',  }}>{playerHealth}%</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  setGameState('paused');
                  setShowRules(true);
                }}
                className="doodle-btn btn-sm"
                style={{background: 'var(--doodle-blue)', color: 'white'}}
                title="How to Play"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{color: 'var(--doodle-yellow)',  }}>{score}</div>
                <div className="text-xs" style={{color: 'var(--doodle-secondary)',  }}>Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{color: 'var(--doodle-blue)',  }}>{level}</div>
                <div className="text-xs" style={{color: 'var(--doodle-secondary)',  }}>Level</div>
              </div>
            </div>
          </div>

          {/* Topic Legend */}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTopics.map(topic => {
              const color = topicColors[topic];
              return (
                <div 
                  key={topic}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: color.primary,   }}
                >
                  {topic}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <div className="doodle-paper overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                onClick={handleCanvasClick}
                className="w-full cursor-pointer"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <div className="mt-2 text-center text-sm text-gray-400">
              Click on a dragon to answer its question
            </div>
          </div>

          {/* Question Panel */}
          <div className="lg:col-span-1">
            {currentQuestion ? (
              <div 
                className="doodle-paper p-6 animate-slideIn"
                style={{ 
                  borderLeft: `4px solid ${topicColors[currentQuestion.topic]?.primary}`,
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}
              >
                {/* Answer Feedback Indicator */}
                {answerFeedback && (
                  <div 
                    className={`mb-4 doodle-card p-4 flex items-center justify-center gap-2 font-bold text-lg animate-pulse ${
                      answerFeedback === 'correct' 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}
                    style={{
                      backgroundColor: answerFeedback === 'correct' ? '#dcfce7' : '#fee2e2',
                      borderColor: answerFeedback === 'correct' ? '#16a34a' : '#dc2626'
                    }}
                  >
                    {answerFeedback === 'correct' ? (
                      <>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Correct! 🎉</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Incorrect ❌</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ 
                      backgroundColor: topicColors[currentQuestion.topic]?.primary,
                       
                    }}
                  >
                    {currentQuestion.topic}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentQuestion(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Close question"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <MathJaxContent 
                    key={currentQuestion.id}
                    className="text-sm leading-relaxed"
                    style={{color: 'var(--doodle-ink)',  }}
                  >
                    {currentQuestion.statement}
                  </MathJaxContent>
                  
                  {/* Question Images */}
                  {currentQuestion.hasImages && currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {currentQuestion.imageUrls.map((imageUrl, idx) => (
                        <img
                          key={idx}
                          src={imageUrl}
                          alt={`Question image ${idx + 1}`}
                          className="max-w-full h-auto rounded-lg"
                          style={{border: '3px solid var(--doodle-ink)'}}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {currentQuestion.type === 'Numerical' ? (
                  <div>
                    <input
                      type="number"
                      step="any"
                      placeholder="Enter answer"
                      autoFocus
                      disabled={answerFeedback !== null}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !answerFeedback) {
                          handleAnswer(e.target.value);
                        }
                      }}
                      className="doodle-input w-full mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        handleAnswer(input.value);
                      }}
                      disabled={answerFeedback !== null}
                      className="doodle-btn doodle-btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentQuestion.options?.map((option, index) => {
                      const optionLabel = String.fromCharCode(65 + index);
                      const optionText = typeof option === 'string' 
                        ? option 
                        : (option.text?.text || option.text || '');

                      return (
                        <button
                          key={index}
                          onClick={() => !answerFeedback && handleAnswer(optionLabel)}
                          disabled={answerFeedback !== null}
                          className="doodle-card w-full p-3 text-left hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            borderColor: 'var(--doodle-ink)',
                          }}
                        >
                          <div>
                            <span className="font-bold" style={{color: 'var(--doodle-blue)',  }}>{optionLabel}.</span>{' '}
                            <MathJaxContent 
                              key={`${currentQuestion.id}-opt-${index}`}
                              className="inline"
                              inline={true}
                              style={{ }}
                            >
                              {optionText}
                            </MathJaxContent>
                            
                            {/* Option Image */}
                            {(option.image_path || option.image_url) && (
                              <div className="mt-2">
                                <img
                                  src={option.image_path ? `/${option.image_path}` : option.image_url}
                                  alt={`Option ${option.id} diagram`}
                                  className="max-w-full h-auto max-h-32 rounded"
                                  style={{border: '3px solid var(--doodle-ink)'}}
                                  onError={(e) => {
                                    // If local path fails, try original URL
                                    if (option.image_path && option.image_url) {
                                      e.target.src = option.image_url;
                                    } else {
                                      e.target.style.display = 'none';
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚡ Answer quickly for bonus points!
                  </p>
                </div>
              </div>
            ) : (
              <div className="doodle-paper p-6 text-center">
                <div className="mb-4" style={{color: 'var(--doodle-secondary)'}}>
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-semibold" style={{color: 'var(--doodle-ink)',   fontSize: '1.1rem'}}>No Active Question</p>
                  <p className="text-sm mt-2" style={{ }}>Get close to a dragon to receive a question!</p>
                </div>

                <div className="space-y-2 text-sm" style={{color: 'var(--doodle-secondary)',  }}>
                  <div className="flex justify-between">
                    <span>Questions Answered:</span>
                    <span className="font-bold" style={{color: 'var(--doodle-ink)'}}>{stats.questionsAnswered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Correct:</span>
                    <span className="font-bold" style={{color: 'var(--doodle-green)'}}>{stats.correctAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dragons Defeated:</span>
                    <span className="font-bold" style={{color: 'var(--doodle-accent)'}}>{stats.dragonsDefeated}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGameOver = () => {
    // Calculate performance - good if accuracy > 60% or score > 1000
    const accuracy = stats.questionsAnswered > 0 ? (stats.correctAnswers / stats.questionsAnswered) * 100 : 0;
    const isGoodPerformance = accuracy >= 60 || score >= 1000;
    
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
            <div className="doodle-paper animate-fadeIn" style={{
              padding: '30px',
              border: '4px solid var(--doodle-ink)',
              borderRadius: '25px',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
              transform: 'rotate(-1deg)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--doodle-ink)', fontFamily: 'Architects Daughter, cursive'}}>
                  {isGoodPerformance ? '🎉 Great Run!' : 'Game Over!'}
                </h1>
                <p className="text-lg" style={{color: 'var(--doodle-secondary)',  }}>
                  You survived {stats.dragonsDefeated} dragons!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="doodle-card p-4" style={{backgroundColor: '#fef9c3', borderColor: 'var(--doodle-yellow)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-yellow)',  }}>{score}</div>
                  <div className="text-sm" style={{color: '#854d0e',  }}>Final Score</div>
                </div>
                <div className="doodle-card p-4" style={{backgroundColor: '#dbeafe', borderColor: 'var(--doodle-blue)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-blue)',  }}>{level}</div>
                  <div className="text-sm" style={{color: '#1e40af',  }}>Level Reached</div>
                </div>
                <div className="doodle-card p-4" style={{backgroundColor: '#dcfce7', borderColor: 'var(--doodle-green)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-green)',  }}>{stats.correctAnswers}</div>
                  <div className="text-sm" style={{color: '#166534',  }}>Correct Answers</div>
                </div>
                <div className="doodle-card p-4" style={{backgroundColor: '#fee2e2', borderColor: 'var(--doodle-accent)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-accent)',  }}>{stats.dragonsDefeated}</div>
                  <div className="text-sm" style={{color: '#991b1b',  }}>Dragons Defeated</div>
                </div>
              </div>

              {stats.questionsAnswered > 0 && (
                <div className="mb-4 doodle-card p-3" style={{backgroundColor: '#f3e8ff', borderColor: 'var(--doodle-purple)'}}>
                  <p className="text-sm" style={{color: '#6b21a8',  }}>
                    Accuracy: <strong>{Math.round(accuracy)}%</strong>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setGameState('menu');
                    setSelectedTopics([]);
                    setStats({ questionsAnswered: 0, correctAnswers: 0, dragonsDefeated: 0, highScore: Math.max(score, stats.highScore) });
                  }}
                  className="doodle-btn flex-1"
                  style={{background: 'var(--doodle-sketch)', color: 'var(--doodle-ink)'}}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="doodle-btn flex-1"
                  style={{background: 'var(--doodle-purple)', color: 'white'}}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Arena
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
          }}>
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
                    GREAT RUN! 🎉
                    <br />
                    <span style={{ color: '#6c5ce7' }}>YOU'RE CRUSHING IT!</span>
                  </>
                ) : (
                  <>
                    NICE TRY! 💪
                    <br />
                    <span style={{ color: '#6c5ce7' }}>PRACTICE MAKES PERFECT!</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaused = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: 'rgba(0, 0, 0, 0.8)'}}>
      <div className="doodle-paper p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--doodle-ink)', fontFamily: 'Architects Daughter, cursive'}}>Game Paused</h2>
        <p className="mb-6" style={{color: 'var(--doodle-secondary)',  }}>Take a break and come back when you're ready!</p>
        
        <div className="space-y-3">
          <button
            onClick={() => setGameState('playing')}
            className="doodle-btn w-full"
            style={{background: 'var(--doodle-green)', color: 'white'}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Resume Game
          </button>
          <button
            onClick={() => {
              setGameState('menu');
              setSelectedTopics([]);
            }}
            className="doodle-btn w-full"
            style={{background: 'var(--doodle-sketch)', color: 'var(--doodle-ink)'}}
          >
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">How to Play</h2>
            <button
              onClick={() => {
                setShowRules(false);
                if (gameState === 'paused') {
                  setGameState('playing');
                }
              }}
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
              <p>Survive the dragon attack! Answer questions quickly to defeat dragons and stay alive!</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🐉 How Dragons Work</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Each topic has a different colored dragon</li>
                <li>Click on a dragon to see its question</li>
                <li>Dragons move across the screen from right to left</li>
                <li>If a dragon passes without being answered, you lose health!</li>
                <li>Switch between dragons anytime by clicking on another one</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">❤️ Health System</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Start with 100 health points</li>
                <li>Wrong answer: -15 HP</li>
                <li>Dragon passes unanswered: -10 HP</li>
                <li>Game over when health reaches 0</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">✅ Answering Questions</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>MCQ:</strong> Click on the correct option (A, B, C, or D)</li>
                <li><strong>Numerical:</strong> Type the answer and click Submit</li>
                <li>Answer correctly to defeat the dragon and earn points</li>
                <li>Green banner = Correct! Red banner = Incorrect!</li>
                <li>Close button (×) closes question without answering (lose HP)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">⚙️ Game Settings</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Dragon Movement Speed:</strong> How fast dragons move (0.1-0.5)</li>
                <li><strong>Dragon Spawn Rate:</strong> How often new dragons appear (0.1-0.5)</li>
                <li>Recommended: 0.2 for both settings for balanced gameplay</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🎮 Controls</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Click on dragons to open their questions</li>
                <li>Click options or type answers to respond</li>
                <li>Press ESC to pause the game</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Scoring</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Each correct answer earns points</li>
                <li>Higher difficulty = More points</li>
                <li>Try to beat your high score!</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              setShowRules(false);
              if (gameState === 'paused') {
                setGameState('playing');
              }
            }}
            className="doodle-btn doodle-btn-secondary w-full mt-8 px-6 py-4"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="doodle-container min-h-screen">
      {gameState === 'menu' && renderMenu()}
      {gameState === 'loading' && renderLoading()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'gameover' && renderGameOver()}
      {gameState === 'paused' && renderPaused()}
      {showRules && renderRules()}
    </div>
  );
};

export default DragonOutGame;
