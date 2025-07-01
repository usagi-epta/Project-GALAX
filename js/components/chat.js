/**

- Chat Management Component
- Handles all chat functionality including messaging, real-time updates, and UI management
  */

class ChatManager {
constructor() {
this.currentChat = ‘’;
this.messageQueue = [];
this.typingIndicators = new Map();
this.typingTimer = null;
this.isTyping = false;
this.reconnectAttempts = 0;
this.maxReconnectAttempts = 5;

```
    this.bindEventHandlers();
    this.initializeEventListeners();
}

/**
 * Bind event handlers to maintain context
 * @private
 */
bindEventHandlers() {
    this.openChat = this.openChat.bind(this);
    this.backToMain = this.backToMain.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.sendMessageOnEnter = this.sendMessageOnEnter.bind(this);
    this.handleTyping = this.handleTyping.bind(this);
}

/**
 * Initialize event listeners for chat functionality
 * @private
 */
initializeEventListeners() {
    // Listen for network status changes
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
    
    // Listen for state changes
    if (window.stateManager) {
        window.stateManager.subscribe('chats', (chatsState) => {
            this.handleChatsStateChange(chatsState);
        });
    }
}

/**
 * Open a chat conversation
 * @param {string} partnerName - Name of chat partner
 */
openChat(partnerName) {
    this.currentChat = partnerName;
    
    // Update UI elements
    const chatPartnerElement = document.getElementById('chatPartner');
    if (chatPartnerElement) {
        chatPartnerElement.textContent = partnerName;
    }
    
    // Update state
    if (window.stateManager) {
        window.stateManager.setState('chats.active', partnerName);
        window.stateManager.setState('ui.currentScreen', 'chatScreen');
    }
    
    // Show chat screen
    this.showScreen('chatScreen');
    
    // Load chat history
    this.loadChatHistory(partnerName);
    
    // Mark messages as read
    this.markMessagesAsRead(partnerName);
    
    // Initialize chat features
    this.initializeChatFeatures();
}

/**
 * Navigate back to main screen
 */
backToMain() {
    // Update state
    if (window.stateManager) {
        window.stateManager.setState('chats.active', null);
        window.stateManager.setState('ui.currentScreen', 'mainScreen');
    }
    
    // Show main screen
    this.showScreen('mainScreen');
    
    // Clear current chat
    this.currentChat = '';
    
    // Stop typing indicators
    this.stopTyping();
}

/**
 * Send a message in the current chat
 */
sendMessage() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;
    
    const messageText = messageInput.value.trim();
    if (!messageText || !this.currentChat) return;
    
    // Create message object
    const message = {
        id: this.generateMessageId(),
        sender: this.getCurrentUser(),
        recipient: this.currentChat,
        content: messageText,
        timestamp: Date.now(),
        type: 'text',
        status: 'sending'
    };
    
    // Add message to UI immediately
    this.addMessageToChat(message, true);
    
    // Clear input
    messageInput.value = '';
    
    // Update state
    this.updateChatState(message);
    
    // Send message
    this.sendMessageToServer(message);
    
    // Stop typing indicator
    this.stopTyping();
    
    // Auto-generate response (for demo purposes)
    setTimeout(() => {
        this.generateAutoResponse();
    }, Math.random() * 2000 + 1000);
}

/**
 * Handle Enter key press for sending messages
 * @param {Event} event - Keyboard event
 */
sendMessageOnEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
    }
}

/**
 * Handle typing indicators
 */
handleTyping() {
    if (!this.isTyping) {
        this.isTyping = true;
        this.sendTypingIndicator(true);
    }
    
    // Clear existing timer
    clearTimeout(this.typingTimer);
    
    // Set new timer
    this.typingTimer = setTimeout(() => {
        this.stopTyping();
    }, 2000);
}

/**
 * Stop typing indicator
 * @private
 */
stopTyping() {
    if (this.isTyping) {
        this.isTyping = false;
        this.sendTypingIndicator(false);
    }
    clearTimeout(this.typingTimer);
}

/**
 * Send typing indicator to server
 * @private
 * @param {boolean} isTyping - Typing status
 */
sendTypingIndicator(isTyping) {
    // In a real implementation, this would send to WebSocket server
    console.log(`Typing indicator: ${isTyping} for chat: ${this.currentChat}`);
    
    // Simulate receiving typing indicator from partner
    if (isTyping && Math.random() > 0.7) {
        setTimeout(() => {
            this.showTypingIndicator(this.currentChat);
        }, 500);
    }
}

/**
 * Show typing indicator for a user
 * @private
 * @param {string} username - Username who is typing
 */
showTypingIndicator(username) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    // Remove existing typing indicator
    const existingIndicator = document.getElementById('typing-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message';
    typingDiv.innerHTML = `
        <div class="chat-avatar">${username.substring(0, 2).toUpperCase()}</div>
        <div class="message-bubble typing-bubble">
            <span class="typing-dots">
                <span></span><span></span><span></span>
            </span>
            <span style="font-size: 12px; color: #666; margin-left: 10px;">${username} is typing...</span>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Remove after a few seconds
    setTimeout(() => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }, 3000);
}

