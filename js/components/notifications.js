/**

- Notifications Management Component
- Handles push notifications, in-app notifications, and notification preferences
  */

class NotificationManager {
constructor() {
this.permission = ‘default’;
this.activeNotifications = new Map();
this.notificationQueue = [];
this.settings = {
enabled: true,
sound: true,
vibration: true,
showOnScreen: true,
persistentBadge: true
};

```
    this.initialize();
}

/**
 * Initialize notification system
 * @private
 */
async initialize() {
    // Check notification support
    if (!('Notification' in window)) {
        console.warn('Browser does not support notifications');
        return;
    }
    
    // Get current permission status
    this.permission = Notification.permission;
    
    // Initialize service worker for push notifications
    await this.initializeServiceWorker();
    
    // Setup notification event listeners
    this.setupEventListeners();
    
    // Load user preferences
    this.loadNotificationSettings();
    
    console.log('Notification system initialized');
}

/**
 * Initialize service worker for push notifications
 * @private
 */
async initializeServiceWorker() {
    if ('serviceWorker' in navigator && CONFIG.pwa.enableServiceWorker) {
        try {
            const registration = await navigator.serviceWorker.ready;
            console.log('Service Worker ready for notifications');
            this.serviceWorkerRegistration = registration;
        } catch (error) {
            console.warn('Service Worker not available for notifications:', error);
        }
    }
}

/**
 * Setup notification event listeners
 * @private
 */
setupEventListeners() {
    // Listen for notification clicks
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'NOTIFICATION_CLICK') {
                this.handleNotificationClick(event.data.notificationId);
            }
        });
    }
    
    // Listen for state changes
    if (window.stateManager) {
        window.stateManager.subscribe('chats.messages', () => {
            this.checkForNewMessages();
        });
        
        window.stateManager.subscribe('user.preferences.notifications', (settings) => {
            this.updateSettings(settings);
        });
    }
}

/**
 * Request notification permission from user
 * @returns {Promise<string>} Permission status
 */
async requestPermission() {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return 'denied';
    }
    
    if (this.permission === 'granted') {
        return 'granted';
    }
    
    try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        
        // Update state
        if (window.stateManager) {
            window.stateManager.setState('system.permissions.notifications', permission);
        }
        
        // Show confirmation
        if (permission === 'granted') {
            this.showInAppNotification('Notifications enabled successfully!', 'success');
        }
        
        return permission;
    } catch (error) {
        console.error('Failed to request notification permission:', error);
        return 'denied';
    }
}

/**
 * Show browser notification
 * @param {Object} options - Notification options
 * @returns {Promise<Notification|null>} Notification instance
 */
async showNotification(options = {}) {
    const config = {
        title: 'GALAX',
        body: '',
        icon: this.getNotificationIcon(),
        badge: this.getNotificationBadge(),
        tag: 'galax-notification',
        requireInteraction: false,
        silent: !this.settings.sound,
        vibrate: this.settings.vibration ? [200, 100, 200] : [],
        ...options
    };
    
    // Check permission
    if (this.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }
    
    // Check if notifications are enabled
    if (!this.settings.enabled) {
        console.log('Notifications disabled by user');
        return null;
    }
    
    try {
        let notification;
        
        // Use service worker for persistent notifications if available
        if (this.serviceWorkerRegistration) {
            await this.serviceWorkerRegistration.showNotification(config.title, {
                body: config.body,
                icon: config.icon,
                badge: config.badge,
                tag: config.tag,
                requireInteraction: config.requireInteraction,
                silent: config.silent,
                vibrate: config.vibrate,
                data: { notificationId: this.generateNotificationId() }
            });
            notification = { id: config.tag };
        } else {
            // Fallback to regular notification
            notification = new Notification(config.title, config);
            
            // Auto-close after delay
            setTimeout(() => {
                if (notification) {
                    notification.close();
                }
            }, 5000);
        }
        
        // Track active notification
        if (notification) {
            this.activeNotifications.set(config.tag, notification);
        }
        
        return notification;
    } catch (error) {
        console.error('Failed to show notification:', error);
        return null;
    }
}

/**
 * Show in-app notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, warning, error)
 * @param {Object} options - Additional options
 */
showInAppNotification(message, type = 'info', options = {}) {
    if (!this.settings.showOnScreen) {
        return;
    }
    
    const config = {
        duration: 5000,
        position: 'top-right',
        closable: true,
        ...options
    };
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `in-app-notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        ${config.position.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
        ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        background: ${this.getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 350px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInNotification 0.3s ease-out;
    `;
    
    // Add icon based on type
    const icon = this.getNotificationTypeIcon(type);
    notification.innerHTML = `
        <span style="font-size: 18px;">${icon}</span>
        <span style="flex: 1;">${message}</span>
        ${config.closable ? '<button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>' : ''}
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    if (config.duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutNotification 0.3s ease-in';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, config.duration);
    }
}

/**
 * Show notification for new message
 * @param {Object} message - Message object
 */
showMessageNotification(message) {
    // Don't show notification for own messages
    if (message.sender === this.getCurrentUser()) {
        return;
    }
    
    // Don't show if chat is currently active
    if (this.isChatActive(message.sender)) {
        return;
    }
    
    const title = `New message from ${message.sender}`;
    const body = this.truncateMessage(message.content, 100);
    
    this.showNotification({
        title,
        body,
        tag: `message-${message.sender}`,
        data: {
            type: 'message',
            sender: message.sender,
            messageId: message.id
        }
    });
    
    // Update badge count
    this.updateBadgeCount();
}

/**
 * Show notification for system events
 * @param {string} type - Event type
 * @param {Object} data - Event data
 */
showSystemNotification(type, data) {
    let title, body, icon;
    
    switch (type) {
        case 'user_joined':
            title = 'User Joined';
            body = `${data.username} joined the community`;
            icon = '👋';
            break;
        case 'group_invitation':
            title = 'Group Invitation';
            body = `You've been invited to join ${data.groupName}`;
            icon = '👥';
            break;
        case 'system_update':
            title = 'System Update';
            body = 'New features are now available';
            icon = '🔄';
            break;
        default:
            title = 'GALAX Notification';
            body = data.message || 'You have a new notification';
            icon = '📢';
    }
    
    this.showNotification({
        title,
        body,
        tag: `system-${type}`,
        data: { type: 'system', eventType: type, ...data }
    });
    
    // Also show in-app notification
    this.showInAppNotification(`${icon} ${body}`, 'info');
}

/**
 * Check for new messages and show notifications
 * @private
 */
checkForNewMessages() {
    if (!window.stateManager) return;
    
    const chats = window.stateManager.getState('chats.conversations');
    if (!chats) return;
    
    // Check each conversation for unread messages
    Object.entries(chats).forEach(([chatId, conversation]) => {
        const unreadCount = this.getUnreadCount(conversation);
        if (unreadCount > 0) {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            if (lastMessage && this.shouldNotify(lastMessage)) {
                this.showMessageNotification(lastMessage);
            }
        }
    });
}

/**
 * Handle notification click events
 * @private
 * @param {string} notificationId - Notification ID
 */
handleNotificationClick(notificationId) {
    console.log('Notification clicked:', notificationId);
    
    // Focus window if possible
    if (window.focus) {
        window.focus();
    }
    
    // Navigate to relevant screen based on notification type
    // This would be implemented based on notification data
}

/**
 * Get notification icon URL
 * @private
 * @returns {string} Icon URL
 */
getNotificationIcon() {
    return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%234ecdc4'/><text x='50' y='65' font-size='60' text-anchor='middle' fill='white'>💬</text></svg>";
}

/**
 * Get notification badge URL
 * @private
 * @returns {string} Badge URL
 */
getNotificationBadge() {
    return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><text y='.9em' font-size='90'>💬</text></svg>";
}

/**
 * Get notification color based on type
 * @private
 * @param {string} type - Notification type
 * @returns {string} Color value
 */
getNotificationColor(type) {
    const colors = {
        info: '#4ecdc4',
        success: '#2ecc71',
        warning: '#f39c12',
        error: '#e74c3c'
    };
    return colors[type] || colors.info;
}

/**
 * Get notification type icon
 * @private
 * @param {string} type - Notification type
 * @returns {string} Icon emoji
 */
getNotificationTypeIcon(type) {
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
    return icons[type] || icons.info;
}

/**
 * Generate unique notification ID
 * @private
 * @returns {string} Notification ID
 */
generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncate message for notification
 * @private
 * @param {string} message - Original message
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated message
 */
truncateMessage(message, maxLength) {
    if (message.length <= maxLength) {
        return message;
    }
    return message.substring(0, maxLength - 3) + '...';
}

/**
 * Get current user
 * @private
 * @returns {string} Current username
 */
getCurrentUser() {
    if (window.stateManager) {
        return window.stateManager.getState('user.username') || '';
    }
    return '';
}

/**
 * Check if chat is currently active
 * @private
 * @param {string} chatId - Chat identifier
 * @returns {boolean} Whether chat is active
 */
isChatActive(chatId) {
    if (window.stateManager) {
        const activeChat = window.stateManager.getState('chats.active');
        const currentScreen = window.stateManager.getState('ui.currentScreen');
        return activeChat === chatId && currentScreen === 'chatScreen';
    }
    return false;
}

/**
 * Get unread message count for conversation
 * @private
 * @param {Object} conversation - Conversation object
 * @returns {number} Unread count
 */
getUnreadCount(conversation) {
    if (!conversation.messages) return 0;
    
    return conversation.messages.filter(msg => 
        msg.sender !== this.getCurrentUser() && !msg.read
    ).length;
}

/**
 * Check if should notify for message
 * @private
 * @param {Object} message - Message object
 * @returns {boolean} Whether to notify
 */
shouldNotify(message) {
    // Don't notify for old messages
    const messageAge = Date.now() - message.timestamp;
    return messageAge < 60000; // Within last minute
}

/**
 * Update notification badge count
 * @private
 */
updateBadgeCount() {
    if ('setAppBadge' in navigator) {
        let totalUnread = 0;
        
        if (window.stateManager) {
            const chats = window.stateManager.getState('chats.conversations') || {};
            totalUnread = Object.values(chats).reduce((sum, chat) => {
                return sum + this.getUnreadCount(chat);
            }, 0);
        }
        
        if (totalUnread > 0) {
            navigator.setAppBadge(totalUnread);
        } else {
            navigator.clearAppBadge();
        }
    }
}

/**
 * Load notification settings from storage
 * @private
 */
async loadNotificationSettings() {
    if (window.storageManager) {
        const savedSettings = await window.storageManager.get('notificationSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
    }
}

/**
 * Save notification settings to storage
 * @private
 */
async saveNotificationSettings() {
    if (window.storageManager) {
        await window.storageManager.set('notificationSettings', this.settings);
    }
}

/**
 * Update notification settings
 * @param {Object} newSettings - New settings
 */
updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveNotificationSettings();
    
    console.log('Notification settings updated:', this.settings);
}

/**
 * Clear all notifications
 */
clearAllNotifications() {
    // Clear browser notifications
    this.activeNotifications.forEach(notification => {
        if (notification.close) {
            notification.close();
        }
    });
    this.activeNotifications.clear();
    
    // Clear in-app notifications
    document.querySelectorAll('.in-app-notification').forEach(el => {
        el.remove();
    });
    
    // Clear badge
    if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge();
    }
}

/**
 * Get notification manager status
 * @returns {Object} Status information
 */
getStatus() {
    return {
        permission: this.permission,
        enabled: this.settings.enabled,
        activeNotifications: this.activeNotifications.size,
        queuedNotifications: this.notificationQueue.length,
        settings: this.settings
    };
}
```

}

// Add notification animation styles
const notificationStyles = document.createElement(‘style’);
notificationStyles.textContent = `
@keyframes slideInNotification {
from {
transform: translateX(100%);
opacity: 0;
}
to {
transform: translateX(0);
opacity: 1;
}
}

```
@keyframes slideOutNotification {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
```

`;
document.head.appendChild(notificationStyles);

// Create global notification manager instance
const notificationManager = new NotificationManager();

// Create Notifications namespace for global access
window.Notifications = {
request: () => notificationManager.requestPermission(),
show: (options) => notificationManager.showNotification(options),
showInApp: (message, type, options) => notificationManager.showInAppNotification(message, type, options),
showMessage: (message) => notificationManager.showMessageNotification(message),
showSystem: (type, data) => notificationManager.showSystemNotification(type, data),
clear: () => notificationManager.clearAllNotifications(),
updateSettings: (settings) => notificationManager.updateSettings(settings),
getStatus: () => notificationManager.getStatus()
};

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { NotificationManager, notificationManager };
} else if (typeof window !== ‘undefined’) {
window.NotificationManager = NotificationManager;
window.notificationManager = notificationManager;
}
