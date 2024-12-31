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
  lists = []
}) => {
  const [yearOpen, setYearOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [popularityOpen, setPopularityOpen] = useState(false);
  const [excludeOpen, setExcludeOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);

  // Fetch genres when component mounts
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await movieApi.getMovieGenres();
        setGenres(response.genres || []);
      } catch (err) {
        console.error('Error fetching genres:', err);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

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

  const getGenresText = () => {
    if (!selectedGenres || selectedGenres.length === 0) return 'Genres';
    const selectedNames = genres
      .filter(genre => selectedGenres.includes(genre.id))
      .map(genre => genre.name);
    return selectedNames.join(', ');
  };

  const handleGenreClick = (genreId) => {
    const isSelected = selectedGenres.includes(genreId);
    const newSelectedGenres = isSelected
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    onGenresChange(newSelectedGenres);
  };

  return (
    <div className="flex gap-2 mb-4">
      <div className="relative">
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
          <div className="absolute z-50 mt-2 w-64 bg-background-secondary rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => onExcludeListsChange(
                    excludedLists.includes(list.id)
                      ? excludedLists.filter(id => id !== list.id)
                      : [...excludedLists, list.id]
                  )}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-background-active transition-colors flex items-center gap-2"
                >
                  <span className="w-4 h-4 flex-shrink-0">
                    {excludedLists.includes(list.id) && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {list.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
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

      <div className="relative">
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
        {/* Year range dropdown content */}
      </div>

      <div className="relative">
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
        {/* Rating range dropdown content */}
      </div>

      <div className="relative">
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
        {/* Popularity range dropdown content */}
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