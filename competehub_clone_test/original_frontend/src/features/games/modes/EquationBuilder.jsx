// src/pages/games/EquationBuilder.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Puzzle, Home, Trophy, RotateCcw, CheckCircle, Shuffle, Lock, Lightbulb, Target, Keyboard, Heart } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useGames } from '../hooks/useGames';
import { createClickEffect, shuffleArray } from '../../../shared/utils/gameUtils';
import { checkAnswer, normalizeCorrectAnswer } from '../../../shared/utils/answerNormalization';
import '../../../styles/themes/doodle.css';
import { HeartBroken, KeyboardAlt } from '@mui/icons-material';

const EquationBuilder = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, login } = useAuth();
  const { fetchEquations, saveGameResult } = useGames();
  const inputRef = useRef(null);

  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    equationCount: 20,
    selectedSubjects: [],
    equationDifficulty: 'intermediate'
  });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [availableAlphabeticTerms, setAvailableAlphabeticTerms] = useState([]);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [targetEquation, setTargetEquation] = useState('');
  const [puzzles, setPuzzles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [questionMetadata, setQuestionMetadata] = useState({
    subjects: {},
    difficultyRange: { min: 1, max: 10 }
  });

  // Typing interface states
  const [typedEquation, setTypedEquation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [useTypingMode, setUseTypingMode] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Symbol mapping for autocomplete
  const symbolMap = {
    // Basic operators - multiple variations
    '+': '+',
    '-': '-',
    '*': '×',
    'x': '×',
    'X': '×',
    '×': '×',
    '/': '÷',
    'div': '÷',
    '÷': '÷',
    '=': '=',
    '(': '(',
    ')': ')',
    '^': '^',
    '.': '.',

    // Superscripts and special
    '^2': '²',
    '²': '²',
    '**2': '²',
    '^3': '³',
    '³': '³',
    '**3': '³',
    'sqrt': '√',
    'root': '√',
    'pi': 'π',
    'PI': 'π',
    'delta': 'Δ',
    'Delta': 'Δ',

    // Functions
    'log': 'log',
    'LOG': 'log',
    'ln': 'ln',
    'LN': 'ln',
    'sin': 'sin',
    'SIN': 'sin',
    'cos': 'cos',
    'COS': 'cos',
    'tan': 'tan',
    'TAN': 'tan',

    // Greek letters
    'theta': 'θ',
    'Theta': 'Θ',
    'alpha': 'α',
    'Alpha': 'Α',
    'beta': 'β',
    'Beta': 'Β',
    'gamma': 'γ',
    'Gamma': 'Γ',
    'phi': 'φ',
    'Phi': 'Φ',
    'omega': 'ω',
    'Omega': 'Ω',

    // Greek letters
    'theta': 'θ',
    'Theta': 'Θ',
    'alpha': 'α',
    'Alpha': 'Α',
    'beta': 'β',
    'Beta': 'Β',
    'gamma': 'γ',
    'Gamma': 'Γ',
    'phi': 'φ',
    'Phi': 'Φ',
    'omega': 'ω',
    'Omega': 'Ω',

    // Chemistry/Physics
    'H+': 'H⁺',
    'h+': 'H⁺',
    'OH-': 'OH⁻',
    'oh-': 'OH⁻',
    'e-': 'e⁻',
    'E-': 'e⁻',
    '->': '→',
    '=>': '→',
    '<->': '⇌',
    '<=>': '⇌',
    '<==>': '⇌',
  };

  // Get suggestions based on current input
  const getSuggestions = (input) => {
    if (!input) return [];

    const lastChar = input.slice(-1);
    const lastTwo = input.slice(-2);
    const lastWord = input.split(/[\s+\-×÷=()^]/).pop();

    const matches = [];

    // Check for multi-character symbols
    Object.entries(symbolMap).forEach(([key, value]) => {
      if (key.length > 1 && key.toLowerCase().startsWith(lastWord.toLowerCase())) {
        matches.push({ key, value, label: `${key} → ${value}` });
      }
    });

    // Add single character matches for common symbols
    if (lastWord === '/' || lastWord === '*' || lastWord === 'x' || lastWord === 'X') {
      const symbol = symbolMap[lastWord];
      if (symbol && symbol !== lastWord) {
        matches.push({ key: lastWord, value: symbol, label: `${lastWord} → ${symbol}` });
      }
    };

    // Add available terms that match
    const allAvailableTerms = [...new Set([...availableAlphabeticTerms, ...availableOperators])];
    allAvailableTerms.forEach(term => {
      if (term.toLowerCase().startsWith(lastWord.toLowerCase()) && term !== lastWord) {
        matches.push({ key: term, value: term, label: term });
      }
    });

    return matches.slice(0, 5); // Limit to 5 suggestions
  };

  const handleTypedInput = (e) => {
    const value = e.target.value;
    setTypedEquation(value);
    setCursorPosition(e.target.selectionStart);

    // Get suggestions
    const newSuggestions = getSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedSuggestionIndex(0); // Reset selection to first item
  };

  const applySuggestion = (suggestion) => {
    const beforeCursor = typedEquation.slice(0, cursorPosition);
    const afterCursor = typedEquation.slice(cursorPosition);

    // Find the last word to replace
    const words = beforeCursor.split(/[\s+\-×÷=()^]/);
    const lastWord = words.pop();
    const prefix = words.join('') || '';

    const newValue = prefix + suggestion.value + afterCursor;
    setTypedEquation(newValue);
    setShowSuggestions(false);

    // Focus back on input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = (prefix + suggestion.value).length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    // Handle arrow key navigation in suggestions
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }

      // Tab or Enter to accept selected suggestion
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIndex]);
        return;
      }

      // Escape to close suggestions
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Auto-replace common patterns on space or enter (when no suggestions)
    if ((e.key === ' ' || e.key === 'Enter') && !showSuggestions) {
      let newValue = typedEquation;

      // Replace common patterns
      Object.entries(symbolMap).forEach(([key, value]) => {
        if (newValue.endsWith(key) && key.length > 1) {
          newValue = newValue.slice(0, -key.length) + value;
        }
      });

      if (newValue !== typedEquation) {
        setTypedEquation(newValue);
      }
    }
  };

  // Convert typed equation to selected terms format
  const syncTypedToSelected = () => {
    // Split the typed equation into individual characters/terms
    const terms = typedEquation.split('').filter(t => t.trim() !== '');
    setSelectedTerms(terms);
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      setUsername(user.username);
    }
  }, [isLoggedIn, user]);

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
      const equationData = await fetchEquations({
        count: settings.equationCount,
        subjects: settings.selectedSubjects,
        difficulty: settings.equationDifficulty
      });

      setPuzzles(equationData.equations);
      setCurrentPuzzle(equationData.equations[0]);
      setAvailableOperators(equationData.standardOperators || ['+', '-', '×', '÷', '=', '(', ')', '^', '²', '³', '*']);
      setupPuzzle(equationData.equations[0]);
      setGameStarted(true);
      setScore(0);
      setLevel(1);
      setCurrentIndex(0);
      setGameOver(false);
      setShowHint(false);
      setLives(3);
      setStreak(0);
      setMaxStreak(0);
    } catch (error) {
      console.error('Failed to fetch equations:', error);
    }
    setLoading(false);
  };

  const setupPuzzle = (puzzle) => {
    if (!puzzle) return;
    setTargetEquation(puzzle.equation);
    const allTerms = [...(puzzle.alphabeticTerms || []), ...(puzzle.distractorTerms || [])];
    setAvailableAlphabeticTerms(shuffleArray(allTerms));
    setSelectedTerms([]);
    setTypedEquation('');
  };

  const addTerm = (term, index, isOperator = false) => {
    if (useTypingMode) return; // Don't add if in typing mode

    if (isOperator) {
      setSelectedTerms([...selectedTerms, term]);
    } else {
      const newAvailable = availableAlphabeticTerms.filter((_, i) => i !== index);
      setAvailableAlphabeticTerms(newAvailable);
      setSelectedTerms([...selectedTerms, term]);
    }
  };

  const removeTerm = (index) => {
    if (useTypingMode) return; // Don't remove if in typing mode

    const term = selectedTerms[index];
    const newSelected = selectedTerms.filter((_, i) => i !== index);
    setSelectedTerms(newSelected);

    if (!availableOperators.includes(term)) {
      setAvailableAlphabeticTerms([...availableAlphabeticTerms, term]);
    }
  };

  const normalizeEquation = (eq) => {
    if (!eq || typeof eq !== 'string') return '';

    let normalized = eq.trim();

    // Remove unwanted characters and patterns first
    normalized = normalized.replace(/\^\s*prime\s*prime|prime\s*prime/gi, ''); // Remove ^ prime prime
    normalized = normalized.replace(/\s+/g, ''); // Remove all spaces

    // Normalize Greek letters
    normalized = normalized.replace(/theta/gi, 'θ');
    normalized = normalized.replace(/alpha/gi, 'α');
    normalized = normalized.replace(/beta/gi, 'β');
    normalized = normalized.replace(/gamma/gi, 'γ');
    normalized = normalized.replace(/delta/gi, 'δ');
    normalized = normalized.replace(/epsilon/gi, 'ε');
    normalized = normalized.replace(/phi/gi, 'φ');
    normalized = normalized.replace(/pi/gi, 'π');
    normalized = normalized.replace(/omega/gi, 'ω');

    // Normalize division symbols BEFORE other operations
    normalized = normalized.replace(/[\/÷]/g, '÷');

    // Handle superscript patterns BEFORE multiplication normalization
    normalized = normalized.replace(/\^2|\*\*2/g, '²');
    normalized = normalized.replace(/\^3|\*\*3/g, '³');

    // Normalize multiplication symbols - but PRESERVE function names like cos, sin
    // Replace isolated multiplication symbols first (not within words)
    normalized = normalized.replace(/([^a-zA-Z])[*xX×]([^a-zA-Z])/g, '$1×$2'); // non-letter * non-letter
    normalized = normalized.replace(/^[*xX×]([^a-zA-Z])/g, '×$1'); // start with *
    normalized = normalized.replace(/([^a-zA-Z])[*xX×]$/g, '$1×'); // end with *

    // Handle word boundaries more carefully
    normalized = normalized.replace(/(\w+)\*(\w+)/g, '$1×$2'); // word*word -> word×word

    // Replace remaining isolated * symbols
    normalized = normalized.replace(/\*/g, '×');

    // Handle special chemistry/physics symbols
    normalized = normalized.replace(/H\+/gi, 'H⁺');
    normalized = normalized.replace(/OH-/gi, 'OH⁻');
    normalized = normalized.replace(/e-/gi, 'e⁻');
    normalized = normalized.replace(/->/g, '→');
    normalized = normalized.replace(/<->/g, '⇌');
    normalized = normalized.replace(/<=>/g, '⇌');
    normalized = normalized.replace(/<==>/g, '⇌');

    // Handle implicit multiplication patterns (CAREFULLY to avoid breaking function names)
    normalized = normalized.replace(/(\d)([a-zA-Zα-ω])/g, '$1×$2');
    normalized = normalized.replace(/([a-zA-Zα-ω²³])(\d)/g, '$1×$2');
    normalized = normalized.replace(/(\d)(\()/g, '$1×$2');
    normalized = normalized.replace(/(\))(\d)/g, '$1×$2');
    normalized = normalized.replace(/(\))(\()/g, '$1×$2');
    normalized = normalized.replace(/([a-zA-Zα-ω²³])(\()/g, '$1×$2');
    normalized = normalized.replace(/(\))([a-zA-Zα-ω])/g, '$1×$2');

    return normalized;
  };

  // Function to handle commutative operations for order-independent comparison
  const normalizeCommutativeEquation = (eq) => {
    const normalized = normalizeEquation(eq);

    // Split by equals sign
    const sides = normalized.split('=');
    if (sides.length !== 2) return normalized;

    // Function to sort additive terms
    const sortAddTerms = (expression) => {
      // Split by + and - while preserving the operators
      const terms = [];
      let current = '';
      let sign = '+';

      for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === '+' || char === '-') {
          if (current) {
            terms.push(sign + current);
            current = '';
          }
          sign = char;
        } else {
          current += char;
        }
      }
      if (current) terms.push(sign + current);

      // Sort terms alphabetically (this makes order independent)
      terms.sort();

      // Join back together
      let result = terms.join('');
      if (result.startsWith('+')) result = result.substring(1);
      return result;
    };

    // Sort both sides
    const leftSorted = sortAddTerms(sides[0]);
    const rightSorted = sortAddTerms(sides[1]);

    return leftSorted + '=' + rightSorted;
  };

  const validateEquationStructure = (equation) => {
    const hasEquals = equation.includes('=');
    const parts = equation.split('=');

    if (!hasEquals) {
      return { isValid: false, error: 'Equation must contain an equals sign (=)' };
    }
    if (parts.length !== 2) {
      return { isValid: false, error: 'Equation must have exactly one equals sign' };
    }
    if (parts[0].trim() === '' || parts[1].trim() === '') {
      return { isValid: false, error: 'Both sides of equation must have content' };
    }

    return { isValid: true, error: null };
  };

  const checkSolution = (e) => {
    createClickEffect(e);

    // Use typed equation if in typing mode, otherwise use selected terms
    const userEquation = useTypingMode ? typedEquation : selectedTerms.join('');

    if (!userEquation || userEquation.length === 0) {
      alert('Please build an equation first!');
      return;
    }

    const validation = validateEquationStructure(userEquation);
    if (!validation.isValid) {
      alert(`Invalid equation: ${validation.error}`);
      return;
    }

    // Normalize both equations for comparison (with commutative handling)
    const normalizedUser = normalizeCommutativeEquation(userEquation);
    const normalizedTarget = normalizeCommutativeEquation(targetEquation);

    // Debug logging with more detail
    console.log('--- EQUATION COMPARISON DEBUG ---');
    console.log('Original user equation:', `"${userEquation}"`);
    console.log('Original target equation:', `"${targetEquation}"`);
    console.log('Normalized user:', `"${normalizedUser}"`);
    console.log('Normalized target:', `"${normalizedTarget}"`);
    console.log('Character-by-character comparison:');
    console.log('User chars:', normalizedUser.split('').map((c, i) => `${i}:"${c}" (${c.charCodeAt(0)})`));
    console.log('Target chars:', normalizedTarget.split('').map((c, i) => `${i}:"${c}" (${c.charCodeAt(0)})`));
    console.log('Equations match:', normalizedUser === normalizedTarget);
    console.log('--- END DEBUG ---');

    const isCorrect = normalizedUser === normalizedTarget;

    if (isCorrect) {
      const levelBonus = level * 10;
      const streakBonus = streak * 5;
      const points = 50 + levelBonus + streakBonus;

      setScore(score + points);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
      setLevel(level + 1);

      alert(`Correct! +${points} points`);
      setTimeout(() => nextPuzzle(), 500);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);

      if (newLives <= 0) {
        endGame();
      } else {
        // More informative error message
        const userChars = normalizedUser.split('').map(c => c.charCodeAt(0));
        const targetChars = normalizedTarget.split('').map(c => c.charCodeAt(0));

        alert(`Incorrect!\n\nYour equation: "${userEquation}"\nYour normalized: "${normalizedUser}"\n\nTarget equation: "${targetEquation}"\nTarget normalized: "${normalizedTarget}"\n\nDifference: ${userChars.length !== targetChars.length ? 'Different lengths' : 'Character mismatch'}\n\nLives remaining: ${newLives}`);
      }
    }
  };

  const nextPuzzle = async () => {
    if (currentIndex + 1 >= puzzles.length) {
      try {
        const equationData = await fetchEquations({
          count: gameSettings?.equationCount || 20,
          subjects: gameSettings?.selectedSubjects || [],
          difficulty: gameSettings?.equationDifficulty || 'intermediate'
        });

        if (equationData && equationData.equations && equationData.equations.length > 0) {
          setPuzzles(equationData.equations);
          setAvailableOperators(equationData.standardOperators || availableOperators);
          setCurrentIndex(0);
          setCurrentPuzzle(equationData.equations[0]);
          setupPuzzle(equationData.equations[0]);
        } else {
          endGame();
        }
      } catch (error) {
        console.error('Failed to fetch more equations:', error);
        endGame();
      }
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextPuzzle = puzzles[nextIndex];
      setCurrentPuzzle(nextPuzzle);
      setupPuzzle(nextPuzzle);
    }
    setShowHint(false);
  };

  const shuffleTerms = (e) => {
    createClickEffect(e);
    setAvailableAlphabeticTerms(shuffleArray([...availableAlphabeticTerms]));
  };

  const clearEquation = (e) => {
    createClickEffect(e);
    if (useTypingMode) {
      setTypedEquation('');
    } else {
      const alphabeticTermsFromSelected = selectedTerms.filter(term => !availableOperators.includes(term));
      setAvailableAlphabeticTerms(shuffleArray([...availableAlphabeticTerms, ...alphabeticTermsFromSelected]));
      setSelectedTerms([]);
    }
  };

  const endGame = async () => {
    setGameOver(true);
    
    // Determine if the game was won or completed
    // Win criteria: solved 5+ puzzles with at least 1 life remaining
    const puzzlesSolved = level - 1;
    const won = puzzlesSolved >= 5 && lives > 0;
    const completed = puzzlesSolved >= 3; // Completed if solved at least 3 puzzles
    
    try {
      await saveGameResult('equation-builder', {
        score,
        level,
        questionsAnswered: puzzlesSolved,
        correctAnswers: puzzlesSolved,
        accuracy: 100,
        timeSpent: 0,
        completed,
        won,
        gameSpecificData: {
          puzzlesCompleted: puzzlesSolved,
          maxStreak,
          finalLives: lives
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
    setCurrentIndex(0);
    setScore(0);
    setLevel(1);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setShowHint(false);
    setGameSettings(null);
    setTypedEquation('');
    setUseTypingMode(false);
  };

  const toggleInputMode = () => {
    setUseTypingMode(!useTypingMode);
    if (!useTypingMode) {
      // Switching to typing mode - sync current selected terms
      setTypedEquation(selectedTerms.join(''));
    } else {
      // Switching to click mode - clear typed equation
      setTypedEquation('');
    }
  };

  // Authentication gate
  if (!isLoggedIn) {
    return (
      <div className="doodle-container">
        <div style={{ maxWidth: '450px', margin: '0 auto', padding: '15px' }}>
          <div className="doodle-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="doodle-avatar" style={{ marginBottom: '12px', background: 'var(--doodle-accent)', width: '50px', height: '50px' }}>
              <Lock size={30} color="#fff" />
            </div>
            <h1 className="doodle-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Authentication Required</h1>
            <p className="doodle-subtitle" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
              Please log in to play Equation Builder and track your progress!
            </p>

            <div style={{
              background: 'var(--doodle-paper)',
              padding: '12px',
              borderRadius: '6px',
              margin: '12px 0',
              border: '2px solid var(--doodle-sketch)'
            }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--doodle-secondary)', lineHeight: '1.6' }}>
                <Puzzle size={14} style={{ display: 'inline', marginRight: '4px' }} /> Build equations from scattered terms<br />
                <Target size={14} style={{ display: 'inline', marginRight: '4px' }} /> Choose difficulty and subjects<br />
                <Trophy size={14} style={{ display: 'inline', marginRight: '4px' }} /> Compete on leaderboards
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="doodle-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => navigate('/')}>
                <Home size={16} style={{ marginRight: '6px' }} />
                Back to Home
              </button>
              <button
                className="doodle-btn doodle-btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                onClick={() => navigate('/login')}
              >
                <Puzzle size={16} style={{ marginRight: '6px' }} />
                Log In to Play
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
              <h1 className="doodle-title text-4xl mb-3" >Equation Builder</h1>
              <p className="doodle-subtitle text-lg mb-8" >
                Assemble the correct equations from scattered terms!
              </p>
            </div>

                <div className="mb-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Number of Equations</label>
                      <select
                        className="doodle-input w-full max-w-md mx-auto"
                        value={gameSettings?.equationCount || 20}
                        onChange={(e) => setGameSettings({ ...gameSettings, equationCount: parseInt(e.target.value) })}
                      >
                        <option value={10}>10 Equations</option>
                        <option value={20}>20 Equations</option>
                        <option value={30}>30 Equations</option>
                        <option value={50}>50 Equations</option>
                      </select>
                    </div>
                    <div className="text-left">
                      <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Difficulty</label>
                      <select
                        className="doodle-input w-full max-w-md mx-auto"
                        value={gameSettings?.equationDifficulty || 'intermediate'}
                        onChange={(e) => setGameSettings({ ...gameSettings, equationDifficulty: e.target.value })}
                      >
                        <option value="basic">Basic</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl mb-4" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Select Subjects (Min 1)</h3>
                    <p className="text-sm mb-4" style={{  color: 'var(--doodle-secondary)'}}>Choose which subjects to include</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 rounded-lg" style={{background: 'var(--doodle-paper)'}}>
                      {Object.entries(questionMetadata.subjects).map(([subject, data]) => {
                        const isSelected = gameSettings?.selectedSubjects?.includes(subject);
                        const count = typeof data === 'object' ? (data.count || 0) : data;
                        
                        return (
                          <button
                            key={subject}
                            onClick={() => {
                              const current = gameSettings?.selectedSubjects || [];
                              if (isSelected) {
                                setGameSettings({ ...gameSettings, selectedSubjects: current.filter(s => s !== subject) });
                              } else {
                                setGameSettings({ ...gameSettings, selectedSubjects: [...current, subject] });
                              }
                            }}
                            className={`doodle-card p-3 transition-all text-left ${
                              isSelected
                                ? 'shadow-lg scale-105'
                                : 'hover:shadow-md'
                            }`}
                            style={isSelected ? {
                              backgroundColor: '#f3e8ff',
                              borderColor: 'var(--doodle-purple)'
                            } : {}}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <div 
                                  className="w-4 h-4 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: 'var(--doodle-purple)' }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate" style={{color: 'var(--doodle-ink)'}}>{subject}</div>
                                {/* <div className="text-xs" style={{color: 'var(--doodle-secondary)'}}>{count} questions</div> */}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* {gameSettings?.selectedSubjects && gameSettings.selectedSubjects.length > 0 && (
                    <div className="doodle-card p-4" style={{background: 'linear-gradient(to right, #f3e8ff, #e0e7ff)', borderColor: 'var(--doodle-purple)'}}>
                      <p className="text-sm" style={{color: 'var(--doodle-purple)',  }}>
                        <strong>{gameSettings.selectedSubjects.length}</strong> subject{gameSettings.selectedSubjects.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )} */}

                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (!gameSettings?.selectedSubjects || gameSettings.selectedSubjects.length === 0) {
                        alert('Please select at least one subject!');
                        return;
                      }
                      handleSettingsSubmit(gameSettings);
                    }}
                    disabled={loading}
                    className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? 'Starting...' : 'Start Building'}
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

          {/* Right Side - Doodle Equation Character */}
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
            src="/doodieequation.png" 
            alt="Doodle Equation" 
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
              BUILD IT RIGHT! 
              <br />
              <span style={{ color: '#6c5ce7' }}>EQUATIONS AWAIT!</span>
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
                <h2 className="text-3xl font-bold text-gray-800">How to Play Equation Builder</h2>
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
                  <p>Solve equations by typing them correctly in a race against time!</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">⌨️ How to Play</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You'll be shown a mathematical equation</li>
                    <li>Type the code that represents that equation</li>
                    <li>Submit your answer before time runs out</li>
                    <li>Correct answers earn you points</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Difficulty Levels</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Easy:</strong> Basic arithmetic and simple expressions</li>
                    <li><strong>Medium:</strong> Fractions, exponents, and square roots</li>
                    <li><strong>Hard:</strong> Complex equations with multiple operators</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">⏱️ Time Limits</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>60 seconds:</strong> Quick challenges</li>
                    <li><strong>90 seconds:</strong> Moderate pace</li>
                    <li><strong>120 seconds:</strong> More time to think</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📚 Subject Selection</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Choose one or more subjects before starting</li>
                    <li>Equations will be randomly selected from your chosen subjects</li>
                    <li>More subjects = more variety</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Equation Tips</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Fractions: <code>\frac{'{numerator}'}{'{denominator}'}</code></li>
                    <li>Square root: <code>\sqrt{'{expression}'}</code></li>
                    <li>Exponents: Use <code>^</code> like <code>x^2</code></li>
                    <li>Subscripts: Use <code>_</code> like <code>x_1</code></li>
                    <li>Greek letters: <code>\alpha, \beta, \theta</code> etc.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🏆 Scoring</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Correct answers increase your score</li>
                    <li>Faster answers = bonus points</li>
                    <li>Build a streak for multiplier bonuses</li>
                    <li>Wrong answers break your streak</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">✨ Pro Tips</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Study equation syntax before playing</li>
                    <li>Start with easier difficulties to learn</li>
                    <li>Pay attention to spacing and brackets</li>
                    <li>Practice makes perfect!</li>
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
    // Good performance if solved 5+ puzzles or reached level 6+
    const puzzlesSolved = level - 1;
    const isGoodPerformance = puzzlesSolved >= 5 || level >= 6;
    
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
              <div className="doodle-avatar" style={{ 
                marginBottom: '15px', 
                width: '60px', 
                height: '60px',
                margin: '0 auto 15px'
              }}>
                <Trophy size={35} color="#fff" />
              </div>
              
              <h1 className="doodle-title" style={{ 
                fontSize: '2rem', 
                marginBottom: '10px',
                fontFamily: 'Architects Daughter, cursive',
                color: 'var(--doodle-ink)'
              }}>
                {isGoodPerformance ? '🎉 Excellent Work!' : 'Building Complete!'}
              </h1>
              
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--doodle-secondary)', 
                marginBottom: '20px',
                 
              }}>
                You solved {puzzlesSolved} puzzle{puzzlesSolved !== 1 ? 's' : ''}!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div className="doodle-sticky" style={{ textAlign: 'center', padding: '15px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>{score}</div>
                  <div style={{ fontSize: '0.85rem' }}>Final Score</div>
                </div>
                <div className="doodle-sticky" style={{ textAlign: 'center', padding: '15px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>{puzzlesSolved}</div>
                  <div style={{ fontSize: '0.85rem' }}>Puzzles Solved</div>
                </div>
                <div className="doodle-sticky" style={{ textAlign: 'center', padding: '15px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--doodle-yellow)' }}>{maxStreak}</div>
                  <div style={{ fontSize: '0.85rem' }}>Best Streak</div>
                </div>
                <div className="doodle-sticky" style={{ textAlign: 'center', padding: '15px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--doodle-purple)' }}>{level}</div>
                  <div style={{ fontSize: '0.85rem' }}>Level Reached</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  className="doodle-btn" 
                  style={{ padding: '10px 20px', fontSize: '1rem', background: 'var(--doodle-sketch)', color: 'white', flex: 1 }} 
                  onClick={resetGame}
                >
                  <RotateCcw size={18} style={{ marginRight: '8px' }} />
                  Build Again
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
                    BRILLIANT MIND! 🎉
                    <br />
                    <span style={{ color: '#6c5ce7' }}>EQUATION MASTER!</span>
                  </>
                ) : (
                  <>
                    KEEP GOING! 💪
                    <br />
                    <span style={{ color: '#6c5ce7' }}>YOU'LL GET THERE!</span>
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
      padding: '10px',
      minHeight: '95vh',
      display: 'flex',
      flexDirection: 'column',
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
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>

        {/* Header - Compact */}
        <div className="doodle-card" style={{
          padding: '10px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{username}</span>
            <span className="doodle-badge" style={{ background: 'var(--doodle-blue)', padding: '3px 10px', fontSize: '0.75rem' }}>
              Score: {score}
            </span>
            <span className="doodle-badge" style={{ background: 'var(--doodle-green)', padding: '3px 10px', fontSize: '0.75rem' }}>
              Streak: {streak}
            </span>
            <span className="doodle-badge" style={{ background: 'var(--doodle-purple)', padding: '3px 10px', fontSize: '0.75rem' }}>
              Level {level}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '22px',
                  height: '22px',
                  color: i < lives ? 'var(--doodle-accent)' : 'var(--doodle-sketch)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {i < lives ? <Heart fill='var(--doodle-accent)' size={22} /> : <HeartBroken size={22} />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(400px, 1fr) minmax(300px, 400px)',
          gap: '20px',
          flex: 1,
          alignItems: 'start'
        }}>
          
          {/* Left Column - Target & Builder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            
            {/* Target Equation */}
            {currentPuzzle && (
              <div className="doodle-card" style={{ 
                padding: '15px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)'
              }}>
                <h3 style={{ fontSize: '0.85rem', margin: '0 0 10px 0', opacity: 0.9, fontWeight: '600' }}>
                  🎯 Target Equation
                </h3>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '10px',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  {currentPuzzle.hint}
                </div>
                {showHint && (
                  <div style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.9 }}>
                    <Lightbulb size={14} style={{ display: 'inline', marginRight: '4px' }} /> 
                    Hint: {currentPuzzle.hint}
                  </div>
                )}
              </div>
            )}

            {/* Your Equation Building Area */}
            <div className="doodle-card" style={{ 
              padding: '15px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--doodle-ink)', fontWeight: '600' }}>
                  ✏️ Your Equation
                </h4>
                <button
                  className="doodle-btn"
                  onClick={toggleInputMode}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    background: useTypingMode ? 'var(--doodle-accent)' : 'var(--doodle-sketch)',
                    color: useTypingMode ? 'white' : 'var(--doodle-ink)',
                    border: '2px solid var(--doodle-ink)',
                    fontWeight: '600'
                  }}
                >
                  <Keyboard size={12} style={{ marginRight: '3px' }} />
                  {useTypingMode ? 'Typing' : 'Clicking'}
                </button>
              </div>

              {useTypingMode ? (
                <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedEquation}
                    onChange={handleTypedInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Type equation... (H+, ^2, sqrt, ->)"
                    style={{
                      width: '100%',
                      height: '50px',
                      border: '3px solid var(--doodle-accent)',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '1.1rem',
                      fontFamily: 'monospace',
                      background: 'var(--doodle-paper)',
                      outline: 'none',
                      fontWeight: '500'
                    }}
                    autoFocus
                  />

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                      position: 'fixed',
                      top: inputRef.current ? `${inputRef.current.getBoundingClientRect().bottom + 2}px` : '100%',
                      left: inputRef.current ? `${inputRef.current.getBoundingClientRect().left}px` : '0',
                      width: inputRef.current ? `${inputRef.current.getBoundingClientRect().width}px` : '100%',
                      background: 'white',
                      border: '3px solid var(--doodle-accent)',
                      borderRadius: '8px',
                      zIndex: 9999,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}>
                      {suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onClick={() => applySuggestion(suggestion)}
                          onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            background: idx === selectedSuggestionIndex ? 'var(--doodle-accent)' : 'white',
                            color: idx === selectedSuggestionIndex ? 'white' : 'var(--doodle-ink)',
                            borderBottom: idx < suggestions.length - 1 ? '1px solid var(--doodle-sketch)' : 'none',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {suggestion.label}
                        </div>
                      ))}
                      <div style={{
                        padding: '6px 8px',
                        fontSize: '0.65rem',
                        color: 'var(--doodle-secondary)',
                        borderTop: '1px solid var(--doodle-sketch)',
                        textAlign: 'center',
                        background: '#f8f9fa'
                      }}>
                        ↑↓ navigate • Tab/Enter accept • Esc close
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  minHeight: '50px',
                  border: '3px dashed var(--doodle-sketch)',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  alignItems: 'center',
                  background: 'var(--doodle-paper)',
                  flex: 1
                }}>
                  {selectedTerms.length === 0 ? (
                    <span style={{ color: 'var(--doodle-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                      Click terms from right panel...
                    </span>
                  ) : (
                    selectedTerms.map((term, index) => (
                      <span
                        key={index}
                        className="doodle-badge"
                        style={{
                          background: 'var(--doodle-blue)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '5px 10px',
                          fontFamily: 'monospace',
                          fontWeight: '600'
                        }}
                        onClick={() => removeTerm(index)}
                      >
                        {term}
                      </span>
                    ))
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                {!useTypingMode && (
                  <button 
                    className="doodle-btn" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--doodle-orange)', color: 'white' }} 
                    onClick={shuffleTerms}
                  >
                    <Shuffle size={14} style={{ marginRight: '4px' }} />
                    Shuffle
                  </button>
                )}
                <button 
                  className="doodle-btn" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--doodle-accent)', color: 'white' }} 
                  onClick={clearEquation}
                >
                  Clear
                </button>
                <button 
                  className="doodle-btn" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }} 
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? 'Hide' : 'Show'} Hint
                </button>
              </div>

              {/* Submit Button */}
              <button
                className="doodle-btn doodle-btn-primary"
                disabled={(useTypingMode ? typedEquation.length : selectedTerms.length) === 0}
                onClick={checkSolution}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '0.9rem',
                  marginTop: '10px',
                  width: '100%',
                  fontWeight: '600'
                }}
              >
                <CheckCircle size={16} style={{ marginRight: '6px' }} />
                Check Equation
              </button>
            </div>
          </div>

          {/* Right Column - Operators & Terms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            
            {/* Operators */}
            <div className="doodle-card" style={{ 
              padding: '12px',
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)',
              flex: '1',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h4 style={{ fontSize: '0.85rem', margin: '0 0 10px 0', color: 'var(--doodle-ink)', fontWeight: '600' }}>
                ⚙️ Operators (∞)
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                gap: '6px'
              }}>
                {availableOperators.map((operator, index) => (
                  <span
                    key={index}
                    className="doodle-badge"
                    style={{
                      background: useTypingMode ? 'var(--doodle-secondary)' : 'var(--doodle-orange)',
                      cursor: useTypingMode ? 'default' : 'pointer',
                      fontSize: '1.1rem',
                      padding: '8px',
                      opacity: useTypingMode ? 0.6 : 1,
                      textAlign: 'center',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      border: '2px solid var(--doodle-ink)'
                    }}
                    onClick={() => !useTypingMode && addTerm(operator, index, true)}
                  >
                    {operator}
                  </span>
                ))}
              </div>
              {useTypingMode && (
                <p style={{ fontSize: '0.65rem', color: 'var(--doodle-secondary)', margin: '8px 0 0 0', textAlign: 'center' }}>
                  Type these symbols directly
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="doodle-card" style={{ 
              padding: '12px',
              flex: '1',
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h4 style={{ fontSize: '0.85rem', margin: '0 0 10px 0', color: 'var(--doodle-ink)', fontWeight: '600' }}>
                🔤 Terms {!useTypingMode && '(Limited)'}
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: '6px'
              }}>
                {availableAlphabeticTerms.map((term, index) => (
                  <span
                    key={index}
                    className="doodle-badge"
                    style={{
                      background: useTypingMode ? 'var(--doodle-secondary)' : 'var(--doodle-green)',
                      cursor: useTypingMode ? 'default' : 'pointer',
                      fontSize: '1rem',
                      padding: '8px',
                      transform: useTypingMode ? 'none' : `rotate(${Math.random() * 4 - 2}deg)`,
                      opacity: useTypingMode ? 0.6 : 1,
                      textAlign: 'center',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      border: '2px solid var(--doodle-ink)'
                    }}
                    onClick={() => !useTypingMode && addTerm(term, index, false)}
                  >
                    {term}
                  </span>
                ))}
              </div>
              {useTypingMode && (
                <p style={{ fontSize: '0.65rem', color: 'var(--doodle-secondary)', margin: '8px 0 0 0', textAlign: 'center' }}>
                  Type these terms directly
                </p>
              )}
            </div>

            {/* Quick Help */}
            <div className="doodle-card" style={{ 
              padding: '10px',
              background: 'wheat',
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <details>
                <summary style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--doodle-ink)' }}>
                  <KeyboardAlt size={14} /> Quick Symbols
                </summary>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.65rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '4px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  <div><code>H+</code> → H⁺</div>
                  <div><code>^2</code> → ²</div>
                  <div><code>sqrt</code> → √</div>
                  <div><code>pi</code> → π</div>
                  <div><code>-{'>'}</code> → →</div>
                  <div><code>*</code> → ×</div>
                  <div><code>/</code> → ÷</div>
                  <div><code>delta</code> → Δ</div>
                </div>
              </details>
              <button
                className="doodle-btn"
                onClick={() => setShowGuidelines(!showGuidelines)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  background: 'var(--doodle-ink)',
                  color: 'white',
                  width: '100%',
                  marginTop: '8px'
                }}
              >
                {showGuidelines ? 'Hide' : 'Show'} Rules
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Dropdown Modal */}
      {showGuidelines && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="doodle-card" style={{
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: 'white',
            border: '4px solid var(--doodle-accent)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{
                fontSize: '1.2rem',
                margin: 0,
                color: 'var(--doodle-accent)',
                fontWeight: 'bold'
              }}>
                📚 Equation Building Rules & Guidelines
              </h4>
              <button
                onClick={() => setShowGuidelines(false)}
                className="doodle-btn"
                style={{
                  padding: '6px 12px',
                  background: 'var(--doodle-accent)',
                  color: 'white'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--doodle-blue)' }}>⌨️ Typing Mode:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>Type equations naturally with autocomplete suggestions</li>
                  <li>Use shortcuts like <code>H+</code>, <code>^2</code>, <code>sqrt</code></li>
                  <li>Press Tab or Enter to accept suggestions</li>
                </ul>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--doodle-blue)' }}>✅ Implicit Multiplication:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li><code>2x</code> → <code>2×x</code></li>
                  <li><code>xy</code> → <code>x×y</code></li>
                  <li><code>3(a+b)</code> → <code>3×(a+b)</code></li>
                </ul>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--doodle-purple)' }}>📋 Equation Structure:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>Must contain exactly one equals sign (=)</li>
                  <li>Both sides must have content</li>
                  <li>Use <code>×</code> or <code>*</code> for multiplication</li>
                </ul>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--doodle-accent)' }}>💡 Examples:</strong>
                <div style={{
                  background: 'wheat',
                  padding: '10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  marginTop: '6px'
                }}>
                  <div>✓ <code>F=ma</code> → <code>F=m×a</code></div>
                  <div>✓ <code>E=mc²</code> → <code>E=m×c²</code></div>
                  <div>✓ <code>a²+b²=c²</code> → <code>a²+b²=c²</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 1200px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .doodle-container {
            padding: 5px !important;
          }
          .doodle-card {
            padding: 10px !important;
          }
          div[style*="fontSize: '1.5rem'"] {
            font-size: 1.2rem !important;
          }
        }
      `}</style>
      
      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">How to Play Equation Builder</h2>
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
                  <p>Assemble correct mathematical equations from scattered terms and operators!</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🧩 How to Play</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You'll see a scrambled equation with terms mixed up</li>
                    <li>Drag and drop terms to build the correct equation</li>
                    <li>Match the target equation shown at the top</li>
                    <li>Use the "Shuffle" button to rearrange available terms</li>
                    <li>Click "Clear" to start over if needed</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">⌨️ Typing Mode</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Toggle typing mode to type equations instead of dragging</li>
                    <li>Type mathematical symbols and Greek letters</li>
                    <li>Use autocomplete suggestions for special characters</li>
                    <li>Press Tab or click to accept suggestions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Hints</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Click the hint button (💡) to see the correct equation</li>
                    <li>Use hints sparingly - you only get one per puzzle</li>
                    <li>Hints help when you're stuck on difficult equations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">❤️ Lives System</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You start with 3 lives (hearts)</li>
                    <li>Each wrong answer costs one life</li>
                    <li>Game ends when you lose all lives</li>
                    <li>Build a streak of correct answers for bonus points</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">⚙️ Difficulty Levels</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Basic:</strong> Simple equations for beginners</li>
                    <li><strong>Intermediate:</strong> Moderate complexity</li>
                    <li><strong>Advanced:</strong> Complex equations with multiple terms</li>
                    <li><strong>Expert:</strong> Very challenging equations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">🏆 Scoring</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Base points: 50 per correct equation</li>
                    <li>Level bonus: +10 points × current level</li>
                    <li>Streak bonus: +5 points × current streak</li>
                    <li>Higher difficulty = more complex equations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Tips</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Pay attention to mathematical syntax and order</li>
                    <li>Greek letters and special symbols matter</li>
                    <li>Use typing mode for faster input if comfortable</li>
                    <li>Start with basic difficulty to learn the mechanics</li>
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

export default EquationBuilder;