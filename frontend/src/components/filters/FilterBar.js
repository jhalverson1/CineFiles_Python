import { useState, useEffect, useRef } from 'react';
import { movieApi, filterSettingsApi } from '../../utils/api';

const FilterBar = ({
  yearRange,
  onYearRangeChange,
  ratingRange,
  onRatingRangeChange,
  popularityRange,
  onPopularityRangeChange,
  selectedGenres = [],
  onGenresChange,
  genres = [],
  isLoadingGenres = true
}) => {
  const [yearOpen, setYearOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [popularityOpen, setPopularityOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [savedFilters, setSavedFilters] = useState([]);
  const [isLoadingSavedFilters, setIsLoadingSavedFilters] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(null);
  
  const genreRef = useRef(null);
  const yearRef = useRef(null);
  const ratingRef = useRef(null);
  const popularityRef = useRef(null);
  const saveModalRef = useRef(null);
  const loadModalRef = useRef(null);

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearRef.current && !yearRef.current.contains(event.target)) {
        setYearOpen(false);
      }
      if (ratingRef.current && !ratingRef.current.contains(event.target)) {
        setRatingOpen(false);
      }
      if (popularityRef.current && !popularityRef.current.contains(event.target)) {
        setPopularityOpen(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target)) {
        setGenreOpen(false);
      }
      if (saveModalRef.current && !saveModalRef.current.contains(event.target)) {
        setSaveModalOpen(false);
      }
      if (loadModalRef.current && !loadModalRef.current.contains(event.target)) {
        setLoadModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSavedFilters = async () => {
    try {
      setIsLoadingSavedFilters(true);
      setError(null);
      const response = await filterSettingsApi.getFilterSettings();
      setSavedFilters(response || []);
    } catch (error) {
      console.error('Failed to load saved filters:', error);
      setError('Failed to load saved filters. Please try again.');
      setSavedFilters([]);
    } finally {
      setIsLoadingSavedFilters(false);
    }
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;

    try {
      setError(null);
      const filterData = {
        name: filterName,
        year_range: yearRange ? JSON.stringify(yearRange) : null,
        rating_range: ratingRange ? JSON.stringify(ratingRange) : null,
        popularity_range: popularityRange ? JSON.stringify(popularityRange) : null,
        genres: selectedGenres && selectedGenres.length > 0 ? JSON.stringify(selectedGenres) : null,
      };

      if (currentFilter) {
        // Update existing filter
        await filterSettingsApi.updateFilterSetting(currentFilter.id, filterData);
      } else {
        // Create new filter
        await filterSettingsApi.createFilterSetting(filterData);
      }
      
      setSaveModalOpen(false);
      setFilterName('');
      setCurrentFilter(null);
      await loadSavedFilters();
    } catch (error) {
      console.error('Failed to save filter:', error);
      setError('Failed to save filter. Please try again.');
    }
  };

  const handleLoadFilter = async (filter) => {
    try {
      setError(null);
      const yearRangeValue = filter.year_range ? JSON.parse(filter.year_range) : null;
      const ratingRangeValue = filter.rating_range ? JSON.parse(filter.rating_range) : null;
      const popularityRangeValue = filter.popularity_range ? JSON.parse(filter.popularity_range) : null;
      const genresValue = filter.genres ? JSON.parse(filter.genres) : [];

      if (yearRangeValue) onYearRangeChange(yearRangeValue);
      if (ratingRangeValue) onRatingRangeChange(ratingRangeValue);
      if (popularityRangeValue) onPopularityRangeChange(popularityRangeValue);
      if (genresValue) onGenresChange(genresValue);

      // Set the current filter and filter name
      setCurrentFilter(filter);
      setFilterName(filter.name);
      
      setLoadModalOpen(false);
    } catch (error) {
      console.error('Failed to load filter:', error);
      setError('Failed to load filter. Please try again.');
    }
  };

  const handleDeleteFilter = async (id, event) => {
    event.stopPropagation();
    try {
      setError(null);
      await filterSettingsApi.deleteFilterSetting(id);
      await loadSavedFilters();
    } catch (error) {
      console.error('Failed to delete filter:', error);
      setError('Failed to delete filter. Please try again.');
    }
  };

  const getGenresText = () => {
    if (!selectedGenres || selectedGenres.length === 0) return 'Genres';
    if (selectedGenres.length === 1) {
      const genre = genres.find(g => g.id === selectedGenres[0]);
      return genre ? genre.name : 'Genres';
    }
    return `${selectedGenres.length} Genres`;
  };

  const getYearRangeText = () => {
    if (!yearRange || yearRange.length !== 2) return 'Year';
    return `${yearRange[0]} - ${yearRange[1]}`;
  };

  const getRatingRangeText = () => {
    if (!ratingRange || ratingRange.length !== 2) return 'Rating';
    return `${ratingRange[0]} - ${ratingRange[1]}`;
  };

  const getPopularityRangeText = () => {
    if (!popularityRange || popularityRange.length !== 2) return 'Popularity';
    return `${popularityRange[0]} - ${popularityRange[1]}`;
  };

  const handleGenreClick = (genreId) => {
    const newSelectedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    onGenresChange(newSelectedGenres);
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
        if (genreNames.length === 1) {
          parts.push(`Genre: ${genreNames[0]}`);
        } else if (genreNames.length > 1) {
          parts.push(`Genres: ${genreNames.length}`);
        }
      }
    }
    
    return parts.join(' • ');
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 justify-between">
      {/* Backend Filters Group */}
      <div className="flex-1 flex flex-col md:flex-row gap-2">
        <div className="relative w-full md:w-auto" ref={genreRef}>
          <button
            onClick={() => setGenreOpen(!genreOpen)}
            className="w-full md:w-auto px-4 py-3 md:py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center justify-between md:justify-start gap-2 min-w-[120px]"
          >
            <span className="truncate">{getGenresText()}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${genreOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {genreOpen && (
            <div className="absolute z-50 mt-2 min-w-[200px] w-full bg-background-secondary rounded-lg shadow-lg overflow-hidden">
              {isLoadingGenres ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto scrollbar-hide">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreClick(genre.id)}
                      className="w-full px-4 py-3 md:py-2 text-left text-sm hover:bg-background-active transition-colors flex items-center gap-2"
                    >
                      <span className="w-4 h-4 flex-shrink-0">
                        {selectedGenres.includes(genre.id) && (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {genre.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative w-full md:w-auto" ref={yearRef}>
          <button
            onClick={() => setYearOpen(!yearOpen)}
            className="w-full md:w-auto px-4 py-3 md:py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center justify-between md:justify-start gap-2 min-w-[120px]"
          >
            <span className="truncate">{getYearRangeText()}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${yearOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {yearOpen && (
            <div className="absolute z-50 mt-2 min-w-[300px] w-full bg-background-secondary rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <select
                    value={yearRange?.[0] || new Date().getFullYear()}
                    onChange={(e) => onYearRangeChange([parseInt(e.target.value), yearRange?.[1] || new Date().getFullYear()])}
                    className="w-full md:w-auto flex-1 h-12 md:h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  >
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <span className="text-sm text-text-secondary font-medium">to</span>
                  <select
                    value={yearRange?.[1] || new Date().getFullYear()}
                    onChange={(e) => onYearRangeChange([yearRange?.[0] || 1900, parseInt(e.target.value)])}
                    className="w-full md:w-auto flex-1 h-12 md:h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  >
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative w-full md:w-auto" ref={ratingRef}>
          <button
            onClick={() => setRatingOpen(!ratingOpen)}
            className="w-full md:w-auto px-4 py-3 md:py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center justify-between md:justify-start gap-2 min-w-[120px]"
          >
            <span className="truncate">{getRatingRangeText()}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${ratingOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {ratingOpen && (
            <div className="absolute z-50 mt-2 min-w-[200px] w-full bg-background-secondary rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <select
                    value={ratingRange?.[0] || 0}
                    onChange={(e) => onRatingRangeChange([parseFloat(e.target.value), ratingRange?.[1] || 10])}
                    className="w-full md:w-auto flex-1 h-12 md:h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  >
                    {Array.from({ length: 11 }, (_, i) => i).map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                  <span className="text-sm text-text-secondary font-medium">to</span>
                  <select
                    value={ratingRange?.[1] || 10}
                    onChange={(e) => onRatingRangeChange([ratingRange?.[0] || 0, parseFloat(e.target.value)])}
                    className="w-full md:w-auto flex-1 h-12 md:h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  >
                    {Array.from({ length: 11 }, (_, i) => i).map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative w-full md:w-auto" ref={popularityRef}>
          <button
            onClick={() => setPopularityOpen(!popularityOpen)}
            className="w-full md:w-auto px-4 py-3 md:py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center justify-between md:justify-start gap-2 min-w-[120px]"
          >
            <span className="truncate">{getPopularityRangeText()}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${popularityOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {popularityOpen && (
            <div className="absolute z-50 mt-2 min-w-[300px] w-full bg-background-secondary rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <select
                    value={popularityRange?.[0] || 0}
                    onChange={(e) => onPopularityRangeChange([parseInt(e.target.value), popularityRange?.[1] || 1000000])}
                    className="w-full md:w-auto flex-1 h-12 md:h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  >
                    {[0, 100, 500, 1000, 5000, 10000, 50000, 100000, 1000000].map(value => (
                      <option key={value} value={value}>{value.toLocaleString()}</option>
                    ))}
                  </select>
                  <span className="text-sm text-text-secondary font-medium">to</span>
                  <select
                    value={popularityRange?.[1] || 1000000}
                    onChange={(e) => onPopularityRangeChange([popularityRange?.[0] || 0, parseInt(e.target.value)])}
                    className="w-full md:w-auto flex-1 h-12 md:h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  >
                    {[0, 100, 500, 1000, 5000, 10000, 50000, 100000, 1000000].map(value => (
                      <option key={value} value={value}>{value.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save/Load Buttons Group */}
      <div className="flex gap-2 md:ml-4">
        <button
          onClick={() => setSaveModalOpen(true)}
          className="w-10 h-10 md:h-9 flex items-center justify-center bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium group relative"
          aria-label="Save Filter"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-12a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h4a2 2 0 002-2M8 5v4a2 2 0 002 2h4a2 2 0 002-2V5" />
          </svg>
          <span className="absolute bottom-full mb-2 hidden group-hover:block bg-background-tertiary text-text-primary text-xs px-2 py-1 rounded whitespace-nowrap">
            Save Filter
          </span>
        </button>
        
        {/* Option 1: Folder Open */}
        <button
          onClick={() => setLoadModalOpen(true)}
          className="w-10 h-10 md:h-9 flex items-center justify-center bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium group relative"
          aria-label="Load Filter"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <span className="absolute bottom-full mb-2 hidden group-hover:block bg-background-tertiary text-text-primary text-xs px-2 py-1 rounded whitespace-nowrap">
            Load Filter
          </span>
        </button>

        {/* Option 2: List Bullet (commented out)
        <button
          onClick={() => setLoadModalOpen(true)}
          className="w-10 h-10 md:h-9 flex items-center justify-center bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium group relative"
          aria-label="Load Filter"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="absolute bottom-full mb-2 hidden group-hover:block bg-background-tertiary text-text-primary text-xs px-2 py-1 rounded whitespace-nowrap">
            Load Filter
          </span>
        </button>
        */}

        {/* Option 3: Collection (commented out)
        <button
          onClick={() => setLoadModalOpen(true)}
          className="w-10 h-10 md:h-9 flex items-center justify-center bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium group relative"
          aria-label="Load Filter"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="absolute bottom-full mb-2 hidden group-hover:block bg-background-tertiary text-text-primary text-xs px-2 py-1 rounded whitespace-nowrap">
            Load Filter
          </span>
        </button>
        */}
      </div>

      {/* Save Filter Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div ref={saveModalRef} className="bg-background-secondary rounded-lg p-6 w-full max-w-md mt-20">
            <h3 className="text-lg font-medium mb-4">{currentFilter ? 'Update Filter' : 'Save Filter'}</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {error}
              </div>
            )}
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name"
              className="w-full px-4 py-2 bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSaveModalOpen(false);
                  setError(null);
                  if (currentFilter) {
                    setFilterName('');
                    setCurrentFilter(null);
                  }
                }}
                className="px-4 py-2 bg-background-tertiary hover:bg-background-tertiary/80 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium"
              >
                {currentFilter ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Filter Modal */}
      {loadModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div ref={loadModalRef} className="bg-background-secondary rounded-lg p-6 w-full max-w-md mt-20">
            <h3 className="text-lg font-medium mb-4">Load Filter</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {error}
              </div>
            )}
            {isLoadingSavedFilters ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : savedFilters.length === 0 ? (
              <p className="text-text-secondary text-center py-4">No saved filters</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    onClick={() => handleLoadFilter(filter)}
                    className="flex flex-col p-3 bg-background-tertiary/30 rounded-lg cursor-pointer hover:bg-background-active/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{filter.name}</span>
                      <button
                        onClick={(e) => handleDeleteFilter(filter.id, e)}
                        className="text-text-secondary hover:text-text-primary"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatFilterDescription(filter)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setLoadModalOpen(false);
                  setError(null);
                }}
                className="px-4 py-2 bg-background-tertiary hover:bg-background-tertiary/80 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar; 