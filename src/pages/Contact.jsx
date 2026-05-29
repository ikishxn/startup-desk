import { useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const ContactContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${props => props.theme.card};
  border-radius: 12px;
  box-shadow: 0 4px 6px ${props => props.theme.shadow};

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    margin: 0.5rem;
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  text-align: center;
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
  font-size: 2rem;
`;

const PageDescription = styled.p`
  text-align: center;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: ${props => props.theme.text};
  font-size: 1rem;
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const SubmitButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: ${props => props.theme.border};
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Add contact form data to Firestore
      const contactData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new'
      };
      
      await addDoc(collection(db, 'contactSubmissions'), contactData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContactContainer>
      <PageTitle>Contact Us</PageTitle>
      <PageDescription>
        Have questions, feedback, or suggestions? We'd love to hear from you!
      </PageDescription>

      {submitStatus === 'success' && (
        <SuccessMessage>
          Thank you for your message! We'll get back to you soon.
        </SuccessMessage>
      )}

      {submitStatus === 'error' && (
        <ErrorMessage>
          There was an error submitting your message. Please try again.
        </ErrorMessage>
      )}

      <ContactForm onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel htmlFor="name">Your Name *</FormLabel>
          <FormInput
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter your full name"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="email">Email Address *</FormLabel>
          <FormInput
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="your.email@example.com"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="subject">Subject *</FormLabel>
          <FormInput
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            placeholder="What's this about?"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="message">Message *</FormLabel>
          <FormTextarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            placeholder="Tell us more about your inquiry..."
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </SubmitButton>
      </ContactForm>
    </ContactContainer>
  );
};

export default Contact;