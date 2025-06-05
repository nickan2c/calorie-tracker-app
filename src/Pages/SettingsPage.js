import { useState, useEffect } from "react";
import '../styles/pages/SettingsPage.css';
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from '../firebaseConfig/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

function SettingsPage({ settings, onSave }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [newTdee, setNewTdee] = useState(settings?.tdee || "");
  const [newGoalIntake, setNewGoalIntake] = useState(settings?.goalIntake || "");
  const [newGoalProtein, setNewGoalProtein] = useState(settings?.goalProtein || "");
  const [newGoalSteps, setNewGoalSteps] = useState(settings?.goalSteps || "");
  const [newWeightLossGoalPerWeek, setNewWeightLossGoalPerWeek] = useState(settings?.weightLossGoalPerWeek || "");
  const [newReasonWhy, setNewReasonWhy] = useState(settings?.reasonWhy || "");
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setNewTdee(settings.tdee || "");
      setNewGoalIntake(settings.goalIntake || "");
      setNewGoalProtein(settings.goalProtein || "");
      setNewGoalSteps(settings.goalSteps || "");
      setNewWeightLossGoalPerWeek(settings.weightLossGoalPerWeek || "");
      setNewReasonWhy(settings.reasonWhy || "");
    }
  }, [settings]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().username) {
          setUsername(docSnap.data().username);
          setNewUsername(docSnap.data().username);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    fetchUsername();
  }, [currentUser]);

  const handleTdeeChange = (e) => setNewTdee(e.target.value);
  const handleGoalIntakeChange = (e) => setNewGoalIntake(e.target.value);
  const handleGoalProteinChange = (e) => setNewGoalProtein(e.target.value);
  const handleGoalStepsChange = (e) => setNewGoalSteps(e.target.value);
  const handleWeightLossGoalChange = (e) => setNewWeightLossGoalPerWeek(e.target.value);
  const handleUsernameChange = (e) => setNewUsername(e.target.value);
  const handleReasonWhyChange = (e) => setNewReasonWhy(e.target.value);
  
  const handleSave = async () => {
    try {
      // Save username separately
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, {
        username: newUsername
      }, { merge: true });
      
      // Use the onSave callback for settings
      const updatedSettings = {
        tdee: Number(newTdee),
        goalIntake: Number(newGoalIntake),
        goalProtein: Number(newGoalProtein),
        goalSteps: Number(newGoalSteps),
        weightLossGoalPerWeek: Number(newWeightLossGoalPerWeek),
        reasonWhy: newReasonWhy
      };
      
      await onSave(updatedSettings);
      setUsername(newUsername);
      
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage('Error saving settings. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setMessage('Error signing out. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const saveSettings = () => {
    handleSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        {/* Header */}
        <div className="settings-header">

          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your health and fitness goals</p>
        </div>
        
        {/* Settings Card */}
        <div className="settings-card">
          <div className="settings-form">
            {/* Dark Mode Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon theme-icon">
                  <span>{isDarkMode ? '🌙' : '☀️'}</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">Dark Mode</label>
                  <p className="setting-description">Toggle between light and dark theme</p>
                </div>
              </div>
              <div className="input-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Username Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon user-icon">
                  <span>👤</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">Username</label>
                  <p className="setting-description">Your display name in the app</p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="text"
                  value={newUsername}
                  onChange={handleUsernameChange}
                  placeholder="Enter username"
                  className="setting-input"
                />
              </div>
            </div>

            {/* TDEE Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon activity-icon">
                  <span>⚡</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">Total Daily Energy Expenditure (TDEE)</label>
                  <p className="setting-description">Your estimated daily calorie burn including all activities</p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={newTdee}
                  onChange={handleTdeeChange}
                  placeholder={"e.g. " + (settings?.tdee || "")}
                  className="setting-input"
                />
                <span className="input-unit">calories/day</span>
              </div>
            </div>

            {/* Goal Intake Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon target-icon">
                  <span>🎯</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">Goal Calorie Intake</label>
                  <p className="setting-description">Your target daily calorie intake</p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={newGoalIntake}
                  onChange={handleGoalIntakeChange}
                  placeholder={"e.g. " + (settings?.goalIntake || "")}
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
                  <label className="setting-label">Goal Protein Intake</label>
                  <p className="setting-description">Your target daily protein intake</p>
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
                  <span>👣</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">Goal Steps</label>
                  <p className="setting-description">Your target daily step count</p>
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
                  <span>⚖️</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">Weight Loss Goal</label>
                  <p className="setting-description">Your target weight loss per week</p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="number"
                  value={newWeightLossGoalPerWeek}
                  onChange={handleWeightLossGoalChange}
                  placeholder="e.g., 0.5"
                  className="setting-input"
                />
                <span className="input-unit">kg/week</span>
              </div>
            </div>

            {/* Reason Why Setting */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon reason-icon">
                  <span>🤔</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">Reason Why</label>
                  <p className="setting-description">Your reason for setting these goals</p>
                </div>
              </div>
              <div className="input-container">
                <input
                  type="text"
                  value={newReasonWhy}
                  onChange={handleReasonWhyChange}
                  placeholder="Enter your reason"
                  className="setting-input"
                />
              </div>
            </div>

            {/* Logout Button */}
            <div className="setting-group">
              <div className="setting-header">
                <div className="setting-icon logout-icon">
                  <span>🚪</span>
                </div>
                <div className="setting-info">
                  <label className="setting-label">Account</label>
                  <p className="setting-description">Sign out of your account</p>
                </div>
              </div>
              <div className="input-container">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="settings-actions">
              <button 
                className={`save-button ${saved ? 'saved' : ''}`} 
                onClick={saveSettings}
              >
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>

            <Link to="/" className="back-button">
            <span className="back-arrow">←</span>Back to Home
        </Link>
          </div>
        </div>


        {message && <div className="settings-message">{message}</div>}
      </div>
    </div>
  );
}

export default SettingsPage;