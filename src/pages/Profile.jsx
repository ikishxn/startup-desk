import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${props => props.theme.card};
  border-radius: 12px;
  box-shadow: 0 4px 6px ${props => props.theme.shadow};
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${props => props.theme.primary};
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme.text};
  font-size: 2rem;
`;

const UserEmail = styled.p`
  margin: 0;
  color: ${props => props.theme.textSecondary};
  font-size: 1.1rem;
`;

const EditButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

const ProfileSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.theme.background};
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const InfoValue = styled.span`
  color: ${props => props.theme.textSecondary};
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 1rem;

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
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SaveButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

const CancelButton = styled.button`
  background-color: ${props => props.theme.card};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.theme.background};
  }
`;

const PhotoUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  padding: 1.5rem;
  background-color: ${props => props.theme.background};
  border-radius: 12px;
  border: 2px dashed ${props => props.theme.border};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
  }
`;

const AvatarPreview = styled.div`
  position: relative;
  display: inline-block;
`;

const AvatarEditOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const UploadIcon = styled.div`
  color: white;
  font-size: 1.5rem;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

const PhotoUrlInput = styled(FormInput)`
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const UploadProgress = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${props => props.theme.border};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const UploadProgressBar = styled.div`
  height: 100%;
  background-color: ${props => props.theme.primary};
  width: ${props => props.progress || 0}%;
  transition: width 0.3s ease;
`;

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    photoURL: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = doc(db, 'users', currentUser.uid);
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserData(data);
            setFormData({
              displayName: data.displayName || '',
              bio: data.bio || '',
              photoURL: data.photoURL || ''
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser?.uid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentUser) {
      try {
        const userDoc = doc(db, 'users', currentUser.uid);
        await updateDoc(userDoc, formData);
        
        setUserData(prev => ({
          ...prev,
          ...formData
        }));
        
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: userData?.displayName || '',
      bio: userData?.bio || '',
      photoURL: userData?.photoURL || ''
    });
    setIsEditing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}/${file.name}`);
      
      // Upload the file
      const uploadTask = uploadBytes(storageRef, file);
      
      // Simulate upload progress (Firebase doesn't provide progress for uploadBytes)
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 90) clearInterval(progressInterval);
      }, 100);

      await uploadTask;
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update form data with the new URL
      setFormData(prev => ({
        ...prev,
        photoURL: downloadURL
      }));

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAvatarClick = () => {
    document.getElementById('photo-upload').click();
  };

  if (loading) {
    return <ProfileContainer>Loading profile...</ProfileContainer>;
  }

  if (!userData) {
    return <ProfileContainer>User not found.</ProfileContainer>;
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar 
          src={userData?.photoURL || '/default-avatar.png'} 
          alt={userData?.displayName || 'User'} 
        />
        <UserInfo>
          <UserName>{userData?.displayName || currentUser.email}</UserName>
          <UserEmail>{currentUser.email}</UserEmail>
        </UserInfo>
        {!isEditing && (
          <EditButton onClick={() => setIsEditing(true)}>
            Edit Profile
          </EditButton>
        )}
      </ProfileHeader>

      {isEditing ? (
        <EditForm onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Display Name</FormLabel>
            <FormInput
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="Enter your display name"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Bio</FormLabel>
            <FormTextarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel> Profession</FormLabel>
            <FormTextarea
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              placeholder="Tell us about your profession"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Contact</FormLabel>
            <FormTextarea
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Contact/Email"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Profile Photo</FormLabel>
            <PhotoUploadSection>
              <AvatarPreview>
                <Avatar 
                  src={formData.photoURL || '/default-avatar.png'} 
                  alt="Profile Preview" 
                  style={{ width: '80px', height: '80px', cursor: 'pointer' }}
                  onClick={handleAvatarClick}
                />
                <AvatarEditOverlay onClick={handleAvatarClick}>
                  <UploadIcon>📷</UploadIcon>
                </AvatarEditOverlay>
              </AvatarPreview>
              
              <div style={{ textAlign: 'center' }}>
                <UploadButton type="button" onClick={handleAvatarClick}>
                  Choose Photo
                </UploadButton>
                <FileInput
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                
                {uploading && (
                  <UploadProgress>
                    <UploadProgressBar progress={uploadProgress} />
                  </UploadProgress>
                )}
                
                <PhotoUrlInput
                  type="url"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleInputChange}
                  placeholder="Or paste image URL here"
                />
              </div>
            </PhotoUploadSection>
          </FormGroup>

          <ButtonGroup>
            <SaveButton type="submit">Save Changes</SaveButton>
            <CancelButton type="button" onClick={handleCancel}>
              Cancel
            </CancelButton>
          </ButtonGroup>
        </EditForm>
      ) : (
        <>
          <ProfileSection>
            <SectionTitle>About</SectionTitle>
            <InfoItem>
              <InfoLabel>Bio</InfoLabel>
              <InfoValue>{userData?.bio || 'No bio added yet'}</InfoValue>
            </InfoItem>
          </ProfileSection>

          <ProfileSection>
            <SectionTitle>Account Information</SectionTitle>
            <InfoItem>
              <InfoLabel>Member Since</InfoLabel>
              <InfoValue>
                {currentUser.metadata?.creationTime 
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                  : 'Unknown'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>User ID</InfoLabel>
              <InfoValue>{currentUser.uid}</InfoValue>
            </InfoItem>
          </ProfileSection>
        </>
      )}
    </ProfileContainer>
  );
};

export default Profile;