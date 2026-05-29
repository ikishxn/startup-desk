import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: ${props => props.theme.text};
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  &:hover {
    color: ${props => props.theme.primary};
    background: none;
    transform: scale(1.1);
  }
`;

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleButton onClick={toggleTheme} aria-label="Toggle theme">
      {isDarkMode ? '☀️' : '🌙'}
    </ToggleButton>
  );
};

export default ThemeToggle;