import React, { useState, useEffect, useRef } from 'react';
import { variants, classes } from '../../utils/theme';
import { filterSettingsApi, movieApi } from '../../utils/api';

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
  onClose,
}) => {
  const [savedFilters, setSavedFilters] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selectedFilterId, setSelectedFilterId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isSaveFormExpanded, setIsSaveFormExpanded] = useState(false);
  
  // Add back stagedChanges state
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

  // Update staged changes when props change
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

  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      setIsLoadingFilters(true);
      const filters = await filterSettingsApi.getFilterSettings();
      setSavedFilters(filters || []);
    } catch (error) {
      console.error('Failed to load filters:', error);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const handleSaveCurrentFilter = async () => {
    if (!filterName.trim()) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      
      const filterData = {
        name: filterName,
        year_range: yearRange ? JSON.stringify(yearRange) : null,
        rating_range: ratingRange ? JSON.stringify(ratingRange) : null,
        genres: selectedGenres.length > 0 ? JSON.stringify(selectedGenres) : null,
        watch_providers: watchProviders.length > 0 ? JSON.stringify(watchProviders) : null,
        watch_region: watchRegion,
        vote_count_range: voteCountRange ? JSON.stringify(voteCountRange) : null,
        runtime_range: runtimeRange ? JSON.stringify(runtimeRange) : null,
        original_language: originalLanguage,
        spoken_languages: spokenLanguages.length > 0 ? JSON.stringify(spokenLanguages) : null,
        release_types: releaseTypes.length > 0 ? JSON.stringify(releaseTypes) : null,
        include_keywords: includeKeywords.length > 0 ? JSON.stringify(includeKeywords) : null,
        exclude_keywords: excludeKeywords.length > 0 ? JSON.stringify(excludeKeywords) : null,
        sort_by: sortBy
      };

      await filterSettingsApi.createFilterSetting(filterData);
      await loadSavedFilters();
      setFilterName('');
      setIsSaveFormExpanded(false);
    } catch (error) {
      console.error('Failed to save filter:', error);
      setSaveError('Failed to save filter. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFilter = async (filter, e) => {
    e.stopPropagation(); // Prevent triggering the filter selection
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const filterData = {
        name: filter.name, // Keep the existing name
        year_range: yearRange ? JSON.stringify(yearRange) : null,
        rating_range: ratingRange ? JSON.stringify(ratingRange) : null,
        genres: selectedGenres.length > 0 ? JSON.stringify(selectedGenres) : null,
        watch_providers: watchProviders.length > 0 ? JSON.stringify(watchProviders) : null,
        watch_region: watchRegion,
        vote_count_range: voteCountRange ? JSON.stringify(voteCountRange) : null,
        runtime_range: runtimeRange ? JSON.stringify(runtimeRange) : null,
        original_language: originalLanguage,
        spoken_languages: spokenLanguages.length > 0 ? JSON.stringify(spokenLanguages) : null,
        release_types: releaseTypes.length > 0 ? JSON.stringify(releaseTypes) : null,
        include_keywords: includeKeywords.length > 0 ? JSON.stringify(includeKeywords) : null,
        exclude_keywords: excludeKeywords.length > 0 ? JSON.stringify(excludeKeywords) : null,
        sort_by: sortBy
      };

      await filterSettingsApi.updateFilterSetting(filter.id, filterData);
      await loadSavedFilters();
    } catch (error) {
      console.error('Failed to update filter:', error);
      setSaveError('Failed to update filter. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFilter = async (id, e) => {
    e.stopPropagation(); // Prevent triggering the filter selection
    
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await filterSettingsApi.deleteFilterSetting(id);
      await loadSavedFilters();
      if (selectedFilterId === id) {
        setSelectedFilterId(null);
      }
    } catch (error) {
      console.error('Failed to delete filter:', error);
      setDeleteError('Failed to delete filter. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectFilter = (filter) => {
    if (selectedFilterId === filter.id) {
      // Deselect if already selected
      setSelectedFilterId(null);
      handleReset();
    } else {
      setSelectedFilterId(filter.id);
      handleLoadFilter(filter);
    }
  };

  const handleLoadFilter = (filter) => {
    if (filter.year_range) onYearRangeChange(JSON.parse(filter.year_range));
    if (filter.rating_range) onRatingRangeChange(JSON.parse(filter.rating_range));
    if (filter.genres) onGenresChange(JSON.parse(filter.genres));
    if (filter.watch_providers) onWatchProvidersChange(JSON.parse(filter.watch_providers));
    if (filter.watch_region) onWatchRegionChange(filter.watch_region);
    if (filter.vote_count_range) onVoteCountRangeChange(JSON.parse(filter.vote_count_range));
    if (filter.runtime_range) onRuntimeRangeChange(JSON.parse(filter.runtime_range));
    if (filter.original_language) onOriginalLanguageChange(filter.original_language);
    if (filter.spoken_languages) onSpokenLanguagesChange(JSON.parse(filter.spoken_languages));
    if (filter.release_types) onReleaseTypesChange(JSON.parse(filter.release_types));
    if (filter.include_keywords) onIncludeKeywordsChange(JSON.parse(filter.include_keywords));
    if (filter.exclude_keywords) onExcludeKeywordsChange(JSON.parse(filter.exclude_keywords));
    if (filter.sort_by) onSortByChange(filter.sort_by);
  };

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
    setSelectedFilterId(null); // Clear selected filter
    
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

  // Add handleApplyChanges function
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
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Saved Filters Section */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Saved Filters</h3>
          <div className="space-y-4">
            {/* Saved Filters List */}
            <div className="max-h-48 overflow-y-auto">
              {isLoadingFilters ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                </div>
              ) : savedFilters.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No saved filters yet
                </div>
              ) : (
                <div className="space-y-2">
                  {savedFilters.map((filter) => (
                    <div
                      key={filter.id}
                      onClick={() => handleSelectFilter(filter)}
                      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFilterId === filter.id
                          ? 'bg-black text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-sm font-medium truncate flex-1">
                        {filter.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {selectedFilterId === filter.id && (
                          <button
                            onClick={(e) => handleUpdateFilter(filter, e)}
                            disabled={isSaving}
                            className={`p-1 rounded-md transition-colors ${
                              selectedFilterId === filter.id
                                ? 'text-white hover:bg-gray-700'
                                : 'text-gray-400 hover:text-black'
                            }`}
                            aria-label="Save changes to filter"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-3 0v4h-6V3h6zm2 16H8v-6h8v6z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteFilter(filter.id, e)}
                          disabled={isDeleting}
                          className={`p-1 rounded-md transition-colors ${
                            selectedFilterId === filter.id
                              ? 'text-white hover:bg-gray-700'
                              : 'text-gray-400 hover:text-red-500 group-hover:text-red-500'
                          }`}
                          aria-label="Delete filter"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200">
              {(saveError || deleteError) && (
                <div className="mb-4 text-red-500 text-sm">{saveError || deleteError}</div>
              )}

              {/* Save New Filter */}
              {!isSaveFormExpanded ? (
                <button
                  onClick={() => setIsSaveFormExpanded(true)}
                  className="text-sm text-gray-600 hover:text-black hover:underline transition-colors flex items-center gap-1"
                >
                  <span className="text-black">+</span> new saved filter
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      placeholder="Filter name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveCurrentFilter}
                      disabled={!filterName.trim() || isSaving}
                      className={`px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors ${
                        (!filterName.trim() || isSaving) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setIsSaveFormExpanded(false);
                      setFilterName('');
                      setSaveError(null);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Filters Section */}
      <div className="flex-1 flex flex-col bg-white">
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

        {/* Bottom section with buttons */}
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