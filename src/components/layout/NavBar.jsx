import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebaseConfig/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import DarkModeToggle from './DarkModeToggle';
import './NavBar.css';

function NavBar() {
  const { isAuthenticated, currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().username) {
            setUsername(docSnap.data().username);
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    };
    fetchUsername();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Calorie Tracker</Link>
      </div>
      
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/charts">Charts</Link>
            <Link to="/apple-health">Apple Health</Link>
            <Link to="/settings">Settings</Link>
            <DarkModeToggle />
            <div className="user-menu">
              <span className="user-email">
                {username || 'User'}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <DarkModeToggle />
            <Link to="/login" className="login-link">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar; 