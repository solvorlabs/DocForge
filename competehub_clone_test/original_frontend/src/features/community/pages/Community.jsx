// src/pages/Community.jsx - Community Hub with Blog Posts
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, MessageSquare, Heart, Eye, TrendingUp } from 'lucide-react';
import { createClickEffect } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import '../../../styles/themes/community.css';

// Community posts data
const communityPosts = [
  {
    id: 'hackwithMait-2024',
    slug: 'hackwithMait-winners-2024',
    title: 'HackWithMAIT x CompeteHub: When Developers Build Educational Games',
    excerpt: 'Multiple teams competed. The top performers walked out with games that actually make learning fun. Plot twist: We\'re still in shock.',
    author: 'CompeteHub Team',
    date: '2025-11-06',
    category: 'Events',
    readTime: '8 min read',
    views: 342,
    likes: 28,
    comments: 7,
    featured: true,
    tags: ['Hackathon', 'Winners', 'EdTech', 'Gaming'],
    color: '#3182ce'
  },
  {
    id: 'welcome-community',
    slug: 'welcome-community',
    title: 'Welcome to CompeteHub Community!',
    excerpt: 'Your new home for competitive challenges, educational excellence, and community collaboration.',
    author: 'CompeteHub Team',
    date: '2025-11-05',
    category: 'Announcements',
    readTime: '3 min read',
    views: 256,
    likes: 42,
    comments: 11,
    featured: false,
    tags: ['Community', 'Welcome', 'Getting Started'],
    color: '#38a169'
  },
  {
    id: 'ranking-strategies',
    slug: 'ranking-strategies-guide',
    title: 'Pro Strategies to Climb the Leaderboard',
    excerpt: 'Want to dominate CompeteHub\'s ranked mode? We compiled insights from top players who actually know what they\'re doing. Unlike you. Yet.',
    author: 'Top Player Insights',
    date: '2025-11-10',
    category: 'Tutorials',
    readTime: '10 min read',
    views: 428,
    likes: 56,
    comments: 19,
    featured: true,
    tags: ['Strategy', 'Ranked', 'Guide', 'Tips'],
    color: '#3182ce'
  },
  {
    id: 'ranked-season-1',
    slug: 'ranked-season-1-announcement',
    title: 'Ranked Season 1: The Competition Begins',
    excerpt: 'May the odds (and probability distributions) be ever in your favor. Registration opens next week!',
    author: 'CompeteHub Team',
    date: '2025-11-01',
    category: 'Competitive',
    readTime: '5 min read',
    views: 318,
    likes: 45,
    comments: 15,
    featured: false,
    tags: ['Ranked', 'Competitive', 'Tournament'],
    color: '#805ad5'
  }
];

