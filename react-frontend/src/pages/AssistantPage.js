import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8001/ws/assistant';

// --- Logo (styled text) ---
const Logo = () => (
  <span className="text-2xl font-bold tracking-wide font-sans" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
    Co<span className="font-extrabold">Pilot</span>
  </span>
);

// --- Fixed Glassy Navbar ---
const Navbar = ({ onLogout }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
    <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-8">
      <Logo />
      <button
        onClick={onLogout}
        className="bg-white text-black font-semibold py-2 px-6 rounded-full shadow hover:bg-gray-200 transition-colors"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        Logout
      </button>
    </div>
  </nav>
);

// --- Reusable UI Components & Icons ---
const UserIcon = () => <div className="rounded-full bg-gray-800 w-20 h-20 flex items-center justify-center text-4xl text-gray-400 mb-2 shadow-inner">👤</div>;

const Panel = ({ title, children, className = '' }) => (
  <div className={`bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg flex flex-col p-8 ${className}`}>
    <h2 className="text-2xl font-serif text-white mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>{title}</h2>
    <div className="flex-1 overflow-hidden h-full">
      {children}
    </div>
  </div>
);

const Notification = ({ message, type, onDismiss }) => {
  if (!message) return null;
  const baseStyle = "fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-2xl text-white transition-all duration-300";
  const typeStyles = {
    info: 'bg-gray-800/90 backdrop-blur-sm',
    success: 'bg-white/90 text-black backdrop-blur-sm',
    error: 'bg-black/90 text-white border border-white/30 backdrop-blur-sm',
  };
  return (
    <div className={`${baseStyle} ${typeStyles[type]}`} onClick={onDismiss}>
      {message}
    </div>
  );
};

const SkeletonLoader = ({ lines = 3 }) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(lines)].map((_, i) => (
      <div key={i} className="h-4 bg-gray-700/50 rounded-md"></div>
    ))}
  </div>
);

// --- Main Application Component ---

