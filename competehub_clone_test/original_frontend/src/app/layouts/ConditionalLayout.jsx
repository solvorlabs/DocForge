import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../providers/UserContext';
import NavBar from '../../shared/components/navigation/NavBar';
import Layout from './Layout';
import LandingHeader from '../../features/marketing/pages/LandingHeader';
import LandingFooter from '../../features/marketing/pages/LandingFooter';

function ConditionalLayout({ children }) {
  const location = useLocation();
  const { isAuthenticated } = useUser();

  // Check if it's a 404 page (any path that doesn't match known routes)
  const knownPaths = [
    '/', '/landing', '/home', '/auth', '/login', '/register', '/hackathon',
    '/profile', '/settings', '/custom-rooms', '/solo-challenge', '/leaderboard',
    '/friends', '/demo', '/daily-challenge', '/question-bank', '/community',
    '/privacy', '/terms', '/contact', '/ranked', '/complete-profile'
  ];
  const isKnownPath = knownPaths.some(path => location.pathname === path) ||
    location.pathname.startsWith('/join/') ||
    location.pathname.startsWith('/room/') ||
    location.pathname.startsWith('/game/') ||
    location.pathname.startsWith('/games/') ||
    location.pathname.startsWith('/ranked/') ||
    location.pathname.startsWith('/question-bank/') ||
    location.pathname.startsWith('/community') ||
    location.pathname.startsWith('/profile/');

  const is404Page = !isKnownPath;

  // Landing page - always show without navbar/sidebar
  const isLandingPage = location.pathname === '/landing';
  
  // Home/Arena page (authenticated users on / or /home)
  const isArenaPage = location.pathname === '/home' || ((location.pathname === '/') && isAuthenticated);
  
  // Guest home page (unauthenticated users on /)
  const isGuestHome = location.pathname === '/' && !isAuthenticated;
  
  const isHackathonPage = location.pathname === '/hackathon';

  const isOtherPage = (location.pathname === '/question-bank') ||
    (location.pathname === '/friends') ||
    (location.pathname === '/leaderboard') ||
    (location.pathname.startsWith('/profile')) ||
    (location.pathname === '/complete-profile');

  // Legal pages
  const isLegalPage = location.pathname === '/privacy' ||
    location.pathname === '/terms' ||
    location.pathname === '/contact';

  const isCommunityPage = location.pathname.startsWith('/community');

  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/register';

  // Hide sidebar for game pages and guest home
  const isGamePage = location.pathname.startsWith('/ranked') ||
    location.pathname === '/custom-rooms' ||
    location.pathname === '/solo-challenge' ||
    location.pathname.startsWith('/games') ||
    location.pathname.startsWith('/room') ||
    location.pathname.startsWith('/game');

  // Show LandingHeader only for landing page, hackathon, legal, and auth pages
  const showLandingHeader = isLandingPage || isHackathonPage || isLegalPage || isAuthPage || isGuestHome;

  // Show NavBar and Layout for: authenticated home, guest home, other pages, and community (all users)
  const showNavBarAndLayout = isArenaPage  || isOtherPage || (isCommunityPage) || isGamePage;

  // 404 page - no layout at all
  if (is404Page) {
    return <>{children}</>;
  }

  // Landing header pages (unauthenticated landing, hackathon, legal, auth)
  if (showLandingHeader) {
    return (
      <>
        <LandingHeader />
        {children}
        <LandingFooter />
      </>
    );
  }

  // NavBar and Layout for all other cases (home, games, community, etc.)
  if (showNavBarAndLayout) {
    return (
      <>
        <NavBar />
        <Layout hideSidebar={isGamePage || isGuestHome}>
          {children}
        </Layout>
      </>
    );
  }

  // Default fallback - show layout without navbar (shouldn't normally reach here)
  return (
    <Layout hideSidebar={isGamePage}>
      {children}
    </Layout>
  );
}

export default ConditionalLayout;

