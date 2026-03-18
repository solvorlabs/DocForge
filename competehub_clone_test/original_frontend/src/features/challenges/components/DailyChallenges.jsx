import React from 'react';
import { ChevronRight, Puzzle, Award, Globe, Calendar, Clock, Star, Target } from 'lucide-react';
import './DailyChallenges.css';

const DailyChallenges = ({ dailyChallenges = [] }) => {
  const getChallengeIcon = (challenge) => {
    switch (challenge.id) {
      case 1: return <Puzzle size={16} />;
      case 2: return <Award size={16} />;
      case 3: return <Globe size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getChallengeColor = (challenge) => {
    switch (challenge.id) {
      case 1: return 'var(--doodle-blue)';
      case 2: return 'var(--doodle-green)';
      case 3: return 'var(--doodle-purple)';
      default: return 'var(--doodle-accent)';
    }
  };

  return (
    <div className="daily-challenges">
      {/* Header */}
      <div className="challenges-header">
        <h3 className="challenges-title">
          <Calendar size={16} style={{ marginRight: '8px' }} />
          DAILY CHALLENGES
        </h3>
      </div>

      {/* Challenges List */}
      <div className="challenges-list">
        {dailyChallenges.map((challenge) => (
          <div 
            key={challenge.id} 
            className={`challenge-card ${challenge.comingSoon ? 'coming-soon' : ''} ${challenge.completed ? 'completed' : ''}`}
          >
            {/* Doodle Decorations */}
            

            {/* Challenge Icon */}
            <div 
              className="challenge-icon"
              style={{ background: getChallengeColor(challenge) }}
            >
              {getChallengeIcon(challenge)}
            </div>

            {/* Challenge Info */}
            <div className="challenge-info">
              <div className="challenge-title">
                {challenge.title}
              </div>
              <div className="challenge-date">
                {challenge.comingSoon ? (
                  <span className="coming-soon-text">
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    Coming Soon
                  </span>
                ) : (
                  challenge.date
                )}
              </div>
            </div>

            {/* Arrow or Status */}
            {/* <div className="challenge-action">
              {challenge.comingSoon ? (
                <div className="coming-soon-badge">
                  SOON
                </div>
              ) : challenge.completed ? (
                <div className="completed-badge">
                  ✓
                </div>
              ) : challenge.hasArrow ? (
                <ChevronRight size={16} className="challenge-arrow" />
              ) : null}
            </div> */}

            {/* Progress Bar (for active challenges) */}
            {!challenge.comingSoon && !challenge.completed && (
              <div className="challenge-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: '0%' }}
                  ></div>
                </div>
                <div className="progress-text">0% Complete</div>
              </div>
            )}

            {/* Doodle Border Effects */}
            <div className="doodle-border doodle-border-top"></div>
            <div className="doodle-border doodle-border-right"></div>
            <div className="doodle-border doodle-border-bottom"></div>
            <div className="doodle-border doodle-border-left"></div>
          </div>
        ))}
      </div>

      {/* Footer Decoration */}
      {/* <div className="challenges-footer">
        <div className="footer-decoration">🎊</div>
        <div className="footer-text">New challenges every day!(coming Soon)</div>
        <div className="footer-decoration">🎊</div>
      </div> */}
    </div>
  );
};

export default DailyChallenges;
