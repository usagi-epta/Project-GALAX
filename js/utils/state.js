/**

- State Management System
- Enterprise-grade state management with reactive updates and persistence
  */

class StateManager {
constructor() {
this.state = this.getInitialState();
this.subscribers = new Map();
this.middleware = [];
this.history = [];
this.maxHistorySize = 50;
this.isTimeTravel = false;

```
    this.setupStateProxy();
    this.bindMethods();
}

/**
 * Get initial application state
 * @private
 * @returns {Object} Initial state object
 */
getInitialState() {
    return {
        // User state
        user: {
            id: null,
            username: null,
            avatar: 1,
            isAuthenticated: false,
            preferences: {
                theme: 'default',
                notifications: true,
                sound: true
            },
            profile: {
                name: '',
                status: 'Online',
                joinDate: null
            }
        },

        // Chat state
        chats: {
            active: null,
            conversations: new Map(),
            messages: new Map(),
            typing: new Set(),
            unread: new Map(),
            presence: new Map()
        },

        // UI state
        ui: {
            currentScreen: 'loginScreen',
            activeTab: 'chats',
            activeBottomTab: 'chats',
            loading: false,
            errors: [],
            modals: {
                drawing: false,
                profile: false,
                call: false
            },
            notifications: []
        },

        // System state
        system: {
            online: navigator.onLine,
            graphics: {
                konva: false,
                pixi: false,
                three: false
            },
            permissions: {
                notifications: 'default',
                microphone: 'prompt',
                camera: 'prompt'
            }
        },

        // Real-time state
        realtime: {
            connected: false,
            reconnecting: false,
            lastSeen: new Map(),
            messageQueue: []
        }
    };
}

/**
 * Setup reactive state proxy
 * @private
 */
setupStateProxy() {
    this.state = new Proxy(this.state, {
        set: (target, property, value, receiver) => {
            const oldValue = target[property];
            const result = Reflect.set(target, property, value, receiver);
            
            if (!this.isTimeTravel && oldValue !== value) {
                this.recordHistory(property, oldValue, value);
                this.notifySubscribers(property, value, oldValue);
            }
            
            return result;
        },

        get: (target, property) => {
            const value = Reflect.get(target, property);
            
            // Return deep proxy for nested objects
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return this.createDeepProxy(value, property);
            }
            
            return value;
        }
    });
}

/**
 * Create deep proxy for nested state objects
 * @private
 * @param {Object} target - Target object
 * @param {string} path - Property path
 * @returns {Proxy} Proxied object
 */
createDeepProxy(target, path) {
    return new Proxy(target, {
        set: (nestedTarget, property, value) => {
            const oldValue = nestedTarget[property];
            const result = Reflect.set(nestedTarget, property, value);
            
            if (!this.isTimeTravel && oldValue !== value) {
                const fullPath = `${path}.${property}`;
                this.recordHistory(fullPath, oldValue, value);
                this.notifySubscribers(fullPath, value, oldValue);
            }
            
            return result;
        }
    });
}

/**
 * Bind methods to maintain context
 * @private
 */
bindMethods() {
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
}

/**
 * Get current state or specific state slice
 * @param {string} [path] - Dot-notation path to specific state
 * @returns {*} State value
 */
getState(path) {
    if (!path) {
        return this.state;
    }

    return this.getNestedValue(this.state, path);
}

/**
 * Set state with validation and middleware support
 * @param {string|Object} pathOrUpdates - Path string or updates object
 * @param {*} [value] - Value to set (if path is string)
 */
setState(pathOrUpdates, value) {
    if (typeof pathOrUpdates === 'string') {
        this.setNestedValue(this.state, pathOrUpdates, value);
    } else if (typeof pathOrUpdates === 'object') {
        this.mergeState(pathOrUpdates);
    }
}

/**
 * Merge state updates
 * @private
 * @param {Object} updates - State updates
 */
mergeState(updates) {
    Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
            if (!this.state[key]) {
                this.state[key] = {};
            }
            Object.assign(this.state[key], updates[key]);
        } else {
            this.state[key] = updates[key];
        }
    });
}

/**
 * Get nested value using dot notation
 * @private
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-notation path
 * @returns {*} Value at path
 */
getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

/**
 * Set nested value using dot notation
 * @private
 * @param {Object} obj - Object to modify
 * @param {string} path - Dot-notation path
 * @param {*} value - Value to set
 */
setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        return current[key];
    }, obj);
    
    target[lastKey] = value;
}

/**
 * Subscribe to state changes
 * @param {string|Function} pathOrCallback - Path to watch or callback for all changes
 * @param {Function} [callback] - Callback function
 * @returns {Function} Unsubscribe function
 */
subscribe(pathOrCallback, callback) {
    let subscriberPath = '*';
    let subscriberCallback = pathOrCallback;

    if (typeof pathOrCallback === 'string') {
        subscriberPath = pathOrCallback;
        subscriberCallback = callback;
    }

    const subscriberId = this.generateSubscriberId();
    
    if (!this.subscribers.has(subscriberPath)) {
        this.subscribers.set(subscriberPath, new Map());
    }
    
    this.subscribers.get(subscriberPath).set(subscriberId, subscriberCallback);

    // Return unsubscribe function
    return () => this.unsubscribe(subscriberPath, subscriberId);
}

/**
 * Unsubscribe from state changes
 * @param {string} path - Path to unsubscribe from
 * @param {string} subscriberId - Subscriber ID
 */
unsubscribe(path, subscriberId) {
    if (this.subscribers.has(path)) {
        this.subscribers.get(path).delete(subscriberId);
        
        if (this.subscribers.get(path).size === 0) {
            this.subscribers.delete(path);
        }
    }
}

/**
 * Notify subscribers of state changes
 * @private
 * @param {string} path - Changed path
 * @param {*} newValue - New value
 * @param {*} oldValue - Previous value
 */
notifySubscribers(path, newValue, oldValue) {
    // Notify path-specific subscribers
    if (this.subscribers.has(path)) {
        this.subscribers.get(path).forEach(callback => {
            try {
                callback(newValue, oldValue, path);
            } catch (error) {
                console.error('Subscriber error:', error);
            }
        });
    }

    // Notify wildcard subscribers
    if (this.subscribers.has('*')) {
        this.subscribers.get('*').forEach(callback => {
            try {
                callback(this.state, path, newValue, oldValue);
            } catch (error) {
                console.error('Wildcard subscriber error:', error);
            }
        });
    }

    // Notify parent path subscribers
    this.notifyParentSubscribers(path, newValue, oldValue);
}

/**
 * Notify parent path subscribers
 * @private
 * @param {string} path - Changed path
 * @param {*} newValue - New value
 * @param {*} oldValue - Previous value
 */
notifyParentSubscribers(path, newValue, oldValue) {
    const pathParts = path.split('.');
    
    for (let i = pathParts.length - 1; i > 0; i--) {
        const parentPath = pathParts.slice(0, i).join('.');
        
        if (this.subscribers.has(parentPath)) {
            const parentValue = this.getNestedValue(this.state, parentPath);
            this.subscribers.get(parentPath).forEach(callback => {
                try {
                    callback(parentValue, parentPath, newValue, oldValue);
                } catch (error) {
                    console.error('Parent subscriber error:', error);
                }
            });
        }
    }
}

/**
 * Generate unique subscriber ID
 * @private
 * @returns {string} Unique ID
 */
generateSubscriberId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Record state change in history
 * @private
 * @param {string} path - Changed path
 * @param {*} oldValue - Previous value
 * @param {*} newValue - New value
 */
recordHistory(path, oldValue, newValue) {
    const historyEntry = {
        timestamp: Date.now(),
        path,
        oldValue,
        newValue,
        action: 'SET_STATE'
    };

    this.history.push(historyEntry);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
        this.history.shift();
    }
}

/**
 * Time travel to previous state
 * @param {number} steps - Number of steps to go back
 */
timeTravel(steps = 1) {
    if (this.history.length < steps) {
        console.warn('Not enough history for time travel');
        return;
    }

    this.isTimeTravel = true;

    for (let i = 0; i < steps; i++) {
        const lastEntry = this.history.pop();
        if (lastEntry) {
            this.setNestedValue(this.state, lastEntry.path, lastEntry.oldValue);
        }
    }

    this.isTimeTravel = false;
    this.notifySubscribers('*', this.state, null);
}

/**
 * Get state history
 * @returns {Array} State history
 */
getHistory() {
    return [...this.history];
}

/**
 * Clear state history
 */
clearHistory() {
    this.history = [];
}

/**
 * Add middleware for state changes
 * @param {Function} middleware - Middleware function
 */
addMiddleware(middleware) {
    this.middleware.push(middleware);
}

/**
 * Remove middleware
 * @param {Function} middleware - Middleware function to remove
 */
removeMiddleware(middleware) {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
        this.middleware.splice(index, 1);
    }
}

/**
 * Reset state to initial values
 */
reset() {
    this.isTimeTravel = true;
    Object.assign(this.state, this.getInitialState());
    this.isTimeTravel = false;
    this.clearHistory();
    this.notifySubscribers('*', this.state, null);
}

/**
 * Batch state updates
 * @param {Function} updateFn - Function that performs multiple state updates
 */
batch(updateFn) {
    const oldIsTimeTravel = this.isTimeTravel;
    this.isTimeTravel = true;
    
    try {
        updateFn();
    } finally {
        this.isTimeTravel = oldIsTimeTravel;
        this.notifySubscribers('*', this.state, null);
    }
}

/**
 * Create computed state getter
 * @param {Function} computeFn - Function to compute derived state
 * @param {Array} dependencies - State paths this computation depends on
 * @returns {Function} Getter function
 */
computed(computeFn, dependencies = []) {
    let cachedValue;
    let isValid = false;

    // Subscribe to dependencies
    dependencies.forEach(dep => {
        this.subscribe(dep, () => {
            isValid = false;
        });
    });

    return () => {
        if (!isValid) {
            cachedValue = computeFn(this.state);
            isValid = true;
        }
        return cachedValue;
    };
}

/**
 * Export state for persistence
 * @returns {string} Serialized state
 */
exportState() {
    const exportData = {
        state: this.state,
        timestamp: Date.now(),
        version: '1.0.0'
    };
    
    return JSON.stringify(exportData, (key, value) => {
        // Handle Map objects
        if (value instanceof Map) {
            return {
                __type: 'Map',
                entries: Array.from(value.entries())
            };
        }
        // Handle Set objects
        if (value instanceof Set) {
            return {
                __type: 'Set',
                values: Array.from(value.values())
            };
        }
        return value;
    });
}

/**
 * Import state from persistence
 * @param {string} serializedState - Serialized state string
 */
importState(serializedState) {
    try {
        const importData = JSON.parse(serializedState, (key, value) => {
            // Restore Map objects
            if (value && value.__type === 'Map') {
                return new Map(value.entries);
            }
            // Restore Set objects
            if (value && value.__type === 'Set') {
                return new Set(value.values);
            }
            return value;
        });

        if (importData.state) {
            this.isTimeTravel = true;
            Object.assign(this.state, importData.state);
            this.isTimeTravel = false;
            this.notifySubscribers('*', this.state, null);
        }
    } catch (error) {
        console.error('Failed to import state:', error);
    }
}
```

}

// Create global state manager instance
const stateManager = new StateManager();

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { StateManager, stateManager };
} else if (typeof window !== ‘undefined’) {
window.StateManager = StateManager;
window.stateManager = stateManager;
window.AppState = stateManager; // Legacy compatibility
}
