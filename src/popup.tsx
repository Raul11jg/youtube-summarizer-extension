import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Settings, Sparkles } from 'lucide-react';

interface ExtensionSettings {
  autoSummarize: boolean;
  apiKey: string;
  summaryLength: 'short' | 'medium' | 'long';
}

const PopupApp: React.FC = () => {
  const [settings, setSettings] = useState<ExtensionSettings>({
    autoSummarize: false,
    apiKey: '',
    summaryLength: 'medium',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getSettings',
      });
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: settings,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAutoSummarize = () => {
    const newSettings = { ...settings, autoSummarize: !settings.autoSummarize };
    setSettings(newSettings);
    // Auto-save this setting
    chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: newSettings,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h1 className="text-lg font-semibold text-gray-900">
          YouTube Summarizer
        </h1>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        {/* Auto-summarize toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Auto-summarize
            </h3>
            <p className="text-xs text-gray-600">
              Automatically summarize new videos
            </p>
          </div>
          <button
            onClick={handleToggleAutoSummarize}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.autoSummarize ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoSummarize ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Summary length */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Summary length
          </h3>
          <div className="flex space-x-2">
            {(['short', 'medium', 'long'] as const).map((length) => (
              <button
                key={length}
                onClick={() =>
                  setSettings({ ...settings, summaryLength: length })
                }
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  settings.summaryLength === length
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {length.charAt(0).toUpperCase() + length.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* API Key (placeholder for future) */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            API Configuration
          </h3>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
            🚧 API integration coming soon!
            <br />
            Currently using mock summaries for testing.
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Status */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-1 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Extension Active</span>
        </div>
      </div>
    </div>
  );
};

// Render the popup
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
