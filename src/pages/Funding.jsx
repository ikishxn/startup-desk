import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const FundingContainer = styled.div`
  max-width: 800px;
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

const FundingForm = styled.form`
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

  &:disabled {
    background-color: ${props => props.theme.border};
    cursor: not-allowed;
  }
`;

const FormSelect = styled.select`
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

const LoadingMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.textSecondary};
  padding: 2rem;
  font-size: 1.1rem;
`;

const CurrencyContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CurrencySelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 1rem;
  width: 100px;
`;

const Funding = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    startupName: '',
    fundingGoal: '',
    currency: '₹',
    pitchDescription: '',
    purpose: '',
    contactEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [userIdeas, setUserIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);

  // Fetch user's ideas to populate the startup name dropdown
  useEffect(() => {
    const fetchUserIdeas = async () => {
      if (currentUser) {
        try {
          const ideasQuery = query(
            collection(db, 'ideas'),
            where('userId', '==', currentUser.uid)
          );
          const ideasSnapshot = await getDocs(ideasQuery);
          const ideasList = ideasSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserIdeas(ideasList);
        } catch (error) {
          console.error('Error fetching user ideas:', error);
        } finally {
          setLoadingIdeas(false);
        }
      } else {
        setLoadingIdeas(false);
      }
    };

    fetchUserIdeas();
  }, [currentUser]);

  // Set default contact email when user is logged in
  useEffect(() => {
    if (currentUser?.email) {
      setFormData(prev => ({
        ...prev,
        contactEmail: currentUser.email
      }));
    }
  }, [currentUser]);

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
      // Prepare data for Firestore
      const fundingData = {
        ...formData,
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Add to Firestore
      await addDoc(collection(db, 'fundingRequests'), fundingData);
      
      setSubmitStatus('success');
      setFormData({
        startupName: '',
        fundingGoal: '',
        currency: '₹',
        pitchDescription: '',
        purpose: '',
        contactEmail: currentUser?.email || ''
      });
    } catch (error) {
      console.error('Error submitting funding request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingIdeas) {
    return <LoadingMessage>Loading your ideas...</LoadingMessage>;
  }

  if (!currentUser) {
    return (
      <FundingContainer>
        <PageTitle>Funding</PageTitle>
        <PageDescription>
          Please login to submit a funding request for your startup idea.
        </PageDescription>
      </FundingContainer>
    );
  }

  return (
    <FundingContainer>
      <PageTitle>Seek Funding for Your Startup</PageTitle>
      <PageDescription>
        Connect with potential investors and secure funding for your innovative idea!
      </PageDescription>

      {submitStatus === 'success' && (
        <SuccessMessage>
          Thank you for your funding request! We'll review it and get back to you soon.
        </SuccessMessage>
      )}

      {submitStatus === 'error' && (
        <ErrorMessage>
          There was an error submitting your funding request. Please try again.
        </ErrorMessage>
      )}

      <FundingForm onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel htmlFor="startupName">Startup / Idea Name *</FormLabel>
          <FormSelect
            id="startupName"
            name="startupName"
            value={formData.startupName}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your startup/idea</option>
            {userIdeas.map(idea => (
              <option key={idea.id} value={idea.title}>
                {idea.title}
              </option>
            ))}
            <option value="other">Other (not listed)</option>
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="fundingGoal">Funding Goal *</FormLabel>
          <CurrencyContainer>
            <CurrencySelect
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
            >
              <option value="₹">₹ (INR)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
            </CurrencySelect>
            <FormInput
              type="number"
              id="fundingGoal"
              name="fundingGoal"
              value={formData.fundingGoal}
              onChange={handleInputChange}
              required
              placeholder="Enter target amount"
              min="1"
            />
          </CurrencyContainer>
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="pitchDescription">Pitch Description *</FormLabel>
          <FormTextarea
            id="pitchDescription"
            name="pitchDescription"
            value={formData.pitchDescription}
            onChange={handleInputChange}
            required
            placeholder="Describe your business idea, market opportunity, and why investors should be interested..."
            rows="4"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="purpose">Purpose of Funding *</FormLabel>
          <FormTextarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            required
            placeholder="How will you use the funding? (e.g., product development, marketing, team expansion, equipment, etc.)"
            rows="3"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="contactEmail">Contact Email for Investors *</FormLabel>
          <FormInput
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            required
            placeholder="investor.contact@example.com"
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Funding Request'}
        </SubmitButton>
      </FundingForm>
    </FundingContainer>
  );
};

export default Funding;