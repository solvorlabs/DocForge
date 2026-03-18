/**
 * Endless Runner Game
 * Fast-paced lane-switching game where players answer MCQ questions by choosing the correct lane
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../../question-bank/services/api';
import gamesAPI from '../services/gamesAPI';
import MathJaxContent from '../../../shared/components/ui/MathJaxContent';
import { checkAnswer, normalizeCorrectAnswer, getOptionLetter } from '../../../shared/utils/answerNormalization';

// Lane colors for visual distinction
const LANE_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']; // Red, Blue, Green, Amber
const LANE_LABELS = ['A', 'B', 'C', 'D'];

const EndlessRunnerGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gameLoopRef = useRef(null);
  
  // Game states
  const [gameState, setGameState] = useState('menu'); // 'menu', 'loading', 'playing', 'paused', 'gameover'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // Player state
  const [playerLane, setPlayerLane] = useState(1); // 0-3 for four lanes
  const [playerHealth, setPlayerHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0.3);
  const [distance, setDistance] = useState(0);
  
  // Game objects
  const [gates, setGates] = useState([]);
  const [effects, setEffects] = useState([]); // Visual effects for correct/wrong
  const [answerFeedback, setAnswerFeedback] = useState(null); // 'correct', 'incorrect', or null
  const [questionTimer, setQuestionTimer] = useState(null); // Timer for current question
  
  // Game settings
  const [initialSpeed, setInitialSpeed] = useState(0.3);
  const [showRules, setShowRules] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: '',
    examType: 'JEE', // Default to JEE
    count: 'infinite' // 'infinite' or a number
  });
  
  // Stats
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    gatesPassed: 0,
    distanceTraveled: 0
  });
  
  // Game result tracking
  const [gameStartTime, setGameStartTime] = useState(null);
  const [resultsSaved, setResultsSaved] = useState(false);
  
  // Available filters data
  const [subjects, setSubjects] = useState([]);

  // Load subjects and topics on mount
  useEffect(() => {
    loadFilters();
  }, []);

  // Reload subjects when exam type changes
  useEffect(() => {
    loadFilters();
  }, [filters.examType]);

  const loadFilters = async () => {
    try {
      const subjectsData = await quizService.getSubjects(filters.examType);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const saveGameResults = useCallback(async () => {
    if (resultsSaved || !gameStartTime) return;
    
    try {
      setResultsSaved(true);
      
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);
      const finalDistance = stats.distanceTraveled;
      const correctAnswers = stats.correctAnswers;
      
      // Win criteria: traveled 1000m and answered 20+ questions correctly
      const won = finalDistance >= 1000 && correctAnswers >= 20;
      // Completion criteria: traveled 500m
      const completed = finalDistance >= 500;
      
      await gamesAPI.saveGameResult({
        gameMode: 'endless-runner',
        score: score,
        won: won,
        completed: completed,
        duration: duration,
        gameSpecificData: {
          distanceTraveled: finalDistance,
          questionsAnswered: stats.questionsAnswered,
          correctAnswers: correctAnswers,
          gatesPassed: stats.gatesPassed,
          finalSpeed: speed
        }
      });
      
      console.log('Game results saved successfully');
    } catch (error) {
      console.error('Failed to save game results:', error);
      setResultsSaved(false);
    }
  }, [resultsSaved, gameStartTime, stats, score, speed]);

  const startGame = async () => {
    setGameState('loading');
    try {
      const requestCount = filters.count === 'infinite' ? 100 : filters.count;
      const data = await gamesAPI.startRunner({
        count: requestCount,
        subject: filters.subject || null,
        topic: filters.topic || null,
        difficulty: filters.difficulty || null,
        examType: filters.examType
      });
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setCurrentQuestion(data.questions[0]);
        
        // Reset game state
        setPlayerLane(1);
        setPlayerHealth(100);
        setScore(0);
        setSpeed(initialSpeed);
        setDistance(0);
        setGates([]);
        setEffects([]);
        setStats({
          questionsAnswered: 0,
          correctAnswers: 0,
          gatesPassed: 0,
          distanceTraveled: 0
        });
        
        // Track game start time
        setGameStartTime(Date.now());
        setResultsSaved(false);
        
        // Spawn first gate
        spawnGate(data.questions[0], 800);
        
        setGameState('playing');
      } else {
        throw new Error(data.message || 'No questions available');
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game: ' + error.message);
      setGameState('menu');
    }
  };

  const spawnGate = useCallback((question, xPosition = 1200) => {
    if (!question) return;
    
    // Parse correct answer
    let correctAnswer = question.correctAnswer;
    if (typeof correctAnswer === 'string') {
      correctAnswer = correctAnswer
        .replace(/^\s*\[?\s*["']?\s*/g, '')
        .replace(/\s*["']?\s*\]?\s*$/g, '')
        .trim()
        .toUpperCase();
    }
    
    const correctIndex = correctAnswer.charCodeAt(0) - 65; // A=0, B=1, etc.
    
    // Calculate initial time: distance from player (at x=150) to gate / current speed
    const playerX = 150;
    const distanceToGate = xPosition - playerX;
    const initialTime = Math.ceil(distanceToGate / speed / 60); // Convert from frames to seconds (60 FPS)
    
    setGates(prev => [...prev, {
      id: Date.now() + Math.random(),
      x: xPosition,
      questionId: question.id,
      correctLane: correctIndex,
      passed: false,
      answered: false
    }]);
    
    // Set the countdown timer
    setQuestionTimer(initialTime);
  }, [speed]);

  const addEffect = useCallback((x, y, type, text) => {
    setEffects(prev => [...prev, {
      id: Date.now() + Math.random(),
      x,
      y,
      type, // 'correct', 'wrong'
      text,
      opacity: 1,
      scale: 1
    }]);
  }, []);

  const changeLane = useCallback((direction) => {
    if (gameState !== 'playing') return;
    
    setPlayerLane(prev => {
      if (direction === 'left' && prev > 0) return prev - 1;
      if (direction === 'right' && prev < 3) return prev + 1;
      return prev;
    });
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeLane('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeLane('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (playerLane > 0) setPlayerLane(prev => prev - 1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (playerLane < 3) setPlayerLane(prev => prev + 1);
          break;
        case 'Enter':
          // Instant submit - check current lane against correct answer
          if (currentQuestion && answerFeedback === null) {
            const currentGate = gates.find(g => g.questionId === currentQuestion.id);
            if (currentGate) {
              const isCorrect = playerLane === currentGate.correctLane;
              
              // Show feedback
              setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');
              
              if (isCorrect) {
                // Correct answer!
                const points = 100 + Math.floor(speed * 10) + 50; // Bonus for instant answer
                setScore(prev => prev + points);
                setStats(prev => ({
                  ...prev,
                  questionsAnswered: prev.questionsAnswered + 1,
                  correctAnswers: prev.correctAnswers + 1,
                  gatesPassed: prev.gatesPassed + 1
                }));
                
                const effectX = playerLane * (800 / 4) + (800 / 4) / 2;
                addEffect(effectX, 380, 'correct', `+${points} ⚡`);
                
                setSpeed(prev => Math.min(prev + 0.1, 15));
              } else {
                // Wrong answer!
                setPlayerHealth(prev => Math.max(0, prev - 15));
                setStats(prev => ({
                  ...prev,
                  questionsAnswered: prev.questionsAnswered + 1
                }));
                
                const effectX = playerLane * (800 / 4) + (800 / 4) / 2;
                addEffect(effectX, 380, 'wrong', '-15 HP');
              }
              
              // Remove current gate immediately
              setGates(prevGates => prevGates.filter(g => g.questionId !== currentQuestion.id));
              
              // Clear feedback after delay
              setTimeout(() => {
                setAnswerFeedback(null);
              }, 1000);
              
              // Load next question
              setCurrentQuestionIndex(prevIndex => {
                const isInfiniteMode = filters.count === 'infinite';
                let nextIndex = prevIndex + 1;
                
                if (isInfiniteMode && nextIndex >= questions.length) {
                  nextIndex = 0;
                }
                
                if (nextIndex < questions.length) {
                  setCurrentQuestion(questions[nextIndex]);
                  spawnGate(questions[nextIndex], 1200);
                }
                return nextIndex;
              });
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, playerLane, changeLane, currentQuestion, answerFeedback, gates, speed, questions, filters.count, spawnGate, addEffect]);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update distance
    setDistance(prev => prev + speed);
    setStats(prev => ({ ...prev, distanceTraveled: Math.floor(distance / 10) }));

    // Update gates
    setGates(prevGates => {
      const updated = prevGates.map(gate => ({
        ...gate,
        x: gate.x - speed
      }));

      // Check collision with player
      updated.forEach(gate => {
        if (!gate.answered && gate.x < 100 && gate.x > 50) {
          // Player passing through gate
          gate.answered = true;
          
          const isCorrect = playerLane === gate.correctLane;
          
          // Show feedback immediately
          setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');
          
          if (isCorrect) {
            // Correct answer!
            const points = 100 + Math.floor(speed * 10);
            setScore(prev => prev + points);
            setStats(prev => ({
              ...prev,
              questionsAnswered: prev.questionsAnswered + 1,
              correctAnswers: prev.correctAnswers + 1,
              gatesPassed: prev.gatesPassed + 1
            }));
            
            // Show effect at player's current position
            const effectX = playerLane * (800 / 4) + (800 / 4) / 2;
            addEffect(effectX, 380, 'correct', `+${points}`);
            
            // Speed up slightly
            setSpeed(prev => Math.min(prev + 0.1, 15));
          } else {
            // Wrong answer!
            setPlayerHealth(prev => Math.max(0, prev - 15));
            setStats(prev => ({
              ...prev,
              questionsAnswered: prev.questionsAnswered + 1
            }));
            
            // Show effect at player's current position
            const effectX = playerLane * (800 / 4) + (800 / 4) / 2;
            addEffect(effectX, 380, 'wrong', '-15 HP');
          }
          
          // Clear feedback and load next question after delay
          setTimeout(() => {
            setAnswerFeedback(null);
          }, 1500);
          
          // Load next question
          setCurrentQuestionIndex(prevIndex => {
            const isInfiniteMode = filters.count === 'infinite';
            let nextIndex = prevIndex + 1;
            
            // Loop questions in infinite mode
            if (isInfiniteMode && nextIndex >= questions.length) {
              nextIndex = 0;
            }
            
            if (nextIndex < questions.length) {
              setCurrentQuestion(questions[nextIndex]);
              spawnGate(questions[nextIndex], 1200);
            }
            return nextIndex;
          });
        }
      });

      // Remove off-screen gates
      return updated.filter(g => g.x > -100);
    });

    // Update effects
    setEffects(prevEffects => {
      return prevEffects
        .map(effect => ({
          ...effect,
          y: effect.y - 2,
          opacity: effect.opacity - 0.02,
          scale: effect.scale + 0.02
        }))
        .filter(e => e.opacity > 0);
    });

    // Game over check
    const isInfiniteMode = filters.count === 'infinite';
    if (playerHealth <= 0 || (!isInfiniteMode && currentQuestionIndex >= questions.length)) {
      setGameState('gameover');
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, [gameState, speed, distance, playerLane, playerHealth, currentQuestionIndex, questions, spawnGate, addEffect, filters.count]);

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

  // Question timer - counts down from initial time based on distance to gate
  useEffect(() => {
    if (gameState === 'playing' && currentQuestion && questionTimer !== null) {
      const timerInterval = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [gameState, currentQuestion, questionTimer]);

  // Save game results when game ends
  useEffect(() => {
    if (gameState === 'gameover' && !resultsSaved) {
      saveGameResults();
    }
  }, [gameState, resultsSaved, saveGameResults]);

  // Canvas rendering
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const render = () => {
        // Clear canvas
        const gradient = ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#64748b');
        gradient.addColorStop(1, '#64748b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 500);
        
        const laneWidth = 800 / 4;
        
        // Draw lane backgrounds (Subway Surfers style - top to bottom)
        for (let i = 0; i < 4; i++) {
          const laneGradient = ctx.createLinearGradient(0, 0, 0, 500);
          if (i === playerLane) {
            laneGradient.addColorStop(0, LANE_COLORS[i] + '20');
            laneGradient.addColorStop(1, LANE_COLORS[i] + '30');
          } else {
            laneGradient.addColorStop(0, '#78849a');
            laneGradient.addColorStop(1, '#6b7789');
          }
          ctx.fillStyle = laneGradient;
          ctx.fillRect(i * laneWidth, 0, laneWidth, 500);
        }
        
        // Draw animated lane dividers (moving from top to bottom)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 15]);
        ctx.lineDashOffset = -((distance * 5) % 30);
        
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(i * laneWidth, 0);
          ctx.lineTo(i * laneWidth, 500);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        
        // Draw gates moving from top (y=0) to bottom (y=500)
        // Gates spawn at top and move toward player at bottom
        gates.forEach(gate => {
          // Calculate gate Y position based on timer and gate.x
          // gate.x represents distance, we map it to Y position (0 to 500)
          // When gate.x = 1200 (far), y = 0 (top of screen)
          // When gate.x = 0 (at player), y = 420 (player position)
          const gateY = 500 - (gate.x / 1200) * 480; // Maps 1200->20px, 0->500px
          
          // Only draw if visible
          if (gateY >= -50 && gateY <= 550) {
            // Draw all four lane gates
            for (let i = 0; i < 4; i++) {
              const laneX = i * laneWidth;
              
              // Gate dimensions (fixed size, Subway Surfers style)
              const gateWidth = laneWidth - 20; // Almost full lane width
              const gateHeight = 80;
              
              // Determine if this is the player's lane for collision highlighting
              const isPlayerLane = i === playerLane;
              const isColliding = Math.abs(gateY - 420) < 40 && isPlayerLane;
              
              // Gate background with gradient
              const gateGradient = ctx.createLinearGradient(
                laneX + 10,
                gateY - gateHeight / 2,
                laneX + 10,
                gateY + gateHeight / 2
              );
              
              if (isColliding) {
                // Collision highlight
                gateGradient.addColorStop(0, '#FCD34D');
                gateGradient.addColorStop(0.5, '#F59E0B');
                gateGradient.addColorStop(1, '#D97706');
              } else {
                gateGradient.addColorStop(0, '#64748B');
                gateGradient.addColorStop(0.5, '#475569');
                gateGradient.addColorStop(1, '#334155');
              }
              
              ctx.fillStyle = gateGradient;
              ctx.globalAlpha = 0.9;
              
              // Draw gate rectangle
              ctx.beginPath();
              const cornerRadius = 8;
              ctx.roundRect(
                laneX + 10,
                gateY - gateHeight / 2,
                gateWidth,
                gateHeight,
                cornerRadius
              );
              ctx.fill();
              
              // Gate border
              ctx.strokeStyle = isColliding ? '#FBBF24' : '#1e293b';
              ctx.lineWidth = 3;
              ctx.stroke();
              
              // Inner border for 3D effect
              ctx.strokeStyle = isColliding ? '#FEF3C7' : '#94a3b8';
              ctx.lineWidth = 1;
              ctx.strokeRect(
                laneX + 13,
                gateY - gateHeight / 2 + 3,
                gateWidth - 6,
                gateHeight - 6
              );
              
              ctx.globalAlpha = 1;
              
              // Option label
              const fontSize = 42;
              ctx.fillStyle = isColliding ? '#1e293b' : '#ffffff';
              ctx.font = `bold ${fontSize}px Inter`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              // Strong shadow for label
              if (!isColliding) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#000000';
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
              }
              
              ctx.fillText(LANE_LABELS[i], laneX + laneWidth / 2, gateY);
              
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            }
          }
        });
        
        // Draw player at bottom of screen (Subway Surfers style)
        const playerX = playerLane * laneWidth + laneWidth / 2;
        const playerY = 420; // Near bottom of canvas
        
        // Player shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(playerX, playerY + 40, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Player body with glow
        ctx.fillStyle = '#60A5FA';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#3B82F6';
        
        // Body (larger circle for better visibility)
        ctx.beginPath();
        ctx.arc(playerX, playerY, 28, 0, Math.PI * 2);
        ctx.fill();
        
        // Head (smaller circle on top)
        ctx.beginPath();
        ctx.arc(playerX, playerY - 32, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs (animated running) - 5X faster animation
        const legOffset = Math.sin(distance / 2) * 12;
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#3B82F6';
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(playerX - 6, playerY + 28);
        ctx.lineTo(playerX - 12, playerY + 45 + legOffset);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(playerX + 6, playerY + 28);
        ctx.lineTo(playerX + 12, playerY + 45 - legOffset);
        ctx.stroke();
        
        // Arms
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(playerX - 22, playerY - 5);
        ctx.lineTo(playerX - 28, playerY + 12 - legOffset / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(playerX + 22, playerY - 5);
        ctx.lineTo(playerX + 28, playerY + 12 + legOffset / 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.lineCap = 'butt';
        
        // Draw collision indicator
        gates.forEach(gate => {
          const gateY = 500 - (gate.x / 1200) * 480;
          if (Math.abs(gateY - playerY) < 40) {
            // Draw collision warning circle
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 100) * 0.4; // Pulsing effect
            ctx.beginPath();
            ctx.arc(playerX, playerY, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
        
        // Draw effects (score popups)
        effects.forEach(effect => {
          ctx.globalAlpha = effect.opacity;
          ctx.font = `bold ${28 * effect.scale}px Inter`;
          ctx.textAlign = 'center';
          ctx.fillStyle = effect.type === 'correct' ? '#10B981' : '#EF4444';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
          ctx.strokeText(effect.text, effect.x, effect.y);
          ctx.fillText(effect.text, effect.x, effect.y);
          ctx.globalAlpha = 1;
        });
        
        animationRef.current = requestAnimationFrame(render);
      };

      render();

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [gameState, gates, playerLane, distance, effects]);

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
            <h1 className="doodle-title text-4xl mb-3" >Endless Runner</h1>
            <p className="doodle-subtitle text-lg mb-8" >
              Run through lanes by choosing the correct answer!
            </p>
          </div>

            <div className="mb-8 space-y-4">
              <div className="text-left">
                <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Exam Type</label>
                <select
                  className="doodle-input w-full"
                  value={filters.examType}
                  onChange={(e) => setFilters({ ...filters, examType: e.target.value, subject: '', topic: '' })}
                >
                  <option value="JEE">JEE (Joint Entrance Examination)</option>
                  <option value="GATE">GATE (Graduate Aptitude Test)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="doodle-input w-full"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="text-left">
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    className="doodle-input w-full"
                  >
                    <option value="">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div>
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                    Initial Speed: <strong style={{color: 'var(--doodle-blue)'}}>{initialSpeed.toFixed(1)}</strong> {initialSpeed === 0.3 && '(Recommended)'}
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.1"
                    value={initialSpeed}
                    onChange={(e) => setInitialSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{color: 'var(--doodle-secondary)',  }}>
                    <span>Slower (0.3)</span>
                    <span>Faster (1.0)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                    Questions: <strong style={{color: 'var(--doodle-blue)'}}>{filters.count === 'infinite' ? 'Infinite (Recommended)' : filters.count}</strong>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={filters.count === 'infinite' ? 100 : filters.count}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFilters({ ...filters, count: value === 100 ? 'infinite' : value });
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{color: 'var(--doodle-secondary)',  }}>
                    <span>Limited (10)</span>
                    <span>Infinite ∞</span>
                  </div>
                </div>
              </div>

            </div>

            {/* <div className="mb-6 doodle-card p-4" style={{background: 'linear-gradient(to right, #f3e8ff, #dbeafe)', borderColor: 'var(--doodle-purple)'}}>
              <h3 className="font-semibold mb-2" style={{color: 'var(--doodle-purple)',  }}>Controls</h3>
              <div className="grid grid-cols-2 gap-2 text-sm" style={{color: 'var(--doodle-ink)',  }}>
                <div>← / A - Move Left</div>
                <div>→ / D - Move Right</div>
                <div>↑ / W - Lane Up</div>
                <div>↓ / S - Lane Down</div>
              </div>
            </div> */}

            <div className="flex flex-col gap-3">
              <button
                onClick={startGame}
                className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
              >
                Start Running
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

        {/* Right Side - Doodle Runner Character */}
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
            src="/doodierunner.png" 
            alt="Doodle Runner" 
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
              RUN FAST, THINK FASTER!
              <br />
              <span style={{ color: '#6c5ce7' }}>READY TO RACE?</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="doodle-spinner mx-auto mb-4"></div>
        <p style={{  fontSize: '1.5rem', color: 'var(--doodle-ink)'}}>Loading Questions...</p>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game HUD */}
        <div className="doodle-paper p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                <div className="text-2xl font-bold" style={{color: 'var(--doodle-blue)',  }}>{speed}</div>
                <div className="text-xs" style={{color: 'var(--doodle-secondary)',  }}>Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{color: 'var(--doodle-green)',  }}>{stats.distanceTraveled}m</div>
                <div className="text-xs" style={{color: 'var(--doodle-secondary)',  }}>Distance</div>
              </div>
            </div>
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
                className="w-full"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <div className="mt-2 text-center">
              <div className="inline-flex gap-2 doodle-paper p-2">
                {LANE_LABELS.map((label, idx) => (
                  <div
                    key={label}
                    className={`px-4 py-2 font-bold transition-all ${
                      playerLane === idx 
                        ? 'scale-110' 
                        : ''
                    }`}
                    style={{ 
                      backgroundColor: playerLane === idx ? LANE_COLORS[idx] : '#e2e8f0',
                      color: playerLane === idx ? 'white' : 'var(--doodle-secondary)',
                       
                      border: `2px solid ${playerLane === idx ? LANE_COLORS[idx] : 'var(--doodle-ink)'}`,
                      borderRadius: '8px'
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Panel */}
          <div className="lg:col-span-1">
            {currentQuestion ? (
              <div className="doodle-paper p-6" style={{ maxHeight: '500px', overflowY: 'auto' }}>
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

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded" style={{color: 'var(--doodle-purple)', backgroundColor: '#f3e8ff',  }}>
                      Question {currentQuestionIndex + 1}/{filters.count === 'infinite' ? '∞' : questions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{color: 'var(--doodle-secondary)',  }}>{currentQuestion.topic}</span>
                      {questionTimer !== null && (
                        <span className="text-xs font-bold px-2 py-1 rounded" style={{color: 'var(--doodle-blue)', backgroundColor: '#dbeafe',  }}>
                          ⏱️ {questionTimer}s
                        </span>
                      )}
                    </div>
                  </div>
                  <MathJaxContent className="text-sm leading-relaxed" style={{color: 'var(--doodle-ink)',  }}>
                    {currentQuestion.statement}
                  </MathJaxContent>
                  
                  {/* Question Images */}
                  {currentQuestion.hasImages && currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {currentQuestion.imageUrls.map((imageUrl, idx) => (
                        <img
                          key={idx}
                          src={imageUrl}
                          alt={`Question ${idx + 1}`}
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

                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => {
                    const optionLabel = LANE_LABELS[index];
                    const optionText = typeof option === 'string' 
                      ? option 
                      : (option.text?.text || option.text || '');
                    const laneColor = LANE_COLORS[index];

                    return (
                      <div
                        key={index}
                        className="doodle-card p-3 transition-all"
                        style={{ 
                          borderColor: playerLane === index ? laneColor : 'var(--doodle-ink)',
                          backgroundColor: playerLane === index ? laneColor + '10' : 'transparent'
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <span 
                            className="font-bold text-white px-2 py-1 rounded text-sm"
                            style={{ backgroundColor: laneColor,   }}
                          >
                            {optionLabel}
                          </span>
                          <div className="flex-1">
                            <MathJaxContent 
                              key={`${currentQuestion.id}-opt-${index}`}
                              className="text-sm"
                              inline={true}
                              style={{color: 'var(--doodle-ink)',  }}
                            >
                              {optionText}
                            </MathJaxContent>
                            
                            {/* Option Image */}
                            {(option.image_path || option.image_url) && (
                              <div className="mt-2">
                                <img
                                  src={option.image_path ? `/${option.image_path}` : option.image_url}
                                  alt={`Option ${option.id} diagram`}
                                  className="max-w-full h-auto max-h-32 rounded border border-gray-200"
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
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Instant Submit Instruction */}
                {answerFeedback === null && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                    <p className="text-xs text-gray-700 font-semibold flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-xs font-mono">ENTER</kbd> to submit instantly! (+50 bonus)
                    </p>
                  </div>
                )}

                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>💡 Controls:</strong> Arrow keys or WASD to change lanes
                  </p>
                </div>
              </div>
            ) : (
              <div className="doodle-paper p-6 text-center">
                <div className="mb-4" style={{color: 'var(--doodle-secondary)'}}>
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-semibold" style={{color: 'var(--doodle-ink)',   fontSize: '1.1rem'}}>All Questions Complete!</p>
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
                    <span>Gates Passed:</span>
                    <span className="font-bold" style={{color: 'var(--doodle-blue)'}}>{stats.gatesPassed}</span>
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
    // Calculate performance - good if accuracy > 60% or distance > 500m
    const accuracy = stats.questionsAnswered > 0 ? (stats.correctAnswers / stats.questionsAnswered) * 100 : 0;
    const isGoodPerformance = accuracy >= 60 || stats.distanceTraveled >= 500;
    
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
                  {isGoodPerformance ? '🎉 Amazing Run!' : 'Run Complete!'}
                </h1>
                <p className="text-lg" style={{color: 'var(--doodle-secondary)',  }}>
                  You traveled {stats.distanceTraveled} meters!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="doodle-card p-4" style={{backgroundColor: '#fef9c3', borderColor: 'var(--doodle-yellow)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-yellow)',  }}>{score}</div>
                  <div className="text-sm" style={{color: '#854d0e',  }}>Final Score</div>
                </div>
                <div className="doodle-card p-4" style={{backgroundColor: '#dcfce7', borderColor: 'var(--doodle-green)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-green)',  }}>{stats.distanceTraveled}m</div>
                  <div className="text-sm" style={{color: '#166534',  }}>Distance</div>
                </div>
                <div className="doodle-card p-4" style={{backgroundColor: '#dbeafe', borderColor: 'var(--doodle-blue)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-blue)',  }}>{stats.correctAnswers}</div>
                  <div className="text-sm" style={{color: '#1e40af',  }}>Correct</div>
                </div>
                <div className="doodle-card p-4" style={{backgroundColor: '#f3e8ff', borderColor: 'var(--doodle-purple)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-purple)',  }}>{stats.gatesPassed}</div>
                  <div className="text-sm" style={{color: '#6b21a8',  }}>Gates Passed</div>
                </div>
              </div>

              {stats.questionsAnswered > 0 && (
                <div className="mb-4 doodle-card p-3" style={{backgroundColor: '#e0e7ff', borderColor: 'var(--doodle-blue)'}}>
                  <p className="text-sm" style={{color: '#3730a3',  }}>
                    Accuracy: <strong>{Math.round(accuracy)}%</strong>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setGameState('menu');
                    setFilters({ subject: '', topic: '', difficulty: '', count: 'infinite' });
                    setInitialSpeed(0.3);
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
                    AMAZING RUN! 🎉
                    <br />
                    <span style={{ color: '#6c5ce7' }}>YOU'RE ON FIRE!</span>
                  </>
                ) : (
                  <>
                    GOOD TRY! 💪
                    <br />
                    <span style={{ color: '#6c5ce7' }}>KEEP PRACTICING!</span>
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
        <p className="mb-6" style={{color: 'var(--doodle-secondary)',  }}>Take a break and come back when ready!</p>
        
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
              setFilters({ subject: '', topic: '', difficulty: '', count: 'infinite' });
              setInitialSpeed(0.5);
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
              <p>Run through lanes and pass through the correct gate to answer questions! Choose wisely or take damage!</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🎮 How It Works</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your player is at the bottom of the screen</li>
                <li>Gates spawn from the top and move downward (Subway Surfers style!)</li>
                <li>Each gate represents an answer option (A, B, C, D)</li>
                <li>Switch lanes to position yourself under the correct answer</li>
                <li>When the gate reaches you, you automatically submit your answer</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">⚡ Instant Submit</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Don't want to wait? Press <strong>Enter</strong> to submit immediately!</li>
                <li>Get a <strong>+50 bonus</strong> for instant submissions</li>
                <li>Perfect for when you know the answer right away</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🕐 Timer System</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Each question has a countdown timer</li>
                <li>Timer shows how long until the gate reaches you</li>
                <li>Based on distance and current speed</li>
                <li>Answer before time runs out or take damage!</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🎹 Controls</h3>
              <div className="grid grid-cols-2 gap-2 ml-4">
                <div><strong>← or A:</strong> Move left</div>
                <div><strong>→ or D:</strong> Move right</div>
                <div><strong>↑ or W:</strong> Lane up</div>
                <div><strong>↓ or S:</strong> Lane down</div>
                <div><strong>Enter:</strong> Submit now (+50 bonus)</div>
                <div><strong>ESC:</strong> Pause game</div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">❤️ Health System</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Start with 100 health points</li>
                <li>Wrong answer: -15 HP</li>
                <li>Missing a gate (timeout): -10 HP</li>
                <li>Game over when health reaches 0</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🎨 Visual Feedback</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Green banner:</strong> Correct answer! ✓</li>
                <li><strong>Red banner:</strong> Wrong answer ✗</li>
                <li><strong>Lane colors:</strong> Red, Blue, Green, Amber (A, B, C, D)</li>
                <li><strong>Flashing player:</strong> Shows correct lane after answering</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">⚙️ Game Settings</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Initial Speed:</strong> How fast gates move (0.3-1.0)</li>
                <li><strong>Question Count:</strong> Limited or Infinite mode</li>
                <li><strong>Subject/Difficulty:</strong> Filter questions by preference</li>
                <li>Speed increases as you answer correctly!</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Scoring</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Points awarded for correct answers</li>
                <li>+50 bonus for instant submit (Enter key)</li>
                <li>Higher speed = More challenge = More points</li>
                <li>Track your distance traveled!</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Pro Tips</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use instant submit when confident for bonus points</li>
                <li>Watch the timer to plan your lane changes</li>
                <li>Practice at slower speeds first</li>
                <li>Infinite mode is great for practice!</li>
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

export default EndlessRunnerGame;
