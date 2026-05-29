import { createContext, useContext, useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

// Define theme colors
export const lightTheme = {
  background: '#ffffffff',
  text: '#000000ff',
  primary: '#007BFF',
  accent: '#FF8C42',
  card: '#F8F9FA',
  border: '#E1E1E1',
  shadow: 'rgba(0, 0, 0, 0.1)'
};

export const darkTheme = {
  background: '#121212',
  text: '#E1E1E1',
  primary: '#007BFF',
  accent: '#FF8C42',
  border: '#333333',
  shadow: 'rgba(255, 255, 255, 0.05)'
};

// Create theme context
const ThemeContext = createContext();

// Global styles that will change based on theme
export const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: all 0.3s ease-in-out;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', 'Roboto', sans-serif;
  }

  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
  }

  button {
    background-color: ${props => props.theme.primary};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    
    &:hover {
      background-color: #0056b3;
      transform: scale(1.05);
    }
  }

  .card {
    background-color: ${props => props.theme.card};
    border: 1px solid ${props => props.theme.border};
    border-radius: 8px;
    box-shadow: 0 4px 6px ${props => props.theme.shadow};
    transition: all 0.3s ease-in-out;
    
    &:hover {
      transform: scale(1.03);
    }
  }
`;

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if user has a saved theme preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Update theme in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Current theme based on mode
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <GlobalStyles theme={theme} />
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};