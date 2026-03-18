// src/pages/community/WelcomePost.jsx - Welcome to Community Post
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Sparkles, Users as UsersIcon, Trophy, Heart, MessageSquare } from 'lucide-react';
import { createClickEffect } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import '../../../styles/themes/community.css';

function WelcomePost() {
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
          background: 'linear-gradient(135deg, #38a16915 0%, var(--doodle-paper) 100%)',
          borderLeft: '6px solid #38a169'
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
              background: '#38a169',
              color: 'white',
              padding: '6px 14px',
              fontSize: '0.85rem',
              borderRadius: '15px',
              border: '2px solid var(--doodle-ink)'
            }}>
              Announcements
            </span>
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--doodle-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Calendar size={16} />
              November 5, 2025
            </span>
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--doodle-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <User size={16} />
              CompeteHub Team
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
            Welcome to CompeteHub Community!
          </h1>

          {/* Content */}
          <div className="article-content">
            
            <p style={{
              fontSize: '1.2rem',
              fontStyle: 'italic',
              borderLeft: '4px solid var(--doodle-green)',
              paddingLeft: '20px',
              color: 'var(--doodle-secondary)',
              marginBottom: '30px'
            }}>
              Your new home for competitive challenges, educational excellence, and community collaboration.
            </p>

            <h2>What Is This Place?</h2>
            
            <p>
              Great question! The CompeteHub Community is where we share updates, celebrate achievements, 
              discuss strategies, and occasionally roast each other's math skills. Think of it as your 
              friendly neighborhood bulletin board, but with more equations and fewer lost cats.
            </p>

            <div className="info-box">
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem' }}>
                <Sparkles size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                What You'll Find Here
              </h3>
              <ul style={{ margin: 0, paddingLeft: '25px' }}>
                <li>Event announcements and hackathon results</li>
                <li>Player spotlights and achievement celebrations</li>
                <li>Tips, tricks, and strategy guides</li>
                <li>New feature announcements</li>
                <li>Community challenges and competitions</li>
                <li>Behind-the-scenes development updates</li>
              </ul>
            </div>

            <h2>Community Guidelines</h2>

            <p>
              We're all about keeping this space fun, inclusive, and educational. Here are the ground rules:
            </p>

            <ol style={{ lineHeight: 1.8 }}>
              <li><strong>Be Respectful:</strong> Everyone's here to learn and have fun. No bullying, harassment, or general jerkiness.</li>
              <li><strong>Stay On Topic:</strong> This isn't the place for political debates or crypto schemes.</li>
              <li><strong>Help Others:</strong> We all started somewhere. If someone's struggling, lend a hand.</li>
              <li><strong>Celebrate Wins:</strong> Someone solved a hard problem? Hype them up!</li>
              <li><strong>Learn from Losses:</strong> Got wrecked in ranked? It happens. Learn and move on.</li>
            </ol>

            <h2>Getting Involved</h2>

            <p>
              Want to be more than just a lurker? Here's how to dive in:
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              margin: '25px 0'
            }}>
              <div className="doodle-card" style={{ padding: '20px', textAlign: 'center' }}>
                <MessageSquare size={48} style={{ color: 'var(--doodle-blue)', marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 10px 0' }}>Comment & Engage</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                  Share your thoughts on posts and discussions
                </p>
              </div>

              <div className="doodle-card" style={{ padding: '20px', textAlign: 'center' }}>
                <Sparkles size={48} style={{ color: 'var(--doodle-yellow)', marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 10px 0' }}>Share Your Stories</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                  Got an epic comeback or clutch play? Tell us!
                </p>
              </div>

              <div className="doodle-card" style={{ padding: '20px', textAlign: 'center' }}>
                <UsersIcon size={48} style={{ color: 'var(--doodle-green)', marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 10px 0' }}>Help Others</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
                  Answer questions and share your expertise
                </p>
              </div>
            </div>

            <div className="highlight-box">
              <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={24} />
                Pro Tip: Earn Community Badges!
              </h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                Active community members earn special badges and perks. The more you contribute, 
                the cooler your profile looks. Plus, we might feature your content in future posts. 
                Fame awaits!
              </p>
            </div>

            <h2>What's Next?</h2>

            <p>
              We're just getting started! Here's what's coming to the Community section:
            </p>

            <ul>
              <li>Player-submitted content and tutorials</li>
              <li>Monthly community challenges with prizes</li>
              <li>User-created problem sets and quizzes</li>
              <li>Community polls and feature voting</li>
              <li>Tournament announcements and brackets</li>
              <li>Q&A sessions with the development team</li>
            </ul>

            <h2>Let's Build Something Amazing</h2>

            <p>
              CompeteHub isn't just a platform—it's a community of people who believe learning 
              can be fun, competitive, and rewarding. Whether you're here to dominate the leaderboards, 
              help others learn, or just enjoy some mathematical mayhem, you belong here.
            </p>

            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--doodle-blue)' }}>
              So welcome aboard! Grab your calculator, flex those brain muscles, and let's make 
              education awesome together.
            </p>

            <div style={{
              background: 'var(--doodle-green)',
              color: 'white',
              borderRadius: '15px',
              padding: '25px',
              margin: '40px 0 0 0',
              border: '3px solid var(--doodle-ink)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <Heart size={32} />
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                Got questions? Suggestions? Just want to say hi? 
                <br />
                Drop a comment below or reach out to our team!
              </p>
            </div>

          </div>

          {/* Tags */}
          <div className="tag-cloud" style={{ marginTop: '40px', paddingTop: '25px', borderTop: '2px dashed var(--doodle-sketch)' }}>
            {['Community', 'Welcome', 'Getting Started', 'Guidelines', 'CompeteHub'].map((tag) => (
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

export default WelcomePost;
