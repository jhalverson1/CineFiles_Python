import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { movieApi } from '../../utils/api';
import { listsApi } from '../../utils/listsApi';
import MovieList from './MovieList';
import MovieDetailsModal from './MovieDetailsModal';
import CreateListModal from './CreateListModal';
import EditListModal from './EditListModal';
import { useLists } from '../../contexts/ListsContext';
import { toast } from 'react-hot-toast';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { variants } from '../../utils/theme';

const MyLists = () => {
  const [expandedListId, setExpandedListId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [movieDetails, setMovieDetails] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieModalDetails, setMovieModalDetails] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const { lists, updateListStatus, refreshLists } = useLists();
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

  const handleCreateList = async (listData) => {
    try {
      await listsApi.createList(listData);
      await refreshLists();
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  };

  const handleUpdateList = async (listId, listData) => {
    console.log('handleUpdateList called with:', { listId, listData });
    try {
      await listsApi.updateList(listId, listData);
      await refreshLists();
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  };

  const handleDeleteList = async (list) => {
    if (list.is_default) {
      toast.error('Cannot delete default lists');
      return;
    }

    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      try {
        await listsApi.deleteList(list.id);
        await refreshLists();
        toast.success('List deleted successfully');
      } catch (error) {
        console.error('Error deleting list:', error);
        toast.error('Failed to delete list');
      }
    }
  };

  const handleEditClick = (e, list) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit clicked for list:', list);
    setSelectedList(list);
    setShowEditModal(true);
  };

  const handleDeleteClick = (e, list) => {
    e.stopPropagation();
    handleDeleteList(list);
  };

  const handleListClick = (listId) => {
    setExpandedListId(expandedListId === listId ? null : listId);
  };

  return (
    <div className="container mx-auto px-4 py-8 text-primary">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Lists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className={`flex items-center gap-2 ${variants.button.primary.base} ${variants.button.primary.hover}`}
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create</span>
        </button>
      </div>

      <div className="space-y-4">
        {lists?.map((list) => (
          <div key={list.id} className={variants.card.base}>
            <div
              onClick={() => handleListClick(list.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleListClick(list.id);
                }
              }}
              className={`w-full px-6 py-4 flex justify-between items-center ${variants.card.interactive}`}
            >
              <div className="flex flex-col items-start">
                <h3 className="text-lg font-semibold">{list.name}</h3>
                {list.description && (
                  <p className="text-sm text-gray-500">{list.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {list.items?.length || 0} movies
                </span>
                {!list.is_default && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEditClick(e, list)}
                      className={`p-2 rounded-full ${variants.button.text.base} ${variants.button.text.hover}`}
                      aria-label="Edit list"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, list)}
                      className={`p-2 rounded-full ${variants.button.text.base} ${variants.button.text.hover}`}
                      aria-label="Delete list"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {expandedListId === list.id ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </div>
            </div>
            
            {expandedListId === list.id && list.items && list.items.length > 0 && (
              <div className="px-6 pb-4">
                <MovieList
                  movies={list.items.map(item => ({
                    id: item.movie_id,
                    title: item.movie_title,
                    poster_path: item.movie_poster_path,
                    release_date: item.movie_release_date,
                    vote_average: item.movie_vote_average
                  }))}
                  onMovieClick={(movie) => {
                    navigate(`/my-lists/movie/${movie.id}`);
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

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

      {/* Create List Modal */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateList={handleCreateList}
      />

      {/* Edit List Modal */}
      <EditListModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedList(null);
        }}
        onUpdateList={handleUpdateList}
        list={selectedList}
      />
    </div>
  );
};

export default MyLists; 