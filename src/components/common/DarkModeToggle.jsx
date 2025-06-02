import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import '../../styles/components/DarkModeToggle.css';

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button 
      onClick={toggleDarkMode}
      className="dark-mode-toggle"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
}

export default DarkModeToggle; 