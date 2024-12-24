import React from 'react';

function LoadingSpinner() {
  return (
    <div style={styles.spinner}>
      <div style={styles.loader}></div>
    </div>
  );
}

const styles = {
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  loader: {
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid #8A2BE2',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  }
};

export default LoadingSpinner;