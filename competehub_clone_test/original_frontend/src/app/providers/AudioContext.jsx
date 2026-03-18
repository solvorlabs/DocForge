import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const location = useLocation();
  
  // Volume states (0 to 1)
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved !== null ? parseFloat(saved) : 0.3; // Start at 30%
  });
  
  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = localStorage.getItem('soundVolume');
    return saved !== null ? parseFloat(saved) : 0.4; // Start at 40%
  });
  
  // Track if sounds are initialized
  const soundsInitialized = useRef(false);
  
  // Audio refs
  const mainMusicRef = useRef(null);
  const arenaMusicRef = useRef(null);
  const currentMusicRef = useRef(null);
  
  // Sound effect refs
  const clickSoundRef = useRef(null);
  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);
  const achievementSoundRef = useRef(null);
  const notificationSoundRef = useRef(null);
  
  // Initialize audio elements
  useEffect(() => {
    // Initialize music (we'll use notification.wav as main music and achievement.wav as arena music)
    mainMusicRef.current = new Audio('/music/typebeat.mp3');
    mainMusicRef.current.loop = true;
    mainMusicRef.current.volume = musicVolume;
    
    arenaMusicRef.current = new Audio('/music/typebeat.mp3');
    arenaMusicRef.current.loop = true;
    arenaMusicRef.current.volume = musicVolume;
    
    // Initialize sound effects
    clickSoundRef.current = new Audio('/sounds/click.wav');
    successSoundRef.current = new Audio('/sounds/click.wav');
    errorSoundRef.current = new Audio('/sounds/error.wav');
    achievementSoundRef.current = new Audio('/sounds/achievement.wav');
    notificationSoundRef.current = new Audio('/sounds/notification.wav');
    
    // Set initial volumes
    [clickSoundRef, successSoundRef, errorSoundRef, achievementSoundRef, notificationSoundRef].forEach(ref => {
      if (ref.current) ref.current.volume = soundVolume;
    });
    
    soundsInitialized.current = true;
    
    // Start main music
    const startMusic = async () => {
      try {
        await mainMusicRef.current.play();
        currentMusicRef.current = mainMusicRef.current;
      } catch (err) {
        console.log('Audio autoplay prevented. User interaction required.');
      }
    };
    
    startMusic();
    
    // Add global click handler for all buttons
    const handleGlobalClick = (e) => {
      const target = e.target;
      const button = target.closest('button, a, .clickable, [role="button"]');
      
      if (button && soundsInitialized.current && clickSoundRef.current) {
        // Don't play for volume controls to avoid double sounds
        if (!button.closest('.volume-control-container')) {
          clickSoundRef.current.currentTime = 0;
          clickSoundRef.current.play().catch(() => {});
        }
      }
    };
    
    document.addEventListener('click', handleGlobalClick, true);
    
    return () => {
      // Cleanup
      document.removeEventListener('click', handleGlobalClick, true);
      
      if (mainMusicRef.current) {
        mainMusicRef.current.pause();
        mainMusicRef.current = null;
      }
      if (arenaMusicRef.current) {
        arenaMusicRef.current.pause();
        arenaMusicRef.current = null;
      }
    };
  }, []);
  
  // Handle music transitions based on route
  useEffect(() => {
    const isArenaPage = [
      '/game/', '/room/', '/ranked/battle', '/solo-challenge',
      '/custom-rooms', '/games/', '/daily-challenge'
    ].some(path => location.pathname.includes(path));
    
    const targetMusic = isArenaPage ? arenaMusicRef.current : mainMusicRef.current;
    
    if (currentMusicRef.current !== targetMusic) {
      const fadeOut = () => {
        if (currentMusicRef.current && currentMusicRef.current.volume > 0.01) {
          currentMusicRef.current.volume = Math.max(0, currentMusicRef.current.volume - 0.05);
          setTimeout(fadeOut, 50);
        } else {
          if (currentMusicRef.current) {
            currentMusicRef.current.pause();
            currentMusicRef.current.currentTime = 0;
          }
          
          // Start new music
          currentMusicRef.current = targetMusic;
          if (currentMusicRef.current) {
            currentMusicRef.current.volume = 0;
            currentMusicRef.current.play().then(() => {
              fadeIn();
            }).catch(err => console.log('Music play prevented:', err));
          }
        }
      };
      
      const fadeIn = () => {
        if (currentMusicRef.current && currentMusicRef.current.volume < musicVolume - 0.01) {
          currentMusicRef.current.volume = Math.min(musicVolume, currentMusicRef.current.volume + 0.05);
          setTimeout(fadeIn, 50);
        } else if (currentMusicRef.current) {
          currentMusicRef.current.volume = musicVolume;
        }
      };
      
      fadeOut();
    }
  }, [location.pathname, musicVolume]);
  
  // Update volumes when changed
  useEffect(() => {
    localStorage.setItem('musicVolume', musicVolume.toString());
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = musicVolume;
    }
    if (mainMusicRef.current) mainMusicRef.current.volume = musicVolume;
    if (arenaMusicRef.current) arenaMusicRef.current.volume = musicVolume;
  }, [musicVolume]);
  
  useEffect(() => {
    localStorage.setItem('soundVolume', soundVolume.toString());
    [clickSoundRef, successSoundRef, errorSoundRef, achievementSoundRef, notificationSoundRef].forEach(ref => {
      if (ref.current) ref.current.volume = soundVolume;
    });
  }, [soundVolume]);
  
  // Sound effect functions
  const playSound = useCallback((soundRef) => {
    if (soundRef.current && soundVolume > 0) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(err => console.log('Sound play error:', err));
    }
  }, [soundVolume]);
  
  const playClick = useCallback(() => playSound(clickSoundRef), [playSound]);
  const playSuccess = useCallback(() => playSound(successSoundRef), [playSound]);
  const playError = useCallback(() => playSound(errorSoundRef), [playSound]);
  const playAchievement = useCallback(() => playSound(achievementSoundRef), [playSound]);
  const playNotification = useCallback(() => playSound(notificationSoundRef), [playSound]);
  
  const value = {
    musicVolume,
    soundVolume,
    setMusicVolume,
    setSoundVolume,
    playClick,
    playSuccess,
    playError,
    playAchievement,
    playNotification,
  };
  
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
