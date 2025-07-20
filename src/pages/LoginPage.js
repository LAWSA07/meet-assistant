import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../services/authService';

const GitHubIcon = () => (
    <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" data-view-component="true">
        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.19.01-.82.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0.67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2.27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0.21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
    </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError('');
      await authService.googleAuth(credentialResponse.credential);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const githubUrl = await authService.getGitHubAuthUrl();
      window.location.href = githubUrl;
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      
      if (isRegistering) {
        await authService.register(formData);
      } else {
        await authService.login({
          email: formData.email,
          password: formData.password
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
        <p className="text-center text-gray-400 mb-8">Sign in to access your Co-Pilot.</p>
        
        <div className="space-y-4">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
            />
            <button 
                onClick={handleGitHubLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
            >
                <GitHubIcon />
                Sign in with GitHub
            </button>
        </div>

        <div className="my-6 flex items-center text-center">
            <hr className="flex-grow border-gray-600"/>
            <span className="px-4 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-600"/>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          {isRegistering && (
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">Full Name</label>
              <input 
                type="text" 
                id="full_name"
                name="full_name"
                required={isRegistering}
                value={formData.full_name}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
            <input 
              type="email" 
              id="email"
              name="email"
              required 
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              required 
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Loading...' : (isRegistering ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-cyan-400 hover:underline text-sm"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account? <a href="#" className="font-medium text-cyan-400 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 