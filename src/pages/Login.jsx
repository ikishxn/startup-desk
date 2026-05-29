import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const AuthContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: ${props => props.theme.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: ${props => props.theme.card};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px ${props => props.theme.shadow};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  text-align: center;
  margin: 0;
`;

const SuccessMessage = styled.p`
  color: #2ecc71;
  text-align: center;
  margin: 0;
`;

const AuthLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: ${props => props.theme.textSecondary};
  
  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ForgotPassword = styled.div`
  text-align: right;
  
  a {
    color: ${props => props.theme.textSecondary};
    font-size: 0.9rem;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
      color: ${props => props.theme.primary};
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      setSuccess('Login successful! Redirecting...');
      
      // Redirect after successful login
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <PageTitle>Login to Your Account</PageTitle>
      
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <ForgotPassword>
            <Link to="/forgot-password">Forgot password?</Link>
          </ForgotPassword>
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
      
      <AuthLink>
        Don't have an account? <Link to="/register">Register here</Link>
      </AuthLink>
    </AuthContainer>
  );
};

export default Login;