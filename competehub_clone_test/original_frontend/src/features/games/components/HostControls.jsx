import React, { useState, useEffect } from 'react';
import { useGame } from '../../../app/providers/GameContext';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  ListItemIcon
} from '@mui/material';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';

// Helper for toggling subject/examType/tag
function toggleItem(array, value) {
  return array.includes(value)
    ? array.filter(v => v !== value)
    : [...array, value];
}

function HostControls() {
  const {
    gameData,
    isHost,
    gameSettings,
    updateGameSettings,
    kickUser
  } = useGame();

  const [expanded, setExpanded] = useState(false);
  const [settings, setSettings] = useState({
    rounds: gameData?.rounds || 1,
    questionTimer: gameSettings?.questionTimer || 120,
    breakTimer: gameSettings?.breakTimer || 10,
    allowSpectatorChat: gameSettings?.allowSpectatorChat ?? true,
    selectedSubjects: gameSettings?.selectedSubjects || [],
    selectedExamTypes: gameSettings?.selectedExamTypes || [],
    selectedTags: gameSettings?.selectedTags || [],
    difficultyRange: gameSettings?.difficultyRange || { min: 1, max: 10 },
    faceoffsPerPerson: gameSettings?.faceoffsPerPerson || 1,
    conceptLevels: gameSettings?.conceptLevels || ['Fundamental', 'Application', 'Analysis'],
    questionSource: gameSettings?.questionSource || 'native'
  });
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [userToKick, setUserToKick] = useState(null);
  const [questionMetadata, setQuestionMetadata] = useState({
    subjects: {},
    difficultyRange: { min: 1, max: 10 },
    conceptLevels: []
  });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableExamTypes, setAvailableExamTypes] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  // Fetch question metadata when component mounts
  const fetchQuestionMetadata = React.useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SOCKET_URL}/api/question-metadata`);
      setQuestionMetadata(response.data);
      
      // Set default selected subject if none selected
      const subjects = Object.keys(response.data.subjects);
      if (subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(subjects[0]);
        setAvailableExamTypes(response.data.subjects[subjects[0]].examTypes || []);
        setAvailableTags(response.data.subjects[subjects[0]].tags || []);
      }
    } catch (error) {
      console.error('Error fetching question metadata:', error);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchQuestionMetadata();
  }, [fetchQuestionMetadata]);

  // Update settings when gameData or gameSettings change
  React.useEffect(() => {
    setSettings({
      rounds: gameData?.rounds || 1,
      questionTimer: gameSettings?.questionTimer || 120,
      breakTimer: gameSettings?.breakTimer || 10,
      allowSpectatorChat: gameSettings?.allowSpectatorChat ?? true,
      selectedSubjects: gameSettings?.selectedSubjects || [],
      selectedExamTypes: gameSettings?.selectedExamTypes || [],
      selectedTags: gameSettings?.selectedTags || [],
      difficultyRange: gameSettings?.difficultyRange || { min: 1, max: 10 },
      faceoffsPerPerson: gameSettings?.faceoffsPerPerson || 1,
      conceptLevels: gameSettings?.conceptLevels || ['Fundamental', 'Application', 'Analysis'],
      questionSource: gameSettings?.questionSource || 'native'
    });
  }, [gameData, gameSettings]);

  // Update available exam types and tags when subjects change
  const updateAvailableOptions = React.useCallback((selectedSubjects) => {
    if (selectedSubjects.length === 0) {
      setAvailableExamTypes([]);
      setAvailableTags([]);
      return;
    }

    // Get union of all exam types and tags from selected subjects
    const allExamTypes = new Set();
    const allTags = new Set();

    selectedSubjects.forEach(subject => {
      const subjectData = questionMetadata.subjects[subject];
      if (subjectData) {
        subjectData.examTypes?.forEach(examType => allExamTypes.add(examType));
        subjectData.tags?.forEach(tag => allTags.add(tag));
      }
    });

    setAvailableExamTypes(Array.from(allExamTypes));
    setAvailableTags(Array.from(allTags));
  }, [questionMetadata]);

  // Handle subject selection change
  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  // Update available options when selected subjects change
  React.useEffect(() => {
    updateAvailableOptions(settings.selectedSubjects);
  }, [settings.selectedSubjects, updateAvailableOptions]);

  if (!isHost || gameData?.status !== 'waiting') {
    return null;
  }

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    updateGameSettings(settings);
  };

  const handleKickUser = (user) => {
    setUserToKick(user);
    setKickDialogOpen(true);
  };

  const confirmKick = () => {
    if (userToKick) {
      kickUser(userToKick.socketId);
    }
    setKickDialogOpen(false);
    setUserToKick(null);
  };

  const getAllUsers = () => {
    if (!gameData) return [];
    return [
      ...gameData.redTeam.map(p => ({ ...p, team: 'red' })),
      ...gameData.blueTeam.map(p => ({ ...p, team: 'blue' })),
      ...gameData.spectators.map(p => ({ ...p, team: 'spectator' }))
    ].filter(user => user.socketId !== gameData.host);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        className="doodle-btn doodle-btn-primary"
        onClick={() => setExpanded(true)}
        style={{
          padding: '10px 20px',
          fontSize: '0.95rem',
           
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}
      >
        <DoodleIcons.Settings size={18} />
        Settings
      </button>

      {/* Modal Overlay */}
      {expanded && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(4px)',
            overflowY: 'auto'
          }}
          onClick={() => setExpanded(false)}
        >
          {/* Modal Content */}
          <div
            style={{
              background: 'var(--doodle-paper)',
              border: '4px solid var(--doodle-ink)',
              borderRadius: '20px',
              boxShadow: '12px 12px 0 rgba(0, 0, 0, 0.3)',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '3px solid var(--doodle-sketch)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--doodle-blue)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                flexShrink: 0
              }}
            >
              <h3
                style={{
                  fontFamily: 'Architects Daughter, cursive',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.5rem',
                  color: 'white'
                }}
              >
                <DoodleIcons.Settings size={28} />
                Host Controls
              </h3>
              <button
                onClick={() => setExpanded(false)}
                className="doodle-btn"
                style={{
                  background: 'white',
                  border: '2px solid white',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--doodle-ink)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  padding: 0,
                  transition: 'transform 0.2s ease'
                }}
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '24px',
                 
                minHeight: 0
              }}
            >
              {/* Basic Settings */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                    
                  color: 'var(--doodle-ink)',
                  marginBottom: '12px',
                  fontSize: '1rem'
                }}>
                  Basic Settings
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ 
                        
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      Rounds: <span style={{ color: 'var(--doodle-blue)' }}>{settings.rounds}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={settings.rounds}
                      onChange={(e) => handleSettingsChange('rounds', parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                        
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      Faceoffs/Person: <span style={{ color: 'var(--doodle-blue)' }}>{settings.faceoffsPerPerson}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={settings.faceoffsPerPerson}
                      onChange={(e) => handleSettingsChange('faceoffsPerPerson', parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                        
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      Question Timer: <span style={{ color: 'var(--doodle-blue)' }}>{settings.questionTimer}s</span>
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      step="10"
                      value={settings.questionTimer}
                      onChange={(e) => handleSettingsChange('questionTimer', parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                        
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      Break Timer: <span style={{ color: 'var(--doodle-blue)' }}>{settings.breakTimer}s</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={settings.breakTimer}
                      onChange={(e) => handleSettingsChange('breakTimer', parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.allowSpectatorChat}
                      onChange={(e) => handleSettingsChange('allowSpectatorChat', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ 
                        
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      Allow Spectator Chat
                    </span>
                  </label>
                </div>
              </div>

              {/* Question Source Selection */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                    
                  color: 'var(--doodle-ink)',
                  marginBottom: '12px',
                  fontSize: '1rem'
                }}>
                  Question Source
                </h4>
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  flexWrap: 'wrap'
                }}>
                  <button
                    className={`doodle-btn ${settings.questionSource === 'native' ? 'doodle-btn-primary' : ''}`}
                    onClick={() => handleSettingsChange('questionSource', 'native')}
                    style={{ 
                      fontSize: '0.9rem',
                      padding: '10px 16px',
                      flex: '1',
                      minWidth: '100px'
                    }}
                  >
                    Native
                  </button>
                  <button
                    className={`doodle-btn ${settings.questionSource === 'gate' ? 'doodle-btn-primary' : ''}`}
                    onClick={() => handleSettingsChange('questionSource', 'gate')}
                    style={{ 
                      fontSize: '0.9rem',
                      padding: '10px 16px',
                      flex: '1',
                      minWidth: '100px'
                    }}
                  >
                    GATE (CSE)
                  </button>
                  <button
                    className={`doodle-btn ${settings.questionSource === 'jee' ? 'doodle-btn-primary' : ''}`}
                    onClick={() => handleSettingsChange('questionSource', 'jee')}
                    style={{ 
                      fontSize: '0.9rem',
                      padding: '10px 16px',
                      flex: '1',
                      minWidth: '100px'
                    }}
                  >
                    JEE
                  </button>
                </div>
                <div style={{ 
                  marginTop: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--doodle-secondary)',
                  fontStyle: 'italic',
                   
                }}>
                  {settings.questionSource === 'native' && '📚 Native questions - Smaller curated question pool for quick games'}
                  {settings.questionSource === 'gate' && '🎓 GATE CSE questions - Computer Science questions from GATE exams (large pool)'}
                  {settings.questionSource === 'jee' && '🔬 JEE questions - Physics, Chemistry, Maths from JEE exams (large pool)'}
                </div>
              </div>

              {/* Subject Selection */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ 
                      
                    color: 'var(--doodle-ink)', 
                    margin: 0,
                    fontSize: '1rem'
                  }}>
                    Select Subjects
                  </h4>
                  {settings.selectedSubjects.length > 0 && (
                    <button
                      className="doodle-btn"
                      onClick={() => handleSettingsChange('selectedSubjects', [])}
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '6px 12px', 
                        background: 'var(--doodle-accent)', 
                        color: 'white' 
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <select
                    className="doodle-input"
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    style={{ 
                      width: '100%', 
                      marginBottom: '8px',
                       
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="">Choose a subject to add...</option>
                    {Object.keys(questionMetadata.subjects).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                {selectedSubject && (
                  <div style={{ marginBottom: '10px' }}>
                    <button
                      className={`doodle-btn ${settings.selectedSubjects.includes(selectedSubject) ? 'doodle-btn-primary' : ''}`}
                      onClick={() => handleSettingsChange('selectedSubjects', toggleItem(settings.selectedSubjects, selectedSubject))}
                      style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                    >
                      {settings.selectedSubjects.includes(selectedSubject) ? `✓ Remove ${selectedSubject}` : `+ Add ${selectedSubject}`}
                    </button>
                  </div>
                )}
                
                {settings.selectedSubjects.length > 0 ? (
                  <div style={{ marginTop: '8px' }}>
                    <strong style={{ fontSize: '0.85rem',   }}>Selected:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {settings.selectedSubjects.map(subject => (
                        <span 
                          key={subject} 
                          className="doodle-badge" 
                          style={{ 
                            background: 'var(--doodle-blue)',
                            fontSize: '0.8rem',
                            padding: '4px 10px'
                          }}
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#888', 
                    marginTop: '6px',
                    fontStyle: 'italic',
                     
                  }}>
                    No subjects selected - all will be included
                  </div>
                )}
              </div>

              {/* Exam Types */}
              {settings.selectedSubjects.length > 0 && availableExamTypes.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ 
                        
                      color: 'var(--doodle-ink)', 
                      margin: 0,
                      fontSize: '1rem'
                    }}>
                      Exam Types ({settings.selectedExamTypes.length === 0 ? 'All' : settings.selectedExamTypes.length})
                    </h4>
                    {settings.selectedExamTypes.length > 0 && (
                      <button
                        className="doodle-btn"
                        onClick={() => handleSettingsChange('selectedExamTypes', [])}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '6px 12px', 
                          background: 'var(--doodle-accent)', 
                          color: 'white' 
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    padding: '4px'
                  }}>
                    {availableExamTypes.map(examType => (
                      <button
                        key={examType}
                        className={`doodle-btn ${settings.selectedExamTypes.includes(examType) ? 'doodle-btn-secondary' : ''}`}
                        onClick={() => handleSettingsChange('selectedExamTypes', toggleItem(settings.selectedExamTypes, examType))}
                        style={{ 
                          fontSize: '0.85rem',
                          padding: '6px 12px'
                        }}
                      >
                        {examType}
                      </button>
                    ))}
                  </div>
                  {settings.selectedExamTypes.length === 0 && (
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#888', 
                      marginTop: '6px',
                      fontStyle: 'italic',
                       
                    }}>
                      No exam types selected - all will be included
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {settings.selectedSubjects.length > 0 && availableTags.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ 
                        
                      color: 'var(--doodle-ink)', 
                      margin: 0,
                      fontSize: '1rem'
                    }}>
                      Topics ({settings.selectedTags.length === 0 ? 'All' : settings.selectedTags.length})
                    </h4>
                    {settings.selectedTags.length > 0 && (
                      <button
                        className="doodle-btn"
                        onClick={() => handleSettingsChange('selectedTags', [])}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '6px 12px', 
                          background: 'var(--doodle-accent)', 
                          color: 'white' 
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Selected Tags Display */}
                  {settings.selectedTags.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '0.85rem', 
                          
                        fontWeight: '600', 
                        marginBottom: '6px' 
                      }}>
                        Selected:
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '6px',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        padding: '4px'
                      }}>
                        {settings.selectedTags.map(tag => (
                          <span 
                            key={tag} 
                            className="doodle-badge" 
                            style={{ 
                              background: 'var(--doodle-yellow)', 
                              color: 'var(--doodle-ink)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => handleSettingsChange('selectedTags', settings.selectedTags.filter(t => t !== tag))}
                            title="Click to remove"
                          >
                            {tag}
                            <span style={{ fontSize: '0.7rem' }}>×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Searchable Dropdown */}
                  <div style={{ position: 'relative' }} className="tag-dropdown-container">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          className="doodle-input"
                          placeholder="Search and select topics..."
                          value={tagSearchTerm}
                          onChange={(e) => setTagSearchTerm(e.target.value)}
                          onFocus={() => setTagDropdownOpen(true)}
                          style={{ 
                            width: '100%',
                            paddingRight: '40px'
                          }}
                        />
                        <button
                          className="doodle-btn"
                          onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                          style={{ 
                            position: 'absolute',
                            right: '5px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            background: 'var(--doodle-blue)',
                            color: 'white',
                            minWidth: 'auto'
                          }}
                          tabIndex={-1}
                          type="button"
                        >
                          {tagDropdownOpen ? '▲' : '▼'}
                        </button>
                      </div>
                      
                      {tagSearchTerm && (
                        <button
                          className="doodle-btn"
                          onClick={() => {
                            setTagSearchTerm('');
                            setTagDropdownOpen(false);
                          }}
                          style={{ 
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            background: 'var(--doodle-sketch)',
                            color: 'white'
                          }}
                          type="button"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Dropdown List */}
                    {tagDropdownOpen && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          background: 'var(--doodle-paper)',
                          border: '2px solid var(--doodle-ink)',
                          borderRadius: '12px',
                          boxShadow: '4px 4px 0px var(--doodle-sketch)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          marginTop: '4px'
                        }}
                      >
                        {(() => {
                          const filteredTags = availableTags.filter(tag => 
                            tag.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
                            !settings.selectedTags.includes(tag)
                          );

                          if (filteredTags.length === 0) {
                            return (
                              <div style={{ 
                                padding: '12px',
                                textAlign: 'center',
                                color: 'var(--doodle-secondary)',
                                 
                                fontStyle: 'italic'
                              }}>
                                {tagSearchTerm ? 'No matching topics found' : 'All topics selected'}
                              </div>
                            );
                          }

                          return filteredTags.map(tag => (
                            <div
                              key={tag}
                              onClick={() => {
                                handleSettingsChange('selectedTags', [...settings.selectedTags, tag]);
                                setTagSearchTerm('');
                                setTagDropdownOpen(false);
                              }}
                              style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                 
                                fontSize: '0.9rem',
                                borderBottom: '1px dashed var(--doodle-sketch)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--doodle-blue)';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'inherit';
                              }}
                            >
                              <span>{tag}</span>
                              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>+</span>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Quick Add Buttons for Common Tags */}
                  {settings.selectedTags.length === 0 && availableTags.length > 8 && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '0.8rem',   fontWeight: '600', marginBottom: '6px' }}>
                        Quick Add Popular Topics:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {availableTags.slice(0, 6).map(tag => (
                          <button
                            key={tag}
                            className="doodle-btn"
                            onClick={() => handleSettingsChange('selectedTags', [...settings.selectedTags, tag])}
                            style={{ 
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              background: 'var(--doodle-green)',
                              color: 'white'
                            }}
                            type="button"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Text */}
                  {settings.selectedTags.length === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px', fontStyle: 'italic' }}>
                      No topics selected - all available topics will be included
                    </div>
                  )}
                </div>
              )}

              {/* Difficulty Range */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                    
                  color: 'var(--doodle-ink)',
                  marginBottom: '12px',
                  fontSize: '1rem'
                }}>
                  Difficulty: <span style={{ color: 'var(--doodle-blue)' }}>{settings.difficultyRange.min} - {settings.difficultyRange.max}</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ 
                        
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      Min: {settings.difficultyRange.min}
                    </label>
                    <input
                      type="range"
                      min={questionMetadata.difficultyRange.min}
                      max={questionMetadata.difficultyRange.max}
                      value={settings.difficultyRange.min}
                      onChange={(e) => handleSettingsChange('difficultyRange', { ...settings.difficultyRange, min: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                        
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      Max: {settings.difficultyRange.max}
                    </label>
                    <input
                      type="range"
                      min={questionMetadata.difficultyRange.min}
                      max={questionMetadata.difficultyRange.max}
                      value={settings.difficultyRange.max}
                      onChange={(e) => handleSettingsChange('difficultyRange', { ...settings.difficultyRange, max: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Concept Levels */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                    
                  color: 'var(--doodle-ink)',
                  marginBottom: '10px',
                  fontSize: '1rem'
                }}>
                  Concept Levels
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {questionMetadata.conceptLevels.map(level => (
                    <label 
                      key={level} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={settings.conceptLevels.includes(level)}
                        onChange={(e) => {
                          let newLevels = e.target.checked
                            ? [...settings.conceptLevels, level]
                            : settings.conceptLevels.filter(l => l !== level);
                          handleSettingsChange('conceptLevels', newLevels);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ 
                         
                        fontSize: '0.85rem'
                      }}>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* User Management */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                    
                  color: 'var(--doodle-ink)',
                  marginBottom: '10px',
                  fontSize: '1rem'
                }}>
                  User Management
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gap: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '4px'
                }}>
                  {getAllUsers().map(user => (
                    <div 
                      key={user.socketId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: '8px',
                        border: '2px solid var(--doodle-sketch)'
                      }}
                    >
                      <span style={{ 
                         
                        fontSize: '0.85rem'
                      }}>
                        {user.username}
                      </span>
                      <button
                        className="doodle-btn doodle-btn-danger"
                        onClick={() => handleKickUser(user)}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '4px 10px' 
                        }}
                      >
                        Kick
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '3px solid var(--doodle-sketch)',
                background: 'rgba(255, 255, 255, 0.5)',
                flexShrink: 0
              }}
            >
              <button
                className="doodle-btn doodle-btn-primary"
                onClick={() => {
                  handleSaveSettings();
                  setExpanded(false);
                }}
                style={{ 
                  width: '100%', 
                  fontSize: '1rem',
                  padding: '12px',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '8px',
                   
                  fontWeight: '600'
                }}
              >
                <DoodleIcons.Settings size={18} />
                Save Settings & Close
              </button>
            </div>

            {/* Responsive Styles */}
            <style>{`
              @media (max-width: 768px) {
                .tag-dropdown-container > div > div {
                  max-height: 150px !important;
                }
              }
              @media (max-width: 600px) {
                .doodle-badge {
                  font-size: 0.7rem !important;
                  padding: 3px 8px !important;
                }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Kick Confirmation Dialog */}
      <Dialog open={kickDialogOpen} onClose={() => setKickDialogOpen(false)}>
        <DialogTitle>Confirm Kick</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to kick {userToKick?.username}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKickDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmKick} color="error" variant="contained">
            Kick User
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default HostControls;
