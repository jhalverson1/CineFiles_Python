import React, { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { listsApi } from '../../utils/listsApi';
import { useLists } from '../../contexts/ListsContext';
import MovieCard from '../movie/MovieCard';

const SearchResults = () => {
  const { lists, updateListStatus } = useLists();

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
    <div className="container mx-auto px-4 py-8">
      <h1>Search Results</h1>
      {/* Add your search results rendering logic here */}
    </div>
  );
};

export default SearchResults; 