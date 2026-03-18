// features/auth/components/OnboardingSteps.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';
import '../../../styles/themes/onboarding.css';
import { Eye, EyeOff, Target } from 'lucide-react';

const OnboardingSteps = ({ onComplete, onError, initialData = {}, isGoogleUser = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    examTarget: '',
    subjects: [],
    studyHours: '',
    heardFrom: '',
    avatar: 'default',
    ...initialData
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameCheck, setUsernameCheck] = useState({ checked: false, available: false });
  const [slideDirection, setSlideDirection] = useState('right');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, checkUsername, apiRequest } = useUser();

  const examTargets = ['JEE', 'GATE', 'CAT', 'NEET', 'UPSC', 'GRE', 'GMAT', 'Other'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'General Knowledge'];
  const heardFromOptions = ['Social Media', 'Friend', 'Search Engine', 'Advertisement', 'School/College', 'Other'];
  const avatars = ['default', 'brain', 'trophy', 'lightning', 'book', 'star'];
  const studyHoursOptions = ['1-2 hours', '2-4 hours', '4-6 hours', '6+ hours'];

  const steps = isGoogleUser 
    ? ['welcome', 'username', 'goals', 'preferences', 'avatar']
    : ['welcome', 'basic', 'goals', 'preferences', 'avatar'];

  useEffect(() => {
    // Reset error when step changes
    setError('');
  }, [currentStep]);

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
        setUsernameCheck({ checked: false, available: false });
        // Don't show username check errors immediately, but log them
      }
    } else {
      setUsernameCheck({ checked: false, available: false });
    }
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    
    switch (step) {
      case 'basic':
        if (!formData.username || formData.username.length < 3) {
          setError('Username must be at least 3 characters long');
          return false;
        }
        if (!formData.email) {
          setError('Email is required');
          return false;
        }
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (usernameCheck.checked && !usernameCheck.available) {
          setError('Username is not available');
          return false;
        }
        break;
      case 'username':
        if (!formData.username || formData.username.length < 3) {
          setError('Username must be at least 3 characters long');
          return false;
        }
        if (usernameCheck.checked && !usernameCheck.available) {
          setError('Username is not available');
          return false;
        }
        break;
      case 'goals':
        if (!formData.examTarget) {
          setError('Please select your exam target');
          return false;
        }
        break;
      case 'preferences':
        if (formData.subjects.length === 0) {
          setError('Please select at least one subject');
          return false;
        }
        break;
      default:
        break;
    }
    
    return true;
  };

  const nextStep = (e) => {
    if (e) createClickEffect(e);
    
    if (!validateCurrentStep()) return;
    
    if (currentStep < steps.length - 1) {
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setSlideDirection('right');
      }, 150);
    }
  };

  const prevStep = (e) => {
    if (e) createClickEffect(e);
    
    if (currentStep > 0) {
      setSlideDirection('right');
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setSlideDirection('left');
      }, 150);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      createClickEffect(e);
    }
    
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isGoogleUser) {
        response = await apiRequest('/auth/complete-google-profile', {
          method: 'POST',
          body: JSON.stringify({
            username: formData.username,
            examTarget: formData.examTarget,
            heardFrom: formData.heardFrom,
            avatar: formData.avatar
          })
        });
      } else {
        response = await register(formData);
      }

      // Check if response exists and has the expected properties
      if (response && (response.user || response.userId || response.success)) {
        onComplete(response);
      } else if (response && response.message && !response.error) {
        // If response has a success message but no user data (like for email verification flow)
        onComplete(response);
      } else {
        // If response doesn't have expected structure, treat as error
        console.warn('Unexpected response structure:', response);
        throw new Error('Registration completed but response format is unexpected');
      }
    } catch (error) {
      console.error('Onboarding submission error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
        type: typeof error
      });
      
      // Handle different types of errors with specific messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message) {
        // Use the error message from the server
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // If error is a string
        errorMessage = error;
      } else if (error.response && error.response.data && error.response.data.message) {
        // If error has response structure
        errorMessage = error.response.data.message;
      }
      
      // Handle specific error cases with user-friendly messages
      if (errorMessage.toLowerCase().includes('email already registered')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in instead.';
      } else if (errorMessage.toLowerCase().includes('username already taken')) {
        errorMessage = 'This username is already taken. Please choose a different username.';
      } else if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('required')) {
        errorMessage = 'Username is required. Please enter a username.';
      } else if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('required')) {
        errorMessage = 'Password is required. Please enter a password.';
      } else if (errorMessage.toLowerCase().includes('exam target') && errorMessage.toLowerCase().includes('required')) {
        errorMessage = 'Please select your target exam to continue.';
      } else if (errorMessage.toLowerCase().includes('validation')) {
        errorMessage = 'Please check your information and try again.';
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      if (onError) {
        onError({ message: errorMessage, originalError: error });
      }
    } finally {
      setIsLoading(false);
    }
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

  const getStepTitle = () => {
    const step = steps[currentStep];
    switch (step) {
      case 'welcome': return isGoogleUser ? 'Welcome to CompeteHub!' : 'Join CompeteHub!';
      case 'basic': return 'Create Your Account';
      case 'username': return 'Choose Your Username';
      case 'goals': return 'Set Your Goals';
      case 'preferences': return 'Your Preferences';
      case 'avatar': return 'Choose Your Avatar';
      default: return 'Welcome';
    }
  };

  const getStepSubtitle = () => {
    const step = steps[currentStep];
    switch (step) {
      case 'welcome': return isGoogleUser 
        ? "Let's complete your profile to get started!" 
        : 'Start your learning journey with us today!';
      case 'basic': return 'We need some basic information to create your account';
      case 'username': return 'This will be your unique identity on CompeteHub';
      case 'goals': return 'Tell us about your exam goals so we can personalize your experience';
      case 'preferences': return 'What subjects are you most interested in?';
      case 'avatar': return 'Pick an avatar that represents you!';
      default: return '';
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step) {
      case 'welcome':
        return (
          <div style={{ padding: ' 10px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{ 
                flexShrink: 0,
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '3px solid var(--doodle-ink)'
              }}>
                <Target color='red' size={32}/>
              </div>
              <h2 style={{ 
                fontFamily: 'Architects Daughter, cursive',
                fontSize: '2rem',
                color: 'var(--doodle-blue)',
                margin: 0
              }}>
                {isGoogleUser ? 'Almost there!' : 'Welcome!'}
              </h2>
            </div>
            <p style={{ 
              fontSize: '1.1rem',
              color: 'var(--doodle-ink)',
              lineHeight: '1.6',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              {isGoogleUser 
                ? "Let's set up your CompeteHub profile to give you the best personalized learning experience."
                : "CompeteHub is your ultimate platform for competitive exam preparation. Let's create your personalized learning journey!"
              }
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '50px' }}>
              <div className="floating-element" style={{ textAlign: 'center' }}>
                <DoodleIcons.Trophy size={32} color="var(--doodle-yellow)" />
                <p style={{ fontSize: '0.9rem', marginTop: '8px', color: 'var(--doodle-ink)' }}>Track Progress</p>
              </div>
              <div className="floating-element" style={{ textAlign: 'center' }}>
                <DoodleIcons.Lightning size={32} color="var(--doodle-blue)" />
                <p style={{ fontSize: '0.9rem', marginTop: '8px', color: 'var(--doodle-ink)' }}>Quick Learning</p>
              </div>
              <div className="floating-element" style={{ textAlign: 'center' }}>
                <DoodleIcons.Users size={32} color="var(--doodle-green)" />
                <p style={{ fontSize: '0.9rem', marginTop: '8px', color: 'var(--doodle-ink)' }}>Compete</p>
              </div>
            </div>
          </div>
        );

      case 'basic':
        return (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '0.95rem',
                marginBottom: '8px',
                display: 'block',
                fontWeight: 'bold',
                color: 'var(--doodle-ink)',
                 
              }}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleUsernameChange}
                placeholder="Choose a unique username"
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
              />
              {usernameCheck.checked && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  marginTop: '6px',
                   
                  fontWeight: 'bold',
                  color: usernameCheck.available ? 'var(--doodle-green)' : 'var(--doodle-accent)'
                }}>
                  {usernameCheck.available ? '✅ Available' : '❌ Taken'}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '0.95rem',
                marginBottom: '8px',
                display: 'block',
                fontWeight: 'bold',
                color: 'var(--doodle-ink)',
                 
              }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '0.95rem',
                marginBottom: '8px',
                display: 'block',
                fontWeight: 'bold',
                color: 'var(--doodle-ink)',
                 
              }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '0.95rem',
                marginBottom: '8px',
                display: 'block',
                fontWeight: 'bold',
                color: 'var(--doodle-ink)',
                 
              }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'username':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀</div>
            <div style={{ marginBottom: '20px' }}>
              <label className="doodle-label" style={{ fontSize: '1.1rem' }}>Choose Your Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleUsernameChange}
                className="doodle-input"
                placeholder="Enter unique username"
                required
                style={{ textAlign: 'center', fontSize: '1.2rem', padding: '15px' }}
              />
              {formData.username.length >= 3 && usernameCheck.checked && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.9rem',
                  color: usernameCheck.available ? 'var(--doodle-green)' : 'var(--doodle-accent)'
                }}>
                  {usernameCheck.available ? '✓ Username available' : '✗ Username taken'}
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--doodle-secondary)' }}>
              This will be your unique identity on CompeteHub. Choose wisely!
            </p>
          </div>
        );

      case 'goals':
        return (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginBottom: '30px'
            }}>
              <div style={{ 
                flexShrink: 0,
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '3px solid var(--doodle-ink)'
              }}>
                <Target color='red' size={32} />
              </div>
              <h3 style={{ 
                  
                color: 'var(--doodle-ink)',
                margin: 0,
                fontSize: '1.5rem'
              }}>
                What's your target exam?
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
              {examTargets.map(target => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, examTarget: target }))}
                  className={`doodle-btn ${formData.examTarget === target ? 'doodle-btn-primary' : 'doodle-btn-secondary'}`}
                  style={{ 
                    padding: '15px 10px',
                    fontSize: '0.9rem',
                    borderRadius: '15px',
                    transform: formData.examTarget === target ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s'
                  }}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                flexShrink: 0,
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '3px solid var(--doodle-ink)'
              }}>
                📚
              </div>
              <div>
                <h3 style={{ 
                    
                  color: 'var(--doodle-ink)',
                  margin: 0,
                  marginBottom: '5px',
                  fontSize: '1.5rem'
                }}>
                  Which subjects interest you?
                </h3>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--doodle-secondary)',
                  margin: 0
                }}>
                  Select all that apply
                </p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '25px' }}>
              {subjects.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleSubjectToggle(subject)}
                  className={`doodle-btn subject-ripple onboarding-btn-hover ${formData.subjects.includes(subject) ? 'doodle-btn-primary active' : 'doodle-btn-secondary'}`}
                  style={{ 
                    padding: '12px 8px',
                    fontSize: '0.85rem',
                    borderRadius: '12px',
                    transform: formData.subjects.includes(subject) ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s'
                  }}
                >
                  {subject}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="doodle-label" style={{ 
                fontSize: '0.95rem',
                marginBottom: '8px',
                display: 'block',
                fontWeight: 'bold',
                color: 'var(--doodle-ink)'
              }}>
                How many hours do you study daily?
              </label>
              <select
                name="studyHours"
                value={formData.studyHours}
                onChange={handleChange}
                className="doodle-input"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '0.95rem',
                  border: '3px solid var(--doodle-ink)',
                  borderRadius: '15px',
                   
                  background: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select study hours</option>
                {studyHoursOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="doodle-label" style={{ 
                fontSize: '0.95rem',
                marginBottom: '8px',
                display: 'block',
                fontWeight: 'bold',
                color: 'var(--doodle-ink)'
              }}>
                How did you hear about us?
              </label>
              <select
                name="heardFrom"
                value={formData.heardFrom}
                onChange={handleChange}
                className="doodle-input"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '0.95rem',
                  border: '3px solid var(--doodle-ink)',
                  borderRadius: '15px',
                   
                  background: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select an option</option>
                {heardFromOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'avatar':
        return (
          <div>
            {/* <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                flexShrink: 0,
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                borderRadius: '50%',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '3px solid var(--doodle-ink)'
              }}>
                ✨
              </div>
              <div>
                <h3 style={{ 
                    
                  color: 'var(--doodle-ink)', 
                  margin: 0,
                  marginBottom: '5px',
                  fontSize: '1.5rem'
                }}>
                  Choose Your Avatar
                </h3>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--doodle-secondary)',
                  margin: 0
                }}>
                  This will represent you on CompeteHub!
                </p>
              </div>
            </div> */}
            
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '30px'
            }}>
              {avatars.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                  className={`doodle-btn onboarding-btn-hover ${formData.avatar === avatar ? 'doodle-btn-primary avatar-bounce' : 'doodle-btn-secondary'}`}
                  style={{ 
                    width: '70px',
                    height: '70px',
                    fontSize: '2rem',
                    padding: '0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: formData.avatar === avatar ? '3px solid var(--doodle-blue)' : '3px solid transparent',
                    transform: formData.avatar === avatar ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s'
                  }}
                >
                  {getAvatarEmoji(avatar)}
                </button>
              ))}
            </div>
            
            <div style={{ 
              padding: '20px',
              background: 'rgba(37, 99, 235, 0.1)',
              borderRadius: '15px',
              marginTop: '20px'
            }}>
              <h4 style={{ color: 'var(--doodle-blue)', marginBottom: '10px' }}>You're all set!</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--doodle-ink)' }}>
                Ready to start your learning journey with CompeteHub? Let's go! 🚀
              </p>
            </div>
          </div>
        );

      default:
        return null;
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
        {/* Left Side - Onboarding Form */}
        <div style={{ 
          maxWidth: '500px', 
          width: '100%',
          flex: '0 0 auto',
          padding: '40px 35px',
          background: 'var(--doodle-paper)',
          border: '4px solid var(--doodle-ink)',
          borderRadius: '25px',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
          minHeight: '600px',
          position: 'relative',
          overflow: 'hidden',
          transform: 'rotate(0.5deg)'
        }}>
        {/* Progress Bar */}
        <div className="onboarding-progress-bar" style={{ 
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '4px',
          background: 'rgba(37, 99, 235, 0.1)',
          zIndex: 10
        }}>
          <div style={{
            height: '100%',
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--doodle-blue), var(--doodle-yellow))',
            transition: 'width 0.5s ease',
            borderRadius: '0 2px 2px 0'
          }} />
        </div>

        {/* Step Counter */}
        <div style={{ 
          textAlign: 'center', 
          // marginBottom: '10px',
          // paddingTop: '10px'
        }}>
          <span style={{ 
            fontSize: '0.9rem', 
            color: 'var(--doodle-secondary)',
             
          }}>
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 className="doodle-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            {getStepTitle()}
          </h2>
          <p className="doodle-subtitle" style={{ fontSize: '1rem', opacity: 0.8 }}>
            {getStepSubtitle()}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="doodle-alert" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Step Content with Animation */}
        <div 
          className={`${slideDirection === 'left' ? 'onboarding-slide-left' : slideDirection === 'right' ? 'onboarding-slide-right' : ''}`}
          style={{
            minHeight: '300px'
          }}
        >
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '10px',
          paddingTop: '20px',
          borderTop: '2px dashed rgba(37, 99, 235, 0.2)'
        }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`doodle-btn doodle-btn-secondary ${currentStep === 0 ? '' : 'onboarding-btn-hover'}`}
              style={{ 
                opacity: currentStep === 0 ? 0.5 : 1,
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Back
            </button>          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              className={`doodle-btn doodle-btn-primary onboarding-btn-hover ${isLoading ? 'doodle-loading' : ''}`}
              disabled={isLoading}
              style={{ minWidth: '120px' }}
            >
              {isLoading ? (
                <>
                  <div className="doodle-spinner" style={{ marginRight: '8px' }}></div>
                  Creating...
                </>
              ) : (
                <>
                  <DoodleIcons.Lightning size={16} style={{ marginRight: '6px' }} />
                  Complete
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="doodle-btn doodle-btn-primary onboarding-btn-hover"
            >
              Next →
            </button>
          )}
        </div>

        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '100px',
          right: '-10px',
          fontSize: '2rem',
          color: 'rgba(37, 99, 235, 0.1)',
          transform: 'rotate(15deg)',
          zIndex: -1
        }}>
          ⭐
        </div>
        <div style={{
          position: 'absolute',
          bottom: '150px',
          left: '-15px',
          fontSize: '1.5rem',
          color: 'rgba(251, 191, 36, 0.1)',
          transform: 'rotate(-20deg)',
          zIndex: -1
        }}>
          ✨
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
            src="/doodieonboard.png" 
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
              YOU'RE ALMOST THERE!
              <br />
              <span style={{ color: '#6c5ce7' }}>KEEP GOING!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSteps;