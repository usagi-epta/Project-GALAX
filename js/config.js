// Application Configuration
const CONFIG = {
// App Information
app: {
name: ‘GALAX Social Community’,
version: ‘1.0.0’,
description: ‘Real-time social community platform with advanced collaboration features’
},

```
// API Configuration
api: {
    baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://api.galax.social' 
        : 'http://localhost:3000',
    timeout: 10000,
    retryAttempts: 3
},

// WebSocket Configuration
websocket: {
    url: process.env.NODE_ENV === 'production' 
        ? 'wss://ws.galax.social' 
        : 'ws://localhost:3001',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
},

// Graphics Libraries
graphics: {
    konva: {
        enabled: true,
        cdnUrl: 'https://unpkg.com/konva@9/konva.min.js'
    },
    pixi: {
        enabled: true,
        cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js'
    },
    three: {
        enabled: true,
        cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    }
},

// Avatar Configuration
avatars: {
    count: 4,
    colors: [
        { primary: '#ff6b47', secondary: '#ff4500', accent: '#ffff00' },
        { primary: '#ff8a80', secondary: '#ff5722', accent: '#ffffff' },
        { primary: '#d4c5a9', secondary: '#8d6e63', accent: '#000000' },
        { primary: '#ffd54f', secondary: '#ff9800', accent: '#000000' }
    ],
    pixelSize: 4,
    canvasSize: { width: 60, height: 80 }
},

// Theme Configuration
themes: {
    default: {
        '--primary': '#4ecdc4',
        '--primary-dark': '#44a08d',
        '--accent': '#ff6b47',
        '--background': '#f8f9fa',
        '--text': '#333'
    },
    dark: {
        '--primary': '#4ecdc4',
        '--primary-dark': '#44a08d',
        '--accent': '#ff6b47',
        '--background': '#1a1a1a',
        '--text': '#ffffff'
    },
    purple: {
        '--primary': '#9c27b0',
        '--primary-dark': '#673ab7',
        '--accent': '#e91e63',
        '--background': '#f3e5f5',
        '--text': '#333'
    }
},

// Chat Configuration
chat: {
    maxMessageLength: 1000,
    typingTimeout: 2000,
    messageRetryAttempts: 3,
    autoReconnect: true,
    presence: {
        updateInterval: 30000,
        offlineTimeout: 60000
    }
},

// File Upload Configuration
files: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    uploadEndpoint: '/api/files/upload'
},

// Drawing Configuration
drawing: {
    canvas: {
        width: 300,
        height: 200
    },
    tools: {
        defaultColor: '#4ecdc4',
        defaultBrushSize: 2,
        minBrushSize: 1,
        maxBrushSize: 10
    }
},

// Voice Configuration
voice: {
    maxRecordingTime: 30000, // 30 seconds
    sampleRate: 44100,
    channels: 1,
    format: 'webm'
},

// PWA Configuration
pwa: {
    enableServiceWorker: false, // Disabled for now due to issues
    enableNotifications: true,
    enableOfflineMode: true,
    cacheVersion: 'v1.0.0'
},

// Storage Configuration
storage: {
    keys: {
        user: 'galax-user',
        state: 'galax-state',
        preferences: 'galax-preferences',
        cache: 'galax-cache'
    },
    expiry: {
        user: 7 * 24 * 60 * 60 * 1000, // 7 days
        cache: 24 * 60 * 60 * 1000,    // 1 day
        preferences: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
},

// Animation Configuration
animations: {
    defaultDuration: 300,
    easing: 'ease-out',
    enableReducedMotion: true,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
},

// Notification Configuration
notifications: {
    permission: 'default',
    showDuration: 5000,
    position: 'top-right',
    sound: true,
    vibration: [200, 100, 200]
},

// Development Configuration
debug: {
    enabled: process.env.NODE_ENV !== 'production',
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    showPerformanceMetrics: false,
    enableTestData: true
},

// Security Configuration
security: {
    enableCSP: true,
    allowedOrigins: [
        'https://galax.social',
        'https://api.galax.social',
        'https://cdn.galax.social'
    ],
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000 // 7 days
},

// Feature Flags
features: {
    voiceRecording: true,
    videoCall: true,
    drawing: true,
    fileUpload: true,
    threeJS: true,
    konva: true,
    offlineMode: true,
    pushNotifications: true,
    darkMode: true,
    customThemes: true,
    groupChat: true,
    games: true,
    timeline: true
},

// Performance Configuration
performance: {
    enableVirtualScrolling: true,
    messageBufferSize: 100,
    imageOptimization: true,
    lazyLoading: true,
    prefetchImages: false
},

// Accessibility Configuration
accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    enableHighContrast: false,
    enableLargeText: false,
    announceMessages: true
}
```

};

// Environment-specific overrides
if (typeof window !== ‘undefined’) {
// Browser-specific configuration
CONFIG.browser = {
userAgent: navigator.userAgent,
platform: navigator.platform,
language: navigator.language,
cookieEnabled: navigator.cookieEnabled,
onLine: navigator.onLine
};

```
// Check for feature support
CONFIG.support = {
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'PushManager' in window,
    notifications: 'Notification' in window,
    webRTC: 'RTCPeerConnection' in window,
    webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
    indexedDB: 'indexedDB' in window,
    localStorage: 'localStorage' in window,
    webGL: (() => {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    })()
};
```

}

// Freeze configuration to prevent modifications
Object.freeze(CONFIG);

// Export for use in other modules
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = CONFIG;
} else if (typeof window !== ‘undefined’) {
window.CONFIG = CONFIG;
}
