import axios from 'axios';
import { API_BASE_URL } from './constants';

export const movieApi = {
  searchMovies: async (query) => {
    const response = await axios.get(`${API_BASE_URL}/api/movies/search?query=${encodeURIComponent(query)}`);
    return response.data.results;
  },

  getPopularMovies: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/movies/popular`);
    return response.data;
  },

  getMovieDetails: async (id) => {
    const [movie, credits, videos] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/movies/${id}`),
      axios.get(`${API_BASE_URL}/api/movies/${id}/credits`),
      axios.get(`${API_BASE_URL}/api/movies/${id}/videos`)
    ]);

    return {
      movie: movie.data,
      credits: credits.data,
      videos: videos.data
    };
  },

  getPersonDetails: async (personId) => {
    const response = await axios.get(`${API_BASE_URL}/api/person/${personId}`);
    return response.data;
  }
}; 