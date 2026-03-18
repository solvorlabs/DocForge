//features/auth/components/GoogleProfileCompletion.jsx
import React, { useState } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import OnboardingSteps from './OnboardingSteps';

const GoogleProfileCompletion = ({ onComplete, userInfo }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    examTarget: '',
    heardFrom: '',
    avatar: 'default'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameCheck, setUsernameCheck] = useState({ checked: false, available: false });

  const { checkUsername, apiRequest } = useUser();

  const examTargets = ['JEE', 'GATE', 'CAT', 'NEET', 'UPSC', 'GRE', 'GMAT', 'Other'];
  const heardFromOptions = ['Social Media', 'Friend', 'Search Engine', 'Advertisement', 'School/College', 'Other'];
  const avatars = ['default', 'brain', 'trophy', 'lightning', 'book', 'star'];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setFormData(prev => ({ ...prev, username }));
    setError('');
    
    if (username.length >= 3) {
      try {
        const result = await checkUsername(username);
        setUsernameCheck({ checked: true, available: result.available });
      } catch (error) {
        console.error('Username check error:', error);
      }
    } else {
      setUsernameCheck({ checked: false, available: false });
    }
  };

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!formData.examTarget) {
      setError('Please select your exam target');
      return false;
    }

    if (usernameCheck.checked && !usernameCheck.available) {
      setError('Username is not available');
      return false;
    }

    return true;
  };

  const handleStartOnboarding = (e) => {
    createClickEffect(e);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (response) => {
    console.log('Google profile onboarding completed:', response);
    if (response.user || response.message) {
      onComplete(response);
    }
  };

  const handleOnboardingError = (error) => {
    console.error('Google profile onboarding error:', error);
    setError(error.message || 'Profile completion failed');
    setShowOnboarding(false);
  };

  const getAvatarEmoji = (avatar) => {
    const avatarMap = {
      default: '👤',
      brain: '🧠',
      trophy: '🏆',
      lightning: '⚡',
      book: '📚',
      star: '⭐'
    };
    return avatarMap[avatar] || '👤';
  };

  // If onboarding started, show onboarding steps
  if (showOnboarding) {
    return (
      <OnboardingSteps
        onComplete={handleOnboardingComplete}
        onError={handleOnboardingError}
        initialData={formData}
        isGoogleUser={true}
      />
    );
  }

  return (
    <div className="doodle-container" style={{ padding: '20px' }}>
      <div className="doodle-card" style={{ 
        maxWidth: '420px', 
        margin: '0 auto', 
        padding: '30px 25px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="doodle-avatar doodle-float" style={{ margin: '0 auto 20px' }}>
            <DoodleIcons.Star size={40} color="#fff" />
          </div>
          <h2 className="doodle-title" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Welcome to CompeteHub!</h2>
          <p className="doodle-subtitle" style={{ fontSize: '1rem', opacity: 0.8, lineHeight: '1.6' }}>
            Great! You're signed in with Google. Let's personalize your learning experience.
          </p>
          {userInfo?.email && (
            <div style={{ 
              background: 'rgba(37, 99, 235, 0.1)', 
              padding: '12px', 
              borderRadius: '12px',
              marginTop: '15px',
              border: '2px dashed var(--doodle-blue)'
            }}>
              <p style={{ color: 'var(--doodle-ink)', fontSize: '0.9rem', margin: 0 }}>
                <DoodleIcons.Users size={16} style={{ marginRight: '6px' }} />
                Signed in as: <strong>{userInfo.email}</strong>
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="doodle-alert" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Features Preview */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            color: 'var(--doodle-ink)',
             
          }}>
            What we'll set up for you:
          </h4>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DoodleIcons.Users size={20} color="var(--doodle-blue)" />
              <span style={{ fontSize: '0.9rem' }}>Choose your unique username</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DoodleIcons.Trophy size={20} color="var(--doodle-yellow)" />
              <span style={{ fontSize: '0.9rem' }}>Set your exam goals</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DoodleIcons.Book size={20} color="var(--doodle-green)" />
              <span style={{ fontSize: '0.9rem' }}>Select your subjects</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DoodleIcons.Star size={20} color="var(--doodle-purple)" />
              <span style={{ fontSize: '0.9rem' }}>Pick your avatar</span>
            </div>
          </div>
        </div>

        {/* Complete Profile Button */}
        <button
          onClick={handleStartOnboarding}
          className="doodle-btn doodle-btn-primary"
          style={{ 
            width: '100%',
            padding: '15px',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          <DoodleIcons.Lightning size={18} style={{ marginRight: '8px' }} />
          Complete My Profile
        </button>

        {/* Decorative elements */}
        <div className="doodle-arrow" style={{ top: '20px', right: '20px' }}>↗</div>
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px',
          fontSize: '1.5rem',
          color: 'var(--doodle-yellow)',
          transform: 'rotate(-15deg)',
          opacity: '0.6'
        }}>
          ✨
        </div>
      </div>
    </div>
  );
};

export default GoogleProfileCompletion;