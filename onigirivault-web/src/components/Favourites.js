import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);

  // Fetch favourites on component mount
  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/favourites`);
        setFavourites(response.data);
      } catch (error) {
        console.error('Error fetching favourites:', error);
      }
    };

    fetchFavourites();
  }, []);

  const addToFavourites = async (anime) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/favourites`, { anime });
      setFavourites([...favourites, anime]);
    } catch (error) {
      console.error('Error adding to favourites:', error);
    }
  };

  const removeFromFavourites = async (animeId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/favourites/${animeId}`);
      setFavourites(favourites.filter((anime) => anime.id !== animeId));
    } catch (error) {
      console.error('Error removing from favourites:', error);
    }
  };

  return (
    <div>
      <h2>Favourites</h2>
      <ul>
        {favourites.map((anime) => (
          <li key={anime.id}>
            <a href={anime.url} target="_blank" rel="noopener noreferrer">
              {anime.title}
            </a>
            <button onClick={() => removeFromFavourites(anime.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => addToFavourites({ title: 'New Anime', id: Date.now(), url: '#' })}>
        Add New Anime to Favourites
      </button>
    </div>
  );
};

export default Favourites;