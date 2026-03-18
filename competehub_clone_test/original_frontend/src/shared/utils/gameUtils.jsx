// src/utils/gameUtils.js
// Note: This file is now deprecated. Use the useGames hook from UserContext instead.
// Keeping this for backward compatibility and utility functions only.

export const createClickEffect = (e) => {
  const ripple = document.createElement('div');
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  ripple.style.position = 'absolute';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.style.width = '20px';
  ripple.style.height = '20px';
  ripple.style.background = 'var(--doodle-yellow)';
  ripple.style.borderRadius = '50%';
  ripple.style.transform = 'translate(-50%, -50%) scale(0)';
  ripple.style.animation = 'ripple 0.6s ease-out';
  ripple.style.pointerEvents = 'none';
  ripple.style.zIndex = '1000';
  
  e.currentTarget.style.position = 'relative';
  e.currentTarget.appendChild(ripple);
  
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
};

export const getRandomRotation = () => {
  return Math.random() * 6 - 3; // -3 to 3 degrees
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};