import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      navigate('/assistant');
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
      
      navigate('/assistant');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-black/70 border border-white/10 rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-serif text-white mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Sign in to CoPilot
        </h2>
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <input className="w-full p-3 rounded-lg bg-gray-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} />
          <input className="w-full p-3 rounded-lg bg-gray-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} />
          <button className="w-full bg-white text-black font-semibold py-3 rounded-lg shadow hover:bg-gray-200 transition">Sign In</button>
        </form>
        <div className="mt-6 text-gray-400 text-sm text-center">
          Don't have an account? <Link to="/register" className="text-white underline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 