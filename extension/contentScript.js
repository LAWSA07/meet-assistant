let iframe = null;
let activationArea = null;

function toggleOverlay() {
  try {
    console.log('Toggle overlay called');
    
    if (iframe) {
      iframe.remove();
      iframe = null;
      if (activationArea) {
        activationArea.remove();
        activationArea = null;
      }
      console.log('Overlay removed');
      return;
    }

    // Check if we can inject into this page
    if (document.location.protocol === 'chrome:' || 
        document.location.protocol === 'chrome-extension:' ||
        document.location.protocol === 'moz-extension:') {
      console.log('Cannot inject overlay into chrome:// or extension pages');
      return;
    }

    iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('public/index.html');
    iframe.style.position = 'fixed';
    iframe.style.top = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '380px';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '999999';
    iframe.style.backgroundColor = 'transparent';
    iframe.style.pointerEvents = 'auto'; // Allow interaction by default
    iframe.style.borderRadius = '20px';
    iframe.style.overflow = 'hidden';
    
    // Ensure the iframe can be interacted with
    iframe.onload = function() {
      try {
        // Set pointer events on the overlay content
        const overlayContent = iframe.contentDocument.getElementById('root');
        if (overlayContent) {
          overlayContent.style.pointerEvents = 'auto';
        }
        
        // Add some styling to ensure the overlay is visible and interactive
        const body = iframe.contentDocument.body;
        if (body) {
          body.style.pointerEvents = 'auto'; // Allow clicks on body
        }
        
        console.log('Extension iframe loaded and ready for interaction');
        
      } catch (e) {
        console.log('Could not set pointer events on overlay content:', e);
      }
    };

    document.body.appendChild(iframe);
    console.log('Overlay added successfully');
  } catch (error) {
    console.error('Error toggling overlay:', error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_OVERLAY') {
    toggleOverlay();
  }
});

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'CLOSE_OVERLAY') {
    toggleOverlay();
  } else if (event.data.type === 'REQUEST_AUDIO') {
    // Handle audio capture request from iframe
    handleAudioCapture();
  } else if (event.data.type === 'STOP_AUDIO') {
    // Handle audio stop request from iframe
    stopAudioCapture();
  }
});

// Audio capture variables
let audioStream = null;
let audioContext = null;
let audioProcessor = null;

async function handleAudioCapture() {
  try {
    // Request microphone access from the webpage context
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
        channelCount: 1
      }
    });
    
    // Create audio context for processing
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(audioStream);
    
    // Create script processor for real-time audio processing
    audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    
    audioProcessor.onaudioprocess = function(e) {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Convert float32 to int16 for better compatibility
      const int16Array = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
      }
      
      // Send audio data to iframe for WebSocket transmission
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'AUDIO_DATA',
          data: int16Array.buffer
        }, '*');
      }
    };
    
    source.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);
    
    console.log('Audio capture started successfully');
    
  } catch (error) {
    console.error('Error starting audio capture:', error);
    // Notify iframe of error
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'AUDIO_ERROR',
        error: error.message
      }, '*');
    }
  }
}

function stopAudioCapture() {
  if (audioProcessor) {
    audioProcessor.disconnect();
    audioProcessor = null;
  }
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  console.log('Audio capture stopped');
} 