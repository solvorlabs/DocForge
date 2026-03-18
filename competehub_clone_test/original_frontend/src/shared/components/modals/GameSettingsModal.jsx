import React, { useState, useEffect } from 'react';
import { X, Settings, Clock, Target, Zap, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { createClickEffect } from '../../utils/gameUtils';
import '../../../styles/themes/doodle.css';

const GameSettingsModal = ({ 
  isOpen, 
  onClose, 
  onStart, 
  gameType, 
  loading = false,
  questionMetadata = { subjects: {}, difficultyRange: { min: 1, max: 10 } }
}) => {
  const [settings, setSettings] = useState({
    selectedSubjects: [],
    difficultyRange: { min: 1, max: 10 },
    totalTime: 300, // 5 minutes default
    totalQuestions: 20,
    timePerQuestion: 30,
    advancedSettings: false,
    // Game-specific settings
    bossDifficulty: 1,
    attackFrequency: 0.3,
    typingChallenges: true,
    equationCount: 20,
    equationDifficulty: 'intermediate'
  });

  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    if (questionMetadata.subjects) {
      const subjects = Object.keys(questionMetadata.subjects);
      setAvailableSubjects(subjects);
      if (subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(subjects[0]);
      }
    }
  }, [questionMetadata, selectedSubject]);

  useEffect(() => {
    // Set game-specific defaults
    switch (gameType) {
      case 'numerical-speed-race':
        setSettings(prev => ({
          ...prev,
          totalTime: 300,
          totalQuestions: 50,
          timePerQuestion: 30,
          selectedSubjects: ['Mathematics', 'Physics']
        }));
        break;
      case 'equation-builder':
        setSettings(prev => ({
          ...prev,
          totalTime: 0, // No time limit
          totalQuestions: 20,
          equationCount: 20,
          equationDifficulty: 'intermediate',
          selectedSubjects: ['Physics', 'Chemistry', 'Mathematics']
        }));
        break;
      case 'boss-mode':
        setSettings(prev => ({
          ...prev,
          totalTime: 0, // No time limit
          totalQuestions: 30,
          bossDifficulty: 1,
          attackFrequency: 0.3,
          typingChallenges: true,
          selectedSubjects: ['Physics', 'Chemistry', 'Mathematics']
        }));
        break;
    }
  }, [gameType]);

  if (!isOpen) return null;

  const handleSubjectToggle = (subject) => {
    setSettings(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject]
    }));
  };

  const handleStartGame = (e) => {
    createClickEffect(e);
    onStart(settings);
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'numerical-speed-race': return 'Numerical Speed Race';
      case 'equation-builder': return 'Equation Builder';
      case 'boss-mode': return 'Boss Mode';
      default: return 'Game Settings';
    }
  };

  const getGameDescription = () => {
    switch (gameType) {
      case 'numerical-speed-race': return 'Solve numerical problems as fast as you can!';
      case 'equation-builder': return 'Assemble equations from scattered terms!';
      case 'boss-mode': return 'Face epic knowledge bosses in intense battles!';
      default: return 'Customize your game experience';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="doodle-card modal-content" onClick={(e) => e.stopPropagation()} style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '25px',
        margin: '0 auto',
        background: 'var(--doodle-paper)',
        border: '3px solid var(--doodle-accent)',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div className="doodle-avatar" style={{ 
              background: 'var(--doodle-accent)', 
              width: '50px', 
              height: '50px',
              flexShrink: 0
            }}>
              <Settings size={28} color="#fff" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 className="doodle-title" style={{ 
                margin: 0, 
                fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', 
                lineHeight: '1.2',
                color: 'var(--doodle-ink)'
              }}>
                {getGameTitle()}
              </h2>
              <p style={{ 
                margin: '5px 0 0 0', 
                color: 'var(--doodle-secondary)', 
                fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                lineHeight: '1.3'
              }}>
                {getGameDescription()}
              </p>
            </div>
          </div>
          <button 
            className="doodle-btn" 
            onClick={onClose}
            style={{ 
              background: 'var(--doodle-sketch)', 
              color: 'white', 
              padding: '10px',
              borderRadius: '8px',
              flexShrink: 0,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#666'}
            onMouseOut={(e) => e.target.style.background = 'var(--doodle-sketch)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Settings */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
              
            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', 
            color: 'var(--doodle-accent)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600',
            borderBottom: '2px solid var(--doodle-sketch)',
            paddingBottom: '10px'
          }}>
            <Target size={22} />
            Main Settings
          </h3>

          {/* Subject Selection */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
               
              fontWeight: '600',
              color: 'var(--doodle-ink)',
              fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
            }}>
              Select Subjects:
            </label>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '10px', 
              marginBottom: '12px' 
            }}>
              {availableSubjects.map(subject => (
                <button
                  key={subject}
                  className={`doodle-btn ${settings.selectedSubjects.includes(subject) ? 'doodle-btn-primary' : ''}`}
                  onClick={() => handleSubjectToggle(subject)}
                  style={{ 
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', 
                    padding: '8px 12px',
                    background: settings.selectedSubjects.includes(subject) 
                      ? 'var(--doodle-accent)' 
                      : 'var(--doodle-paper)',
                    color: settings.selectedSubjects.includes(subject) 
                      ? 'white' 
                      : 'var(--doodle-ink)',
                    border: `2px solid ${settings.selectedSubjects.includes(subject) ? 'var(--doodle-accent)' : 'var(--doodle-sketch)'}`,
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  {subject}
                </button>
              ))}
            </div>
            
            {settings.selectedSubjects.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                No subjects selected - all subjects will be included
              </div>
            )}
          </div>

          {/* Time/Questions Settings */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '25px' 
          }}>
            {gameType !== 'equation-builder' && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                   
                  fontWeight: '600',
                  color: 'var(--doodle-ink)',
                  fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Clock size={18} />
                  Total Time (seconds):
                </label>
                <input
                  type="number"
                  className="doodle-input"
                  value={settings.totalTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, totalTime: parseInt(e.target.value) || 0 }))}
                  min="60"
                  max="1800"
                  step="30"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid var(--doodle-sketch)',
                    borderRadius: '6px',
                    fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
                    background: 'var(--doodle-paper)'
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px', 
                 
                fontWeight: '600',
                color: 'var(--doodle-ink)',
                fontSize: 'clamp(0.9rem, 2.2vw, 1rem)'
              }}>
                <Brain size={18} />
                Total Questions:
              </label>
              <input
                type="number"
                className="doodle-input"
                value={gameType === 'equation-builder' ? settings.equationCount : settings.totalQuestions}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  [gameType === 'equation-builder' ? 'equationCount' : 'totalQuestions']: parseInt(e.target.value) || 1
                }))}
                min="5"
                max="100"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid var(--doodle-sketch)',
                  borderRadius: '6px',
                  fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
                  background: 'var(--doodle-paper)'
                }}
              />
            </div>
          </div>

          {/* Difficulty Range */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '15px', 
               
              fontWeight: '600',
              color: 'var(--doodle-ink)',
              fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
            }}>
              Difficulty Range: <span style={{ color: 'var(--doodle-accent)', fontWeight: 'bold' }}>{settings.difficultyRange.min} - {settings.difficultyRange.max}</span>
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'auto 1fr auto', 
              gap: '15px', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ 
                minWidth: '40px',
                fontWeight: '600',
                color: 'var(--doodle-secondary)',
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'
              }}>Min:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.difficultyRange.min}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value);
                  setSettings(prev => ({
                    ...prev,
                    difficultyRange: {
                      min: newMin,
                      max: Math.max(newMin, prev.difficultyRange.max)
                    }
                  }));
                }}
                style={{ 
                  width: '100%',
                  accentColor: 'var(--doodle-accent)'
                }}
              />
              <span style={{ 
                minWidth: '40px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'var(--doodle-accent)',
                fontSize: 'clamp(0.9rem, 2.2vw, 1rem)'
              }}>{settings.difficultyRange.min}</span>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'auto 1fr auto', 
              gap: '15px', 
              alignItems: 'center'
            }}>
              <span style={{ 
                minWidth: '40px',
                fontWeight: '600',
                color: 'var(--doodle-secondary)',
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'
              }}>Max:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.difficultyRange.max}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value);
                  setSettings(prev => ({
                    ...prev,
                    difficultyRange: {
                      min: Math.min(prev.difficultyRange.min, newMax),
                      max: newMax
                    }
                  }));
                }}
                style={{ 
                  width: '100%',
                  accentColor: 'var(--doodle-accent)'
                }}
              />
              <span style={{ 
                minWidth: '40px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'var(--doodle-accent)',
                fontSize: 'clamp(0.9rem, 2.2vw, 1rem)'
              }}>{settings.difficultyRange.max}</span>
            </div>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <button
            className="doodle-btn"
            onClick={() => setSettings(prev => ({ ...prev, advancedSettings: !prev.advancedSettings }))}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '10px',
              background: 'var(--doodle-purple)',
              color: 'white',
              padding: '12px 20px',
              fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              maxWidth: '300px'
            }}
            onMouseOver={(e) => e.target.style.background = '#7c3aed'}
            onMouseOut={(e) => e.target.style.background = 'var(--doodle-purple)'}
          >
            <Zap size={18} />
            Advanced Settings
            {settings.advancedSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Advanced Settings */}
        {settings.advancedSettings && (
          <div style={{ 
            marginBottom: '30px', 
            padding: '20px', 
            background: 'wheat', 
            borderRadius: '10px',
            border: '2px solid var(--doodle-purple)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            {gameType === 'numerical-speed-race' && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                   
                  fontWeight: '600',
                  color: 'var(--doodle-ink)'
                }}>
                  Time per Question (seconds):
                </label>
                <input
                  type="number"
                  className="doodle-input"
                  value={settings.timePerQuestion}
                  onChange={(e) => setSettings(prev => ({ ...prev, timePerQuestion: parseInt(e.target.value) || 10 }))}
                  min="10"
                  max="120"
                />
              </div>
            )}

            {gameType === 'equation-builder' && (
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px', 
                   
                  fontWeight: '600',
                  color: 'var(--doodle-ink)'
                }}>
                  Equation Difficulty:
                </label>
                <select
                  className="doodle-input"
                  value={settings.equationDifficulty}
                  onChange={(e) => setSettings(prev => ({ ...prev, equationDifficulty: e.target.value }))}
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            )}

            {gameType === 'boss-mode' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                     
                    fontWeight: '600',
                    color: 'var(--doodle-ink)'
                  }}>
                    Boss Difficulty:
                  </label>
                  <select
                    className="doodle-input"
                    value={settings.bossDifficulty}
                    onChange={(e) => setSettings(prev => ({ ...prev, bossDifficulty: parseInt(e.target.value) }))}
                  >
                    <option value={1}>Level 1 - Beginner</option>
                    <option value={2}>Level 2 - Intermediate</option>
                    <option value={3}>Level 3 - Advanced</option>
                    <option value={4}>Level 4 - Expert</option>
                    <option value={5}>Level 5 - Master</option>
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                     
                    fontWeight: '600',
                    color: 'var(--doodle-ink)'
                  }}>
                    Attack Frequency:
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    value={settings.attackFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, attackFrequency: parseFloat(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                    {(settings.attackFrequency * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          paddingTop: '20px',
          borderTop: '2px solid var(--doodle-sketch)',
          marginTop: '25px'
        }}>
          <button 
            className="doodle-btn" 
            onClick={onClose}
            style={{ 
              background: 'var(--doodle-sketch)', 
              color: 'white',
              padding: '12px 24px',
              fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => e.target.style.background = '#666'}
            onMouseOut={(e) => e.target.style.background = 'var(--doodle-sketch)'}
          >
            Cancel
          </button>
          <button 
            className="doodle-btn doodle-btn-primary" 
            onClick={handleStartGame}
            disabled={loading || settings.selectedSubjects.length === 0}
            style={{
              background: loading || settings.selectedSubjects.length === 0 ? '#ccc' : 'var(--doodle-accent)',
              color: 'white',
              padding: '12px 24px',
              fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: loading || settings.selectedSubjects.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px',
              opacity: loading || settings.selectedSubjects.length === 0 ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Start Game'}
          </button>
        </div>
      </div>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .modal-content {
            margin: 10px !important;
            padding: 20px !important;
            max-height: 95vh !important;
          }
        }
        
        @media (max-width: 480px) {
          .modal-content {
            margin: 5px !important;
            padding: 15px !important;
            border-radius: 8px !important;
          }
        }
        
        .doodle-input:focus {
          outline: none;
          border-color: var(--doodle-accent) !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--doodle-accent);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--doodle-accent);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default GameSettingsModal;
