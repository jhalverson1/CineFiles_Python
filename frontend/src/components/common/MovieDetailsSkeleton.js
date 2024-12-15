import React from 'react';

function MovieDetailsSkeleton() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.posterSkeleton}></div>
        <div style={styles.infoSkeleton}>
          <div style={styles.titleSkeleton}></div>
          <div style={styles.directorSkeleton}></div>
          <div style={styles.metadataSkeleton}></div>
          <div style={styles.overviewSkeleton}>
            <div style={styles.line}></div>
            <div style={styles.line}></div>
            <div style={styles.line}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    background: 'linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%)',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    gap: '30px',
    marginBottom: '40px',
  },
  posterSkeleton: {
    width: '300px',
    height: '450px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    animation: 'pulse 1.5s infinite',
  },
  infoSkeleton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  titleSkeleton: {
    height: '40px',
    width: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '5px',
    animation: 'pulse 1.5s infinite',
  },
  directorSkeleton: {
    height: '20px',
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '5px',
    animation: 'pulse 1.5s infinite',
  },
  metadataSkeleton: {
    height: '20px',
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '5px',
    animation: 'pulse 1.5s infinite',
  },
  overviewSkeleton: {
    marginTop: '20px',
  },
  line: {
    height: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '5px',
    marginBottom: '10px',
    animation: 'pulse 1.5s infinite',
    '&:nth-child(1)': { width: '100%' },
    '&:nth-child(2)': { width: '90%' },
    '&:nth-child(3)': { width: '80%' },
  },
  '@keyframes pulse': {
    '0%': { opacity: 0.6 },
    '50%': { opacity: 0.8 },
    '100%': { opacity: 0.6 },
  },
};

export default MovieDetailsSkeleton; 