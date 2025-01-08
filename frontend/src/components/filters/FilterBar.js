import React, { useState, useEffect, useRef } from 'react';
import { movieApi, filterSettingsApi } from '../../utils/api';
import { getImageUrl } from '../../utils/image';

const FilterBar = ({
  yearRange,
  onYearRangeChange,
  ratingRange,
  onRatingRangeChange,
  voteCountRange,
  onVoteCountRangeChange,
  runtimeRange,
  onRuntimeRangeChange,
  selectedGenres,
  onGenresChange,
  genres = [],
  isLoadingGenres = true,
  originalLanguage,
  onOriginalLanguageChange,
  spokenLanguages,
  onSpokenLanguagesChange,
  releaseTypes,
  onReleaseTypesChange,
  watchProviders,
  onWatchProvidersChange,
  watchRegion,
  onWatchRegionChange,
  watchMonetizationTypes,
  onWatchMonetizationTypesChange,
  companies,
  onCompaniesChange,
  originCountries,
  onOriginCountriesChange,
  cast,
  onCastChange,
  crew,
  onCrewChange,
  sortBy,
  onSortByChange,
  onSubmit
}) => {
  // UI state for dropdowns
  const [yearOpen, setYearOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [voteCountOpen, setVoteCountOpen] = useState(false);
  const [runtimeOpen, setRuntimeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [releaseTypeOpen, setReleaseTypeOpen] = useState(false);
  const [providersOpen, setProvidersOpen] = useState(false);
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [castOpen, setCastOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [saveFilterOpen, setSaveFilterOpen] = useState(false);
  const [loadFilterOpen, setLoadFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [savedFilters, setSavedFilters] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilterName, setActiveFilterName] = useState(null);
  const [saveMode, setSaveMode] = useState('new'); // 'new' or 'update'

  // Refs for click outside handling
  const yearRef = useRef(null);
  const ratingRef = useRef(null);
  const genreRef = useRef(null);
  const voteCountRef = useRef(null);
  const runtimeRef = useRef(null);
  const languageRef = useRef(null);
  const releaseTypeRef = useRef(null);
  const providersRef = useRef(null);
  const companiesRef = useRef(null);
  const castRef = useRef(null);
  const sortRef = useRef(null);
  const saveFilterRef = useRef(null);
  const loadFilterRef = useRef(null);

  // Load saved filters on component mount
  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      setIsLoadingFilters(true);
      setError(null);
      const filters = await filterSettingsApi.getFilterSettings();
      setSavedFilters(filters || []);
    } catch (err) {
      console.error('Failed to load filters:', err);
      setError('Failed to load saved filters');
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const handleSaveFilter = async (mode = 'new') => {
    if (mode === 'new' && !filterName.trim()) {
      setError('Please enter a filter name');
      return;
    }

    try {
      setError(null);
      const filterData = {
        name: mode === 'update' ? activeFilterName : filterName,
        // Year range
        release_date_gte: yearRange?.[0] ? new Date(yearRange[0], 0, 1).toISOString() : null,
        release_date_lte: yearRange?.[1] ? new Date(yearRange[1], 11, 31).toISOString() : null,
        
        // Rating range
        rating_gte: ratingRange?.[0] || null,
        rating_lte: ratingRange?.[1] || null,
        
        // Vote count range
        vote_count_gte: voteCountRange?.[0] || null,
        vote_count_lte: voteCountRange?.[1] || null,
        
        // Runtime range
        runtime_gte: runtimeRange?.[0] || null,
        runtime_lte: runtimeRange?.[1] || null,
        
        // Other filters
        genres: selectedGenres?.length > 0 ? selectedGenres.join(',') : null,
        original_language: originalLanguage || null,
        spoken_languages: spokenLanguages?.length > 0 ? spokenLanguages.join(',') : null,
        release_types: releaseTypes?.length > 0 ? releaseTypes.join(',') : null,
        watch_providers: watchProviders?.length > 0 ? watchProviders.join(',') : null,
        watch_region: watchRegion || null,
        watch_monetization_types: watchMonetizationTypes?.length > 0 ? watchMonetizationTypes.join(',') : null,
        companies: companies?.length > 0 ? companies.join(',') : null,
        origin_countries: originCountries?.length > 0 ? originCountries.join(',') : null,
        cast: cast?.length > 0 ? cast.join(',') : null,
        crew: crew?.length > 0 ? crew.join(',') : null,
        sort_by: sortBy || null
      };

      if (mode === 'update') {
        const currentFilter = savedFilters.find(f => f.name === activeFilterName);
        if (currentFilter) {
          await filterSettingsApi.updateFilterSetting(currentFilter.id, filterData);
        }
      } else {
        await filterSettingsApi.createFilterSetting(filterData);
      }

      await loadSavedFilters();
      setFilterName('');
      setSaveFilterOpen(false);
      setSaveMode('new');
    } catch (err) {
      console.error('Failed to save filter:', err);
      setError('Failed to save filter');
    }
  };

  const handleLoadFilter = async (filter) => {
    try {
      // Year range
      if (filter.release_date_gte || filter.release_date_lte) {
        const startYear = filter.release_date_gte ? new Date(filter.release_date_gte).getFullYear() : null;
        const endYear = filter.release_date_lte ? new Date(filter.release_date_lte).getFullYear() : null;
        onYearRangeChange([startYear, endYear]);
      }

      // Rating range
      if (filter.rating_gte !== null || filter.rating_lte !== null) {
        onRatingRangeChange([filter.rating_gte, filter.rating_lte]);
      }

      // Vote count range
      if (filter.vote_count_gte !== null || filter.vote_count_lte !== null) {
        onVoteCountRangeChange([filter.vote_count_gte, filter.vote_count_lte]);
      }

      // Runtime range
      if (filter.runtime_gte !== null || filter.runtime_lte !== null) {
        onRuntimeRangeChange([filter.runtime_gte, filter.runtime_lte]);
      }

      // Other filters
      if (filter.genres) onGenresChange(filter.genres.split(',').map(Number));
      if (filter.original_language) onOriginalLanguageChange(filter.original_language);
      if (filter.spoken_languages) onSpokenLanguagesChange(filter.spoken_languages.split(','));
      if (filter.release_types) onReleaseTypesChange(filter.release_types.split(',').map(Number));
      if (filter.watch_providers) onWatchProvidersChange(filter.watch_providers.split(',').map(Number));
      if (filter.watch_region) onWatchRegionChange(filter.watch_region);
      if (filter.watch_monetization_types) onWatchMonetizationTypesChange(filter.watch_monetization_types.split(','));
      if (filter.companies) onCompaniesChange(filter.companies.split(',').map(Number));
      if (filter.origin_countries) onOriginCountriesChange(filter.origin_countries.split(','));
      if (filter.cast) onCastChange(filter.cast.split(',').map(Number));
      if (filter.crew) onCrewChange(filter.crew.split(',').map(Number));
      if (filter.sort_by) onSortByChange(filter.sort_by);

      // Set the active filter name
      setActiveFilterName(filter.name);

      setLoadFilterOpen(false);
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error('Failed to load filter:', err);
      setError('Failed to load filter');
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check each dropdown and close if clicked outside
      if (yearOpen && yearRef.current && !yearRef.current.contains(event.target)) {
        setYearOpen(false);
      }
      if (ratingOpen && ratingRef.current && !ratingRef.current.contains(event.target)) {
        setRatingOpen(false);
      }
      if (genreOpen && genreRef.current && !genreRef.current.contains(event.target)) {
        setGenreOpen(false);
      }
      if (voteCountOpen && voteCountRef.current && !voteCountRef.current.contains(event.target)) {
        setVoteCountOpen(false);
      }
      if (runtimeOpen && runtimeRef.current && !runtimeRef.current.contains(event.target)) {
        setRuntimeOpen(false);
      }
      if (languageOpen && languageRef.current && !languageRef.current.contains(event.target)) {
        setLanguageOpen(false);
      }
      if (releaseTypeOpen && releaseTypeRef.current && !releaseTypeRef.current.contains(event.target)) {
        setReleaseTypeOpen(false);
      }
      if (providersOpen && providersRef.current && !providersRef.current.contains(event.target)) {
        setProvidersOpen(false);
      }
      if (companiesOpen && companiesRef.current && !companiesRef.current.contains(event.target)) {
        setCompaniesOpen(false);
      }
      if (castOpen && castRef.current && !castRef.current.contains(event.target)) {
        setCastOpen(false);
      }
      if (sortOpen && sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
      if (saveFilterOpen && saveFilterRef.current && !saveFilterRef.current.contains(event.target)) {
        setSaveFilterOpen(false);
      }
      if (loadFilterOpen && loadFilterRef.current && !loadFilterRef.current.contains(event.target)) {
        setLoadFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [yearOpen, ratingOpen, genreOpen, voteCountOpen, runtimeOpen, languageOpen, releaseTypeOpen, providersOpen, companiesOpen, castOpen, sortOpen, saveFilterOpen, loadFilterOpen]);

  // Local state for filter values
  const [localYearRange, setLocalYearRange] = useState(null);
  const [localRatingRange, setLocalRatingRange] = useState(null);
  const [localVoteCountRange, setLocalVoteCountRange] = useState(voteCountRange);
  const [localRuntimeRange, setLocalRuntimeRange] = useState(runtimeRange);
  const [localSelectedGenres, setLocalSelectedGenres] = useState(selectedGenres);
  const [localOriginalLanguage, setLocalOriginalLanguage] = useState(originalLanguage);
  const [localSpokenLanguages, setLocalSpokenLanguages] = useState(spokenLanguages);
  const [localReleaseTypes, setLocalReleaseTypes] = useState(releaseTypes);
  const [localWatchProviders, setLocalWatchProviders] = useState(watchProviders);
  const [localWatchRegion, setLocalWatchRegion] = useState(watchRegion);
  const [localWatchMonetizationTypes, setLocalWatchMonetizationTypes] = useState(watchMonetizationTypes);
  const [localCompanies, setLocalCompanies] = useState(companies);
  const [localOriginCountries, setLocalOriginCountries] = useState(originCountries);
  const [localCast, setLocalCast] = useState(cast);
  const [localCrew, setLocalCrew] = useState(crew);
  const [localSortBy, setLocalSortBy] = useState(sortBy);

  // Update local state when props change
  useEffect(() => {
    // Update if yearRange exists, even if only one value is present
    if (yearRange !== null) {
      setLocalYearRange(yearRange);
    }
  }, [yearRange]);

  useEffect(() => {
    // Update if ratingRange exists, even if only one value is present
    if (ratingRange?.[0] && ratingRange?.[1]) setLocalRatingRange(ratingRange);
    if (voteCountRange?.[0] && voteCountRange?.[1]) setLocalVoteCountRange(voteCountRange);
    if (runtimeRange?.[0] && runtimeRange?.[1]) setLocalRuntimeRange(runtimeRange);
    if (selectedGenres?.length > 0) setLocalSelectedGenres(selectedGenres);
    if (originalLanguage) setLocalOriginalLanguage(originalLanguage);
    if (spokenLanguages?.length > 0) setLocalSpokenLanguages(spokenLanguages);
    if (releaseTypes?.length > 0) setLocalReleaseTypes(releaseTypes);
    if (watchProviders?.length > 0) setLocalWatchProviders(watchProviders);
    if (watchRegion) setLocalWatchRegion(watchRegion);
    if (watchMonetizationTypes?.length > 0) setLocalWatchMonetizationTypes(watchMonetizationTypes);
    if (companies?.length > 0) setLocalCompanies(companies);
    if (originCountries?.length > 0) setLocalOriginCountries(originCountries);
    if (cast?.length > 0) setLocalCast(cast);
    if (crew?.length > 0) setLocalCrew(crew);
    if (sortBy) setLocalSortBy(sortBy);
  }, [
    ratingRange,
    voteCountRange,
    runtimeRange,
    selectedGenres,
    originalLanguage,
    spokenLanguages,
    releaseTypes,
    watchProviders,
    watchRegion,
    watchMonetizationTypes,
    companies,
    originCountries,
    cast,
    crew,
    sortBy
  ]);

  const handleSubmit = () => {
    // Apply all filters at once
    if (onYearRangeChange) onYearRangeChange(localYearRange);
    if (onRatingRangeChange) onRatingRangeChange(localRatingRange);
    if (onVoteCountRangeChange) onVoteCountRangeChange(localVoteCountRange);
    if (onRuntimeRangeChange) onRuntimeRangeChange(localRuntimeRange);
    if (onGenresChange) onGenresChange(localSelectedGenres);
    if (onOriginalLanguageChange) onOriginalLanguageChange(localOriginalLanguage);
    if (onSpokenLanguagesChange) onSpokenLanguagesChange(localSpokenLanguages);
    if (onReleaseTypesChange) onReleaseTypesChange(localReleaseTypes);
    if (onWatchProvidersChange) onWatchProvidersChange(localWatchProviders);
    if (onWatchRegionChange) onWatchRegionChange(localWatchRegion);
    if (onWatchMonetizationTypesChange) onWatchMonetizationTypesChange(localWatchMonetizationTypes);
    if (onCompaniesChange) onCompaniesChange(localCompanies);
    if (onOriginCountriesChange) onOriginCountriesChange(localOriginCountries);
    if (onCastChange) onCastChange(localCast);
    if (onCrewChange) onCrewChange(localCrew);
    if (onSortByChange) onSortByChange(localSortBy);

    // Call the onSubmit handler if provided
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleReset = () => {
    // Reset local state
    setLocalYearRange(null);
    setLocalRatingRange(null);
    setLocalVoteCountRange(null);
    setLocalRuntimeRange(null);
    setLocalSelectedGenres([]);
    setLocalOriginalLanguage(null);
    setLocalSpokenLanguages([]);
    setLocalReleaseTypes([]);
    setLocalWatchProviders([]);
    setLocalWatchRegion('US');
    setLocalWatchMonetizationTypes([]);
    setLocalCompanies([]);
    setLocalOriginCountries([]);
    setLocalCast([]);
    setLocalCrew([]);
    setLocalSortBy(null);
    setActiveFilterName(null);

    // Apply reset to parent
    if (onYearRangeChange) onYearRangeChange(null);
    if (onRatingRangeChange) onRatingRangeChange(null);
    if (onVoteCountRangeChange) onVoteCountRangeChange(null);
    if (onRuntimeRangeChange) onRuntimeRangeChange(null);
    if (onGenresChange) onGenresChange([]);
    if (onOriginalLanguageChange) onOriginalLanguageChange(null);
    if (onSpokenLanguagesChange) onSpokenLanguagesChange([]);
    if (onReleaseTypesChange) onReleaseTypesChange([]);
    if (onWatchProvidersChange) onWatchProvidersChange([]);
    if (onWatchRegionChange) onWatchRegionChange('US');
    if (onWatchMonetizationTypesChange) onWatchMonetizationTypesChange([]);
    if (onCompaniesChange) onCompaniesChange([]);
    if (onOriginCountriesChange) onOriginCountriesChange([]);
    if (onCastChange) onCastChange([]);
    if (onCrewChange) onCrewChange([]);
    if (onSortByChange) onSortByChange(null);

    // Call the onSubmit handler if provided
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Active Filter Name */}
      {activeFilterName && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">Active Filter:</span>
          <span className="font-medium text-primary">{activeFilterName}</span>
          <button
            onClick={() => setActiveFilterName(null)}
            className="p-1 text-text-disabled hover:text-text-primary rounded-lg hover:bg-background-active transition-colors"
            aria-label="Clear active filter"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Filters Section */}
      <div className="flex flex-wrap gap-2 p-4 bg-background-secondary/50 rounded-lg border border-border/10">
        {/* Year Range Filter */}
        <div className="relative"ref={yearRef}>
          <button
            onClick={() => setYearOpen(!yearOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Year</span>
            {localYearRange !== null && (
              <span className="text-primary">
                {localYearRange[0] || 'Any'} - {localYearRange[1] || 'Any'}
              </span>
            )}
          </button>
          {yearOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[240px] z-50">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={localYearRange?.[0] ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newValue = value === '' ? null : Number(value);
                    setLocalYearRange(prev => [newValue, prev?.[1] ?? null]);
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && (Number(value) < 1900 || Number(value) > new Date().getFullYear())) {
                      setLocalYearRange(prev => [null, prev?.[1] ?? null]);
                    }
                  }}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="From"
                />
                <span className="text-sm text-text-secondary font-medium">to</span>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={localYearRange?.[1] ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newValue = value === '' ? null : Number(value);
                    setLocalYearRange(prev => [prev?.[0] ?? null, newValue]);
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && (Number(value) < 1900 || Number(value) > new Date().getFullYear())) {
                      setLocalYearRange(prev => [prev?.[0] ?? null, null]);
                    }
                  }}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="To"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rating Range Filter */}
        <div className="relative"ref={ratingRef}>
          <button
            onClick={() => setRatingOpen(!ratingOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Rating</span>
            {localRatingRange?.[0] && localRatingRange?.[1] && (
              <span className="text-primary">
                {localRatingRange[0]} - {localRatingRange[1]}
              </span>
            )}
          </button>
          {ratingOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[240px] z-50">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={localRatingRange?.[0] || ''}
                  onChange={(e) => setLocalRatingRange([parseFloat(e.target.value), localRatingRange?.[1]])}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="From"
                />
                <span className="text-sm text-text-secondary font-medium">to</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={localRatingRange?.[1] || ''}
                  onChange={(e) => setLocalRatingRange([localRatingRange?.[0], parseFloat(e.target.value)])}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="To"
                />
              </div>
            </div>
          )}
        </div>

        {/* Vote Count Range Filter */}
        <div className="relative"ref={voteCountRef}>
          <button
            onClick={() => setVoteCountOpen(!voteCountOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Vote Count</span>
            {localVoteCountRange && (
              <span className="text-primary">
                {localVoteCountRange[0]} - {localVoteCountRange[1]}
              </span>
            )}
          </button>
          {voteCountOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[240px] z-50">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={localVoteCountRange?.[0] || ''}
                  onChange={(e) => setLocalVoteCountRange([parseInt(e.target.value), localVoteCountRange?.[1] || 10000])}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="From"
                />
                <span className="text-sm text-text-secondary font-medium">to</span>
                <input
                  type="number"
                  min="0"
                  value={localVoteCountRange?.[1] || ''}
                  onChange={(e) => setLocalVoteCountRange([localVoteCountRange?.[0] || 0, parseInt(e.target.value)])}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="To"
                />
              </div>
            </div>
          )}
        </div>

        {/* Runtime Range Filter */}
        <div className="relative"ref={runtimeRef}>
          <button
            onClick={() => setRuntimeOpen(!runtimeOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Runtime</span>
            {localRuntimeRange && (
              <span className="text-primary">
                {localRuntimeRange[0]} - {localRuntimeRange[1]} min
              </span>
            )}
          </button>
          {runtimeOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[240px] z-50">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={localRuntimeRange?.[0] || ''}
                  onChange={(e) => setLocalRuntimeRange([parseInt(e.target.value), localRuntimeRange?.[1] || 500])}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="From"
                />
                <span className="text-sm text-text-secondary font-medium">to</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={localRuntimeRange?.[1] || ''}
                  onChange={(e) => setLocalRuntimeRange([localRuntimeRange?.[0] || 0, parseInt(e.target.value)])}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="To"
                />
              </div>
            </div>
          )}
        </div>

        {/* Genres Filter */}
        <div className="relative"ref={genreRef}>
          <button
            onClick={() => setGenreOpen(!genreOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Genres</span>
            {localSelectedGenres?.length > 0 && (
              <span className="text-primary">{localSelectedGenres.length}</span>
            )}
          </button>
          {genreOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[320px] z-50">
              <div className="grid grid-cols-2 gap-2">
                {isLoadingGenres ? (
                  <div className="col-span-2 flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        const isSelected = localSelectedGenres?.includes(genre.id);
                        setLocalSelectedGenres(
                          isSelected
                            ? localSelectedGenres.filter((id) => id !== genre.id)
                            : [...(localSelectedGenres || []), genre.id]
                        );
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        localSelectedGenres?.includes(genre.id)
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
          )}
        </div>

        {/* Original Language Filter */}
        <div className="relative"ref={languageRef}>
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Language</span>
            {localOriginalLanguage && (
              <span className="text-primary">{localOriginalLanguage}</span>
            )}
          </button>
          {languageOpen && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[200px] z-50">
              {[
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Spanish' },
                { code: 'fr', name: 'French' },
                { code: 'de', name: 'German' },
                { code: 'it', name: 'Italian' },
                { code: 'ja', name: 'Japanese' },
                { code: 'ko', name: 'Korean' },
                { code: 'zh', name: 'Chinese' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocalOriginalLanguage(lang.code);
                    setLanguageOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    localOriginalLanguage === lang.code
                      ? 'bg-primary text-white'
                      : 'hover:bg-background-active'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Release Types Filter */}
        <div className="relative"ref={releaseTypeRef}>
          <button
            onClick={() => setReleaseTypeOpen(!releaseTypeOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Release Type</span>
            {localReleaseTypes?.length > 0 && (
              <span className="text-primary">{localReleaseTypes.length}</span>
            )}
          </button>
          {releaseTypeOpen && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[200px] z-50">
              {[
                { id: 1, name: 'Premiere' },
                { id: 2, name: 'Theatrical (limited)' },
                { id: 3, name: 'Theatrical' },
                { id: 4, name: 'Digital' },
                { id: 5, name: 'Physical' },
                { id: 6, name: 'TV' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    const isSelected = localReleaseTypes?.includes(type.id);
                    setLocalReleaseTypes(
                      isSelected
                        ? localReleaseTypes.filter((id) => id !== type.id)
                        : [...(localReleaseTypes || []), type.id]
                    );
                  }}
                  className={`w-full px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    localReleaseTypes?.includes(type.id)
                      ? 'bg-primary text-white'
                      : 'hover:bg-background-active'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Watch Providers Filter */}
        <div className="relative" ref={providersRef}>
          <button
            onClick={() => setProvidersOpen(!providersOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Providers</span>
            {localWatchProviders?.length > 0 && (
              <span className="text-primary">{localWatchProviders.length}</span>
            )}
          </button>
          {providersOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[280px] z-50">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 8, name: 'Netflix', logo_path: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg' },
                  { id: 9, name: 'Prime Video', logo_path: '/emthp39XA2YScoYL1p0sdbAH2WA.jpg' },
                  { id: 337, name: 'Disney+', logo_path: '/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg' },
                  { id: 384, name: 'HBO Max', logo_path: '/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg' },
                  { id: 15, name: 'Hulu', logo_path: '/giwM8XX4V2AQb9vsoN7yti82tKK.jpg' },
                  { id: 531, name: 'Paramount+', logo_path: '/pkAHkRhIq3Iu0ZlEhDzbguSlyZF.jpg' },
                  { id: 283, name: 'Crunchyroll', logo_path: '/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg' },
                  { id: 2, name: 'Apple TV', logo_path: '/q6tl6Ib6X5FT80RMlcDbexIo4St.jpg' }
                ].map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      const isSelected = localWatchProviders?.includes(provider.id);
                      setLocalWatchProviders(
                        isSelected
                          ? localWatchProviders.filter((id) => id !== provider.id)
                          : [...(localWatchProviders || []), provider.id]
                      );
                    }}
                    className={`relative group aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                      localWatchProviders?.includes(provider.id)
                        ? 'ring-2 ring-primary scale-105'
                        : 'hover:scale-105'
                    }`}
                    title={provider.name}
                  >
                    <img
                      src={getImageUrl(provider.logo_path, 'w92')}
                      alt={provider.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
                      localWatchProviders?.includes(provider.id) ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort By Filter */}
        <div className="relative"ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Sort By</span>
            {localSortBy && (
              <span className="text-primary">
                {localSortBy.split('.')[0].replace('_', ' ')}
              </span>
            )}
          </button>
          {sortOpen && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[200px] z-50">
              {[
                { value: 'popularity.desc', label: 'Popularity' },
                { value: 'vote_average.desc', label: 'Rating' },
                { value: 'release_date.desc', label: 'Release Date' },
                { value: 'revenue.desc', label: 'Revenue' },
                { value: 'vote_count.desc', label: 'Vote Count' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setLocalSortBy(option.value);
                    setSortOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    localSortBy === option.value
                      ? 'bg-primary text-white'
                      : 'hover:bg-background-active'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between gap-2">
        {/* Left-aligned buttons */}
        <div className="flex gap-2">
          {/* Load Filter Button */}
          <div className="relative" ref={loadFilterRef}>
            <button
              onClick={() => setLoadFilterOpen(!loadFilterOpen)}
              className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Load</span>
            </button>
            {loadFilterOpen && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[240px] z-50">
                {isLoadingFilters ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : savedFilters.length === 0 ? (
                  <p className="text-sm text-text-secondary p-3">No saved filters</p>
                ) : (
                  savedFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleLoadFilter(filter)}
                      className="w-full px-4 py-2 text-left text-sm font-medium rounded-lg hover:bg-background-active transition-colors"
                    >
                      {filter.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Save Filter Button */}
          <div className="relative" ref={saveFilterRef}>
            <button
              onClick={() => setSaveFilterOpen(!saveFilterOpen)}
              className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save</span>
            </button>
            {saveFilterOpen && (
              <div className="absolute bottom-full left-0 mb-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[240px] z-50">
                {activeFilterName ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSaveFilter('update')}
                      className="w-full h-9 bg-background-tertiary hover:bg-background-active text-sm font-medium rounded-lg transition-colors"
                    >
                      Update "{activeFilterName}"
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 text-text-secondary bg-background-secondary">or</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="Enter new filter name"
                        className="w-full h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        onClick={() => handleSaveFilter('new')}
                        className="w-full h-9 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Save as New
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      placeholder="Enter filter name"
                      className="w-full h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => handleSaveFilter('new')}
                      className="w-full h-9 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right-aligned buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>

          <button
            onClick={handleSubmit}
            className="h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar; 