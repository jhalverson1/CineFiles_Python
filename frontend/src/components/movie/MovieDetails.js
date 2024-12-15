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
import Breadcrumb from '../common/Breadcrumb';
import MovieDetailsSkeleton from '../common/MovieDetailsSkeleton';
import { styles } from '../../styles/MovieDetails';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);

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

  const handleCastClick = async (personId) => {
    try {
      const response = await axios.get(`http://0.0.0.0:8080/api/person/${personId}`);
      const imdbId = response.data.imdb_id;
      if (imdbId) {
        window.open(`https://www.imdb.com/name/${imdbId}`, '_blank');
      }
    } catch (error) {
      console.error('Error fetching person details:', error);
    }
  };

  if (!movie || !credits || !videos) {
    return <MovieDetailsSkeleton />;
  }

  const director = credits.crew.find(person => person.job === 'Director');
  const releaseYear = new Date(movie.release_date).getFullYear();
  const displayCast = credits.cast;
  const initialCastCount = 6;
  
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
      <Breadcrumb movie={movie} />
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
            <div style={styles.overview}>
              <h2 style={styles.overviewTitle}>Overview</h2>
              <p style={styles.overviewText}>{movie.overview}</p>
            </div>
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

        {/* Cast Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Cast</h2>
          <div style={styles.castContainer}>
            <div style={styles.castGrid} className={showAllCast ? 'expanded' : ''}>
              {displayCast.map((actor, index) => (
                <div 
                  key={actor.id} 
                  style={{
                    ...styles.castMember,
                    animation: `fadeIn 0.3s ease-in forwards ${index * 0.1}s`,
                    opacity: 0,
                  }}
                  onClick={() => handleCastClick(actor.id)}
                >
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
            {credits.cast.length > initialCastCount && (
              <div 
                style={styles.expandTrigger}
                onClick={() => setShowAllCast(!showAllCast)}
              >
                <span>{showAllCast ? 'Show Less' : 'Show More'}</span>
                <span style={{
                  ...styles.arrow,
                  transform: showAllCast ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>▼</span>
              </div>
            )}
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

// Only keep the CSS animations here
const css = `
  .expanded {
    max-height: 2000px !important;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = css;
document.head.appendChild(styleSheet);

export default MovieDetails; 