// src/pages/community/HackWithMaitPost.jsx - HackWithMAIT Winners Feature Post
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Trophy, Github, ExternalLink, Target, Linkedin } from 'lucide-react';
import { createClickEffect } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
const winningTeams = [
  {
    position: 1,
    teamName: 'ZeroDay',
    members: [
      { name: 'Arjun Jain', linkedin: 'https://www.linkedin.com/in/arjunjaincs' }
    ],
    projectName: 'Network Ninja',
    description: 'Educational hacking game where AI learns from you and stories emerge from your actions. Infiltrate networks, steal data, escape detection.',
    highlights: [
      'AI learns your tactics and adapts defenses',
      'Your actions generate news that affect future missions',
      'Real hacking commands via terminal',
      'Network traffic simulation with A* pathfinding'
    ],
    github: 'https://github.com/arjunjaincs/networkninja',
    liveLink: 'https://networkninja-omega.vercel.app/',
    feedback: 'The event went smooth.. that\'s all I would say. Everything was good, keep going!!',
    color: '#FFD700'
  },
  {
    position: 2,
    teamName: 'INCEPTION',
    members: [
      { name: 'Divik Arora', linkedin: 'https://www.linkedin.com/in/divik-arora-2b091636b/' },
      { name: 'Hardik Dhingra', linkedin: 'https://www.linkedin.com/in/hardik-dhingra-ab2264280/' },
      { name: 'Aarushi Prajapati', linkedin: 'https://www.linkedin.com/in/aarushi-prajapati-087270287/' },
      { name: 'Harsh Dixit', linkedin: 'https://www.linkedin.com/in/harsh-dixit-6b2292378/' }
    ],
    projectName: 'Algo Gladiator',
    description: 'Learn algorithms through unique gameplay featuring a typing test multiplayer mode with random MCQs, Russian roulette type game mode, and falling MCQs!',
    highlights: [
      'Multiplayer typing test with MCQs',
      'Russian roulette game mode',
      'Falling MCQs mechanic',
      'Creative DSA learning approach'
    ],
    github: 'https://github.com/diiviikk5/gladiator',
    liveLink: 'https://gladiator-smoky.vercel.app/',
    feedback: 'In general great track to showcase creativity, since the normal ones are repetitive and generic',
    color: '#C0C0C0'
  },
  {
    position: 2,
    teamName: 'Team Orbitron',
    members: [
      { name: 'Yashvardhan Singh', linkedin: 'https://www.linkedin.com/in/yashvardhan-singh-6026b731b' },
      { name: 'Devraj Mishra', linkedin: 'https://www.linkedin.com/in/devraj-mishra-5b704a344/' },
      { name: 'Mitul Gupta', linkedin: 'https://www.linkedin.com/in/gupta-mitul/' }
    ],
    projectName: 'Prompt Battle',
    description: 'Unified platform addressing AI literacy gaps for students aged 14-18, providing interactive gamified learning for prompting, digital skills, and career growth.',
    highlights: [
      'AI-powered performance tracking',
      'Personalized learning experience',
      'Skill mapping and career guidance',
      'Interactive gamified learning system'
    ],
    github: 'https://github.com/Devraj-sh',
    liveLink: 'https://prompt-battle-n-production.up.railway.app/',
    feedback: 'Great Judges, Great experience, Great arrangement (literally ace). Next time please don\'t put two teams on same position :)',
    color: '#CD7F32'
  },
  {
    position: 3,
    teamName: 'Alpha',
    members: [
      { name: 'Shubhi Upadhyay', linkedin: 'https://www.linkedin.com/in/shubhi-upadhyay-1224b4348/' },
      { name: 'Vaibhav Jain', linkedin: 'https://www.linkedin.com/in/jainvaibhav26/' },
      { name: 'Chirag Tuteja', linkedin: 'https://www.linkedin.com/in/chirag-tuteja/' },
      { name: 'Snehashish Ghosh', linkedin: 'https://www.linkedin.com/in/snehashish-ghosh-1206j05/' }
    ],
    projectName: 'Keep Solving And Nobody Explodes',
    description: 'A fast-paced, educational puzzle game where players work together to solve subject-based challenges before time runs out. One player describes the clues while others use logic and manuals to defuse the virtual "bomb." It promotes teamwork, quick thinking, and concept mastery in a fun, high-pressure environment.',
    highlights: [
      'Collaborative puzzle-solving gameplay',
      'Subject-based educational challenges',
      'Time pressure mechanics for engagement',
      'Teamwork and communication focus'
    ],
    github: 'https://github.com/vaibhavj22-05/Keep-Solving-and-nobody-explodes',
    liveLink: 'https://github.com/vaibhavj22-05/Keep-Solving-and-nobody-explodes',
    feedback: 'The entire event was well-organized and smoothly managed, reflecting dedication. We truly appreciate their support and there are no specific feedback or suggestions from our side, as everything was executed flawlessly.',
    color: '#CD853F'
  }
];

