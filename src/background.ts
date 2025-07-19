// Minimal background service worker
console.log('YouTube Summarizer background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('YouTube Summarizer installed:', details.reason);

  // Set default settings
  chrome.storage.sync.set({
    autoSummarize: false,
    apiKey: '',
    summaryLength: 'medium',
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.action) {
    case 'summarizeVideo':
      handleSummarizeVideo(message.videoData)
        .then((result) => sendResponse(result))
        .catch((error) =>
          sendResponse({ success: false, error: error.message })
        );
      return true; // Keep message channel open for async response

    case 'getSettings':
      chrome.storage.sync.get(
        ['autoSummarize', 'apiKey', 'summaryLength'],
        (result) => {
          sendResponse({ success: true, data: result });
        }
      );
      return true;

    case 'saveSettings':
      chrome.storage.sync.set(message.settings, () => {
        sendResponse({ success: true });
      });
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Placeholder summarization function
async function handleSummarizeVideo(videoData: any): Promise<any> {
  try {
    console.log('Summarizing video:', videoData.title);

    // TODO: Replace with actual AI API call
    // For now, return a mock summary
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay

    const mockSummary = `This is a placeholder summary for "${videoData.title}". 
    
    The video covers the main topic in approximately ${videoData.duration}. Key points discussed include various aspects of the subject matter, with practical examples and explanations provided throughout.
    
    [Note: This is a mock summary. Real AI integration coming soon!]`;

    const mockKeyPoints = [
      'Introduction to the main topic',
      'Key concepts and definitions explained',
      'Practical examples and use cases',
      'Conclusion and takeaways',
    ];

    // Store the summary for quick access
    const summaryData = {
      summary: mockSummary,
      keyPoints: mockKeyPoints,
      videoId: videoData.videoId,
      timestamp: Date.now(),
    };

    // Save to storage
    chrome.storage.local.set({
      [`summary_${videoData.videoId}`]: summaryData,
    });

    return {
      success: true,
      data: summaryData,
    };
  } catch (error) {
    console.error('Error in handleSummarizeVideo:', error);
    return {
      success: false,
      error: 'Failed to generate summary',
    };
  }
}

// Clean up old summaries (keep only last 20)
chrome.storage.local.get(null, (items) => {
  const summaryKeys = Object.keys(items).filter((key) =>
    key.startsWith('summary_')
  );
  if (summaryKeys.length > 20) {
    const oldKeys = summaryKeys.slice(0, summaryKeys.length - 20);
    chrome.storage.local.remove(oldKeys);
    console.log('Cleaned up', oldKeys.length, 'old summaries');
  }
});
