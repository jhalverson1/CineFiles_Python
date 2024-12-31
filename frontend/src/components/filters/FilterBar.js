import { useState, useEffect, useRef } from 'react';
import { movieApi } from '../../utils/api';

const FilterBar = ({
  yearRange,
  onYearRangeChange,
  ratingRange,
  onRatingRangeChange,
  popularityRange,
  onPopularityRangeChange,
  selectedGenres = [],
  onGenresChange,
  excludedLists = [],
  onExcludeListsChange,
  lists = [],
  genres = [],
  isLoadingGenres = true
}) => {
  const [yearOpen, setYearOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [popularityOpen, setPopularityOpen] = useState(false);
  const [excludeOpen, setExcludeOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  
  const genreRef = useRef(null);
  const yearRef = useRef(null);
  const ratingRef = useRef(null);
  const popularityRef = useRef(null);
  const excludeRef = useRef(null);

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
      if (excludeRef.current && !excludeRef.current.contains(event.target)) {
        setExcludeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGenresText = () => {
    if (selectedGenres.length === 0) return 'Genres';
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

  const getExcludeListsText = () => {
    if (!excludedLists || excludedLists.length === 0) return 'Exclude Lists';
    const excludedNames = lists
      .filter(list => excludedLists.includes(list.id))
      .map(list => list.name);
    return excludedNames.join(', ');
  };

  const handleGenreClick = (genreId) => {
    const newSelectedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    onGenresChange(newSelectedGenres);
  };

  return (
    <div className="flex gap-2 mb-4">
      <div className="relative" ref={excludeRef}>
        <button
          onClick={() => setExcludeOpen(!excludeOpen)}
          className="px-4 py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 min-w-[120px]"
        >
          <span className="truncate">{getExcludeListsText()}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${excludeOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {excludeOpen && (
          <div className="absolute z-[100] mt-2 w-64 bg-background-secondary/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg overflow-hidden left-0">
            <div className="max-h-60 overflow-y-auto scrollbar-hide py-1">
              {lists.map((list) => (
                <button
                  key={list.id}
                  className="w-full flex items-center px-4 py-2 hover:bg-background-active/50 cursor-pointer transition-colors duration-200 group text-left"
                  onClick={() => onExcludeListsChange(
                    excludedLists.includes(list.id)
                      ? excludedLists.filter(id => id !== list.id)
                      : [...excludedLists, list.id]
                  )}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mr-3 ${
                    excludedLists.includes(list.id)
                      ? 'bg-primary border-primary/80'
                      : 'border-text-disabled/30 group-hover:border-text-disabled/50'
                  }`}>
                    {excludedLists.includes(list.id) && (
                      <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-text-primary group-hover:text-text-primary/90">
                    {list.name}
                    <span className="ml-2 text-xs text-text-secondary px-2 py-0.5 rounded-full bg-background-tertiary/30">
                      {list.items?.length || 0}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={genreRef}>
        <button
          onClick={() => setGenreOpen(!genreOpen)}
          className="px-4 py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 min-w-[120px]"
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
          <div className="absolute z-50 mt-2 w-64 bg-background-secondary rounded-lg shadow-lg overflow-hidden">
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
                    className="w-full px-4 py-2 text-left text-sm hover:bg-background-active transition-colors flex items-center gap-2"
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

      <div className="relative" ref={yearRef}>
        <button
          onClick={() => setYearOpen(!yearOpen)}
          className="px-4 py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 min-w-[120px]"
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
          <div className="absolute z-50 mt-2 w-64 bg-background-secondary rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <select
                  value={yearRange?.[0] || new Date().getFullYear()}
                  onChange={(e) => onYearRangeChange([parseInt(e.target.value), yearRange?.[1] || new Date().getFullYear()])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="text-sm text-text-secondary font-medium">to</span>
                <select
                  value={yearRange?.[1] || new Date().getFullYear()}
                  onChange={(e) => onYearRangeChange([yearRange?.[0] || 1900, parseInt(e.target.value)])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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

      <div className="relative" ref={ratingRef}>
        <button
          onClick={() => setRatingOpen(!ratingOpen)}
          className="px-4 py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 min-w-[120px]"
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
          <div className="absolute z-50 mt-2 w-64 bg-background-secondary rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <select
                  value={ratingRange?.[0] || 0}
                  onChange={(e) => onRatingRangeChange([parseFloat(e.target.value), ratingRange?.[1] || 10])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  {Array.from({ length: 11 }, (_, i) => i).map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
                <span className="text-sm text-text-secondary font-medium">to</span>
                <select
                  value={ratingRange?.[1] || 10}
                  onChange={(e) => onRatingRangeChange([ratingRange?.[0] || 0, parseFloat(e.target.value)])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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

      <div className="relative" ref={popularityRef}>
        <button
          onClick={() => setPopularityOpen(!popularityOpen)}
          className="px-4 py-2 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 min-w-[120px]"
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
          <div className="absolute z-50 mt-2 w-64 bg-background-secondary rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <select
                  value={popularityRange?.[0] || 0}
                  onChange={(e) => onPopularityRangeChange([parseInt(e.target.value), popularityRange?.[1] || 1000000])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  {[0, 100, 500, 1000, 5000, 10000, 50000, 100000, 1000000].map(value => (
                    <option key={value} value={value}>{value.toLocaleString()}</option>
                  ))}
                </select>
                <span className="text-sm text-text-secondary font-medium">to</span>
                <select
                  value={popularityRange?.[1] || 1000000}
                  onChange={(e) => onPopularityRangeChange([popularityRange?.[0] || 0, parseInt(e.target.value)])}
                  className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary rounded-lg border border-border/10 hover:border-border/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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

      <button
        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium ml-auto"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default FilterBar; 