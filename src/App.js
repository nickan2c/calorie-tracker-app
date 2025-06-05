import { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig/firebaseConfig";
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import ChartsPage from "./Pages/ChartsPage";
import SettingsPage from "./Pages/SettingsPage";
import EntryPage from "./Pages/EntryPage";
import AppleHealthImport from "./Pages/AppleHealthImport";
import Login from './components/common/Login';
import NavBar from "./components/NavBar";
import "./App.css";

const DEFAULT_TDEE = 2600;
const DEFAULT_GOAL_INTAKE = 2070;
const DEFAULT_GOAL_LOSS = 0.8; // kg per week
const DEFAULT_GOAL_STEPS = 10000; // steps per day
const DEFAULT_GOAL_PROTEIN = 180; // actually use 2x bw
const DEFAULT_REASON_WHY = "To become the best version of myself";


function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({
    tdee: DEFAULT_TDEE,
    goalIntake: DEFAULT_GOAL_INTAKE,
    weightLossGoalPerWeek: DEFAULT_GOAL_LOSS,
    goalSteps: DEFAULT_GOAL_STEPS,
    goalProtein: DEFAULT_GOAL_PROTEIN,
    reasonWhy: DEFAULT_REASON_WHY
  });
  const { currentUser } = useAuth();

  const fetchEntries = async () => {
    if (!currentUser) return;

    try {
      const entriesRef = collection(db, `users/${currentUser.uid}/healthData`);
      const q = query(entriesRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(entriesData);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const fetchSettings = async () => {
    if (!currentUser) return;

    try {
      const settingsRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setSettings({
          tdee: userData.tdee || DEFAULT_TDEE,
          goalIntake: userData.goalIntake || DEFAULT_GOAL_INTAKE,
          weightLossGoalPerWeek: userData.weightLossGoalPerWeek || DEFAULT_GOAL_LOSS,
          goalSteps: userData.goalSteps || DEFAULT_GOAL_STEPS,
          goalProtein: userData.goalProtein || DEFAULT_GOAL_PROTEIN,
          reasonWhy: userData.reasonWhy || DEFAULT_REASON_WHY
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, "users", currentUser.uid), newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const handleReasonWhyUpdate = async (newReasonWhy) => {
    if (!currentUser) return;

    try {
      const updatedSettings = { ...settings, reasonWhy: newReasonWhy };
      await setDoc(doc(db, "users", currentUser.uid), updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating reason why:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchEntries();
      fetchSettings();
    }
  }, [currentUser]);

  return (
    <DarkModeProvider>
      <Router>
        <div className="App">
          <div className="app-header">
            <Link to="/" className="app-title-link">
              <h1 className="app-title">Calorie Tracker</h1>
            </Link>
          </div>
          <NavBar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <EntryPage 
                  entries={entries}
                  fetchEntries={fetchEntries}
                  tdee={settings.tdee}
                  goalIntake={settings.goalIntake}
                  goalProtein={settings.goalProtein}
                  goalSteps={settings.goalSteps}
                  reasonWhy={settings.reasonWhy}
                  onReasonWhyUpdate={handleReasonWhyUpdate}
                />
              </ProtectedRoute>
            } />
            <Route path="/charts" element={
              <ProtectedRoute>
                <ChartsPage 
                  entries={entries} 
                  weightLossGoalPerWeek={settings.weightLossGoalPerWeek} 
                  goalIntake={settings.goalIntake}
                  goalSteps={settings.goalSteps}
                  goalProtein={settings.goalProtein}
                  tdee={settings.tdee}
                />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage 
                  settings={settings}
                  onSave={handleSettingsUpdate}
                />
              </ProtectedRoute>
            } />
            <Route path="/apple-health" element={
              <ProtectedRoute>
                <AppleHealthImport />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;