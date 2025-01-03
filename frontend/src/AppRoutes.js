import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ListsProvider } from './contexts/ListsContext';
import HomePage from './components/movie/HomePage';
import MovieDetails from './components/movie/MovieDetails';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import SearchResults from './components/movie/SearchResults';
import MyLists from './components/movie/MyLists';
import MyFilters from './components/filters/MyFilters';

const AppRoutes = () => {
  return (
    <ListsProvider>
      <main className="w-full">
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/my-lists" element={<MyLists />} />
          <Route path="/my-filters" element={<MyFilters />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </ListsProvider>
  );
};

export default AppRoutes; 