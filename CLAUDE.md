# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Development
- `pnpm run build:extension` - Build the complete Chrome extension (compiles code + copies assets)
- `pnpm run dev` - Start Vite development server
- `pnpm run build` - Production build only (without extension packaging)
- `pnpm run format` - Format code with Prettier

### Extension Testing
After building, load the `dist/` folder as an unpacked extension in Chrome Developer Mode to test changes.

## Architecture Overview

This is a Chrome Manifest V3 extension for summarizing YouTube videos, built with React + TypeScript + Tailwind CSS using Vite.

### Core Components

**Popup Interface** (`src/popup.tsx`):
- Main React component with two modes: video summary view and settings panel
- Manages video info extraction, settings persistence via Chrome storage
- Currently uses mock AI responses - **key integration point for real AI APIs**
- State management for video detection, loading states, and error handling

**Content Script** (`src/content.ts`):
- Injects into YouTube watch pages to extract video metadata and transcripts
- Handles YouTube's SPA navigation with `yt-navigate-finish` events
- **Primary location for transcript extraction logic** - currently has placeholder implementation

**Background Service Worker** (`src/background.ts`):
- Manages extension lifecycle, Chrome storage operations, and inter-component messaging
- Implements summary storage with automatic cleanup (keeps last 20)
- **Entry point for AI API integration** - currently contains placeholder summarization logic

### Extension Structure

The extension follows Chrome MV3 patterns:
- `manifest.json` defines permissions (`activeTab`, `storage`) and YouTube host permissions
- `popup.html` loads the compiled React popup
- Build process via Vite creates separate JS bundles for popup, content, and background scripts

### Key Development Patterns

**Settings Management**: 
- Uses Chrome storage sync API for cross-device persistence
- Settings interface in popup allows configuration of summary length, auto-summarize, and API keys
- All settings operations are async and include error handling

**Video Detection**:
- Content script monitors YouTube page changes and extracts video title, URL, duration
- Popup queries active tab to get current video info
- Extension status updates based on whether user is on a YouTube video page

**Styling Architecture**:
- Tailwind CSS with YouTube-themed color scheme (red-600 primary)
- Custom CSS classes for YouTube integration (`.youtube-summarizer-root`)
- Responsive design optimized for Chrome extension popup dimensions (320x400px)

## Key Integration Points

**AI Service Integration**: Replace mock responses in background.ts and content.ts with actual API calls. The architecture supports async operations and proper error handling.

**Transcript Extraction**: Enhance YouTube caption extraction in content.ts - current implementation is a placeholder that needs YouTube's caption API integration.

**Build Configuration**: Vite config includes CSS processing for Tailwind. The `build:extension` script handles both compilation and asset copying for Chrome extension structure.