import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubmitIdea from './pages/SubmitIdea';
import IdeaDetail from './pages/IdeaDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Funding from './pages/Funding';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Discover from './pages/DiscoverIdea';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Footer = styled.footer`
  text-align: center;
  padding: 2rem;
  margin-top: 2rem;
  background-color: ${props => props.theme.card};
  color: ${props => props.theme.textSecondary};
`;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContainer>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/submit" element={<SubmitIdea />} />
              <Route path="/idea/:id" element={<IdeaDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/funding" element={<Funding />} />
              <Route path="/profile/" element={<Profile />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
            </Routes>
            <Footer>
              <p>© {new Date().getFullYear()} Campus Startup Idea Showcase. All rights reserved.</p>
            </Footer>
          </AppContainer>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
