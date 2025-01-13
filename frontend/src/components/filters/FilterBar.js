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
  return (
    <div className="divide-y divide-gray-200">
      <FilterSection title="Sort By" defaultExpanded>
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
              onClick={() => onSortByChange(value)}
              className={`${variants.filter.button.base} ${
                sortBy === value 
                  ? variants.filter.button.active
                  : variants.filter.button.inactive
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Genres" defaultExpanded>
        <div className="space-y-2">
          {genres.map(genre => (
            <label
              key={genre.id}
              className={`flex items-center p-2 rounded-lg cursor-pointer ${
                selectedGenres.includes(genre.id)
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre.id)}
                onChange={() => {
                  if (selectedGenres.includes(genre.id)) {
                    onGenresChange(selectedGenres.filter(id => id !== genre.id));
                  } else {
                    onGenresChange([...selectedGenres, genre.id]);
                  }
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
            <span>{yearRange[0]}</span>
            <span>{yearRange[1]}</span>
          </div>
          <input
            type="range"
            min="1900"
            max={new Date().getFullYear()}
            value={yearRange[0]}
            onChange={(e) => onYearRangeChange([parseInt(e.target.value), yearRange[1]])}
            className={variants.filter.range}
          />
          <input
            type="range"
            min="1900"
            max={new Date().getFullYear()}
            value={yearRange[1]}
            onChange={(e) => onYearRangeChange([yearRange[0], parseInt(e.target.value)])}
            className={variants.filter.range}
          />
        </div>
      </FilterSection>

      <FilterSection title="Rating Range">
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{ratingRange[0].toFixed(1)}</span>
            <span>{ratingRange[1].toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={ratingRange[0]}
            onChange={(e) => onRatingRangeChange([parseFloat(e.target.value), ratingRange[1]])}
            className={variants.filter.range}
          />
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={ratingRange[1]}
            onChange={(e) => onRatingRangeChange([ratingRange[0], parseFloat(e.target.value)])}
            className={variants.filter.range}
          />
        </div>
      </FilterSection>

      <FilterSection title="Vote Count Range">
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{voteCountRange?.[0] || 0}</span>
            <span>{voteCountRange?.[1] || 500000}</span>
          </div>
          <input
            type="range"
            min="0"
            max="500000"
            step="1000"
            value={voteCountRange?.[0] || 0}
            onChange={(e) => onVoteCountRangeChange([parseInt(e.target.value), voteCountRange?.[1] || 500000])}
            className={variants.filter.range}
          />
          <input
            type="range"
            min="0"
            max="500000"
            step="1000"
            value={voteCountRange?.[1] || 500000}
            onChange={(e) => onVoteCountRangeChange([voteCountRange?.[0] || 0, parseInt(e.target.value)])}
            className={variants.filter.range}
          />
        </div>
      </FilterSection>

      <FilterSection title="Runtime Range (minutes)">
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{runtimeRange?.[0] || 0}</span>
            <span>{runtimeRange?.[1] || 360}</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={runtimeRange?.[0] || 0}
            onChange={(e) => onRuntimeRangeChange([parseInt(e.target.value), runtimeRange?.[1] || 360])}
            className={variants.filter.range}
          />
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={runtimeRange?.[1] || 360}
            onChange={(e) => onRuntimeRangeChange([runtimeRange?.[0] || 0, parseInt(e.target.value)])}
            className={variants.filter.range}
          />
        </div>
      </FilterSection>

      <FilterSection title="Language">
        <div className="space-y-4">
          <select
            value={originalLanguage || ''}
            onChange={(e) => onOriginalLanguageChange(e.target.value || null)}
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
                releaseTypes.includes(type.id)
                  ? variants.filter.button.active
                  : variants.filter.button.inactive
              }`}
            >
              <input
                type="checkbox"
                checked={releaseTypes.includes(type.id)}
                onChange={() => {
                  if (releaseTypes.includes(type.id)) {
                    onReleaseTypesChange(releaseTypes.filter(id => id !== type.id));
                  } else {
                    onReleaseTypesChange([...releaseTypes, type.id]);
                  }
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
            value={watchRegion}
            onChange={(e) => onWatchRegionChange(e.target.value)}
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
                  watchProviders.includes(provider.id)
                    ? variants.filter.button.active
                    : variants.filter.button.inactive
                }`}
              >
                <input
                  type="checkbox"
                  checked={watchProviders.includes(provider.id)}
                  onChange={() => {
                    if (watchProviders.includes(provider.id)) {
                      onWatchProvidersChange(watchProviders.filter(id => id !== provider.id));
                    } else {
                      onWatchProvidersChange([...watchProviders, provider.id]);
                    }
                  }}
                  className="sr-only"
                />
                <span className="text-sm">{provider.name}</span>
              </label>
            ))}
          </div>
        </div>
      </FilterSection>
    </div>
  );
};

export default FilterBar; 