import axios from 'axios';
import { API_BASE_URL } from './constants';

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

export const movieApi = {
  searchMovies: async (query) => {
    const response = await axiosInstance.get(`/api/movies/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getPopularMovies: async () => {
    const response = await axiosInstance.get('/api/movies/popular');
    return response.data;
  },

  getTopRatedMovies: async () => {
    const response = await axiosInstance.get('/api/movies/top-rated');
    return response.data;
  },

  getUpcomingMovies: async () => {
    const response = await axiosInstance.get('/api/movies/upcoming');
    return response.data;
  },

  getMovieNews: async () => {
    const response = await axiosInstance.get('/api/movies/news');
    return response.data;
  }
}; 