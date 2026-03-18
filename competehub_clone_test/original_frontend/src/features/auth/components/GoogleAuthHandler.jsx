// features/auth/components/GoogleAuthHandler.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser }  from '../../../app/providers/UserContext';

const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfile, isAuthenticated, isLoading, setAuthState } = useUser();
  
  // Track if profile has been checked to prevent duplicate calls
  const hasCheckedProfile = useRef(false);
  const hasCheckedOAuth = useRef(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Check if there's a token in the URL (from Google OAuth callback)
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const loginSuccess = urlParams.get('login');
        const isGoogle = urlParams.get('google');

        console.log('[GoogleAuthHandler] URL params detected:', { token: !!token, loginSuccess, isGoogle, pathname: location.pathname });

        // Handle both regular login (login=success) and new Google signup (google=true)
        if (token && (loginSuccess === 'success' || isGoogle === 'true') && !hasCheckedOAuth.current) {
          hasCheckedOAuth.current = true;
          console.log('[GoogleAuthHandler] Google OAuth token detected, processing...');
          
          // First, set the authentication state with the token to ensure immediate context update
          setAuthState(null, token);
          console.log('[GoogleAuthHandler] Token stored and context updated');
          
          // Then get user profile to get complete user data
          const profile = await getProfile();
          console.log('[GoogleAuthHandler] Profile retrieved:', {
            hasProfile: !!profile,
            needsCompletion: profile?.needsProfileCompletion,
            username: profile?.username,
            email: profile?.email
          });
          
          if (profile) {
            // Update context state with complete user data
            setAuthState(profile, token);
            console.log('[GoogleAuthHandler] Full authentication state updated in context');

            // Check if profile needs completion
            if (profile.needsProfileCompletion) {
              console.log('[GoogleAuthHandler] Profile needs completion');
              // If not already on complete-profile page, navigate there
              if (!location.pathname.includes('/complete-profile')) {
                console.log('[GoogleAuthHandler] Redirecting to /complete-profile');
                navigate('/complete-profile', { replace: true });
              } else {
                console.log('[GoogleAuthHandler] Already on /complete-profile page');
                // Just clean up the URL params if already on the page
                window.history.replaceState({}, document.title, location.pathname);
              }
              return;
            } else {
              console.log('[GoogleAuthHandler] Profile complete, redirecting to home');
              // Profile is complete, redirect to home
              window.history.replaceState({}, document.title, location.pathname);
              navigate('/', { replace: true });
              if (window.toast) {
                window.toast.success('Successfully logged in with Google!');
              }
              return;
            }
          } else {
            console.log('[GoogleAuthHandler] No profile data received');
          }
        }
      } catch (error) {
        console.error('[GoogleAuthHandler] Error:', error);
        hasCheckedOAuth.current = false; // Reset on error
        // Clean up URL and redirect to login on error
        window.history.replaceState({}, document.title, location.pathname);
        navigate('/auth?error=google_auth_failed', { replace: true });
        if (window.toast) {
          window.toast.error('Google authentication failed. Please try again.');
        }
      }
    };

    // Only run if we're not currently loading user data
    if (!isLoading) {
      handleGoogleCallback();
    }
  }, [location.search, location.pathname, navigate, getProfile, isLoading, setAuthState]);

  // Additional effect to check profile completion status on app startup - ONLY ONCE
  useEffect(() => {
    const checkProfileCompletion = async () => {
      // Only check if user is authenticated, not loading, and hasn't been checked yet
      if (isAuthenticated && !isLoading && !hasCheckedProfile.current) {
        hasCheckedProfile.current = true;
        
        try {
          const profile = await getProfile();
          console.log('[GoogleAuthHandler] Startup profile check:', {
            hasProfile: !!profile,
            needsCompletion: profile?.needsProfileCompletion,
            currentPath: location.pathname
          });
          
          // If user needs profile completion and we're not already on the completion page
          if (profile?.needsProfileCompletion && !location.pathname.includes('/complete-profile')) {
            console.log('[GoogleAuthHandler] User needs profile completion, redirecting to /complete-profile');
            navigate('/complete-profile', { replace: true });
          }
        } catch (error) {
          console.error('[GoogleAuthHandler] Error checking profile completion:', error);
          hasCheckedProfile.current = false; // Reset on error to allow retry
        }
      }
    };

    // Check on authenticated state change - but only once
    if (isAuthenticated && !isLoading) {
      checkProfileCompletion();
    }
    
    // Reset flag when user logs out
    if (!isAuthenticated) {
      hasCheckedProfile.current = false;
      hasCheckedOAuth.current = false;
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate, getProfile]);

  // This component doesn't render anything
  return null;
};

export default GoogleAuthHandler;