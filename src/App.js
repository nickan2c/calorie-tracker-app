import { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig/firebaseConfig";
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import ChartsPage from "./Pages/ChartsPage";
import SettingsPage from "./Pages/SettingsPage";
import EntryPage from "./Pages/EntryPage";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import "./App.css";

const DEFAULT_TDEE = "2600";
const DEFAULT_GOAL_INTAKE = "2070";
const DEFAULT_GOAL_LOSS = "0.8"; // kg per week
const DEFAULT_GOAL_STEPS = "10000"; // steps per day
const DEFAULT_GOAL_PROTEIN = "180"; // actually use 2x bw
// TODO add height weight and use it to calc steps kcal burnt

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
    tdee: 2000,
    goalIntake: 1500,
    goalProtein: 150,
    goalSteps: 10000
  });
  const [weightLossGoalPerWeek, setWeightLossGoalPerWeek] = useState(DEFAULT_GOAL_LOSS);
  const { currentUser } = useAuth();

  const fetchEntries = async () => {
    if (!currentUser) {
      setEntries([]);
      return;
    }

    try {
      const userEntriesRef = collection(db, "users", currentUser.uid, "entries");
      const querySnapshot = await getDocs(userEntriesRef);
      const entriesData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setEntries(entriesData);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const fetchSettings = async () => {
    if (!currentUser) {
      setSettings({
        tdee: 2000,
        goalIntake: 1500,
        goalProtein: 150,
        goalSteps: 10000
      });
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists() && docSnap.data().settings) {
        setSettings(docSnap.data().settings);
      } else {
        // If no settings exist, create default settings
        const defaultSettings = {
          tdee: 2000,
          goalIntake: 1500,
          goalProtein: 150,
          goalSteps: 10000
        };
        await setDoc(userDocRef, { settings: defaultSettings }, { merge: true });
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchSettings();
  }, [currentUser]);

  return (
    <Router>
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
              goalSteps={settings.goalSteps}
              goalProtein={settings.goalProtein}
            />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage 
              tdee={settings.tdee} 
              setTdee={(value) => setSettings({ ...settings, tdee: value })} 
              goalIntake={settings.goalIntake} 
              setGoalIntake={(value) => setSettings({ ...settings, goalIntake: value })} 
              goalSteps={settings.goalSteps}
              setgoalSteps={(value) => setSettings({ ...settings, goalSteps: value })}
              goalProtein={settings.goalProtein}
              setGoalProtein={(value) => setSettings({ ...settings, goalProtein: value })}
              weightLossGoalPerWeek={weightLossGoalPerWeek} 
              setWeightLossGoalPerWeek={(value) => setWeightLossGoalPerWeek(value)} 
            />
          </ProtectedRoute>
        } />
        <Route path="/charts" element={
          <ProtectedRoute>
            <ChartsPage 
              entries={entries} 
              weightLossGoalPerWeek={weightLossGoalPerWeek}
              weight={entries.length > 0 ? entries[0].weight : null}
            />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default AppWithAuth;