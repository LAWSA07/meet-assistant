import React, { useState, useEffect } from 'react';

const TabSelectorModal = ({ isOpen, onClose, onTabSelect }) => {
  const [tabs, setTabs] = useState([]);
  const [selectedTabId, setSelectedTabId] = useState(null);

  useEffect(() => {
    const handleExtensionMessage = (event) => {
      if (event.source === window && event.data.source === 'EXTENSION') {
        if (event.data.tabs) {
          // Filter out the current tab to avoid recursion
          const filteredTabs = event.data.tabs.filter(tab => !tab.url.includes(window.location.hostname));
          setTabs(filteredTabs);
        }
      }
    };
    window.addEventListener('message', handleExtensionMessage);
    return () => window.removeEventListener('message', handleExtensionMessage);
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.postMessage({ source: 'REACT_APP', type: 'GET_TABS' }, '*');
    }
  }, [isOpen]);

  const handleSelect = () => {
    if (selectedTabId) {
      onTabSelect(selectedTabId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
        <h2 className="text-2xl font-bold mb-2 text-blue-900">Select a Tab to Get Assistance</h2>
        <p className="mb-4 text-gray-600">Choose the browser tab containing your interview or meeting.</p>
        <div className="max-h-64 overflow-y-auto mb-6">
          {tabs.length > 0 ? (
            tabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedTabId === tab.id ? 'bg-blue-100 border-2 border-blue-400' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedTabId(tab.id)}
              >
                <img src={tab.favIconUrl || '/favicon.ico'} alt="favicon" className="w-6 h-6 rounded" />
                <span className="truncate flex-1 text-gray-800">{tab.title}</span>
                <span className="text-xs text-gray-400">{tab.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
              </div>
            ))
          ) : <p className="text-gray-400">Loading tabs...</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-blue-200"
            onClick={handleSelect}
            disabled={!selectedTabId}
          >
            Let's Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabSelectorModal; 
 
 
 
 
 
 
 
 
 
 
 