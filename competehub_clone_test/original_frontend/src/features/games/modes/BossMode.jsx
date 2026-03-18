// src/pages/games/BossMode.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, Trophy, RotateCcw, Zap, Lock, Target } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useGames } from '../hooks/useGames';
import { createClickEffect } from '../../../shared/utils/gameUtils';
import { getBossIcon } from '../components/BossIcons';
import { checkAnswer, normalizeCorrectAnswer } from '../../../shared/utils/answerNormalization';
import '../../../styles/themes/doodle.css';

const BossMode = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, login } = useAuth();
  const { fetchBossModeData, saveGameResult } = useGames();
  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    bossDifficulty: 1,
    selectedSubjects: [],
    typingChallenges: false
  });
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [battleText, setBattleText] = useState('');
  const [totalBossesDefeated, setTotalBossesDefeated] = useState(0);
  const [showTypingChallenge, setShowTypingChallenge] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [userTypingInput, setUserTypingInput] = useState('');
  const [typingTimeLeft, setTypingTimeLeft] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [questionMetadata, setQuestionMetadata] = useState({
    subjects: {},
    difficultyRange: { min: 1, max: 10 }
  });

  // Typing challenge words/phrases
  const typingChallenges = [
    'EINSTEIN', 'NEWTON', 'CALCULUS', 'PHYSICS', 'CHEMISTRY', 'MATHEMATICS',
    'QUANTUM', 'RELATIVITY', 'THERMODYNAMICS', 'ELECTROMAGNETISM',
    'ORGANIC CHEMISTRY', 'DIFFERENTIAL EQUATIONS', 'WAVE FUNCTION',
    'SCHRODINGER', 'PLANCK CONSTANT', 'AVOGADRO', 'MOLECULAR',
    'ATOMIC STRUCTURE', 'PHOTON', 'ELECTRON', 'PROTON', 'NEUTRON'
  ];

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

  const handleSettingsSubmit = async (settings) => {
    setGameSettings(settings);
    setLoading(true);

    try {
      console.log('Fetching boss mode data with settings:', settings);
      const bossData = await fetchBossModeData({
        level: settings.bossDifficulty,
        subjects: settings.selectedSubjects
      });

      console.log('Fetched boss data:', bossData);
      setCurrentBoss(bossData.bossConfig);
      setQuestions(bossData.questions);
      setCurrentQuestion(bossData.questions[0]);
      setGameStarted(true);
      setBossHP(bossData.bossConfig.baseHP);
      setPlayerHP(100);
      setScore(0);
      setLevel(settings.bossDifficulty);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setGameOver(false);
      setVictory(false);
      setShowBattle(false);
      setBattleText('');
      setTotalBossesDefeated(0);
      setShowTypingChallenge(false);
      setScreenShake(false);
    } catch (error) {
      console.error('Failed to fetch boss mode data:', error);
    }
    setLoading(false);
  };

  // Screen shake effect
  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);
  };

  // Start typing challenge
  const startTypingChallenge = () => {
    if (!currentBoss) return;

    // Clear any previous battle text and hide battle popup
    setShowBattle(false);
    setBattleText('');

    const challenge = typingChallenges[Math.floor(Math.random() * typingChallenges.length)];
    const timeLimit = currentBoss.typingChallengeTimeLimit || 10;

    setTypingText(challenge);
    setUserTypingInput('');
    setTypingTimeLeft(timeLimit);
    setShowTypingChallenge(true);
  };

  // Handle typing challenge
  const handleTypingInput = (e) => {
    setUserTypingInput(e.target.value.toUpperCase());
  };

  // Check typing challenge completion
  useEffect(() => {
    if (showTypingChallenge && userTypingInput === typingText) {
      setShowTypingChallenge(false);
      setBattleText('TYPING CHALLENGE COMPLETED! Boss takes damage!');
      setShowBattle(true);
      const damage = Math.floor(Math.random() * 30) + 20;
      const newBossHP = Math.max(0, bossHP - damage);
      setBossHP(newBossHP);

      setTimeout(() => {
        setShowBattle(false);
        if (newBossHP === 0) {
          defeatBoss();
        } else {
          nextQuestion();
        }
      }, 2000);
    }
  }, [userTypingInput, typingText, showTypingChallenge]);

  // Typing challenge timer
  useEffect(() => {
    if (showTypingChallenge && typingTimeLeft > 0) {
      const timer = setTimeout(() => {
        setTypingTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showTypingChallenge && typingTimeLeft === 0) {
      setShowTypingChallenge(false);
      setBattleText('💥 TYPING CHALLENGE FAILED! Boss attacks!');
      setShowBattle(true);
      const damage = Math.floor(Math.random() * 25) + 15;
      const newPlayerHP = Math.max(0, playerHP - damage);
      setPlayerHP(newPlayerHP);
      triggerScreenShake();

      setTimeout(() => {
        setShowBattle(false);
        if (newPlayerHP <= 0) {
          endGame(false);
        } else {
          nextQuestion();
        }
      }, 2000);
    }
  }, [showTypingChallenge, typingTimeLeft]);

  const submitAnswer = (e) => {
    createClickEffect(e);
    if (selectedAnswer === null) {
      alert('Please select an answer!');
      return;
    }

    // Use the utility function for answer checking
    const isCorrect = checkAnswer(
      selectedAnswer, 
      currentQuestion.correctAnswer, 
      currentQuestion.questionType || 'MCQ'
    );
    setShowBattle(true);

    // Check for surprise elements with safe null checks
    const surpriseRoll = Math.random();
    const typingProbability = currentBoss?.typingChallengeProbability || 0;
    const swapProbability = currentBoss?.surpriseElements?.questionSwapProbability || 0;

    const shouldTriggerTyping = gameSettings?.typingChallenges && surpriseRoll < typingProbability;
    const shouldSwapQuestion = surpriseRoll < swapProbability;

    if (isCorrect) {
      const baseDamage = 20;
      const levelBonus = level * 5;
      const damage = baseDamage + levelBonus + Math.floor(Math.random() * 15); // 20-50+ damage
      const newBossHP = Math.max(0, bossHP - damage);
      setBossHP(newBossHP);
      setBattleText(`💥 Critical Hit! You dealt ${damage} damage to ${currentBoss.name}!`);

      const points = 50 * level;
      setScore(score + points);

      if (shouldTriggerTyping && newBossHP > 0) {
        setTimeout(() => {
          startTypingChallenge();
        }, 1500);
        return;
      }

      if (newBossHP === 0) {
        setTimeout(() => {
          defeatBoss();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowBattle(false);
          nextQuestion();
        }, 1500);
      }
    } else {
      const baseDamage = 15;
      const levelPenalty = level * 3;
      const damage = baseDamage + levelPenalty + Math.floor(Math.random() * 15); // 15-40+ damage
      const newPlayerHP = Math.max(0, playerHP - damage);
      setPlayerHP(newPlayerHP);
      setBattleText(`${currentBoss.name} strikes back! You take ${damage} damage!`);
      triggerScreenShake();

      // Boss might swap question on wrong answer
      if (shouldSwapQuestion) {
        setBattleText(`🌀 ${currentBoss.name} changes the question! You take ${damage} damage!`);
        setTimeout(() => {
          if (newPlayerHP > 0) {
            nextQuestion();
            setShowBattle(false);
          } else {
            endGame(false);
          }
        }, 2500);
        return;
      }

      setTimeout(() => {
        if (newPlayerHP <= 0) {
          endGame(false);
        } else {
          setShowBattle(false);
          nextQuestion();
        }
      }, 1500);
    }
  };

  const defeatBoss = async () => {
    const bonusPoints = level * 100;
    const newScore = score + bonusPoints;
    const newBossesDefeated = totalBossesDefeated + 1;

    setScore(newScore);
    setTotalBossesDefeated(newBossesDefeated);
    setBattleText(`🎉 ${currentBoss.name} defeated! Bonus: +${bonusPoints} points!`);

    setTimeout(async () => {
      if (level >= 5) {
        // Victory - defeated all bosses!
        endGame(true);
      } else {
        // Next level - fetch new boss data
        try {
          const nextLevel = level + 1;
          const bossData = await fetchBossModeData({
            level: nextLevel,
            subjects: gameSettings?.selectedSubjects || []
          });

          if (bossData && bossData.bossConfig && bossData.questions) {
            setLevel(nextLevel);
            setCurrentBoss(bossData.bossConfig);
            setBossHP(bossData.bossConfig.baseHP || 100);
            setPlayerHP(Math.min(100, playerHP + 30)); // Heal player
            setQuestions(bossData.questions);
            setCurrentQuestion(bossData.questions[0]);
            setCurrentIndex(0);
            setSelectedAnswer(null);
            setShowBattle(false);
            setBattleText('');
          } else {
            console.error('Invalid boss data received');
            endGame(true); // End game as victory if can't continue
          }
        } catch (error) {
          console.error('Failed to fetch next boss:', error);
          endGame(true); // End game as victory if can't fetch next boss
        }
      }
    }, 2500);
  };

  const nextQuestion = () => {
    if (!questions || questions.length === 0) {
      console.error('No questions available');
      return;
    }

    if (currentIndex + 1 >= questions.length) {
      // Reshuffle questions for variety
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setCurrentQuestion(shuffled[0]);
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
    }
    setSelectedAnswer(null);
  };

  const endGame = async (isVictory) => {
    setGameOver(true);
    setVictory(isVictory);
    try {
      await saveGameResult('boss-mode', {
        score,
        level,
        questionsAnswered: currentIndex + 1,
        correctAnswers: totalBossesDefeated,
        accuracy: totalBossesDefeated > 0 ? (totalBossesDefeated / (currentIndex + 1)) * 100 : 0,
        timeSpent: 0, // Boss mode doesn't track time
        gameSpecificData: {
          totalBossesDefeated,
          victory: isVictory
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
    setVictory(false);
    setShowBattle(false);
    setCurrentIndex(0);
    setScore(0);
    setLevel(1);
    setTotalBossesDefeated(0);
    setBattleText('');
    setGameSettings({
      bossDifficulty: 1,
      selectedSubjects: [],
      typingChallenges: false
    });
    setShowTypingChallenge(false);
    setScreenShake(false);
  };

  // Authentication gate - show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '450px', margin: '0 auto', padding: '15px' }}>
          <div className="doodle-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '12px' }}>
              <Lock size={50} color="var(--doodle-accent)" />
            </div>
            <h1 className="doodle-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Login Required</h1>
            <p className="doodle-subtitle" style={{ fontSize: '0.85rem', marginBottom: '15px' }}>
              Please log in to battle the knowledge bosses!
            </p>

            <div className="doodle-card doodle-notebook" style={{ padding: '12px', marginBottom: '15px', fontSize: '0.8rem' }}>
              <p style={{ margin: 0, lineHeight: '1.6' }}>
                ⚔️ Dynamic Boss Battles<br />
                <Zap size={14} style={{ display: 'inline', marginRight: '4px' }} /> Typing Challenges<br />
                🔄 Question Swapping<br />
                <Trophy size={14} style={{ display: 'inline', marginRight: '4px' }} /> Epic Rewards
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="doodle-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'var(--doodle-accent)', color: 'white' }} onClick={() => navigate('/home')}>
                <Home size={16} style={{ marginRight: '6px' }} />
                Back Home
              </button>
              <button className="doodle-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'var(--doodle-green)', color: 'white' }} onClick={() => navigate('/login')}>
                <Lock size={16} style={{ marginRight: '6px' }} />
                Login to Battle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
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
                <h1 className="doodle-title text-4xl mb-3" >Boss Battle Mode</h1>
                <p className="doodle-subtitle text-lg mb-8" >
                  Face challenging questions from knowledge bosses!
                </p>
              </div>
              <div className="mb-8 space-y-6 ">
                {/* <div className="grid grid-cols-2 gap-4"> */}
                <div className="text-left">
                  <label className="block mb-2" style={{   fontWeight: '600', color: 'var(--doodle-ink)' }}>Boss Difficulty</label>
                  <select
                    className="doodle-input w-full max-w-md mx-auto"
                    value={gameSettings?.bossDifficulty || 1}
                    onChange={(e) => setGameSettings({ ...gameSettings, bossDifficulty: parseInt(e.target.value) })}
                  >
                    <option value={1}>Level 1 - Novice Boss</option>
                    <option value={2}>Level 2 - Intermediate Boss</option>
                    <option value={3}>Level 3 - Advanced Boss</option>
                    <option value={4}>Level 4 - Expert Boss</option>
                    <option value={5}>Level 5 - Master Boss</option>
                  </select>
                </div>
                <div className="text-left">
                  <label className="flex items-center gap-2" style={{   fontWeight: '600', color: 'var(--doodle-ink)' }}>
                    <input
                      type="checkbox"
                      checked={gameSettings?.typingChallenges || false}
                      onChange={(e) => setGameSettings({ ...gameSettings, typingChallenges: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Enable Typing Challenges
                  </label>
                  <div className="text-xs mt-1" style={{ color: 'var(--doodle-secondary)',   }}>
                    Boss may surprise you with typing mini-games!
                  </div>
                </div>
                {/* </div> */}



              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    // if (!gameSettings?.selectedSubjects || gameSettings.selectedSubjects.length === 0) {
                    //   alert('Please select at least one subject!');
                    //   return;
                    // }
                    handleSettingsSubmit(gameSettings);
                  }}
                  disabled={loading}
                  className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {loading ? 'Starting Battle...' : 'Start Battle'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => navigate('/home')}
                    className="doodle-btn flex-1 flex items-center justify-center gap-2" style={{ background: 'var(--doodle-sketch)', color: 'white' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Arena
                  </button>
                  <button
                    onClick={() => setShowRules(true)}
                    className="doodle-btn flex-1 flex items-center justify-center gap-2" style={{ background: 'var(--doodle-blue)', color: 'white' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to Play
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
              maxWidth: '500px'
            }}>
              <img
                src="/doodieboss.png"
                alt="Doodle Boss"
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
                  FACE THE BOSSES!
                  <br />
                  <span style={{ color: '#6c5ce7' }}>CHALLENGE ACCEPTED!</span>
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
                  <h2 className="text-3xl font-bold text-gray-800">How to Play Boss Mode</h2>
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
                    <p>Defeat powerful knowledge bosses by answering their challenging questions correctly!</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">⚔️ Combat System</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Each correct answer deals damage to the boss (reduces Boss HP)</li>
                      <li>Each wrong answer damages you (reduces Player HP)</li>
                      <li>Defeat the boss by reducing their HP to 0</li>
                      <li>Survive by keeping your HP above 0</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">💪 Boss Difficulty</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Level 1 (Novice):</strong> Easy questions, good for beginners</li>
                      <li><strong>Level 2 (Intermediate):</strong> Moderate difficulty</li>
                      <li><strong>Level 3 (Advanced):</strong> Challenging questions</li>
                      <li><strong>Level 4 (Expert):</strong> Very difficult questions</li>
                      <li><strong>Level 5 (Master):</strong> The ultimate challenge</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">⚡ Typing Challenges</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Enable this option to face surprise typing mini-games</li>
                      <li>Type the shown text quickly and accurately</li>
                      <li>Successful typing deals bonus damage to the boss</li>
                      <li>Failed typing challenges damage your HP</li>
                    </ul>
                  </div>

                  {/* <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📚 Subject Selection</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Choose at least one subject before starting</li>
                    <li>Select multiple subjects for variety</li>
                    <li>Questions will be drawn from your selected subjects</li>
                  </ul>
                </div> */}

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">🏆 Scoring & Progression</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Earn points for each correct answer</li>
                      <li>Level up after defeating each boss</li>
                      <li>Track your total bosses defeated</li>
                      <li>Higher difficulty levels = more points</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Tips</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Read questions carefully before answering</li>
                      <li>Start with lower difficulty to learn the mechanics</li>
                      <li>Choose subjects you're confident in</li>
                      <li>Watch your HP - losing means game over!</li>
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

  if (gameOver) {
    // Good performance if victory OR defeated 3+ bosses
    const isGoodPerformance = victory || totalBossesDefeated >= 3;

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
            <div className="doodle-card" style={{
              padding: '30px',
              border: '4px solid var(--doodle-ink)',
              borderRadius: '25px',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
              transform: 'rotate(-1deg)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                {victory ? <Trophy size={50} color="var(--doodle-yellow)" /> : <Target size={50} color="var(--doodle-accent)" />}
              </div>

              <h1 className="doodle-title" style={{
                fontSize: '2rem',
                color: victory ? 'var(--doodle-green)' : 'var(--doodle-accent)',
                marginBottom: '10px',
                fontFamily: 'Architects Daughter, cursive'
              }}>
                {victory ? '🎉 Victory!' : isGoodPerformance ? '⚔️ Great Battle!' : 'Battle Ended'}
              </h1>

              <p style={{
                fontSize: '1rem',
                color: 'var(--doodle-secondary)',
                marginBottom: '20px',
                 
              }}>
                {victory ? 'All bosses defeated!' : `You defeated ${totalBossesDefeated} boss${totalBossesDefeated !== 1 ? 'es' : ''}!`}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div className="doodle-card doodle-notebook" style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>
                    {score}
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>Final Score</div>
                </div>
                <div className="doodle-card doodle-notebook" style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
                    {totalBossesDefeated}
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>Bosses Defeated</div>
                </div>
                <div className="doodle-sticky" style={{ padding: '15px', textAlign: 'center', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--doodle-purple)' }}>
                    Level {level}
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>Reached</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  className="doodle-btn"
                  style={{ padding: '10px 20px', fontSize: '1rem', background: 'var(--doodle-sketch)', color: 'white', flex: 1 }}
                  onClick={resetGame}
                >
                  <RotateCcw size={18} style={{ marginRight: '8px' }} />
                  Try Again
                </button>
                <button
                  className="doodle-btn"
                  style={{ padding: '10px 20px', fontSize: '1rem', background: 'var(--doodle-purple)', color: 'white', flex: 1 }}
                  onClick={() => navigate('/home')}
                >
                  <Home size={18} style={{ marginRight: '8px' }} />
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
                    LEGENDARY! 🎉
                    <br />
                    <span style={{ color: '#6c5ce7' }}>BOSS SLAYER!</span>
                  </>
                ) : (
                  <>
                    BRAVE ATTEMPT! 💪
                    <br />
                    <span style={{ color: '#6c5ce7' }}>COME BACK STRONGER!</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doodle-container" style={{
      animation: screenShake ? 'doodle-shake 0.5s ease-in-out' : 'none',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(45deg, #f7fafc 25%, transparent 25%), linear-gradient(-45deg, #f7fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7fafc 75%), linear-gradient(-45deg, transparent 75%, #f7fafc 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#edf2f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
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

      <div style={{ maxWidth: '1300px', width: '100%', margin: '0 auto' }}>

        {/* Battle Arena Header */}
        <div className="doodle-card" style={{
          padding: '15px 20px',
          marginBottom: '20px',
          // background: 'linear-gradient(135deg, var(--doodle-yellow) 0%, var(--doodle-orange) 100%)',
          border: '4px solid var(--doodle-ink)',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.2)'
        }}>
          {/* Top Row - Player Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span className="doodle-title" style={{ fontSize: '1.2rem', color: 'var(--doodle-ink)' }}>⚔️ {username}</span>
              <span className="doodle-badge" style={{ background: 'var(--doodle-purple)', padding: '6px 12px', fontSize: '0.9rem' }}>
                Level {level}
              </span>
              <span className="doodle-badge" style={{ background: 'var(--doodle-green)', padding: '6px 12px', fontSize: '0.9rem' }}>
                💰 {score.toLocaleString()}
              </span>
              <span className="doodle-badge" style={{ background: 'var(--doodle-blue)', padding: '6px 12px', fontSize: '0.9rem' }}>
                🏆 {totalBossesDefeated} Bosses
              </span>
            </div>
          </div>

          {/* HP Bars Row */}
          {currentBoss && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* Boss HP */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}>
                  <span style={{
                    color: currentBoss.color,
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                     
                  }}>
                    👹 {currentBoss.name}
                  </span>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: currentBoss.color
                  }}>
                    {bossHP}%
                  </span>
                </div>
                <div className="doodle-progress-bar" style={{
                  width: '100%',
                  height: '24px',
                  background: 'var(--doodle-paper)',
                  border: '3px solid var(--doodle-ink)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <div style={{
                    width: `${bossHP}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${currentBoss.color}, var(--doodle-accent))`,
                    transition: 'width 0.5s ease',
                    boxShadow: '0 0 10px rgba(255,0,0,0.5)'
                  }}></div>
                </div>
              </div>

              {/* Player HP */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}>
                  <span style={{
                    color: 'var(--doodle-green)',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                     
                  }}>
                    ⚔️ Your HP
                  </span>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: playerHP > 50 ? 'var(--doodle-green)' : playerHP > 25 ? 'var(--doodle-orange)' : 'var(--doodle-accent)'
                  }}>
                    {playerHP}%
                  </span>
                </div>
                <div className="doodle-progress-bar" style={{
                  width: '100%',
                  height: '24px',
                  background: 'var(--doodle-paper)',
                  border: '3px solid var(--doodle-ink)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <div style={{
                    width: `${playerHP}%`,
                    height: '100%',
                    background: playerHP > 50
                      ? 'linear-gradient(90deg, var(--doodle-green), var(--doodle-blue))'
                      : playerHP > 25
                        ? 'linear-gradient(90deg, var(--doodle-orange), var(--doodle-yellow))'
                        : 'linear-gradient(90deg, var(--doodle-accent), var(--doodle-orange))',
                    transition: 'width 0.5s ease',
                    boxShadow: '0 0 10px rgba(0,255,0,0.5)'
                  }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Battle Message Overlay - Fast Alert Animation */}
        {showBattle && battleText && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            animation: 'battleAlert 1.5s ease-in-out',
            pointerEvents: 'none'
          }}>
            <div className="doodle-card" style={{
              padding: '20px 40px',
              background: battleText.includes('Critical Hit') || battleText.includes('COMPLETED')
                ? 'linear-gradient(135deg, var(--doodle-green), var(--doodle-blue))'
                : battleText.includes('strikes back') || battleText.includes('FAILED')
                  ? 'linear-gradient(135deg, var(--doodle-accent), var(--doodle-orange))'
                  : 'linear-gradient(135deg, var(--doodle-purple), var(--doodle-blue))',
              border: '4px solid var(--doodle-ink)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              maxWidth: '90vw',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                 
                lineHeight: 1.4
              }}>
                {battleText}
              </div>
            </div>
          </div>
        )}

        {/* Main Battle Layout - Left-Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

          {/* LEFT SIDE - Battle Interface */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>



            {/* Question Card */}
            {currentQuestion && !showBattle && !showTypingChallenge && (
              <div className="doodle-card doodle-notebook" style={{
                padding: '20px',
                border: '4px solid var(--doodle-ink)',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.15)',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                <div className="doodle-badge" style={{
                  fontSize: '0.85rem',
                  background: 'var(--doodle-blue)',
                  // color: 'white', 
                  marginBottom: '12px',
                  display: 'inline-block',
                  padding: '6px 12px',
                  border: '2px solid var(--doodle-ink)'
                }}>
                  ⚡ Challenge #{currentIndex + 1}
                </div>

                <h3 style={{
                  fontSize: '1.1rem',
                  marginBottom: '15px',
                  lineHeight: '1.4',
                  color: 'var(--doodle-ink)',
                   
                  fontWeight: 'bold'
                }}>
                  {currentQuestion.question}
                </h3>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={selectedAnswer === index ? 'doodle-card doodle-grow' : 'doodle-card'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        background: selectedAnswer === index ? 'var(--doodle-yellow)' : 'var(--doodle-paper)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: `3px solid ${selectedAnswer === index ? 'var(--doodle-orange)' : 'var(--doodle-ink)'}`,
                        boxShadow: selectedAnswer === index ? '4px 4px 0 rgba(0,0,0,0.2)' : '2px 2px 0 rgba(0,0,0,0.1)'
                      }}
                    >
                      <input
                        type="radio"
                        name="answer"
                        checked={selectedAnswer === index}
                        onChange={() => setSelectedAnswer(index)}
                        style={{ marginRight: '10px', transform: 'scale(1.3)' }}
                      />
                      <span style={{ fontSize: '0.95rem',   }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Challenge */}
            {showTypingChallenge && (
              <div className="doodle-card doodle-bounce" style={{
                padding: '20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, var(--doodle-orange), var(--doodle-yellow))',
                border: '4px solid var(--doodle-ink)',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.2)'
              }}>
                <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.3rem', fontWeight: 'bold', textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
                  <Zap size={20} style={{ display: 'inline', marginRight: '8px' }} />
                  ⚡ TYPING CHALLENGE! ⚡
                  <Zap size={20} style={{ display: 'inline', marginLeft: '8px' }} />
                </h3>
                <div style={{
                  fontSize: '1.5rem',
                  color: 'var(--doodle-ink)',
                  marginBottom: '15px',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                  background: 'white',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '3px solid var(--doodle-ink)'
                }}>
                  {typingText}
                </div>
                <input
                  type="text"
                  value={userTypingInput}
                  onChange={handleTypingInput}
                  className="doodle-input"
                  style={{
                    fontSize: '1.2rem',
                    width: '100%',
                    textAlign: 'center',
                    letterSpacing: '2px',
                    padding: '12px',
                    border: '3px solid var(--doodle-ink)',
                    marginBottom: '10px'
                  }}
                  autoFocus
                />
                <div style={{
                  marginTop: '10px',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                }}>
                  ⏱️ Time: {typingTimeLeft}s
                </div>
              </div>
            )}

            {/* Attack Button */}
            {!showBattle && !showTypingChallenge && (
              <div style={{ textAlign: 'center' }}>
                <button
                  className="doodle-btn"
                  style={{
                    background: selectedAnswer !== null
                      ? 'linear-gradient(135deg, var(--doodle-accent), var(--doodle-orange))'
                      : 'var(--doodle-sketch)',
                    color: 'white',
                    padding: '15px 40px',
                    fontSize: '1.3rem',
                    cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
                    border: '4px solid var(--doodle-ink)',
                    boxShadow: selectedAnswer !== null ? '6px 6px 0 rgba(0,0,0,0.2)' : 'none',
                    fontWeight: 'bold',
                    transform: selectedAnswer !== null ? 'rotate(-1deg)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={selectedAnswer === null}
                  onClick={submitAnswer}
                  onMouseEnter={(e) => {
                    if (selectedAnswer !== null) {
                      e.target.style.transform = 'rotate(1deg) scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAnswer !== null) {
                      e.target.style.transform = 'rotate(-1deg) scale(1)';
                    }
                  }}
                >
                  ⚔️ ATTACK! ⚔️
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - Boss Character Image */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: '20px'
          }}>
            <div className="doodle-card" style={{
              padding: '20px',
              background: 'var(--doodle-paper)',
              border: '4px solid var(--doodle-ink)',
              boxShadow: '8px 8px 0 rgba(0,0,0,0.2)',
              transform: 'rotate(2deg)',
              maxWidth: '500px',
              width: '100%'
            }}>
              <div style={{
                position: 'relative',
                animation: showBattle ? 'doodle-bounce 0.5s infinite' : 'none'
              }}>
                <img
                  src={`/${level === 1 ? 'doodiequantum.png' :
                    level === 2 ? 'doodiecalculus.png' :
                      level === 3 ? 'doodieparadox.png' :
                        level === 4 ? 'doodielady.png' :
                          level === 5 ? 'doodiealgorithm.png' :
                            'doodiequantum.png'
                    }`}
                  alt={`Level ${level} Boss`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '10px',
                    filter: bossHP < 30 ? 'grayscale(0.3) brightness(0.8)' : 'none',
                    transition: 'filter 0.5s ease'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />

                {/* Damage Effect Overlay */}
                {screenShake && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '4rem',
                    animation: 'doodle-bounce 0.3s ease-out',
                    pointerEvents: 'none'
                  }}>
                    💥
                  </div>
                )}
              </div>

              {/* Boss Level Badge */}
              {/* <div style={{ 
                textAlign: 'center', 
                marginTop: '15px',
                padding: '10px',
                background: currentBoss ? currentBoss.color + '40' : 'var(--doodle-blue)',
                borderRadius: '10px',
                border: '3px solid var(--doodle-ink)'
              }}>
                <span style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold',
                   
                  color: 'var(--doodle-ink)'
                }}>
                  💀 Level {level} Boss 💀
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        .doodle-progress-bar {
          transform: rotate(-0.5deg);
        }
        
        .doodle-badge {
          border-radius: 12px;
          transform: rotate(-1deg);
          font-weight: bold;
        }

        @keyframes doodle-shake {
          0% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          50% { transform: translateX(5px) rotate(2deg); }
          75% { transform: translateX(-5px) rotate(-2deg); }
          100% { transform: translateX(0) rotate(0deg); }
        }

        @keyframes doodle-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }

        @keyframes battleAlert {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5) rotate(-5deg);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1) rotate(2deg);
          }
          25% {
            transform: translate(-50%, -50%) scale(1) rotate(-1deg);
          }
          80% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8) rotate(3deg);
          }
        }

        @media (max-width: 1024px) {
          /* Make battle layout single column on tablets/mobile */
          .doodle-container > div > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
          
          /* Stack header badges on mobile */
          .doodle-container > div > div:first-child > div:first-child {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          /* Make HP bars stack on smaller screens */
          .doodle-container > div > div:first-child > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
        }

        @media (max-width: 768px) {
          /* Reduce font sizes on mobile */
          .doodle-title {
            font-size: 1rem !important;
          }
          
          .doodle-badge {
            padding: 4px 8px !important;
            font-size: 0.75rem !important;
          }
          
          /* Smaller buttons on mobile */
          button {
            padding: 10px 20px !important;
            font-size: 1rem !important;
          }
          
          /* Boss image responsive */
          .doodle-container img {
            max-height: 300px !important;
          }
        }

        @media (max-width: 480px) {
          /* Extra small screens */
          .doodle-card {
            padding: 12px !important;
          }
          
          h2 {
            font-size: 1.3rem !important;
          }
        }
      `}</style>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">How to Play Boss Mode</h2>
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
                  <p>Defeat powerful knowledge bosses by answering their challenging questions correctly!</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">⚔️ Combat System</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Each correct answer deals damage to the boss (reduces Boss HP)</li>
                    <li>Each wrong answer damages you (reduces Player HP)</li>
                    <li>Defeat the boss by reducing their HP to 0</li>
                    <li>Survive by keeping your HP above 0</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">💪 Boss Difficulty</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Level 1 (Novice):</strong> Easy questions, good for beginners</li>
                    <li><strong>Level 2 (Intermediate):</strong> Moderate difficulty</li>
                    <li><strong>Level 3 (Advanced):</strong> Challenging questions</li>
                    <li><strong>Level 4 (Expert):</strong> Very difficult questions</li>
                    <li><strong>Level 5 (Master):</strong> The ultimate challenge</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">⚡ Typing Challenges</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Enable this option to face surprise typing mini-games</li>
                    <li>Type the shown text quickly and accurately</li>
                    <li>Successful typing deals bonus damage to the boss</li>
                    <li>Failed typing challenges damage your HP</li>
                  </ul>
                </div>

                {/* <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📚 Subject Selection</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Choose at least one subject before starting</li>
                    <li>Select multiple subjects for variety</li>
                    <li>Questions will be drawn from your selected subjects</li>
                  </ul>
                </div> */}

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🏆 Scoring & Progression</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Earn points for each correct answer</li>
                    <li>Level up after defeating each boss</li>
                    <li>Track your total bosses defeated</li>
                    <li>Higher difficulty levels = more points</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Tips</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Read questions carefully before answering</li>
                    <li>Start with lower difficulty to learn the mechanics</li>
                    <li>Choose subjects you're confident in</li>
                    <li>Watch your HP - losing means game over!</li>
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
    </div>
  );
};

export default BossMode;