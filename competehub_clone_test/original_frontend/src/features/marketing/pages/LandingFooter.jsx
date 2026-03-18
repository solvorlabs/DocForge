import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Stack } from '@mui/material';

function LandingFooter() {
  const navigate = useNavigate();

  return (
    <Box className="landing-footer">
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              © 2025 CompeteHub. Making education competitive and fun.
            </Typography>
            <Typography
              component="a"
              href="https://essolutions.dev/"
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              sx={{
                 
                color: 'var(--doodle-blue)',
                textDecoration: 'none',
                display: 'block',
                mt: 0.5,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Powered by ES Solutions 
            </Typography>
          </Box>
          <Stack direction="row" spacing={3}>
            <Button 
              variant="text" 
              size="small" 
              onClick={() => navigate('/privacy')}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'var(--doodle-blue)', textDecoration: 'underline' }
              }}
            >
              Privacy Policy
            </Button>
            <Button 
              variant="text" 
              size="small" 
              onClick={() => navigate('/terms')}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'var(--doodle-blue)', textDecoration: 'underline' }
              }}
            >
              Terms of Service
            </Button>
            <Button 
              variant="text" 
              size="small" 
              component="a"
              href="mailto:support@competehub.app"
              onClick={(e) => {
                e.preventDefault();
                navigate('/contact');
              }}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'var(--doodle-blue)', textDecoration: 'underline' }
              }}
            >
              Contact
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default LandingFooter;