const AssistantPage = () => {
  const navigate = useNavigate();
  // State Management
  const [isRecording, setIsRecording] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [insights, setInsights] = useState({ summary: '', points: {} });
  const [aiResponse, setAiResponse] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  // Refs for managing streams and connections
  const wsAudioRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const videoRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // --- Core Logic ---

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: 'info' }), 5000);
  };

  const resetState = useCallback(() => {
    setIsRecording(false);
    setVideoStream(null);
    setTranscript([]);
    setInsights({ summary: '', points: {} });
    setAiResponse('');
  }, []);

  const stopRecording = useCallback(() => {
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (wsAudioRef.current) wsAudioRef.current.close();
    
    resetState();
    showNotification('Sharing stopped.', 'info');
  }, [resetState]);

  const startAudioProcessing = async (stream, sourceName) => {
    try {
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track found in the selected source.');
      }

      const source = audioContext.createMediaStreamSource(new MediaStream(audioTracks));
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sessionId = `${sourceName.toLowerCase().replace(/\s/g, '-')}-${Math.random().toString(36).slice(2, 10)}`;
      const ws = new WebSocket(WS_URL.replace('assistant', sessionId));
      wsAudioRef.current = ws;

      ws.onopen = () => {
        setIsRecording(true);
        showNotification(`${sourceName} connected successfully.`, 'success');

        processor.onaudioprocess = async (event) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const inputData = event.inputBuffer.getChannelData(0);
          const resampled = await resampleTo16kHz(inputData, event.inputBuffer.sampleRate);
          const pcmData = new Int16Array(resampled.length);
          for (let i = 0; i < resampled.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, resampled[i] * 32768));
          }
          ws.send(pcmData.buffer);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transcript') setTranscript(prev => [...prev, data.text]);
          if (data.type === 'summary') setInsights(prev => ({...prev, summary: data.text }));
          if (data.type === 'points' || data.type === 'conversation_points') setInsights(prev => ({...prev, points: data.points || data }));
          if (data.type === 'ai_answer') {
            setAiResponse(data.text);
            setIsAiReplying(false);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        if (isRecording) stopRecording();
      };
      
      ws.onerror = () => {
        showNotification('WebSocket connection error.', 'error');
        stopRecording();
      };

      stream.getTracks().forEach(track => {
        track.onended = () => stopRecording();
      });

      setVideoStream(stream);

    } catch (err) {
      console.error(`${sourceName} connection error:`, err);
      showNotification(`Failed to connect to ${sourceName}: ${err.message}`, 'error');
      resetState();
    }
  };

  const handleConnectTabAudio = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      showNotification('Screen sharing is not supported in this browser.', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const videoTrack = stream.getVideoTracks();
      const tabName = videoTrack?.label || 'Selected Tab';
      startAudioProcessing(stream, tabName);
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        showNotification(`Error capturing tab: ${err.message}`, 'error');
      }
    }
  };

  const handleAsk = (question) => {
    if (wsAudioRef.current && wsAudioRef.current.readyState === WebSocket.OPEN) {
      setIsAiReplying(true);
      setAiResponse('');
      wsAudioRef.current.send(JSON.stringify({ type: 'user_message', message: question }));
    } else {
      showNotification('Not connected. Please start sharing first.', 'error');
    }
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleAsk(userInput);
      setUserInput('');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- Effects ---

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center font-sans" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      <Navbar onLogout={handleLogout} />
      {/* Move button outside overlays and fixed backgrounds */}
      <div className="w-full flex justify-start max-w-7xl mx-auto mt-24 px-4 z-20 relative">
        <button
          onClick={() => navigate('/')}
          className="bg-white text-black font-bold py-2 px-6 rounded-full shadow transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          style={{ cursor: 'pointer' }}
        >
          ← Return to Home Page
        </button>
      </div>
      <div className="fixed inset-0 z-0 bg-black/90 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onDismiss={() => setNotification({ message: '', type: 'info' })}
      />
      <div className="relative z-10 w-full max-w-7xl flex flex-col pt-28 pb-8 px-4 min-h-[90vh]">
        <main className="w-full flex-grow grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="flex flex-col gap-10">
            <Panel title="Controls & Shared Tab" className="flex-shrink-0">
              <div className="flex flex-col h-full">
                {!isRecording? (
                  <div className="flex gap-4 mb-6">
                    <button onClick={handleConnectTabAudio} className="flex items-center justify-center px-8 py-3 rounded-full bg-white text-black font-semibold shadow hover:bg-gray-200 transition-all focus:outline-none focus:ring-4 focus:ring-white/20">
                      <span className="mr-2">▶</span> Select Tab
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      RECORDING
                    </div>
                    <button onClick={stopRecording} className="flex items-center justify-center px-6 py-2 rounded-full bg-black text-white font-bold text-sm shadow border border-white/20 hover:bg-white hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-white/20">
                      <span className="mr-2">■</span> Stop
                    </button>
                  </div>
                )}
                <div className="flex-1 bg-black/40 rounded-xl flex flex-col items-center justify-center p-4">
                  {videoStream? (
                    <video ref={videoRef} autoPlay muted playsInline className="rounded-lg w-full h-full max-h-56 object-contain border border-white/10" />
                  ) : (
                    <div className="text-center">
                      <UserIcon />
                      <p className="text-gray-400 text-sm mt-2">No tab or microphone is being shared.</p>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
            <Panel title="Transcript" className="flex-grow">
              <div className="h-full max-h-96 overflow-y-auto pr-2 text-white text-base custom-scrollbar rounded-xl">
                {transcript.length === 0? (
                  <p className="text-gray-500">Live transcript will appear here...</p>
                ) : (
                  <ul className="space-y-2">
                    {transcript.map((t, i) => <li key={i} className="bg-black/40 p-3 rounded-md border border-white/5 text-white/90">{t}</li>)}
                    <div ref={transcriptEndRef} />
                  </ul>
                )}
              </div>
            </Panel>
          </div>
          {/* Right Column */}
          <div className="flex flex-col gap-10">
            <Panel title="Live Insights" className="flex-grow">
              <div className="h-full max-h-96 overflow-y-auto pr-2 text-base custom-scrollbar rounded-xl">
                {isRecording &&!insights.summary && (!insights.points || Object.keys(insights.points).length === 0)? (
                  <SkeletonLoader lines={5} />
                ) :!isRecording &&!insights.summary? (
                   <p className="text-gray-500">AI-generated insights will appear here once you start sharing.</p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-300 text-lg font-serif" style={{ fontFamily: "'DM Serif Display', serif" }}>Summary</h3>
                      <p className="text-white/90 text-base">{insights.summary || "No summary yet."}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold text-gray-300 text-lg font-serif" style={{ fontFamily: "'DM Serif Display', serif" }}>Action Items</h3>
                        <ul className="list-disc list-inside text-white/90">
                          {insights.points?.action_items?.length > 0? insights.points.action_items.map((item, i) => <li key={i}>{item}</li>) : <li>None</li>}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-300 text-lg font-serif" style={{ fontFamily: "'DM Serif Display', serif" }}>Talking Points</h3>
                        <ul className="list-disc list-inside text-white/90">
                          {insights.points?.talking_points?.length > 0? insights.points.talking_points.map((item, i) => <li key={i}>{item}</li>) : <li>None</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Panel>
            <Panel title="Ask Co-Pilot" className="flex-shrink-0">
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto mb-3 custom-scrollbar">
                  {aiResponse && (
                    <div className="bg-black/40 p-4 rounded-lg text-base text-white/90 border border-white/10">
                      <span className="font-bold">AI:</span> {aiResponse}
                    </div>
                  )}
                  {isAiReplying && (
                     <div className="flex items-center gap-2 text-gray-400 text-base p-2">
                       <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                       <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                       <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                       <span>AI is thinking...</span>
                     </div>
                  )}
                </div>
                <form onSubmit={handleUserSubmit} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-white/10 rounded-full px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 bg-gray-900 text-white placeholder-gray-500 shadow"
                    placeholder={isRecording? "Ask a question..." : "Start sharing to ask..."}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={!isRecording || isAiReplying}
                  />
                  <button
                    type="submit"
                    className="p-3 rounded-full bg-white text-black shadow hover:bg-gray-200 transition-colors focus:outline-none focus:ring-4 focus:ring-white/20 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={!isRecording || isAiReplying || !userInput.trim()}
                  >
                    <span className="font-bold text-lg">→</span>
                  </button>
                </form>
              </div>
            </Panel>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper function for resampling audio to 16kHz PCM.
async function resampleTo16kHz(float32Buffer, originalSampleRate) {
  if (originalSampleRate === 16000) return float32Buffer;
  const offlineCtx = new window.OfflineAudioContext(1, Math.ceil(float32Buffer.length * 16000 / originalSampleRate), 16000);
  const buffer = offlineCtx.createBuffer(1, float32Buffer.length, originalSampleRate);
  buffer.copyToChannel(float32Buffer, 0);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  const rendered = await offlineCtx.startRendering();
  return rendered.getChannelData(0);
}

export default AssistantPage; 