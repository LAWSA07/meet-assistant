import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import FloatingAssistantOverlay from '../components/FloatingAssistantOverlay';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [user, setUser] = useState(null);
  const [showOverlayModal, setShowOverlayModal] = useState(false);
  const [overlayScope, setOverlayScope] = useState(null);
  const [showAssistantOverlay, setShowAssistantOverlay] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setUser(authService.user);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Check if backend is running
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/');
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('error');
      }
    };

    checkBackend();
  }, []);

  const handleLaunchOverlay = () => {
    setShowOverlayModal(true);
  };

  const handleOverlayScopeSelect = (scope) => {
    setOverlayScope(scope);
    setShowOverlayModal(false);
    setShowAssistantOverlay(true);
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return '✅ Backend Connected';
      case 'error': return '❌ Backend Not Available';
      default: return '⏳ Checking Backend...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Hello {user?.full_name || 'User'},</h1>
            <p className="text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Co-Pilot Dashboard</h2>
          <p className="text-gray-400 mb-4">You're all set. Launch the Co-Pilot assistant overlay to get started.</p>
          
          {/* Backend Status */}
          <div className={`inline-block px-4 py-2 rounded-lg bg-gray-800 border ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Start</h3>
            <ol className="text-gray-300 space-y-2 list-decimal list-inside">
              <li>Load the Chrome extension in Developer Mode</li>
              <li>Open a meeting (Google Meet, Zoom, etc.)</li>
              <li>Click the extension icon to start</li>
              <li>Speak naturally - AI will provide real-time insights</li>
            </ol>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">⚙️ Extension Setup</h3>
            <ol className="text-gray-300 space-y-2 list-decimal list-inside">
              <li>Go to <code className="bg-gray-700 px-1 rounded">chrome://extensions/</code></li>
              <li>Enable "Developer mode"</li>
              <li>Click "Load unpacked"</li>
              <li>Select the <code className="bg-gray-700 px-1 rounded">extension</code> folder</li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button 
            onClick={handleLaunchOverlay}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105"
          >
            Launch Assistant Overlay
          </button>
          
          <div className="text-gray-500">
            <p>To see the floating overlay in action, click the button above and select your scope.</p>
            <Link to="/" className="text-cyan-400 hover:underline mt-4 inline-block">Go back to Home</Link>
          </div>
        </div>

        {/* Backend Connection Info */}
        {backendStatus === 'connected' && (
          <div className="mt-8 bg-green-900/20 border border-green-500/50 p-4 rounded-lg">
            <h3 className="text-green-400 font-bold mb-2">✅ Backend Ready</h3>
            <p className="text-green-300 text-sm">
              Your FastAPI backend is running on <code className="bg-green-900/50 px-1 rounded">http://127.0.0.1:8001</code>
            </p>
            <p className="text-green-300 text-sm mt-1">
              The extension will automatically connect to this backend for real-time AI processing.
            </p>
          </div>
        )}

        {backendStatus === 'error' && (
          <div className="mt-8 bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
            <h3 className="text-red-400 font-bold mb-2">❌ Backend Not Available</h3>
            <p className="text-red-300 text-sm">
              Please start the backend server first:
            </p>
            <code className="block bg-red-900/50 px-2 py-1 rounded mt-2 text-sm">
                              cd backend && venv\Scripts\activate && uvicorn main:app --host 127.0.0.1 --port 8001
            </code>
          </div>
        )}

        {showOverlayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Where do you want to activate the assistant?</h3>
              <div className="space-y-4">
                <button
                  className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                  onClick={() => handleOverlayScopeSelect('tab')}
                >
                  This Tab (React-only)
                </button>
                <button
                  className="w-full py-3 px-4 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                  disabled
                >
                  All Tabs in Window (Requires Extension)
                </button>
                <button
                  className="w-full py-3 px-4 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                  disabled
                >
                  All Tabs for Site (Requires Extension)
                </button>
              </div>
              <button
                className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={() => setShowOverlayModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showAssistantOverlay && overlayScope === 'tab' && (
          <FloatingAssistantOverlay onClose={() => setShowAssistantOverlay(false)} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 