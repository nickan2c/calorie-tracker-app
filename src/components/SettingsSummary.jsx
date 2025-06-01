import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SettingsSummary.css';

function SettingsSummary({ tdee, goalIntake, goalProtein, goalSteps }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const calorieDeficit = tdee - goalIntake;
  const weeklyDeficit = calorieDeficit * 7;
  const estimatedWeeklyLoss = (weeklyDeficit / 7700).toFixed(2); // 7700 kcal = 1kg of fat

  return (
    <div className={`settings-summary ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="settings-header" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
        <h2>Your Goals & Settings</h2>
        <div className="header-buttons">
          <button 
            className="toggle-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '🔽' : '▶️'}
          </button>
          <Link 
            to="/settings" 
            className="edit-settings-btn"
            onClick={(e) => e.stopPropagation()}
          >
            Edit Settings
          </Link>
        </div>
      </div>
      
      <div className="settings-grid">
        <div className="setting-card">
          <div className="setting-icon">🔥</div>
          <h3>TDEE</h3>
          <p className="setting-value">{tdee}</p>
          <p className="setting-label">kcal/day</p>
        </div>

        <div className="setting-card">
          <div className="setting-icon">🍽️</div>
          <h3>Goal Intake</h3>
          <p className="setting-value">{goalIntake}</p>
          <p className="setting-label">kcal/day</p>
        </div>

        <div className="setting-card">
          <div className="setting-icon">📉</div>
          <h3>Daily Deficit</h3>
          <p className="setting-value">{calorieDeficit}</p>
          <p className="setting-label">kcal/day</p>
        </div>

        <div className="setting-card">
          <div className="setting-icon">⚖️</div>
          <h3>Expected Loss</h3>
          <p className="setting-value">{estimatedWeeklyLoss}</p>
          <p className="setting-label">kg/week</p>
        </div>

        <div className="setting-card">
          <div className="setting-icon">🥩</div>
          <h3>Protein Goal</h3>
          <p className="setting-value">{goalProtein}</p>
          <p className="setting-label">g/day</p>
        </div>

        <div className="setting-card">
          <div className="setting-icon">👣</div>
          <h3>Steps Goal</h3>
          <p className="setting-value">{goalSteps.toLocaleString()}</p>
          <p className="setting-label">steps/day</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsSummary; 