import React from 'react';
import { Users, Lock, Info } from 'lucide-react';
import { createClickEffect } from '../../../shared/utils/doodleUtils';
import './GameModeCard.css';

// Map game IDs to their corresponding doodie images
const gameImageMap = {
  'ranked-multiplayer': '/doodierankedcropped.png',
  'custom-rooms': '/doodieroomscropped.png',
  'practice-questions': '/doodiesolocropped.png',
  'equation-builder': '/doodieequationcropped.png',
  'boss-mode': '/doodiebosscropped.png',
  'crossword-game': '/doodiecrosswordcropped.png',
  'dragonout-game': '/doodiedragoncropped.png',
  'endless-runner': '/doodierunnercropped.png',
  'quantum-chess': '/doodiequantum.png',
  'escape-lab': '/doodie.png',
  'gene-splicer': '/doodie.png',
  'mind-readers': '/doodie.png',
  'neuro-network': '/doodie.png',
  'time-loop': '/doodieparadox.png',
  'chemical-crafting': '/doodie.png',
  'ecosystem-sim': '/doodie.png',
  'science-quiz': '/doodie.png',
  'ai-training': '/doodie.png',
  'particle-collider': '/doodie.png',
  'science-codenames': '/doodie.png',
  'physics-puzzle': '/doodie.png'
};

// Lighten the original colors
const lightenColor = (color, locked) => {
  if (locked) return 'var(--doodle-secondary)';
  
  // Color mapping to lighter versions
  const lightColorMap = {
    '#4285f4': '#A8C8FF', // Ranked - light blue
    '#9c27b0': '#E1BEE7', // Custom rooms - light purple
    '#0f9d58': '#A5D6A7', // Practice - light green
    '#673ab7': '#D1C4E9', // Equation/Crossword - light deep purple
    '#1565c0': '#90CAF9', // Boss - light blue
    '#e91e63': '#F8BBD0', // Dragon - light pink
    '#ff6b35': '#FFCCBC', // Runner - light orange
    '#7b1fa2': '#E1BEE7', // Quantum - light purple
    '#00695c': '#B2DFDB', // Escape lab - light teal
    '#00838f': '#B2EBF2', // Gene - light cyan
    '#2196f3': '#BBDEFB', // Neuro - light blue
    '#ff5722': '#FFCCBC', // Time loop - light deep orange
    '#4caf50': '#C8E6C9', // Chemical - light green
    '#8bc34a': '#DCEDC8', // Ecosystem - light lime
    '#ffc107': '#FFECB3', // Quiz - light amber
    '#3f51b5': '#C5CAE9', // AI - light indigo
    '#607d8b': '#CFD8DC', // Physics - light blue grey
    '#ff9800': '#FFE0B2'  // Codenames - light orange
  };
  
  return lightColorMap[color] || color;
};

const GameModeCard = ({ 
  gameMode, 
  onGameModeClick, 
  onGameInfo 
}) => {
  const handleClick = (e) => {
    if (gameMode.locked) return;
    createClickEffect(e);
    onGameModeClick(gameMode);
  };

  const handleInfoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onGameInfo(gameMode, e);
  };

  const doodieImage = gameImageMap[gameMode.id] || '/doodie.png';
  const accentColor = lightenColor(gameMode.color, gameMode.locked);

  return (
    <div
      className={`game-mode-card doodle-tape ${gameMode.locked ? 'locked' : ''} ${gameMode.status === 'coming-soon' ? 'coming-soon' : ''}`}
      onClick={handleClick}
      style={{
        background: gameMode.locked 
          ? 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)' 
          : 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
        border: '3px solid var(--doodle-ink)',
        position: 'relative'
      }}
    >
      {/* Doodie Image */}
      <div className="game-image-container" style={{
        borderBottom: `3px solid ${accentColor}`,
        background: `linear-gradient(to bottom, ${accentColor}22, ${accentColor}11)`
      }}>
        <img 
          src={doodieImage} 
          alt={gameMode.title}
          className="game-doodie-image"
        />
      </div>
      
      {/* Info Button */}
      <button
        className="info-button"
        onClick={handleInfoClick}
        title="More info"
      >
        <Info size={12} />
      </button>

      {/* Badge */}
      {gameMode.badge && (
        <div className="game-badge">
          {gameMode.badge}
        </div>
      )}

      {/* Lock Icon */}
      {gameMode.locked && (
        <div className="lock-overlay">
          <Lock size={20} />
        </div>
      )}

      {/* Coming Soon Overlay */}
      {gameMode.status === 'coming-soon' && (
        <div className="coming-soon-overlay">
          {/* <div className="coming-soon-text">COMING SOON</div> */}
          <img src="comingsoon.png" alt="" />
        </div>
      )}

      {/* Content */}
      <div className="game-content">
        <div className="game-title-row">
          <div className="icon-wrapper" style={{ color: accentColor }}>
            {gameMode.icon ? (
              React.createElement(gameMode.icon, { size: 20 })
            ) : (
              <Users size={20} />
            )}
          </div>
          <h4 className="game-title" style={{ color: '#333' }}>
            {gameMode.title}
          </h4>
        </div>
        <p className="game-subtitle" style={{ color: '#444' }}>
          {gameMode.subtitle}
        </p>

        {gameMode.unlockText && (
          <p className="unlock-text">
            {gameMode.unlockText}
          </p>
        )}
      </div>
    </div>
  );
};

export default GameModeCard;
