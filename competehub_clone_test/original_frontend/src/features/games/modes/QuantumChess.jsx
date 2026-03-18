// src/pages/games/QuantumChess.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/themes/doodle.css';
import { createClickEffect, getRandomDoodleDecoration, getRandomRotation } from '../../../shared/utils/doodleUtils';
import { Atom, ArrowLeft, Users, Brain, Zap, Info } from 'lucide-react';

function QuantumChess() {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  const handleBack = (e) => {
    createClickEffect(e);
    navigate('/');
  };

  const toggleRules = (e) => {
    createClickEffect(e);
    setShowRules(!showRules);
  };

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="doodle-avatar" style={{ transform: `rotate(${getRandomRotation()}deg)`, marginBottom: '20px' }}>
            <Atom size={50} color="#fff" />
          </div>
          <h1 className="doodle-title" style={{ fontSize: '3rem', marginBottom: '10px' }}>
            Quantum Chess
          </h1>
          <p className="doodle-subtitle" style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
            Chess meets quantum mechanics - where pieces exist in superposition!
          </p>
          <div className="doodle-stars" style={{ fontSize: '1.5rem' }}>
            {getRandomDoodleDecoration()}
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div style={{
          background: 'linear-gradient(45deg, var(--doodle-purple), var(--doodle-blue))',
          color: 'white',
          padding: '20px',
          borderRadius: '20px',
          border: '3px solid var(--doodle-ink)',
          textAlign: 'center',
          marginBottom: '40px',
          transform: `rotate(${getRandomRotation()}deg)`,
          boxShadow: '5px 5px 0px var(--doodle-sketch)'
        }}>
          <h2 style={{ fontFamily: 'Architects Daughter, cursive', fontSize: '2rem', margin: '0 0 10px 0' }}>
            🚀 Coming Soon!
          </h2>
          
        </div>

        {/* Game Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          {/* Game Features */}
          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Zap size={50} color="var(--doodle-yellow)" />
            </div>
            <h3 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '1.8rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '15px',
              transform: 'rotate(-1deg)'
            }}>
              Quantum Features
            </h3>
            <ul style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li>🌀 <strong>Superposition:</strong> Pieces exist in multiple positions</li>
              <li>🔗 <strong>Entanglement:</strong> Linked piece behavior</li>
              <li>📊 <strong>Collapse:</strong> Probability-based outcomes</li>
              <li>🧠 <strong>Quantum Logic:</strong> Strategic depth beyond classical chess</li>
              <li>📚 <strong>Educational:</strong> Learn quantum physics concepts</li>
            </ul>
          </div>

          {/* Game Modes */}
          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Users size={50} color="var(--doodle-green)" />
            </div>
            <h3 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '1.8rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '15px',
              transform: 'rotate(1deg)'
            }}>
              Game Modes
            </h3>
            <ul style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li>👥 <strong>Multiplayer:</strong> Challenge friends online</li>
              <li>🤖 <strong>AI Practice:</strong> Learn against quantum AI</li>
              <li>📖 <strong>Tutorial Mode:</strong> Step-by-step quantum chess guide</li>
              <li>🏆 <strong>Tournaments:</strong> Ranked quantum chess competitions</li>
              <li>⚙️ <strong>Custom Rules:</strong> Adjust quantum probability</li>
            </ul>
          </div>
        </div>

        {/* Quantum Mechanics Explanation */}
        <div className="doodle-card" style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button 
              onClick={toggleRules}
              className="doodle-btn doodle-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
            >
              <Info size={20} />
              {showRules ? 'Hide' : 'Show'} Quantum Rules
            </button>
          </div>

          {showRules && (
            <div style={{ 
              background: 'rgba(0,0,0,0.05)', 
              padding: '25px', 
              borderRadius: '15px', 
              border: '2px dashed var(--doodle-ink)' 
            }}>
              <h4 style={{   fontSize: '1.5rem', marginBottom: '15px' }}>
                How Quantum Chess Works:
              </h4>
              <div style={{ color: 'var(--doodle-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                <p><strong>Superposition:</strong> When you move a piece, it can exist in multiple positions simultaneously until an opponent's move forces it to "collapse" into one definitive position.</p>
                <p><strong>Entanglement:</strong> Two pieces become linked - when one collapses to a position, the other automatically responds according to quantum rules.</p>
                <p><strong>Measurement/Collapse:</strong> When pieces interact (like capturing), quantum states collapse based on probability calculations, adding an element of chance to strategy.</p>
                <p><strong>Quantum Castling:</strong> Castle through superposition - your king and rook can exist in both castled and uncastled states!</p>
              </div>
            </div>
          )}
        </div>

        {/* Mockup Preview */}
        <div className="doodle-card" style={{ marginBottom: '40px' }}>
          <h3 style={{
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '1.8rem',
            color: 'var(--doodle-ink)',
            textAlign: 'center',
            marginBottom: '20px',
            transform: 'rotate(-1deg)'
          }}>
            Game Interface Preview
          </h3>
          <div style={{
            background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
            border: '2px solid var(--doodle-ink)',
            borderRadius: '15px',
            padding: '30px',
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{ fontSize: '4rem' }}>♛</div>
            <p style={{ fontSize: '1.2rem', color: 'var(--doodle-secondary)' }}>
              Interactive quantum chess board with visual superposition overlays
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ padding: '5px 10px', background: 'var(--doodle-blue)', color: 'white', borderRadius: '15px', fontSize: '0.9rem' }}>
                Probability Visualizer
              </span>
              <span style={{ padding: '5px 10px', background: 'var(--doodle-purple)', color: 'white', borderRadius: '15px', fontSize: '0.9rem' }}>
                Quantum State Tracker
              </span>
              <span style={{ padding: '5px 10px', background: 'var(--doodle-green)', color: 'white', borderRadius: '15px', fontSize: '0.9rem' }}>
                Educational Tooltips
              </span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            className="doodle-btn"
            onClick={handleBack}
            style={{
              background: 'var(--doodle-sketch)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.1rem'
            }}
          >
            <ArrowLeft size={20} />
            Back to Game Modes
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuantumChess;