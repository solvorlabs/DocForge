import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import { Google as GoogleIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { Zap, Brain, Trophy, Users } from 'lucide-react';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Navigate to login/register page instead of direct Google OAuth
    navigate('/auth?mode=register');
  };

  const handleContinueAsGuest = () => {
    navigate('/home');
  };

  return (
    <>
      <Helmet>
        <title>CompeteHub – Play 5v5 Multiplayer Knowledge Battles for JEE, NEET &amp; GATE</title>
        <meta
          name="description"
          content="Turn exam prep into a game. Play 5v5 quiz battles, ranked duels and solo challenges built on JEE, NEET &amp; GATE question banks. Climb leaderboards, unlock achievements and learn faster."
        />
        <meta
          name="keywords"
          content="5v5 quiz game, multiplayer knowledge battle, JEE NEET quiz, competitive learning platform, online study games, JEE question bank, NEET previous year questions, GATE CSE practice"
        />
      </Helmet>
      <Box className="landing-page" sx={{ zoom: 0.9 }}>
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="xl">
          <Box className="hero-content">
            {/* Left Side - Text Content */}
            <Box className="hero-left">
              <Box className="brand-tag">
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 2 }}>
                  COMPETEHUB 
                </Typography>
                <Box className="brand-underline" />
              </Box>

              <Typography
                variant="h1"
                className="hero-title"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 3
                }}
              >
                COMPETE.{' '}
                <span className="highlight-text">LEARN.</span>
                <br />
                DOMINATE.
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  maxWidth: 500,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  lineHeight: 1.6,
                  color: 'text.secondary',
                  fontWeight: 400
                }}
              >
                Join students mastering JEE & GATE through competitive gaming.
                Challenge friends, climb leaderboards and turn studying into an adventure.
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  className="primary-button google-button"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    textTransform: 'none',
                    bgcolor: '#4285f4',
                    color: 'white',
                    border: '3px solid #2d3436',
                    boxShadow: '6px 6px 0px #2d3436',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#357ae8',
                      transform: 'translate(-3px, -3px)',
                      boxShadow: '9px 9px 0px #2d3436'
                    }
                  }}
                >
                  Continue with Google/Email Login
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayIcon />}
                  onClick={handleContinueAsGuest}
                  className="secondary-button"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    textTransform: 'none',
                    border: '3px solid #2d3436',
                    color: '#2d3436',
                    bgcolor: 'white',
                    boxShadow: '6px 6px 0px #2d3436',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                      transform: 'translate(-3px, -3px)',
                      boxShadow: '9px 9px 0px #2d3436',
                      border: '3px solid #2d3436'
                    }
                  }}
                >
                  Continue as Guest
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                No credit card required • Free to start • Join student community
              </Typography>
            </Box>

            {/* Right Side - Illustration */}
            <Box className="hero-right">
              <Paper
                elevation={0}
                className="illustration-container"
                sx={{
                  p: 4,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  border: '3px solid #2d3436',
                  borderRadius: '24px',
                  boxShadow: '12px 12px 0px #2d3436',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  {/* Doodle Character */}
                  <Box>
                    <img src="/smiledoodie.png" alt="" style={{ animation: 'bounce 1s infinite', width: '100%', maxWidth: 300 }} />
                  </Box>
                  <Box>
                    <img src="/doodiebattle.png" alt="" style={{ animation: 'bounce 1s infinite', width: '100%', maxWidth: 300 }} />
                  </Box>
                </div>

                {/* <Box>
                  <img src="/doodie.png" alt="" />
                </Box> */}
                {/* Message bubble */}
                <Box 
                  className="message-bubble"
                  onClick={handleGoogleLogin}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05) rotate(-2deg)',
                      boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)'
                    }
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      color: '#2d3436'
                    }}
                  >
                    READY TO LEVEL UP?
                    <br />
                    <span style={{ color: '#6c5ce7' }}>LET'S START!</span>
                  </Typography>
                </Box>
              </Paper>


            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" className="features-section" sx={{ py: 8, bgcolor: '#fffef9' }}>
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Why CompeteHub?
          </Typography>

          <Box className="features-grid">
            <Paper className="feature-card" elevation={0}>
              <Box className="feature-icon" sx={{ bgcolor: '#a29bfe' }}>
                <Brain size={32} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Smart Learning
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Practice 10,000+ JEE & GATE questions with detailed explanations and adaptive difficulty.
              </Typography>
            </Paper>

            <Paper className="feature-card" elevation={0}>
              <Box className="feature-icon" sx={{ bgcolor: '#fd79a8' }}>
                <Trophy size={32} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Compete & Win
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Challenge friends in real-time battles, climb leaderboards, and earn achievements.
              </Typography>
            </Paper>

            <Paper className="feature-card" elevation={0}>
              <Box className="feature-icon" sx={{ bgcolor: '#74b9ff' }}>
                <Users size={32} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Community
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join a vibrant community of learners, share strategies, and grow together.
              </Typography>
            </Paper>

            <Paper className="feature-card" elevation={0}>
              <Box className="feature-icon" sx={{ bgcolor: '#55efc4' }}>
                <Zap size={32} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Track Progress
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor your improvement with detailed analytics and personalized insights.
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>
    </Box>
    </>
  );
}

export default LandingPage;

