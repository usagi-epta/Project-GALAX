/**

- Main Application Controller
- Orchestrates application initialization and core functionality
  */

class Application {
constructor() {
this.initialized = false;
this.currentUser = null;
this.selectedAvatar = 1;

```
    this.bindEventHandlers();
    this.initialize();
}

/**
 * Initialize the application
 * @private
 */
async initialize() {
    try {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bootstrap());
        } else {
            await this.bootstrap();
        }
    } catch (error) {
        console.error('Application initialization failed:', error);
        this.handleInitializationError(error);
    }
}

/**
 * Bootstrap application components
 * @private
 */
async bootstrap() {
    console.log('Initializing GALAX Social Community Application...');
    
    // Initialize core systems
    await this.initializeCoreServices();
    
    // Setup PWA features
    this.setupPWAFeatures();
    
    // Initialize UI components
    this.initializeUIComponents();
    
    // Setup event listeners
    this.setupGlobalEventListeners();
    
    // Load saved user session if available
    this.restoreUserSession();
    
    // Initialize avatars
    this.initializeAvatarSystem();
    
    this.initialized = true;
    console.log('Application initialization complete');
    
    // Emit initialization complete event
    this.emitEvent('appInitialized', { timestamp: Date.now() });
}

/**
 * Initialize core application services
 * @private
 */
async initializeCoreServices() {
    // Initialize graphics system
    if (window.graphicsLoader) {
        await window.graphicsLoader.loadAll();
    }
    
    // Initialize OCR system
    if (window.OCRManager && CONFIG.features.ocr) {
        await window.OCRManager.initialize();
        console.log('OCR system initialized');
    }
    
    // Initialize state management
    if (window.stateManager) {
        this.setupStateSubscriptions();
    }
    
    // Initialize storage system
    if (window.storageManager) {
        console.log('Storage system initialized');
    }
    
    // Initialize network monitoring
    this.setupNetworkMonitoring();
}

/**
 * Setup PWA features
 * @private
 */
setupPWAFeatures() {
    // Register service worker (if enabled in config)
    if (CONFIG.pwa.enableServiceWorker && 'serviceWorker' in navigator) {
        this.registerServiceWorker();
    }
    
    // Request notification permissions
    if (CONFIG.pwa.enableNotifications && 'Notification' in window) {
        this.requestNotificationPermission();
    }
    
    // Setup PWA install prompt
    this.setupInstallPrompt();
}

/**
 * Initialize UI components
 * @private
 */
initializeUIComponents() {
    // Initialize avatar system
    if (window.avatarManager) {
        const avatarContainer = document.getElementById('pixelAvatars');
        if (avatarContainer) {
            window.avatarManager.initializeAvatars(avatarContainer);
        }
    }
    
    // Setup initial UI state
    this.updateUIForCurrentScreen();
}

/**
 * Bind event handlers to maintain context
 * @private
 */
bindEventHandlers() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.updateUserDisplay = this.updateUserDisplay.bind(this);
}

/**
 * Handle user login
 * @param {Event} event - Form submission event
 */
login(event) {
    event.preventDefault();
    
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    
    if (!userIdInput || !passwordInput) {
        console.error('Login form elements not found');
        return;
    }
    
    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!userId || !password) {
        this.showError('Please enter both username and password');
        return;
    }
    
    // Perform login validation (simplified for demo)
    if (this.validateCredentials(userId, password)) {
        this.performLogin(userId);
    } else {
        this.showError('Invalid credentials. Please try again.');
    }
}

/**
 * Validate user credentials
 * @private
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean} Validation result
 */
validateCredentials(userId, password) {
    // In production, this would validate against a secure backend
    const validCredentials = [
        { username: 'Ninomiya', password: 'Rui' },
        { username: 'Dash', password: 'Jeong' },
        { username: 'Bella', password: 'Kim' }
    ];
    
    return validCredentials.some(cred => 
        cred.username.toLowerCase() === userId.toLowerCase() && 
        cred.password === password
    );
}

/**
 * Perform login sequence
 * @private
 * @param {string} userId - User ID
 */
performLogin(userId) {
    this.currentUser = userId;
    
    // Update application state
    if (window.stateManager) {
        window.stateManager.setState('user', {
            id: userId,
            username: userId,
            avatar: this.selectedAvatar,
            isAuthenticated: true,
            profile: {
                name: userId,
                status: 'Online',
                joinDate: Date.now()
            }
        });
        
        window.stateManager.setState('ui.currentScreen', 'mainScreen');
    }
    
    // Show main screen
    this.showScreen('mainScreen');
    
    // Update user display
    this.updateUserDisplay();
    
    // Initialize post-login features
    this.initializePostLoginFeatures();
    
    // Save session
    this.saveUserSession();
    
    console.log(`User ${userId} logged in successfully`);
}

/**
 * Initialize features available after login
 * @private
 */
initializePostLoginFeatures() {
    // Initialize real-time features
    this.initializeRealtimeFeatures();
    
    // Setup presence updates
    this.startPresenceUpdates();
    
    // Load user preferences
    this.loadUserPreferences();
    
    // Initialize enhanced graphics features
    if (window.graphicsManager && window.graphicsManager.initialized) {
        this.initializeGraphicsFeatures();
    }
}

/**
 * Handle user logout
 */
logout() {
    // Clear user data
    this.currentUser = null;
    
    // Update application state
    if (window.stateManager) {
        window.stateManager.setState('user.isAuthenticated', false);
        window.stateManager.setState('ui.currentScreen', 'loginScreen');
    }
    
    // Show login screen
    this.showScreen('loginScreen');
    
    // Clear form data
    this.clearLoginForm();
    
    // Clear saved session
    this.clearUserSession();
    
    // Stop real-time features
    this.stopRealtimeFeatures();
    
    console.log('User logged out successfully');
}

/**
 * Update user display elements
 * @private
 */
updateUserDisplay() {
    if (!this.currentUser) return;
    
    const currentUserElement = document.getElementById('currentUser');
    const profileNameElement = document.getElementById('profileName');
    
    if (currentUserElement) {
        currentUserElement.textContent = this.currentUser;
    }
    
    if (profileNameElement) {
        profileNameElement.textContent = this.currentUser;
    }
    
    // Update avatar displays
    if (window.avatarManager) {
        window.avatarManager.updateUserAvatarDisplay(this.selectedAvatar);
    }
}

/**
 * Show specified screen
 * @private
 * @param {string} screenId - Screen identifier
 */
showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

/**
 * Clear login form
 * @private
 */
clearLoginForm() {
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    
    if (userIdInput) userIdInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

/**
 * Initialize avatar system
 * @private
 */
initializeAvatarSystem() {
    // Set default avatar selection
    if (window.avatarManager) {
        window.avatarManager.setSelectedAvatar(this.selectedAvatar);
    }
    
    // Listen for avatar selection changes
    document.addEventListener('avatarSelected', (event) => {
        this.selectedAvatar = event.detail.avatarId;
        this.updateUserDisplay();
    });
}

/**
 * Setup global event listeners
 * @private
 */
setupGlobalEventListeners() {
    // Handle online/offline events
    window.addEventListener('online', () => {
        console.log('Application back online');
        this.handleNetworkChange(true);
    });
    
    window.addEventListener('offline', () => {
        console.log('Application offline');
        this.handleNetworkChange(false);
    });
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        this.handleWindowResize();
    });
}

/**
 * Setup state management subscriptions
 * @private
 */
setupStateSubscriptions() {
    window.stateManager.subscribe('user', (userState) => {
        if (userState.isAuthenticated && userState.username !== this.currentUser) {
            this.currentUser = userState.username;
            this.updateUserDisplay();
        }
    });
    
    window.stateManager.subscribe('ui.currentScreen', (screen) => {
        this.updateUIForCurrentScreen(screen);
    });
}

/**
 * Handle network connectivity changes
 * @private
 * @param {boolean} isOnline - Network status
 */
handleNetworkChange(isOnline) {
    if (window.stateManager) {
        window.stateManager.setState('system.online', isOnline);
    }
    
    if (isOnline) {
        this.resumeOnlineFeatures();
    } else {
        this.handleOfflineMode();
    }
}

/**
 * Resume online features
 * @private
 */
resumeOnlineFeatures() {
    // Reconnect WebSocket if available
    // Sync pending messages
    // Resume real-time features
    console.log('Resuming online features');
}

/**
 * Handle offline mode
 * @private
 */
handleOfflineMode() {
    // Queue messages for later sending
    // Show offline indicator
    // Disable real-time features
    console.log('Handling offline mode');
}

/**
 * Initialize real-time features
 * @private
 */
initializeRealtimeFeatures() {
    // Initialize WebSocket connection
    // Setup message listeners
    // Enable presence indicators
    console.log('Real-time features initialized');
}

/**
 * Start presence updates
 * @private
 */
startPresenceUpdates() {
    if (this.presenceInterval) {
        clearInterval(this.presenceInterval);
    }
    
    this.presenceInterval = setInterval(() => {
        this.updatePresence();
    }, 30000); // Update every 30 seconds
}

/**
 * Update user presence
 * @private
 */
updatePresence() {
    // Update user's last seen timestamp
    // Send presence update to server
    console.log('Presence updated');
}

/**
 * Save user session to storage
 * @private
 */
saveUserSession() {
    if (window.storageManager) {
        const sessionData = {
            userId: this.currentUser,
            avatar: this.selectedAvatar,
            loginTime: Date.now()
        };
        
        window.storageManager.set('userSession', sessionData, {
            expiration: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }
}

/**
 * Restore user session from storage
 * @private
 */
async restoreUserSession() {
    if (window.storageManager) {
        const sessionData = await window.storageManager.get('userSession');
        
        if (sessionData && sessionData.userId) {
            this.currentUser = sessionData.userId;
            this.selectedAvatar = sessionData.avatar || 1;
            
            // Auto-login if session is valid
            if (this.isSessionValid(sessionData)) {
                this.performLogin(sessionData.userId);
            }
        }
    }
}

/**
 * Check if session is valid
 * @private
 * @param {Object} sessionData - Session data
 * @returns {boolean} Session validity
 */
isSessionValid(sessionData) {
    const sessionAge = Date.now() - sessionData.loginTime;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    return sessionAge < maxAge;
}

/**
 * Clear user session
 * @private
 */
clearUserSession() {
    if (window.storageManager) {
        window.storageManager.remove('userSession');
    }
}

/**
 * Show error message
 * @private
 * @param {string} message - Error message
 */
showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #ff4757;
        color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000;
        font-size: 14px; max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Request notification permission
 * @private
 */
async requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        console.log(`Notification permission: ${permission}`);
        
        if (window.stateManager) {
            window.stateManager.setState('system.permissions.notifications', permission);
        }
    } catch (error) {
        console.warn('Failed to request notification permission:', error);
    }
}

/**
 * Setup PWA install prompt
 * @private
 */
setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallButton();
    });
}

/**
 * Show PWA install button
 * @private
 */
showInstallButton() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !document.getElementById('installBtn')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'installBtn';
        installBtn.className = 'header-btn';
        installBtn.innerHTML = '📱';
        installBtn.title = 'Install App';
        installBtn.onclick = () => this.installPWA();
        headerActions.insertBefore(installBtn, headerActions.firstChild);
    }
}

/**
 * Install PWA
 * @private
 */
async installPWA() {
    if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const result = await this.deferredPrompt.userChoice;
        console.log('PWA install result:', result.outcome);
        this.deferredPrompt = null;
    }
}

/**
 * Handle initialization errors
 * @private
 * @param {Error} error - Initialization error
 */
handleInitializationError(error) {
    console.error('Application failed to initialize:', error);
    
    // Show fallback UI
    const fallbackMessage = document.createElement('div');
    fallbackMessage.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 20px; border-radius: 10px; text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 400px;
    `;
    fallbackMessage.innerHTML = `
        <h3>Application Error</h3>
        <p>The application failed to initialize properly. Please refresh the page and try again.</p>
        <button onclick="window.location.reload()" style="background: #4ecdc4; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            Reload Application
        </button>
    `;
    
    document.body.appendChild(fallbackMessage);
}

/**
 * Emit application event
 * @private
 * @param {string} eventName - Event name
 * @param {Object} data - Event data
 */
emitEvent(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
}

/**
 * Get application status
 * @returns {Object} Application status
 */
getStatus() {
    return {
        initialized: this.initialized,
        currentUser: this.currentUser,
        selectedAvatar: this.selectedAvatar,
        online: navigator.onLine
    };
}
```

}

// Initialize application
const app = new Application();

// Create global App namespace
window.App = {
login: app.login,
logout: app.logout,
getStatus: () => app.getStatus()
};

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { Application, app };
} else if (typeof window !== ‘undefined’) {
window.Application = Application;
window.app = app;
}
