/**
 * MovieDetails component that displays detailed information about a specific movie.
 * Uses React Router's useParams to get the movie ID from the URL.
 * Fetches movie details, credits, and videos from the backend API.
 * 
 * @component
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieApi } from '../../utils/api';
import MovieDetailsSkeleton from '../common/MovieDetailsSkeleton';
import { getImageUrl } from '../../utils/image';
import WatchedToggle from './WatchedToggle';
import WatchlistToggle from './WatchlistToggle';
import AddToListButton from './AddToListButton';
import WatchProviders from './WatchProviders';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);

  useEffect(() => {
    document.title = 'Loading Movie Details...';

    Promise.all([
      movieApi.getMovieDetails(id),
      movieApi.getMovieCredits(id),
      movieApi.getMovieVideos(id),
      movieApi.getMovieWatchProviders(id)
    ])
      .then(([movieData, creditsData, videosData, providersData]) => {
        setMovie(movieData);
        setCredits(creditsData);
        setVideos(videosData);
        setWatchProviders(providersData);
        document.title = `${movieData.title} - Movie Details`;
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
      const response = await movieApi.getPersonDetails(personId);
      const imdbId = response.imdb_id;
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
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)), url(${getImageUrl(movie.backdrop_path, 'original')})`
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
        <div className="flex flex-col md:flex-row gap-12 mb-10">
          {/* Movie Poster */}
          <div className="relative">
            <img
              src={getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="w-[300px] h-[450px] rounded-md object-cover"
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-5xl font-light text-white mb-3">
                  {movie.title}
                </h1>
                <p className="text-2xl text-gray-400 font-light">
                  {releaseYear}
                </p>
              </div>
              <div className="flex gap-2">
                <WatchedToggle movieId={id} />
                <WatchlistToggle movieId={id} />
                <AddToListButton movieId={id} dropdownPosition="bottom-left" />
              </div>
            </div>

            {/* Movie Metadata */}
            <div className="flex items-center gap-8 mb-8 text-gray-400 text-sm tracking-wide">
              {director && (
                <div>
                  <span className="block uppercase mb-1">Director</span>
                  <span className="text-white">{director.name}</span>
                </div>
              )}
              <div>
                <span className="block uppercase mb-1">Runtime</span>
                <span className="text-white">{movie.runtime} minutes</span>
              </div>
              <div>
                <span className="block uppercase mb-1">Rating</span>
                <span className="text-white">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>

            {/* Watch Options */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              {trailer && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="px-6 py-2.5 border border-white/20 text-white rounded-sm hover:bg-white/5 transition-colors duration-200 flex items-center gap-2 text-sm tracking-wide"
                >
                  Watch Trailer
                </button>
              )}
              {watchProviders && <WatchProviders providers={watchProviders} />}
            </div>

            {/* Overview */}
            <div className="border-t border-white/10 pt-8">
              <p className="text-gray-300 leading-relaxed text-lg font-light">{movie.overview}</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayCast
              .slice(0, showAllCast ? undefined : initialCastCount)
              .map((actor) => (
                <div
                  key={actor.id}
                  onClick={() => handleCastClick(actor.id)}
                  className="bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                >
                  <img
                    src={getImageUrl(actor.profile_path, 'w185')}
                    alt={actor.name}
                    className="w-full aspect-[2/3] object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="p-2">
                    <h3 className="font-medium text-white text-sm">{actor.name}</h3>
                    <p className="text-gray-400 text-xs">{actor.character}</p>
                  </div>
                </div>
              ))}
          </div>
          {displayCast.length > initialCastCount && (
            <button
              onClick={() => setShowAllCast(!showAllCast)}
              className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors duration-200"
            >
              {showAllCast ? 'Show Less' : `Show All (${displayCast.length})`}
            </button>
          )}
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