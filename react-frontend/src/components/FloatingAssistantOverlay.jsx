import React, { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8001/ws/assistant';

const FloatingAssistantOverlay = ({ onClose }) => {
  const [transcript, setTranscript] = useState([]);
  const [summary, setSummary] = useState('');
  const [points, setPoints] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const wsRef = useRef(null);

  useEffect(() => {
    const sessionId = 'assistant-' + Math.random().toString(36).slice(2, 10);
    const ws = new window.WebSocket(WS_URL.replace('assistant', sessionId));
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'transcript') {
          setTranscript((prev) => [...prev, data.text]);
        } else if (data.type === 'ai_response' && data.response) {
          setSummary(data.response);
        } else if (data.type === 'conversation_points' && data.points) {
          setPoints(Array.isArray(data.points) ? data.points : [data.points]);
        } else if (data.type === 'user_answer' && data.answer) {
          setAiAnswer(data.answer);
        }
      } catch (e) {}
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleUserInput = (e) => setUserInput(e.target.value);
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (wsRef.current && userInput.trim()) {
      wsRef.current.send(JSON.stringify({ type: 'user_message', message: userInput }));
      setUserInput('');
      setAiAnswer('');
    }
  };

  // Glassmorphism and modern style
  const glassStyle = {
    background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.55) 0%, rgba(221, 214, 254, 0.55) 100%)',
    boxShadow: '0 16px 48px 0 rgba(31, 38, 135, 0.18)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    borderRadius: '32px',
    border: '1.5px solid rgba(255, 255, 255, 0.35)',
    padding: 0,
    overflow: 'hidden',
  };

  const headerGlass = {
    background: 'linear-gradient(90deg, rgba(165,180,252,0.8) 0%, rgba(186,230,253,0.8) 100%)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(255,255,255,0.18)',
    borderTopLeftRadius: '32px',
    borderTopRightRadius: '32px',
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5rem',
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.65)',
    borderRadius: '18px',
    boxShadow: '0 2px 12px 0 rgba(31,38,135,0.09)',
    border: '1px solid rgba(255,255,255,0.18)',
    marginBottom: 16,
    padding: 18,
    minHeight: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  // Tooltip style
  const tooltipStyle = {
    position: 'absolute',
    top: 70,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255,255,255,0.95)',
    color: '#3730a3',
    borderRadius: 16,
    boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
    padding: '1rem 2rem',
    fontWeight: 500,
    fontSize: 16,
    zIndex: 10001,
    border: '1.5px solid rgba(186,230,253,0.5)',
    transition: 'opacity 0.3s',
    cursor: 'pointer',
    userSelect: 'none',
  };

  if (minimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 9999,
          background: 'linear-gradient(90deg, rgba(165,180,252,0.8) 0%, rgba(186,230,253,0.8) 100%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          borderRadius: '24px',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        tabIndex={0}
        aria-label="Expand assistant overlay"
        onClick={() => setMinimized(false)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setMinimized(false)}
      >
        <span className="font-bold text-blue-900 text-base mr-2">Meeting Assistant</span>
        <span className="text-blue-700 text-lg">▲</span>
      </div>
    );
  }

  return (
    <Rnd
      default={{ x: 120, y: 120, width: 440, height: 480 }}
      minWidth={340}
      minHeight={320}
      bounds="window"
      style={{ zIndex: 9999 }}
      dragHandleClassName="drag-handle"
    >
      <div style={glassStyle} className="w-full h-full flex flex-col relative">
        {/* Onboarding Tooltip */}
        {showTooltip && (
          <div
            style={tooltipStyle}
            tabIndex={0}
            aria-label="Overlay onboarding hint"
            onClick={() => setShowTooltip(false)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setShowTooltip(false)}
          >
            <span role="img" aria-label="hand">🖱️</span> Drag me anywhere! Minimize or close when you're done.
          </div>
        )}
        {/* Header */}
        <div style={headerGlass} className="drag-handle flex justify-between items-center select-none">
          <span className="font-bold text-lg text-blue-900 tracking-wide">Meeting Assistant</span>
          <div className="flex gap-2 items-center">
            <button
              className="px-3 py-1 text-lg bg-white/60 hover:bg-blue-200 hover:text-blue-900 rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => setMinimized(true)}
              aria-label="Minimize overlay"
              tabIndex={0}
            >
              –
            </button>
            <button
              className="px-3 py-1 text-lg bg-white/60 hover:bg-red-400 hover:text-white rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              onClick={onClose}
              aria-label="Close overlay"
              tabIndex={0}
            >
              ×
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col gap-4 p-6 overflow-hidden">
          <div style={cardStyle} className="flex-1 flex flex-col">
            <div className="font-semibold text-base text-blue-700 mb-2">Live Transcript</div>
            <div className="h-24 bg-white/40 border border-white/30 rounded p-3 text-sm text-gray-700 overflow-y-auto flex-1">
              {transcript.length === 0 ? (
                <span className="text-gray-400">Transcript area...</span>
              ) : (
                transcript.slice(-6).map((t, i) => <div key={i}>{t}</div>)
              )}
            </div>
          </div>
          <div style={cardStyle}>
            <div className="font-semibold text-base text-blue-700 mb-2">Summary</div>
            <div className="bg-white/40 border border-white/30 rounded p-3 text-sm text-gray-700 min-h-[36px]">
              {summary || <span className="text-gray-400">Meeting summary will appear here.</span>}
            </div>
          </div>
          <div style={cardStyle}>
            <div className="font-semibold text-base text-blue-700 mb-2">Conversation Points</div>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              {points.length === 0 ? (
                <li className="text-gray-400">No points yet.</li>
              ) : (
                points.map((p, i) => <li key={i}>{p}</li>)
              )}
            </ul>
          </div>
          <form onSubmit={handleUserSubmit} className="mt-auto flex flex-col gap-3">
            <input
              type="text"
              className="border border-blue-200 rounded px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/80"
              placeholder="Ask a question..."
              value={userInput}
              onChange={handleUserInput}
              aria-label="Ask a question to the assistant"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white text-base font-semibold rounded px-4 py-2 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Ask AI
            </button>
            {aiAnswer && (
              <div className="bg-white/70 border border-white/30 rounded p-3 text-sm text-blue-900 mt-1">
                <span className="font-semibold">AI:</span> {aiAnswer}
              </div>
            )}
          </form>
        </div>
      </div>
    </Rnd>
  );
};

export default FloatingAssistantOverlay; 