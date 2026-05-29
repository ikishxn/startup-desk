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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signup, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword } = formData;
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Register the user
      const userCredential = await signup(email, password, name);
      
      // User profile is already updated in the signup function
      
      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create an account. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <PageTitle>Create an Account</PageTitle>
      
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <FormGroup>
          <Label htmlFor="name">Full Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password (min. 6 characters)"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </Button>
      </Form>
      
      <AuthLink>
        Already have an account? <Link to="/login">Login here</Link>
      </AuthLink>
    </AuthContainer>
  );
};

export default Register;