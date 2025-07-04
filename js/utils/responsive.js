/**
 * Responsive Layout Manager
 * Handles device detection and layout optimization
 */

class ResponsiveManager {
    constructor() {
        this.deviceType = null;
        this.screenSize = null;
        this.orientation = null;
        this.touchDevice = false;
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        
        this.initialize();
    }

    /**
     * Initialize responsive management
     */
    initialize() {
        this.detectDevice();
        this.setLayout();
        this.bindEvents();
        
        console.log(`Device detected: ${this.deviceType} (${this.screenSize})`);
    }

    /**
     * Detect device type and capabilities
     */
    detectDevice() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Touch device detection
        this.touchDevice = (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );

        // Screen size categories
        if (width < this.breakpoints.mobile) {
            this.screenSize = 'mobile';
        } else if (width < this.breakpoints.tablet) {
            this.screenSize = 'tablet';
        } else if (width < this.breakpoints.desktop) {
            this.screenSize = 'desktop';
        } else {
            this.screenSize = 'desktop-large';
        }

        // Device type detection
        if (this.isMobileDevice(userAgent) || (this.touchDevice && width < this.breakpoints.tablet)) {
            this.deviceType = 'mobile';
        } else if (this.isTabletDevice(userAgent) || (this.touchDevice && width < this.breakpoints.desktop)) {
            this.deviceType = 'tablet';
        } else {
            this.deviceType = 'desktop';
        }

        // Orientation
        this.orientation = width > height ? 'landscape' : 'portrait';

        // Add device classes to body
        document.body.classList.add(`device-${this.deviceType}`);
        document.body.classList.add(`screen-${this.screenSize}`);
        document.body.classList.add(`orientation-${this.orientation}`);
        
