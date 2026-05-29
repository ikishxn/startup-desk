import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const CommentContainer = styled.div`
  margin-top: 2rem;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CommentInput = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.card};
  color: ${props => props.theme.text};
  resize: vertical;
  min-height: 80px;
`;

const SubmitButton = styled.button`
  align-self: flex-end;
  padding: 0.5rem 1rem;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentItem = styled.div`
  background-color: ${props => props.theme.card};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.span`
  font-weight: bold;
  color: ${props => props.theme.primary};
`;

const CommentDate = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.text};
  opacity: 0.7;
`;

const CommentContent = styled.p`
  margin: 0;
  color: ${props => props.theme.text};
`;

const CommentBox = ({ ideaId }) => {
  const { currentUser } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listener for comments
    const commentsRef = collection(db, 'ideas', ideaId, 'comments');
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [ideaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim() || !currentUser) return;
    
    try {
      const commentsRef = collection(db, 'ideas', ideaId, 'comments');
      await addDoc(commentsRef, {
        content: comment,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        createdAt: new Date().toISOString()
      });
      
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <CommentContainer>
      <h3>Comments</h3>
      
      {currentUser ? (
        <CommentForm onSubmit={handleSubmit}>
          <CommentInput
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            required
          />
          <SubmitButton type="submit">Post Comment</SubmitButton>
        </CommentForm>
      ) : (
        <p>Please log in to comment.</p>
      )}
      
      <CommentsList>
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem key={comment.id}>
              <CommentHeader>
                <CommentAuthor>{comment.authorName}</CommentAuthor>
                <CommentDate>{formatDate(comment.createdAt)}</CommentDate>
              </CommentHeader>
              <CommentContent>{comment.content}</CommentContent>
            </CommentItem>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </CommentsList>
    </CommentContainer>
  );
};

export default CommentBox;