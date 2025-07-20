import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';

// --- SVG Icons for Controls ---
const MinimizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const OverlayWindow = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [summary, setSummary] = useState('Waiting for audio...');
  const [suggestions, setSuggestions] = useState([]);
  const [transcript, setTranscript] = useState('');

  // WebSocket connection to backend
  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8001/ws/audio');
    
    ws.onopen = () => {
      setIsConnected(true);
      setSummary('Connected! Listening for audio...');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.summary_and_suggestion) {
          setSummary(data.summary_and_suggestion.summary || 'Processing...');
          setSuggestions(data.summary_and_suggestion.suggestions || []);
        }
        if (data.transcript_chunk) {
          setTranscript(prev => prev + ' ' + data.transcript_chunk);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setSummary('Disconnected from backend');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setSummary('Connection error');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleQuit = () => {
    setIsVisible(false);
    // In a real extension, you might want to send a message back to the content script
    // to remove the iframe from the DOM completely.
    window.parent.postMessage({ type: 'CLOSE_CO_PILOT_IFRAME' }, '*');
  };

  if (!isVisible) {
    return null;
  }

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)', // For Safari support
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  };

  return (
    // The Rnd component is what makes the window draggable and resizable.
    // We enable pointer events only on this component.
    <div style={{ pointerEvents: 'all', position: 'relative', zIndex: 999999 }}>
      <Rnd
        default={{
          x: 50,
          y: 50,
          width: 350,
          height: 400,
        }}
        minWidth={280}
        minHeight={200}
        bounds="window" // Restricts dragging to within the browser window
        dragHandleClassName="drag-handle" // Specifies that only the header can be used to drag
      >
        <div style={glassmorphismStyle} className="w-full h-full flex flex-col text-white overflow-hidden">
          {/* Header / Drag Handle */}
          <div className="drag-handle p-2 flex justify-between items-center cursor-move bg-white/10">
            <span className="font-bold text-sm pl-2 flex items-center gap-2">
              Co-Pilot
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                <MinimizeIcon />
              </button>
              <button onClick={handleQuit} className="p-1 rounded-full hover:bg-red-500/50 transition-colors">
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {!isMinimized && (
            <div className="p-4 flex-grow overflow-y-auto">
              <h3 className="font-bold mb-2">Live Summary</h3>
              <div className="text-sm text-gray-200 mb-4 bg-black/20 p-2 rounded">
                {summary}
              </div>

              {suggestions.length > 0 && (
                <>
                  <h3 className="font-bold mt-6 mb-2">Suggested Talking Points</h3>
                  <div className="space-y-2 text-sm">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/50">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {transcript && (
                <>
                  <h3 className="font-bold mt-6 mb-2">Recent Transcript</h3>
                  <div className="text-xs text-gray-300 bg-black/20 p-2 rounded max-h-20 overflow-y-auto">
                    {transcript.slice(-200)}...
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Rnd>
    </div>
  );
};

export default OverlayWindow; 