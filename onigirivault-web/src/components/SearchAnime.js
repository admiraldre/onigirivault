import React, { useState } from 'react';
import axios from 'axios'; // For making HTTP requests

const SearchAnime = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [animeResults, setAnimeResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to handle the search
  const searchAnime = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/anime`, {
        params: { query: searchQuery },
      });
      setAnimeResults(response.data); // Assume the response contains anime data
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Search for Anime</h2>
      <input
        type="text"
        placeholder="Search anime..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={searchAnime} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {animeResults.length > 0 && (
        <ul>
          {animeResults.map((anime, index) => (
            <li key={index}>
              <a href={anime.url} target="_blank" rel="noopener noreferrer">
                {anime.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchAnime;