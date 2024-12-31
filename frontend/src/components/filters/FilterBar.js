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
      setSavedFilters(response.data || []);
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

      await filterSettingsApi.createFilterSetting(filterData);
      setSaveModalOpen(false);
      setFilterName('');
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

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4 justify-between">
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
            <div className="absolute z-50 mt-2 w-full bg-background-secondary rounded-lg shadow-lg overflow-hidden">
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
            <div className="absolute z-50 mt-2 w-full bg-background-secondary rounded-lg shadow-lg overflow-hidden">
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
            <div className="absolute z-50 mt-2 w-full bg-background-secondary rounded-lg shadow-lg overflow-hidden">
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
            <div className="absolute z-50 mt-2 w-full bg-background-secondary rounded-lg shadow-lg overflow-hidden">
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

      {/* Save/Load Buttons Group - Now outside the filters group */}
      <div className="flex gap-2 md:ml-4">
        <button
          onClick={() => setSaveModalOpen(true)}
          className="w-full md:w-auto px-4 py-3 md:py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium"
        >
          Save Filter
        </button>
        <button
          onClick={() => setLoadModalOpen(true)}
          className="w-full md:w-auto px-4 py-3 md:py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium"
        >
          Load Filter
        </button>
      </div>

      {/* Save Filter Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div ref={saveModalRef} className="bg-background-secondary rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Save Filter</h3>
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
                }}
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

      {/* Load Filter Modal */}
      {loadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div ref={loadModalRef} className="bg-background-secondary rounded-lg p-6 w-full max-w-md">
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
                    className="flex items-center justify-between p-3 bg-background-tertiary/30 rounded-lg cursor-pointer hover:bg-background-active/50"
                  >
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