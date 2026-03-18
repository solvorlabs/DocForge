// src/pages/community/RankingStrategiesPost.jsx - Ranking Strategies Guide
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Target, TrendingUp, Award, Zap, Brain, Clock } from 'lucide-react';
import { createClickEffect } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import '../../../styles/themes/community.css';

function RankingStrategiesPost() {
  const navigate = useNavigate();

  const handleBackClick = (e) => {
    createClickEffect(e);
    navigate('/community');
  };

  return (
    <div className="doodle-container community-post" style={{
      minHeight: '100vh',
      padding: '80px 15px 20px',
       
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="doodle-btn"
          style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={18} />
          Back to Community
        </button>

        {/* Article */}
        <article className="doodle-paper" style={{
          padding: '25px 30px',
          background: 'linear-gradient(135deg, #3182ce15 0%, var(--doodle-paper) 100%)',
          borderLeft: '6px solid var(--doodle-blue)'
        }}>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <span className="doodle-badge" style={{
              background: 'var(--doodle-blue)',
              padding: '6px 14px',
              fontSize: '0.85rem',
              borderRadius: '15px',
              border: '2px solid var(--doodle-ink)'
            }}>
              Strategy Guide
            </span>
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--doodle-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Calendar size={16} />
              November 10, 2025
            </span>
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--doodle-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <User size={16} />
              Top Player Insights
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            margin: '0 0 20px 0',
            color: 'var(--doodle-ink)',
            fontWeight: 'bold',
            lineHeight: 1.2
          }}>
            Pro Strategies to Climb the Leaderboard
          </h1>

          {/* Content */}
          <div className="article-content">
            
            <p style={{
              fontSize: '1.2rem',
              fontStyle: 'italic',
              borderLeft: '4px solid var(--doodle-blue)',
              paddingLeft: '20px',
              color: 'var(--doodle-secondary)',
              marginBottom: '30px'
            }}>
              So you want to dominate CompeteHub's ranked mode? Good. We compiled insights from our 
              top players who actually know what they're doing. Unlike you. Yet.
            </p>

            <h2>Understanding the Ranking System</h2>
            
            <p>
              Before you can break the system, you need to understand it. CompeteHub uses an 
              ELO-based ranking system that rewards skill progression over time. Here's the breakdown:
            </p>

            <div className="info-box">
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem' }}>
                <TrendingUp size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                How ELO Works on CompeteHub
              </h3>
              <ul style={{ margin: 0, paddingLeft: '25px', lineHeight: 1.8 }}>
                <li><strong>Starting Rating:</strong> Everyone begins at 1200 ELO</li>
                <li><strong>Win Against Higher Rated:</strong> Bigger ELO gains (+40 to +60)</li>
                <li><strong>Win Against Lower Rated:</strong> Smaller ELO gains (+10 to +20)</li>
                <li><strong>Lose Against Lower Rated:</strong> Bigger ELO losses (-40 to -60)</li>
                <li><strong>Lose Against Higher Rated:</strong> Smaller ELO losses (-10 to -20)</li>
                <li><strong>Performance Matters:</strong> Speed and accuracy affect rating changes</li>
              </ul>
            </div>

            <h2>Strategy #1: Master Question Recognition</h2>

            <p>
              The fastest way to improve is recognizing question patterns instantly. Top players 
              don't read every word—they scan for keywords and immediately know the approach.
            </p>

            <div className="highlight-box">
              <h4 style={{ margin: '0 0 10px 0' }}>Quick Recognition Tips:</h4>
              <ul style={{ margin: 0, paddingLeft: '25px' }}>
                <li>Spot "derivative" → Think chain rule, product rule, or quotient rule</li>
                <li>See "integral" → Look for u-substitution or integration by parts</li>
                <li>Notice "probability" → Check for combinations vs permutations</li>
                <li>Find "limit" → L'Hôpital's rule is your friend</li>
              </ul>
            </div>

            <h2>Strategy #2: Speed vs Accuracy Balance</h2>

            <p>
              Here's the harsh truth: Being fast but wrong gets you nowhere. Being accurate but 
              slow means your opponent finished three questions while you're still on #1.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              margin: '25px 0'
            }}>
              <div className="doodle-card" style={{ padding: '20px', background: '#ff6b6b20', borderLeft: '4px solid #ff6b6b' }}>
                <Target size={40} style={{ color: '#ff6b6b', marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 10px 0', color: '#ff6b6b' }}>Too Slow</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  100% accuracy but 3 minutes per question? Your opponent already won.
                </p>
              </div>

              <div className="doodle-card" style={{ padding: '20px', background: '#38a16920', borderLeft: '4px solid #38a169' }}>
                <Target size={40} style={{ color: '#38a169', marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 10px 0', color: '#38a169' }}>Sweet Spot</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  90-95% accuracy at 45-60 seconds per question. This is the goal.
                </p>
              </div>

              <div className="doodle-card" style={{ padding: '20px', background: '#ff6b6b20', borderLeft: '4px solid #ff6b6b' }}>
                <Zap size={40} style={{ color: '#ff6b6b', marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 10px 0', color: '#ff6b6b' }}>Too Fast</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  30 seconds per question but 50% accuracy? Congrats on losing efficiently.
                </p>
              </div>
            </div>

            <h2>Strategy #3: Warmup Routine Matters</h2>

            <p>
              Pro athletes warmup before games. So should you. Going straight into ranked matches 
              cold is like trying to sprint after sitting for 6 hours. Spoiler: It doesn't end well.
            </p>

            <div className="info-box" style={{ background: '#ffe68c30', borderLeft: '4px solid var(--doodle-yellow)' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>
                <Zap size={22} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Pre-Game Warmup Routine (10-15 minutes)
              </h4>
              <ol style={{ margin: 0, paddingLeft: '25px', lineHeight: 1.8 }}>
                <li><strong>Practice Mode (5 mins):</strong> Solve 5-10 easy questions to get in the zone</li>
                <li><strong>Formula Review (3 mins):</strong> Quickly scan common formulas and rules</li>
                <li><strong>Mental Math Drills (2 mins):</strong> Practice quick calculations</li>
                <li><strong>Breathe (1 min):</strong> Seriously. Calm your nerves. You got this.</li>
              </ol>
            </div>

            <h2>Strategy #4: Learn from Every Loss 📊</h2>

            <p>
              You will lose. A lot. Deal with it. What separates good players from great players 
              is how they handle losses. Great players study their mistakes. Good players rage quit.
            </p>

            <div className="highlight-box">
              <h4 style={{ margin: '0 0 10px 0' }}>Post-Match Analysis Checklist:</h4>
              <ul style={{ margin: 0, paddingLeft: '25px' }}>
                <li>✅ Which questions did I get wrong and why?</li>
                <li>✅ Did I rush and make careless mistakes?</li>
                <li>✅ Were there concepts I didn't understand?</li>
                <li>✅ How did my opponent approach problems differently?</li>
                <li>✅ What can I practice to avoid this mistake again?</li>
              </ul>
            </div>

            <h2>Strategy #5: Consistency {'>'} Grinding</h2>

            <p>
              Playing 20 matches in one day then disappearing for a week won't help. Your brain 
              needs consistent reinforcement to retain concepts and build pattern recognition.
            </p>

            <div style={{
              background: 'var(--doodle-blue)',
              color: 'white',
              borderRadius: '15px',
              padding: '30px',
              margin: '25px 0',
              border: '3px solid var(--doodle-ink)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <Clock size={48} />
              <h3 style={{ margin: 0, color: 'white' }}>Optimal Practice Schedule</h3>
              <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.6 }}>
                <strong>3-5 ranked matches per day</strong> is far more effective than 
                <strong> 30 matches on Sunday</strong> and radio silence the rest of the week.
              </p>
            </div>

            <h2>Strategy #6: Know When to Take Breaks</h2>

            <p>
              Losing 5 matches in a row? Your brain is fried. Step away. Touch grass. Come back 
              tomorrow. Tilting and continuing to play only digs you deeper into the ELO pit.
            </p>

            <h2>Advanced Tactics for Elite Players</h2>

            <p>
              Already climbing the leaderboard? Here are some next-level tips from players in the top 50:
            </p>

            <div style={{ marginTop: '25px' }}>
              <div className="team-card" style={{ marginBottom: '20px', background: '#f7fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--doodle-blue)' }}>
                  <Target size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Pattern Prediction
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Study the question bank patterns. After playing 100+ matches, you'll start 
                  recognizing which question types appear more frequently. Prioritize mastering these.
                </p>
              </div>

              <div className="team-card" style={{ marginBottom: '20px', background: '#f7fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--doodle-blue)' }}>
                  <Brain size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Mental Math Training
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Every second counts. Practice mental calculation to eliminate calculator dependency 
                  for simple arithmetic. Top players can solve basic derivatives in their heads.
                </p>
              </div>

              <div className="team-card" style={{ marginBottom: '20px', background: '#f7fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--doodle-blue)' }}>
                  <Award size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Opponent Analysis
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Pay attention to your opponent's solving speed. If they're consistently faster, 
                  analyze their profile to see what concepts they excel at, then practice those areas.
                </p>
              </div>
            </div>

            <h2>Final Thoughts</h2>

            <p>
              Climbing the leaderboard isn't about shortcuts or hacks. It's about consistent practice, 
              smart studying, and learning from every match—win or lose. The players at the top 
              didn't get there overnight. They put in the work.
            </p>

            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
              Now it's your turn. Get out there, apply these strategies, and prove you belong among 
              the elite. We'll be watching the leaderboards.
            </p>

          </div>

          {/* Tags */}
          <div className="tag-cloud" style={{ marginTop: '40px', paddingTop: '25px', borderTop: '2px dashed var(--doodle-sketch)' }}>
            {['Strategy', 'Ranked', 'Guide', 'Tips', 'Leaderboard', 'Pro'].map((tag) => (
              <span key={tag} className="tag-item">
                #{tag}
              </span>
            ))}
          </div>

        </article>

        {/* Back Button (Bottom) */}
        <button
          onClick={handleBackClick}
          className="doodle-btn"
          style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '1rem'
          }}
        >
          <ArrowLeft size={20} />
          Back to Community
        </button>

      </div>
    </div>
  );
}

export default RankingStrategiesPost;
