// features/auth/pages/AuthPageNew.jsx - Single screen non-scrollable authentication
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import OTPVerification from '../components/OTPVerification';
import ForgotPassword from '../components/ForgotPassword';
import GoogleProfileCompletion from '../components/GoogleProfileCompletion';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial mode from URL params, route path, or default to login
  const urlParams = new URLSearchParams(location.search);
  const pathMode = location.pathname === '/register' ? 'register' : 'login';
  const initialMode = urlParams.get('mode') || pathMode;
  
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSwitchToRegister = () => {
    setMode('register');
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('mode', 'register');
    window.history.replaceState({}, '', newUrl);
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('mode', 'login');
    window.history.replaceState({}, '', newUrl);
  };

  const handleRegisterSuccess = (userEmail) => {
    setEmail(userEmail);
    setMode('otp');
    if (window.toast) window.toast.success('Registration successful! Please verify your email.');
  };

  const handleOTPVerificationSuccess = () => {
    if (window.toast) window.toast.success('Email verified! You are now logged in.');
    navigate('/');
  };

  const handleBackFromOTP = () => {
    setMode('register');
  };

  const handleForgotPassword = () => {
    setShowResetPassword(true);
  };

  const handleBackFromForgotPassword = () => {
    setShowResetPassword(false);
  };

  const handleResetPassword = (userEmail) => {
    setEmail(userEmail);
  };

  const handleNeedsVerification = (userEmail) => {
    setEmail(userEmail);
    setMode('otp');
  };

  const handleEmailAlreadyRegistered = (userEmail) => {
    setEmail(userEmail);
    setMode('login');
    if (window.toast) window.toast.info('Email already registered. Please login.');
  };

  const handleGoogleProfileCompletion = () => {
    if (window.toast) window.toast.success('Profile completed successfully!');
    navigate('/');
  };

  const handleLoginSuccess = () => {
    if (window.toast) window.toast.success('Login successful!');
    navigate('/');
  };

  const renderContent = () => {
    if (showResetPassword) {
      return (
        <ForgotPassword
          onBack={handleBackFromForgotPassword}
          onResetPassword={handleResetPassword}
        />
      );
    }

    switch (mode) {
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={handleSwitchToLogin}
            onRegisterSuccess={handleRegisterSuccess}
            onEmailAlreadyRegistered={handleEmailAlreadyRegistered}
            email={email}
          />
        );
      case 'otp':
        return (
          <OTPVerification
            email={email}
            onVerificationSuccess={handleOTPVerificationSuccess}
            onBack={handleBackFromOTP}
          />
        );
      case 'google-complete':
        return (
          <GoogleProfileCompletion
            onComplete={handleGoogleProfileCompletion}
            userInfo={{ email }}
          />
        );
      case 'login':
      default:
        return (
          <LoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onForgotPassword={handleForgotPassword}
            onNeedsVerification={handleNeedsVerification}
            email={email}
            onLoginSuccess={handleLoginSuccess}
          />
        );
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Back to Home Button - Positioned absolutely over the form */}
      {/* <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '3px solid var(--doodle-ink)',
          borderRadius: '15px',
          padding: '10px 18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: 'var(--doodle-ink)',
          boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease',
          zIndex: 10000,
           
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '6px 6px 0 rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '4px 4px 0 rgba(0, 0, 0, 0.2)';
        }}
      >
        <DoodleIcons.Home size={18} />
        Back to Home
      </button> */}

      {/* Render forms directly without wrapper */}
      {renderContent()}
    </div>
  );
};

export default AuthPage;
