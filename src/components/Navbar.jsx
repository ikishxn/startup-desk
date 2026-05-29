import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;  
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled(Link)`
  font-size: 2.2rem;
  font-weight: bold;
  color:black;
  text-decoration: none;
`;

const NavLinks = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isopen'].includes(prop),
})`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    display: ${props => (props.isopen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background-color: ${props => props.theme.background};
    padding: 0.5rem;
    box-shadow: 0 2px 4px ${props => props.theme.shadow};
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.text};
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  font-size: 1.2rem;


  &:hover {
    color: ${props => props.theme.primary};
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: ${props => props.theme.text};
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.primary};
    background: none;
    transform: scale(1.1);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: ${props => props.theme.text};

  @media (max-width: 768px) {
    display: block;
  }

  &:hover {
    color: ${props => props.theme.primary};
    background: none;
    transform: none;
  }
`;

const AuthButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <NavContainer>
      <Logo to="/">STARTUP DESK</Logo>
      
      <MobileMenuButton onClick={toggleMenu}>
        {isMenuOpen ? '✕' : '☰'}
      </MobileMenuButton>
      
      <NavLinks isopen={isMenuOpen}>
        <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
        <NavLink to="/submit" onClick={() => setIsMenuOpen(false)}>Submit Idea</NavLink>
        <NavLink to="/discover" onClick={() => setIsMenuOpen(false)}>Discover Ideas</NavLink>
        <NavLink to="/funding" onClick={() => setIsMenuOpen(false)}>Funding</NavLink>
        <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</NavLink>
        
        {currentUser?.isAdmin && (
          <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</NavLink>
        )}
        
        {currentUser ? (
          <>
            <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
            <AuthButton onClick={handleLogout}>Logout</AuthButton>
          </>
        ) : (
          <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login / Signup</NavLink>
        )}
        
        <ThemeToggle onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </NavLinks>
    </NavContainer>
  );
};

export default Navbar;