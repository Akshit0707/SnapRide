import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('appTheme');
    return savedTheme ? savedTheme : 'dark';
  });

  // Effect to save the current theme to localStorage AND update body class
  useEffect(() => {
    localStorage.setItem('appTheme', theme);

    // --- FIX STARTS HERE ---
    // Update body background color
    document.body.style.backgroundColor = theme === 'dark' ? '#0A0A0A' : '#F8F8F8';
    document.body.style.transition = 'background-color 0.3s ease-in-out';
    document.body.style.minHeight = '100vh'; // Ensure body covers full viewport height

    // Update body class for SCSS/CSS targeting
    document.body.classList.remove('dark-theme', 'light-theme'); // Remove existing
    document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme'); // Add new
    // --- FIX ENDS HERE ---

  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);