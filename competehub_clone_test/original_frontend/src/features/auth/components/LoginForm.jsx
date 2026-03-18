// features/auth/components/LoginForm.jsx
import React, { useState } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { DoodleIcons } from '../../../shared/utils/doodleUtils';
import { Eye, EyeOff, Users } from 'lucide-react';
import '../../../styles/themes/doodle.css';

const LoginForm = ({ onSwitchToRegister, onForgotPassword, onLoginSuccess, onNeedsVerification }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useUser();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);

      if (response.token) {
        // Login successful
        onLoginSuccess?.();
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific error cases
      if (error.message === 'Please verify your email before logging in') {
        // Redirect to OTP verification
        onNeedsVerification(formData.email);
      } else {
        setError(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
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
        {/* Left Side - Login Form */}
        <div style={{
          maxWidth: '420px',
          width: '100%',
          flex: '0 0 auto',
          background: 'var(--doodle-paper)',
          border: '4px solid var(--doodle-ink)',
          borderRadius: '25px',
          padding: '40px 35px',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
          transform: 'rotate(-0.5deg)'
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <Users size={32} color="black" />
            </div>
            <h2 style={{
              fontSize: '2rem',
              margin: 0,
              color: 'var(--doodle-ink)',
              fontWeight: 'bold'
            }}>Welcome Back!</h2>
          </div>
          {/* <p style={{
            fontSize: '1rem',
            color: 'var(--doodle-secondary)',
            margin: 0,
            textAlign: 'left'
          }}>Sign in to continue your journey</p> */}
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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '0.95rem',
              marginBottom: '8px',
              display: 'block',
              fontWeight: 'bold',
              color: 'var(--doodle-ink)'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="competehub@cute.com"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '0.95rem',
                border: '3px solid var(--doodle-ink)',
                borderRadius: '15px',
                 
                background: 'white',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--doodle-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--doodle-ink)'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '0.95rem',
              marginBottom: '8px',
              display: 'block',
              fontWeight: 'bold',
              color: 'var(--doodle-ink)'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 16px',
                  fontSize: '0.95rem',
                  border: '3px solid var(--doodle-ink)',
                  borderRadius: '15px',
                   
                  background: 'white',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--doodle-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--doodle-ink)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--doodle-ink)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              background: 'violet',
              color: 'black',
              border: '3px solid var(--doodle-ink)',
              borderRadius: '15px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
               
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !isLoading && (e.target.style.transform = 'translateY(0)')}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing In...
              </>
            ) : (
              <>
                {/* <DoodleIcons.Lightning size={20} /> */}
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={onForgotPassword}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline',
               
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Forgot your password?
          </button>
        </div>

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
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Switch to Register */}
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
            New User?
          </p>
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{
              flex: '0 0 auto',
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
            <DoodleIcons.Users size={18} />
            Create Account
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
            src="/doodielogin.png" 
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
              READY TO LEVEL UP?
              <br />
              <span style={{ color: '#6c5ce7' }}>LET'S START!</span>
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 1024px) {
            /* Stack vertically on tablets and mobile */
          }
        `}
      </style>
    </div>
  );
};

export default LoginForm;
