// features/auth/pages/CompleteProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleProfileCompletion from '../components/GoogleProfileCompletion';
import { useUser } from '../../../app/providers/UserContext';

const CompleteProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfile, isAuthenticated, isLoading } = useUser();

  useEffect(() => {
    const handleProfileCompletion = async () => {
      try {
        // Check if there's a token in URL params (from Google OAuth)
        const urlParams = new URLSearchParams(location.search);
        const hasToken = urlParams.get('token');
        const isGoogle = urlParams.get('google');

        console.log('[CompleteProfile] Starting profile check', { 
          isAuthenticated, 
          isLoading,
          hasToken: !!hasToken,
          isGoogle 
        });

        // Wait for user context to finish loading
        if (isLoading) {
          console.log('[CompleteProfile] User context still loading, waiting...');
          return;
        }

        // If we have a Google OAuth token in URL, trust that GoogleAuthHandler will process it
        // Don't redirect to /auth in this case, just wait
        if (hasToken && isGoogle === 'true') {
          if (!isAuthenticated) {
            console.log('[CompleteProfile] Google OAuth token present, waiting for authentication...');
            // Don't redirect, GoogleAuthHandler is processing the token
            return;
          }
        } else {
          // No token in URL, check authentication normally
          if (!isAuthenticated) {
            console.log('[CompleteProfile] No authentication and no token in URL, redirecting to login...');
            navigate('/auth');
            return;
          }
        }

        // Get user profile to check status
        const profile = await getProfile();
        console.log('[CompleteProfile] Profile retrieved:', {
          hasProfile: !!profile,
          needsCompletion: profile?.needsProfileCompletion
        });
        
        if (profile) {
          if (profile.needsProfileCompletion) {
            console.log('[CompleteProfile] Profile needs completion, showing completion form');
            setUserInfo({
              email: profile.email,
              displayName: profile.displayName,
              firstName: profile.firstName,
              lastName: profile.lastName
            });
          } else {
            console.log('[CompleteProfile] Profile already completed, redirecting to home');
            // Profile already completed, redirect to home
            navigate('/', { replace: true });
          }
        } else {
          console.log('[CompleteProfile] No profile found, redirecting to login');
          navigate('/auth');
        }

      } catch (error) {
        console.error('[CompleteProfile] Error in profile completion handler:', error);
        navigate('/auth?error=profile_error');
      } finally {
        setLoading(false);
      }
    };

    handleProfileCompletion();
  }, [navigate, getProfile, isAuthenticated, isLoading, location.search]);

  const handleComplete = (response) => {
    console.log('Profile completion successful:', response);
    // Profile completed successfully, redirect to home
    if (window.toast) {
      window.toast.success('Profile completed successfully! Welcome to CompeteHub!');
    }
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--doodle-bg)'
      }}>
        <div className="doodle-spinner" style={{ width: '50px', height: '50px' }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--doodle-bg)',
      padding: '20px'
    }}>
      <GoogleProfileCompletion
        onComplete={handleComplete}
        userInfo={userInfo}
      />
    </div>
  );
};

export default CompleteProfile;