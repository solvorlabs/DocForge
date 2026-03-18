// src/pages/games/AITraining.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/themes/doodle.css';
import { createClickEffect, getRandomDoodleDecoration, getRandomRotation } from '../../../shared/utils/doodleUtils';
import { Cpu, ArrowLeft, BarChart3, Settings, TrendingUp, Zap } from 'lucide-react';

function AITraining() {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState(null);

  const handleBack = (e) => {
    createClickEffect(e);
    navigate('/');
  };

  const datasets = [
    {
      id: 'animals',
      name: 'Animal Classification',
      description: 'Train AI to classify cats, dogs, birds, and fish',
      samples: 10000,
      difficulty: 'Beginner',
      color: 'var(--doodle-green)'
    },
    {
      id: 'weather',
      name: 'Weather Prediction',
      description: 'Predict tomorrow\'s weather from atmospheric data',
      samples: 50000,
      difficulty: 'Intermediate',
      color: 'var(--doodle-blue)'
    },
    {
      id: 'handwriting',
      name: 'Handwriting Recognition',
      description: 'Recognize handwritten digits and letters',
      samples: 70000,
      difficulty: 'Advanced',
      color: 'var(--doodle-purple)'
    },
    {
      id: 'market',
      name: 'Stock Market Analysis',
      description: 'Predict stock price movements from historical data',
      samples: 100000,
      difficulty: 'Expert',
      color: 'var(--doodle-accent)'
    }
  ];

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="doodle-avatar" style={{ transform: `rotate(${getRandomRotation()}deg)`, marginBottom: '20px' }}>
            <Cpu size={50} color="#fff" />
          </div>
          <h1 className="doodle-title" style={{ fontSize: '3rem', marginBottom: '10px' }}>
            AI Training Arena
          </h1>
          <p className="doodle-subtitle" style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
            Compete to train the smartest artificial intelligence using real datasets!
          </p>
          <div className="doodle-stars" style={{ fontSize: '1.5rem' }}>
            {getRandomDoodleDecoration()}
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div style={{
          background: 'linear-gradient(45deg, var(--doodle-blue), var(--doodle-purple))',
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
            🤖 Coming Soon!
          </h2>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>
            Neural networks being trained... Stay tuned for launch details!
          </p>
        </div>

        {/* Game Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <TrendingUp size={50} color="var(--doodle-green)" />
            </div>
            <h3 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '1.8rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '15px',
              transform: 'rotate(-1deg)'
            }}>
              The Challenge
            </h3>
            <p style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1.1rem',
              lineHeight: '1.7',
              textAlign: 'center'
            }}>
              Select a dataset, tune neural network parameters, and compete to achieve the highest accuracy score. Learn machine learning concepts while having fun!
            </p>
          </div>

          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Settings size={50} color="var(--doodle-orange)" />
            </div>
            <h3 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '1.8rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '15px',
              transform: 'rotate(1deg)'
            }}>
              Tuning Parameters
            </h3>
            <ul style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li>🎛️ <strong>Learning Rate:</strong> How fast your AI learns</li>
              <li>🔄 <strong>Epochs:</strong> Training iterations</li>
              <li>🧠 <strong>Hidden Layers:</strong> Network depth</li>
              <li>⚡ <strong>Batch Size:</strong> Training efficiency</li>
            </ul>
          </div>
        </div>

        {/* Dataset Selection */}
        <div className="doodle-card" style={{ marginBottom: '40px' }}>
          <h3 style={{
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            color: 'var(--doodle-ink)',
            textAlign: 'center',
            marginBottom: '30px',
            transform: 'rotate(-1deg)'
          }}>
            Choose Your Training Dataset
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                onClick={() => setSelectedDataset(dataset.id === selectedDataset ? null : dataset.id)}
                style={{
                  padding: '20px',
                  border: `3px solid ${selectedDataset === dataset.id ? dataset.color : 'var(--doodle-ink)'}`,
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: selectedDataset === dataset.id ? `${dataset.color}20` : 'white',
                  transform: `rotate(${getRandomRotation()}deg)`
                }}
                className="game-card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{
                     
                    fontSize: '1.3rem',
                    color: dataset.color,
                    margin: 0,
                    fontWeight: 'bold'
                  }}>
                    {dataset.name}
                  </h4>
                  <span style={{
                    padding: '3px 8px',
                    background: dataset.color,
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '0.8rem'
                  }}>
                    {dataset.difficulty}
                  </span>
                </div>
                
                <p style={{
                  color: 'var(--doodle-secondary)',
                  fontSize: '0.95rem',
                  marginBottom: '15px',
                  lineHeight: '1.5'
                }}>
                  {dataset.description}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '10px'
                }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                    📊 {dataset.samples.toLocaleString()} samples
                  </span>
                  {selectedDataset === dataset.id && (
                    <span style={{ color: dataset.color, fontWeight: 'bold' }}>
                      ✓ Selected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Interface Preview */}
        <div className="doodle-card" style={{ marginBottom: '40px' }}>
          <h3 style={{
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '1.8rem',
            color: 'var(--doodle-ink)',
            textAlign: 'center',
            marginBottom: '25px',
            transform: 'rotate(1deg)'
          }}>
            AI Training Dashboard Preview
          </h3>
          
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            border: '2px solid var(--doodle-ink)',
            borderRadius: '15px',
            padding: '25px',
            color: 'white'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Training Graph */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '15px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.9rem' }}>Training Progress</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--doodle-green)' }}>Accuracy: 94.2%</span>
                </div>
                <div style={{
                  height: '100px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChart3 size={40} color="var(--doodle-green)" />
                </div>
              </div>
              
              {/* Parameters Panel */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                  <strong>Current Settings:</strong>
                </div>
                <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                  Learning Rate: 0.001<br/>
                  Epochs: 50/100<br/>
                  Batch Size: 32<br/>
                  Hidden Layers: 3<br/>
                  <div style={{ marginTop: '10px', color: 'var(--doodle-yellow)' }}>
                    🏆 Current Leader: Alice (96.8%)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Competition Status */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '15px',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🥇</div>
                <div style={{ fontSize: '0.8rem' }}>Alice: 96.8%</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🥈</div>
                <div style={{ fontSize: '0.8rem' }}>Bob: 95.1%</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🥉</div>
                <div style={{ fontSize: '0.8rem' }}>You: 94.2%</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⏱️</div>
                <div style={{ fontSize: '0.8rem' }}>Time Left: 12:34</div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <Zap size={40} color="var(--doodle-yellow)" />
            </div>
            <h4 style={{
               
              fontSize: '1.4rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              Real-time Visualization
            </h4>
            <p style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Watch your neural network learn in real-time with accuracy graphs and loss curves.
            </p>
          </div>

          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '2.5rem' }}>
              📚
            </div>
            <h4 style={{
               
              fontSize: '1.4rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              Educational Content
            </h4>
            <p style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Learn about overfitting, neural networks, and machine learning concepts while playing.
            </p>
          </div>

          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '2.5rem' }}>
              🏆
            </div>
            <h4 style={{
               
              fontSize: '1.4rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              Global Leaderboards
            </h4>
            <p style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Compete against players worldwide and climb the AI training leaderboard.
            </p>
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

export default AITraining;