        if (this.touchDevice) {
            document.body.classList.add('touch-device');
        }
    }

    /**
     * Check if device is mobile
     */
    isMobileDevice(userAgent) {
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }

    /**
     * Check if device is tablet
     */
    isTabletDevice(userAgent) {
        return /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    }

    /**
     * Set appropriate layout based on device
     */
    setLayout() {
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) return;

        // Remove existing layout classes
        appContainer.classList.remove('mobile-layout', 'tablet-layout', 'desktop-layout');
        
        // Apply appropriate layout
        switch (this.deviceType) {
            case 'mobile':
                this.setMobileLayout();
                break;
            case 'tablet':
                this.setTabletLayout();
                break;
            case 'desktop':
                this.setDesktopLayout();
                break;
        }
    }

    /**
     * Configure mobile layout
     */
    setMobileLayout() {
        const appContainer = document.querySelector('.app-container');
        appContainer.classList.add('mobile-layout');
        
        // Mobile-specific optimizations
        appContainer.style.width = '100%';
        appContainer.style.height = '100vh';
        appContainer.style.borderRadius = '0';
        appContainer.style.maxWidth = '100%';
        appContainer.style.maxHeight = '100%';
        
        // Optimize for mobile interaction
        document.body.style.padding = '0';
        document.body.style.margin = '0';
    }

    /**
     * Configure tablet layout
     */
    setTabletLayout() {
        const appContainer = document.querySelector('.app-container');
        appContainer.classList.add('tablet-layout');
        
        // Tablet-specific optimizations
        appContainer.style.width = '90%';
        appContainer.style.height = '90vh';
        appContainer.style.maxWidth = '800px';
        appContainer.style.maxHeight = '1000px';
        appContainer.style.borderRadius = '15px';
    }

    /**
     * Configure desktop layout
     */
    setDesktopLayout() {
        const appContainer = document.querySelector('.app-container');
        appContainer.classList.add('desktop-layout');
        
        // Desktop-specific optimizations
        appContainer.style.width = '1200px';
        appContainer.style.height = '800px';
        appContainer.style.maxWidth = '90vw';
        appContainer.style.maxHeight = '90vh';
        appContainer.style.borderRadius = '20px';
        
        // Enable desktop-specific features
        this.enableDesktopFeatures();
    }

    /**
     * Enable desktop-specific features
     */
    enableDesktopFeatures() {
        // Add hover effects
        document.body.classList.add('desktop-hover');
        
        // Enable keyboard shortcuts
        this.enableKeyboardShortcuts();
        
        // Optimize for mouse interaction
        document.body.classList.add('mouse-interaction');
    }

    /**
     * Enable keyboard shortcuts for desktop
     */
    enableKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + number keys for tab switching
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                this.switchToTab(tabIndex);
            }
            
            // Escape key to close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    /**
     * Switch to tab by index
     */
    switchToTab(index) {
        const tabs = ['chats', 'timeline', 'community', 'news', 'groups', 'games', 'profile'];
        if (tabs[index] && window.Navigation) {
            const tabButtons = document.querySelectorAll('.nav-item');
            if (tabButtons[index]) {
                tabButtons[index].click();
            }
        }
    }

    /**
     * Close open modals
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal[style*="display: block"], .modal.active');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
            modal.classList.remove('active');
        });
        
        // Close sprite animation if open
        const spriteContainer = document.getElementById('sprite-animation-container');
        if (spriteContainer) {
            spriteContainer.remove();
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Resize handler with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Orientation change handler
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 500);
        });

        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const oldDeviceType = this.deviceType;
        const oldScreenSize = this.screenSize;
        
        this.detectDevice();
        
        // Re-apply layout if device type changed
        if (oldDeviceType !== this.deviceType || oldScreenSize !== this.screenSize) {
            this.setLayout();
            this.triggerLayoutChange();
        }
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        const oldOrientation = this.orientation;
        this.detectDevice();
        
        if (oldOrientation !== this.orientation) {
            this.triggerOrientationChange();
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // App hidden - pause non-essential processes
            this.pauseNonEssentialProcesses();
        } else {
            // App visible - resume processes
            this.resumeProcesses();
        }
    }

    /**
     * Pause non-essential processes
     */
    pauseNonEssentialProcesses() {
        // Pause animations
        document.body.classList.add('reduced-motion');
        
        // Reduce update frequency
        if (window.Chat) {
            window.Chat.setUpdateFrequency?.(5000); // 5 seconds
        }
    }

    /**
     * Resume processes
     */
    resumeProcesses() {
        // Resume animations
        document.body.classList.remove('reduced-motion');
        
        // Normal update frequency
        if (window.Chat) {
            window.Chat.setUpdateFrequency?.(1000); // 1 second
        }
    }

    /**
     * Trigger layout change event
     */
    triggerLayoutChange() {
        const event = new CustomEvent('layoutChange', {
            detail: {
                deviceType: this.deviceType,
                screenSize: this.screenSize,
                orientation: this.orientation
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Trigger orientation change event
     */
    triggerOrientationChange() {
        const event = new CustomEvent('orientationChange', {
            detail: {
                orientation: this.orientation,
                deviceType: this.deviceType
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get current device info
     */
    getDeviceInfo() {
        return {
            deviceType: this.deviceType,
            screenSize: this.screenSize,
            orientation: this.orientation,
            touchDevice: this.touchDevice,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }

    /**
     * Check if current device matches criteria
     */
    isDevice(type) {
        return this.deviceType === type;
    }

    /**
     * Check if screen size matches criteria
     */
    isScreenSize(size) {
        return this.screenSize === size;
    }

    /**
     * Check if device supports touch
     */
    isTouchDevice() {
        return this.touchDevice;
    }
}

// Initialize responsive manager
const responsive = new ResponsiveManager();

// Export for global access
window.ResponsiveManager = responsive;
window.ResponsiveUtils = {
    isDesktop: () => responsive.isDevice('desktop'),
    isMobile: () => responsive.isDevice('mobile'),
    isTablet: () => responsive.isDevice('tablet'),
    isTouchDevice: () => responsive.isTouchDevice(),
    getDeviceInfo: () => responsive.getDeviceInfo()
};