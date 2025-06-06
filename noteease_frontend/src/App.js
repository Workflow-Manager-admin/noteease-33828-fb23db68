import React, { useState, useEffect, createContext } from 'react';
import './App.css';
import NoteEaseMain from './NoteEaseMain';

// Theme context to allow access everywhere if needed
export const ThemeContext = createContext();

/**
 * PUBLIC_INTERFACE
 * App root with theme support and context
 */
function App() {
  // Try to detect system preference at first load, fallback to light
  const getInitialTheme = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <NoteEaseMain theme={theme} toggleTheme={toggleTheme} />
    </ThemeContext.Provider>
  );
}

export default App;