// src/components/MemeActions.jsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Fab, Tooltip, Snackbar, Alert } from '@mui/material';
import { keyframes } from '@mui/system';

// Sound effects helper (using Web Audio API)
const playSound = (frequency, duration, type = 'sine') => {
  if (typeof window !== 'undefined' && window.AudioContext) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }
};

const ThrowingObject = ({ emoji, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '10%',
        fontSize: '3rem',
        animation: 'fly-in 1.5s ease-out forwards',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      {emoji}
    </Box>
  );
};

const MemeActions = ({ isMyTurn, onCorrectAnswer, onWrongAnswer }) => {
  const [throwingObject, setThrowingObject] = useState(null);
  const [showAlert, setShowAlert] = useState(null);
  const [cursorMode, setCursorMode] = useState('normal');

  const memeObjects = [
    { emoji: '🍅', name: 'Tomato', cursor: 'cursor-tomato', sound: [400, 0.2] },
    { emoji: '🥿', name: 'Slipper', cursor: 'cursor-slipper', sound: [300, 0.3] },
    { emoji: '💩', name: 'Poop', cursor: 'cursor-poop', sound: [200, 0.4] },
    { emoji: '🏏', name: 'Cricket Bat', cursor: 'cursor-bat', sound: [150, 0.5] }
  ];

  const goofyMessages = [
    "Bruh! That was sus! 🤪",
    "No cap, you're on fire! 🔥",
    "That's bussin fr fr! 💯",
    "Sheesh! Big brain energy! 🧠",
    "Periodt! You ate that up! ✨",
    "That hit different! 🎯",
    "Main character energy! 👑",
    "You're living rent free in their heads! 🏠",
    "Say less, you understood the assignment! 📝"
  ];

  const sadMessages = [
    "Oof, that's rough buddy 😅",
    "It's giving confused vibes 🤔",
    "That wasn't it chief 🫠",
    "Yikes! Better luck next time bestie 💀",
    "Not you missing that easy one 🙈",
    "That's a big L my guy 😬",
    "Certified bruh moment 🤡"
  ];

  const throwObject = (obj) => {
    if (throwingObject) return; // Prevent spam
    
    setThrowingObject(obj.emoji);
    playSound(...obj.sound);
    
    // Show random goofy message
    const messages = Math.random() > 0.5 ? goofyMessages : sadMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setShowAlert(randomMessage);
    
    setTimeout(() => {
      setThrowingObject(null);
      setShowAlert(null);
    }, 2000);
  };

  const changeCursor = (cursorClass) => {
    setCursorMode(cursorClass);
    document.body.className = cursorClass;
    
    setTimeout(() => {
      setCursorMode('normal');
      document.body.className = '';
    }, 3000);
  };

  // Celebration effects
  useEffect(() => {
    if (onCorrectAnswer) {
      playSound(523, 0.2); // C note
      playSound(659, 0.2); // E note
      playSound(784, 0.4); // G note
      
      setShowAlert(goofyMessages[Math.floor(Math.random() * goofyMessages.length)]);
      setTimeout(() => setShowAlert(null), 3000);
    }
  }, [onCorrectAnswer]);

  useEffect(() => {
    if (onWrongAnswer) {
      playSound(220, 0.5, 'sawtooth'); // Sad trombone sound
      
      setShowAlert(sadMessages[Math.floor(Math.random() * sadMessages.length)]);
      setTimeout(() => setShowAlert(null), 3000);
    }
  }, [onWrongAnswer]);

  return (
    <>
      {/* Floating Action Buttons for Meme Actions */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1000
        }}
      >
        <Tooltip title="Change to fun cursor!" placement="left">
          <Fab
            size="small"
            sx={{ 
              backgroundColor: '#ff6b6b',
              '&:hover': { backgroundColor: '#ff5252' },
              animation: 'bounce 2s infinite'
            }}
            onClick={() => {
              const randomCursor = memeObjects[Math.floor(Math.random() * memeObjects.length)];
              changeCursor(randomCursor.cursor);
            }}
          >
            🎯
          </Fab>
        </Tooltip>

        {memeObjects.map((obj, index) => (
          <Tooltip key={index} title={`Throw ${obj.name}!`} placement="left">
            <Fab
              size="small"
              sx={{
                fontSize: '1.2rem',
                '&:hover': { 
                  transform: 'scale(1.1)',
                  animation: 'shake 0.5s infinite'
                }
              }}
              onClick={() => throwObject(obj)}
            >
              {obj.emoji}
            </Fab>
          </Tooltip>
        ))}
      </Box>

      {/* Flying Object Animation */}
      {throwingObject && (
        <ThrowingObject 
          emoji={throwingObject} 
          onComplete={() => setThrowingObject(null)} 
        />
      )}

      {/* Goofy Alert Messages */}
      <Snackbar
        open={!!showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={showAlert?.includes('🔥') || showAlert?.includes('💯') ? 'success' : 'info'}
          sx={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            animation: 'bounce 1s ease-out'
          }}
        >
          {showAlert}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MemeActions;
