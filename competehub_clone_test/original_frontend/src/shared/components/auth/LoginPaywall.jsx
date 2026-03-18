// shared/components/auth/LoginPaywall.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { Lock, Zap, Trophy, Users } from 'lucide-react';
import './LoginPaywall.css';

/**
 * LoginPaywall - Modal/page shown to guests when trying to access protected features
 * Shows benefits of signing in and redirects to auth page
 */
const LoginPaywall = ({ 
  title = "Sign in to continue", 
  message = "This feature requires an account to track your progress and compete with others!",
  benefits = [
    { icon: Trophy, text: "Track your scores on the leaderboard" },
    { icon: Zap, text: "Earn XP and unlock achievements" },
    { icon: Users, text: "Challenge friends in ranked matches" },
    { icon: Lock, text: "Save your progress across devices" }
  ],
  showAsModal = false,
  onClose = null
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    // Save current location to redirect back after login
    navigate('/auth', { state: { from: location } });
  };

  const handleGoBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const content = (
    <Box className="login-paywall-content">
      <div className="paywall-icon">
        <Lock size={64} strokeWidth={1.5} />
      </div>
      
      <Typography variant="h4" className="paywall-title" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body1" className="paywall-message" gutterBottom>
        {message}
      </Typography>

      <Box className="paywall-benefits">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Box key={index} className="benefit-item">
              <Icon size={24} className="benefit-icon" />
              <Typography variant="body2">{benefit.text}</Typography>
            </Box>
          );
        })}
      </Box>

      <Box className="paywall-actions">
        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
          className="paywall-login-btn"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
            }
          }}
        >
          Sign In to Continue
        </Button>
        
        <Button
          variant="text"
          onClick={handleGoBack}
          className="paywall-back-btn"
          sx={{
            marginTop: '12px',
            color: '#666',
            textTransform: 'none'
          }}
        >
          Go Back
        </Button>
      </Box>
    </Box>
  );

  if (showAsModal) {
    return (
      <Box className="login-paywall-overlay">
        <Paper className="login-paywall-modal" elevation={8}>
          {content}
        </Paper>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" className="login-paywall-container">
      <Paper className="login-paywall-paper" elevation={3}>
        {content}
      </Paper>
    </Container>
  );
};

export default LoginPaywall;