/**
 * Add message to chat interface
 * @private
 * @param {Object} message - Message object
 * @param {boolean} isOwn - Whether message is from current user
 */
addMessageToChat(message, isOwn = false) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    // Remove typing indicator if present
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : ''}`;
    messageDiv.setAttribute('data-message-id', message.id);
    
    if (isOwn) {
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${this.formatMessageContent(message.content, message.type)}
                <div class="message-status">${this.getStatusIcon(message.status)}</div>
            </div>
        `;
    } else {
        const initials = message.sender.substring(0, 2).toUpperCase();
        messageDiv.innerHTML = `
            <div class="chat-avatar">${initials}</div>
            <div class="message-bubble">
                ${this.formatMessageContent(message.content, message.type)}
            </div>
        `;
    }
    
    // Add animation class
    messageDiv.classList.add('message-send');
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Update message status after delay (simulate network)
    if (isOwn && message.status === 'sending') {
        setTimeout(() => {
            this.updateMessageStatus(message.id, 'sent');
        }, 1000);
    }
}

/**
 * Format message content based on type
 * @private
 * @param {string} content - Message content
 * @param {string} type - Message type
 * @returns {string} Formatted content
 */
formatMessageContent(content, type) {
    switch (type) {
        case 'text':
            return this.escapeHtml(content);
        case 'image':
            return `<img src="${content}" alt="Shared image" style="max-width: 200px; border-radius: 8px;">`;
        case 'file':
            return `<div class="file-message">📎 ${content}</div>`;
        case 'voice':
            return `<div class="voice-message">🎤 Voice message</div>`;
        default:
            return this.escapeHtml(content);
    }
}

/**
 * Get status icon for message
 * @private
 * @param {string} status - Message status
 * @returns {string} Status icon
 */
getStatusIcon(status) {
    switch (status) {
        case 'sending':
            return '⏳';
        case 'sent':
            return '✓';
        case 'delivered':
            return '✓✓';
        case 'read':
            return '✓✓';
        case 'failed':
            return '❌';
        default:
            return '';
    }
}

/**
 * Update message status
 * @private
 * @param {string} messageId - Message ID
 * @param {string} status - New status
 */
updateMessageStatus(messageId, status) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        const statusElement = messageElement.querySelector('.message-status');
        if (statusElement) {
            statusElement.textContent = this.getStatusIcon(status);
        }
    }
}

/**
 * Escape HTML to prevent XSS
 * @private
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Generate unique message ID
 * @private
 * @returns {string} Unique message ID
 */
generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current user from state
 * @private
 * @returns {string} Current username
 */
getCurrentUser() {
    if (window.stateManager) {
        return window.stateManager.getState('user.username') || 'Unknown';
    }
    return 'Unknown';
}

/**
 * Update chat state with new message
 * @private
 * @param {Object} message - Message object
 */
updateChatState(message) {
    if (!window.stateManager) return;
    
    const chatKey = `chats.conversations.${this.currentChat}`;
    const existingMessages = window.stateManager.getState(`${chatKey}.messages`) || [];
    existingMessages.push(message);
    
    window.stateManager.setState(`${chatKey}.messages`, existingMessages);
    window.stateManager.setState(`${chatKey}.lastMessage`, message);
    window.stateManager.setState(`${chatKey}.lastActivity`, Date.now());
}

/**
 * Send message to server
 * @private
 * @param {Object} message - Message to send
 */
sendMessageToServer(message) {
    // In a real implementation, this would use WebSocket or fetch API
    console.log('Sending message to server:', message);
    
    // Simulate network delay and update status
    setTimeout(() => {
        this.updateMessageStatus(message.id, 'delivered');
    }, 2000);
}

/**
 * Generate automatic response (for demo purposes)
 * @private
 */
