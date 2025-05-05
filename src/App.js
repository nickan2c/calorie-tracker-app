import { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import ChartsPage from "./ChartsPage";
import SettingsPage from "./SettingsPage";
import EntryPage from "./EntryPage";
import "./App.css";

const LOCAL_KEY = "calorie-tracker-data";
const todays_date = new Date();
const DEFAULTFORMVALUES = {
  date: `${todays_date.getDate()}/${todays_date.getMonth() + 1}/${todays_date.getFullYear()}`,
  weight: 84,
  intake: 2000,
  protein: 150,
  steps: 10000,
  cardio: 300,
  exercise1: "Running",
  exercise2: "Cycling",
  notes: "Felt great today!",
  deficit: 500,
};
const DEFAULT_TDEE = "2700";
const DEFAULT_GOAL_INTAKE = "2200";

function NavBar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/settings">Settings</Link></li>
        <li><Link to="/charts">Charts</Link></li>
      </ul>
    </nav>
  );
}

function App() {
  const [entries, setEntries] = useState([]);
  const [tdee, setTdee] = useState(localStorage.getItem("tdee") || DEFAULT_TDEE);
  const [goalIntake, setGoalIntake] = useState(localStorage.getItem("goalIntake") || DEFAULT_GOAL_INTAKE);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      setEntries(JSON.parse(stored));
    } else {
      // If no entries exist in localStorage, initialize with the default entry
      setEntries([DEFAULTFORMVALUES]);
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
    }
  }, [entries]);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<EntryPage entries={entries} setEntries={setEntries} tdee={tdee} goalIntake={goalIntake} />} />
        <Route path="/settings" element={<SettingsPage tdee={tdee} setTdee={setTdee} goalIntake={goalIntake} setGoalIntake={setGoalIntake} />} />
        <Route path="/charts" element={<ChartsPage entries={entries} />} />
      </Routes>
    </Router>
  );
}

export default App;
