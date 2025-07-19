// Content script for YouTube integration
interface VideoInfo {
  title: string;
  url: string;
  duration: string;
}

// Function to extract video information from YouTube page
function getVideoInfo(): VideoInfo | null {
  try {
    const titleElement = document.querySelector(
      'h1.ytd-watch-metadata yt-formatted-string'
    );
    const title = titleElement?.textContent?.trim() || 'Unknown Title';

    const url = window.location.href;

    // Get video duration
    const durationElement = document.querySelector('.ytp-time-duration');
    const duration = durationElement?.textContent?.trim() || 'Unknown Duration';

    return {
      title,
      url,
      duration,
    };
  } catch (error) {
    console.error('Error extracting video info:', error);
    return null;
  }
}

// Function to get video transcript/captions
async function getVideoTranscript(): Promise<string> {
  try {
    // Check if transcript button exists
    const transcriptButton = document.querySelector(
      '[aria-label*="transcript" i], [aria-label*="captions" i]'
    ) as HTMLElement;

    if (!transcriptButton) {
      throw new Error('Transcript not available for this video');
    }

    // Click transcript button if not already opened
    const transcriptPanel = document.querySelector('#transcript');
    if (!transcriptPanel) {
      transcriptButton.click();

      // Wait for transcript to load
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Extract transcript text
    const transcriptItems = document.querySelectorAll(
      '#transcript .ytd-transcript-segment-renderer'
    );
    const transcriptText = Array.from(transcriptItems)
      .map((item) => item.textContent?.trim())
      .filter((text) => text)
      .join(' ');

    if (!transcriptText) {
      throw new Error('Unable to extract transcript text');
    }

    return transcriptText;
  } catch (error) {
    console.error('Error getting transcript:', error);
    throw error;
  }
}

// Function to generate summary (placeholder - you'll need to integrate with an AI service)
async function generateSummary(transcript: string): Promise<string> {
  try {
    // This is a placeholder implementation
    // You would typically send the transcript to an AI service like OpenAI, Claude, etc.

    // For now, return a simple summary based on text length
    const words = transcript.split(' ');
    const summaryLength = Math.min(100, Math.floor(words.length * 0.1));
    const summary = words.slice(0, summaryLength).join(' ') + '...';

    return `Summary: ${summary}\n\n[Note: This is a placeholder summary. Integrate with an AI service for better results.]`;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getVideoInfo') {
    const videoInfo = getVideoInfo();
    sendResponse(videoInfo);
  } else if (message.action === 'summarizeVideo') {
    (async () => {
      try {
        const transcript = await getVideoTranscript();
        const summary = await generateSummary(transcript);
        sendResponse({ success: true, summary });
      } catch (error) {
        sendResponse({
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    })();
    return true; // Indicates we will send a response asynchronously
  }
});

// Optional: Add visual indicator when extension is active
function addExtensionIndicator() {
  if (document.querySelector('#youtube-summarizer-indicator')) return;

  const indicator = document.createElement('div');
  indicator.id = 'youtube-summarizer-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #ff0000;
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  indicator.textContent = '🎥 Summarizer Ready';
  document.body.appendChild(indicator);

  // Remove indicator after 3 seconds
  setTimeout(() => {
    indicator.remove();
  }, 3000);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addExtensionIndicator);
} else {
  addExtensionIndicator();
}
