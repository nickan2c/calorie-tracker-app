import { useState } from "react";
import { Link } from 'react-router-dom';

function SettingsPage({ tdee, setTdee, goalIntake, setGoalIntake, weightLossGoalPerWeek, setWeightLossGoalPerWeek }) {
    const [newTdee, setNewTdee] = useState(tdee || "");
    const [newGoalIntake, setNewGoalIntake] = useState(goalIntake || "");
    const [newWeightLossGoalPerWeek, setNewWeightLossGoalPerWeek] = useState(weightLossGoalPerWeek || "");

    const handleTdeeChange = (e) => setNewTdee(e.target.value);
    const handleGoalIntakeChange = (e) => setNewGoalIntake(e.target.value);

    const handleWeightLossGoalChange = (e) => setNewWeightLossGoalPerWeek(e.target.value);
    const saveSettings = () => {
        setTdee(newTdee);
        setGoalIntake(newGoalIntake);
        setWeightLossGoalPerWeek(newWeightLossGoalPerWeek);
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
        <label>
            Weight Loss Goal (kg/week):
            <input
            type="number"
            value={newWeightLossGoalPerWeek}
            onChange={handleWeightLossGoalChange}
            placeholder="Enter your weight loss goal per week"
            />
        </label>

      <button onClick={saveSettings}>Save</button>
      <Link to="/">Back to Home</Link>

    </div>

  );
}

export default SettingsPage;
