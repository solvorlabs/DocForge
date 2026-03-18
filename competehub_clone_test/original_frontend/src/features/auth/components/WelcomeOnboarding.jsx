// features/auth/components/WelcomeOnboarding.jsx
import React, { useState } from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import '../../../styles/themes/doodle.css';

const WelcomeOnboarding = ({ onComplete }) => {
  const { user, updateProfile } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      title: "Welcome to CompeteHub! 🎉",
      content: "You're all set to start your learning journey. Let's personalize your experience!",
      icon: "🎯"
    },
    {
      title: "Choose Your Avatar",
      content: "Pick an avatar that represents you in the community!",
      icon: "👤"
    },
    {
      title: "Set Your Exam Target",
      content: "Tell us which exam you're preparing for to get personalized content.",
      icon: "📚"
    },
    {
      title: "You're Ready! 🚀",
      content: "Start your first challenge and begin earning XP and achievements!",
      icon: "⭐"
    }
  ];

  const avatars = [
    { id: 'default', emoji: '👤', name: 'Default' },
    { id: 'brain', emoji: '🧠', name: 'Brain' },
    { id: 'trophy', emoji: '🏆', name: 'Trophy' },
    { id: 'lightning', emoji: '⚡', name: 'Lightning' },
    { id: 'book', emoji: '📚', name: 'Book' },
    { id: 'star', emoji: '⭐', name: 'Star' }
  ];

  const examTargets = ['JEE', 'GATE', 'CAT', 'NEET', 'UPSC', 'GRE', 'GMAT', 'Other'];

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'default');
  const [selectedExamTarget, setSelectedExamTarget] = useState(user?.examTarget || '');

  const handleNext = async () => {
    if (currentStep === 2) {
      // Save profile updates
      setIsLoading(true);
      try {
        await updateProfile({
          avatar: selectedAvatar,
          examTarget: selectedExamTarget
        });
      } catch (error) {
        console.error('Failed to update profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
              {steps[currentStep].icon}
            </div>
            <p style={{   fontSize: '1.1rem', lineHeight: '1.6' }}>
              {steps[currentStep].content}
            </p>
          </div>
        );

      case 1:
        return (
          <div>
            <p style={{ 
                
              fontSize: '1.1rem', 
              textAlign: 'center',
              marginBottom: '30px' 
            }}>
              {steps[currentStep].content}
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '15px',
              maxWidth: '300px',
              margin: '0 auto'
            }}>
              {avatars.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`doodle-btn ${selectedAvatar === avatar.id ? 'doodle-btn-primary' : 'doodle-btn-secondary'}`}
                  style={{
                    padding: '20px',
                    borderRadius: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '2rem'
                  }}
                >
                  <span>{avatar.emoji}</span>
                  <span style={{ fontSize: '0.8rem',   }}>
                    {avatar.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <p style={{ 
                
              fontSize: '1.1rem', 
              textAlign: 'center',
              marginBottom: '30px' 
            }}>
              {steps[currentStep].content}
            </p>
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <select
                value={selectedExamTarget}
                onChange={(e) => setSelectedExamTarget(e.target.value)}
                className="doodle-input"
                style={{ width: '100%', fontSize: '1rem' }}
              >
                <option value="">Select your target exam</option>
                {examTargets.map(target => (
                  <option key={target} value={target}>{target}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
              {steps[currentStep].icon}
            </div>
            <p style={{   fontSize: '1.1rem', lineHeight: '1.6' }}>
              {steps[currentStep].content}
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center',
              marginTop: '30px',
              flexWrap: 'wrap'
            }}>
              <div className="doodle-badge" style={{ background: 'var(--doodle-green)' }}>
                Level 1
              </div>
              <div className="doodle-badge" style={{ background: 'var(--doodle-blue)' }}>
                Bronze Rank
              </div>
              <div className="doodle-badge" style={{ background: 'var(--doodle-yellow)', color: 'var(--doodle-ink)' }}>
                0 XP
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="doodle-container">
      <div className="doodle-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
        {/* Progress Indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '30px',
          gap: '10px'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: index <= currentStep ? 'var(--doodle-blue)' : 'var(--doodle-ink)',
                opacity: index <= currentStep ? 1 : 0.3
              }}
            />
          ))}
        </div>

        {/* Step Title */}
        <h2 className="doodle-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
          {steps[currentStep].title}
        </h2>

        {/* Step Content */}
        <div style={{ marginBottom: '40px', minHeight: '200px' }}>
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="doodle-btn doodle-btn-secondary"
            >
              ← Back
            </button>
          )}
          
          <button
            onClick={handleNext}
            className={`doodle-btn doodle-btn-primary ${isLoading ? 'doodle-loading' : ''}`}
            disabled={isLoading || (currentStep === 2 && !selectedExamTarget)}
          >
            {isLoading ? (
              <>
                <div className="doodle-spinner" style={{ marginRight: '10px' }}></div>
                Saving...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <DoodleIcons.Lightning size={20} style={{ marginRight: '8px' }} />
                Let's Go!
              </>
            ) : (
              'Next →'
            )}
          </button>

          {currentStep < 2 && (
            <button
              onClick={handleSkip}
              className="doodle-btn"
              style={{ 
                background: 'var(--doodle-yellow)', 
                color: 'var(--doodle-ink)' 
              }}
            >
              Skip
            </button>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="doodle-arrow" style={{ top: '20px', right: '20px' }}>↗</div>
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px',
          fontSize: '1.5rem',
          color: 'var(--doodle-green)',
          transform: 'rotate(-15deg)',
          opacity: '0.6'
        }}>
          🎯
        </div>
      </div>
    </div>
  );
};

export default WelcomeOnboarding;
