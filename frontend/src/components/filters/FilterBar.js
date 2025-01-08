import React, { useState, useEffect, useRef } from 'react';
import { movieApi, filterSettingsApi } from '../../utils/api';

const FilterBar = ({
  yearRange,
  onYearRangeChange,
  ratingRange,
  onRatingRangeChange,
  popularityRange,
  onPopularityRangeChange,
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
  includeKeywords,
  onIncludeKeywordsChange,
  excludeKeywords,
  onExcludeKeywordsChange,
  sortBy,
  onSortByChange,
  onSubmit
}) => {
  // UI state for dropdowns
  const [yearOpen, setYearOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [popularityOpen, setPopularityOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [voteCountOpen, setVoteCountOpen] = useState(false);
  const [runtimeOpen, setRuntimeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [releaseTypeOpen, setReleaseTypeOpen] = useState(false);
  const [providersOpen, setProvidersOpen] = useState(false);
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [castOpen, setCastOpen] = useState(false);
  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Local state for filter values
  const [localYearRange, setLocalYearRange] = useState(null);
  const [localRatingRange, setLocalRatingRange] = useState(null);
  const [localPopularityRange, setLocalPopularityRange] = useState(null);
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
  const [localIncludeKeywords, setLocalIncludeKeywords] = useState(includeKeywords);
  const [localExcludeKeywords, setLocalExcludeKeywords] = useState(excludeKeywords);
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
    if (popularityRange?.[0] && popularityRange?.[1]) setLocalPopularityRange(popularityRange);
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
    if (includeKeywords?.length > 0) setLocalIncludeKeywords(includeKeywords);
    if (excludeKeywords?.length > 0) setLocalExcludeKeywords(excludeKeywords);
    if (sortBy) setLocalSortBy(sortBy);
  }, [
    ratingRange,
    popularityRange,
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
    includeKeywords,
    excludeKeywords,
    sortBy
  ]);

  const handleSubmit = () => {
    // Apply all filters at once
    if (onYearRangeChange) onYearRangeChange(localYearRange);
    if (onRatingRangeChange) onRatingRangeChange(localRatingRange);
    if (onPopularityRangeChange) onPopularityRangeChange(localPopularityRange);
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
    if (onIncludeKeywordsChange) onIncludeKeywordsChange(localIncludeKeywords);
    if (onExcludeKeywordsChange) onExcludeKeywordsChange(localExcludeKeywords);
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
    setLocalPopularityRange(null);
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
    setLocalIncludeKeywords([]);
    setLocalExcludeKeywords([]);
    setLocalSortBy(null);

    // Apply reset to parent
    if (onYearRangeChange) onYearRangeChange(null);
    if (onRatingRangeChange) onRatingRangeChange(null);
    if (onPopularityRangeChange) onPopularityRangeChange(null);
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
    if (onIncludeKeywordsChange) onIncludeKeywordsChange([]);
    if (onExcludeKeywordsChange) onExcludeKeywordsChange([]);
    if (onSortByChange) onSortByChange(null);

    // Call the onSubmit handler if provided
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Filters Section */}
      <div className="flex flex-wrap gap-2 p-4 bg-background-secondary/50 rounded-lg border border-border/10">
        {/* Year Range Filter */}
        <div className="relative">
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
        <div className="relative">
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

        {/* Popularity Range Filter */}
        <div className="relative">
          <button
            onClick={() => setPopularityOpen(!popularityOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Popularity</span>
            {localPopularityRange?.[0] && localPopularityRange?.[1] && (
              <span className="text-primary">
                {localPopularityRange[0]} - {localPopularityRange[1]}
              </span>
            )}
          </button>
          {popularityOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[240px] z-50">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={localPopularityRange?.[0] || ''}
                  onChange={(e) => setLocalPopularityRange([parseInt(e.target.value), localPopularityRange?.[1]])}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="From"
                />
                <span className="text-sm text-text-secondary font-medium">to</span>
                <input
                  type="number"
                  min="0"
                  value={localPopularityRange?.[1] || ''}
                  onChange={(e) => setLocalPopularityRange([localPopularityRange?.[0], parseInt(e.target.value)])}
                  className="w-24 h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="To"
                />
              </div>
            </div>
          )}
        </div>

        {/* Vote Count Range Filter */}
        <div className="relative">
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
        <div className="relative">
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
        <div className="relative">
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
        <div className="relative">
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
        <div className="relative">
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
        <div className="relative">
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
            <div className="absolute top-full left-0 mt-2 p-2 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[200px] z-50">
              {[
                { id: 8, name: 'Netflix' },
                { id: 9, name: 'Prime Video' },
                { id: 337, name: 'Disney+' },
                { id: 384, name: 'HBO Max' },
                { id: 15, name: 'Hulu' },
                { id: 531, name: 'Paramount+' },
                { id: 283, name: 'Crunchyroll' },
                { id: 2, name: 'Apple TV' }
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
                  className={`w-full px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    localWatchProviders?.includes(provider.id)
                      ? 'bg-primary text-white'
                      : 'hover:bg-background-active'
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keywords Filter */}
        <div className="relative">
          <button
            onClick={() => setKeywordsOpen(!keywordsOpen)}
            className="h-9 px-4 bg-background-secondary hover:bg-background-active rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>Keywords</span>
            {(localIncludeKeywords?.length > 0 || localExcludeKeywords?.length > 0) && (
              <span className="text-primary">
                +{localIncludeKeywords?.length || 0} -{localExcludeKeywords?.length || 0}
              </span>
            )}
          </button>
          {keywordsOpen && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-background-secondary rounded-lg shadow-lg border border-border/10 min-w-[320px] z-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Include Keywords</label>
                  <input
                    type="text"
                    value={localIncludeKeywords?.join(', ') || ''}
                    onChange={(e) => setLocalIncludeKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                    className="w-full h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter keywords, separated by commas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exclude Keywords</label>
                  <input
                    type="text"
                    value={localExcludeKeywords?.join(', ') || ''}
                    onChange={(e) => setLocalExcludeKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                    className="w-full h-9 px-3 text-sm bg-background-tertiary/30 rounded-lg border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter keywords, separated by commas"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort By Filter */}
        <div className="relative">
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
      <div className="flex justify-end gap-2">
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
  );
};

export default FilterBar; 