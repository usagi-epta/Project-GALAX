/**

- Navigation Management Component
- Handles all navigation functionality including tab switching and screen management
  */

class NavigationManager {
constructor() {
this.currentTab = ‘chats’;
this.currentBottomTab = ‘chats’;
this.navigationHistory = [];
this.maxHistorySize = 10;

```
    this.bindEventHandlers();
    this.initializeNavigation();
}

/**
 * Bind event handlers to maintain context
 * @private
 */
bindEventHandlers() {
    this.switchTab = this.switchTab.bind(this);
    this.switchBottomTab = this.switchBottomTab.bind(this);
    this.goBack = this.goBack.bind(this);
}

/**
 * Initialize navigation system
 * @private
 */
initializeNavigation() {
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
    
    // Set up swipe navigation for mobile
    this.setupSwipeNavigation();
    
    // Initialize navigation state
    this.updateNavigationState();
}

/**
 * Switch main content tabs
 * @param {string} tabName - Tab identifier
 * @param {HTMLElement} [element] - Tab element that triggered the switch
 */
switchTab(tabName, element) {
    // Validate tab name
    const validTabs = ['chats', 'timeline', 'community'];
    if (!validTabs.includes(tabName)) {
        console.warn(`Invalid tab name: ${tabName}`);
        return;
    }

    // Update navigation history
    this.addToHistory('tab', this.currentTab, tabName);
    
    // Update current tab
    this.currentTab = tabName;
    
    // Update tab buttons visual state
    this.updateTabButtons(tabName);
    
    // Show/hide content based on tab
    this.updateTabContent(tabName);
    
    // Update state manager
    if (window.stateManager) {
        window.stateManager.setState('ui.activeTab', tabName);
    }
    
    // Emit navigation event
    this.emitNavigationEvent('tabChanged', { from: this.currentTab, to: tabName });
    
    // Handle tab-specific initialization
    this.handleTabSpecificActions(tabName);
}

/**
 * Switch bottom navigation tabs
 * @param {string} tabName - Tab identifier
 * @param {HTMLElement} element - Tab element that triggered the switch
 */
switchBottomTab(tabName, element) {
    // Validate tab name
    const validBottomTabs = ['chats', 'news', 'groups', 'games', 'profile'];
    if (!validBottomTabs.includes(tabName)) {
        console.warn(`Invalid bottom tab name: ${tabName}`);
        return;
    }

    // Update navigation history
    this.addToHistory('bottomTab', this.currentBottomTab, tabName);
    
    // Update current bottom tab
    this.currentBottomTab = tabName;
    
    // Update bottom nav visual state
    this.updateBottomNavButtons(element);
    
    // Show/hide content based on bottom tab
    this.updateBottomTabContent(tabName);
    
    // Update state manager
    if (window.stateManager) {
        window.stateManager.setState('ui.activeBottomTab', tabName);
    }
    
    // Emit navigation event
    this.emitNavigationEvent('bottomTabChanged', { from: this.currentBottomTab, to: tabName });
    
    // Handle bottom tab specific actions
    this.handleBottomTabSpecificActions(tabName);
}

/**
 * Update tab buttons visual state
 * @private
 * @param {string} activeTab - Active tab name
 */
updateTabButtons(activeTab) {
    // Update main tab buttons
    document.querySelectorAll('.nav-tab').forEach(button => {
        button.classList.remove('active');
        
        // Check if this button corresponds to the active tab
        const buttonText = button.textContent.toLowerCase();
        if (buttonText === activeTab || 
            (buttonText === 'chats' && activeTab === 'chats') ||
            (buttonText === 'timeline' && activeTab === 'timeline') ||
            (buttonText === 'community' && activeTab === 'community')) {
            button.classList.add('active');
        }
    });
}

/**
 * Update tab content visibility
 * @private
 * @param {string} activeTab - Active tab name
 */
updateTabContent(activeTab) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Show active tab content
    const contentId = `${activeTab}Content`;
    const activeContent = document.getElementById(contentId);
    if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
        
        // Add entrance animation
        activeContent.classList.add('tab-enter');
        setTimeout(() => {
            activeContent.classList.remove('tab-enter');
        }, 300);
    }
}

/**
 * Update bottom navigation buttons visual state
 * @private
 * @param {HTMLElement} activeElement - Active nav element
 */
updateBottomNavButtons(activeElement) {
    // Remove active class from all bottom nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected item
    if (activeElement) {
        activeElement.classList.add('active');
    }
}

/**
 * Update bottom tab content visibility
 * @private
 * @param {string} activeTab - Active bottom tab name
 */
updateBottomTabContent(activeTab) {
    // Hide all content sections
    const contentSections = [
        'chatsContent', 'newsContent', 'groupsContent', 
        'gamesContent', 'profileContent'
    ];
    
    contentSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
            section.classList.remove('active');
        }
    });
    
    // Show active content
    const contentId = `${activeTab}Content`;
    const activeContent = document.getElementById(contentId);
    if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
        
        // Add entrance animation
        activeContent.classList.add('tab-enter');
        setTimeout(() => {
            activeContent.classList.remove('tab-enter');
        }, 300);
    }
}

/**
 * Handle tab-specific initialization actions
 * @private
 * @param {string} tabName - Tab name
 */
handleTabSpecificActions(tabName) {
    switch (tabName) {
        case 'chats':
            this.initializeChatTab();
            break;
        case 'timeline':
            this.initializeTimelineTab();
            break;
        case 'community':
            this.initializeCommunityTab();
            break;
    }
}

/**
 * Handle bottom tab specific initialization actions
 * @private
 * @param {string} tabName - Bottom tab name
 */
handleBottomTabSpecificActions(tabName) {
    switch (tabName) {
        case 'chats':
            this.switchTab('chats');
            break;
        case 'news':
            this.loadNewsContent();
            break;
        case 'groups':
            this.loadGroupsContent();
            break;
        case 'games':
            this.loadGamesContent();
            break;
        case 'profile':
            this.loadProfileContent();
            break;
    }
}

/**
 * Initialize chat tab
 * @private
 */
initializeChatTab() {
    // Refresh chat list, check for new messages, etc.
    console.log('Chat tab initialized');
}

/**
 * Initialize timeline tab
 * @private
 */
initializeTimelineTab() {
    // Load timeline posts, initialize infinite scroll, etc.
    console.log('Timeline tab initialized');
    
    // Add timeline enhancements if graphics libraries are available
    if (window.graphicsManager && window.graphicsManager.availableLibraries.konva) {
        this.addTimelineEnhancements();
    }
}

/**
 * Initialize community tab
 * @private
 */
initializeCommunityTab() {
    // Load community content, initialize features, etc.
    console.log('Community tab initialized');
    
    // Add 3D elements if Three.js is available
    if (window.graphicsManager && window.graphicsManager.availableLibraries.threeJS) {
        this.add3DElements();
    }
}

/**
 * Load news content
 * @private
 */
loadNewsContent() {
    // Fetch and display latest news
    console.log('Loading news content');
}

/**
 * Load groups content
 * @private
 */
loadGroupsContent() {
    // Load user groups and recommendations
    console.log('Loading groups content');
}

/**
 * Load games content
 * @private
 */
loadGamesContent() {
    // Load available games and user progress
    console.log('Loading games content');
}

/**
 * Load profile content
 * @private
 */
loadProfileContent() {
    // Load user profile and settings
    console.log('Loading profile content');
}

/**
 * Add timeline enhancements with graphics libraries
 * @private
 */
addTimelineEnhancements() {
    const timelineContent = document.getElementById('timelineContent');
    if (timelineContent && window.graphicsManager) {
        // Create interactive timeline visualization
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'interactive-timeline-container';
        timelineContainer.style.height = '150px';
        timelineContainer.style.marginBottom = '20px';
        
        timelineContent.insertBefore(timelineContainer, timelineContent.firstChild);
        
        const context = window.graphicsManager.createContext({
            library: 'konva',
            container: timelineContainer,
            width: timelineContainer.offsetWidth,
            height: 150,
            interactive: true
        });
        
        if (context) {
            this.createInteractiveTimeline(context);
        }
    }
}

/**
 * Create interactive timeline with Konva
 * @private
 * @param {Object} context - Graphics context
 */
createInteractiveTimeline(context) {
    const timelineData = [
        { x: 80, y: 75, label: 'Project Start', color: '#ff6b47' },
        { x: 160, y: 60, label: 'Alpha Release', color: '#4ecdc4' },
        { x: 240, y: 90, label: 'Beta Testing', color: '#ffd54f' },
        { x: 320, y: 75, label: 'Launch', color: '#ff8a80' }
    ];
    
    // Draw connecting line
    context.drawRect(50, 73, 300, 4, { fill: '#ddd' });
    
    // Draw timeline nodes
    timelineData.forEach((data, index) => {
        const circle = context.drawCircle(data.x, data.y, 15, {
            fill: data.color,
            stroke: 'white',
            strokeWidth: 3
        });
        
        const text = context.drawText(data.label, data.x - 30, data.y - 40, {
            fontSize: 12,
            fill: '#333'
        });
    });
}

/**
 * Add 3D elements to community tab
 * @private
 */
add3DElements() {
    const communityContent = document.getElementById('communityContent');
    if (communityContent && window.graphicsManager) {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'three-scene-container';
        particleContainer.style.width = '100%';
        particleContainer.style.height = '150px';
        particleContainer.style.position = 'relative';
        particleContainer.style.marginBottom = '20px';
        
        const title = document.createElement('h2');
        title.textContent = 'Community Hub';
        title.style.position = 'absolute';
        title.style.top = '50%';
        title.style.left = '50%';
        title.style.transform = 'translate(-50%, -50%)';
        title.style.zIndex = '2';
        title.style.color = '#4ecdc4';
        title.style.fontWeight = 'bold';
        title.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        
        particleContainer.appendChild(title);
        communityContent.insertBefore(particleContainer, communityContent.firstChild);
        
        const context = window.graphicsManager.createContext({
            library: 'three',
            container: particleContainer,
            width: particleContainer.offsetWidth,
            height: 150,
            is3D: true
        });
        
        if (context) {
            this.createFloatingParticles(context);
        }
    }
}

/**
 * Create floating particles effect
 * @private
 * @param {Object} context - Three.js context
 */
createFloatingParticles(context) {
    // Add ambient lighting
    context.addLight('ambient', { color: 0x404040, intensity: 0.5 });
    context.addLight('directional', { color: 0xffffff, intensity: 0.8 });
    
    // Create floating spheres
    for (let i = 0; i < 20; i++) {
        const sphere = context.drawSphere(0.1, 16, 12, {
            color: 0x4ecdc4,
            wireframe: false
        });
        
        // Random positioning
        sphere.position.x = (Math.random() - 0.5) * 10;
        sphere.position.y = (Math.random() - 0.5) * 5;
        sphere.position.z = (Math.random() - 0.5) * 10;
        
        // Store initial position for animation
        sphere.userData = {
            initialY: sphere.position.y,
            speed: Math.random() * 0.02 + 0.01
        };
    }
    
    // Set camera position
    context.camera.position.z = 5;
    
    // Start animation loop
    context.animate(() => {
        context.scene.children.forEach(child => {
            if (child.userData && child.userData.speed) {
                child.position.y = child.userData.initialY + 
                    Math.sin(Date.now() * child.userData.speed) * 0.5;
                child.rotation.x += 0.01;
                child.rotation.y += 0.01;
            }
        });
    });
}

/**
 * Setup keyboard navigation
 * @private
 */
setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        // Only handle navigation keys when not in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'ArrowLeft':
                this.navigateLeft();
                event.preventDefault();
                break;
            case 'ArrowRight':
                this.navigateRight();
                event.preventDefault();
                break;
            case 'Escape':
                this.goBack();
                event.preventDefault();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                const tabIndex = parseInt(event.key) - 1;
                this.navigateToTabByIndex(tabIndex);
                event.preventDefault();
                break;
        }
    });
}

/**
 * Setup swipe navigation for mobile devices
 * @private
 */
setupSwipeNavigation() {
    let startX = 0;
    let startY = 0;
    let threshold = 50;
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Only process horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                this.navigateLeft();
            } else {
                this.navigateRight();
            }
        }
    });
}

/**
 * Navigate to previous tab
 * @private
 */
navigateLeft() {
    const tabs = ['chats', 'timeline', 'community'];
    const currentIndex = tabs.indexOf(this.currentTab);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    this.switchTab(tabs[previousIndex]);
}

/**
 * Navigate to next tab
 * @private
 */
navigateRight() {
    const tabs = ['chats', 'timeline', 'community'];
    const currentIndex = tabs.indexOf(this.currentTab);
    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    this.switchTab(tabs[nextIndex]);
}

/**
 * Navigate to tab by index
 * @private
 * @param {number} index - Tab index
 */
navigateToTabByIndex(index) {
    const bottomTabs = ['chats', 'news', 'groups', 'games', 'profile'];
    if (index >= 0 && index < bottomTabs.length) {
        const buttons = document.querySelectorAll('.nav-item');
        this.switchBottomTab(bottomTabs[index], buttons[index]);
    }
}

/**
 * Go back in navigation history
 */
goBack() {
    if (this.navigationHistory.length > 0) {
        const lastNavigation = this.navigationHistory.pop();
        
        if (lastNavigation.type === 'tab') {
            this.switchTab(lastNavigation.from);
        } else if (lastNavigation.type === 'bottomTab') {
            const buttons = document.querySelectorAll('.nav-item');
            const buttonIndex = ['chats', 'news', 'groups', 'games', 'profile'].indexOf(lastNavigation.from);
            this.switchBottomTab(lastNavigation.from, buttons[buttonIndex]);
        }
    }
}

/**
 * Add navigation action to history
 * @private
 * @param {string} type - Navigation type
 * @param {string} from - Previous state
 * @param {string} to - New state
 */
addToHistory(type, from, to) {
    if (from !== to) {
        this.navigationHistory.push({
            type,
            from,
            to,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.navigationHistory.length > this.maxHistorySize) {
            this.navigationHistory.shift();
        }
    }
}

/**
 * Update navigation state
 * @private
 */
updateNavigationState() {
    if (window.stateManager) {
        window.stateManager.setState('ui.navigation', {
            currentTab: this.currentTab,
            currentBottomTab: this.currentBottomTab,
            history: this.navigationHistory
        });
    }
}

/**
 * Emit navigation event
 * @private
 * @param {string} eventType - Event type
 * @param {Object} data - Event data
 */
emitNavigationEvent(eventType, data) {
    const event = new CustomEvent(eventType, {
        detail: {
            ...data,
            timestamp: Date.now()
        }
    });
    
    document.dispatchEvent(event);
}

/**
 * Get navigation status
 * @returns {Object} Navigation status
 */
getStatus() {
    return {
        currentTab: this.currentTab,
        currentBottomTab: this.currentBottomTab,
        historyLength: this.navigationHistory.length
    };
}
```

}

// Create global navigation manager instance
const navigationManager = new NavigationManager();

// Create Navigation namespace for global access
window.Navigation = {
switchTab: navigationManager.switchTab,
switchBottomTab: navigationManager.switchBottomTab,
goBack: navigationManager.goBack
};

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { NavigationManager, navigationManager };
} else if (typeof window !== ‘undefined’) {
window.NavigationManager = NavigationManager;
window.navigationManager = navigationManager;
}