function Community() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredPost, setHoveredPost] = useState(null);

  const categories = ['All', 'Events', 'Announcements', 'Competitive', 'Updates', 'Tutorials'];

  const filteredPosts = selectedCategory === 'All' 
    ? communityPosts 
    : communityPosts.filter(post => post.category === selectedCategory);

  const handlePostClick = (e, post) => {
    createClickEffect(e);
    navigate(`/community/${post.slug}`);
  };

  const handleCategoryClick = (e, category) => {
    createClickEffect(e);
    setSelectedCategory(category);
  };

  return (
    <>
      <Helmet>
        <title>CompeteHub Community – Strategies, Events &amp; Multiplayer Exam Prep Tips</title>
        <meta
          name="description"
          content="Learn how top students use CompeteHub's 5v5 multiplayer battles, ranked ladders and question banks to ace JEE, NEET &amp; GATE. Read strategy guides, event recaps and community stories."
        />
        <meta
          name="keywords"
          content="CompeteHub community, ranked strategies, multiplayer exam prep, JEE tips, NEET tips, GATE tips, hackathon games, study community"
        />
      </Helmet>
      <div className="doodle-container" style={{
      minHeight: '100vh',
      padding: '80px 15px 20px',
       
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div className="doodle-paper" style={{
          textAlign: 'center',
          padding: '30px 25px',
          marginBottom: '30px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '30px',
            fontSize: '3rem',
            opacity: 0.1,
            animation: 'doodle-float 3s infinite'
          }}>📚</div>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '30px',
            fontSize: '2.5rem',
            opacity: 0.1,
            animation: 'doodle-float 4s infinite',
            animationDelay: '-1s'
          }}>✨</div>

          <h1 className="doodle-title" style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            margin: '0 0 15px 0',
            color: 'var(--doodle-ink)'
          }}>
            CompeteHub Community
          </h1>
          <p className="doodle-subtitle" style={{
            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
            margin: '0 0 20px 0',
            color: 'var(--doodle-secondary)',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {/* Where exam prep meets competition and learning gets legendary.  */}
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              (Yes, we made education cool. You're welcome.)
            </span>
          </p>

          {/* Stats */}
          {/* <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '25px'
          }}>
            <div style={{
              padding: '12px 20px',
              background: 'var(--doodle-blue)',
              color: 'white',
              borderRadius: '20px',
              border: '2px solid var(--doodle-ink)',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '3px 3px 0 var(--doodle-sketch)'
            }}>
              <TrendingUp size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {communityPosts.reduce((sum, post) => sum + post.views, 0).toLocaleString()} Total Views
            </div>
            <div style={{
              padding: '12px 20px',
              background: 'var(--doodle-accent)',
              color: 'white',
              borderRadius: '20px',
              border: '2px solid var(--doodle-ink)',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '3px 3px 0 var(--doodle-sketch)'
            }}>
              <Heart size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {communityPosts.reduce((sum, post) => sum + post.likes, 0)} Likes
            </div>
            <div style={{
              padding: '12px 20px',
              background: 'var(--doodle-green)',
              color: 'white',
              borderRadius: '20px',
              border: '2px solid var(--doodle-ink)',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '3px 3px 0 var(--doodle-sketch)'
            }}>
              <MessageSquare size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {communityPosts.reduce((sum, post) => sum + post.comments, 0)} Comments
            </div>
          </div> */}
        </div>

        {/* Category Filter */}
        <div style={{
          marginBottom: '25px',
          overflowX: 'auto',
          paddingBottom: '10px'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            minWidth: 'fit-content',
            padding: '0 10px'
          }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={(e) => handleCategoryClick(e, category)}
                className={`doodle-btn ${selectedCategory === category ? 'doodle-btn-primary' : ''}`}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  background: selectedCategory === category ? 'var(--doodle-blue)' : 'var(--doodle-paper)',
                  color: selectedCategory === category ? 'white' : 'var(--doodle-ink)',
                  border: `3px solid ${selectedCategory === category ? 'var(--doodle-blue)' : 'var(--doodle-ink)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post (if exists) */}
        {filteredPosts.filter(p => p.featured).map(post => (
          <div
            key={post.id}
            className="doodle-paper"
            onClick={(e) => handlePostClick(e, post)}
            onMouseEnter={() => setHoveredPost(post.id)}
            onMouseLeave={() => setHoveredPost(null)}
            style={{
              padding: '25px',
              marginBottom: '30px',
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${post.color}15 0%, var(--doodle-paper) 100%)`,
              borderLeft: `6px solid ${post.color}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Featured Badge */}
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '20px',
              background: 'var(--doodle-yellow)',
              color: 'var(--doodle-ink)',
              padding: '8px 16px',
              borderRadius: '0 0 15px 15px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              border: '3px solid var(--doodle-ink)',
              borderTop: 'none',
              boxShadow: '3px 3px 0 var(--doodle-sketch)',
              transform: 'rotate(-2deg)'
            }}>
              ⭐ FEATURED
            </div>

            <div style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              fontSize: '4rem',
              opacity: 0.3,
              transform: hoveredPost === post.id ? 'rotate(15deg) scale(1.2)' : 'rotate(8deg)',
              transition: 'all 0.3s ease'
            }}>
              {post.thumbnail}
            </div>

            <div style={{ paddingLeft: '80px' }}>
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                <span className="doodle-badge" style={{
                  background: post.color,
                  // color: 'white',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  borderRadius: '12px',
                  border: '2px solid var(--doodle-ink)'
                }}>
                  {post.category}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--doodle-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Calendar size={14} />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                margin: '0 0 15px 0',
                color: 'var(--doodle-ink)',
                fontWeight: 'bold',
                lineHeight: 1.3
              }}>
                {post.title}
              </h2>

              <p style={{
                fontSize: '1.1rem',
                color: 'var(--doodle-secondary)',
                margin: '0 0 20px 0',
                lineHeight: 1.6
              }}>
                {post.excerpt}
              </p>

              <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                flexWrap: 'wrap',
                fontSize: '0.85rem',
                color: 'var(--doodle-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={14} />
                  {post.author}
                </div>
                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Eye size={14} />
                  {post.views.toLocaleString()} views
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Heart size={14} />
                  {post.likes} likes
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MessageSquare size={14} />
                  {post.comments} comments
                </div> */}
                <div style={{ marginLeft: 'auto' }}>
                  {post.readTime}
                </div>
              </div>

              <div style={{
                marginTop: '15px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {post.tags.map((tag, idx) => (
                  <span key={idx} style={{
                    padding: '4px 10px',
                    background: 'var(--doodle-paper)',
                    border: '2px dashed var(--doodle-sketch)',
                    borderRadius: '15px',
                    fontSize: '0.75rem',
                    color: 'var(--doodle-secondary)'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: post.color,
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                Read Full Story
                <ArrowRight 
                  size={20} 
                  style={{
                    transform: hoveredPost === post.id ? 'translateX(5px)' : 'translateX(0)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Regular Posts Grid */}
        {/* <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {filteredPosts.filter(p => !p.featured).map(post => (
            <div
              key={post.id}
              className="doodle-card"
              onClick={(e) => handlePostClick(e, post)}
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
              style={{
                padding: '20px',
                cursor: 'pointer',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '15px',
                transform: hoveredPost === post.id ? 'rotate(15deg) scale(1.1)' : 'rotate(8deg)',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}>
                {post.thumbnail}
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                <span className="doodle-badge" style={{
                  background: post.color,
                  color: 'white',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  borderRadius: '10px',
                  border: '2px solid var(--doodle-ink)'
                }}>
                  {post.category}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--doodle-secondary)'
                }}>
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.3rem',
                margin: '0 0 10px 0',
                color: 'var(--doodle-ink)',
                fontWeight: 'bold',
                lineHeight: 1.3
              }}>
                {post.title}
              </h3>

              <p style={{
                fontSize: '0.95rem',
                color: 'var(--doodle-secondary)',
                margin: '0 0 15px 0',
                lineHeight: 1.5,
                flex: 1
              }}>
                {post.excerpt}
              </p>

              <div style={{
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: 'var(--doodle-secondary)',
                paddingTop: '15px',
                borderTop: '1px dashed var(--doodle-sketch)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={12} />
                  {post.views}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={12} />
                  {post.likes}
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                  {post.readTime}
                </div>
              </div>

              <div style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: post.color,
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                Read More
                <ArrowRight 
                  size={16} 
                  style={{
                    transform: hoveredPost === post.id ? 'translateX(5px)' : 'translateX(0)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div> */}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="doodle-paper" style={{
            textAlign: 'center',
            padding: '60px 30px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--doodle-ink)' }}>
              No posts found
            </h3>
            <p style={{ margin: 0, color: 'var(--doodle-secondary)' }}>
              Try selecting a different category
            </p>
          </div>
        )}

      </div>
    </div>
    </>
  );
}

export default Community;
