const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder.jpg';
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  return `${baseUrl}/api/proxy/image/${size}${path}`;
};

export { getImageUrl }; 