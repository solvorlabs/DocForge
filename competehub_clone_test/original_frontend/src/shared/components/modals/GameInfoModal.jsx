import React from 'react';
import { Play, X, Star, Users, Clock, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GameInfoModal.css';

const GameInfoModal = ({ 
  showInfoModal, 
  selectedGameInfo, 
  onClose 
}) => {
  const navigate = useNavigate();

  if (!showInfoModal || !selectedGameInfo) return null;

  const handlePlayClick = () => {
    navigate(selectedGameInfo.route);
    onClose();
  };

  const getGameIcon = (gameMode) => {
    // This would be passed from the parent or determined by game type
    return <Play size={24} />;
  };

  const getGameColor = (gameMode) => {
    return gameMode.color || 'var(--doodle-accent)';
  };

  return (
    <div className="game-info-modal-overlay" onClick={onClose}>
      <div 
        className="game-info-modal"
        style={{ 
          // background: `linear-gradient(135deg, ${getGameColor(selectedGameInfo)} 0%, ${getGameColor(selectedGameInfo)}CC 100%)`
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Doodle Decorations */}
      
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="game-icon">
              {getGameIcon(selectedGameInfo)}
            </div>
            <h3 className="modal-title">
              {selectedGameInfo.title}
            </h3>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Game Stats */}
          <div className="game-stats">
            <div className="stat-item">
              <Users size={16} />
              <span>Multiplayer</span>
            </div>
            <div className="stat-item">
              <Clock size={16} />
              <span>5-10 min</span>
            </div>
            <div className="stat-item">
              <Trophy size={16} />
              <span>Competitive</span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="game-subtitle">
            {selectedGameInfo.subtitle}
          </p>

          {/* Description */}
          <div className="game-description">
            <p>{selectedGameInfo.info}</p>
          </div>

          {/* Features */}
          {/* <div className="game-features">
            <h4>Game Features:</h4>
            <ul>
              <li>🎯 Real-time multiplayer battles</li>
              <li>📊 ELO rating system</li>
              <li>🏆 Achievement system</li>
              <li>📈 Progress tracking</li>
            </ul>
          </div> */}

          {/* Action Buttons */}
          <div className="modal-actions">
            <button 
              className="play-button"
              onClick={handlePlayClick}
            >
              <Play size={16} style={{ marginRight: '8px' }} />
              Play Now
            </button>
            <button 
              className="close-modal-button"
              onClick={onClose}
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Doodle Border Effects */}
        <div className="doodle-border doodle-border-top"></div>
        <div className="doodle-border doodle-border-right"></div>
        <div className="doodle-border doodle-border-bottom"></div>
        <div className="doodle-border doodle-border-left"></div>
      </div>
    </div>
  );
};

export default GameInfoModal;
