/**
 * MovieDetails component that displays detailed information about a specific movie.
 * Uses React Router's useParams to get the movie ID from the URL.
 * Fetches movie details from the backend API.
 * Updates document title to show the movie's title.
 * 
 * @component
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    document.title = 'Loading Movie Details...';

    const url = `http://0.0.0.0:8080/api/movies/${id}`;
    console.log('Fetching movie details from URL:', url);

    // Fetch movie details and credits
    Promise.all([
      axios.get(url),
      axios.get(`http://0.0.0.0:8080/api/movies/${id}/credits`)
    ])
      .then(([movieResponse, creditsResponse]) => {
        setMovie(movieResponse.data);
        setCredits(creditsResponse.data);
        document.title = `${movieResponse.data.title} - Movie Details`;
      })
      .catch(error => {
        console.error('Error fetching movie details:', error);
        document.title = 'Movie Details - Error';
      });

    return () => {
      document.title = 'Movie Search';
    };
  }, [id]);

  if (!movie || !credits) return <div>Loading...</div>;

  // Get director from crew
  const director = credits.crew.find(person => person.job === 'Director');
  
  // Get release year from release_date
  const releaseYear = new Date(movie.release_date).getFullYear();

  // Get top cast members (limit to 6)
  const topCast = credits.cast.slice(0, 6);

  return (
    <div style={styles.container}>
      {/* Movie Header Section */}
      <div style={styles.header}>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          style={styles.poster}
        />
        <div style={styles.headerInfo}>
          <h1 style={styles.title}>{movie.title} <span style={styles.year}>({releaseYear})</span></h1>
          {director && <p style={styles.director}>Directed by {director.name}</p>}
          <div style={styles.metadata}>
            <span>{movie.runtime} minutes</span>
            <span> • </span>
            <span>{movie.vote_average.toFixed(1)}/10</span>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Overview</h2>
        <p style={styles.overview}>{movie.overview}</p>
      </div>

      {/* Cast Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Top Cast</h2>
        <div style={styles.castGrid}>
          {topCast.map(actor => (
            <div key={actor.id} style={styles.castMember}>
              {actor.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                  style={styles.castImage}
                />
              ) : (
                <div style={styles.placeholderImage}>No Image</div>
              )}
              <p style={styles.actorName}>{actor.name}</p>
              <p style={styles.characterName}>{actor.character}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Details Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Additional Details</h2>
        <div style={styles.additionalInfo}>
          <p><strong>Release Date:</strong> {movie.release_date}</p>
          <p><strong>Original Language:</strong> {movie.original_language.toUpperCase()}</p>
          <p><strong>Budget:</strong> ${movie.budget.toLocaleString()}</p>
          <p><strong>Revenue:</strong> ${movie.revenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// Styles object
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    gap: '30px',
    marginBottom: '40px',
  },
  poster: {
    width: '300px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '10px',
  },
  year: {
    color: '#666',
    fontWeight: 'normal',
  },
  director: {
    fontSize: '1.2em',
    color: '#666',
    marginBottom: '15px',
  },
  metadata: {
    color: '#666',
    fontSize: '1.1em',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.8em',
    marginBottom: '20px',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
  },
  overview: {
    fontSize: '1.1em',
    lineHeight: '1.6',
  },
  castGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '20px',
  },
  castMember: {
    textAlign: 'center',
  },
  castImage: {
    width: '150px',
    height: '225px',
    objectFit: 'cover',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  placeholderImage: {
    width: '150px',
    height: '225px',
    backgroundColor: '#eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  actorName: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  characterName: {
    color: '#666',
    fontSize: '0.9em',
  },
  additionalInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
};

export default MovieDetails; 