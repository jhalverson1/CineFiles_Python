import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';
import MovieDetailsModal from './MovieDetailsModal';
import { movieApi } from '../../utils/api';
import { listsApi } from '../../utils/listsApi';
import { useLists } from '../../contexts/ListsContext';
import { toast } from 'react-hot-toast';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(location.state?.results || []);
  const [query, setQuery] = useState(location.state?.query || '');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const { lists, updateListStatus } = useLists();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const movieId = location.pathname.match(/\/movie\/(\d+)/)?.[1];
      if (movieId) {
        setIsLoadingModal(true);
        try {
          const [details, credits, videos, watchProviders] = await Promise.all([
            movieApi.getMovieDetails(movieId),
            movieApi.getMovieCredits(movieId),
            movieApi.getMovieVideos(movieId),
            movieApi.getMovieWatchProviders(movieId)
          ]);

          setMovieDetails({
            ...details,
            credits,
            videos: videos.results || [],
            similar: [], // Temporarily disabled until backend is ready
            watchProviders: watchProviders.results?.US?.flatrate || []
          });
          setSelectedMovie(details);
        } catch (error) {
          console.error('Error loading movie details:', error);
          toast.error('Failed to load movie details');
          setSelectedMovie(null);
          setMovieDetails(null);
        } finally {
          setIsLoadingModal(false);
        }
      }
    };

    loadInitialData();
  }, []);

  const handleCloseModal = () => {
    const baseUrl = '/search';
    navigate(baseUrl, { 
      state: { results, query },
      replace: true 
    });
  };

  // Handle toggling movies in Watched list
  const onWatchedToggle = useCallback(async (movie) => {
    try {
      if (!movie || !movie.id) {
        throw new Error('Invalid movie object');
      }

      const movieId = movie.id.toString();
      const previousStatus = {
        isWatched: lists?.find(list => list.name === 'Watched')?.items.some(item => item.movie_id === movieId),
        isInWatchlist: lists?.find(list => list.name === 'Watchlist')?.items.some(item => item.movie_id === movieId)
      };

      // Optimistically update UI
      updateListStatus(movieId, {
        is_watched: !previousStatus.isWatched,
        in_watchlist: previousStatus.isWatched ? previousStatus.isInWatchlist : false
      });

      try {
        const response = await listsApi.toggleWatched(movieId);
        // Update with actual server response
        updateListStatus(movieId, response);
      } catch (error) {
        // Revert to previous state on error
        updateListStatus(movieId, {
          is_watched: previousStatus.isWatched,
          in_watchlist: previousStatus.isInWatchlist
        });
        throw error;
      }
    } catch (error) {
      console.error('Error toggling watched status:', error);
      toast.error('Failed to update watched status');
    }
  }, [lists, updateListStatus]);

  // Handle toggling movies in Watchlist
  const onWatchlistToggle = useCallback(async (movie) => {
    try {
      if (!movie || !movie.id) {
        throw new Error('Invalid movie object');
      }

      const movieId = movie.id.toString();
      const previousStatus = {
        isWatched: lists?.find(list => list.name === 'Watched')?.items.some(item => item.movie_id === movieId),
        isInWatchlist: lists?.find(list => list.name === 'Watchlist')?.items.some(item => item.movie_id === movieId)
      };

      // Optimistically update UI
      updateListStatus(movieId, {
        is_watched: previousStatus.isWatched,
        in_watchlist: !previousStatus.isInWatchlist
      });

      try {
        const response = await listsApi.toggleWatchlist(movieId);
        // Update with actual server response
        updateListStatus(movieId, response);
      } catch (error) {
        // Revert to previous state on error
        updateListStatus(movieId, {
          is_watched: previousStatus.isWatched,
          in_watchlist: previousStatus.isInWatchlist
        });
        throw error;
      }
    } catch (error) {
      console.error('Error toggling watchlist status:', error);
      toast.error('Failed to update watchlist');
    }
  }, [lists, updateListStatus]);

  return (
    <div className="min-h-screen text-primary">
      <div className="w-full px-6 py-8">
        {(results.length > 0 || query) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 pl-2 border-l-[6px] border-primary">
              Search Results for "{query}"
            </h2>
            <p className="text-text-secondary">
              Found {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
          </div>
        )}

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No results found for "{query}"</p>
          </div>
        ) : null}
      </div>

      {/* Movie Details Modal */}
      {(selectedMovie || isLoadingModal) && (
        <MovieDetailsModal
          isOpen={true}
          onClose={handleCloseModal}
          movie={movieDetails || selectedMovie}
          cast={movieDetails?.credits?.cast}
          crew={movieDetails?.credits?.crew}
          similar={movieDetails?.similar}
          watchProviders={movieDetails?.watchProviders}
          videos={movieDetails?.videos}
          onWatchedToggle={onWatchedToggle}
          onWatchlistToggle={onWatchlistToggle}
          isWatched={lists?.find(list => list.name === 'Watched')?.items.some(item => item.movie_id === selectedMovie?.id.toString())}
          isInWatchlist={lists?.find(list => list.name === 'Watchlist')?.items.some(item => item.movie_id === selectedMovie?.id.toString())}
          isLoading={isLoadingModal}
        />
      )}
    </div>
  );
};

export default SearchResults; 