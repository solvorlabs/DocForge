import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">
          404
        </div>
        <h1 className="error-title">Not Found</h1>

        <div className="meme-container">
          <img
            src="/meme/callkru.png"
            alt="Lost meme"
            style={{ height: '300px', width: '200px', margin: 'auto' }}
            className="meme-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <div className="message-bubble">
          <p className="message-text">
            Oops! Are you lost, little one? 🥺
            <br />
            <span className="hindi-text">It's ok dear, get back</span>
          </p>
        </div>

        <div className="button-group">
          <button
            onClick={() => navigate('/home')}
            className="doodle-btn doodle-btn-secondary"
            style={{ fontSize: '1.1rem', padding: '12px 24px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Arena
          </button>

          <button
            onClick={() => navigate('/')}
            className="doodle-btn"
            style={{ fontSize: '1.1rem', padding: '12px 24px', background: 'var(--doodle-sketch)', color: 'white' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* <div className="fun-facts">
          <p className="fun-fact-text">
            💡 <strong>Fun Fact:</strong> You've discovered the secret 404 dimension!
            <br />
            Not many make it here... but sadly, there's nothing here 😅
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default NotFound;
