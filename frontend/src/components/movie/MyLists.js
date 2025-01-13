import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { movieApi } from '../../utils/api';
import { listsApi } from '../../utils/listsApi';
import MovieList from './MovieList';
import MovieDetailsModal from './MovieDetailsModal';
import { useLists } from '../../contexts/ListsContext';
import { toast } from 'react-hot-toast';

const MyLists = () => {
  const [expandedListId, setExpandedListId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [movieDetails, setMovieDetails] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieModalDetails, setMovieModalDetails] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const { lists, updateListStatus } = useLists();
  const location = useLocation();
  const navigate = useNavigate();

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

          setMovieModalDetails({
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
          setMovieModalDetails(null);
        } finally {
          setIsLoadingModal(false);
        }
      }
    };

    loadInitialData();
  }, []);

  const handleCloseModal = () => {
    const baseUrl = '/my-lists';
    navigate(baseUrl, { replace: true });
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

  // ... rest of existing code ...

  return (
    <div className="container mx-auto px-4 py-8 text-primary">
      {/* ... existing JSX ... */}

      {/* Movie Details Modal */}
      {(selectedMovie || isLoadingModal) && (
        <MovieDetailsModal
          isOpen={true}
          onClose={handleCloseModal}
          movie={movieModalDetails || selectedMovie}
          cast={movieModalDetails?.credits?.cast}
          crew={movieModalDetails?.credits?.crew}
          similar={movieModalDetails?.similar}
          watchProviders={movieModalDetails?.watchProviders}
          videos={movieModalDetails?.videos}
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

export default MyLists; 