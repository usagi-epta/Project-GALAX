# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project-GALAX** is a Progressive Web App (PWA) social community platform built with vanilla JavaScript. It features real-time chat, interactive drawing, voice/video calling, file sharing, and pixel art avatars. The application uses a component-based architecture with dynamic library loading for graphics capabilities.

## Development Setup

This project uses **no build system** - it runs directly in the browser using native ES6 modules:

- **Development Server**: Use any static web server (Python's `http.server`, Node's `http-server`, VS Code Live Server)
- **Testing**: No test framework configured - manually test features in browser
- **Linting**: No linting configuration found - maintain code quality manually
- **Dependencies**: All graphics libraries (Konva.js, PIXI.js, Three.js) loaded dynamically from CDN

## Architecture

### Core Structure
```
js/
├── main.js              # Application orchestrator and lifecycle management
├── config.js            # Centralized configuration with feature flags
├── components/          # Feature-specific modules
│   ├── chat.js          # Real-time messaging with WebSocket
│   ├── avatars.js       # Pixel art avatar system
│   ├── drawing.js       # Interactive canvas drawing
│   ├── voice.js         # WebRTC voice/video calls
│   └── [others]         # Navigation, files, profile, notifications
├── utils/               # Core utilities
│   ├── state.js         # Reactive state management with proxies
│   ├── storage.js       # Local storage and persistence
│   └── graphics.js      # Graphics utilities and optimization
└── libs/
    └── graphics-loader.js # Dynamic library loading system
```

### Key Architectural Patterns

1. **Component-Based Architecture**: Each feature is a self-contained class exposed on `window`
2. **Reactive State Management**: Proxy-based state system with path subscriptions (`state.js:1-200`)
3. **Dynamic Library Loading**: Graphics libraries loaded on-demand based on feature usage
4. **Progressive Enhancement**: Feature detection with graceful fallbacks
5. **Event-Driven Communication**: Custom events for cross-component communication

### State Management

The application uses a sophisticated reactive state system in `js/utils/state.js`:

- **Proxy-based reactivity**: Automatic change detection
- **Path-based subscriptions**: Subscribe to specific state paths like `user.preferences.theme`
- **State persistence**: Automatic localStorage sync with configurable expiry
- **Middleware support**: Transform state changes before applying

Example usage:
```javascript
// Subscribe to state changes
window.StateManager.subscribe('user.preferences', (newValue, oldValue) => {
    // Handle theme changes
});

// Update state
window.StateManager.setState('user.preferences.theme', 'dark');
```

## Configuration

All configuration is centralized in `js/config.js` with feature flags:

- **Graphics Libraries**: Konva.js, PIXI.js, Three.js with CDN URLs
- **WebSocket/API Endpoints**: Environment-specific URLs  
- **Feature Flags**: Enable/disable major features like voice, drawing, themes
- **PWA Settings**: Service worker, notifications, offline mode
- **Performance Settings**: Virtual scrolling, image optimization, lazy loading

## Graphics System

The application supports multiple graphics libraries loaded dynamically:

1. **Konva.js** (`CONFIG.graphics.konva`): 2D canvas manipulation for drawing
2. **PIXI.js** (`CONFIG.graphics.pixi`): High-performance 2D rendering
3. **Three.js** (`CONFIG.graphics.three`): 3D graphics capabilities

Graphics are loaded on-demand through `js/libs/graphics-loader.js` when specific features are accessed.

## Real-Time Features

- **WebSocket Communication**: Configured in `CONFIG.websocket` for chat and presence
- **WebRTC Support**: Peer-to-peer voice/video calls via `js/components/voice.js`
- **Typing Indicators**: Real-time typing status in chat
- **Presence System**: User online/offline status tracking

## File Organization Conventions

- **Components**: Feature-specific classes in `js/components/`
- **Utilities**: Shared functionality in `js/utils/`
- **Assets**: Sprites and graphics in `assets/sprites/`
- **Styles**: Modular CSS in `css/` (components, animations, main styles)

## Common Development Patterns

1. **Component Structure**:
   ```javascript
   class FeatureManager {
       constructor() {
           this.initialize();
       }
       
       async initialize() {
           // Component initialization
       }
       
       // Private methods documented with @private
   }
   window.FeatureName = new FeatureManager();
   ```

2. **Error Handling**: Comprehensive try-catch blocks with user-friendly error messages
3. **Feature Detection**: Check `CONFIG.support` before using browser APIs
4. **Accessibility**: Screen reader support, keyboard navigation, high contrast options

## Progressive Web App Features

- **Service Worker**: Disabled by default (`CONFIG.pwa.enableServiceWorker: false`)
- **Web App Manifest**: Configured in `manifest.json` for native app-like experience
- **Offline Support**: IndexedDB storage for offline message viewing
- **Push Notifications**: Configurable notification system

## Important Notes

- **No Build Process**: Application runs directly in browser - no compilation needed
- **CDN Dependencies**: All external libraries loaded from CDN, not bundled
- **Manual Testing**: No automated test suite - verify features manually in browser
- **Security**: Content Security Policy enabled, XSS prevention, input validation
- **Performance**: Virtual scrolling, image optimization, lazy loading enabled by default