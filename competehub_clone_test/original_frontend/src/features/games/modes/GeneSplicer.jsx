// src/pages/games/GeneSplicer.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/themes/doodle.css';
import { createClickEffect, getRandomDoodleDecoration, getRandomRotation } from '../../../shared/utils/doodleUtils';
import { Dna, ArrowLeft, Zap, Target, Brain } from 'lucide-react';

function GeneSplicer() {
  const navigate = useNavigate();
  const [selectedTrait, setSelectedTrait] = useState(null);

  const handleBack = (e) => {
    createClickEffect(e);
    navigate('/');
  };

  const traits = [
    { id: 'strength', name: 'Physical Strength', alleles: ['SS', 'Ss', 'ss'], dominant: 'S', color: 'var(--doodle-accent)' },
    { id: 'intelligence', name: 'Intelligence', alleles: ['II', 'Ii', 'ii'], dominant: 'I', color: 'var(--doodle-blue)' },
    { id: 'speed', name: 'Speed', alleles: ['FF', 'Ff', 'ff'], dominant: 'F', color: 'var(--doodle-green)' },
    { id: 'resistance', name: 'Disease Resistance', alleles: ['RR', 'Rr', 'rr'], dominant: 'R', color: 'var(--doodle-purple)' }
  ];

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="doodle-avatar" style={{ transform: `rotate(${getRandomRotation()}deg)`, marginBottom: '20px' }}>
            <Dna size={50} color="#fff" />
          </div>
          <h1 className="doodle-title" style={{ fontSize: '3rem', marginBottom: '10px' }}>
            Gene Splicer Simulator
          </h1>
          <p className="doodle-subtitle" style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
            Engineer the perfect organism using Mendelian genetics and CRISPR technology!
          </p>
          <div className="doodle-stars" style={{ fontSize: '1.5rem' }}>
            {getRandomDoodleDecoration()}
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div style={{
          background: 'linear-gradient(45deg, var(--doodle-green), var(--doodle-blue))',
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
            🧬 Coming Soon!
          </h2>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>
            Genetic engineering lab under construction - Stay tuned for launch details!
          </p>
        </div>

        {/* Game Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Target size={50} color="var(--doodle-accent)" />
            </div>
            <h3 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '1.8rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '15px',
              transform: 'rotate(-1deg)'
            }}>
              Objective
            </h3>
            <p style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1.1rem',
              lineHeight: '1.7',
              textAlign: 'center'
            }}>
              Create the optimal organism by combining genes strategically. Use dominant/recessive traits, mutations, and CRISPR editing to achieve the highest fitness score!
            </p>
          </div>

          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Brain size={50} color="var(--doodle-blue)" />
            </div>
            <h3 style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: '1.8rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '15px',
              transform: 'rotate(1deg)'
            }}>
              Learning
            </h3>
            <ul style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li>📚 <strong>Mendelian inheritance</strong> principles</li>
              <li>🔬 <strong>Dominant vs recessive</strong> alleles</li>
              <li>⚡ <strong>Mutation mechanics</strong> and probabilities</li>
              <li>✂️ <strong>CRISPR gene editing</strong> techniques</li>
            </ul>
          </div>
        </div>

        {/* Gene Editor Interface Preview */}
        <div className="doodle-card" style={{ marginBottom: '40px' }}>
          <h3 style={{
            fontFamily: 'Architects Daughter, cursive',
            fontSize: '2rem',
            color: 'var(--doodle-ink)',
            textAlign: 'center',
            marginBottom: '30px',
            transform: 'rotate(-1deg)'
          }}>
            Interactive Gene Editor
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            {traits.map((trait) => (
              <div
                key={trait.id}
                onClick={() => setSelectedTrait(trait.id === selectedTrait ? null : trait.id)}
                style={{
                  padding: '15px',
                  border: `3px solid ${selectedTrait === trait.id ? trait.color : 'var(--doodle-ink)'}`,
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: selectedTrait === trait.id ? `${trait.color}20` : 'white',
                  transform: `rotate(${getRandomRotation()}deg)`
                }}
                className="game-card-hover"
              >
                <h4 style={{
                   
                  fontSize: '1.2rem',
                  color: trait.color,
                  textAlign: 'center',
                  marginBottom: '10px',
                  fontWeight: 'bold'
                }}>
                  {trait.name}
                </h4>
                
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    background: trait.color,
                    color: 'white',
                    borderRadius: '15px',
                    fontSize: '0.9rem',
                    marginBottom: '5px'
                  }}>
                    Dominant: {trait.dominant}
                  </div>
                </div>
                
                {selectedTrait === trait.id && (
                  <div>
                    <h5 style={{ fontSize: '1rem', color: 'var(--doodle-ink)', marginBottom: '8px', textAlign: 'center' }}>
                      Possible Genotypes:
                    </h5>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
                      {trait.alleles.map((allele, index) => (
                        <span key={index} style={{
                          padding: '3px 8px',
                          background: 'rgba(0,0,0,0.1)',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          border: '1px solid var(--doodle-ink)'
                        }}>
                          {allele}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Gene Combination Preview */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            border: '2px solid var(--doodle-ink)',
            borderRadius: '15px',
            padding: '25px',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1.3rem', color: 'var(--doodle-ink)', marginBottom: '15px' }}>
              🧬 Organism Builder Preview
            </h4>
            <p style={{ color: 'var(--doodle-secondary)', marginBottom: '20px' }}>
              Drag and drop alleles to create your perfect organism
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>💪</div>
                <span style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>Strength Editor</span>
              </div>
              <div style={{ fontSize: '2rem', color: 'var(--doodle-sketch)' }}>+</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🧠</div>
                <span style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>Intelligence Editor</span>
              </div>
              <div style={{ fontSize: '2rem', color: 'var(--doodle-sketch)' }}>+</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>⚡</div>
                <span style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>Speed Editor</span>
              </div>
              <div style={{ fontSize: '2rem', color: 'var(--doodle-sketch)' }}>=</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🏆</div>
                <span style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>Fitness Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Features */}
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
              Mutation System
            </h4>
            <p style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Random mutations add unexpected traits. Will you get a beneficial adaptation or harmful defect?
            </p>
          </div>

          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '2.5rem' }}>
              ✂️
            </div>
            <h4 style={{
               
              fontSize: '1.4rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              CRISPR Tools
            </h4>
            <p style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Precisely edit genes with cutting-edge CRISPR technology. Remove unwanted traits or add new ones.
            </p>
          </div>

          <div className="doodle-card">
            <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '2.5rem' }}>
              🏁
            </div>
            <h4 style={{
               
              fontSize: '1.4rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              Competition
            </h4>
            <p style={{
              color: 'var(--doodle-secondary)',
              fontSize: '1rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Compete against friends or AI. Who can create the most adapted organism for different environments?
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

export default GeneSplicer;