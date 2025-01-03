export const DEFAULT_MOVIE_LISTS = [
  {
    id: 'popular',
    name: 'Popular Movies',
    type: 'tmdb',
    endpoint: '/movie/popular',
    description: 'Currently popular movies across all platforms'
  },
  {
    id: 'top_rated',
    name: 'Top Rated Movies',
    type: 'tmdb',
    endpoint: '/movie/top_rated',
    description: 'Highest rated movies of all time'
  },
  {
    id: 'upcoming',
    name: 'Upcoming Movies',
    type: 'tmdb',
    endpoint: '/movie/upcoming',
    description: 'Movies that are being released soon'
  },
  {
    id: 'now_playing',
    name: 'Now Playing',
    type: 'tmdb',
    endpoint: '/movie/now_playing',
    description: 'Movies currently in theaters'
  }
]; 