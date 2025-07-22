import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      navigate('/assistant');
    } catch (error) {
      console.error(error.message);
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