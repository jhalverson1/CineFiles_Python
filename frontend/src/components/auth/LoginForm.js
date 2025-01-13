import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { variants, classes } from '../../utils/theme';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    
    try {
      const formDataObj = new URLSearchParams();
      formDataObj.append('username', formData.email);
      formDataObj.append('password', formData.password);

      const response = await authApi.login(formDataObj);
      localStorage.setItem('token', response.access_token);
      
      const userInfo = await authApi.getCurrentUser();
      localStorage.setItem('username', userInfo.username);
      
      window.location.href = '/';
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to login');
    }
  };

  return (
    <div className={classes.pageContainer}>
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <h2 className={classes.h2}>
            Sign in to your account
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
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 
                         rounded-b-md border border-border
                         ${variants.input.base} ${variants.input.focus}`}
                placeholder="Password"
                value={formData.password}
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
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 