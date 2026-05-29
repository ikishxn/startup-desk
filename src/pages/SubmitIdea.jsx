import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { uploadToCloudinary } from '../cloudinary';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
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

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  resize: vertical;
  min-height: 150px;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const SubmitButton = styled.button`
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
    transform: scale(1.02);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  margin: 0;
`;

const SuccessMessage = styled.p`
  color: #2ecc71;
  margin: 0;
`;

const MediaPreview = styled.div`
  margin-top: 1rem;
  
  img, video {
    max-width: 100%;
    max-height: 300px;
    border-radius: 4px;
  }
`;

const categories = [
  'Technology',
  'Health & Wellness',
  'Education',
  'Environment',
  'Finance',
  'Social Impact',
  'Entertainment',
  'Food & Beverage',
  'Other'
];

const SubmitIdea = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMediaFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to submit an idea');
      return;
    }
    
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Upload media to Cloudinary if provided
      let mediaURL = '';
      if (mediaFile) {
        mediaURL = await uploadToCloudinary(mediaFile);
      }
      
      // Add idea to Firestore
      const ideaData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        mediaURL,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };
      
      const docRef = await addDoc(collection(db, 'ideas'), ideaData);
      
      setSuccess('Your idea has been submitted successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
      });
      setMediaFile(null);
      setMediaPreview('');
      
      // Redirect to the idea page after a short delay
      setTimeout(() => {
        navigate(`/idea/${docRef.id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting idea:', err);
      setError('Failed to submit idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <FormContainer>
      <PageTitle>Submit Your Startup Idea</PageTitle>
      
      {!currentUser && (
        <ErrorMessage>You must be logged in to submit an idea. <a href="/login">Login here</a></ErrorMessage>
      )}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title *</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a catchy title for your idea"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="category">Category *</Label>
          <Select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Description *</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your startup idea in detail..."
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="media">Image/Video (Optional)</Label>
          <Input
            type="file"
            id="media"
            name="media"
            accept="image/*,video/*"
            onChange={handleMediaChange}
          />
          {mediaPreview && (
            <MediaPreview>
              {mediaFile.type.startsWith('image/') ? (
                <img src={mediaPreview} alt="Preview" />
              ) : (
                <video src={mediaPreview} controls />
              )}
            </MediaPreview>
          )}
        </FormGroup>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <SubmitButton type="submit" disabled={loading || !currentUser}>
          {loading ? 'Submitting...' : 'Submit Idea'}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default SubmitIdea;