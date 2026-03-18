import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Stack } from '@mui/material';

function LandingHeader() {
  const navigate = useNavigate();

  const handleContinueAsGuest = () => {
    navigate('/home');
  };

  return (
    <>
      <Box className="landing-header">
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            py: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 2 }
          }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, sm: 1 },
                cursor: 'pointer'
              }}
              onClick={() => navigate('/landing')}
            >
              <img 
                src="/doodie.png" 
                alt="Doodle Avatar" 
                className="navbar-logo"
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  animation: 'doodle-bounce 2s infinite' 
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800, 
                  letterSpacing: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                }}
              >
                COMPETEHUB
              </Typography>
            </Box>
            <Stack 
              direction="row" 
              spacing={{ xs: 0.5, sm: 1, md: 2 }} 
              alignItems="center"
              sx={{ flexWrap: 'nowrap' }}
            >
              {/* <Button
                variant="contained"
                onClick={() => navigate('/hackathon')}
                sx={{
                  fontWeight: 700,
                   
                  textTransform: 'none',
                  bgcolor: '#6c5ce7',
                  color: 'white',
                  border: { xs: '2px solid #2d3436', sm: '3px solid #2d3436' },
                  boxShadow: { xs: '2px 2px 0px #2d3436', sm: '4px 4px 0px #2d3436' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 1 },
                  minWidth: 'auto',
                  '&:hover': { 
                    bgcolor: '#5849c7',
                    transform: 'translate(-2px, -2px)',
                    boxShadow: { xs: '4px 4px 0px #2d3436', sm: '6px 6px 0px #2d3436' }
                  }
                }}
              >
                <span className="hackathon-text-full">Hackathon 🚀</span>
                <span className="hackathon-text-short">🚀</span>
              </Button> */}
              <Button
                variant="text"
                onClick={handleContinueAsGuest}
                sx={{
                  fontWeight: 600,
                   
                  color: 'text.primary',
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 1 },
                  minWidth: 'auto',
                  display: { xs: 'none', sm: 'inline-flex' },
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                }}
              >
                Browse as Guest
              </Button>
              <Button
                variant="text"
                onClick={handleContinueAsGuest}
                sx={{
                  fontWeight: 600,
                   
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  px: 1,
                  py: 0.5,
                  minWidth: 'auto',
                  display: { xs: 'inline-flex', sm: 'none' },
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                }}
              >
                Guest
              </Button>
              <Typography
                component="a"
                href="https://essolutions.dev/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                   
                  fontSize: '0.9rem',
                  color: 'var(--doodle-ink)',
                  textDecoration: 'none',
                  display: { xs: 'none', md: 'block' },
                  '&:hover': { color: 'var(--doodle-blue)' }
                }}
              >
                Powered by ES Solutions 
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Responsive CSS */}
      <style jsx>{`
        @keyframes doodle-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }
      `}</style>
    </>
  );
}

export default LandingHeader;
