/**
 * Crossword Game Component
 * Interactive crossword puzzle with questions as clues
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gamesAPI from '../services/gamesAPI';
import quizService from '../../question-bank/services/api';
import MathJaxContent from '../../../shared/components/ui/MathJaxContent';

// Crossword Generator Class
class CrosswordGenerator {
  constructor(words) {
    this.words = words.map(w => ({
      word: w.answer.toUpperCase(),
      clue: w.clue,
      id: w.id,
      subject: w.subject,
      topic: w.topic,
      hasImages: w.hasImages,
      imageUrls: w.imageUrls
    }));
    this.grid = [];
    this.placements = [];
    this.maxAttempts = 5000;
  }

  generate() {
    // Sort words by length (longest first for better placement)
    this.words.sort((a, b) => b.word.length - a.word.length);

    // Try multiple times to get best result
    let bestGrid = null;
    let bestPlacements = [];
    let maxPlaced = 0;

    for (let attempt = 0; attempt < 10; attempt++) {
      this.grid = [];
      this.placements = [];
      
      // Place first word horizontally in center
      if (this.words.length > 0) {
        const firstWord = this.words[0];
        this.placeWord(firstWord, 15, 15, 'across');
      }

      // Try to place remaining words
      for (let i = 1; i < this.words.length; i++) {
        this.tryPlaceWord(this.words[i]);
      }

      if (this.placements.length > maxPlaced) {
        maxPlaced = this.placements.length;
        bestGrid = JSON.parse(JSON.stringify(this.grid));
        bestPlacements = JSON.parse(JSON.stringify(this.placements));
      }

      if (this.placements.length === this.words.length) break;
    }

    this.grid = bestGrid;
    this.placements = bestPlacements;

    // Compact the grid
    this.compactGrid();

    return {
      grid: this.grid,
      placements: this.placements
    };
  }

  tryPlaceWord(wordObj) {
    const attempts = this.maxAttempts / this.words.length;
    
    for (let attempt = 0; attempt < attempts; attempt++) {
      // Try to find intersection with already placed words
      for (const placement of this.placements) {
        const placedWord = placement.word;
        
        // Find common letters
        for (let i = 0; i < placedWord.length; i++) {
          for (let j = 0; j < wordObj.word.length; j++) {
            if (placedWord[i] === wordObj.word[j]) {
              // Found common letter, try to place
              const newDirection = placement.direction === 'across' ? 'down' : 'across';
              let newRow, newCol;

              if (placement.direction === 'across') {
                newRow = placement.row - j;
                newCol = placement.col + i;
              } else {
                newRow = placement.row + i;
                newCol = placement.col - j;
              }

              if (this.canPlaceWord(wordObj.word, newRow, newCol, newDirection)) {
                this.placeWord(wordObj, newRow, newCol, newDirection);
                return true;
              }
            }
          }
        }
      }
    }
    
    return false;
  }

  canPlaceWord(word, row, col, direction) {
    if (row < 0 || col < 0 || row > 50 || col > 50) return false;

    const dr = direction === 'down' ? 1 : 0;
    const dc = direction === 'across' ? 1 : 0;

    // Check if word fits and doesn't conflict
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dr;
      const c = col + i * dc;
      
      const cell = this.getCell(r, c);
      if (cell !== null && cell !== word[i]) {
        return false;
      }

      // Check perpendicular cells for conflicts
      if (direction === 'across') {
        const above = this.getCell(r - 1, c);
        const below = this.getCell(r + 1, c);
        if ((above !== null || below !== null) && cell !== word[i]) {
          return false;
        }
      } else {
        const left = this.getCell(r, c - 1);
        const right = this.getCell(r, c + 1);
        if ((left !== null || right !== null) && cell !== word[i]) {
          return false;
        }
      }
    }

    // Check cells before and after word
    const beforeR = row - dr;
    const beforeC = col - dc;
    const afterR = row + word.length * dr;
    const afterC = col + word.length * dc;
    
    if (this.getCell(beforeR, beforeC) !== null || this.getCell(afterR, afterC) !== null) {
      return false;
    }

    return true;
  }

  placeWord(wordObj, row, col, direction) {
    const dr = direction === 'down' ? 1 : 0;
    const dc = direction === 'across' ? 1 : 0;

    for (let i = 0; i < wordObj.word.length; i++) {
      this.setCell(row + i * dr, col + i * dc, wordObj.word[i]);
    }

    this.placements.push({
      ...wordObj,
      row,
      col,
      direction,
      number: this.placements.length + 1
    });
  }

  getCell(row, col) {
    if (!this.grid[row]) return null;
    return this.grid[row][col] || null;
  }

  setCell(row, col, letter) {
    if (!this.grid[row]) this.grid[row] = [];
    this.grid[row][col] = letter;
  }

  compactGrid() {
    // Find bounds
    let minRow = Infinity, maxRow = -Infinity;
    let minCol = Infinity, maxCol = -Infinity;

    this.placements.forEach(p => {
      const endRow = p.direction === 'down' ? p.row + p.word.length - 1 : p.row;
      const endCol = p.direction === 'across' ? p.col + p.word.length - 1 : p.col;
      
      minRow = Math.min(minRow, p.row);
      maxRow = Math.max(maxRow, endRow);
      minCol = Math.min(minCol, p.col);
      maxCol = Math.max(maxCol, endCol);
    });

    // Adjust placements
    this.placements.forEach(p => {
      p.row -= minRow;
      p.col -= minCol;
    });

    // Rebuild compact grid
    const height = maxRow - minRow + 1;
    const width = maxCol - minCol + 1;
    const newGrid = Array(height).fill(null).map(() => Array(width).fill(null));

    this.placements.forEach(p => {
      const dr = p.direction === 'down' ? 1 : 0;
      const dc = p.direction === 'across' ? 1 : 0;
      
      for (let i = 0; i < p.word.length; i++) {
        newGrid[p.row + i * dr][p.col + i * dc] = p.word[i];
      }
    });

    this.grid = newGrid;
  }
}

// Main Crossword Component
const CrosswordGame = () => {
  const navigate = useNavigate();
  
  // Add CSS animation for cursor blink
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [gameState, setGameState] = useState('menu'); // 'menu', 'loading', 'playing', 'completed'
  const [crosswordData, setCrosswordData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null); // { row, col }
  const [activeDirection, setActiveDirection] = useState('across'); // Track last direction
  const [wordStatus, setWordStatus] = useState({}); // Track word completion status
  const [lockedCells, setLockedCells] = useState(new Set()); // Track locked (correct) cells
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    size: 10,
    // subject: '',
    difficulty: '',
    examType: 'JEE', // Default to JEE
    prefillMode: 1, // 0 = no prefill, 1 = 1 letter, 2 = 2 letters, 3 = 3 letters
    hintsAllowed: 2 // 0-3 hints allowed
  });
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [hintUsedCells, setHintUsedCells] = useState(new Set()); // Track cells filled by hints
  const [showClue, setShowClue] = useState(null);
  const [showRules, setShowRules] = useState(false);
  // const [subjects, setSubjects] = useState([]);
  const gridRef = useRef(null);

  // Game result tracking
  const [gameStartTime, setGameStartTime] = useState(null);
  const [resultsSaved, setResultsSaved] = useState(false);

  useEffect(() => {
    loadStats();
    // loadFilters();
  }, []);

  // Reload subjects when exam type changes
  // useEffect(() => {
  //   loadFilters();
  // }, [filters.examType]);

  // const loadFilters = async () => {
  //   try {
  //     const subjectsData = await quizService.getSubjects(filters.examType);
  //     setSubjects(subjectsData);
  //   } catch (error) {
  //     console.error('Failed to load filters:', error);
  //   }
  // };

  const loadStats = async () => {
    try {
      const data = await gamesAPI.getCrosswordStats(filters.examType);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const checkProgress = useCallback(() => {
    if (!crosswordData) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    let total = crosswordData.placements.length;

    crosswordData.placements.forEach(p => {
      if (wordStatus[p.number] === 'correct' || userAnswers[p.number] === p.word) {
        correct++;
      }
    });

    return { correct, total, percentage: Math.round((correct / total) * 100) };
  }, [crosswordData, wordStatus, userAnswers]);

  const saveGameResults = useCallback(async () => {
    if (resultsSaved || !gameStartTime || !crosswordData) return;
    
    try {
      setResultsSaved(true);
      
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);
      const progress = checkProgress();
      
      // Win criteria: 100% completion
      const won = progress.percentage === 100;
      // Completion criteria: 50% or more
      const completed = progress.percentage >= 50;
      
      // Calculate score based on correct words
      const baseScore = progress.correct * 100;
      const completionBonus = Math.floor(progress.percentage * 2);
      const finalScore = baseScore + completionBonus;
      
      await gamesAPI.saveGameResult({
        gameMode: 'crossword',
        score: finalScore,
        won: won,
        completed: completed,
        duration: duration,
        gameSpecificData: {
          wordsCompleted: progress.correct,
          totalWords: progress.total,
          completionPercentage: progress.percentage,
          hintsUsed: filters.hintsAllowed - hintsRemaining,
          gridSize: filters.size,
          prefillMode: filters.prefillMode
        }
      });
      
      console.log('Crossword game results saved successfully');
    } catch (error) {
      console.error('Failed to save game results:', error);
      setResultsSaved(false);
    }
  }, [resultsSaved, gameStartTime, crosswordData, hintsRemaining, filters, checkProgress]);

  const startGame = async () => {
    setGameState('loading');
    try {
      let result = null;
      let attempts = 0;
      const maxAttempts = 5;
      const minWords = 5;

      // Try up to 5 times to generate a crossword with at least 5 words
      while (attempts < maxAttempts) {
        attempts++;
        
        // Fetch new questions for each attempt
        const data = await gamesAPI.getCrosswordQuestions(filters);
        
        // Generate crossword
        const generator = new CrosswordGenerator(data.questions);
        const tempResult = generator.generate();
        
        // Check if we have enough words placed
        if (tempResult.placements.length >= minWords) {
          result = tempResult;
          break;
        }
        
        // If this is not the last attempt and we don't have enough words, try again
        if (attempts < maxAttempts) {
          console.log(`Attempt ${attempts}: Only ${tempResult.placements.length} words placed. Retrying...`);
        } else {
          // Last attempt - use whatever we got
          result = tempResult;
          console.log(`Final attempt: Generated crossword with ${tempResult.placements.length} words.`);
        }
      }

      if (!result || result.placements.length === 0) {
        throw new Error('Failed to generate a valid crossword');
      }

      setCrosswordData(result);
      
      // Initialize user answers with optional prefill
      const answers = {};
      result.placements.forEach(p => {
        if (filters.prefillMode > 0) {
          // Prefill random letters based on mode
          const word = p.word;
          const numLettersToPrefill = Math.min(filters.prefillMode, word.length);
          
          // Generate random positions to prefill
          const positions = [];
          for (let i = 0; i < word.length; i++) {
            positions.push(i);
          }
          
          // Shuffle positions using Fisher-Yates
          for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
          }
          
          // Take first N positions and prefill them
          const prefilledPositions = positions.slice(0, numLettersToPrefill);
          let prefilledWord = '';
          for (let i = 0; i < word.length; i++) {
            if (prefilledPositions.includes(i)) {
              prefilledWord += word[i];
            } else {
              prefilledWord += ' ';
            }
          }
          answers[p.number] = prefilledWord;
        } else {
          answers[p.number] = '';
        }
      });
      setUserAnswers(answers);
      
      // Initialize hints
      setHintsRemaining(filters.hintsAllowed);
      setHintUsedCells(new Set());
      
      // Initialize validation state
      setWordStatus({});
      setLockedCells(new Set());
      setActiveDirection('across');
      
      // Track game start time
      setGameStartTime(Date.now());
      setResultsSaved(false);
      
      setGameState('playing');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to load crossword questions. Please try again.');
      setGameState('menu');
    }
  };

  const handleCellClick = (row, col) => {
    // Check if cell is locked (correct answer)
    const cellKey = `${row}-${col}`;
    if (lockedCells.has(cellKey)) {
      return; // Don't allow interaction with locked cells
    }

    // Set selected cell for cursor
    setSelectedCell({ row, col });
    
    // Find word at this position
    const wordsAtPosition = crosswordData.placements.filter(p => {
      if (p.direction === 'across') {
        return p.row === row && col >= p.col && col < p.col + p.word.length;
      } else {
        return p.col === col && row >= p.row && row < p.row + p.word.length;
      }
    });

    if (wordsAtPosition.length > 0) {
      // Smart word selection logic
      let nextWord = wordsAtPosition[0];
      
      if (wordsAtPosition.length > 1) {
        // Multiple words at this position
        if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
          // Same cell clicked again - toggle direction
          const currentIndex = wordsAtPosition.findIndex(w => w.number === selectedWord?.number);
          nextWord = wordsAtPosition[(currentIndex + 1) % wordsAtPosition.length];
        } else {
          // Different cell - prefer the last active direction
          const preferredWord = wordsAtPosition.find(w => w.direction === activeDirection);
          nextWord = preferredWord || wordsAtPosition[0];
        }
      }
      
      setSelectedWord(nextWord);
      setActiveDirection(nextWord.direction);
    }
  };

  const validateWord = (word) => {
    const userAnswer = (userAnswers[word.number] || '').replace(/ /g, '');
    const correctAnswer = word.word;
    
    if (userAnswer.length !== correctAnswer.length) {
      return; // Word not complete
    }

    if (userAnswer === correctAnswer) {
      // Mark word as correct
      setWordStatus(prev => ({ ...prev, [word.number]: 'correct' }));
      
      // Lock all cells of this word
      const newLockedCells = new Set(lockedCells);
      const dr = word.direction === 'down' ? 1 : 0;
      const dc = word.direction === 'across' ? 1 : 0;
      
      for (let i = 0; i < word.word.length; i++) {
        const cellKey = `${word.row + i * dr}-${word.col + i * dc}`;
        newLockedCells.add(cellKey);
      }
      setLockedCells(newLockedCells);
      
      // Move to next word
      const currentIndex = crosswordData.placements.findIndex(p => p.number === word.number);
      const nextWord = crosswordData.placements[currentIndex + 1];
      if (nextWord && wordStatus[nextWord.number] !== 'correct') {
        setSelectedWord(nextWord);
        setActiveDirection(nextWord.direction);
        setSelectedCell({ row: nextWord.row, col: nextWord.col });
      }
    } else {
      // Clear incorrect answer with visual feedback
      setWordStatus(prev => ({ ...prev, [word.number]: 'incorrect' }));
      
      setTimeout(() => {
        setUserAnswers(prev => ({
          ...prev,
          [word.number]: ''
        }));
        setWordStatus(prev => ({ ...prev, [word.number]: undefined }));
        
        // Reset cursor to start of word
        setSelectedCell({ row: word.row, col: word.col });
      }, 500);
    }
  };

  const handleSubmit = () => {
    const progress = checkProgress();
    if (progress.percentage === 100) {
      setGameState('completed');
      saveGameResults();
    } else {
      if (window.confirm(`You've completed ${progress.percentage}% of the crossword. Submit anyway?`)) {
        setGameState('completed');
        saveGameResults();
      }
    }
  };

  const useHint = () => {
    if (!selectedWord || hintsRemaining <= 0) return;

    const currentAnswer = userAnswers[selectedWord.number] || '';
    const word = selectedWord.word;
    
    // Find all empty positions (not prefilled, not user-filled)
    const emptyPositions = [];
    for (let i = 0; i < word.length; i++) {
      const hasLetter = currentAnswer[i] && currentAnswer[i].trim() !== '';
      if (!hasLetter) {
        emptyPositions.push(i);
      }
    }

    if (emptyPositions.length === 0) {
      alert('This word is already complete!');
      return;
    }

    // Pick a random empty position
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const positionToFill = emptyPositions[randomIndex];

    // Fill that position with the correct letter
    const paddedAnswer = currentAnswer.padEnd(word.length, ' ');
    const newAnswer = paddedAnswer.substring(0, positionToFill) + 
                      word[positionToFill] + 
                      paddedAnswer.substring(positionToFill + 1);

    setUserAnswers(prev => ({
      ...prev,
      [selectedWord.number]: newAnswer.trimEnd()
    }));

    // Track this cell as hint-filled
    const cellKey = selectedWord.direction === 'across' 
      ? `${selectedWord.row}-${selectedWord.col + positionToFill}`
      : `${selectedWord.row + positionToFill}-${selectedWord.col}`;
    
    setHintUsedCells(prev => new Set([...prev, cellKey]));

    // Decrease hints
    setHintsRemaining(prev => prev - 1);

    // Move cursor to the filled position
    if (selectedWord.direction === 'across') {
      setSelectedCell({ 
        row: selectedWord.row, 
        col: selectedWord.col + positionToFill 
      });
    } else {
      setSelectedCell({ 
        row: selectedWord.row + positionToFill, 
        col: selectedWord.col 
      });
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && selectedCell && selectedWord) {
      const handleKeyPress = (e) => {
        const { row, col } = selectedCell;
        
        // Calculate offset for this cell in the word
        let offset = selectedWord.direction === 'across' 
          ? col - selectedWord.col 
          : row - selectedWord.row;
        
        // Check if this position is prefilled, hint-filled, or locked
        const currentAnswer = userAnswers[selectedWord.number] || '';
        const isPrefilled = currentAnswer[offset] && currentAnswer[offset] === selectedWord.word[offset];
        const cellKey = `${row}-${col}`;
        const isHintFilled = hintUsedCells.has(cellKey);
        const isLocked = lockedCells.has(cellKey);
        const isProtected = isPrefilled || isHintFilled || isLocked;
        
        if (e.key === 'Backspace') {
          e.preventDefault();
          
          if (isProtected) {
            // Can't delete protected letter, just move back
            const prevOffset = offset - 1;
            if (prevOffset >= 0) {
              const dr = selectedWord.direction === 'down' ? 1 : 0;
              const dc = selectedWord.direction === 'across' ? 1 : 0;
              setSelectedCell({ 
                row: selectedWord.row + prevOffset * dr, 
                col: selectedWord.col + prevOffset * dc 
              });
            }
            return;
          }
          
          // Delete current cell content
          const paddedAnswer = currentAnswer.padEnd(selectedWord.word.length, ' ');
          const newAnswer = paddedAnswer.substring(0, offset) + ' ' + paddedAnswer.substring(offset + 1);
          
          setUserAnswers(prev => ({
            ...prev,
            [selectedWord.number]: newAnswer.trimEnd()
          }));
          
          // Move cursor back
          const prevOffset = offset - 1;
          if (prevOffset >= 0) {
            const dr = selectedWord.direction === 'down' ? 1 : 0;
            const dc = selectedWord.direction === 'across' ? 1 : 0;
            setSelectedCell({ 
              row: selectedWord.row + prevOffset * dr, 
              col: selectedWord.col + prevOffset * dc 
            });
          }
        } else if (e.key === 'Delete') {
          e.preventDefault();
          
          if (isProtected) {
            return; // Can't delete protected letter
          }
          
          // Delete at current position without moving cursor
          const paddedAnswer = currentAnswer.padEnd(selectedWord.word.length, ' ');
          const newAnswer = paddedAnswer.substring(0, offset) + ' ' + paddedAnswer.substring(offset + 1);
          
          setUserAnswers(prev => ({
            ...prev,
            [selectedWord.number]: newAnswer.trimEnd()
          }));
        } else if (/^[a-zA-Z]$/.test(e.key)) {
          e.preventDefault();
          
          if (isLocked) {
            return; // Can't overwrite locked letter
          }
          
          // Type at cursor position
          const paddedAnswer = currentAnswer.padEnd(selectedWord.word.length, ' ');
          const newAnswer = paddedAnswer.substring(0, offset) + e.key.toUpperCase() + paddedAnswer.substring(offset + 1);
          
          setUserAnswers(prev => ({
            ...prev,
            [selectedWord.number]: newAnswer.trimEnd()
          }));
          
          // Check if word is complete and validate
          const finalAnswer = newAnswer.trimEnd();
          if (finalAnswer.replace(/ /g, '').length === selectedWord.word.length) {
            // Word is complete, validate it
            setTimeout(() => validateWord(selectedWord), 100);
          }
          
          // Move cursor forward (skip protected cells)
          let nextOffset = offset + 1;
          while (nextOffset < selectedWord.word.length) {
            const dr = selectedWord.direction === 'down' ? 1 : 0;
            const dc = selectedWord.direction === 'across' ? 1 : 0;
            const nextRow = selectedWord.row + nextOffset * dr;
            const nextCol = selectedWord.col + nextOffset * dc;
            const nextCellKey = `${nextRow}-${nextCol}`;
            
            if (!lockedCells.has(nextCellKey) && !hintUsedCells.has(nextCellKey)) {
              setSelectedCell({ row: nextRow, col: nextCol });
              break;
            }
            nextOffset++;
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          
          // Navigate with arrow keys
          let newRow = row;
          let newCol = col;
          
          if (e.key === 'ArrowLeft') {
            newCol = Math.max(0, col - 1);
          } else if (e.key === 'ArrowRight') {
            newCol = Math.min(crosswordData.grid[0].length - 1, col + 1);
          } else if (e.key === 'ArrowUp') {
            newRow = Math.max(0, row - 1);
          } else if (e.key === 'ArrowDown') {
            newRow = Math.min(crosswordData.grid.length - 1, row + 1);
          }
          
          // Check if new position is a letter cell
          if (crosswordData.grid[newRow]?.[newCol] && crosswordData.grid[newRow][newCol] !== null) {
            setSelectedCell({ row: newRow, col: newCol });
            
            // Update selected word if needed
            const wordsAtNewPosition = crosswordData.placements.filter(p => {
              if (p.direction === 'across') {
                return p.row === newRow && newCol >= p.col && newCol < p.col + p.word.length;
              } else {
                return p.col === newCol && newRow >= p.row && newRow < p.row + p.word.length;
              }
            });
            
            if (wordsAtNewPosition.length > 0) {
              const preferredWord = wordsAtNewPosition.find(w => w.direction === activeDirection);
              const nextWord = preferredWord || wordsAtNewPosition[0];
              setSelectedWord(nextWord);
              setActiveDirection(nextWord.direction);
            }
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          // Validate current word on Enter
          validateWord(selectedWord);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, selectedCell, selectedWord, userAnswers, crosswordData, hintUsedCells, lockedCells, activeDirection, wordStatus]);

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
            <h1 className="doodle-title text-4xl mb-3" >Crossword Challenge</h1>
            <p className="doodle-subtitle text-lg mb-8" >
              Solve questions as crossword clues!
            </p>
          </div>

            <div className="space-y-4 mb-8">
              <div className="text-left">
                <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Exam Type</label>
                <select
                  className="doodle-input w-full"
                  value={filters.examType}
                  onChange={(e) => setFilters({ ...filters, examType: e.target.value /*, subject: ''*/ })}
                >
                  <option value="JEE">JEE (Joint Entrance Examination)</option>
                  <option value="GATE">GATE (Graduate Aptitude Test)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Word Size</label>
                  <select
                    className="doodle-input w-full"
                    value={filters.size}
                    onChange={(e) => setFilters({ ...filters, size: parseInt(e.target.value) })}
                  >
                    <option value={8}>Small (8 letters)</option>
                    <option value={10}>Medium (10 letters)</option>
                    <option value={12}>Large (12 letters)</option>
                    <option value={15}>Extra Large (15 letters)</option>
                  </select>
                </div>

                {/* <div className="text-left">
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Subject</label>
                  <select
                    className="doodle-input w-full"
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div> */}

                <div className="text-left">
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Difficulty</label>
                  <select
                    className="doodle-input w-full"
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  >
                    <option value="">Any Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* <div className="text-left">
                <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Difficulty</label>
                <select
                  className="doodle-input w-full"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                >
                  <option value="">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div> */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Prefill Mode</label>
                  <select
                    className="doodle-input w-full"
                    value={filters.prefillMode}
                    onChange={(e) => setFilters({ ...filters, prefillMode: parseInt(e.target.value) })}
                  >
                    <option value={0}>No Prefill</option>
                    <option value={1}>1 Letter per Word</option>
                    <option value={2}>2 Letters per Word</option>
                    <option value={3}>3 Letters per Word</option>
                  </select>
                </div>

                <div className="text-left">
                  <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>Hints/Lifelines</label>
                  <select
                    className="doodle-input w-full"
                    value={filters.hintsAllowed}
                    onChange={(e) => setFilters({ ...filters, hintsAllowed: parseInt(e.target.value) })}
                  >
                    <option value={0}>No Hints</option>
                    <option value={1}>1 Hint</option>
                    <option value={2}>2 Hints</option>
                    <option value={3}>3 Hints</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={startGame}
                className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
              >
                Start Crossword
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
            src="/doodiecrossword.png" 
            alt="Doodle Crossword" 
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
              SOLVE THE PUZZLE! 
              <br />
              <span style={{ color: '#6c5ce7' }}>WORDS & WISDOM!</span>
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
        <p style={{  fontSize: '1.5rem', color: 'var(--doodle-ink)'}}>Generating Crossword...</p>
      </div>
    </div>
  );

  const renderGrid = () => {
    if (!crosswordData) return null;

    const cellSize = 40;
    const progress = checkProgress();

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="doodle-paper p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/home')}
                  className="doodle-btn btn-sm" style={{background: 'var(--doodle-sketch)', color: 'white'}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Exit
                </button>
                <div>
                  <h2 className="text-xl font-bold" style={{color: 'var(--doodle-ink)',  }}>Crossword Challenge</h2>
                  <p className="text-sm" style={{color: 'var(--doodle-secondary)',  }}>Click a cell to start typing</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {filters.hintsAllowed > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={useHint}
                      className="btn btn-warning btn-sm"
                      disabled={hintsRemaining === 0 || !selectedWord}
                      title={!selectedWord ? "Select a word first" : hintsRemaining === 0 ? "No hints remaining" : "Use a hint"}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="font-semibold">{hintsRemaining}</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowRules(true)}
                  className="doodle-btn btn-sm"
                  style={{background: 'var(--doodle-blue)', color: 'white'}}
                  title="How to Play"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-blue)',  }}>{progress.correct}/{progress.total}</div>
                  <div className="text-xs" style={{color: 'var(--doodle-secondary)',  }}>Completed</div>
                </div>
                <button
                  onClick={handleSubmit}
                  className="doodle-btn doodle-btn-secondary"
                  disabled={progress.correct === 0}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Crossword Grid */}
            <div className="lg:col-span-2">
              <div className="doodle-paper p-6 flex justify-center items-start">
                <div 
                  ref={gridRef}
                  style={{
                    display: 'inline-grid',
                    gridTemplateColumns: `repeat(${crosswordData.grid[0].length}, ${cellSize}px)`,
                    gap: '2px',
                    background: '#354257',
                    padding: '2px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {crosswordData.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isLetter = cell !== null;
                      const wordAtCell = crosswordData.placements.find(p =>
                        (p.direction === 'across' && p.row === rowIndex && p.col === colIndex) ||
                        (p.direction === 'down' && p.row === rowIndex && p.col === colIndex)
                      );
                      
                      const isSelected = selectedWord && (
                        (selectedWord.direction === 'across' && selectedWord.row === rowIndex && colIndex >= selectedWord.col && colIndex < selectedWord.col + selectedWord.word.length) ||
                        (selectedWord.direction === 'down' && selectedWord.col === colIndex && rowIndex >= selectedWord.row && rowIndex < selectedWord.row + selectedWord.word.length)
                      );

                      // Get user's letter for this cell
                      let userLetter = '';
                      let isPrefilled = false;
                      let isHintFilled = false;
                      const cellKey = `${rowIndex}-${colIndex}`;
                      
                      if (selectedWord && isSelected) {
                        const offset = selectedWord.direction === 'across' 
                          ? colIndex - selectedWord.col 
                          : rowIndex - selectedWord.row;
                        userLetter = (userAnswers[selectedWord.number] || '')[offset] || '';
                        isPrefilled = userLetter && userLetter === selectedWord.word[offset];
                        isHintFilled = hintUsedCells.has(cellKey);
                      } else {
                        // Check all words for this cell
                        for (const placement of crosswordData.placements) {
                          if (placement.direction === 'across' && placement.row === rowIndex && colIndex >= placement.col && colIndex < placement.col + placement.word.length) {
                            const offset = colIndex - placement.col;
                            userLetter = (userAnswers[placement.number] || '')[offset] || '';
                            if (userLetter) {
                              isPrefilled = userLetter === placement.word[offset];
                              isHintFilled = hintUsedCells.has(cellKey);
                              break;
                            }
                          } else if (placement.direction === 'down' && placement.col === colIndex && rowIndex >= placement.row && rowIndex < placement.row + placement.word.length) {
                            const offset = rowIndex - placement.row;
                            userLetter = (userAnswers[placement.number] || '')[offset] || '';
                            if (userLetter) {
                              isPrefilled = userLetter === placement.word[offset];
                              isHintFilled = hintUsedCells.has(cellKey);
                              break;
                            }
                          }
                        }
                      }

                      // Check if correct or locked
                      const isCorrect = userLetter && userLetter === cell;
                      const isLockedCell = lockedCells.has(cellKey);
                      
                      // Check if this word is marked incorrect
                      let isIncorrect = false;
                      if (selectedWord && isSelected) {
                        isIncorrect = wordStatus[selectedWord.number] === 'incorrect';
                      } else {
                        // Check all words for this cell
                        for (const placement of crosswordData.placements) {
                          if (placement.direction === 'across' && placement.row === rowIndex && colIndex >= placement.col && colIndex < placement.col + placement.word.length) {
                            if (wordStatus[placement.number] === 'incorrect') {
                              isIncorrect = true;
                              break;
                            }
                          } else if (placement.direction === 'down' && placement.col === colIndex && rowIndex >= placement.row && rowIndex < placement.row + placement.word.length) {
                            if (wordStatus[placement.number] === 'incorrect') {
                              isIncorrect = true;
                              break;
                            }
                          }
                        }
                      }
                      
                      // Check if this is the selected cell (cursor)
                      const isCursorCell = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => isLetter && handleCellClick(rowIndex, colIndex)}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            background: isLetter 
                              ? isLockedCell
                                ? '#10b981'
                                : isIncorrect
                                  ? '#ef4444'
                                  : isCursorCell
                                    ? '#fbbf24'
                                    : isCorrect
                                      ? '#34d399'
                                      : isSelected 
                                        ? '#60a5fa' 
                                        : isHintFilled
                                          ? '#fcd34d'
                                          : isPrefilled
                                            ? '#818cf8'
                                            : 'white'
                              : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isLetter ? (isLockedCell ? 'not-allowed' : 'pointer') : 'default',
                            position: 'relative',
                            fontWeight: (isPrefilled || isHintFilled || isCorrect || isLockedCell) ? '900' : 'bold',
                            fontSize: '20px',
                            color: isLetter 
                              ? isLockedCell
                                ? 'white'
                                : isIncorrect
                                  ? 'white'
                                  : isCorrect 
                                    ? '#065f46' 
                                    : isHintFilled 
                                      ? '#78350f' 
                                      : isPrefilled 
                                        ? '#3730a3' 
                                        : isCursorCell
                                          ? '#92400e'
                                          : isSelected
                                            ? 'white'
                                            : '#1e293b'
                              : 'transparent',
                            transition: 'all 0.3s ease',
                            border: isCursorCell 
                              ? '3px solid #b45309' 
                              : isLetter 
                                ? '2px solid #475569' 
                                : 'none',
                            boxShadow: isCursorCell 
                              ? '0 0 0 3px rgba(180, 83, 9, 0.3), inset 0 2px 4px rgba(0,0,0,0.1)' 
                              : isLockedCell
                                ? '0 0 8px rgba(16, 185, 129, 0.5)'
                                : isLetter 
                                  ? 'inset 0 2px 4px rgba(0,0,0,0.06)' 
                                  : 'none',
                            borderRadius: '2px',
                            pointerEvents: isLockedCell ? 'none' : 'auto'
                          }}
                        >
                          {wordAtCell && (
                            <span style={{
                              position: 'absolute',
                              top: '1px',
                              left: '2px',
                              fontSize: '11px',
                              fontWeight: '900',
                              color: '#475569',
                              textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                              lineHeight: '1'
                            }}>
                              {wordAtCell.number}
                            </span>
                          )}
                          {userLetter}
                          {isCursorCell && !userLetter && (
                            <span style={{
                              position: 'absolute',
                              width: '2px',
                              height: '24px',
                              background: '#92400e',
                              animation: 'blink 1s infinite'
                            }} />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Clues Panel */}
            <div className="lg:col-span-1">
              <div className="doodle-paper p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4" style={{color: 'var(--doodle-ink)',  }}>Clues</h3>
                
                <div className="space-y-6">
                  {['across', 'down'].map(direction => {
                    const words = crosswordData.placements
                      .filter(p => p.direction === direction)
                      .sort((a, b) => a.number - b.number);
                    
                    if (words.length === 0) return null;
                    
                    return (
                      <div key={direction}>
                        <h4 className="text-lg font-semibold mb-3 uppercase" style={{color: 'var(--doodle-secondary)',  }}>
                          {direction}
                        </h4>
                        <div className="space-y-3">
                          {words.map(word => {
                            const isComplete = wordStatus[word.number] === 'correct';
                            const isActive = selectedWord?.number === word.number;
                            const isIncorrect = wordStatus[word.number] === 'incorrect';
                            
                            return (
                              <div
                                key={word.number}
                                onClick={() => {
                                  if (!isComplete) {
                                    setSelectedWord(word);
                                    setActiveDirection(word.direction);
                                    setSelectedCell({ row: word.row, col: word.col });
                                    setShowClue(word);
                                  }
                                }}
                                className={`doodle-card p-3 cursor-pointer transition-all ${
                                  isActive 
                                    ? 'shadow-lg scale-105' 
                                    : ''
                                }`}
                                style={{
                                  backgroundColor: isActive 
                                    ? '#dbeafe' 
                                    : isComplete
                                      ? '#dcfce7'
                                      : isIncorrect
                                        ? '#fee2e2'
                                        : 'var(--doodle-paper)',
                                  borderColor: isActive 
                                    ? 'var(--doodle-blue)' 
                                    : isComplete
                                      ? 'var(--doodle-green)'
                                      : isIncorrect
                                        ? '#ef4444'
                                        : 'var(--doodle-ink)',
                                  opacity: isComplete ? 0.7 : 1,
                                  cursor: isComplete ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="font-bold min-w-[24px]" style={{color: 'var(--doodle-blue)',  }}>
                                    {word.number}.
                                  </span>
                                  <div className="flex-1">
                                    <MathJaxContent 
                                      key={`${word.id}-clue`}
                                      className="text-sm leading-snug"
                                      style={{color: 'var(--doodle-ink)',  }}
                                    >
                                      {word.clue.length > 100 ? word.clue.substring(0, 100) + '...' : word.clue}
                                    </MathJaxContent>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-xs px-2 py-0.5 rounded" style={{backgroundColor: '#f3e8ff', color: 'var(--doodle-purple)',  }}>
                                        {word.word.length} letters
                                      </span>
                                      <span className="text-xs" style={{color: 'var(--doodle-secondary)',  }}>{word.subject}</span>
                                      {isComplete && (
                                        <span className="text-xs font-bold flex items-center gap-1" style={{color: 'var(--doodle-green)',  }}>
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          Correct
                                        </span>
                                      )}
                                      {isIncorrect && (
                                        <span className="text-xs font-bold" style={{color: '#ef4444',  }}>✗ Try Again</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Full Clue Modal */}
          {showClue && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowClue(null)}
            >
              <div 
                className="doodle-paper max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold" style={{color: 'var(--doodle-blue)',  }}>{showClue.number}</span>
                      <div>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold uppercase" style={{backgroundColor: '#dbeafe', color: 'var(--doodle-blue)',  }}>
                          {showClue.direction}
                        </span>
                        <div className="text-sm mt-1" style={{color: 'var(--doodle-secondary)',  }}>
                          {showClue.word.length} letters • {showClue.subject}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowClue(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2" style={{color: 'var(--doodle-ink)',  }}>Question:</h4>
                    <MathJaxContent 
                      key={`${showClue.id}-full-clue`}
                      className="text-lg leading-relaxed"
                      style={{color: 'var(--doodle-ink)',  }}
                    >
                      {showClue.clue}
                    </MathJaxContent>
                  </div>

                  {/* Question Images */}
                  {showClue.hasImages && showClue.imageUrls && showClue.imageUrls.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2" style={{color: 'var(--doodle-ink)',  }}>Images:</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {showClue.imageUrls.map((imageUrl, index) => (
                          <div key={index} className="rounded-lg overflow-hidden" style={{border: '3px solid var(--doodle-ink)', backgroundColor: '#f7fafc'}}>
                            <img 
                              src={imageUrl} 
                              alt={`Question diagram ${index + 1}`}
                              className="w-full h-auto"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowClue(null)}
                      className="doodle-btn doodle-btn-secondary flex-1"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCompleted = () => {
    const progress = checkProgress();
    // Good performance if > 70% correct
    const isGoodPerformance = progress.percentage >= 70;
    
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
                  {progress.percentage === 100 ? '🎉 Perfect!' : isGoodPerformance ? '✨ Great Job!' : 'Nice Try!'}
                </h1>
                <p className="text-lg" style={{color: 'var(--doodle-secondary)',  }}>
                  You completed {progress.correct} out of {progress.total} words ({progress.percentage}%)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="doodle-card p-4" style={{backgroundColor: '#dcfce7', borderColor: 'var(--doodle-green)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-green)',  }}>{progress.correct}</div>
                  <div className="text-sm" style={{color: '#166534',  }}>Correct</div>
                </div>
                <div className="doodle-card p-4" style={{backgroundColor: '#dbeafe', borderColor: 'var(--doodle-blue)'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-blue)',  }}>{progress.total}</div>
                  <div className="text-sm" style={{color: '#1e40af',  }}>Total Words</div>
                </div>
                <div className="doodle-card p-4" style={{backgroundColor: '#fef9c3', borderColor: 'var(--doodle-yellow)', gridColumn: 'span 2'}}>
                  <div className="text-2xl font-bold" style={{color: 'var(--doodle-yellow)',  }}>{progress.percentage}%</div>
                  <div className="text-sm" style={{color: '#854d0e',  }}>Completion Rate</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setGameState('menu');
                    setUserAnswers({});
                    setSelectedWord(null);
                    setWordStatus({});
                    setLockedCells(new Set());
                    setActiveDirection('across');
                  }}
                  className="doodle-btn flex-1"
                  style={{background: 'var(--doodle-sketch)', color: 'var(--doodle-ink)'}}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Puzzle
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
                    EXCELLENT WORK! 🎉
                    <br />
                    <span style={{ color: '#6c5ce7' }}>WORD MASTER!</span>
                  </>
                ) : (
                  <>
                    GOOD EFFORT! 💪
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
  };

  const renderRules = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">How to Play</h2>
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
              <p>Fill in the crossword grid by solving questions that serve as clues!</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">📝 How to Play</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Click on any cell in the crossword grid to select it</li>
                <li>Read the question clue that appears in the modal</li>
                <li>The answer should be typed in UPPERCASE letters only</li>
                <li>Navigate using arrow keys or click cells directly</li>
                <li>Click "Submit" when you've completed all words</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Hints System</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Select a word by clicking on any of its cells</li>
                <li>Click the hint button (💡) to reveal one letter</li>
                <li>Hints are limited - use them wisely!</li>
                <li>Choose how many hints (0-3) before starting the game</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">⚙️ Game Settings</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Word Size:</strong> Choose from 8-15 letter words</li>
                <li><strong>Prefill Mode:</strong> Get 0-3 letters pre-filled per word for help</li>
                <li><strong>Subject Filter:</strong> Focus on a particular subject</li>
                <li><strong>Difficulty:</strong> Choose Easy, Medium, or Hard questions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🎨 Visual Cues</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Blue cells: Correct letters</li>
                <li>Yellow cells: Letters revealed by hints</li>
                <li>White cells: Empty cells to fill</li>
                <li>Selected word highlights in color</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">✅ Scoring</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Each correct word adds to your score</li>
                <li>Complete all words to finish the crossword</li>
                <li>Submit when ready to check your answers</li>
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
  );

  // Main render
  return (
    <div className="doodle-container min-h-screen">
      {gameState === 'menu' && renderMenu()}
      {gameState === 'loading' && renderLoading()}
      {gameState === 'playing' && renderGrid()}
      {gameState === 'completed' && renderCompleted()}
      {showRules && renderRules()}
    </div>
  );
};

export default CrosswordGame;
