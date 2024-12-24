import React from 'react';

function NewsSection({ newsItems }) {
  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  return (
    <div style={styles.newsSection}>
      <h2 style={styles.sectionTitle}>Latest from r/movies</h2>
      <div style={styles.newsList}>
        {newsItems.map((item, index) => (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            key={index} 
            style={styles.newsItem}
          >
            {item.image && (
              <div style={styles.imageContainer}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={styles.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              </div>
            )}
            <div style={styles.newsContent}>
              <h3 style={styles.newsTitle}>{item.title}</h3>
              <p style={styles.source}>{item.source}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

const styles = {
  newsSection: {
    padding: '0',
    width: '95%',
    maxWidth: '1200px',
    margin: '0 auto',
    '@media (min-width: 640px)': {
      width: '90%',
    },
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '1.1em',
    fontWeight: '600',
    marginBottom: '8px',
    paddingLeft: '10px',
    borderLeft: '3px solid #e50914',
    '@media (min-width: 640px)': {
      fontSize: '1.3em',
      paddingLeft: '15px',
    },
  },
  newsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 10px 10px 10px',
    '@media (min-width: 640px)': {
      padding: '0 15px 15px 15px',
    },
  },
  newsItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px',
    backgroundColor: 'rgba(32, 32, 32, 0.8)',
    borderRadius: '4px',
    textDecoration: 'none',
    color: '#fff',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
    '&:hover': {
      transform: 'translateX(3px)',
      backgroundColor: 'rgba(40, 40, 40, 0.8)',
    },
    '@media (min-width: 640px)': {
      gap: '12px',
      padding: '8px',
    },
  },
  imageContainer: {
    flexShrink: 0,
    width: '60px',
    height: '35px',
    borderRadius: '3px',
    overflow: 'hidden',
    '@media (min-width: 640px)': {
      width: '70px',
      height: '40px',
    },
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  newsContent: {
    flex: 1,
    minWidth: 0,
  },
  newsTitle: {
    fontSize: '0.9em',
    fontWeight: '500',
    marginBottom: '2px',
    color: '#fff',
    lineHeight: '1.2',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  source: {
    color: '#999',
    fontSize: '0.75em',
  },
};

export default NewsSection; 