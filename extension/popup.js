document.getElementById('captureBtn').onclick = async () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    chrome.runtime.sendMessage({type: 'START_CAPTURE', tabId: tab.id});
    window.close();
  });
}; 