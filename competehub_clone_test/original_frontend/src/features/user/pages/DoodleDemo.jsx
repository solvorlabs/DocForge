// src/pages/DoodleDemo.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/themes/doodle.css';
import { createClickEffect, DoodleIcons, getRandomDoodleDecoration, getRandomRotation } from '../../../shared/utils/doodleUtils';

function DoodleDemo() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [isMuted, setIsMuted] = useState(false);

  // Sound refs
  const clickSoundRef = useRef(null);
  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);
  const buttonHoverSoundRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const achievementSoundRef = useRef(null);

  // Initialize sounds
  useEffect(() => {
    // Create audio elements for each sound
    clickSoundRef.current = new Audio('/sounds/click.wav');
    successSoundRef.current = new Audio('/sounds/success.wav');
    errorSoundRef.current = new Audio('/sounds/error.wav');
    buttonHoverSoundRef.current = new Audio('/sounds/hover.wav');
    notificationSoundRef.current = new Audio('/sounds/notification.wav');
    achievementSoundRef.current = new Audio('/sounds/achievement.wav');

    // Set volume for all sounds
    const sounds = [
      clickSoundRef.current,
      successSoundRef.current,
      errorSoundRef.current,
      buttonHoverSoundRef.current,
      notificationSoundRef.current,
      achievementSoundRef.current
    ];

    sounds.forEach(sound => {
      if (sound) {
        sound.volume = 0.3; // 30% volume
        sound.preload = 'auto';
      }
    });

    // Cleanup
    return () => {
      sounds.forEach(sound => {
        if (sound) {
          sound.pause();
          sound.src = '';
        }
      });
    };
  }, []);

  // Play sound function
  const playSound = (type) => {
    if (isMuted) return;

    let soundRef = null;
    switch (type) {
      case 'click':
        soundRef = clickSoundRef.current;
        break;
      case 'success':
        soundRef = successSoundRef.current;
        break;
      case 'error':
        soundRef = errorSoundRef.current;
        break;
      case 'hover':
        soundRef = buttonHoverSoundRef.current;
        break;
      case 'notification':
        soundRef = notificationSoundRef.current;
        break;
      case 'achievement':
        soundRef = achievementSoundRef.current;
        break;
      default:
        return;
    }

    if (soundRef) {
      soundRef.currentTime = 0; // Reset to beginning
      soundRef.play().catch(error => {
        console.log('Sound play failed:', error);
      });
    }
  };

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(!isMuted);
    playSound('click');
  };

  const handleSuccessDemo = (e) => {
    createClickEffect(e);
    playSound('click');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      playSound('success');
    }, 2000);
  };

  const handleErrorDemo = (e) => {
    createClickEffect(e);
    playSound('click');
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      playSound('error');
    }, 2000);
  };

  const handleCheckboxChange = (id) => {
    playSound('click');
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleButtonClick = (e) => {
    createClickEffect(e);
    playSound('click');
  };

  const handleButtonHover = () => {
    playSound('hover');
  };

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div></div>
            <div className="doodle-avatar doodle-float">
              <DoodleIcons.Gamepad size={40} color="#fff" />
            </div>
            <button
              className="doodle-btn"
              onClick={toggleMute}
              style={{
                background: isMuted ? 'var(--doodle-accent)' : 'var(--doodle-green)',
                color: 'white',
                padding: '10px',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                border: '3px solid var(--doodle-ink)'
              }}
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
          <h1 className="doodle-title doodle-typewriter">Doodle UI Showcase</h1>
          <p className="doodle-subtitle">
            A complete demonstration of all doodle UI components and interactions
          </p>
          <div className="doodle-stars">{getRandomDoodleDecoration()}</div>
        </div>

        {/* Cards Section */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Card Variations
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="doodle-card doodle-grow">
              <h3>Standard Card</h3>
              <p>This is a regular doodle card with hover effects.</p>
            </div>
            
            <div className="doodle-card doodle-notebook">
              <h3>Notebook Card</h3>
              <p>This card has a notebook paper background effect.</p>
            </div>
            
            <div className="doodle-sticky">
              <h3>Sticky Note</h3>
              <p>A yellow sticky note style card.</p>
            </div>
            
            <div className={`doodle-card ${showSuccess ? 'doodle-success' : ''}`}>
              <h3>Success Card</h3>
              <p>Click the button below to see success animation.</p>
              <button className="doodle-btn doodle-btn-secondary" onClick={handleSuccessDemo}>
                Trigger Success
              </button>
            </div>
            
            <div className={`doodle-card ${showError ? 'doodle-error doodle-shake' : ''}`}>
              <h3>Error Card</h3>
              <p>Click the button below to see error animation.</p>
              <button className="doodle-btn doodle-btn-danger" onClick={handleErrorDemo}>
                Trigger Error
              </button>
            </div>
            
            <div className="doodle-speech">
              <h3>Speech Bubble</h3>
              <p>This is a speech bubble style card with a tail.</p>
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Button Styles
          </h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
            <button className="doodle-btn" onClick={handleButtonClick} onMouseEnter={handleButtonHover}>Default Button</button>
            <button className="doodle-btn doodle-btn-primary" onClick={handleButtonClick} onMouseEnter={handleButtonHover}>Primary Button</button>
            <button className="doodle-btn doodle-btn-secondary" onClick={handleButtonClick} onMouseEnter={handleButtonHover}>Secondary Button</button>
            <button className="doodle-btn doodle-btn-danger" onClick={handleButtonClick} onMouseEnter={handleButtonHover}>Danger Button</button>
            <button className="doodle-btn" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }} onClick={handleButtonClick} onMouseEnter={handleButtonHover}>
              <DoodleIcons.Star size={20} style={{ marginRight: '8px' }} />
              Icon Button
            </button>
            <button className="doodle-btn" disabled>Disabled Button</button>
          </div>
        </div>

        {/* Form Elements */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Form Elements
          </h2>
          
          <div className="doodle-paper" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                   
                  fontWeight: '600'
                }}>
                  Text Input:
                </label>
                <input 
                  type="text" 
                  className="doodle-input" 
                  placeholder="Enter some text..."
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                   
                  fontWeight: '600'
                }}>
                  Select Dropdown:
                </label>
                <select className="doodle-input" style={{ width: '100%' }}>
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '12px',
                   
                  fontWeight: '600'
                }}>
                  Radio Buttons:
                </label>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {['Option A', 'Option B', 'Option C'].map((option, index) => (
                    <label key={option} className="doodle-radio">
                      <input type="radio" name="demo-radio" />
                      <div className="doodle-radio-custom"></div>
                      <span className="doodle-radio-label">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '12px',
                   
                  fontWeight: '600'
                }}>
                  Checkboxes:
                </label>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {['Checkbox 1', 'Checkbox 2', 'Checkbox 3'].map((item, index) => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="checkbox" 
                        className="doodle-checkbox"
                        checked={checkedItems[item] || false}
                        onChange={() => handleCheckboxChange(item)}
                      />
                      <span style={{   }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress and Timer */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Progress & Timer Elements
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div className="doodle-card">
              <h3>Progress Bar</h3>
              <div className="doodle-progress">
                <div className="doodle-progress-fill" style={{ width: '65%' }}></div>
              </div>
              <p style={{ textAlign: 'center', marginTop: '10px' }}>65% Complete</p>
            </div>
            
            <div className="doodle-card" style={{ textAlign: 'center' }}>
              <h3>Timer</h3>
              <div className="doodle-timer" style={{ margin: '0 auto' }}>
                2:30
              </div>
            </div>
            
            <div className="doodle-card" style={{ textAlign: 'center' }}>
              <h3>Loading Spinner</h3>
              <div className="doodle-spinner" style={{ margin: '20px auto' }}></div>
              <div className="doodle-loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Icons and Badges */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Icons & Badges
          </h2>
          
          <div className="doodle-card">
            <div style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px' }}>Doodle Icons</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
                <div style={{ textAlign: 'center' }}>
                  <DoodleIcons.Users size={40} color="var(--doodle-blue)" />
                  <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Users</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <DoodleIcons.Brain size={40} color="var(--doodle-green)" />
                  <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Brain</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <DoodleIcons.Trophy size={40} color="var(--doodle-yellow)" />
                  <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Trophy</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <DoodleIcons.Lightning size={40} color="var(--doodle-purple)" />
                  <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Lightning</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <DoodleIcons.Timer size={40} color="var(--doodle-orange)" />
                  <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Timer</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <DoodleIcons.Book size={40} color="var(--doodle-ink)" />
                  <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Book</p>
                </div>
              </div>

              <h3 style={{ marginBottom: '20px' }}>Badges</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                <span className="doodle-badge">New</span>
                <span className="doodle-badge" style={{ background: 'var(--doodle-blue)' }}>Popular</span>
                <span className="doodle-badge" style={{ background: 'var(--doodle-green)' }}>Success</span>
                <span className="doodle-badge" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }}>
                  Featured
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts and Messages */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Alerts & Messages
          </h2>
          
          <div style={{ display: 'grid', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="doodle-alert">
              This is an error alert message with a warning icon.
            </div>
            
            <div className="doodle-alert" style={{ background: 'var(--doodle-green)' }}>
              This is a success alert message!
            </div>
            
            <div className="doodle-alert" style={{ background: 'var(--doodle-blue)' }}>
              This is an info alert message.
            </div>
            
            <div className="doodle-alert" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }}>
              This is a warning alert message.
            </div>
          </div>
        </div>

        {/* Teams Demo */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ 
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Team Cards
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="doodle-card doodle-team-red">
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <DoodleIcons.Users size={40} color="var(--doodle-accent)" />
                <h3 style={{ color: 'var(--doodle-accent)', margin: '15px 0' }}>Red Team</h3>
                <p>Team score: 150 points</p>
              </div>
            </div>
            
            <div className="doodle-card doodle-team-blue">
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <DoodleIcons.Users size={40} color="var(--doodle-blue)" />
                <h3 style={{ color: 'var(--doodle-blue)', margin: '15px 0' }}>Blue Team</h3>
                <p>Team score: 120 points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h2 style={{ 
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            marginBottom: '30px'
          }}>
            Ready to Play?
          </h2>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="doodle-btn doodle-btn-primary" onClick={handleButtonClick} onMouseEnter={handleButtonHover}>
              <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
              Start Game
            </button>
            <button className="doodle-btn doodle-btn-secondary" onClick={handleButtonClick} onMouseEnter={handleButtonHover}>
              <DoodleIcons.Book size={20} style={{ marginRight: '8px' }} />
              Learn More
            </button>
            <button className="doodle-btn" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }} onClick={handleButtonClick} onMouseEnter={handleButtonHover}>
              <DoodleIcons.Trophy size={20} style={{ marginRight: '8px' }} />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="doodle-arrow" style={{ bottom: '100px', left: '50px' }}>↗</div>
        <div className="doodle-arrow" style={{ top: '200px', right: '80px' }}>↙</div>
        <div style={{ 
          position: 'absolute', 
          top: '300px', 
          left: '100px',
          fontSize: '2rem',
          color: 'var(--doodle-yellow)',
          transform: 'rotate(-15deg)',
          opacity: '0.6'
        }} className="doodle-question">
          ?
        </div>
        <div style={{ 
          position: 'absolute', 
          bottom: '200px', 
          right: '120px',
          fontSize: '1.5rem',
          color: 'var(--doodle-green)',
          transform: 'rotate(25deg)',
          opacity: '0.7'
        }}>
          ★
        </div>
      </div>
    </div>
  );
}

export default DoodleDemo;
