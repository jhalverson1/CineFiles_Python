import React from 'react';
import Modal from '../common/Modal';
import { variants } from '../../utils/theme';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const MovieDetailsModal = ({ 
  isOpen, 
  onClose, 
  movie,
  cast,
  crew,
  similar,
  recommendations,
  watchProviders,
  videos,
  onWatchedToggle,
  onWatchlistToggle,
  isWatched,
  isInWatchlist,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Update URL when modal opens/closes
  React.useEffect(() => {
    if (isOpen && movie) {
      // Only update URL if it's not already a movie detail URL
      if (!location.pathname.includes('/movie/')) {
        window.history.pushState(
          { movieId: movie.id },
          '',
          `/movie/${movie.id}`
        );
      }
    }
    
    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, movie, onClose, location.pathname]);

  if (!isOpen) return null;

  const director = crew?.find(member => member.job === 'Director');
  const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';
  const runtime = movie?.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
          >
            {/* Modal Container */}
            <div className="min-h-screen flex items-center justify-center p-4">
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-4xl bg-background-primary shadow-xl rounded-lg overflow-hidden"
              >
                {isLoading ? (
                  // Loading State
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : movie ? (
                  // Movie Content
                  <>
                    <div className="relative">
                      {/* Backdrop Image */}
                      {movie.backdrop_path && (
                        <>
                          <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ 
                              backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                              filter: 'blur(2px)'
                            }}
                          />
                          <div className={variants.modal.movieDetails.backdrop.overlay} />
                        </>
                      )}

                      {/* Content */}
                      <div className={variants.modal.movieDetails.container}>
                        {/* Header Section */}
                        <div className={variants.modal.movieDetails.header.base}>
                          {/* Close Button */}
                          <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors z-10"
                            aria-label="Close modal"
                          >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          {/* Poster */}
                          <div className={variants.modal.movieDetails.header.poster}>
                            {movie.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={`${movie.title} poster`}
                                className="w-full rounded-lg shadow-lg"
                              />
                            ) : (
                              <div className="w-full aspect-[2/3] bg-gray-900 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">No poster available</span>
                              </div>
                            )}
                          </div>

                          {/* Movie Info */}
                          <div className={variants.modal.movieDetails.header.info}>
                            <h1 className="text-4xl font-bold mb-2">
                              {movie.title} {releaseYear && <span className="text-gray-400">({releaseYear})</span>}
                            </h1>

                            <div className="flex flex-wrap gap-2 text-sm text-gray-300 mb-4">
                              {movie.release_date && (
                                <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                              )}
                              {runtime && <span>• {runtime}</span>}
                              {movie.genres?.map(genre => genre.name).join(', ')}
                            </div>

                            {director && (
                              <div className="text-lg mb-4">
                                Directed by <span className="font-semibold">{director.name}</span>
                              </div>
                            )}

                            {/* Rating and Actions */}
                            <div className="flex items-center gap-4 mb-6">
                              {movie.vote_average > 0 && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-xl font-bold">{movie.vote_average.toFixed(1)}</span>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onWatchedToggle(movie)}
                                  className={`px-4 py-2 rounded-full border transition-colors ${
                                    isWatched
                                      ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                                      : 'border-white text-white hover:bg-white hover:text-black'
                                  }`}
                                >
                                  {isWatched ? 'Watched' : 'Mark as Watched'}
                                </button>
                                <button
                                  onClick={() => onWatchlistToggle(movie)}
                                  className={`px-4 py-2 rounded-full border transition-colors ${
                                    isInWatchlist
                                      ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                                      : 'border-white text-white hover:bg-white hover:text-black'
                                  }`}
                                >
                                  {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                                </button>
                              </div>
                            </div>

                            {/* Overview */}
                            {movie.overview && (
                              <div className="text-lg leading-relaxed">{movie.overview}</div>
                            )}
                          </div>
                        </div>

                        {/* Additional Sections */}
                        <div className={variants.modal.movieDetails.content.base}>
                          {/* Cast Section */}
                          {cast?.length > 0 && (
                            <section className={variants.modal.movieDetails.content.section}>
                              <h2 className={variants.modal.movieDetails.content.title}>Cast</h2>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {cast.slice(0, 6).map((person) => (
                                  <div key={person.id} className="text-center">
                                    {person.profile_path ? (
                                      <img
                                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                        alt={person.name}
                                        className="w-full rounded-lg mb-2"
                                      />
                                    ) : (
                                      <div className="w-full aspect-[2/3] bg-gray-900 rounded-lg mb-2 flex items-center justify-center">
                                        <span className="text-gray-500 text-sm">No image</span>
                                      </div>
                                    )}
                                    <div className="font-medium">{person.name}</div>
                                    <div className="text-sm text-gray-400">{person.character}</div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Watch Providers Section */}
                          {watchProviders?.length > 0 && (
                            <section className={variants.modal.movieDetails.content.section}>
                              <h2 className={variants.modal.movieDetails.content.title}>Where to Watch</h2>
                              <div className="flex flex-wrap gap-4">
                                {watchProviders.map((provider) => (
                                  <div key={provider.provider_id} className="text-center">
                                    <img
                                      src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                      alt={provider.provider_name}
                                      className="w-12 h-12 rounded-lg"
                                    />
                                    <div className="text-sm mt-1">{provider.provider_name}</div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Videos Section */}
                          {videos?.length > 0 && (
                            <section className={variants.modal.movieDetails.content.section}>
                              <h2 className={variants.modal.movieDetails.content.title}>Videos</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {videos.slice(0, 2).map((video) => (
                                  <div key={video.key} className="aspect-video">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${video.key}`}
                                      title={video.name}
                                      className="w-full h-full rounded-lg"
                                      allowFullScreen
                                    />
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Similar Movies Section */}
                          {similar?.length > 0 && (
                            <section className={variants.modal.movieDetails.content.section}>
                              <h2 className={variants.modal.movieDetails.content.title}>Similar Movies</h2>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {similar.slice(0, 6).map((movie) => (
                                  <motion.div
                                    key={movie.id}
                                    whileHover={{ scale: 1.05 }}
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/movie/${movie.id}`)}
                                  >
                                    {movie.poster_path ? (
                                      <img
                                        src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-full aspect-[2/3] bg-gray-900 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-500 text-sm">No poster</span>
                                      </div>
                                    )}
                                    <div className="mt-2">
                                      <div className="font-medium truncate">{movie.title}</div>
                                      <div className="text-sm text-gray-400">
                                        {movie.release_date?.split('-')[0]}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </section>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Error State
                  <div className="flex items-center justify-center h-96">
                    <p className="text-text-secondary">Failed to load movie details</p>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MovieDetailsModal; 