import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import IdeaCard from '../components/IdeaCard';

const DiscoverContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${props => props.theme.text};
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

const IdeasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const NoIdeas = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin-top: 3rem;
  color: ${props => props.theme.text};
`;

const Discover = () => {
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasRef = collection(db, 'ideas');
        const snapshot = await getDocs(ideasRef);
        
        const ideasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setIdeas(ideasData);
        setFilteredIdeas(ideasData);
        
        // Extract unique categories
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
    // Filter ideas based on search term and category
    let filtered = ideas;
    
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
  }, [searchTerm, selectedCategory, ideas]);

  return (
    <DiscoverContainer>
      <PageTitle>Discover Ideas</PageTitle>
      
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
    </DiscoverContainer>
  );
};

export default Discover;