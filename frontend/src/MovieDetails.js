import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    console.log('Setting document title to "Movie Details"');
    document.title = 'Movie Details';

    const url = `http://0.0.0.0:8080/api/movies/${id}`;
    console.log('Fetching movie details from URL:', url);

    axios.get(url)
      .then(response => setMovie(response.data))
      .catch(error => console.error('Error fetching movie details:', error));
  }, [id]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div>
      <h2>{movie.title}</h2>
      <p>{movie.overview}</p>
      {/* Add more movie details as needed */}
    </div>
  );
}

export default MovieDetails; 