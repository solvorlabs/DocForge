// features/auth/components/RegisterForm.jsx
import React, { useState } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';
import OnboardingSteps from './OnboardingSteps';
import '../../../styles/themes/doodle.css';

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess, onEmailAlreadyRegistered }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    examTarget: '',
    heardFrom: '',
    avatar: 'default'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState({ checked: false, available: false });

  const { register, checkUsername } = useUser();

  const examTargets = ['JEE', 'GATE', 'CAT', 'NEET', 'UPSC', 'GRE', 'GMAT', 'Other'];
  const heardFromOptions = ['Social Media', 'Friend', 'Search Engine', 'Advertisement', 'School/College', 'Other'];
  const avatars = ['default', 'brain', 'trophy', 'lightning', 'book', 'star'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setFormData({
      ...formData,
      username
    });
    setError('');

    // Check username availability
    if (username.length >= 3) {
      try {
        const result = await checkUsername(username);
        setUsernameCheck({ checked: true, available: result.available });
      } catch {
        setUsernameCheck({ checked: false, available: false });
      }
    } else {
      setUsernameCheck({ checked: false, available: false });
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.examTarget) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    if (usernameCheck.checked && !usernameCheck.available) {
      setError('Username is already taken');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleStartOnboarding = (e) => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (response) => {
    if (response.userId) {
      onRegisterSuccess(formData.email);
    }
  };

  const handleOnboardingError = (error) => {
    if (error.message === 'Email already registered') {
      onEmailAlreadyRegistered(formData.email);
    } else {
      setError(error.message || 'Registration failed');
      setShowOnboarding(false);
    }
  };

  // If onboarding started, show onboarding steps
  if (showOnboarding) {
    return (
      <OnboardingSteps
        onComplete={handleOnboardingComplete}
        initialData={formData}
        isGoogleUser={false}
      />
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffef9 0%, #ffeaa7 50%, #74b9ff 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
       
      padding: '40px 20px'
    }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        maxWidth: '1400px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        {/* Left Side - Register Form */}
        <div style={{ 
          maxWidth: '480px',
          width: '100%',
          flex: '0 0 auto',
          background: 'var(--doodle-paper)',
          border: '4px solid var(--doodle-ink)',
          borderRadius: '25px',
          padding: '40px 35px',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
          transform: 'rotate(0.5deg)'
        }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {/* <div style={{ 
            width: '100px', 
            height: '100px', 
            margin: '0 auto 20px'
          }}>
            <img 
              src="/doodie.png" 
              alt="Doodie Welcome" 
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'contain'
              }} 
            />
          </div> */}
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '8px',
            color: 'var(--doodle-ink)',
            fontWeight: 'bold'
          }}>Welcome to CompeteHub!</h2>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--doodle-secondary)',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Your personalized learning journey starts here 🚀
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: '#fee',
            border: '2px solid #c33',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            color: '#c33',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Features Preview */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '15px', 
            textAlign: 'center' 
          }}>
            <div style={{
              padding: '15px 10px',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '2px solid var(--doodle-ink)',
              borderRadius: '15px'
            }}>
              <DoodleIcons.Trophy size={28} color="var(--doodle-yellow)" />
              <p style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--doodle-ink)', fontWeight: 'bold' }}>Track Progress</p>
            </div>
            <div style={{
              padding: '15px 10px',
              background: 'rgba(66, 133, 244, 0.1)',
              border: '2px solid var(--doodle-ink)',
              borderRadius: '15px'
            }}>
              <DoodleIcons.Lightning size={28} color="var(--doodle-blue)" />
              <p style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--doodle-ink)', fontWeight: 'bold' }}>Smart Learning</p>
            </div>
            <div style={{
              padding: '15px 10px',
              background: 'rgba(15, 157, 88, 0.1)',
              border: '2px solid var(--doodle-ink)',
              borderRadius: '15px'
            }}>
              <DoodleIcons.Users size={28} color="var(--doodle-green)" />
              <p style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--doodle-ink)', fontWeight: 'bold' }}>Compete & Win</p>
            </div>
          </div>
        </div>

        {/* Start Journey Button */}
        <button
          onClick={handleStartOnboarding}
          style={{ 
            width: '100%', 
            padding: '15px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: '3px solid var(--doodle-ink)',
            borderRadius: '15px',
            cursor: 'pointer',
             
            boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <DoodleIcons.Lightning size={20} />
          Start Your Journey
        </button>

        {/* Divider */}
        <div style={{ 
          textAlign: 'center', 
          margin: '20px 0',
          position: 'relative'
        }}>
          <div style={{
            height: '2px',
            background: 'var(--doodle-ink)',
            opacity: 0.15
          }}></div>
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--doodle-paper)',
            padding: '0 15px',
            color: 'var(--doodle-ink)',
             
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            OR
          </span>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}/api/auth/google`;
          }}
          style={{ 
            width: '100%', 
            padding: '14px',
            fontSize: '1rem',
            fontWeight: 'bold',
            background: 'white',
            color: 'var(--doodle-ink)',
            border: '3px solid var(--doodle-ink)',
            borderRadius: '15px',
            cursor: 'pointer',
             
            boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Switch to Login */}
        <div style={{ 
          textAlign: 'center', 
          borderTop: '2px solid var(--doodle-ink)', 
          // paddingTop: '20px',
          marginTop: '10px',
          opacity: 0.15
        }} />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '15px',
          paddingTop: '20px' 
        }}>
          <p style={{ 
            margin: 0,
              
            fontSize: '1rem',
            color: 'var(--doodle-secondary)',
            whiteSpace: 'nowrap'
          }}>
            Already have an account?
          </p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ 
              flex: '0 0 auto',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'transparent',
              color: '#f5576c',
              border: '3px solid #f5576c',
              borderRadius: '15px',
              cursor: 'pointer',
               
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f5576c';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#f5576c';
            }}
          >
            <DoodleIcons.Users size={18} />
            Sign In
          </button>
        </div>
        {/* Close the form container div */}
        </div>

        {/* Right Side - Doodle Character */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          maxWidth: '500px'
        }}>
          <img 
            src="/doodieregister.png" 
            alt="Doodle Character" 
            style={{ 
              animation: 'bounce 2s infinite', 
              width: '100%', 
              maxWidth: '400px',
              height: 'auto',
              // filter: 'drop-shadow(8px 8px 0px rgba(0, 0, 0, 0.15))'
            }} 
          />
          
          {/* Message Bubble */}
          <div style={{
            background: 'white',
            border: '3px solid var(--doodle-ink)',
            borderRadius: '20px',
            padding: '20px 30px',
            boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.2)',
            transform: 'rotate(1deg)',
            maxWidth: '350px',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--doodle-ink)',
              lineHeight: 1.4
            }}>
              WELCOME ABOARD!
              <br />
              <span style={{ color: '#6c5ce7' }}>LET'S BEGIN!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
