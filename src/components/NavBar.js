import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './common/DarkModeToggle';
import '../styles/components/NavBar.css';

function NavBar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/charts">Charts</Link>
              <Link to="/apple-health">Apple Health</Link>
              <Link to="/settings">Settings</Link>
              <DarkModeToggle />
            </>
          ) : (
            <>
              <DarkModeToggle />
              <Link to="/login" className="login-link">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;