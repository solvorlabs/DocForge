// src/pages/games/ComingSoon.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/themes/doodle.css';
import { createClickEffect, getRandomDoodleDecoration, getRandomRotation } from '../../../shared/utils/doodleUtils';
import { ArrowLeft, Construction, Star } from 'lucide-react';

// Game data for the coming soon pages
const gameInfo = {
  '/game/mind-readers': {
    title: "Mind Readers' Duel",
    icon: '🧠',
    description: 'Predict opponents using game theory and psychological tactics',
    features: ['Game Theory Mechanics', 'Psychological Strategy', 'Bluff Detection', 'Nash Equilibrium Learning'],
    color: 'var(--doodle-pink)'
  },
  '/game/neuro-network': {
    title: 'NeuroNetwork',
    icon: '🧬',
    description: 'Build neural networks with logic gates to solve patterns',
    features: ['Drag & Drop Interface', 'Neuron Firing Visualization', 'Pattern Recognition', 'Synaptic Learning'],
    color: 'var(--doodle-blue)'
  },
  '/game/time-loop': {
    title: 'Time Loop Strategist',
    icon: '⏰',
    description: 'Navigate time loops to gather clues and fix reality',
    features: ['Timeline Management', 'Causality Puzzles', 'Team Communication', 'Paradox Resolution'],
    color: 'var(--doodle-accent)'
  },
  '/game/chemical-crafting': {
    title: 'Chemical Compound Crafting',
    icon: '⚗️',
    description: 'Build molecules using periodic table elements and bonding rules',
    features: ['Periodic Table Interface', 'Bonding Mechanics', 'Molecular Visualization', 'Chemistry Education'],
    color: 'var(--doodle-green)'
  },
  '/game/ecosystem-sim': {
    title: 'EcoSystem Simulator',
    icon: '🌱',
    description: 'Balance food chains and environmental events collaboratively',
    features: ['Population Dynamics', 'Environmental Events', 'Food Chain Balance', 'Sustainability Learning'],
    color: 'var(--doodle-green)'
  },
  '/game/science-quiz': {
    title: 'Science Quiz Showdown',
    icon: '💡',
    description: 'Fast-paced trivia with power-ups and competitive elements',
    features: ['Multiple Categories', 'Power-up System', 'Fast-paced Rounds', 'Educational Content'],
    color: 'var(--doodle-yellow)'
  },
  '/game/particle-collider': {
    title: 'Particle Collider Challenge',
    icon: '⚛️',
    description: 'Predict collision results and discover new particles',
    features: ['Physics Simulation', 'Particle Discovery', 'Feynman Diagrams', 'Quantum Mechanics'],
    color: 'var(--doodle-purple)'
  },
  '/game/science-codenames': {
    title: 'Science Codenames',
    icon: '🎯',
    description: 'The classic Codenames game but with scientific terminology',
    features: ['Scientific Word Banks', 'Team Strategy', 'Educational Definitions', 'Multiple Themes'],
    color: 'var(--doodle-orange)'
  },
  '/game/physics-puzzle': {
    title: 'Physics Puzzle Relay',
    icon: '🧩',
    description: 'Rube Goldberg-style puzzles using real physics concepts',
    features: ['Physics Engine', 'Chain Reactions', 'Collaborative Building', 'Real-world Physics'],
    color: 'var(--doodle-accent)'
  }
};

function ComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const game = gameInfo[location.pathname] || {
    title: 'New Game Mode',
    icon: '🎮',
    description: 'An exciting new game mode coming to CompeteHub',
    features: ['Innovative Gameplay', 'Educational Content', 'Multiplayer Support', 'Progress Tracking'],
    color: 'var(--doodle-blue)'
  };

  const handleBack = (e) => {
    createClickEffect(e);
    navigate('/');
  };

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="doodle-avatar" style={{ 
            transform: `rotate(${getRandomRotation()}deg)`, 
            marginBottom: '20px',
            fontSize: '4rem',
            background: game.color
          }}>
            {game.icon}
          </div>
          <h1 className="doodle-title" style={{ fontSize: '3rem', marginBottom: '10px' }}>
            {game.title}
          </h1>
          <p className="doodle-subtitle" style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
            {game.description}
          </p>
          <div className="doodle-stars" style={{ fontSize: '1.5rem' }}>
            {getRandomDoodleDecoration()}
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div style={{
          background: `linear-gradient(45deg, ${game.color}, var(--doodle-sketch))`,
          color: 'white',
          padding: '30px',
          borderRadius: '20px',
          border: '3px solid var(--doodle-ink)',
          textAlign: 'center',
          marginBottom: '40px',
          transform: `rotate(${getRandomRotation()}deg)`,
          boxShadow: '5px 5px 0px var(--doodle-sketch)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>
            <Construction size={60} color="white" />
          </div>
          <h2 style={{ fontFamily: 'Architects Daughter, cursive', fontSize: '2.5rem', margin: '0 0 15px 0' }}>
            Coming Soon!
          </h2>
          <p style={{ fontSize: '1.2rem', margin: '0 0 15px 0' }}>
            This game is currently in development
          </p>
        </div>

        {/* Feature Preview */}
        <div className="doodle-card" style={{ marginBottom: '40px' }}>
          <h3 style={{
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            color: 'var(--doodle-ink)',
            textAlign: 'center',
            marginBottom: '25px',
            transform: 'rotate(-1deg)'
          }}>
            What it will include??
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {game.features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  background: `${game.color}15`,
                  border: `2px solid ${game.color}`,
                  borderRadius: '15px',
                  textAlign: 'center',
                  transform: `rotate(${getRandomRotation()}deg)`,
                  transition: 'all 0.3s ease'
                }}
                className="game-card-hover"
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                  <Star size={20} color={game.color} />
                </div>
                <h4 style={{
                   
                  fontSize: '1.1rem',
                  color: 'var(--doodle-ink)',
                  margin: 0
                }}>
                  {feature}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Development Progress
        <div className="doodle-card" style={{ marginBottom: '40px' }}>
          <h3 style={{
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '1.8rem',
            color: 'var(--doodle-ink)',
            textAlign: 'center',
            marginBottom: '20px',
            transform: 'rotate(1deg)'
          }}>
            Development Status
          </h3>
          
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            border: '2px solid var(--doodle-ink)',
            borderRadius: '15px',
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                width: '100%',
                height: '20px',
                background: 'var(--doodle-sketch)',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '2px solid var(--doodle-ink)'
              }}>
                <div style={{
                  width: '35%',
                  height: '100%',
                  background: game.color,
                  borderRadius: '8px 0 0 8px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              <p style={{ marginTop: '10px', fontSize: '1.1rem', color: 'var(--doodle-secondary)' }}>
                Progress: 35% Complete
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>✅</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>Concept Design</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>✅</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>UI Mockups</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🔄</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>Development</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⏳</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>Testing</div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Stay Updated */}
        <div className="doodle-card" style={{ marginBottom: '40px' }}>
          <h3 style={{
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '1.8rem',
            color: 'var(--doodle-ink)',
            textAlign: 'center',
            marginBottom: '15px',
            transform: 'rotate(-1deg)'
          }}>
            📢 Stay Updated
          </h3>
          <p style={{
            color: 'var(--doodle-secondary)',
            textAlign: 'center',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Follow our development progress and be the first to know when this game launches! 
            In the meantime, check out our other available game modes.
          </p>
          
          {/* <div style={{ textAlign: 'center' }}>
            <button
              className="doodle-btn doodle-btn-secondary"
              onClick={() => navigate('/solo-challenge')}
              style={{ marginRight: '15px' }}
            >
              Try Practice Mode
            </button>
            <button
              className="doodle-btn doodle-btn-primary"
              onClick={() => navigate('/leaderboard')}
            >
              View Leaderboard
            </button>
          </div> */}
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

export default ComingSoon;