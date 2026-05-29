import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: ${props => props.theme.text};
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.card};
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px ${props => props.theme.shadow};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  background-color: ${props => props.theme.card};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px ${props => props.theme.shadow};
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.primary};
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${props => props.theme.backgroundAlt};
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme.text};
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ApproveButton = styled(ActionButton)`
  background-color: #2ecc71;
  color: white;
  
  &:hover {
    background-color: #27ae60;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: #e74c3c;
  color: white;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const FeaturedButton = styled(ActionButton)`
  background-color: ${props => props.isFeatured ? '#f39c12' : '#3498db'};
  color: white;
  
  &:hover {
    background-color: ${props => props.isFeatured ? '#e67e22' : '#2980b9'};
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
  color: ${props => props.theme.text};
`;

const Admin = () => {
  const { currentUser, isAdmin } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalUsers: 0,
    featuredIdeas: 0
  });

  useEffect(() => {
    const fetchIdeas = async () => {
      if (!currentUser || !isAdmin) return;
      
      try {
        const ideasRef = collection(db, 'ideas');
        const snapshot = await getDocs(ideasRef);
        
        const ideasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setIdeas(ideasData);
        
        // Calculate stats
        const featuredCount = ideasData.filter(idea => idea.featured).length;
        
        // Get unique user count
        const uniqueUsers = [...new Set(ideasData.map(idea => idea.userId))];
        
        setStats({
          totalIdeas: ideasData.length,
          totalUsers: uniqueUsers.length,
          featuredIdeas: featuredCount
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ideas:', error);
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [currentUser, isAdmin]);

  const handleDelete = async (ideaId) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await deleteDoc(doc(db, 'ideas', ideaId));
        setIdeas(ideas.filter(idea => idea.id !== ideaId));
        setStats(prev => ({
          ...prev,
          totalIdeas: prev.totalIdeas - 1
        }));
      } catch (error) {
        console.error('Error deleting idea:', error);
      }
    }
  };

  const toggleFeatured = async (ideaId, currentStatus) => {
    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      await updateDoc(ideaRef, {
        featured: !currentStatus
      });
      
      // Update local state
      setIdeas(ideas.map(idea => {
        if (idea.id === ideaId) {
          return { ...idea, featured: !currentStatus };
        }
        return idea;
      }));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        featuredIdeas: currentStatus 
          ? prev.featuredIdeas - 1 
          : prev.featuredIdeas + 1
      }));
      
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };

  // Redirect if not admin
  if (!currentUser || !isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <AdminContainer>
      <PageTitle>Admin Dashboard</PageTitle>
      
      <StatsContainer>
        <StatCard>
          <StatValue>{stats.totalIdeas}</StatValue>
          <StatLabel>Total Ideas</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>Unique Contributors</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.featuredIdeas}</StatValue>
          <StatLabel>Featured Ideas</StatLabel>
        </StatCard>
      </StatsContainer>
      
      {loading ? (
        <LoadingMessage>Loading ideas...</LoadingMessage>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Title</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Likes</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {ideas.map(idea => (
              <TableRow key={idea.id}>
                <TableCell>{idea.title}</TableCell>
                <TableCell>{idea.category}</TableCell>
                <TableCell>
                  {new Date(idea.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{idea.likes || 0}</TableCell>
                <TableCell>
                  <FeaturedButton 
                    isFeatured={idea.featured}
                    onClick={() => toggleFeatured(idea.id, idea.featured)}
                  >
                    {idea.featured ? 'Unfeature' : 'Feature'}
                  </FeaturedButton>
                  <DeleteButton onClick={() => handleDelete(idea.id)}>
                    Delete
                  </DeleteButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </AdminContainer>
  );
};

export default Admin;