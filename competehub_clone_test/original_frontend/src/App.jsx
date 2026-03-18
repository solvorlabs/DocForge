import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoadingBar from 'react-top-loading-bar';
import { SocketProvider } from './app/providers/SocketContext';
import { GameProvider } from './app/providers/GameContext';
import { UserProvider } from './app/providers/UserContext';
import { AudioProvider } from './app/providers/AudioContext';
import { RankedSocketProvider } from './features/ranked/components/RankedSocketProvider.jsx';
import ConditionalLayout from './app/layouts/ConditionalLayout.jsx';
import './styles/themes/doodle.css';
import AppRoutes from './app/routes/AppRoutes.jsx';
import GoogleAuthHandler from './features/auth/components/GoogleAuthHandler';
import ScrollToTop from './app/components/ScrollToTop.jsx';
// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
    red: {
      main: '#f44336',
      light: '#ffcdd2',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    blue: {
      main: '#2196f3',
      light: '#bbdefb',
      dark: '#1976d2',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Component to handle loading bar on route changes
function LoadingBarWrapper() {
  const loadingBarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    loadingBarRef.current?.continuousStart();
    
    // Simulate loading complete after a short delay
    const timer = setTimeout(() => {
      loadingBarRef.current?.complete();
    }, 300);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <LoadingBar
      color='#1976d2'
      height={3}
      ref={loadingBarRef}
      shadow={true}
      transitionTime={300}
      waitingTime={300}
    />
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Helmet>
          <title>CompeteHub – Multiplayer Knowledge Battles for JEE, NEET &amp; GATE</title>
          <meta
            name="description"
            content="Compete in 5v5 multiplayer quiz battles, ranked 1v1 duels and solo practice modes. Master JEE, NEET &amp; GATE concepts with live question banks, leaderboards and game-based learning."
          />
          <meta
            name="keywords"
            content="CompeteHub, multiplayer quiz, 5v5 knowledge battles, online quiz game, ranked quiz, JEE question bank, NEET question bank, GATE CSE questions, competitive exam gaming, study games"
          />
          <meta name="robots" content="index,follow" />
        </Helmet>
        <LoadingBarWrapper />
        <ScrollToTop />
        <UserProvider>
          <GoogleAuthHandler />
          <AudioProvider>
            <SocketProvider>
              <GameProvider>
                <RankedSocketProvider>
                  <ConditionalLayout>
                    <AppRoutes />
                  </ConditionalLayout>
                </RankedSocketProvider>
              </GameProvider>
            </SocketProvider>
          </AudioProvider>
        </UserProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;