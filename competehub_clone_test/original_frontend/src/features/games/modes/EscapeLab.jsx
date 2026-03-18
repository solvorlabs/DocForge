// src/pages/games/EscapeLab.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/themes/doodle.css';
import { createClickEffect, getRandomDoodleDecoration, getRandomRotation } from '../../../shared/utils/doodleUtils';
import { FlaskConical, ArrowLeft, Users, Clock, Beaker, AlertTriangle } from 'lucide-react';

function EscapeLab() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const handleBack = (e) => {
        createClickEffect(e);
        navigate('/');
    };

    const roles = [
        {
            id: 'biologist',
            name: 'Biologist',
            icon: '🧬',
            color: 'var(--doodle-green)',
            description: 'Analyze DNA sequences, culture samples, and understand biological processes',
            puzzles: ['Gene Sequencing', 'Cell Culture Analysis', 'Virus Identification']
        },
        {
            id: 'chemist',
            name: 'Chemist',
            icon: '⚗️',
            color: 'var(--doodle-blue)',
            description: 'Mix compounds, balance equations, and neutralize dangerous chemicals',
            puzzles: ['Chemical Balancing', 'pH Neutralization', 'Compound Synthesis']
        },
        {
            id: 'physicist',
            name: 'Physicist',
            icon: '⚛️',
            color: 'var(--doodle-purple)',
            description: 'Fix quantum equipment, calculate radiation levels, and manage energy systems',
            puzzles: ['Reactor Calibration', 'Particle Acceleration', 'Energy Distribution']
        },
        {
            id: 'engineer',
            name: 'Engineer',
            icon: '⚙️',
            color: 'var(--doodle-orange)',
            description: 'Repair systems, manage power grids, and coordinate team communications',
            puzzles: ['System Diagnostics', 'Power Management', 'Emergency Protocols']
        }
    ];

    return (
        <div className="doodle-container">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="doodle-avatar" style={{ transform: `rotate(${getRandomRotation()}deg)`, marginBottom: '20px' }}>
                        <FlaskConical size={50} color="#fff" />
                    </div>
                    <h1 className="doodle-title" style={{ fontSize: '3rem', marginBottom: '10px' }}>
                        Escape Room: Lab Disaster
                    </h1>
                    <p className="doodle-subtitle" style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
                        Collaborate with scientists to prevent a catastrophic laboratory meltdown!
                    </p>
                    <div className="doodle-stars" style={{ fontSize: '1.5rem' }}>
                        {getRandomDoodleDecoration()}
                    </div>
                </div>

                {/* Coming Soon Banner */}
                <div style={{
                    background: 'linear-gradient(45deg, var(--doodle-orange), var(--doodle-accent))',
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
                        ⚠️ Coming Soon!
                    </h2>
                    <p style={{ fontSize: '1.1rem', margin: 0 }}>
                        Emergency protocols being developed - Stay tuned for launch details!
                    </p>
                </div>

                {/* Game Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                    <div className="doodle-card">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <AlertTriangle size={50} color="var(--doodle-accent)" />
                        </div>
                        <h3 style={{
                            fontFamily: 'Architects Daughter, cursive',
                            fontSize: '1.8rem',
                            color: 'var(--doodle-ink)',
                            textAlign: 'center',
                            marginBottom: '15px',
                            transform: 'rotate(-1deg)'
                        }}>
                            The Crisis
                        </h3>
                        <p style={{
                            color: 'var(--doodle-secondary)',
                            fontSize: '1.1rem',
                            lineHeight: '1.7',
                            textAlign: 'center'
                        }}>
                            A experimental lab accident has triggered multiple containment failures. You have 60 minutes to work together, solve scientific puzzles, and prevent a catastrophic meltdown that could affect the entire city!
                        </p>
                    </div>

                    <div className="doodle-card">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <Clock size={50} color="var(--doodle-blue)" />
                        </div>
                        <h3 style={{
                            fontFamily: 'Architects Daughter, cursive',
                            fontSize: '1.8rem',
                            color: 'var(--doodle-ink)',
                            textAlign: 'center',
                            marginBottom: '15px',
                            transform: 'rotate(1deg)'
                        }}>
                            Time Pressure
                        </h3>
                        <ul style={{
                            color: 'var(--doodle-secondary)',
                            fontSize: '1.1rem',
                            lineHeight: '1.8',
                            listStyle: 'none',
                            padding: 0
                        }}>
                            <li>⏰ <strong>60-minute countdown</strong> to disaster</li>
                            <li>🚨 <strong>Progressive difficulty</strong> as time runs out</li>
                            <li>💡 <strong>Hint system</strong> for struggling teams</li>
                            <li>🎯 <strong>Multiple escape conditions</strong> for victory</li>
                        </ul>
                    </div>
                </div>

                {/* Scientific Roles */}
                <div className="doodle-card" style={{ marginBottom: '40px' }}>
                    <h3 style={{
                        fontFamily: 'Architects Daughter, cursive',
                        fontSize: '2rem',
                        color: 'var(--doodle-ink)',
                        textAlign: 'center',
                        marginBottom: '30px',
                        transform: 'rotate(-1deg)'
                    }}>
                        Choose Your Scientific Role
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                onClick={() => setSelectedRole(role.id === selectedRole ? null : role.id)}
                                style={{
                                    padding: '20px',
                                    border: `3px solid ${selectedRole === role.id ? role.color : 'var(--doodle-ink)'}`,
                                    borderRadius: '15px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: selectedRole === role.id ? `${role.color}20` : 'white',
                                    transform: `rotate(${getRandomRotation()}deg)`
                                }}
                                className="game-card-hover"
                            >
                                <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '3rem' }}>
                                    {role.icon}
                                </div>
                                <h4 style={{
                                     
                                    fontSize: '1.4rem',
                                    color: role.color,
                                    textAlign: 'center',
                                    marginBottom: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    {role.name}
                                </h4>
                                <p style={{
                                    color: 'var(--doodle-secondary)',
                                    fontSize: '0.95rem',
                                    textAlign: 'center',
                                    marginBottom: '15px',
                                    lineHeight: '1.5'
                                }}>
                                    {role.description}
                                </p>

                                {selectedRole === role.id && (
                                    <div>
                                        <h5 style={{ fontSize: '1.1rem', color: 'var(--doodle-ink)', marginBottom: '10px' }}>
                                            Your Puzzles:
                                        </h5>
                                        <ul style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)', listStyle: 'none', padding: 0 }}>
                                            {role.puzzles.map((puzzle, index) => (
                                                <li key={index} style={{ marginBottom: '5px' }}>
                                                    🧩 {puzzle}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Collaboration Features */}
                <div className="doodle-card" style={{ marginBottom: '40px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Users size={50} color="var(--doodle-green)" />
                    </div>
                    <h3 style={{
                        fontFamily: 'Architects Daughter, cursive',
                        fontSize: '1.8rem',
                        color: 'var(--doodle-ink)',
                        textAlign: 'center',
                        marginBottom: '20px',
                        transform: 'rotate(-1deg)'
                    }}>
                        Collaborative Gameplay
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div style={{ textAlign: 'center', padding: '15px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💬</div>
                            <h4 style={{ fontSize: '1.2rem', color: 'var(--doodle-ink)', marginBottom: '8px' }}>Team Chat</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                                Real-time communication system
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', padding: '15px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
                            <h4 style={{ fontSize: '1.2rem', color: 'var(--doodle-ink)', marginBottom: '8px' }}>Shared Progress</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                                Team progress tracking
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', padding: '15px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🤝</div>
                            <h4 style={{ fontSize: '1.2rem', color: 'var(--doodle-ink)', marginBottom: '8px' }}>Joint Puzzles</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                                Requires multiple specialists
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', padding: '15px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
                            <h4 style={{ fontSize: '1.2rem', color: 'var(--doodle-ink)', marginBottom: '8px' }}>Host Control</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                                Monitor and assist teams
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mockup Preview */}
                <div className="doodle-card" style={{ marginBottom: '40px' }}>
                    <h3 style={{
                        fontFamily: 'Architects Daughter, cursive',
                        fontSize: '1.8rem',
                        color: 'var(--doodle-ink)',
                        textAlign: 'center',
                        marginBottom: '20px',
                        transform: 'rotate(1deg)'
                    }}>
                        Game Interface Preview
                    </h3>
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                        border: '2px solid var(--doodle-ink)',
                        borderRadius: '15px',
                        padding: '30px',
                        color: 'white',
                        minHeight: '250px'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', height: '200px' }}>
                            {/* Main Lab View */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '10px',
                                padding: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                position: 'relative'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏭</div>
                                <p style={{ textAlign: 'center', fontSize: '1rem' }}>3D Laboratory Environment</p>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'var(--doodle-accent)',
                                    padding: '5px 10px',
                                    borderRadius: '15px',
                                    fontSize: '0.8rem'
                                }}>
                                    45:32 ⏰
                                </div>
                            </div>

                            {/* Side Panel */}
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '10px',
                                padding: '15px'
                            }}>
                                <div style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                                    <strong>Team Status:</strong>
                                </div>
                                <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                                    🧬 Biologist: DNA Analysis... ✅<br />
                                    ⚗️ Chemist: Mixing compounds...<br />
                                    ⚛️ Physicist: Reactor offline ⚠️<br />
                                    ⚙️ Engineer: Power restored ✅
                                </div>
                            </div>
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

export default EscapeLab;