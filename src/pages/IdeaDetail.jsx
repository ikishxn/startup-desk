import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import CommentBox from '../components/CommentBox';

const DetailContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const IdeaHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.text};
`;

const MetaInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: ${props => props.theme.textSecondary};
`;

const Category = styled.span`
  background-color: ${props => props.theme.primary};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
`;

const MediaContainer = styled.div`
  margin: 2rem 0;
  
  img, video {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 6px ${props => props.theme.shadow};
  }
`;

const Description = styled.div`
  margin-bottom: 2rem;
  line-height: 1.6;
  color: ${props => props.theme.text};
  white-space: pre-wrap;
`;

const CommentsSection = styled.div`
  margin-top: 3rem;
`;

const CommentsTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.text};
`;

const NotFound = styled.div`
  text-align: center;
  padding: 3rem;
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: ${props => props.theme.text};
  }
  
  p {
    color: ${props => props.theme.textSecondary};
    margin-bottom: 2rem;
  }
`;

const IdeaDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const ideaRef = doc(db, 'ideas', id);
        const ideaSnap = await getDoc(ideaRef);
        
        if (ideaSnap.exists()) {
          setIdea({
            id: ideaSnap.id,
            ...ideaSnap.data()
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching idea:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  if (loading) {
    return <DetailContainer>Loading...</DetailContainer>;
  }

  if (notFound) {
    return (
      <DetailContainer>
        <NotFound>
          <h2>Idea Not Found</h2>
          <p>The idea you're looking for doesn't exist or has been removed.</p>
          <BackLink to="/discover">← Back to Discover</BackLink>
        </NotFound>
      </DetailContainer>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DetailContainer>
      <BackLink to="/discover">← Back to Discover</BackLink>
      
      <IdeaHeader>
        <Title>{idea.title}</Title>
        <MetaInfo>
          <span>Posted on {formatDate(idea.createdAt)}</span>
          <Category>{idea.category}</Category>
        </MetaInfo>
      </IdeaHeader>
      
      {idea.mediaURL && (
        <MediaContainer>
          {idea.mediaURL.includes('image') ? (
            <img src={idea.mediaURL} alt={idea.title} />
          ) : (
            <video src={idea.mediaURL} controls />
          )}
        </MediaContainer>
      )}
      
      <Description>{idea.description}</Description>
      
      <CommentsSection>
        <CommentsTitle>Comments</CommentsTitle>
        <CommentBox ideaId={id} />
      </CommentsSection>
    </DetailContainer>
  );
};

export default IdeaDetail;