// Project Co-Pilot Background Script - Service Worker
console.log('🚀 Project Co-Pilot Background Script Loaded');

// Handle tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && 
        (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        
        console.log('📄 Tab updated:', tab.url);
        
        // Inject content script
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['contentScript.js']
        }).catch(error => {
            console.log('⚠️ Could not inject content script:', error);
        });
    }
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('🔧 Extension installed/updated:', details.reason);
});

let ws = null;
let mediaStream = null;
let mediaRecorder = null;

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Received message from content script:', request);
    
    if (request.type === "GET_TABS") {
        chrome.tabs.query({}, (tabs) => {
            const tabsList = tabs.map(tab => ({
                id: tab.id,
                title: tab.title,
                url: tab.url,
                favIconUrl: tab.favIconUrl
            }));
            sendResponse({ tabs: tabsList });
        });
        return true;
    }

    if (request.type === "START_CAPTURE") {
        chrome.tabCapture.capture({audio: true, video: false}, (stream) => {
            if (!stream) {
                alert('Failed to capture tab audio.');
                return;
            }
            mediaStream = stream;
            ws = new WebSocket('ws://127.0.0.1:8001/ws/audio-' + Math.random().toString(36).slice(2, 10));
            ws.onopen = () => {
                mediaRecorder = new MediaRecorder(stream, {mimeType: 'audio/webm'});
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                        e.data.arrayBuffer().then(buffer => ws.send(buffer));
                    }
                };
                mediaRecorder.start(250); // 250ms chunks
            };
            ws.onclose = () => {
                mediaRecorder && mediaRecorder.stop();
                mediaStream && mediaStream.getTracks().forEach(track => track.stop());
            };
        });
        return true;
    }

    switch (request.action) {
        case 'ping':
            sendResponse({ success: true, message: 'Background script responding' });
            break;
        case 'getTabInfo':
            sendResponse({
                tabId: sender.tab.id,
                url: sender.tab.url,
                title: sender.tab.title
            });
            break;
        case 'logAudioData':
            console.log('🎤 Audio data received from tab:', sender.tab.id);
            sendResponse({ success: true });
            break;
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
});

// Handle extension startup
chrome.runtime.onStartup.addListener(function() {
    console.log('🚀 Extension started');
});

console.log('✅ Project Co-Pilot Background Script Ready'); 