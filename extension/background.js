// Project Co-Pilot Chrome Extension Background Script
// Handles overlay toggle for Manifest V3

chrome.action.onClicked.addListener(async (tab) => {
  try {
    console.log('Extension clicked on tab:', tab.url);
    
    // Check if we can inject into this tab
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('moz-extension://')) {
      console.log('Cannot inject into chrome:// or extension pages');
      return;
    }
    
    // Toggle overlay - check if content script is available
    try {
      console.log('Sending TOGGLE_OVERLAY message to tab');
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' });
      console.log('Message sent successfully');
    } catch (error) {
      console.log('Content script not ready, injecting...');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.js']
      });
      // Wait a moment for script to load
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' });
        } catch (e) {
          console.error('Failed to toggle overlay:', e);
        }
      }, 100);
    }
    
  } catch (error) {
    console.error('Error in extension action:', error);
  }
}); 