import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ListsProvider } from './contexts/ListsContext';
import HomePage from './components/movie/HomePage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import SearchResults from './components/movie/SearchResults';
import MyLists from './components/movie/MyLists';
import MyFilters from './components/filters/MyFilters';

const AppRoutes = () => {
  const location = useLocation();
  const state = location.state;
  const background = state?.backgroundLocation;

  return (
    <ListsProvider>
      <main className="w-full">
        <Routes location={background || location}>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/my-lists" element={<MyLists />} />
          <Route path="/my-filters" element={<MyFilters />} />
          <Route path="/movie/:id" element={<HomePage />} />
          <Route path="/search/movie/:id" element={<SearchResults />} />
          <Route path="/my-lists/movie/:id" element={<MyLists />} />
        </Routes>

        {/* Modal Routes - Only render when we have a background location */}
        {background && (
          <Routes>
            <Route path="/movie/:id" element={<HomePage />} />
            <Route path="/search/movie/:id" element={<SearchResults />} />
            <Route path="/my-lists/movie/:id" element={<MyLists />} />
          </Routes>
        )}
      </main>
    </ListsProvider>
  );
};

export default AppRoutes; 