import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await authService.register(formData);
      navigate("/assistant");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-black/70 border border-white/10 rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-serif text-white mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Create your CoPilot account
        </h2>
        <form className="space-y-6" onSubmit={handleRegister}>
          <input className="w-full p-3 rounded-lg bg-gray-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Full Name" type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} />
          <input className="w-full p-3 rounded-lg bg-gray-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} />
          <input className="w-full p-3 rounded-lg bg-gray-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} />
          <button className="w-full bg-white text-black font-semibold py-3 rounded-lg shadow hover:bg-gray-200 transition">Register</button>
        </form>
        {error && <div className="text-red-400 mt-4">{typeof error === 'object' ? JSON.stringify(error) : error}</div>}
        <div className="mt-6 text-gray-400 text-sm text-center">
          Already have an account? <Link to="/login" className="text-white underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 