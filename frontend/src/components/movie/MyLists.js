import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLists, createList, updateList, deleteList, removeMovieFromList } from '../../utils/api';
import { movieApi } from '../../utils/api';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../../utils/image';
import MovieList from './MovieList';
import { AnimatePresence, motion } from 'framer-motion';

const MyLists = () => {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [expandedListId, setExpandedListId] = useState(null);
  const [movieDetails, setMovieDetails] = useState({});
  const [loadingMovies, setLoadingMovies] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await getLists();
      setLists(response);
    } catch (error) {
      let errorMessage = 'Failed to load lists';
      if (error.response?.status === 404) {
        errorMessage = 'Lists endpoint not found. Please check API configuration.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to view your lists';
        navigate('/login');
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovieDetails = async (movieIds) => {
    setLoadingMovies(true);
    try {
      const details = {};
      await Promise.all(
        movieIds.map(async (movieId) => {
          if (!movieDetails[movieId]) {
            const movieData = await movieApi.getMovieDetails(movieId);
            details[movieId] = movieData;
          }
        })
      );
      setMovieDetails(prev => ({ ...prev, ...details }));
    } catch (error) {
      console.error('Failed to fetch movie details:', error);
      toast.error('Failed to load some movie details');
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    
    // Check for duplicate list name (case-insensitive)
    const isDuplicate = lists.some(list => 
      list.name.toLowerCase() === formData.name.toLowerCase()
    );
    
    if (isDuplicate) {
      toast.error('A list with this name already exists');
      return;
    }

    try {
      const response = await createList(formData.name, formData.description);
      setLists([...lists, response]);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      toast.success('List created successfully');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to create list');
      }
    }
  };

  const handleUpdateList = async (e) => {
    e.preventDefault();
    
    // Check for duplicate list name (case-insensitive), excluding the current list
    const isDuplicate = lists.some(list => 
      list.id !== editingList.id && 
      list.name.toLowerCase() === formData.name.toLowerCase()
    );
    
    if (isDuplicate) {
      toast.error('A list with this name already exists');
      return;
    }

    try {
      const response = await updateList(editingList.id, formData);
      setLists(lists.map(list => 
        list.id === editingList.id ? response : list
      ));
      setEditingList(null);
      setFormData({ name: '', description: '' });
      toast.success('List updated successfully');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to update list');
      }
    }
  };

  const handleDeleteList = async (list) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    
    try {
      await deleteList(list.id);
      setLists(lists.filter(l => l.id !== list.id));
      toast.success('List deleted successfully');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to delete list');
      }
    }
  };

  const startEdit = (list) => {
    setEditingList(list);
    setFormData({ name: list.name, description: list.description || '' });
  };

  const handleCancel = () => {
    setEditingList(null);
    setShowCreateModal(false);
    setFormData({ name: '', description: '' });
  };

  const toggleList = async (listId) => {
    const newExpandedListId = expandedListId === listId ? null : listId;
    setExpandedListId(newExpandedListId);
    
    if (newExpandedListId) {
      const list = lists.find(l => l.id === listId);
      const movieIds = list.items.map(item => item.movie_id);
      const unfetchedMovieIds = movieIds.filter(id => !movieDetails[id]);
      
      if (unfetchedMovieIds.length > 0) {
        await fetchMovieDetails(unfetchedMovieIds);
      }
    }
  };

  const handleRemoveMovie = async (e, listId, movieId) => {
    e.stopPropagation(); // Prevent navigation when clicking remove button
    
    try {
      await removeMovieFromList(listId, movieId);
      // Update local state to remove the movie
      setLists(lists.map(list => 
        list.id === listId
          ? { ...list, items: list.items.filter(item => item.movie_id !== movieId) }
          : list
      ));
      toast.success('Movie removed from list');
    } catch (error) {
      console.error('Failed to remove movie:', error);
      toast.error('Failed to remove movie from list');
    }
  };

  const renderListItem = (item, listId) => {
    const movie = movieDetails[item.movie_id];
    
    return (
      <div 
        key={item.id} 
        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-4 cursor-pointer group"
        onClick={() => navigate(`/movies/${item.movie_id}`)}
      >
        <div className="flex-shrink-0 w-12 h-16">
          <img
            src={getImageUrl(movie?.poster_path, 'w92')}
            alt={movie?.title || 'Movie poster'}
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {movie?.title || 'Loading...'}
                </p>
                {movie?.release_date && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({new Date(movie.release_date).getFullYear()})
                  </span>
                )}
              </div>
              {movie?.vote_average > 0 && (
                <p className="text-xs text-yellow-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {movie.vote_average.toFixed(1)}
                </p>
              )}
              {item.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.notes}
                </p>
              )}
            </div>
            <button
              onClick={(e) => handleRemoveMovie(e, listId, item.movie_id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4 p-1 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Remove from list"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-primary">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold pl-2 border-l-[6px] border-primary">My Lists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-background-secondary hover:bg-background-active text-primary px-4 py-2 rounded transition-colors"
        >
          Create New List
        </button>
      </div>

      {/* Lists Accordion */}
      <div className="space-y-4">
        {lists.map(list => (
          <div key={list.id} className="bg-background-secondary/50 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border border-border">
            {/* List Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-background-active transition-colors flex items-center justify-between"
              onClick={() => toggleList(list.id)}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{list.name}</h3>
                    <p className="text-text-secondary text-sm">
                      {list.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-text-secondary text-sm">
                      {list.items.length} movies
                    </span>
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${expandedListId === list.id ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              {!list.is_default && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(list);
                    }}
                    className="text-primary hover:text-text-secondary transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list);
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* List Items */}
            {expandedListId === list.id && (
              <motion.div 
                className="border-t border-border"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {loadingMovies ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    <p className="mt-2 text-text-secondary">Loading movies...</p>
                  </div>
                ) : list.items.length > 0 ? (
                  <div className="p-4">
                    <MovieList
                      movies={list.items.map(item => ({
                        ...movieDetails[item.movie_id],
                        listItemId: item.id // Add the list item ID for removal
                      })).filter(Boolean)}
                      viewMode="grid"
                      isCompact={true}
                      listId={list.id}
                      onRemoveFromList={async (movieId) => {
                        try {
                          await removeMovieFromList(list.id, movieId);
                          // Update local state to remove the movie
                          setLists(lists.map(l => 
                            l.id === list.id
                              ? { ...l, items: l.items.filter(item => item.movie_id !== movieId.toString()) }
                              : l
                          ));
                          toast.success('Movie removed from list');
                        } catch (error) {
                          console.error('Failed to remove movie:', error);
                          toast.error('Failed to remove movie from list');
                        }
                      }}
                      onWatchedToggle={list.name === 'Watched' ? async (movieId) => {
                        // When a movie is unwatched in the Watched list, remove it from the list
                        setLists(lists.map(l => 
                          l.id === list.id
                            ? { ...l, items: l.items.filter(item => item.movie_id !== movieId.toString()) }
                            : l
                        ));
                      } : undefined}
                      onWatchlistToggle={list.name === 'Watchlist' ? async (movieId) => {
                        // When a movie is unbookmarked in the Watchlist, remove it from the list
                        setLists(lists.map(l => 
                          l.id === list.id
                            ? { ...l, items: l.items.filter(item => item.movie_id !== movieId.toString()) }
                            : l
                        ));
                      } : undefined}
                    />
                  </div>
                ) : (
                  <div className="p-4 text-center text-text-secondary">
                    No movies in this list yet
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingList) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background-secondary rounded-lg p-6 w-full max-w-md border border-border">
            <h2 className="text-2xl font-bold mb-4">
              {editingList ? 'Edit List' : 'Create New List'}
            </h2>
            <form onSubmit={editingList ? handleUpdateList : handleCreateList}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-text-secondary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-background-secondary hover:bg-background-active text-primary px-4 py-2 rounded transition-colors"
                >
                  {editingList ? 'Save Changes' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLists; 