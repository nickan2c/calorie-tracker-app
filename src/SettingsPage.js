import { useState } from "react";

function SettingsPage({ tdee, setTdee, goalIntake, setGoalIntake }) {
  const [newTdee, setNewTdee] = useState(tdee || "");
  const [newGoalIntake, setNewGoalIntake] = useState(goalIntake || "");

  const handleTdeeChange = (e) => setNewTdee(e.target.value);
  const handleGoalIntakeChange = (e) => setNewGoalIntake(e.target.value);

  const saveSettings = () => {
    setTdee(newTdee);
    setGoalIntake(newGoalIntake);
    localStorage.setItem("tdee", newTdee);
    localStorage.setItem("goalIntake", newGoalIntake);
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <label>
        TDEE:
        <input
          type="number"
          value={newTdee}
          onChange={handleTdeeChange}
          placeholder="Enter your TDEE"
        />
      </label>
      <label>
        Goal Calories Burnt:
        <input
          type="number"
          value={newGoalIntake}
          onChange={handleGoalIntakeChange}
          placeholder="Enter your goal for calories burnt"
        />
      </label>
      <button onClick={saveSettings}>Save</button>
    </div>
  );
}

export default SettingsPage;
