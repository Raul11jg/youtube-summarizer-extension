import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, FileText, Loader2 } from 'lucide-react';
import './styles.css';

interface VideoInfo {
  title: string;
  url: string;
  duration: string;
}

const Popup: React.FC = () => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab.url?.includes('youtube.com/watch')) {
        // Send message to content script to get video info
        chrome.tabs.sendMessage(currentTab.id!, { action: 'getVideoInfo' }, (response) => {
          if (response) {
            setVideoInfo(response);
          }
        });
      } else {
        setError('Please open a YouTube video to use this extension.');
      }
    });
  }, []);

  const handleSummarize = async () => {
    if (!videoInfo) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Get current tab and send message to content script
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tabs[0].id!, { action: 'summarizeVideo' });
      
      if (response.success) {
        setSummary(response.summary);
      } else {
        setError(response.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('Error communicating with the page. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 mb-2">⚠️</div>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Play className="w-5 h-5 text-red-600" />
        <h1 className="text-lg font-semibold">YouTube Summarizer</h1>
      </div>

      {videoInfo && (
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Current Video:</h2>
          <p className="text-xs text-gray-600 line-clamp-2">{videoInfo.title}</p>
          <p className="text-xs text-gray-500 mt-1">Duration: {videoInfo.duration}</p>
        </div>
      )}

      <button
        onClick={handleSummarize}
        disabled={!videoInfo || isLoading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 mb-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Summary...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Summarize Video
          </>
        )}
      </button>

      {summary && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Summary:</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}