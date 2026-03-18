// features/auth/components/ForgotPassword.jsx
import React, { useState } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

const ForgotPassword = ({ onBack, onResetPassword }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp+password, 3: success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { forgotPassword, resetPassword } = useUser();

  // Countdown for resend button
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle email submission (Step 1)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    createClickEffect(e);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setStep(2); // Move to OTP step
      setResendCooldown(60); // Start 60-second cooldown
    } catch (error) {
      setError(error.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset submission (Step 2)
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    createClickEffect(e);
    
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(email, otp, newPassword);
      setStep(3); // Move to success step
    } catch (error) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to email step
  const handleBackToEmail = () => {
    setStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setResendCooldown(0);
  };

  // Resend reset code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setResendCooldown(60); // Start 60-second cooldown
      // Could show a success message here
    } catch (error) {
      setError(error.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Success message
  if (step === 3) {
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
          <div style={{ 
            maxWidth: '420px',
            width: '100%',
            flex: '0 0 auto',
            padding: '40px',
            background: 'var(--doodle-paper)',
            border: '4px solid var(--doodle-ink)',
            borderRadius: '25px',
            boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
            transform: 'rotate(-0.5deg)'
          }}>
          {/* Success Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="doodle-avatar doodle-float" style={{ margin: '0 auto 20px' }}>
              <DoodleIcons.Lightning size={40} color="#fff" />
            </div>
            <h2 className="doodle-title">Password Reset Successful!</h2>
            <p className="doodle-subtitle">
              Your password has been changed successfully
            </p>
          </div>

          {/* Success Message */}
          <div className="doodle-alert" style={{ 
            background: 'var(--doodle-green)', 
            marginBottom: '20px' 
          }}>
            Password reset completed! You can now log in with your new password.
          </div>

          {/* Login Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onBack}
              style={{ 
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 'bold',
                background: 'var(--doodle-blue)',
                color: 'white',
                border: '3px solid var(--doodle-ink)',
                borderRadius: '15px',
                cursor: 'pointer',
                 
                boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <DoodleIcons.Users size={20} />
              Back to Login
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
              src="/doodieforgot.png" 
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
                ALL SET!
                <br />
                <span style={{ color: '#10b981' }}>PASSWORD UPDATED!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: OTP and new password form
  if (step === 2) {
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
          <div style={{ 
            maxWidth: '420px',
            width: '100%',
            flex: '0 0 auto',
            padding: '40px',
            background: 'var(--doodle-paper)',
            border: '4px solid var(--doodle-ink)',
            borderRadius: '25px',
            boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
            transform: 'rotate(-0.5deg)'
          }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="doodle-avatar doodle-float" style={{ margin: '0 auto 20px' }}>
              <DoodleIcons.Lightning size={40} color="#fff" />
            </div>
            <h2 className="doodle-title">Enter Reset Code</h2>
            <p className="doodle-subtitle">
              We've sent a 6-digit code to
            </p>
            <p style={{ 
                
              fontWeight: '600', 
              color: 'var(--doodle-blue)',
              margin: '5px 0'
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

          {/* Reset Password Form */}
          <form onSubmit={handlePasswordReset}>
            <div style={{ marginBottom: '20px' }}>
              <label className="doodle-label">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                className="doodle-input"
                placeholder="Enter 6-digit code"
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '3px' }}
                maxLength={6}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="doodle-label">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                className="doodle-input"
                placeholder="Enter new password (min 6 characters)"
                minLength={6}
                required
              />
              {newPassword && newPassword.length < 6 && (
                <p style={{ 
                  fontSize: '12px', 
                  color: 'var(--doodle-orange)', 
                  margin: '5px 0 0 0',
                   
                }}>
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="doodle-label">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className="doodle-input"
                placeholder="Confirm new password"
                minLength={6}
                required
              />
              {confirmPassword && newPassword && confirmPassword !== newPassword && (
                <p style={{ 
                  fontSize: '12px', 
                  color: 'var(--doodle-orange)', 
                  margin: '5px 0 0 0',
                   
                }}>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword && confirmPassword === newPassword && newPassword.length >= 6 && (
                <p style={{ 
                  fontSize: '12px', 
                  color: 'var(--doodle-green)', 
                  margin: '5px 0 0 0',
                   
                }}>
                  ✓ Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`doodle-btn doodle-btn-primary ${isLoading ? 'doodle-loading' : ''}`}
              disabled={isLoading}
              style={{ width: '100%', marginBottom: '20px' }}
            >
              {isLoading ? (
                <>
                  <div className="doodle-spinner" style={{ marginRight: '10px' }}></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Back to Email */}
          <div style={{ textAlign: 'center', borderTop: '2px dashed var(--doodle-ink)', paddingTop: '20px' }}>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isLoading}
              className="doodle-btn doodle-btn-secondary"
              style={{ 
                width: '100%', 
                marginBottom: '10px',
                opacity: resendCooldown > 0 ? 0.6 : 1 
              }}
            >
              {resendCooldown > 0 
                ? `Resend Code in ${resendCooldown}s` 
                : 'Resend Code'
              }
            </button>
            <button
              type="button"
              onClick={handleBackToEmail}
              className="doodle-btn doodle-btn-secondary"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              ← Change Email Address
            </button>
            <button
              type="button"
              onClick={onBack}
              className="doodle-btn doodle-btn-secondary"
              style={{ width: '100%' }}
            >
              Cancel
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
              src="/doodieforgot.png" 
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
                RESET YOUR PASSWORD!
                <br />
                <span style={{ color: '#6c5ce7' }}>ALMOST THERE!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Email input form
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
        <div style={{ 
          maxWidth: '420px',
          width: '100%',
          flex: '0 0 auto',
          padding: '40px',
          background: 'var(--doodle-paper)',
          border: '4px solid var(--doodle-ink)',
          borderRadius: '25px',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
          transform: 'rotate(-0.5deg)'
        }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="doodle-avatar doodle-float" style={{ margin: '0 auto 20px' }}>
            <DoodleIcons.Book size={40} color="#fff" />
          </div>
          <h2 className="doodle-title">Forgot Password?</h2>
          <p className="doodle-subtitle">
            No worries! Enter your email and we'll send you a reset code.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="doodle-alert" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Forgot Password Form */}
        <form onSubmit={handleEmailSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="doodle-label">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="doodle-input"
              placeholder="Enter your email address"
              required
            />
          </div>

          <button
            type="submit"
            className={`doodle-btn doodle-btn-primary ${isLoading ? 'doodle-loading' : ''}`}
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '20px' }}
          >
            {isLoading ? (
              <>
                <div className="doodle-spinner" style={{ marginRight: '10px' }}></div>
                Sending Reset Code...
              </>
            ) : (
              <>
                <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
                Send Reset Code
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div style={{ textAlign: 'center', borderTop: '2px dashed var(--doodle-ink)', paddingTop: '20px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'transparent',
              color: '#667eea',
              border: '3px solid #667eea',
              borderRadius: '15px',
              cursor: 'pointer',
               
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            ← Back to Login
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
            src="/doodieforgot.png" 
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
              FORGOT PASSWORD?
              <br />
              <span style={{ color: '#6c5ce7' }}>WE GOT YOU!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
