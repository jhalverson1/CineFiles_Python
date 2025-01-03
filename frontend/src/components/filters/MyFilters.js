import { useState, useEffect } from 'react';
import { filterSettingsApi, movieApi } from '../../utils/api';

const MyFilters = () => {
  const [filters, setFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [genres, setGenres] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  
  // Filter criteria states
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [yearRange, setYearRange] = useState(null);
  const [ratingRange, setRatingRange] = useState(null);
  const [popularityRange, setPopularityRange] = useState(null);

  useEffect(() => {
    loadFilters();
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setIsLoadingGenres(true);
      console.log('Starting genre fetch in MyFilters...');
      const response = await movieApi.getMovieGenres();
      console.log('Genre response in MyFilters:', response);
      if (response && response.genres) {
        setGenres(response.genres);
        console.log('Set genres:', response.genres);
      } else {
        console.error('Invalid genre response format:', response);
      }
    } catch (error) {
      console.error('Failed to load genres:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setIsLoadingGenres(false);
    }
  };

  const loadFilters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await filterSettingsApi.getFilterSettings();
      setFilters(response || []);
    } catch (error) {
      console.error('Failed to load filters:', error);
      setError('Failed to load filters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFilter = async (id) => {
    try {
      setError(null);
      await filterSettingsApi.deleteFilterSetting(id);
      await loadFilters();
    } catch (error) {
      console.error('Failed to delete filter:', error);
      setError('Failed to delete filter. Please try again.');
    }
  };

  const handleEditFilter = (filter) => {
    setCurrentFilter(filter);
    setFilterName(filter.name);
    
    // Parse and set filter criteria
    if (filter.year_range) {
      setYearRange(JSON.parse(filter.year_range));
    }
    if (filter.rating_range) {
      setRatingRange(JSON.parse(filter.rating_range));
    }
    if (filter.popularity_range) {
      setPopularityRange(JSON.parse(filter.popularity_range));
    }
    if (filter.genres) {
      setSelectedGenres(JSON.parse(filter.genres));
    }
    
    setEditModalOpen(true);
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim() || !currentFilter) return;

    try {
      setError(null);
      const filterData = {
        name: filterName,
        year_range: yearRange ? JSON.stringify(yearRange) : null,
        rating_range: ratingRange ? JSON.stringify(ratingRange) : null,
        popularity_range: popularityRange ? JSON.stringify(popularityRange) : null,
        genres: selectedGenres.length > 0 ? JSON.stringify(selectedGenres) : null,
      };

      await filterSettingsApi.updateFilterSetting(currentFilter.id, filterData);
      handleCloseModal();
      await loadFilters();
    } catch (error) {
      console.error('Failed to update filter:', error);
      setError('Failed to update filter. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setError(null);
    setFilterName('');
    setCurrentFilter(null);
    setYearRange(null);
    setRatingRange(null);
    setPopularityRange(null);
    setSelectedGenres([]);
  };

  const formatFilterDescription = (filter) => {
    const parts = [];
    
    if (filter.year_range) {
      const [start, end] = JSON.parse(filter.year_range);
      parts.push(`Years: ${start}-${end}`);
    }
    
    if (filter.rating_range) {
      const [start, end] = JSON.parse(filter.rating_range);
      parts.push(`Rating: ${start}-${end}`);
    }
    
    if (filter.popularity_range) {
      const [start, end] = JSON.parse(filter.popularity_range);
      parts.push(`Popularity: ${start.toLocaleString()}-${end.toLocaleString()}`);
    }
    
    if (filter.genres) {
      const selectedGenreIds = JSON.parse(filter.genres);
      if (selectedGenreIds.length > 0) {
        const genreNames = selectedGenreIds
          .map(id => genres.find(g => g.id === id)?.name)
          .filter(Boolean);
        parts.push(`Genres: ${genreNames.join(', ')}`);
      }
    }
    
    return parts.join(' • ');
  };

  const handleGenreClick = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Filters</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">You haven't saved any filters yet.</p>
            <p className="text-sm text-text-secondary">
              Create and save filters while browsing movies to see them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className="bg-background-secondary rounded-lg p-4 border border-border/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{filter.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditFilter(filter)}
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md"
                      aria-label="Edit filter"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="p-2 text-text-secondary hover:text-red-500 transition-colors rounded-md"
                      aria-label="Delete filter"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  {formatFilterDescription(filter)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Filter Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background-secondary rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Edit Filter</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {error}
              </div>
            )}
            
            {/* Filter Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Filter Name</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter filter name"
                className="w-full px-4 py-2 bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Genres */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Genres</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {isLoadingGenres ? (
                  <div className="col-span-full flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreClick(genre.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedGenres.includes(genre.id)
                          ? 'bg-primary text-white'
                          : 'bg-background-tertiary/30 hover:bg-background-active'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Year Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Year Range</label>
              <div className="flex items-center gap-3">
                <select
                  value={yearRange?.[0] || new Date().getFullYear()}
                  onChange={(e) => setYearRange([parseInt(e.target.value), yearRange?.[1] || new Date().getFullYear()])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="text-sm text-text-secondary font-medium">to</span>
                <select
                  value={yearRange?.[1] || new Date().getFullYear()}
                  onChange={(e) => setYearRange([yearRange?.[0] || 1900, parseInt(e.target.value)])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Rating Range</label>
              <div className="flex items-center gap-3">
                <select
                  value={ratingRange?.[0] || 0}
                  onChange={(e) => setRatingRange([parseFloat(e.target.value), ratingRange?.[1] || 10])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 11 }, (_, i) => i).map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
                <span className="text-sm text-text-secondary font-medium">to</span>
                <select
                  value={ratingRange?.[1] || 10}
                  onChange={(e) => setRatingRange([ratingRange?.[0] || 0, parseFloat(e.target.value)])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 11 }, (_, i) => i).map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Popularity Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Popularity Range</label>
              <div className="flex items-center gap-3">
                <select
                  value={popularityRange?.[0] || 0}
                  onChange={(e) => setPopularityRange([parseInt(e.target.value), popularityRange?.[1] || 1000000])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {[0, 100, 500, 1000, 5000, 10000, 50000, 100000, 1000000].map(value => (
                    <option key={value} value={value}>{value.toLocaleString()}</option>
                  ))}
                </select>
                <span className="text-sm text-text-secondary font-medium">to</span>
                <select
                  value={popularityRange?.[1] || 1000000}
                  onChange={(e) => setPopularityRange([popularityRange?.[0] || 0, parseInt(e.target.value)])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {[0, 100, 500, 1000, 5000, 10000, 50000, 100000, 1000000].map(value => (
                    <option key={value} value={value}>{value.toLocaleString()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-background-tertiary hover:bg-background-tertiary/80 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFilters; 