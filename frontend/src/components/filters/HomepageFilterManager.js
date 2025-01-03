import React, { useState, useEffect } from 'react';
import { DEFAULT_MOVIE_LISTS } from '../../constants/movieLists';
import { filterSettingsApi } from '../../utils/api';

const HomepageFilterManager = ({ onClose, loadHomepageLists }) => {
  const [userFilters, setUserFilters] = useState([]);
  const [defaultLists, setDefaultLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's filters and default lists from localStorage
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load user filters from API
        const filters = await filterSettingsApi.getFilterSettings();
        setUserFilters(filters || []);
        
        // Load enabled default lists from localStorage
        const savedDefaultLists = JSON.parse(localStorage.getItem('enabledDefaultLists') || '[]');
        const defaultListsWithState = DEFAULT_MOVIE_LISTS.map(list => ({
          ...list,
          isEnabled: savedDefaultLists.includes(list.id),
          displayOrder: savedDefaultLists.indexOf(list.id)
        })).sort((a, b) => {
          if (a.isEnabled === b.isEnabled) {
            return a.displayOrder - b.displayOrder;
          }
          return b.isEnabled - a.isEnabled;
        });
        setDefaultLists(defaultListsWithState);
      } catch (err) {
        console.error('Error loading filters:', err);
        setError('Failed to load filters. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFilters();
  }, []);

  // Toggle filter visibility
  const handleToggleFilter = async (filter) => {
    try {
      const enabledFilters = userFilters.filter(f => f.is_homepage_enabled);
      const updatedFilter = {
        ...filter,
        is_homepage_enabled: !filter.is_homepage_enabled,
        homepage_display_order: filter.is_homepage_enabled ? null : enabledFilters.length
      };

      await filterSettingsApi.updateFilterSetting(filter.id, updatedFilter);
      
      setUserFilters(prev => prev.map(f => 
        f.id === filter.id ? updatedFilter : f
      ));
    } catch (err) {
      console.error('Error toggling filter:', err);
      setError('Failed to update filter. Please try again.');
    }
  };

  // Toggle default list visibility
  const handleToggleDefaultList = (list) => {
    const enabledLists = defaultLists.filter(l => l.isEnabled);
    const updatedLists = defaultLists.map(l => {
      if (l.id === list.id) {
        return {
          ...l,
          isEnabled: !l.isEnabled,
          displayOrder: l.isEnabled ? null : enabledLists.length
        };
      }
      return l;
    });

    setDefaultLists(updatedLists);
    
    // Save to localStorage
    const enabledListIds = updatedLists
      .filter(l => l.isEnabled)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(l => l.id);
    localStorage.setItem('enabledDefaultLists', JSON.stringify(enabledListIds));
  };

  const handleClose = () => {
    if (typeof loadHomepageLists === 'function') {
      loadHomepageLists();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get all enabled items in order
  const enabledItems = [
    ...userFilters
      .filter(f => f.is_homepage_enabled)
      .sort((a, b) => (a.homepage_display_order || 0) - (b.homepage_display_order || 0))
      .map(f => ({ ...f, itemType: 'filter' })),
    ...defaultLists
      .filter(l => l.isEnabled)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(l => ({ ...l, itemType: 'default' }))
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Manage Homepage Lists</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Enabled Lists */}
        <div className="bg-background-secondary/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-3">Enabled Lists</h3>
          <div className="space-y-2">
            {enabledItems.length === 0 ? (
              <p className="text-sm text-text-secondary">No lists enabled</p>
            ) : (
              enabledItems.map((item, index) => (
                <div
                  key={`${item.itemType}-${item.id}`}
                  className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-text-primary">{item.name}</h4>
                    {item.itemType === 'default' && (
                      <p className="text-xs text-text-secondary">{item.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => item.itemType === 'filter' 
                      ? handleToggleFilter(item)
                      : handleToggleDefaultList(item)
                    }
                    className="p-1.5 text-text-disabled hover:text-text-primary rounded-lg hover:bg-background-active transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Lists */}
        <div className="bg-background-secondary/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-3">Available Lists</h3>
          <div className="space-y-2">
            {/* Default Lists */}
            {defaultLists
              .filter(list => !list.isEnabled)
              .map(list => (
                <div
                  key={list.id}
                  className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-text-primary">{list.name}</h4>
                    <p className="text-xs text-text-secondary">{list.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleDefaultList(list)}
                    className="p-1.5 text-text-disabled hover:text-text-primary rounded-lg hover:bg-background-active transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              ))}

            {/* User Filters */}
            {userFilters
              .filter(filter => !filter.is_homepage_enabled)
              .map(filter => (
                <div
                  key={filter.id}
                  className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-text-primary">{filter.name}</h4>
                  </div>
                  <button
                    onClick={() => handleToggleFilter(filter)}
                    className="p-1.5 text-text-disabled hover:text-text-primary rounded-lg hover:bg-background-active transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-background-tertiary hover:bg-background-active text-text-primary rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomepageFilterManager; 