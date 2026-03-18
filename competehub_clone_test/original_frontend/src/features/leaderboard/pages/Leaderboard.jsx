// src/pages/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/themes/doodle.css';
import { createClickEffect, DoodleIcons, getRandomDoodleDecoration, getRandomRotation, FireDoodle, FinishFlag } from '../../../shared/utils/doodleUtils';
import axios from 'axios';

function Leaderboard() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questionsFilter, setQuestionsFilter] = useState('all');
  const [timeFrame, setTimeFrame] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [leaderboardType, setLeaderboardType] = useState('ranked');
  const [gameMode, setGameMode] = useState('overall');
  const [platformStats, setPlatformStats] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');

      let endpoint = '';
      const token = localStorage.getItem('authToken');
      const config = token ? {
        headers: { 'Authorization': `Bearer ${token}` }
      } : {};

      if (leaderboardType === 'ranked') {
        endpoint = `/leaderboard/ranked?page=${currentPage}&limit=${itemsPerPage}`;
      } else if (leaderboardType === 'solo') {
        const mode = gameMode || 'overall';
        endpoint = `/leaderboard/solo/${mode}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const API_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setLeaderboardData(result.data.leaderboard || []);
      } else {
        setError(result.message || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/leaderboard/platform-stats`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPlatformStats(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching platform stats:', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchPlatformStats();
    // eslint-disable-next-line
  }, [questionsFilter, subjectFilter, difficultyFilter, examTypeFilter, leaderboardType, gameMode, timeFrame, currentPage]);

  // Format time in mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle filter changes
  const handleQuestionsFilterChange = (e) => {
    setQuestionsFilter(e.target.value);
  };

  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
  };

  const handleLeaderboardTypeChange = (type) => {
    setLeaderboardType(type);
    setCurrentPage(1); // Reset to first page
  };

  const handleGameModeChange = (mode) => {
    setGameMode(mode);
    setCurrentPage(1); // Reset to first page
  };

  // Go back to home
  const goToHome = (e) => {
    createClickEffect(e);
    navigate('/');
  };

  // Start a new challenge
  const startNewChallenge = (e) => {
    createClickEffect(e);
    navigate('/solo-challenge');
  };

  // Navigate to player profile
  const viewPlayerProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <DoodleIcons.Trophy size={24} color="var(--doodle-yellow)" />;
      case 2: return <DoodleIcons.Star size={24} color="var(--doodle-sketch)" />;
      case 3: return <DoodleIcons.Star size={24} color="var(--doodle-orange)" />;
      default: return <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>#{rank}</span>;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
  const paginatedData = leaderboardData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Doodle pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    // Show up to 5 page numbers, centered on current page
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className="doodle-pagination-cell"
          style={{
            margin: '0 4px',
            padding: '6px 14px',
            borderRadius: '50%',
            border: i === currentPage ? '2px solid var(--doodle-blue)' : '2px dashed var(--doodle-yellow)',
            background: i === currentPage ? 'var(--doodle-yellow)' : '#fff',
            color: i === currentPage ? 'var(--doodle-ink)' : 'var(--doodle-blue)',
            fontWeight: i === currentPage ? 'bold' : 'normal',
             
            fontSize: '1rem',
            boxShadow: i === currentPage ? '2px 2px 0 rgba(0,0,0,0.12)' : 'none',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
            transform: i === currentPage ? 'scale(1.1) rotate(-2deg)' : 'rotate(2deg)'
          }}
        >
          {i}
        </button>
      );
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '30px 0 10px 0', gap: '8px' }}>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="doodle-pagination-cell"
          style={{
            margin: '0 8px',
            padding: '6px 14px',
            borderRadius: '50%',
            border: '2px dashed var(--doodle-blue)',
            background: '#fff',
            color: 'var(--doodle-blue)',
            fontWeight: 'bold',
             
            fontSize: '1.1rem',
            boxShadow: '1px 1px 0 rgba(0,0,0,0.10)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            outline: 'none',
            transition: 'all 0.2s',
            transform: 'rotate(-8deg)'
          }}
          aria-label="Previous page"
        >
          {'<'}
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="doodle-pagination-cell"
          style={{
            margin: '0 8px',
            padding: '6px 14px',
            borderRadius: '50%',
            border: '2px dashed var(--doodle-blue)',
            background: '#fff',
            color: 'var(--doodle-blue)',
            fontWeight: 'bold',
             
            fontSize: '1.1rem',
            boxShadow: '1px 1px 0 rgba(0,0,0,0.10)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            outline: 'none',
            transition: 'all 0.2s',
            transform: 'rotate(8deg)'
          }}
          aria-label="Next page"
        >
          {'>'}
        </button>
      </div>
    );
  };

  return (
    <div className="doodle-container">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="doodle-avatar" style={{ transform: `rotate(${getRandomRotation()}deg)` }}>
            <DoodleIcons.Trophy size={40} color="#fff" />
          </div>
          <h1 className="doodle-title">Leaderboard</h1>
          <p className="doodle-subtitle">
            See how you rank against other quiz champions!
          </p>
          <br />
          <div className="doodle-stars">{getRandomDoodleDecoration()}</div>
        </div>

        {error && (
          <div className="doodle-alert" style={{ marginBottom: '30px' }}>
            {error}
            <button
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                float: 'right',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Leaderboard Type Toggle */}
        <div className="doodle-paper" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ padding: '20px' }}>
            <h3 style={{
              fontFamily: 'Architects Daughter, cursive',
              color: 'var(--doodle-ink)',
              marginBottom: '20px',
              fontSize: '1.3rem'
            }}>
              Choose Leaderboard Type
            </h3>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className={`doodle-btn ${leaderboardType === 'ranked' ? 'doodle-btn-primary' : 'doodle-btn-secondary'}`}
                onClick={() => handleLeaderboardTypeChange('ranked')}
                style={{ minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <DoodleIcons.Trophy size={20} /> Ranked 1v1
              </button>
              <button
                className={`doodle-btn ${leaderboardType === 'solo' ? 'doodle-btn-primary' : 'doodle-btn-secondary'}`}
                onClick={() => handleLeaderboardTypeChange('solo')}
                style={{ minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <DoodleIcons.Brain size={20} /> Solo Challenges
              </button>
            </div>

            {leaderboardType === 'solo' && (
              <>
                <div style={{ marginTop: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                     
                    fontWeight: '600',
                    color: 'var(--doodle-ink)'
                  }}>
                    Challenge Mode:
                  </label>
                  <select
                    className="doodle-input"
                    value={gameMode}
                    onChange={(e) => handleGameModeChange(e.target.value)}
                    style={{ maxWidth: '300px', margin: '0 auto' }}
                  >
                    <option value="overall">Overall High Scores</option>
                    <option value="equation-builder">Equation Builder</option>
                    <option value="boss-mode">Boss Mode Challenge</option>
                    <option value="numerical-speed-race">Numerical Speed Race</option>
                    <option value="dragon-out">Dragon Out</option>
                    <option value="endless-runner">Endless Runner</option>
                    <option value="crossword">Crossword Puzzle</option>
                  </select>
                </div>
                
                {/* Sort Options */}
                <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '400px', margin: '15px auto 0' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                       
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: 'var(--doodle-ink)'
                    }}>
                      Sort By:
                    </label>
                    <select
                      className="doodle-input"
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                      style={{ fontSize: '0.85rem', padding: '8px' }}
                    >
                      <option value="score">Score</option>
                      <option value="gamesPlayed">Games Played</option>
                      <option value="gamesWon">Games Won</option>
                      <option value="winRate">Win Rate</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                       
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: 'var(--doodle-ink)'
                    }}>
                      Order:
                    </label>
                    <select
                      className="doodle-input"
                      value={sortOrder}
                      onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                      style={{ fontSize: '0.85rem', padding: '8px' }}
                    >
                      <option value="desc">Highest First</option>
                      <option value="asc">Lowest First</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {platformStats && (
              <div style={{ marginTop: '15px', fontSize: '0.9rem', color: 'var(--doodle-ink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DoodleIcons.Target size={16} /> {platformStats.totalCompeters} total competers
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DoodleIcons.Gamepad size={16} /> {platformStats.totalGamesPlayed} games played
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DoodleIcons.Lightning size={16} /> {platformStats.activeToday} active today
                </span>
              </div>
            )}
          </div>
        </div>
        <br />
        {/* Leaderboard */}
        <div className="doodle-paper">
          <div style={{ padding: '10px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="doodle-spinner" style={{ margin: '0 auto 20px' }}></div>
                <p style={{   color: 'var(--doodle-secondary)' }}>
                  Loading leaderboard...
                </p>
              </div>
            ) : (
              <>
                <h3 style={{
                  fontFamily: 'Architects Daughter, cursive',
                  color: 'var(--doodle-ink)',
                  marginBottom: '0px',
                  fontSize: '1.3rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  {leaderboardType === 'ranked' 
                    ? <><DoodleIcons.Trophy size={24} /> Ranked ELO Leaderboard</>
                    : <><DoodleIcons.Brain size={24} /> {gameMode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Leaderboard</>
                  }
                </h3>

                {/* Pagination controls */}
                {renderPagination()}
                <div style={{ display: 'grid', gap: '15px' }}>
                  <br />
                  {paginatedData.map((player, index) => (
                    <div
                      key={player.username}
                      className="doodle-card leaderboard-player-card"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        // transform: `rotate(${getRandomRotation(-1, 1)}deg)`,
                        background: player.rank <= 3 ? 'linear-gradient(45deg, #fff9c4, #fff)' : 'var(--doodle-paper)',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={() => viewPlayerProfile(player.userId)}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <div className="leaderboard-card-content" style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '20px', alignItems: 'center' }}>
                        {/* Rank */}
                        <div className="rank-section" style={{ textAlign: 'center' }}>
                          {getRankIcon(player.rank)}
                        </div>

                        {/* Player Info */}
                        <div className="player-info-section">
                          <div className="player-username" style={{
                             
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: 'var(--doodle-ink)',
                            marginBottom: '5px',
                            wordBreak: 'break-word'
                          }}>
                            {player.username}
                          </div>

                              <div className="player-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.9rem' }}>
                            {leaderboardType === 'ranked' ? (
                              <>
                                <span style={{ color: 'var(--doodle-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                  <DoodleIcons.Target size={14} style={{ marginRight: '4px' }} />
                                  {player.winRate}% win rate
                                </span>
                                <span style={{ color: 'var(--doodle-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                  <DoodleIcons.Trophy size={14} style={{ marginRight: '4px' }} />
                                  {player.wins}W/{player.losses}L
                                </span>
                                <span style={{ color: 'var(--doodle-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                  <DoodleIcons.Book size={14} style={{ marginRight: '4px' }} />
                                  {player.gamesPlayed} games
                                </span>
                              </>
                            ) : (
                              <>
                                {player.gamesPlayed !== undefined && (
                                  <span style={{ color: 'var(--doodle-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                    <DoodleIcons.Gamepad size={14} style={{ marginRight: '4px' }} /> {player.gamesPlayed} played
                                  </span>
                                )}
                                {player.gamesWon !== undefined && (
                                  <span style={{ color: 'var(--doodle-success)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                    <DoodleIcons.Trophy size={14} style={{ marginRight: '4px' }} /> {player.gamesWon} won
                                  </span>
                                )}
                                {player.winRate !== undefined && player.winRate !== null && player.winRate > 0 && (
                                  <span style={{ color: 'var(--doodle-blue)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                    <DoodleIcons.Lightning size={14} style={{ marginRight: '4px' }} /> {typeof player.winRate === 'number' ? player.winRate.toFixed(1) : parseFloat(player.winRate).toFixed(1)}% win rate
                                  </span>
                                )}
                                {player.accuracy !== undefined && player.accuracy > 0 && (
                                  <span style={{ color: 'var(--doodle-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                    <DoodleIcons.Target size={14} style={{ marginRight: '4px' }} />
                                    {player.accuracy}% accuracy
                                  </span>
                                )}
                                {player.dragonsDefeated !== undefined && player.dragonsDefeated > 0 && (
                                  <span style={{ color: 'var(--doodle-accent)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                    <FireDoodle size={14} style={{ marginRight: '4px' }} /> {player.dragonsDefeated} dragons
                                  </span>
                                )}
                                {player.distanceTraveled !== undefined && player.distanceTraveled > 0 && (
                                  <span style={{ color: 'var(--doodle-green)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                    <FinishFlag size={14} style={{ marginRight: '4px' }} /> {player.distanceTraveled}m
                                  </span>
                                )}
                                {player.puzzlesCompleted !== undefined && player.puzzlesCompleted > 0 && (
                                  <span style={{ color: 'var(--doodle-purple)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                    <DoodleIcons.Brain size={14} style={{ marginRight: '4px' }} /> {player.puzzlesCompleted} puzzles
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Score/Rating */}
                        <div className="rating-section" style={{ textAlign: 'right' }}>
                          <div style={{
                            fontFamily: 'Architects Daughter, cursive',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'var(--doodle-blue)'
                          }}>
                            {leaderboardType === 'ranked' ? player.elo || player.rating : player.score}
                          </div>
                          <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--doodle-secondary)',
                            whiteSpace: 'nowrap'
                          }}>
                            {leaderboardType === 'ranked' ? 'ELO Rating' : 'High Score'}
                          </div>
                          {leaderboardType === 'solo' && player.achievedAt && (
                            <div style={{
                              fontSize: '0.7rem',
                              color: 'var(--doodle-secondary)',
                              marginTop: '5px'
                            }}>
                              {formatDate(player.achievedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination()}

                {/* Your Rank (if logged in) */}
                {/* <div 
                  className="doodle-card" 
                  style={{ 
                    marginTop: '30px',
                    padding: '20px',
                    background: 'linear-gradient(45deg, #e3f2fd, #fff)',
                    border: '3px solid var(--doodle-blue)'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ 
                       
                      color: 'var(--doodle-blue)',
                      marginBottom: '10px'
                    }}>
                      Your Best Performance
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
                          #12
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                          Current Rank
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--doodle-green)' }}>
                          750
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                          Best Score
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--doodle-purple)' }}>
                          88%
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                          Accuracy
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
              </>
            )}
          </div>
        </div>
        <br />
        <br />
        <br />
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
          <button
            className="doodle-btn"
            onClick={goToHome}
            style={{ background: 'var(--doodle-sketch)', color: 'white' }}
          >
            <DoodleIcons.Home size={20} style={{ marginRight: '8px' }} />
            Back to Home
          </button>

          <button
            className="doodle-btn doodle-btn-secondary"
            onClick={startNewChallenge}
          >
            <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
            Start New Challenge
          </button>
        </div>

        {/* Decorative Elements */}
        {/* <div className="doodle-arrow" style={{ bottom: '80px', right: '60px' }}>↙</div>
        <div style={{
          position: 'absolute',
          top: '150px',
          left: '50px',
          fontSize: '1.2rem',
          color: 'var(--doodle-yellow)',
          transform: 'rotate(-15deg)',
          opacity: '0.7'
        }}>
          ★
        </div> */}
      </div>

      {/* Responsive CSS for Leaderboard */}
      <style jsx>{`
        /* Mobile Responsive Styles for Leaderboard */
        @media (max-width: 768px) {
          .leaderboard-player-card {
            padding: 15px !important;
          }
          
          .leaderboard-card-content {
            grid-template-columns: 50px 1fr auto !important;
            gap: 12px !important;
          }
          
          .player-username {
            font-size: 1rem !important;
            margin-bottom: 8px !important;
          }
          
          .player-stats {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
            font-size: 0.8rem !important;
          }
          
          .rating-section > div:first-child {
            font-size: 1.3rem !important;
          }
          
          .rating-section > div:nth-child(2) {
            font-size: 0.7rem !important;
          }
        }
        
        @media (max-width: 600px) {
          .leaderboard-player-card {
            padding: 12px !important;
          }
          
          .leaderboard-card-content {
            grid-template-columns: 40px 1fr 70px !important;
            gap: 10px !important;
          }
          
          .rank-section {
            font-size: 0.9rem !important;
          }
          
          .player-username {
            font-size: 0.9rem !important;
            margin-bottom: 6px !important;
          }
          
          .player-stats {
            font-size: 0.75rem !important;
            gap: 4px !important;
          }
          
          .player-stats span {
            display: flex !important;
            align-items: center !important;
          }
          
          .rating-section > div:first-child {
            font-size: 1.2rem !important;
          }
          
          .rating-section > div:nth-child(2) {
            font-size: 0.65rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .leaderboard-player-card {
            padding: 10px !important;
          }
          
          .leaderboard-card-content {
            grid-template-columns: 35px 1fr 65px !important;
            gap: 8px !important;
          }
          
          .player-username {
            font-size: 0.85rem !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          
          .player-stats {
            font-size: 0.7rem !important;
          }
          
          .rating-section > div:first-child {
            font-size: 1.1rem !important;
          }
        }
        
        @media (max-width: 360px) {
          .leaderboard-card-content {
            grid-template-columns: 30px 1fr 60px !important;
            gap: 6px !important;
          }
          
          .player-username {
            font-size: 0.8rem !important;
          }
          
          .player-stats {
            font-size: 0.65rem !important;
          }
          
          .rating-section > div:first-child {
            font-size: 1rem !important;
          }
          
          .rating-section > div:nth-child(2) {
            font-size: 0.6rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Leaderboard;
