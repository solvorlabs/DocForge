import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '../../../app/providers/AudioContext';
import { MusicNote, VolumeUp, VolumeOff } from '@mui/icons-material';
import './VolumeControl.css';

const VolumeControl = () => {
  const { musicVolume, soundVolume, setMusicVolume, setSoundVolume, playClick } = useAudio();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const handleToggle = () => {
    playClick();
    setIsExpanded(!isExpanded);
  };

  const handleMusicChange = (e) => {
    const value = parseFloat(e.target.value);
    setMusicVolume(value);
  };

  const handleSoundChange = (e) => {
    const value = parseFloat(e.target.value);
    setSoundVolume(value);
    playClick();
  };

  const toggleMusicMute = () => {
    playClick();
    setMusicVolume(musicVolume > 0 ? 0 : 0.3);
  };

  const toggleSoundMute = () => {
    playClick();
    setSoundVolume(soundVolume > 0 ? 0 : 0.4);
  };

  return (
    <div className="volume-control-container" ref={containerRef}>
      <button
        className="volume-toggle-btn doodle-btn"
        onClick={handleToggle}
        aria-label="Toggle volume controls"
      >
        {musicVolume > 0 || soundVolume > 0 ? <VolumeUp /> : <VolumeOff />}
      </button>

      {isExpanded && (
        <div className="volume-panel doodle-card">
          <div className="volume-control-item">
            <div className="volume-label">
              <MusicNote fontSize="small" />
              <span>Music</span>
            </div>
            <div className="volume-slider-container">
              <button
                className="mute-btn"
                onClick={toggleMusicMute}
                aria-label={musicVolume > 0 ? "Mute music" : "Unmute music"}
              >
                {musicVolume > 0 ? '🔊' : '🔇'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={handleMusicChange}
                className="volume-slider doodle-slider"
                aria-label="Music volume"
              />
              <span className="volume-value">{Math.round(musicVolume * 100)}%</span>
            </div>
          </div>

          <div className="volume-control-item">
            <div className="volume-label">
              <VolumeUp fontSize="small" />
              <span>Sound</span>
            </div>
            <div className="volume-slider-container">
              <button
                className="mute-btn"
                onClick={toggleSoundMute}
                aria-label={soundVolume > 0 ? "Mute sounds" : "Unmute sounds"}
              >
                {soundVolume > 0 ? '🔊' : '🔇'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={soundVolume}
                onChange={handleSoundChange}
                className="volume-slider doodle-slider"
                aria-label="Sound effects volume"
              />
              <span className="volume-value">{Math.round(soundVolume * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolumeControl;
