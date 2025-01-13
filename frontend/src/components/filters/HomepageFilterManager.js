import React, { useState, useEffect } from 'react';
import { DEFAULT_MOVIE_LISTS } from '../../constants/movieLists';
import { filterSettingsApi } from '../../utils/api';
import { variants } from '../../utils/theme';

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
        console.log('Loaded user filters:', filters);
        setUserFilters(filters || []);
        
        // Load enabled default lists from localStorage
        const savedDefaultLists = JSON.parse(localStorage.getItem('enabledDefaultLists') || '[]');
        console.log('Loaded saved default lists:', savedDefaultLists);
        console.log('DEFAULT_MOVIE_LISTS:', DEFAULT_MOVIE_LISTS);
        
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
        console.log('Processed default lists:', defaultListsWithState);
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
  
  console.log('Enabled Items:', enabledItems);
  console.log('Available Default Lists:', defaultLists.filter(list => !list.isEnabled));
  console.log('Available User Filters:', userFilters.filter(filter => !filter.is_homepage_enabled));

  return (
    <div className={variants.modal.backdrop}>
      <div className={variants.modal.container.base}>
        <div className={variants.modal.content.base}>
          {/* Header */}
          <div className={variants.modal.header.base}>
            <h2 className={variants.modal.header.title}>Manage Homepage Lists</h2>
            <button
              onClick={handleClose}
              className={variants.modal.header.close}
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className={`${variants.modal.body.base} ${variants.modal.body.scroll} p-6`}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Enabled Lists */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Enabled Lists ({enabledItems.length})
                </h3>
                <ul className="space-y-2">
                  {enabledItems.length === 0 ? (
                    <li className="text-sm text-gray-500">No lists enabled</li>
                  ) : (
                    enabledItems.map((item, index) => (
                      <li 
                        key={`${item.itemType}-${item.id}`} 
                        className="grid grid-cols-[1fr,auto] gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.itemType === 'default' && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => 
                            item.itemType === 'filter' 
                              ? handleToggleFilter(item)
                              : handleToggleDefaultList(item)
                          }
                          className={`${variants.filter.button.base}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Available Lists */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Lists ({defaultLists.filter(list => !list.isEnabled).length + userFilters.filter(filter => !filter.is_homepage_enabled).length})
                </h3>
                <ul className="space-y-2">
                  {/* Default Lists */}
                  {defaultLists
                    .filter(list => !list.isEnabled)
                    .map(list => (
                      <li 
                        key={list.id} 
                        className="grid grid-cols-[1fr,auto] gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {list.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {list.description}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleDefaultList(list)}
                          className={`${variants.filter.button.base}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </li>
                    ))}

                  {/* User Filters */}
                  {userFilters
                    .filter(filter => !filter.is_homepage_enabled)
                    .map(filter => (
                      <li 
                        key={filter.id} 
                        className="grid grid-cols-[1fr,auto] gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {filter.name}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleFilter(filter)}
                          className={`${variants.filter.button.base}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageFilterManager; 