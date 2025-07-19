// Background service worker for YouTube Summarizer extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('YouTube Summarizer extension installed');

    // Set default settings
    chrome.storage.sync.set({
      summaryLength: 'medium',
      autoSummarize: false,
      apiKey: '',
    });
  } else if (details.reason === 'update') {
    console.log('YouTube Summarizer extension updated');
  }
});

// Handle browser action click (when user clicks extension icon)
chrome.action.onClicked.addListener((tab) => {
  // This is handled by the popup, but we can add fallback logic here
  if (tab.url?.includes('youtube.com/watch')) {
    console.log('Extension clicked on YouTube video page');
  } else {
    console.log('Extension clicked on non-YouTube page');
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'saveSettings':
      chrome.storage.sync.set(message.settings, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'getSettings':
      chrome.storage.sync.get(
        ['summaryLength', 'autoSummarize', 'apiKey'],
        (result) => {
          sendResponse(result);
        }
      );
      return true;

    case 'storeSummary':
      // Store summary in local storage for later retrieval
      const videoId = extractVideoId(message.url);
      if (videoId) {
        chrome.storage.local.set({
          [`summary_${videoId}`]: {
            summary: message.summary,
            timestamp: Date.now(),
            title: message.title,
          },
        });
      }
      sendResponse({ success: true });
      return true;

    case 'getSummary':
      const id = extractVideoId(message.url);
      if (id) {
        chrome.storage.local.get([`summary_${id}`], (result) => {
          sendResponse(result[`summary_${id}`] || null);
        });
      } else {
        sendResponse(null);
      }
      return true;

    default:
      console.log('Unknown message action:', message.action);
  }
});

// Utility function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Handle tab updates to detect YouTube video changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url?.includes('youtube.com/watch')
  ) {
    // Inject content script if needed (usually handled by manifest)
    console.log('YouTube video page loaded:', tab.url);

    // Check if auto-summarize is enabled
    chrome.storage.sync.get(['autoSummarize'], (result) => {
      if (result.autoSummarize) {
        // Send message to content script to auto-summarize
        chrome.tabs.sendMessage(tabId, { action: 'autoSummarize' });
      }
    });
  }
});

// Clean up old summaries (keep only last 50)
chrome.storage.local.get(null, (items) => {
  const summaryKeys = Object.keys(items).filter((key) =>
    key.startsWith('summary_')
  );
  if (summaryKeys.length > 50) {
    // Sort by timestamp and remove oldest
    const summaries = summaryKeys.map((key) => ({
      key,
      timestamp: items[key].timestamp || 0,
    }));

    summaries.sort((a, b) => b.timestamp - a.timestamp);
    const keysToRemove = summaries.slice(50).map((item) => item.key);

    chrome.storage.local.remove(keysToRemove);
  }
});

// Export for use in other files (if needed)
export { extractVideoId };
