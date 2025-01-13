import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { variants, classes } from '../../utils/theme';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await authApi.signup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      
      const loginFormData = new FormData();
      loginFormData.append('username', formData.email);
      loginFormData.append('password', formData.password);
      
      await authApi.login(loginFormData);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account');
    }
  };

  return (
    <div className={classes.authContainer}>
      <div className={classes.authForm}>
        <div>
          <h2 className={classes.h2}>
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-background-secondary border border-red-500 p-4">
              <div className="text-sm text-red-500">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 
                         rounded-t-md border border-border
                         ${variants.input.base} ${variants.input.focus}`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 
                         border border-border
                         ${variants.input.base} ${variants.input.focus}`}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 
                         border border-border
                         ${variants.input.base} ${variants.input.focus}`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 
                         rounded-b-md border border-border
                         ${variants.input.base} ${variants.input.focus}`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center
                       ${variants.button.primary.base}
                       ${variants.button.primary.hover}
                       ${variants.button.primary.active}`}
            >
              Sign up
            </button>
          </div>
          <div className="text-center mt-4">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className={classes.link}>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm; 