generateAutoResponse() {
    const responses = [
        "That sounds great! I'm excited to work on this.",
        "Thanks for sharing that. Really helpful insights.",
        "Absolutely! Let's schedule a follow-up meeting.",
        "I'll take a look at that and get back to you.",
        "Perfect timing. I was just thinking about this.",
        "Great point! We should definitely consider that approach.",
        "Thanks for the update. Keep me posted on progress.",
        "Excellent work! Really impressed with the results."
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    const message = {
        id: this.generateMessageId(),
        sender: this.currentChat,
        recipient: this.getCurrentUser(),
        content: response,
        timestamp: Date.now(),
        type: 'text',
        status: 'delivered'
    };
    
    this.addMessageToChat(message, false);
    this.updateChatState(message);
}

/**
 * Load chat history for a conversation
 * @private
 * @param {string} partnerName - Chat partner name
 */
loadChatHistory(partnerName) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    // Clear existing messages
    messagesContainer.innerHTML = '';
    
    // Load from state or show default messages
    if (window.stateManager) {
        const messages = window.stateManager.getState(`chats.conversations.${partnerName}.messages`) || [];
        messages.forEach(message => {
            const isOwn = message.sender === this.getCurrentUser();
            this.addMessageToChat(message, isOwn);
        });
    } else {
        // Default demo messages
        this.loadDefaultMessages(partnerName);
    }
}

/**
 * Load default demo messages
 * @private
 * @param {string} partnerName - Chat partner name
 */
loadDefaultMessages(partnerName) {
    const defaultMessages = {
        'Dash Jeong': [
            {
                sender: 'Dash Jeong',
                content: "Hey! Ready for tonight's mission? We've got some interesting challenges lined up.",
                timestamp: Date.now() - 300000
            },
            {
                sender: this.getCurrentUser(),
                content: "Absolutely! I've been working on some new techniques. Should be fun.",
                timestamp: Date.now() - 240000
            },
            {
                sender: 'Dash Jeong',
                content: "Perfect! The team's really coming together. Your technical skills have been invaluable.",
                timestamp: Date.now() - 180000
            }
        ]
    };
    
    const messages = defaultMessages[partnerName] || [];
    messages.forEach(message => {
        const isOwn = message.sender === this.getCurrentUser();
        this.addMessageToChat({
            ...message,
            id: this.generateMessageId(),
            type: 'text',
            status: 'delivered'
        }, isOwn);
    });
}

/**
 * Mark messages as read
 * @private
 * @param {string} partnerName - Chat partner name
 */
markMessagesAsRead(partnerName) {
    // Remove unread badge from chat list
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const nameElement = item.querySelector('.chat-name');
        if (nameElement && nameElement.textContent === partnerName) {
            const badge = item.querySelector('.chat-badge');
            if (badge) {
                badge.remove();
            }
        }
    });
    
    // Update state
    if (window.stateManager) {
        window.stateManager.setState(`chats.unread.${partnerName}`, 0);
    }
}

/**
 * Initialize chat-specific features
 * @private
 */
initializeChatFeatures() {
    // Setup message input features
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.focus();
    }
    
    // Initialize enhanced graphics if available
    if (window.graphicsManager) {
        this.initializeEnhancedChatFeatures();
    }
}

/**
 * Initialize enhanced chat features with graphics libraries
 * @private
 */
initializeEnhancedChatFeatures() {
    // Add enhanced chat bubbles or animations if graphics libraries are available
    console.log('Enhanced chat features initialized');
}

/**
 * Handle network connectivity changes
 * @private
 * @param {boolean} isOnline - Network status
 */
handleNetworkChange(isOnline) {
    if (isOnline) {
        this.processMessageQueue();
        this.resumeRealtimeFeatures();
    } else {
        this.handleOfflineMode();
    }
}

/**
 * Process queued messages when back online
 * @private
 */
processMessageQueue() {
    while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.sendMessageToServer(message);
    }
}

/**
 * Resume real-time features when back online
 * @private
 */
resumeRealtimeFeatures() {
    console.log('Resuming real-time chat features');
    // Reconnect WebSocket, sync messages, etc.
}

/**
 * Handle offline mode
 * @private
 */
handleOfflineMode() {
    console.log('Chat operating in offline mode');
    // Queue messages, show offline indicator, etc.
}

/**
 * Handle chat state changes
 * @private
 * @param {Object} chatsState - New chats state
 */
handleChatsStateChange(chatsState) {
    // Update UI based on state changes
    console.log('Chat state updated:', chatsState);
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
 * Get chat manager status
 * @returns {Object} Status information
 */
getStatus() {
    return {
        currentChat: this.currentChat,
        messageQueue: this.messageQueue.length,
        isTyping: this.isTyping,
        activeTypingIndicators: this.typingIndicators.size
    };
}
```

}

// Create global chat manager instance
const chatManager = new ChatManager();

// Create Chat namespace for global access
window.Chat = {
openChat: chatManager.openChat,
backToMain: chatManager.backToMain,
sendMessage: chatManager.sendMessage,
sendMessageOnEnter: chatManager.sendMessageOnEnter,
handleTyping: chatManager.handleTyping
};

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { ChatManager, chatManager };
} else if (typeof window !== ‘undefined’) {
window.ChatManager = ChatManager;
window.chatManager = chatManager;
}
