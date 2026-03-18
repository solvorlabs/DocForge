// utils/authUtils.js

/**
 * Check if user is logged in
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Require login for ranked games
 * Shows alert and navigates to auth page if not logged in
 */
export const requireLoginForRanked = (navigate) => {
  if (!isLoggedIn()) {
    alert('Please login to play ranked games and compete for ELO ratings!');
    navigate('/auth');
    return false;
  }
  return true;
};

/**
 * Handle anonymous/guest gameplay for non-ranked modes
 * Returns object with allowPlay, anonymous, and message
 */
export const handleAnonymousChallenge = (gameType) => {
  if (!isLoggedIn()) {
    const confirmPlay = window.confirm(
      `You're playing as a guest! Your score won't be saved to leaderboards.\n\nClick OK to continue or Cancel to login first.`
    );
    
    if (confirmPlay) {
      return { 
        allowPlay: true, 
        anonymous: true,
        message: 'Playing as guest - score will not be saved' 
      };
    } else {
      return { 
        allowPlay: false, 
        anonymous: false,
        message: 'Please login to save your progress' 
      };
    }
  }
  
  return { 
    allowPlay: true, 
    anonymous: false,
    message: 'Logged in - score will be saved' 
  };
};

/**
 * Show guest prompt for features that require login
 * Returns true if user wants to continue as guest
 */
export const showGuestPrompt = () => {
  return window.confirm(
    'You are not logged in. You can play as a guest, but your scores will not be saved to the leaderboard.\n\nWould you like to continue as a guest?'
  );
};

/**
 * Check if feature requires login
 * Use this for features that absolutely need authentication
 */
export const requireLogin = (navigate, message = 'Please login to access this feature!') => {
  if (!isLoggedIn()) {
    alert(message);
    navigate('/auth');
    return false;
  }
  return true;
};