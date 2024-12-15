/**
 * MovieDetails component that displays detailed information about a specific movie.
 * Uses React Router's useParams to get the movie ID from the URL.
 * Fetches movie details, credits, and videos from the backend API.
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
  const [videos, setVideos] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    document.title = 'Loading Movie Details...';

    // Fetch movie details, credits, and videos
    Promise.all([
      axios.get(`http://0.0.0.0:8080/api/movies/${id}`),
      axios.get(`http://0.0.0.0:8080/api/movies/${id}/credits`),
      axios.get(`http://0.0.0.0:8080/api/movies/${id}/videos`)
    ])
      .then(([movieResponse, creditsResponse, videosResponse]) => {
        setMovie(movieResponse.data);
        setCredits(creditsResponse.data);
        setVideos(videosResponse.data);
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

  if (!movie || !credits || !videos) return <div>Loading...</div>;

  const director = credits.crew.find(person => person.job === 'Director');
  const releaseYear = new Date(movie.release_date).getFullYear();
  const topCast = credits.cast.slice(0, 6);
  
  // Find the official trailer or use the first video
  const trailer = videos.results.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  ) || videos.results[0];

  console.log('Trailer:', trailer); // Add this debug log
  console.log('Show Trailer State:', showTrailer); // Add this debug log

  // Create the background style with the backdrop image
  const backgroundStyle = {
    ...styles.background,
    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
  };

  return (
    <div style={backgroundStyle}>
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
            {trailer && (
              <button 
                onClick={() => setShowTrailer(true)}
                style={styles.trailerButton}
              >
                ▶ Watch Trailer
              </button>
            )}
          </div>
        </div>

        {/* Trailer Modal */}
        {showTrailer && trailer && (
          <div style={styles.modal} onClick={() => setShowTrailer(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button 
                style={styles.closeButton}
                onClick={() => setShowTrailer(false)}
              >
                ✕
              </button>
              <iframe
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

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
    </div>
  );
}

// Styles object
const styles = {
  background: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflowY: 'auto',
  },
  container: {
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    color: 'white',
    zIndex: 1,
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
    color: 'white',
  },
  year: {
    color: '#ccc',
    fontWeight: 'normal',
  },
  director: {
    fontSize: '1.2em',
    color: '#ccc',
    marginBottom: '15px',
  },
  metadata: {
    color: '#ccc',
    fontSize: '1.1em',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.8em',
    marginBottom: '20px',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '10px',
    color: 'white',
  },
  overview: {
    fontSize: '1.1em',
    lineHeight: '1.6',
    color: '#fff',
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
    color: '#ccc',
    fontSize: '0.9em',
  },
  additionalInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    color: '#fff',
  },
  trailerButton: {
    marginTop: '15px',
    padding: '6px 12px',
    fontSize: '0.9em',
    backgroundColor: '#e50914',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    position: 'relative',
    width: '90%',
    maxWidth: '900px',
    backgroundColor: 'black',
    padding: '20px',
    borderRadius: '10px',
  },
  closeButton: {
    position: 'absolute',
    top: '-30px',
    right: '-30px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '10px',
  },
};

export default MovieDetails; 