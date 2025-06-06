import React, { useState, useEffect } from 'react';
import '../../styles/common/SuccessAnimation.css';

const SuccessAnimation = ({ isVisible, onComplete }) => {
  const [showTick, setShowTick] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Start tick animation after circle bounce
      const tickTimer = setTimeout(() => setShowTick(true), 400);
      // Show message after tick animation
      const messageTimer = setTimeout(() => setShowMessage(true), 800);
      // Auto-hide after total animation
      const hideTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);

      return () => {
        clearTimeout(tickTimer);
        clearTimeout(messageTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setShowTick(false);
      setShowMessage(false);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="success-overlay">
      <div className="success-container">
        <div className="success-circle">
          <svg 
            className={`checkmark ${showTick ? 'show' : ''}`}
            viewBox="0 0 52 52"
            width="60"
            height="60"
          >
            <path 
              className="checkmark-path"
              fill="none"
              stroke="#4ade80"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27l7.5 7.5L38 18"
            />
          </svg>
        </div>
        <div className={`success-message ${showMessage ? 'show' : ''}`}>
          <h3>Nice job sticking to your goals!</h3>
          <p>Keep up the great work! 🎉</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation; 