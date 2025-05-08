import { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig/firebaseConfig";
import ChartsPage from "./Pages/ChartsPage";
import SettingsPage from "./Pages/SettingsPage";
import EntryPage from "./Pages/EntryPage";
import NavBar from "./components/NavBar";
import "./App.css";

const DEFAULT_TDEE = "2700";
const DEFAULT_GOAL_INTAKE = "2200";
const DEFAULT_GOAL_LOSS = "0.5"; // kg per week
// TODO add height weight and use it to calc steps kcal burnt

function App() {
  const [entries, setEntries] = useState([]);
  const [tdee, setTdee] = useState(DEFAULT_TDEE);
  const [goalIntake, setGoalIntake] = useState(DEFAULT_GOAL_INTAKE);
  const [weightLossGoalPerWeek, setWeightLossGoalPerWeek] = useState(DEFAULT_GOAL_LOSS);

  // todo move to util
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
        />} />
        <Route path="/settings" element={<SettingsPage 
          tdee={tdee} 
          setTdee={setTdee} 
          goalIntake={goalIntake} 
          setGoalIntake={setGoalIntake} 
          weightLossGoalPerWeek={weightLossGoalPerWeek} 
          setWeightLossGoalPerWeek={setWeightLossGoalPerWeek} 
        />} />
        <Route path="/charts" element={<ChartsPage 
          entries={entries} 
          weightLossGoalPerWeek={weightLossGoalPerWeek}
        />} />
      </Routes>
    </Router>
  );
}

export default App;