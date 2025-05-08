import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/NavBar.css"; 

function NavBar() {
  const navigate = useNavigate();
  
  return (
    <nav className="main-nav">
      <ul className="nav-list">
        <li className="nav-item">
          <button onClick={() => navigate('/')} className="nav-link">Home</button>
        </li>
        <li className="nav-item">
          <button onClick={() => navigate('/settings')} className="nav-link">Settings</button>
        </li>
        <li className="nav-item">
          <button onClick={() => navigate('/charts')} className="nav-link">Charts</button>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;