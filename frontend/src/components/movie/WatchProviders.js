import React from 'react';
import { getImageUrl } from '../../utils/image';

const WatchProviders = ({ providers }) => {
  if (!providers || providers.error) {
    return null;
  }

  const filterPrimaryProviders = (providers) => {
    if (!providers) return [];
    return providers.filter(provider => 
      !provider.provider_name.toLowerCase().includes('channel')
    );
  };

  const sections = [
    { title: 'Stream', data: filterPrimaryProviders(providers.flatrate)?.slice(0, 4) },
    { title: 'Rent', data: providers.rent?.slice(0, 4) },
    { title: 'Buy', data: providers.buy?.slice(0, 4) },
    { title: 'Free', data: providers.free?.slice(0, 4) }
  ].filter(section => section.data && section.data.length > 0);

  if (sections.length === 0) {
    return null;
  }

  const hasMoreProviders = 
    (providers.flatrate && providers.flatrate.length > 4) ||
    (providers.rent && providers.rent.length > 4) ||
    (providers.buy && providers.buy.length > 4) ||
    (providers.free && providers.free.length > 4);

  return (
    <div className="text-white bg-zinc-900/50 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-6">
        {sections.map(({ title, data }) => (
          <div key={title} className="flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
            <div className="flex gap-2">
              {data.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="relative group"
                  title={provider.provider_name}
                >
                  <img
                    src={getImageUrl(provider.logo_path, 'w92')}
                    alt={provider.provider_name}
                    className="w-8 h-8 rounded transition-transform hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {(hasMoreProviders || providers.link) && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-end text-sm text-primary hover:text-primary/80 transition-colors duration-200"
          >
            More options →
          </a>
        )}
      </div>
    </div>
  );
};

export default WatchProviders; 