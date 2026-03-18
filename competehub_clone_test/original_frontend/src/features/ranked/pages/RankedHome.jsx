import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../app/providers/UserContext';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import { Sword, SwordsIcon, User } from 'lucide-react';

export default function RankedHome() {
  const navigate = useNavigate();
  const { user, getToken } = useUser();
  const [rankedProfile, setRankedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const loadRankedProfile = async () => {
      try {
        const token = getToken();
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');

        if (!profile.userId || !token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}/ranked/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: profile.userId,
            username: profile.username
          })
        });

        if (response.ok) {
          const data = await response.json();
          setRankedProfile(data);
        }
      } catch (error) {
        console.error('Error loading ranked profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankedProfile();
  }, [getToken]);

  const getRankFromElo = (elo) => {
    if (elo >= 2000) return { name: 'Grandmaster', color: '#FF1493' };
    if (elo >= 1800) return { name: 'Master', color: '#8A2BE2' };
    if (elo >= 1600) return { name: 'Diamond', color: '#B9F2FF' };
    if (elo >= 1400) return { name: 'Platinum', color: '#E5E4E2' };
    if (elo >= 1200) return { name: 'Gold', color: '#FFD700' };
    if (elo >= 1000) return { name: 'Silver', color: '#C0C0C0' };
    return { name: 'Bronze', color: '#CD7F32' };
  };

  const rank = rankedProfile ? getRankFromElo(rankedProfile.elo) : { name: 'Bronze', color: '#CD7F32' };

  return (
    <>
    <Helmet>
      <title>CompeteHub Ranked – 1v1 ELO-Based Multiplayer Quiz Ladder</title>
      <meta
        name="description"
        content="Play intense 1v1 ranked quiz matches with an ELO ladder. Climb from Bronze to Grandmaster by winning real-time knowledge battles based on exam-style questions."
      />
      <meta
        name="keywords"
        content="ranked quiz ladder, ELO rating quiz, 1v1 multiplayer quiz, competitive exam battles, CompeteHub ranked mode"
      />
    </Helmet>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #f7fafc 25%, transparent 25%), linear-gradient(-45deg, #f7fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7fafc 75%), linear-gradient(-45deg, transparent 75%, #f7fafc 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#edf2f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
       
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Top Left - Back to Arena Icon */}
      <button
        onClick={() => navigate('/home')}
        className="doodle-btn"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'var(--doodle-sketch)',
          width: '48px',
          height: '48px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 10
        }}
        title="Back to Arena"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Top Right - How to Play Icon */}
      <button
        onClick={() => setShowRules(true)}
        className="doodle-btn"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--doodle-blue)',
          width: '48px',
          height: '48px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 10
        }}
        title="How to Play"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      
      

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        maxWidth: '1600px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        {/* Left Side - Ranked Content */}
        <div style={{
          maxWidth: '600px',
          width: '100%',
          flex: '1 1 auto',
          background: 'var(--doodle-paper)',
          border: '4px solid var(--doodle-ink)',
          borderRadius: '25px',
          padding: '40px 35px',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
          transform: 'rotate(-0.5deg)'
        }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }} className="hidden md:block">
          {/* <div style={{ fontSize: '4rem', marginBottom: '20px', display:'flex', justifyContent: 'center', alignItems: 'center' }}><User size={'60'}/> <SwordsIcon size={'60'}/> <User size={'60'}/></div> */}
          <h1 className="doodle-title text-4xl mb-3">
            Ranked 1v1
          </h1>
          <p className="doodle-subtitle text-lg">
            Climb the ladder with ELO-based competitive matchmaking
          </p>
        </div>

        {/* Profile Summary */}
        {isLoading ? (
          <div className="doodle-card" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="doodle-spinner" style={{ margin: '20px auto' }}></div>
            <p style={{   }}>Loading your profile...</p>
          </div>
        ) : rankedProfile ? (
          <div className="doodle-card" style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              gap: '20px',
              padding: '15px'
            }}>
              <div style={{ fontSize: '3rem' }}><User size={'60'}/></div>
              <div>
                <h3 style={{
                   
                  marginBottom: '8px',
                  fontSize: '1.4rem'
                }}>
                  {rankedProfile.username}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                   
                }}>
                  <span style={{ fontSize: '1.1rem' }}>
                    ELO: <strong>{rankedProfile.elo}</strong>
                  </span>
                  <span style={{ fontSize: '0.9rem', opacity: '0.7' }}>
                    Games: {rankedProfile.gamesPlayed}
                  </span>
                  <span style={{ fontSize: '0.9rem', opacity: '0.7' }}>
                    W/L: {rankedProfile.wins}/{rankedProfile.losses}
                  </span>
                </div>
              </div>
              <div style={{
                padding: '8px 16px',
                background: rank.color,
                color: rank.name === 'Gold' || rank.name === 'Silver' ? 'var(--doodle-ink)' : 'white',
                borderRadius: '20px',
                 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {rank.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="doodle-card" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🆕</div>
              <p style={{   fontSize: '1.1rem' }}>
                Welcome to Ranked! Your profile will be created when you play your first match.
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div className="doodle-card" style={{ textAlign: 'center', padding: '20px' }}>
            <DoodleIcons.Trophy size={32} style={{ color: 'var(--doodle-green)', marginBottom: '10px' }} />
            <h4 style={{ fontFamily: 'Architects Daughter, cursive', marginBottom: '5px' }}>View Profile</h4>
            <p style={{   fontSize: '0.85rem', opacity: '0.7' }}>Check detailed stats</p>
            <button
              onClick={() => navigate('/ranked/profile')}
              className="doodle-btn"
              style={{ marginTop: '10px', fontSize: '0.9rem', padding: '8px 16px' }}
            >
              Go to Profile
            </button>
          </div>
          
          <div className="doodle-card" style={{ textAlign: 'center', padding: '20px' }}>
            <DoodleIcons.Timer size={32} style={{ color: 'var(--doodle-yellow)', marginBottom: '10px' }} />
            <h4 style={{ fontFamily: 'Architects Daughter, cursive', marginBottom: '5px' }}>Match History</h4>
            <p style={{   fontSize: '0.85rem', opacity: '0.7' }}>Review past games</p>
            <button
              onClick={() => navigate('/ranked/history')}
              className="doodle-btn"
              style={{ marginTop: '10px', fontSize: '0.9rem', padding: '8px 16px' }}
            >
              View History
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
            onClick={() => navigate('/ranked/search')}
          >
            Play Ranked
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="doodle-btn flex-1 flex items-center justify-center gap-2"
              onClick={() => navigate('/home')}
              style={{background: 'var(--doodle-sketch)', color: 'white'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Arena
            </button>
            <button
              className="doodle-btn flex-1 flex items-center justify-center gap-2"
              onClick={() => setShowRules(true)}
              style={{background: 'var(--doodle-blue)', color: 'white'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Play
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Doodle Character */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          maxWidth: '500px'
        }}
        className="hidden md:flex">
          <img 
            src="/doodieranked.png" 
            alt="Doodle Ranked" 
            style={{ 
              animation: 'bounce 2s infinite', 
              width: '100%', 
              maxWidth: '400px',
              height: 'auto'
            }} 
          />
          
          {/* Message Bubble */}
          <div style={{
            background: 'white',
            border: '3px solid var(--doodle-ink)',
            borderRadius: '20px',
            padding: '20px 30px',
            boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.2)',
            transform: 'rotate(1deg)',
            maxWidth: '350px',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--doodle-ink)',
              lineHeight: 1.4
            }}>
              CLIMB THE RANKS! 
              <br />
              <span style={{ color: '#6c5ce7' }}>PROVE YOUR WORTH!</span>
            </p>
          </div>
        </div>
    </div>
    </div>
    
    {/* Rules Modal */}
    {showRules && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">How to Play Ranked Mode</h2>
              <button
                onClick={() => setShowRules(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🎯 Objective</h3>
                <p>Compete in ranked matchmaking to climb the competitive ladder and prove your trivia mastery!</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🏆 ELO Rating System</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Starting ELO:</strong> New players begin at 1200 ELO (Gold rank)</li>
                  <li><strong>Win matches:</strong> Gain ELO points and climb the ladder</li>
                  <li><strong>Lose matches:</strong> Drop ELO points but learn from mistakes</li>
                  <li><strong>Fair matchmaking:</strong> Gain/loss depends on opponent's relative skill</li>
                  <li>Beating higher-ranked players = more points gained</li>
                  <li>Losing to lower-ranked players = more points lost</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Rank Tiers</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Bronze (0-999):</strong> Starting your journey</li>
                  <li><strong>Silver (1000-1199):</strong> Building fundamentals</li>
                  <li><strong>Gold (1200-1399):</strong> Solid knowledge base</li>
                  <li><strong>Platinum (1400-1599):</strong> Advanced player</li>
                  <li><strong>Diamond (1600-1799):</strong> Elite competitor</li>
                  <li><strong>Master (1800-1999):</strong> Top-tier expert</li>
                  <li><strong>Grandmaster (2000+):</strong> The absolute best</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🎮 Matchmaking</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Click "Play Ranked" to enter the matchmaking queue</li>
                  <li>System finds opponents with similar ELO rating</li>
                  <li>Wait time varies based on player availability</li>
                  <li>Can't choose opponents - system ensures fair matches</li>
                  <li>Matched players compete in head-to-head trivia</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">⚔️ Competitive Gameplay</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Same questions for both players</li>
                  <li>Answer quickly and accurately</li>
                  <li>Each question has a time limit</li>
                  <li>Speed bonus for faster correct answers</li>
                  <li>Wrong answers = no points</li>
                  <li>Higher total score wins the match</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">📈 Your Profile</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Current Rank & ELO:</strong> See your standing</li>
                  <li><strong>Win/Loss Record:</strong> Track your competitive performance</li>
                  <li><strong>Match History:</strong> Review past games and ELO changes</li>
                  <li><strong>Performance Trends:</strong> Analyze your improvement</li>
                  <li><strong>Subject Stats:</strong> See strengths and weaknesses</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Tips for Success</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Play regularly to maintain and improve your rank</li>
                  <li>Focus on both speed and accuracy</li>
                  <li>Learn from losses - review match history</li>
                  <li>Practice in other modes to sharpen skills</li>
                  <li>Don't fear rank loss - it's part of learning</li>
                  <li>Stay calm under pressure</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🎪 Match Flow</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Click "Play Ranked" to queue</li>
                  <li>Wait for opponent match</li>
                  <li>Both players answer same questions</li>
                  <li>Complete all questions in the match</li>
                  <li>View final scores and ELO change</li>
                  <li>Check updated rank and stats</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🌟 Competitive Spirit</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Respect all opponents regardless of rank</li>
                  <li>Focus on self-improvement, not just winning</li>
                  <li>Every match is a learning opportunity</li>
                  <li>Celebrate victories, learn from defeats</li>
                  <li>The journey to the top is part of the fun!</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="doodle-btn doodle-btn-secondary w-full mt-8 px-6 py-4"
            >
              Got It!
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}


