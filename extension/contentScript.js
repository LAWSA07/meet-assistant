// Project Co-Pilot Content Script - Refactored for Clean Overlay and Audio Capture
let overlay = null;
let isOverlayVisible = false;
let audioStream = null;
let audioContext = null;
let audioProcessor = null;
let isAudioActive = false;

console.log('🚀 Project Co-Pilot Content Script Loaded');

// Overlay creation and management
function createOverlay() {
    if (overlay) return;
    overlay = document.createElement('iframe');
    overlay.src = chrome.runtime.getURL('public/overlay.html');
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 380px;
        height: 600px;
        border: none;
        border-radius: 16px;
        z-index: 10000;
        display: none;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(overlay);
    window.addEventListener('message', handleOverlayMessage);
    console.log('✅ Overlay created');
}

function showOverlay() {
    if (!overlay) createOverlay();
    overlay.style.display = 'block';
    isOverlayVisible = true;
    console.log('👁️ Overlay shown');
}

function hideOverlay() {
    if (overlay) {
        overlay.style.display = 'none';
        isOverlayVisible = false;
        stopAudioCapture();
        console.log('👁️ Overlay hidden');
    }
}

function toggleOverlay() {
    if (isOverlayVisible) {
        hideOverlay();
    } else {
        showOverlay();
    }
}

// Audio capture logic (content script only)
async function startAudioCapture() {
    if (isAudioActive) return;
    try {
        console.log('🎤 Starting audio capture from content script...');
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 16000,
                channelCount: 1
            }
        });
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        const source = audioContext.createMediaStreamSource(audioStream);
        source.connect(audioProcessor);
        audioProcessor.connect(audioContext.destination);
        audioProcessor.onaudioprocess = (event) => {
            if (isAudioActive && overlay && overlay.contentWindow) {
                const inputData = event.inputBuffer.getChannelData(0);
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                const uint8Array = new Uint8Array(pcmData.buffer);
                const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
                overlay.contentWindow.postMessage({ type: 'AUDIO_DATA', data: base64String }, '*');
            }
        };
        isAudioActive = true;
        if (overlay && overlay.contentWindow) {
            overlay.contentWindow.postMessage({ type: 'AUDIO_STATUS', status: 'active' }, '*');
        }
        console.log('✅ Audio capture started');
    } catch (error) {
        console.error('❌ Error starting audio capture:', error);
        let errorMessage = 'Failed to start audio capture';
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Microphone permission denied. Please allow microphone access and try again.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Microphone is already in use by another application.';
        } else {
            errorMessage = `Audio error: ${error.message}`;
        }
        if (overlay && overlay.contentWindow) {
            overlay.contentWindow.postMessage({ type: 'AUDIO_ERROR', error: errorMessage }, '*');
        }
    }
}

function stopAudioCapture() {
    if (!isAudioActive) return;
    if (audioProcessor) {
        audioProcessor.disconnect();
        audioProcessor = null;
    }
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
    }
    isAudioActive = false;
    if (overlay && overlay.contentWindow) {
        overlay.contentWindow.postMessage({ type: 'AUDIO_STATUS', status: 'stopped' }, '*');
    }
    console.log('✅ Audio capture stopped');
}

// Overlay message handler
function handleOverlayMessage(event) {
    if (!overlay || event.source !== overlay.contentWindow) return;
    const { type } = event.data;
    switch (type) {
        case 'START_AUDIO':
            startAudioCapture();
            break;
        case 'STOP_AUDIO':
            stopAudioCapture();
            break;
        case 'CLOSE_OVERLAY':
            hideOverlay();
            break;
        case 'EXTENSION_INTERACTION':
            // Reserved for future use
            break;
    }
}

// Keyboard shortcut to toggle overlay (Ctrl+Shift+P)
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        toggleOverlay();
    }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
        case 'ping':
            sendResponse({ success: true, message: 'Content script responding' });
            break;
        case 'toggleOverlay':
            toggleOverlay();
            sendResponse({ success: true });
            break;
        case 'showOverlay':
            showOverlay();
            sendResponse({ success: true });
            break;
        case 'hideOverlay':
            hideOverlay();
            sendResponse({ success: true });
            break;
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
    return true;
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopAudioCapture();
    if (overlay) {
        overlay.remove();
        overlay = null;
    }
});

// Initialize overlay creation
createOverlay();
console.log('✅ Project Co-Pilot Content Script Initialized');

// Listen for messages from the React application (window)
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const message = event.data;
  if (message && message.source === 'REACT_APP') {
    chrome.runtime.sendMessage(message, (response) => {
      window.postMessage({ source: 'EXTENSION', ...response }, '*');
    });
  }
}); 