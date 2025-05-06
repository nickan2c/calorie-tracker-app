import { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy  } from "firebase/firestore";
import { db } from "./firebaseConfig/firebaseConfig";
import ChartsPage from "./ChartsPage";
import SettingsPage from "./SettingsPage";
import EntryPage from "./EntryPage";
import "./App.css";

const DEFAULT_TDEE = "2700";
const DEFAULT_GOAL_INTAKE = "2200";
// TODO add height weight and use it to calc steps kcal burnt

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
  const [tdee, setTdee] = useState( DEFAULT_TDEE);
  const [goalIntake, setGoalIntake] = useState(DEFAULT_GOAL_INTAKE);


  const fetchEntries = async () => {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, orderBy("date", "desc")); // or "asc" if you prefer
  
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => doc.data());
    setEntries(data);
  };

  // Load entries from Firebase
  useEffect(() => {
    fetchEntries();
  }, [entries]);


  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<EntryPage entries={entries} setEntries={setEntries} fetchEntries={fetchEntries} tdee={tdee} goalIntake={goalIntake} />} />
        <Route path="/settings" element={<SettingsPage tdee={tdee} setTdee={setTdee} goalIntake={goalIntake} setGoalIntake={setGoalIntake} />} />
        <Route path="/charts" element={<ChartsPage entries={entries} />} />
      </Routes>
    </Router>
  );
}

export default App;
