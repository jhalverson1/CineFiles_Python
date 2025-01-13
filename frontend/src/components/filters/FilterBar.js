import React, { useState, useEffect, useRef } from 'react';
import { variants, classes } from '../../utils/theme';

const ChevronIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const FilterSection = ({ title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className={variants.filter.section}>
      <button
        className={`w-full flex items-center justify-between py-2 text-black hover:text-gray-600 transition-colors`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-medium">{title}</span>
        <ChevronIcon 
          className={`w-5 h-5 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      {isExpanded && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  );
};

const FilterBar = ({
  yearRange,
  onYearRangeChange,
  ratingRange,
  onRatingRangeChange,
  selectedGenres,
  onGenresChange,
  genres = [],
  isLoadingGenres,
  sortBy,
  onSortByChange,
  watchProviders,
  onWatchProvidersChange,
  watchRegion,
  onWatchRegionChange,
  voteCountRange,
  onVoteCountRangeChange,
  runtimeRange,
  onRuntimeRangeChange,
  originalLanguage,
  onOriginalLanguageChange,
  spokenLanguages,
  onSpokenLanguagesChange,
  releaseTypes,
  onReleaseTypesChange,
  includeKeywords,
  onIncludeKeywordsChange,
  excludeKeywords,
  onExcludeKeywordsChange,
}) => {
  // State for staged changes
  const [stagedChanges, setStagedChanges] = useState({
    yearRange,
    ratingRange,
    selectedGenres,
    sortBy,
    watchProviders,
    watchRegion,
    voteCountRange,
    runtimeRange,
    originalLanguage,
    spokenLanguages,
    releaseTypes,
    includeKeywords,
    excludeKeywords,
  });

  // Update staged changes when props change (in case of external updates)
  useEffect(() => {
    setStagedChanges({
      yearRange,
      ratingRange,
      selectedGenres,
      sortBy,
      watchProviders,
      watchRegion,
      voteCountRange,
      runtimeRange,
      originalLanguage,
      spokenLanguages,
      releaseTypes,
      includeKeywords,
      excludeKeywords,
    });
  }, [
    yearRange,
    ratingRange,
    selectedGenres,
    sortBy,
    watchProviders,
    watchRegion,
    voteCountRange,
    runtimeRange,
    originalLanguage,
    spokenLanguages,
    releaseTypes,
    includeKeywords,
    excludeKeywords,
  ]);

  // Handler for applying all staged changes
  const handleApplyChanges = () => {
    onYearRangeChange(stagedChanges.yearRange);
    onRatingRangeChange(stagedChanges.ratingRange);
    onGenresChange(stagedChanges.selectedGenres);
    onSortByChange(stagedChanges.sortBy);
    onWatchProvidersChange(stagedChanges.watchProviders);
    onWatchRegionChange(stagedChanges.watchRegion);
    onVoteCountRangeChange(stagedChanges.voteCountRange);
    onRuntimeRangeChange(stagedChanges.runtimeRange);
    onOriginalLanguageChange(stagedChanges.originalLanguage);
    onSpokenLanguagesChange(stagedChanges.spokenLanguages);
    onReleaseTypesChange(stagedChanges.releaseTypes);
    onIncludeKeywordsChange(stagedChanges.includeKeywords);
    onExcludeKeywordsChange(stagedChanges.excludeKeywords);
  };

  // Handler for resetting all filters
  const handleReset = () => {
    const resetChanges = {
      yearRange: [1900, new Date().getFullYear()],
      ratingRange: [0, 10],
      selectedGenres: [],
      sortBy: null,
      watchProviders: [],
      watchRegion: 'US',
      voteCountRange: null,
      runtimeRange: null,
      originalLanguage: null,
      spokenLanguages: [],
      releaseTypes: [],
      includeKeywords: [],
      excludeKeywords: [],
    };
    setStagedChanges(resetChanges);
    
    // Also apply the reset changes immediately
    onYearRangeChange(resetChanges.yearRange);
    onRatingRangeChange(resetChanges.ratingRange);
    onGenresChange(resetChanges.selectedGenres);
    onSortByChange(resetChanges.sortBy);
    onWatchProvidersChange(resetChanges.watchProviders);
    onWatchRegionChange(resetChanges.watchRegion);
    onVoteCountRangeChange(resetChanges.voteCountRange);
    onRuntimeRangeChange(resetChanges.runtimeRange);
    onOriginalLanguageChange(resetChanges.originalLanguage);
    onSpokenLanguagesChange(resetChanges.spokenLanguages);
    onReleaseTypesChange(resetChanges.releaseTypes);
    onIncludeKeywordsChange(resetChanges.includeKeywords);
    onExcludeKeywordsChange(resetChanges.excludeKeywords);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main container with filters */}
      <div className="min-h-0 flex-1 flex flex-col">
        {/* Scrollable filter section */}
        <div className="overflow-y-auto flex-1">
          <div className="divide-y divide-gray-200">
            <FilterSection title="Genres">
              <div className="space-y-2">
                {genres.map(genre => (
                  <label
                    key={genre.id}
                    className={`flex items-center p-2 rounded-lg cursor-pointer ${
                      stagedChanges.selectedGenres.includes(genre.id)
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={stagedChanges.selectedGenres.includes(genre.id)}
                      onChange={() => {
                        const newSelectedGenres = stagedChanges.selectedGenres.includes(genre.id)
                          ? stagedChanges.selectedGenres.filter(id => id !== genre.id)
                          : [...stagedChanges.selectedGenres, genre.id];
                        setStagedChanges(prev => ({ ...prev, selectedGenres: newSelectedGenres }));
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm">{genre.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Year Range">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{stagedChanges.yearRange[0]}</span>
                  <span>{stagedChanges.yearRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={stagedChanges.yearRange[0]}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    yearRange: [parseInt(e.target.value), prev.yearRange[1]]
                  }))}
                  className={variants.filter.range}
                />
                <input
                  type="range"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={stagedChanges.yearRange[1]}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    yearRange: [prev.yearRange[0], parseInt(e.target.value)]
                  }))}
                  className={variants.filter.range}
                />
              </div>
            </FilterSection>

            <FilterSection title="Rating Range">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{stagedChanges.ratingRange[0].toFixed(1)}</span>
                  <span>{stagedChanges.ratingRange[1].toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={stagedChanges.ratingRange[0]}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    ratingRange: [parseFloat(e.target.value), prev.ratingRange[1]]
                  }))}
                  className={variants.filter.range}
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={stagedChanges.ratingRange[1]}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    ratingRange: [prev.ratingRange[0], parseFloat(e.target.value)]
                  }))}
                  className={variants.filter.range}
                />
              </div>
            </FilterSection>

            <FilterSection title="Vote Count Range">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{stagedChanges.voteCountRange?.[0] || 0}</span>
                  <span>{stagedChanges.voteCountRange?.[1] || 500000}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="1000"
                  value={stagedChanges.voteCountRange?.[0] || 0}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    voteCountRange: [parseInt(e.target.value), prev.voteCountRange?.[1] || 500000]
                  }))}
                  className={variants.filter.range}
                />
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="1000"
                  value={stagedChanges.voteCountRange?.[1] || 500000}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    voteCountRange: [prev.voteCountRange?.[0] || 0, parseInt(e.target.value)]
                  }))}
                  className={variants.filter.range}
                />
              </div>
            </FilterSection>

            <FilterSection title="Runtime Range (minutes)">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{stagedChanges.runtimeRange?.[0] || 0}</span>
                  <span>{stagedChanges.runtimeRange?.[1] || 360}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={stagedChanges.runtimeRange?.[0] || 0}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    runtimeRange: [parseInt(e.target.value), prev.runtimeRange?.[1] || 360]
                  }))}
                  className={variants.filter.range}
                />
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={stagedChanges.runtimeRange?.[1] || 360}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    runtimeRange: [prev.runtimeRange?.[0] || 0, parseInt(e.target.value)]
                  }))}
                  className={variants.filter.range}
                />
              </div>
            </FilterSection>

            <FilterSection title="Language">
              <div className="space-y-4">
                <select
                  value={stagedChanges.originalLanguage || ''}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    originalLanguage: e.target.value || null
                  }))}
                  className={variants.filter.select}
                >
                  <option value="">Any Language</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </FilterSection>

            <FilterSection title="Release Type">
              <div className="space-y-2">
                {[
                  { id: 1, name: 'Premiere' },
                  { id: 2, name: 'Theatrical (limited)' },
                  { id: 3, name: 'Theatrical' },
                  { id: 4, name: 'Digital' },
                  { id: 5, name: 'Physical' },
                  { id: 6, name: 'TV' }
                ].map(type => (
                  <label
                    key={type.id}
                    className={`flex items-center p-2 rounded-lg cursor-pointer ${
                      stagedChanges.releaseTypes.includes(type.id)
                        ? variants.filter.button.active
                        : variants.filter.button.inactive
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={stagedChanges.releaseTypes.includes(type.id)}
                      onChange={() => {
                        const newReleaseTypes = stagedChanges.releaseTypes.includes(type.id)
                          ? stagedChanges.releaseTypes.filter(id => id !== type.id)
                          : [...stagedChanges.releaseTypes, type.id];
                        setStagedChanges(prev => ({ ...prev, releaseTypes: newReleaseTypes }));
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm">{type.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Watch Providers">
              <div className="space-y-4">
                <select
                  value={stagedChanges.watchRegion}
                  onChange={(e) => setStagedChanges(prev => ({
                    ...prev,
                    watchRegion: e.target.value
                  }))}
                  className={variants.filter.select}
                >
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>

                <div className="space-y-2">
                  {[
                    { id: 8, name: 'Netflix' },
                    { id: 9, name: 'Prime Video' },
                    { id: 337, name: 'Disney Plus' },
                    { id: 384, name: 'HBO Max' },
                    { id: 15, name: 'Hulu' },
                    { id: 531, name: 'Paramount Plus' },
                    { id: 283, name: 'Crunchyroll' },
                    { id: 2, name: 'Apple TV' },
                    { id: 387, name: 'Peacock' },
                  ].map(provider => (
                    <label
                      key={provider.id}
                      className={`flex items-center p-2 rounded-lg cursor-pointer ${
                        stagedChanges.watchProviders.includes(provider.id)
                          ? variants.filter.button.active
                          : variants.filter.button.inactive
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={stagedChanges.watchProviders.includes(provider.id)}
                        onChange={() => {
                          const newWatchProviders = stagedChanges.watchProviders.includes(provider.id)
                            ? stagedChanges.watchProviders.filter(id => id !== provider.id)
                            : [...stagedChanges.watchProviders, provider.id];
                          setStagedChanges(prev => ({ ...prev, watchProviders: newWatchProviders }));
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm">{provider.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Sort By">
              <div className="space-y-2">
                {[
                  { value: 'popularity.desc', label: 'Most Popular' },
                  { value: 'popularity.asc', label: 'Least Popular' },
                  { value: 'vote_average.desc', label: 'Highest Rated' },
                  { value: 'vote_average.asc', label: 'Lowest Rated' },
                  { value: 'primary_release_date.desc', label: 'Newest' },
                  { value: 'primary_release_date.asc', label: 'Oldest' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStagedChanges(prev => ({ ...prev, sortBy: value }))}
                    className={`${variants.filter.button.base} ${
                      stagedChanges.sortBy === value 
                        ? variants.filter.button.active
                        : variants.filter.button.inactive
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>
        </div>

        {/* Bottom section with buttons - pushed to bottom with margin */}
        <div className="mt-auto border-t border-gray-200 p-4 space-x-4 flex bg-white shadow-lg">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApplyChanges}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar; 