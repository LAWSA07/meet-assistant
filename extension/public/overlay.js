let ws = null;
let isRecording = false;
let audioContext = null;
let siteAudioSource = null;
let microphoneSource = null;
let audioProcessor = null;

// UI Elements
const overlay = document.getElementById('overlay');
const statusIndicator = document.getElementById('status-indicator');
const aiStatus = document.getElementById('ai-status');
const conversationLog = document.getElementById('conversation-log');
const summaryArea = document.getElementById('summary-area');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Project Co-Pilot Overlay Initialized');
    updateStatus('ready', '🟢 Ready to start');
    updateAIStatus('Ready');
    
    // Test backend connection on load
    testBackendConnection();
});

function updateStatus(status, text) {
    statusIndicator.textContent = text;
    statusIndicator.className = `status ${status}`;
}

function updateAIStatus(status) {
    aiStatus.textContent = status;
    aiStatus.className = `ai-status ${status.toLowerCase()}`;
}

function addMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const icon = type === 'user' ? '🎤' : '🤖';
    const timestamp = new Date().toLocaleTimeString();
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="icon">${icon}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${text}</div>
    `;
    
    conversationLog.appendChild(messageDiv);
    conversationLog.scrollTop = conversationLog.scrollHeight;
}

function updateSummary(summary) {
    summaryArea.innerHTML = `
        <div class="summary-header">
            <span class="icon">📋</span>
            <span>Meeting Summary</span>
        </div>
        <div class="summary-content">${summary}</div>
    `;
}

function updateTalkingPoints(points) {
    if (points && points.talking_points && points.talking_points.length > 0) {
        const talkingPointsDiv = document.createElement('div');
        talkingPointsDiv.className = 'talking-points';
        talkingPointsDiv.innerHTML = `
            <div class="points-header">
                <span class="icon">💬</span>
                <span>Suggested Topics</span>
            </div>
            <ul class="points-list">
                ${points.talking_points.map(point => `<li>${point}</li>`).join('')}
            </ul>
        `;
        
        // Remove existing talking points and add new ones
        const existingPoints = summaryArea.querySelector('.talking-points');
        if (existingPoints) {
            existingPoints.remove();
        }
        summaryArea.appendChild(talkingPointsDiv);
    }
}

function testBackendConnection() {
    console.log('🧪 Testing backend connection...');
    const apiUrl = 'http://127.0.0.1:8001/';
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Backend connection successful:', data);
            updateStatus('connected', '🟢 Connected');
            updateAIStatus('Connected');
        })
        .catch(error => {
            console.log('❌ Backend connection failed:', error);
            updateStatus('disconnected', '🔴 Disconnected');
            updateAIStatus('Disconnected');
        });
}

async function startAudioCapture() {
    if (isRecording) return;
    
    try {
        console.log('🎤 Starting enhanced audio capture...');
        updateStatus('connecting', '🟡 Connecting...');
        
        // Create audio context
        audioContext = new AudioContext({ sampleRate: 16000 });
        
        // Capture microphone audio
        const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true
            }
        });
        
        // Capture site audio (tab audio)
        const siteStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1
            }
        });
        
        // Create sources
        microphoneSource = audioContext.createMediaStreamSource(micStream);
        siteAudioSource = audioContext.createMediaStreamSource(siteStream);
        
        // Create mixer to combine both audio sources
        const mixer = audioContext.createGain();
        const micGain = audioContext.createGain();
        const siteGain = audioContext.createGain();
        
        // Set gains (adjust these for balance)
        micGain.gain.value = 0.7;  // Microphone volume
        siteGain.gain.value = 0.3; // Site audio volume
        
        // Connect sources to mixer
        microphoneSource.connect(micGain);
        siteAudioSource.connect(siteGain);
        micGain.connect(mixer);
        siteGain.connect(mixer);
        
        // Create processor for combined audio
        audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        
        audioProcessor.onaudioprocess = function(e) {
            if (ws && ws.readyState === WebSocket.OPEN && isRecording) {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Convert to 16-bit PCM
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }
                
                // Send to backend
                const audioB64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
                ws.send(JSON.stringify({
                    type: 'audio',
                    audio: audioB64
                }));
            }
        };
        
        mixer.connect(audioProcessor);
        audioProcessor.connect(audioContext.destination);
        
        // Connect WebSocket
        await connectWebSocket();
        
        isRecording = true;
        startButton.style.display = 'none';
        stopButton.style.display = 'block';
        updateStatus('recording', '🔴 Recording');
        
        console.log('✅ Enhanced audio capture started');
        
    } catch (error) {
        console.error('❌ Audio capture failed:', error);
        updateStatus('error', '🔴 Error');
        addMessage('ai', `Audio capture failed: ${error.message}`);
    }
}

async function connectWebSocket() {
    try {
        const wsUrl = 'ws://127.0.0.1:8001/ws/extension-session';
        console.log('🔗 Connecting to WebSocket URL:', wsUrl);
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = function() {
            console.log('✅ WebSocket connected');
            updateStatus('recording', '🔴 Recording');
            updateAIStatus('Connected');
            addMessage('ai', 'Connected to AI backend. Start speaking!');
        };
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log('📨 Received message:', data.type);
            
            if (data.type === 'transcript') {
                addMessage('user', data.text);
            } else if (data.type === 'conversation_points') {
                console.log('💡 Received conversation points:', data.points);
                
                if (data.points.summary) {
                    updateSummary(data.points.summary);
                }
                
                if (data.points.talking_points) {
                    updateTalkingPoints(data.points);
                }
                
                // Show action items if available
                if (data.points.action_items && data.points.action_items.length > 0) {
                    const actionItemsDiv = document.createElement('div');
                    actionItemsDiv.className = 'action-items';
                    actionItemsDiv.innerHTML = `
                        <div class="items-header">
                            <span class="icon">✅</span>
                            <span>Action Items</span>
                        </div>
                        <ul class="items-list">
                            ${data.points.action_items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    `;
                    
                    const existingItems = summaryArea.querySelector('.action-items');
                    if (existingItems) {
                        existingItems.remove();
                    }
                    summaryArea.appendChild(actionItemsDiv);
                }
            } else if (data.type === 'error') {
                addMessage('ai', `Error: ${data.message}`);
            }
        };
        
        ws.onerror = function(error) {
            console.error('❌ WebSocket error:', error);
            updateStatus('error', '🔴 Error');
            updateAIStatus('Error');
            addMessage('ai', 'Connection error. Please check if the backend is running at http://127.0.0.1:8001');
        };
        
        ws.onclose = function() {
            console.log('🔌 WebSocket closed');
            updateStatus('disconnected', '🔴 Disconnected');
            updateAIStatus('Disconnected');
        };
        
    } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        updateStatus('error', '🔴 Error');
        updateAIStatus('Error');
    }
}

function stopAudioCapture() {
    if (!isRecording) return;
    
    console.log('⏹️ Stopping audio capture...');
    
    isRecording = false;
    startButton.style.display = 'block';
    stopButton.style.display = 'none';
    updateStatus('ready', '🟢 Ready');
    
    // Cleanup audio
    if (audioProcessor) {
        audioProcessor.disconnect();
        audioProcessor = null;
    }
    
    if (microphoneSource) {
        microphoneSource.disconnect();
        microphoneSource = null;
    }
    
    if (siteAudioSource) {
        siteAudioSource.disconnect();
        siteAudioSource = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    
    // Close WebSocket
    if (ws) {
        ws.close();
        ws = null;
    }
    
    addMessage('ai', 'Recording stopped');
    console.log('✅ Audio capture stopped');
}

function clearConversation() {
    conversationLog.innerHTML = '';
    summaryArea.innerHTML = `
        <div class="summary-placeholder">
            <span class="icon">📋</span>
            <span>Meeting summary will appear here</span>
        </div>
    `;
}

// Event listeners
document.getElementById('start-button').addEventListener('click', startAudioCapture);
document.getElementById('stop-button').addEventListener('click', stopAudioCapture);
document.getElementById('clear-button').addEventListener('click', clearConversation);
document.getElementById('close-button').addEventListener('click', function() {
    stopAudioCapture();
    overlay.style.display = 'none';
});

// Make overlay draggable
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

document.getElementById('drag-handle').addEventListener('mousedown', function(e) {
    isDragging = true;
    dragOffset.x = e.clientX - overlay.offsetLeft;
    dragOffset.y = e.clientY - overlay.offsetTop;
    e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        overlay.style.left = (e.clientX - dragOffset.x) + 'px';
        overlay.style.top = (e.clientY - dragOffset.y) + 'px';
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
}); 