function HackWithMaitPost() {
  const navigate = useNavigate();

  const handleBackClick = (e) => {
    createClickEffect(e);
    navigate('/community');
  };

  const handleLinkClick = (e, url) => {
    createClickEffect(e);
    window.open(url, '_blank', 'noopener,noreferrer');
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

        {/* Article Header */}
        <article className="doodle-paper" style={{
          padding: '25px 30px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #3182ce15 0%, var(--doodle-paper) 100%)',
          borderLeft: '6px solid #3182ce'
        }}>
          
          {/* Category & Date */}
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <span className="doodle-badge" style={{
              background: '#3182ce',
              padding: '6px 14px',
              fontSize: '0.85rem',
              borderRadius: '15px',
              border: '2px solid var(--doodle-ink)'
            }}>
              Events
            </span>
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--doodle-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Calendar size={16} />
              November 6, 2025
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
            HackWithMAIT x CompeteHub: When Developers Build Educational Games
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--doodle-secondary)',
            margin: '0 0 30px 0',
            lineHeight: 1.6,
            fontStyle: 'italic',
            borderLeft: '4px solid var(--doodle-blue)',
            paddingLeft: '20px'
          }}>
            Multiple teams competed in HackWithMAIT 6.0. Here are the top performers who built games that actually make learning fun.
          </p>

          {/* Article Content */}
          <div style={{
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: 'var(--doodle-ink)'
          }}>
            
            {/* Introduction */}
            <p style={{ marginBottom: '25px' }}>
              Look, we've seen a lot of "educational" games. You know the type — about as fun as watching paint dry. 
              But these top teams? They actually pulled it off. They made learning <em>genuinely enjoyable</em>. 
              <strong> We're not crying, you're crying.</strong>
            </p>

            <p style={{ marginBottom: '25px' }}>
              When we partnered with <strong>HackWithMAIT</strong> for their hackathon, we threw down a challenge: 
              <span style={{
                background: 'var(--doodle-yellow)',
                padding: '2px 8px',
                borderRadius: '5px',
                fontWeight: 'bold',
                margin: '0 4px'
              }}>
                "Build an educational game that doesn't suck."
              </span>
              Spoiler alert: The top teams didn't just meet the challenge — they <em>obliterated</em> it.
            </p>

            <h2 style={{
              fontSize: '2rem',
              margin: '40px 0 25px 0',
              color: 'var(--doodle-ink)',
              borderBottom: '3px solid var(--doodle-blue)',
              paddingBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Trophy size={32} style={{ color: 'var(--doodle-yellow)' }} />
              The Top Performers
            </h2>

            <p style={{ marginBottom: '30px' }}>
              Let's talk about the winners who turned caffeine and questionable sleep schedules into pure educational gold:
            </p>

          </div>
        </article>

        {/* Winner Cards */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {winningTeams.map((team) => (
          <div
            key={team.teamName}
            className="doodle-paper"
            style={{
              padding: '30px',
              marginBottom: '25px',
              background: `linear-gradient(135deg, ${team.color}15 0%, var(--doodle-paper) 100%)`,
              borderLeft: `6px solid ${team.color}`,
              position: 'relative'
            }}
          >
            {/* Position Badge */}
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '30px',
              background: team.color,
              color: team.position === 1 ? 'var(--doodle-ink)' : 'white',
              padding: '8px 18px',
              borderRadius: '0 0 20px 20px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              border: '3px solid var(--doodle-ink)',
              borderTop: 'none',
              boxShadow: '4px 4px 0 var(--doodle-sketch)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Trophy size={20} />
              {team.position === 1 ? '1st Place' : '2nd Place (Tied)'}
            </div>

            <div style={{ paddingTop: '20px' }}>
              
              {/* Team Name & Project */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  margin: '0 0 5px 0',
                  color: 'var(--doodle-secondary)',
                  fontWeight: '600'
                }}>
                  Team: {team.teamName}
                </h3>
                <h2 style={{
                  fontSize: '1.8rem',
                  margin: '0 0 15px 0',
                  color: 'var(--doodle-ink)',
                  fontWeight: 'bold'
                }}>
                  {team.projectName}
                </h2>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  fontSize: '0.9rem',
                  color: 'var(--doodle-secondary)'
                }}>
                  {team.members.map((member, idx) => (
                    <span key={idx} style={{
                      padding: '4px 12px',
                      background: 'var(--doodle-paper)',
                      border: '2px solid var(--doodle-sketch)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <User size={14} />
                      {member.name}
                      {member.linkedin && (
                        <a 
                          href={member.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                        >
                          <Linkedin size={14} style={{ color: '#0077b5' }} />
                        </a>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: 'var(--doodle-ink)',
                marginBottom: '20px',
                paddingLeft: '20px',
                borderLeft: '3px solid ' + team.color
              }}>
                {team.description}
              </p>

              {/* Highlights */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '1.1rem',
                  margin: '0 0 12px 0',
                  color: 'var(--doodle-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Target size={18} style={{ color: team.color }} />
                  Key Features:
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '25px',
                  listStyle: 'none'
                }}>
                  {team.highlights.map((highlight, idx) => (
                    <li key={idx} style={{
                      fontSize: '0.95rem',
                      marginBottom: '8px',
                      color: 'var(--doodle-secondary)',
                      paddingLeft: '10px',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: '-15px',
                        color: team.color,
                        fontWeight: 'bold'
                      }}>✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Team Feedback */}
              <div style={{
                background: 'var(--doodle-paper)',
                border: '2px dashed var(--doodle-sketch)',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '20px',
                fontStyle: 'italic',
                fontSize: '0.95rem',
                color: 'var(--doodle-secondary)'
              }}>
                <strong style={{ color: 'var(--doodle-ink)' }}>Their Feedback:</strong> "{team.feedback}"
              </div>

              {/* Links */}
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={(e) => handleLinkClick(e, team.github)}
                  className="doodle-btn"
                  style={{
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    background: 'var(--doodle-ink)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Github size={16} />
                  View Code
                </button>
                <button
                  onClick={(e) => handleLinkClick(e, team.liveLink)}
                  className="doodle-btn doodle-btn-primary"
                  style={{
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ExternalLink size={16} />
                  Try It Live
                </button>
              </div>

            </div>
          </div>
        ))}
        </div>

        {/* Conclusion */}
        <article className="doodle-paper" style={{
          padding: '40px',
          marginTop: '40px'
        }}>
          <div style={{
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: 'var(--doodle-ink)'
          }}>
            
            <h2 style={{
              fontSize: '2rem',
              margin: '0 0 25px 0',
              color: 'var(--doodle-ink)',
              borderBottom: '3px solid var(--doodle-green)',
              paddingBottom: '10px'
            }}>
              The Takeaway
            </h2>

            <p style={{ marginBottom: '25px' }}>
              Here's what blew us away: Each team took a completely different approach. 
              <strong> Algo Gladiator</strong> gamified DSA with creative mechanics. 
              <strong> Network Ninja</strong> turned cybersecurity into an adaptive AI-driven adventure. 
              <strong> Prompt Battle</strong> tackled the AI literacy gap with a unified learning platform.
            </p>

            <p style={{ marginBottom: '25px' }}>
              And you know what? <span style={{ 
                background: 'var(--doodle-yellow)',
                padding: '2px 8px',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}>They all worked.</span> Like, <em>actually worked</em>. 
              We're not talking about buggy prototypes held together with duct tape and prayers. 
              These are polished, playable, genuinely educational experiences.
            </p>

            <h3 style={{
              fontSize: '1.5rem',
              margin: '30px 0 20px 0',
              color: 'var(--doodle-ink)'
            }}>
              What's Next?
            </h3>

            <p style={{ marginBottom: '25px' }}>
              We're already in talks with these teams about potential collaborations. 
              Because when you find people who get it — who understand that education doesn't have to be boring — 
              you don't just congratulate them and move on. You bring them into the fold.
            </p>

            <p style={{ marginBottom: '25px' }}>
              To everyone who participated in <strong>HackWithMAIT</strong>: Thank you for proving that 
              the future of educational gaming is in good hands. To the winners: Your prize money is nice, 
              but the real reward is knowing you built something that might actually help students enjoy learning.
            </p>

            <p style={{ 
              marginBottom: '0',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--doodle-blue)'
            }}>
              And to future hackathon participants: The bar has been set. We dare you to raise it. 🚀
            </p>

          </div>

          {/* Tags */}
          <div style={{
            marginTop: '40px',
            paddingTop: '25px',
            borderTop: '2px dashed var(--doodle-sketch)',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {['Hackathon', 'Winners', 'EdTech', 'Gaming', 'Innovation', 'CompeteHub', 'HackWithMAIT'].map((tag) => (
              <span key={tag} style={{
                padding: '6px 14px',
                background: 'var(--doodle-paper)',
                border: '2px dashed var(--doodle-sketch)',
                borderRadius: '15px',
                fontSize: '0.85rem',
                color: 'var(--doodle-secondary)',
                fontWeight: '600'
              }}>
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
            marginTop: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
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

export default HackWithMaitPost;
