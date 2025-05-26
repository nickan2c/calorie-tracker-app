import { useState } from "react";
import '../style/SettingsPage.css';
import { Link } from "react-router-dom";

function SettingsPage({ 
  tdee, 
  setTdee, 
  goalIntake, 
  setGoalIntake, 
  goalProtein, 
  setGoalProtein,
  goalSteps, 
  setgoalSteps,
  weightLossGoalPerWeek, 
  setWeightLossGoalPerWeek 
}) {
  const [newTdee, setNewTdee] = useState(tdee || "");
  const [newGoalIntake, setNewGoalIntake] = useState(goalIntake || "");
  const [newGoalProtein, setNewGoalProtein] = useState(goalProtein || "");
  const [newGoalSteps, setNewGoalSteps] = useState(goalSteps || "");
  const [newWeightLossGoalPerWeek, setNewWeightLossGoalPerWeek] = useState(weightLossGoalPerWeek || "");
  const [saved, setSaved] = useState(false);

  const handleTdeeChange = (e) => setNewTdee(e.target.value);
  const handleGoalIntakeChange = (e) => setNewGoalIntake(e.target.value);
  const handleGoalProteinChange = (e) => setNewGoalProtein(e.target.value);
  const handleGoalStepsChange = (e) => setNewGoalSteps(e.target.value);
  const handleWeightLossGoalChange = (e) => setNewWeightLossGoalPerWeek(e.target.value);
  
  const saveSettings = () => {
    setTdee(newTdee);
    setGoalIntake(newGoalIntake);
    setGoalProtein(newGoalProtein);
    setgoalSteps(newGoalSteps);
    setWeightLossGoalPerWeek(newWeightLossGoalPerWeek);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        {/* Header */}
        <div className="settings-header">
        <Link to="/"  className="back-button"><span className="back-arrow">←</span>
        Back to Home</Link>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your health and fitness goals</p>
        </div>

        {/* Settings Card */}
        <div className="settings-card">
          <div className="settings-form">
            
            {/* TDEE Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon activity-icon">
                  <span>⚡</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">
                    Total Daily Energy Expenditure (TDEE)
                  </label>
                  <p className="setting-description">
                    Your estimated daily calorie burn including all activities
                  </p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={newTdee}
                  onChange={handleTdeeChange}
                  placeholder="e.g., 2500"
                  className="setting-input"
                />
                <span className="input-unit">calories/day</span>
              </div>
            </div>

            {/* Goal Calories Burnt Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon target-icon">
                  <span>🎯</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">
                    Goal Calories Burnt
                  </label>
                  <p className="setting-description">
                    Target calories to burn through exercise and activity
                  </p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={newGoalIntake}
                  onChange={handleGoalIntakeChange}
                  placeholder="e.g., 500"
                  className="setting-input"
                />
                <span className="input-unit">calories/day</span>
              </div>
            </div>

            {/* Goal Protein Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon protein-icon">
                  <span>🥩</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">
                    Daily Protein Goal
                  </label>
                  <p className="setting-description">
                    Target protein intake to support muscle growth and recovery
                  </p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={newGoalProtein}
                  onChange={handleGoalProteinChange}
                  placeholder="e.g., 150"
                  className="setting-input"
                />
                <span className="input-unit">grams/day</span>
              </div>
            </div>

            {/* Goal Steps Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon steps-icon">
                  <span>👟</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">
                    Daily Steps Goal
                  </label>
                  <p className="setting-description">
                    Target number of steps to maintain an active lifestyle
                  </p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={newGoalSteps}
                  onChange={handleGoalStepsChange}
                  placeholder="e.g., 10000"
                  className="setting-input"
                />
                <span className="input-unit">steps/day</span>
              </div>
            </div>

            {/* Weight Loss Goal Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon weight-icon">
                  <span>📉</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">
                    Weight Loss Goal
                  </label>
                  <p className="setting-description">
                    Target weight loss per week (0.5-1 kg recommended)
                  </p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  step="0.1"
                  value={newWeightLossGoalPerWeek}
                  onChange={handleWeightLossGoalChange}
                  placeholder="e.g., 0.5"
                  className="setting-input"
                />
                <span className="input-unit">kg/week</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="save-section">
            <button
              onClick={saveSettings}
              className={`save-button ${saved ? 'saved' : ''}`}
            >
              {saved ? (
                <>
                  <span className="save-icon">✓</span>
                  <span>Settings Saved!</span>
                </>
              ) : (
                <>
                  <span className="save-icon">💾</span>
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h3 className="tips-title">💡 Quick Tips</h3>
          <ul className="tips-list">
            <li>• Calculate your TDEE using online calculators or fitness apps</li>
            <li>• A safe weight loss rate is 0.5-1 kg per week</li>
            <li>• Aim for 1.6-2.2g of protein per kg of body weight</li>
            <li>• 10,000 steps per day is a great baseline for general health</li>
            <li>• 1 kg of fat equals approximately 7,700 calories</li>
            <li>• Adjust goals gradually as your fitness level improves</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;