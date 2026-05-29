import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import IdeaCard from '../components/IdeaCard';

const HomeContainer = styled.div`
  margin: 0 auto;
  padding: 2rem 2rem;
  background-attachment: fixed; /* Optional parallax effect */
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, #0056b3 100%);
  border-radius: 12px;
`;

const HeroTitle = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 2rem;
  opacity: 0.9;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(Link)`
  background-color: ${props => props.$primary ? 'white' : 'white'};
  color: ${props => props.$primary ? props.theme.primary   : 'black'};
  border: ${props => props.$primary ? '2px solid black' : '2px solid black' };
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    background-color: ${props => props.$primary ? '#f0f0f0' : '#f0f0f0'};
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: ${props => props.theme.text};
`;

const IdeasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  flex-grow: 1;
  min-width: 200px;
  background-color: ${props => props.theme.card};
  color: ${props => props.theme.text};
`;

const CategorySelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.card};
  color: ${props => props.theme.text};
`;

const NoIdeas = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin-top: 3rem;
  color: ${props => props.theme.text};
`;

const Home = () => {
  const [allIdeas, setAllIdeas] = useState([]);
  const [trendingIdeas, setTrendingIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      try {
        const ideasRef = collection(db, 'ideas');
        const ideasQuery = query(ideasRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(ideasQuery);

        const ideasData = await Promise.all(snapshot.docs.map(async (ideaDoc) => {
          const ideaData = ideaDoc.data();
          const userRef = doc(db, 'users', ideaData.userId);
          const userSnap = await getDoc(userRef);
          return {
            id: ideaDoc.id,
            ...ideaData,
            user: userSnap.exists() ? userSnap.data() : null,
          };
        }));

        setAllIdeas(ideasData);

        const sortedByLikes = [...ideasData].sort((a, b) => (b.likes || 0) - (a.likes || 0));
        setTrendingIdeas(sortedByLikes.slice(0, 4));

        const uniqueCategories = [...new Set(ideasData.map(idea => idea.category))];
        setCategories(uniqueCategories);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching ideas:', error);
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  useEffect(() => {
    let filtered = allIdeas;
    
    if (searchTerm) {
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }
    
    setFilteredIdeas(filtered);
  }, [searchTerm, selectedCategory, allIdeas]);

  return (
   <HomeContainer>
      <HeroSection>
        <HeroTitle>Campus Startup Idea Showcase</HeroTitle>
        <HeroDescription>
          A platform for students to submit and discover innovative startup ideas.
          Share your vision, get feedback, and connect with like-minded entrepreneurs.
        </HeroDescription>
        <ButtonContainer>
          <Button to="/submit" $primary>Submit Idea</Button>
          <Button to="/discover">Discover Ideas</Button>
        </ButtonContainer>
      </HeroSection>

      <SectionTitle>Trending Ideas</SectionTitle>
      
      {loading ? (
        <p>Loading trending ideas...</p>
      ) : trendingIdeas.length > 0 ? (
        <IdeasGrid>
          {trendingIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </IdeasGrid>
      ) : (
        <p>No ideas yet. Be the first to submit one!</p>
      )}

      <SectionTitle style={{ marginTop: '4rem' }}>Discover Ideas</SectionTitle>
      
      <FiltersContainer>
        <SearchInput
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <CategorySelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </CategorySelect>
      </FiltersContainer>
      
      {loading ? (
        <p>Loading ideas...</p>
      ) : filteredIdeas.length > 0 ? (
        <IdeasGrid>
          {filteredIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </IdeasGrid>
      ) : (
        <NoIdeas>
          {searchTerm || selectedCategory
            ? "No ideas match your search criteria."
            : "No ideas have been submitted yet. Be the first!"}
        </NoIdeas>
      )}
    </HomeContainer>
  );
};
export default Home;