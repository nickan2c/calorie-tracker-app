import { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig/firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';

import ChartsPage from "./Pages/ChartsPage";
import SettingsPage from "./Pages/SettingsPage";
import EntryPage from "./Pages/EntryPage";
import NavBar from "./components/NavBar";
import "./App.css";

const DEFAULT_TDEE = "2600";
const DEFAULT_GOAL_INTAKE = "2070";
const DEFAULT_GOAL_LOSS = "0.8"; // kg per week
const DEFAULT_GOAL_STEPS = "10000"; // steps per day
const DEFAULT_GOAL_PROTEIN = "180"; // actually use 2x bw
// TODO add height weight and use it to calc steps kcal burnt

function App() {
  const [entries, setEntries] = useState([]);
  const [tdee, setTdee] = useState(DEFAULT_TDEE);
  const [goalIntake, setGoalIntake] = useState(DEFAULT_GOAL_INTAKE);
  const [goalSteps, setgoalSteps] = useState(DEFAULT_GOAL_STEPS);
  const [goalProtein, setGoalProtein] = useState(entries.length > 0 ? 2 *  entries[0].weight : DEFAULT_GOAL_PROTEIN); // Default to 2x body weight if available

  const [weightLossGoalPerWeek, setWeightLossGoalPerWeek] = useState(DEFAULT_GOAL_LOSS);

  const fetchSettings = async () => {
    try {
      const settingsRef = doc(db, "settings", "userSettings");
      const settingsDoc = await getDoc(settingsRef);
      if (settingsDoc.exists()) {
        const settingsData = settingsDoc.data();
        console.log("Settings fetched:", settingsData);
        setTdee(settingsData.tdee || DEFAULT_TDEE);
        setGoalIntake(settingsData.goalIntake || DEFAULT_GOAL_INTAKE);
        setGoalProtein(settingsData.goalProtein || DEFAULT_GOAL_PROTEIN);
        setgoalSteps(settingsData.goalSteps || DEFAULT_GOAL_STEPS);
        setWeightLossGoalPerWeek(settingsData.weightLossGoalPerWeek || DEFAULT_GOAL_LOSS);
      } else {
        console.log("No settings found, using defaults.");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }

  const fetchEntries = async () => {
    try {
      const entriesRef = collection(db, "entries");
      const q = query(entriesRef, orderBy("date", "desc")); 
          
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  // Load entries from Firebase only once on component mount
  useEffect(() => {
    fetchEntries();
    fetchSettings();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<EntryPage 
          entries={entries} 
          fetchEntries={fetchEntries} 
          tdee={tdee} 
          goalIntake={goalIntake} 
          goalSteps={goalSteps}
          goalProtein={goalProtein}
        />} />
        <Route path="/settings" element={<SettingsPage 
          tdee={tdee} 
          setTdee={setTdee} 
          goalIntake={goalIntake} 
          setGoalIntake={setGoalIntake} 
          goalSteps={goalSteps}
          setgoalSteps={setgoalSteps}
          goalProtein={goalProtein}
          setGoalProtein={setGoalProtein}
          weightLossGoalPerWeek={weightLossGoalPerWeek} 
          setWeightLossGoalPerWeek={setWeightLossGoalPerWeek} 
        />} />
        <Route path="/charts" element={<ChartsPage 
          entries={entries} 
          weightLossGoalPerWeek={weightLossGoalPerWeek}
          weight={entries.length > 0 ? entries[0].weight : null}
        />} />
      </Routes>
    </Router>
  );
}

export default App;