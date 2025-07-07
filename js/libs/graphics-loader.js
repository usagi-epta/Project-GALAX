/**

- Graphics Libraries Loader
- Enterprise-grade dynamic loader for graphics libraries with comprehensive error handling
- Supports Konva.js, PIXI.js, Three.js, and OCR libraries (Tesseract.js, Scribe.js)
  */

class GraphicsLoader {
constructor() {
this.libraries = {
konva: { loaded: false, available: false, version: null },
pixi: { loaded: false, available: false, version: null },
three: { loaded: false, available: false, version: null },
tesseract: { loaded: false, available: false, version: null },
scribe: { loaded: false, available: false, version: null }
};

```
    this.loadingPromises = new Map();
    this.eventListeners = new Map();
    this.configuration = {
        retryAttempts: 3,
        retryDelay: 1000,
        timeout: 10000,
        enableFallbacks: true,
        logLevel: 'info'
    };
    
    this.initialize();
}

/**
 * Initialize the graphics loader system
 * @private
 */
initialize() {
    this.detectExistingLibraries();
    this.setupEventHandlers();
}

/**
 * Detect already loaded graphics libraries
 * @private
 */
detectExistingLibraries() {
    if (typeof window !== 'undefined') {
        if (window.Konva) {
            this.libraries.konva = { 
                loaded: true, 
                available: true, 
                version: window.Konva.version || 'unknown' 
            };
        }
        
        if (window.PIXI) {
            this.libraries.pixi = { 
                loaded: true, 
                available: true, 
                version: window.PIXI.VERSION || 'unknown' 
            };
        }
        
        if (window.THREE) {
            this.libraries.three = { 
                loaded: true, 
                available: true, 
                version: window.THREE.REVISION || 'unknown' 
            };
        }
        
        if (window.Tesseract) {
            this.libraries.tesseract = { 
                loaded: true, 
                available: true, 
                version: window.Tesseract.version || 'unknown' 
            };
        }
        
        if (window.Scribe) {
            this.libraries.scribe = { 
                loaded: true, 
                available: true, 
                version: window.Scribe.version || 'unknown' 
            };
        }
    }
}

/**
 * Setup event handlers for system monitoring
 * @private
 */
setupEventHandlers() {
    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
}

/**
 * Handle network connectivity changes
 * @private
 * @param {boolean} isOnline - Network connectivity status
 */
handleNetworkChange(isOnline) {
    this.log('info', `Network connectivity changed: ${isOnline ? 'online' : 'offline'}`);
    this.emit('networkChange', { online: isOnline });
}

/**
 * Load all graphics libraries concurrently
 * @returns {Promise<Object>} Promise that resolves with library status
 */
async loadAll() {
    const startTime = performance.now();
    this.log('info', 'Starting graphics libraries loading process');

    const loadPromises = [
        this.loadKonva().catch(error => ({ error, library: 'konva' })),
        this.loadPixi().catch(error => ({ error, library: 'pixi' })),
        this.loadThree().catch(error => ({ error, library: 'three' })),
        this.loadTesseract().catch(error => ({ error, library: 'tesseract' })),
        this.loadScribe().catch(error => ({ error, library: 'scribe' }))
    ];

    try {
        const results = await Promise.allSettled(loadPromises);
        const loadTime = performance.now() - startTime;
        
        this.processLoadResults(results);
        this.log('info', `Graphics libraries loading completed in ${loadTime.toFixed(2)}ms`);
        this.emit('loadingComplete', { libraries: this.libraries, loadTime });
        
        return this.getStatus();
    } catch (error) {
        this.log('error', 'Critical error during graphics loading:', error);
        this.emit('loadingError', { error });
        return this.getStatus();
    }
}

/**
 * Process loading results and update library status
 * @private
 * @param {Array} results - Promise settlement results
 */
processLoadResults(results) {
    results.forEach((result, index) => {
        const libraryNames = ['konva', 'pixi', 'three', 'tesseract', 'scribe'];
        const libraryName = libraryNames[index];
        
        if (result.status === 'fulfilled' && result.value !== false) {
            this.log('info', `${libraryName} loaded successfully`);
        } else {
            this.log('warn', `${libraryName} failed to load:`, result.reason || result.value?.error);
        }
    });
}

/**
 * Load Konva.js library with enhanced error handling
 * @returns {Promise<boolean>} Promise that resolves with load status
 */
async loadKonva() {
    if (this.libraries.konva.loaded) {
        return true;
    }

    if (this.loadingPromises.has('konva')) {
        return this.loadingPromises.get('konva');
    }

    const loadPromise = this.loadLibrary({
        name: 'konva',
        url: 'https://unpkg.com/konva@9/konva.min.js',
        globalCheck: () => window.Konva,
        versionCheck: () => window.Konva?.version
    });

    this.loadingPromises.set('konva', loadPromise);
    return loadPromise;
}

/**
 * Load PIXI.js library with enhanced error handling
 * @returns {Promise<boolean>} Promise that resolves with load status
 */
async loadPixi() {
    if (this.libraries.pixi.loaded) {
        return true;
    }

    if (this.loadingPromises.has('pixi')) {
        return this.loadingPromises.get('pixi');
    }

    const loadPromise = this.loadLibrary({
        name: 'pixi',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js',
        globalCheck: () => window.PIXI,
        versionCheck: () => window.PIXI?.VERSION
    });

    this.loadingPromises.set('pixi', loadPromise);
    return loadPromise;
}

/**
 * Load Three.js library with enhanced error handling
 * @returns {Promise<boolean>} Promise that resolves with load status
 */
async loadThree() {
    if (this.libraries.three.loaded) {
        return true;
    }

    if (this.loadingPromises.has('three')) {
        return this.loadingPromises.get('three');
    }

    const loadPromise = this.loadLibrary({
        name: 'three',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        globalCheck: () => window.THREE,
        versionCheck: () => window.THREE?.REVISION
    });

    this.loadingPromises.set('three', loadPromise);
    return loadPromise;
}

/**
 * Load Tesseract.js library with enhanced error handling
 * @returns {Promise<boolean>} Promise that resolves with load status
 */
async loadTesseract() {
    if (!CONFIG.features.ocr || !CONFIG.ocr.tesseract.enabled) {
        this.log('info', 'Tesseract.js loading skipped (feature disabled)');
        return false;
    }

    if (this.libraries.tesseract.loaded) {
        return true;
    }

    if (this.loadingPromises.has('tesseract')) {
        return this.loadingPromises.get('tesseract');
    }

    const loadPromise = this.loadLibrary({
        name: 'tesseract',
        url: CONFIG.ocr.tesseract.localPath,
        globalCheck: () => window.Tesseract,
        versionCheck: () => window.Tesseract?.version
    });

    this.loadingPromises.set('tesseract', loadPromise);
    return loadPromise;
}

/**
 * Load Scribe.js library with enhanced error handling
 * @returns {Promise<boolean>} Promise that resolves with load status
 */
async loadScribe() {
    if (!CONFIG.features.pdfOcr || !CONFIG.ocr.scribe.enabled) {
        this.log('info', 'Scribe.js loading skipped (feature disabled)');
        return false;
    }

    if (this.libraries.scribe.loaded) {
        return true;
    }

    if (this.loadingPromises.has('scribe')) {
        return this.loadingPromises.get('scribe');
    }

    const loadPromise = this.loadLibrary({
        name: 'scribe',
        url: CONFIG.ocr.scribe.localPath,
        globalCheck: () => window.Scribe,
        versionCheck: () => window.Scribe?.version
    });

    this.loadingPromises.set('scribe', loadPromise);
    return loadPromise;
}

/**
 * Generic library loading method with comprehensive error handling
 * @private
 * @param {Object} config - Library configuration
 * @returns {Promise<boolean>} Promise that resolves with load status
 */
async loadLibrary(config) {
    const { name, url, globalCheck, versionCheck } = config;
    
    for (let attempt = 1; attempt <= this.configuration.retryAttempts; attempt++) {
        try {
            this.log('info', `Loading ${name} (attempt ${attempt}/${this.configuration.retryAttempts})`);
            
            await this.createScriptElement(url);
            
            // Verify library loaded correctly
            if (globalCheck()) {
                const version = versionCheck();
                this.libraries[name] = {
                    loaded: true,
                    available: true,
                    version: version || 'unknown'
                };
                
                this.log('info', `${name} v${version} loaded successfully`);
                this.emit('libraryLoaded', { name, version });
                return true;
            } else {
                throw new Error(`${name} global object not found after script load`);
            }
            
        } catch (error) {
            this.log('warn', `${name} load attempt ${attempt} failed:`, error.message);
            
            if (attempt < this.configuration.retryAttempts) {
                await this.delay(this.configuration.retryDelay * attempt);
            } else {
                this.libraries[name] = {
                    loaded: false,
                    available: false,
                    version: null,
                    error: error.message
                };
                
                this.emit('libraryError', { name, error: error.message });
                return false;
            }
        }
    }
    return false;
}

/**
 * Create and load a script element with timeout handling
 * @private
 * @param {string} url - Script URL
 * @returns {Promise} Promise that resolves when script is loaded
 */
createScriptElement(url) {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.crossOrigin = 'anonymous';

        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error(`Script load timeout: ${url}`));
        }, this.configuration.timeout);

        const cleanup = () => {
            clearTimeout(timeout);
            script.removeEventListener('load', onLoad);
            script.removeEventListener('error', onError);
        };

        const onLoad = () => {
            cleanup();
            resolve();
        };

        const onError = () => {
            cleanup();
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            reject(new Error(`Script load error: ${url}`));
        };

        script.addEventListener('load', onLoad);
        script.addEventListener('error', onError);

        document.head.appendChild(script);
    });
}

/**
 * Utility delay function
 * @private
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get comprehensive status of all libraries
 * @returns {Object} Complete library status information
 */
getStatus() {
    return {
        libraries: { ...this.libraries },
        capabilities: this.getCapabilities(),
        system: this.getSystemInfo()
    };
}

/**
 * Get available graphics capabilities
 * @returns {Object} Available graphics capabilities
 */
getCapabilities() {
    return {
        canvas2D: this.hasCanvas2DSupport(),
        webGL: this.hasWebGLSupport(),
        webGL2: this.hasWebGL2Support(),
        konva: this.libraries.konva.available,
        pixi: this.libraries.pixi.available,
        threeJS: this.libraries.three.available,
        tesseract: this.libraries.tesseract.available,
        scribe: this.libraries.scribe.available,
        offscreenCanvas: this.hasOffscreenCanvasSupport(),
        imageData: this.hasImageDataSupport()
    };
}

/**
 * Get system information relevant to graphics
 * @returns {Object} System information
 */
getSystemInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        memory: navigator.deviceMemory || 'unknown',
        pixelRatio: window.devicePixelRatio || 1
    };
}

/**
 * Check for Canvas 2D support
 * @private
 * @returns {boolean} True if Canvas 2D is supported
 */
hasCanvas2DSupport() {
    try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    } catch (e) {
        return false;
    }
}

/**
 * Check for WebGL support
 * @private
 * @returns {boolean} True if WebGL is supported
 */
hasWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
    } catch (e) {
        return false;
    }
}

/**
 * Check for WebGL2 support
 * @private
 * @returns {boolean} True if WebGL2 is supported
 */
hasWebGL2Support() {
    try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
    } catch (e) {
        return false;
    }
}

/**
 * Check for OffscreenCanvas support
 * @private
 * @returns {boolean} True if OffscreenCanvas is supported
 */
hasOffscreenCanvasSupport() {
    return typeof OffscreenCanvas !== 'undefined';
}

/**
 * Check for ImageData support
 * @private
 * @returns {boolean} True if ImageData is supported
 */
hasImageDataSupport() {
    return typeof ImageData !== 'undefined';
}

/**
 * Event system for graphics loader
 * @param {string} event - Event name
 * @param {Function} callback - Event callback
 */
on(event, callback) {
    if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
}

/**
 * Remove event listener
 * @param {string} event - Event name
 * @param {Function} callback - Event callback to remove
 */
off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
        listeners.splice(index, 1);
    }
}

/**
 * Emit event to all listeners
 * @private
 * @param {string} event - Event name
 * @param {*} data - Event data
 */
emit(event, data) {
    if (!this.eventListeners.has(event)) return;
    const listeners = this.eventListeners.get(event);
    listeners.forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            this.log('error', `Event listener error for ${event}:`, error);
        }
    });
}

/**
 * Logging utility with level control
 * @private
 * @param {string} level - Log level
 * @param {...*} args - Log arguments
 */
log(level, ...args) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.configuration.logLevel] || 1;
    const messageLevel = levels[level] || 1;
    
    if (messageLevel >= configLevel) {
        const timestamp = new Date().toISOString();
        const prefix = `[GraphicsLoader:${level.toUpperCase()}][${timestamp}]`;
        
        switch (level) {
            case 'error':
                console.error(prefix, ...args);
                break;
            case 'warn':
                console.warn(prefix, ...args);
                break;
            case 'debug':
                console.debug(prefix, ...args);
                break;
            default:
                console.log(prefix, ...args);
        }
    }
}

/**
 * Get specific library instance
 * @param {string} libraryName - Name of the library
 * @returns {Object|null} Library instance or null
 */
getLibrary(libraryName) {
    if (!this.libraries[libraryName]?.available) {
        return null;
    }

    switch (libraryName) {
        case 'konva':
            return window.Konva;
        case 'pixi':
            return window.PIXI;
        case 'three':
            return window.THREE;
        case 'tesseract':
            return window.Tesseract;
        case 'scribe':
            return window.Scribe;
        default:
            return null;
    }
}

/**
 * Check if specific library is available
 * @param {string} libraryName - Name of the library
 * @returns {boolean} True if library is available
 */
isAvailable(libraryName) {
    return this.libraries[libraryName]?.available || false;
}

/**
 * Dispose of resources and cleanup
 */
dispose() {
    this.loadingPromises.clear();
    this.eventListeners.clear();
    this.log('info', 'GraphicsLoader disposed');
}
```

}

// Initialize global instance
const graphicsLoader = new GraphicsLoader();

// Auto-initialize when DOM is ready
if (typeof document !== ‘undefined’) {
if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, () => {
graphicsLoader.loadAll();
});
} else {
// DOM is already ready, load immediately
setTimeout(() => graphicsLoader.loadAll(), 0);
}
}

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { GraphicsLoader, graphicsLoader };
} else if (typeof window !== ‘undefined’) {
window.GraphicsLoader = GraphicsLoader;
window.graphicsLoader = graphicsLoader;
}
