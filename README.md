# YouTube Summarizer Chrome Extension

A Chrome extension that summarizes YouTube videos using AI.

## Features

- ✨ One-click video summarization
- 🎯 Works directly on YouTube video pages
- 💾 Saves summaries locally for quick access
- 🎨 Clean, modern UI built with React and Tailwind CSS
- ⚡ Fast and lightweight

## Development

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Build the extension:

```bash
pnpm run build:extension
```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Development Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run build:extension` - Build extension and copy necessary files

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in the toolbar
3. Click "Summarize Video" to generate a summary
4. The summary will appear in the popup

## Architecture

- **Popup** (`src/popup.tsx`): Main UI component built with React
- **Content Script** (`src/content.ts`): Injected into YouTube pages to extract video data
- **Background Script** (`src/background.ts`): Service worker handling extension lifecycle and storage
- **Manifest** (`manifest.json`): Extension configuration and permissions

## Notes

- The current implementation includes a placeholder for AI summarization
- You'll need to integrate with an AI service (OpenAI, Claude, etc.) for actual summarization
- Transcript extraction relies on YouTube's built-in transcript feature

## License

ISC
