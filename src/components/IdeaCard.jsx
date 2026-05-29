import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const Card = styled.div`
  background-color: ${props => props.theme.card};
  border-radius: 8px;
  box-shadow: 0 4px 6px ${props => props.theme.shadow};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 12px ${props => props.theme.shadow};
  }
`;

const CardImage = styled.div`
  height: 180px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`;

const CardVideo = styled.video`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h3`
  margin: 0 0 0.5rem;
  color: ${props => props.theme.text};
  font-size: 1.2rem;
`;

const CardDescription = styled.p`
  color: ${props => props.theme.text};
  opacity: 0.8;
  margin: 0 0 1rem;
  flex-grow: 1;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid ${props => props.theme.border};
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.liked ? props.theme.accent : props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.accent};
    background: none;
    transform: scale(1.1);
  }
`;

const ViewButton = styled(Link)`
  background-color: ${props => props.theme.primary};
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #323e4bff;
    transform: scale(1.05);
  }
`;

const Category = styled.span`
  background-color: ${props => props.theme.accent};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  display: inline-block;
`;

const UserProfileLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: ${props => props.theme.text};
  margin-bottom: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const UserAvatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
`;

const IdeaCard = ({ idea }) => {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(idea.likedBy?.includes(currentUser?.uid));
  const [likeCount, setLikeCount] = useState(idea.likes || 0);
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (idea.userId) {
        const userDoc = await getDoc(doc(db, 'users', idea.userId));
        if (userDoc.exists()) {
          setAuthor(userDoc.data());
        }
      }
    };
    fetchAuthor();
  }, [idea.userId]);

  const handleLike = async () => {
    if (!currentUser) return;
    
    const ideaRef = doc(db, 'ideas', idea.id);
    
    try {
      if (!liked) {
        // Add like
        await updateDoc(ideaRef, {
          likes: increment(1),
          likedBy: [...(idea.likedBy || []), currentUser.uid]
        });
        setLikeCount(prev => prev + 1);
        setLiked(true);
      } else {
        // Remove like
        await updateDoc(ideaRef, {
          likes: increment(-1),
          likedBy: (idea.likedBy || []).filter(uid => uid !== currentUser.uid)
        });
        setLikeCount(prev => prev - 1);
        setLiked(false);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const isVideo = idea.mediaURL?.includes('video') || idea.mediaURL?.includes('.mp4');

  return (
    <Card>
      {idea.mediaURL && (
        isVideo ? (
          <CardVideo src={idea.mediaURL} controls />
        ) : (
          <CardImage src={idea.mediaURL} />
        )
      )}
      
      <CardContent>
        {author && (
          <UserProfileLink to={`/profile/${idea.userId}`}>
            <UserAvatar src={author.photoURL || '/default-avatar.png'} alt={author.name} />
            <span>{author.name}</span>
          </UserProfileLink>
        )}
        <Category>{idea.category}</Category>
        <CardTitle>{idea.title}</CardTitle>
        <CardDescription>
          {idea.description.length > 100
            ? `${idea.description.substring(0, 100)}...`
            : idea.description}
        </CardDescription>
        
        <CardFooter>
          <LikeButton onClick={handleLike} liked={liked}>
            {liked ? '❤️' : '🤍'} {likeCount}
          </LikeButton>
          <ViewButton to={`/idea/${idea.id}`}>View More</ViewButton>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default IdeaCard;