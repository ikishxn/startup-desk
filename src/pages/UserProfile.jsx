import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import styled from 'styled-components';

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

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data());
        } else {
          console.log('No such user!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <ProfileContainer>Loading profile...</ProfileContainer>;
  }

  if (!userData) {
    return <ProfileContainer>User not found.</ProfileContainer>;
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar src={userData.photoURL || '/default-avatar.png'} alt={userData.displayName || userData.name} />
        <UserInfo>
          <UserName>{userData.displayName || userData.name || 'User'}</UserName>
          <UserEmail>{userData.email}</UserEmail>
        </UserInfo>
      </ProfileHeader>

      <ProfileSection>
        <SectionTitle>About</SectionTitle>
        <InfoItem>
          <InfoLabel>Bio</InfoLabel>
          <InfoValue>{userData?.bio || 'No bio added yet'}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Profession</InfoLabel>
          <InfoValue>{userData?.profession || 'Not specified'}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Looking For</InfoLabel>
          <InfoValue>{userData?.lookingFor || 'Not specified'}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Contact</InfoLabel>
          <InfoValue>{userData?.contact || 'Not specified'}</InfoValue>
        </InfoItem>
    
        
      </ProfileSection>

      <ProfileSection>
        <SectionTitle>Account Information</SectionTitle>
        <InfoItem>
          <InfoLabel>Member Since</InfoLabel>
          <InfoValue>
            {userData.createdAt
              ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
              : 'Unknown'}
          </InfoValue>
        </InfoItem>
      </ProfileSection>
    </ProfileContainer>
  );
};

export default UserProfile;
