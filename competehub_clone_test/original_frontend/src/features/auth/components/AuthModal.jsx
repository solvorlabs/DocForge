// features/auth/components/AuthModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';
import GoogleProfileCompletion from './GoogleProfileCompletion';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  if (!isOpen) return null;



  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  const handleRegisterSuccess = (userEmail) => {
    setEmail(userEmail);
    setMode('otp');
    if (window.toast) window.toast.success('Registration successful! Please verify your email.');
  };

  const handleOTPVerificationSuccess = () => {
    if (window.toast) window.toast.success('Email verified! You are now logged in.');
    onClose();
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
    // You can add a reset password form here if needed
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
    onClose();
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
            onLoginSuccess={() => {
              if (window.toast) window.toast.success('Login successful!');
              onClose();
              navigate('/');
            }}
          />
        );
    }
  };

  return (
    <div 
      className="doodle-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        className="doodle-modal-content"
        style={{
          position: 'relative',
          maxWidth: '450px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          background: 'white'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--doodle-accent)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            zIndex: 10,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          ×
        </button>

        {/* Content */}
        {renderContent()}
      </div>

      {/* Decorative Elements - Smaller and better positioned */}
      <div style={{ 
        position: 'absolute',
        top: '15%',
        left: '15%',
        fontSize: '2rem',
        color: 'var(--doodle-yellow)',
        transform: 'rotate(-15deg)',
        opacity: '0.2',
        pointerEvents: 'none'
      }}>
        <DoodleIcons.Lightning />
      </div>
      <div style={{ 
        position: 'absolute',
        bottom: '25%',
        right: '20%',
        fontSize: '1.8rem',
        color: 'var(--doodle-green)',
        transform: 'rotate(25deg)',
        opacity: '0.2',
        pointerEvents: 'none'
      }}>
        <DoodleIcons.Star />
      </div>
      <div style={{ 
        position: 'absolute', 
        top: '40%', 
        right: '25%',
        fontSize: '1.5rem',
        color: 'white',
        transform: 'rotate(-30deg)',
        opacity: '0.2',
        pointerEvents: 'none'
      }}>
        <DoodleIcons.Brain />
      </div>
    </div>
  );
};

export default AuthModal;
