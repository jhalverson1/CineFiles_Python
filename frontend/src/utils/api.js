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

  getTopRatedMovies: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/movies/top-rated`);
    return response.data;
  },

  getUpcomingMovies: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/movies/upcoming`);
    return response.data;
  },

  getMovieNews: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/movies/news`);
    return response.data;
  }
}; 