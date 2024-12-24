/**
 * MovieDetails component that displays detailed information about a specific movie.
 * Uses React Router's useParams to get the movie ID from the URL.
 * Fetches movie details, credits, and videos from the backend API.
 * 
 * @component
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosInstance } from '../../utils/api';
import MovieDetailsSkeleton from '../common/MovieDetailsSkeleton';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);

  useEffect(() => {
    document.title = 'Loading Movie Details...';

    Promise.all([
      axiosInstance.get(`/api/movies/${id}`),
      axiosInstance.get(`/api/movies/${id}/credits`),
      axiosInstance.get(`/api/movies/${id}/videos`)
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
      const response = await axiosInstance.get(`/api/person/${personId}`);
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
  
  const trailer = videos.results.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  ) || videos.results[0];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
      }}
    >
      <Link 
        to="/"
        className="inline-flex items-center gap-2 p-5 text-white hover:text-primary transition-colors duration-200"
        aria-label="Back to home"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back to Home</span>
      </Link>

      <div className="w-[95%] max-w-[1200px] mx-auto py-8">
        {/* Movie Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-[300px] h-[450px] rounded-lg shadow-lg object-cover"
          />
          <div className="flex-1 text-white">
            <h1 className="text-4xl font-bold mb-2">
              {movie.title} <span className="text-gray-400">({releaseYear})</span>
            </h1>
            {director && (
              <p className="text-lg text-gray-300 mb-4">
                Directed by {director.name}
              </p>
            )}
            <div className="text-gray-300 mb-4">
              <span>{movie.runtime} minutes</span>
              <span className="mx-2">•</span>
              <span>{movie.vote_average.toFixed(1)}/10</span>
            </div>
            {trailer && (
              <div className="flex justify-start mb-6">
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="text-lg">▶</span> Watch Trailer
                </button>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>
          </div>
        </div>

        {/* Trailer Modal */}
        {showTrailer && trailer && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTrailer(false)}
          >
            <div 
              className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute top-2 right-2 text-white/80 hover:text-white w-8 h-8 flex items-center justify-center text-xl bg-black/50 rounded-full"
                onClick={() => setShowTrailer(false)}
              >
                ✕
              </button>
              <iframe
                className="w-full aspect-video"
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
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Cast</h2>
          <div className="relative">
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 ${!showAllCast ? 'max-h-[600px]' : ''} overflow-hidden transition-all duration-500`}>
              {displayCast.map((actor, index) => (
                <div 
                  key={actor.id} 
                  className="bg-[rgba(32,32,32,0.8)] rounded-lg overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCastClick(actor.id)}
                >
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-white font-medium text-sm truncate">{actor.name}</p>
                    <p className="text-gray-400 text-xs truncate">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
            {credits.cast.length > initialCastCount && (
              <div 
                className="text-center mt-4 cursor-pointer text-white/80 hover:text-white"
                onClick={() => setShowAllCast(!showAllCast)}
              >
                <span className="mr-2">{showAllCast ? 'Show Less' : 'Show More'}</span>
                <span className={`inline-block transition-transform duration-200 ${showAllCast ? 'rotate-180' : ''}`}>▼</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="text-white">
          <h2 className="text-2xl font-semibold mb-6">Additional Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
            <p><span className="font-semibold">Release Date:</span> {movie.release_date}</p>
            <p><span className="font-semibold">Original Language:</span> {movie.original_language.toUpperCase()}</p>
            <p><span className="font-semibold">Budget:</span> ${movie.budget.toLocaleString()}</p>
            <p><span className="font-semibold">Revenue:</span> ${movie.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails; 