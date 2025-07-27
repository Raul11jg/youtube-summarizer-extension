import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, FileText, Loader2, Settings, X } from 'lucide-react';

interface VideoInfo {
  title: string;
  url: string;
  duration: string;
}

interface AppSettings {
  summaryLength: 'short' | 'medium' | 'long';
  autoSummarize: boolean;
  apiKey: string;
}

const YouTubeSummarizerApp: React.FC = () => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    summaryLength: 'medium',
    autoSummarize: false,
    apiKey: '',
  });

  useEffect(() => {
    // Cargar configuraciones guardadas
    chrome.storage.sync.get(
      ['summaryLength', 'autoSummarize', 'apiKey'],
      (result) => {
        setSettings({
          summaryLength: result.summaryLength || 'medium',
          autoSummarize: result.autoSummarize || false,
          apiKey: result.apiKey || '',
        });
      }
    );

    // Obtener información del video actual
    getVideoInfo();

    // Escuchar cambios de video en YouTube
    const handleVideoChange = () => {
      setTimeout(getVideoInfo, 1000);
    };

    window.addEventListener('yt-navigate-finish', handleVideoChange);

    return () => {
      window.removeEventListener('yt-navigate-finish', handleVideoChange);
    };
  }, []);

  const getVideoInfo = async () => {
    try {
      // Get current tab info from Chrome API
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url?.includes('youtube.com/watch')) {
        setVideoInfo(null);
        return;
      }

      // Send message to content script to get video info
      chrome.tabs.sendMessage(tab.id!, { action: 'getVideoInfo' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Content script not responding:', chrome.runtime.lastError);
          setVideoInfo(null);
          return;
        }
        
        if (response?.videoInfo) {
          setVideoInfo(response.videoInfo);
        } else {
          setVideoInfo(null);
        }
      });
    } catch (error) {
      console.error('Error obteniendo info del video:', error);
      setVideoInfo(null);
    }
  };

  const handleSummarize = async () => {
    if (!videoInfo) return;

    setIsLoading(true);
    setError('');

    try {
      // Simular llamada a API de AI (por ahora)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockSummary = `Resumen del video "${videoInfo.title}":

Este video cubre los siguientes puntos principales:
• Introducción al tema principal
• Explicación detallada de conceptos clave
• Ejemplos prácticos y casos de uso
• Conclusiones y próximos pasos

Duración: ${videoInfo.duration}

[Nota: Este es un resumen simulado. La integración con IA real está en desarrollo.]`;

      setSummary(mockSummary);
    } catch (err) {
      setError('Error al generar el resumen. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = () => {
    chrome.storage.sync.set(settings, () => {
      console.log('Configuración guardada');
      setShowSettings(false);
    });
  };

  if (showSettings) {
    return (
      <div className="w-full min-h-full bg-white">
        {/* Settings Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Auto-summarize toggle */}
          <div className="pb-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Auto-resumir
            </h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoSummarize}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoSummarize: e.target.checked,
                  }))
                }
                className="mr-3 w-4 h-4 text-red-600"
              />
              <span className="text-sm text-gray-700">
                Resumir videos automáticamente
              </span>
            </label>
          </div>

          {/* Summary length */}
          <div className="pb-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Longitud del resumen
            </h4>
            <div className="flex gap-2">
              {(['short', 'medium', 'long'] as const).map((length) => (
                <button
                  key={length}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, summaryLength: length }))
                  }
                  className={`flex-1 py-2 px-3 text-xs rounded transition-colors ${
                    settings.summaryLength === length
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {length === 'short'
                    ? 'Corto'
                    : length === 'medium'
                    ? 'Medio'
                    : 'Largo'}
                </button>
              ))}
            </div>
          </div>

          {/* API Configuration */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Configuración de API
            </h4>
            <div className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="Clave de API (opcional)"
                  value={settings.apiKey}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  🚧 <strong>Próximamente:</strong> Integración con OpenAI,
                  Claude y otras APIs de IA
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Por ahora se usan resúmenes simulados para pruebas.
                </p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="pt-4">
            <button
              onClick={saveSettings}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Guardar configuración
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            YouTube Summarizer
          </h2>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {/* Video Info */}
        {videoInfo && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Video actual:
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {videoInfo.title}
              </p>
              <p className="text-xs text-gray-500">
                Duración: {videoInfo.duration}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">⚠️ {error}</p>
          </div>
        )}

        {/* Main Action Button */}
        <button
          onClick={handleSummarize}
          disabled={!videoInfo || isLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando resumen...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Resumir video
            </>
          )}
        </button>

        {/* Summary Display */}
        {summary && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Resumen:
            </h3>
            <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {summary}
            </div>
          </div>
        )}

        {/* Extension Status */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {videoInfo ? 'Extensión activa ✅' : 'Abre un video de YouTube'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSummarizerApp;

// Mount the React app
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<YouTubeSummarizerApp />);
}
