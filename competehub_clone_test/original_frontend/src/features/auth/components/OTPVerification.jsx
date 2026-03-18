// features/auth/components/OTPVerification.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

const OTPVerification = ({ email, onVerificationSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef([]);
  const { verifyEmail, resendOTP } = useUser();

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createClickEffect(e);
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyEmail(email, otpString);
      onVerificationSuccess();
    } catch (error) {
      setError(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    setError('');

    try {
      await resendOTP(email);
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

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
        {/* Left Side - OTP Verification Form */}
        <div style={{ 
          maxWidth: '420px', 
          width: '100%',
          flex: '0 0 auto',
          padding: '40px 35px',
          background: 'var(--doodle-paper)',
          border: '4px solid var(--doodle-ink)',
          borderRadius: '25px',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
          transform: 'rotate(-0.5deg)',
          position: 'relative'
        }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              flexShrink: 0,
              borderRadius: '50%',
              border: '3px solid var(--doodle-ink)',
              background: 'var(--doodle-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <DoodleIcons.Book size={32} color="#fff" />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.8rem',
                margin: 0,
                color: 'var(--doodle-ink)',
                fontWeight: 'bold',
                 
              }}>Verify Your Email</h2>
            </div>
          </div>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--doodle-secondary)',
            margin: 0,
            textAlign: 'left',
            marginBottom: '8px'
          }}>
            We've sent a 6-digit code to your email
          </p>
          <p style={{ 
              
            fontWeight: '700', 
            color: 'var(--doodle-blue)',
            margin: 0,
            fontSize: '1rem'
          }}>
            {email}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="doodle-alert" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center', 
            marginBottom: '25px' 
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                style={{
                  width: '50px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  padding: '0',
                  border: '3px solid var(--doodle-ink)',
                  borderRadius: '12px',
                   
                  background: 'white',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                maxLength="1"
                autoComplete="off"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            style={{ 
              width: '100%', 
              marginBottom: '16px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'var(--doodle-blue)',
              color: 'white',
              border: '3px solid var(--doodle-ink)',
              borderRadius: '15px',
              cursor: isLoading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
               
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => !isLoading && otp.join('').length === 6 && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !isLoading && (e.target.style.transform = 'translateY(0)')}
          >
            {isLoading ? (
              <>
                <div className="doodle-spinner" style={{ marginRight: '8px' }}></div>
                Verifying...
              </>
            ) : (
              <>
                <DoodleIcons.Lightning size={16} style={{ marginRight: '6px' }} />
                Verify Email
              </>
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <p style={{ 
              
            margin: 0, 
            fontSize: '0.95rem',
            color: 'var(--doodle-secondary)',
            whiteSpace: 'nowrap'
          }}>
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || isResending}
            style={{ 
              flex: '0 0 auto',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              background: resendCooldown > 0 ? '#ccc' : 'transparent',
              color: resendCooldown > 0 ? '#666' : '#667eea',
              border: '3px solid ' + (resendCooldown > 0 ? '#999' : '#667eea'),
              borderRadius: '15px',
              cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
               
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (resendCooldown === 0 && !isResending) {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (resendCooldown === 0 && !isResending) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#667eea';
              }
            }}
          >
            {isResending ? (
              <>
                <div className="doodle-spinner" style={{ marginRight: '6px' }}></div>
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              'Resend Code'
            )}
          </button>
        </div>

        {/* Back Button */}
        <div style={{ 
          textAlign: 'center', 
          borderTop: '2px solid var(--doodle-ink)', 
          paddingTop: '20px',
          marginTop: '10px',
          opacity: 0.15
        }} />
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'var(--doodle-yellow)',
              color: 'var(--doodle-ink)',
              border: '3px solid var(--doodle-ink)',
              borderRadius: '15px',
              cursor: 'pointer',
               
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ← Back to Registration
          </button>
        </div>
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
            src="/doodieotp.png" 
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
              CHECK YOUR EMAIL!
              <br />
              <span style={{ color: '#6c5ce7' }}>VERIFY NOW!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
