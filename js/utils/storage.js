/**

- Storage Management System
- Comprehensive storage solution with multiple backends and data persistence
  */

class StorageManager {
constructor() {
this.backends = new Map();
this.config = {
defaultBackend: ‘localStorage’,
enableEncryption: false,
enableCompression: false,
expirationEnabled: true,
quotaWarningThreshold: 0.8
};

```
    this.initializeBackends();
    this.setupQuotaMonitoring();
}

/**
 * Initialize available storage backends
 * @private
 */
initializeBackends() {
    // Local Storage Backend
    if (this.isLocalStorageAvailable()) {
        this.backends.set('localStorage', new LocalStorageBackend());
    }

    // Session Storage Backend
    if (this.isSessionStorageAvailable()) {
        this.backends.set('sessionStorage', new SessionStorageBackend());
    }

    // IndexedDB Backend
    if (this.isIndexedDBAvailable()) {
        this.backends.set('indexedDB', new IndexedDBBackend());
    }

    // Memory Backend (fallback)
    this.backends.set('memory', new MemoryBackend());

    // Set fallback if default is not available
    if (!this.backends.has(this.config.defaultBackend)) {
        this.config.defaultBackend = 'memory';
    }
}

/**
 * Setup storage quota monitoring
 * @private
 */
setupQuotaMonitoring() {
    if ('navigator' in window && 'storage' in navigator) {
        this.monitorStorageQuota();
    }
}

/**
 * Monitor storage quota usage
 * @private
 */
async monitorStorageQuota() {
    try {
        const estimate = await navigator.storage.estimate();
        const usageRatio = estimate.usage / estimate.quota;
        
        if (usageRatio > this.config.quotaWarningThreshold) {
            this.emitEvent('quotaWarning', {
                usage: estimate.usage,
                quota: estimate.quota,
                ratio: usageRatio
            });
        }
    } catch (error) {
        console.warn('Storage quota monitoring failed:', error);
    }
}

/**
 * Store data with comprehensive options
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {Object} options - Storage options
 * @returns {Promise<boolean>} Success status
 */
async set(key, value, options = {}) {
    const config = {
        backend: this.config.defaultBackend,
        expiration: null,
        encrypt: this.config.enableEncryption,
        compress: this.config.enableCompression,
        namespace: 'galax',
        ...options
    };

    try {
        const namespacedKey = this.createNamespacedKey(key, config.namespace);
        const storageData = this.prepareStorageData(value, config);
        
        const backend = this.getBackend(config.backend);
        if (!backend) {
            throw new Error(`Backend ${config.backend} not available`);
        }

        const success = await backend.set(namespacedKey, storageData);
        
        if (success) {
            this.emitEvent('dataStored', { key, backend: config.backend });
        }
        
        return success;
    } catch (error) {
        console.error('Storage set operation failed:', error);
        return false;
    }
}

/**
 * Retrieve data with automatic deserialization
 * @param {string} key - Storage key
 * @param {Object} options - Retrieval options
 * @returns {Promise<*>} Retrieved value or null
 */
async get(key, options = {}) {
    const config = {
        backend: this.config.defaultBackend,
        namespace: 'galax',
        defaultValue: null,
        ...options
    };

    try {
        const namespacedKey = this.createNamespacedKey(key, config.namespace);
        const backend = this.getBackend(config.backend);
        
        if (!backend) {
            return config.defaultValue;
        }

        const rawData = await backend.get(namespacedKey);
        
        if (rawData === null) {
            return config.defaultValue;
        }

        const processedData = this.processStorageData(rawData);
        
        // Check expiration
        if (this.isExpired(processedData)) {
            await this.remove(key, { backend: config.backend, namespace: config.namespace });
            return config.defaultValue;
        }

        this.emitEvent('dataRetrieved', { key, backend: config.backend });
        return processedData.value;
        
    } catch (error) {
        console.error('Storage get operation failed:', error);
        return config.defaultValue;
    }
}

/**
 * Remove data from storage
 * @param {string} key - Storage key
 * @param {Object} options - Removal options
 * @returns {Promise<boolean>} Success status
 */
async remove(key, options = {}) {
    const config = {
        backend: this.config.defaultBackend,
        namespace: 'galax',
        ...options
    };

    try {
        const namespacedKey = this.createNamespacedKey(key, config.namespace);
        const backend = this.getBackend(config.backend);
        
        if (!backend) {
            return false;
        }

        const success = await backend.remove(namespacedKey);
        
        if (success) {
            this.emitEvent('dataRemoved', { key, backend: config.backend });
        }
        
        return success;
    } catch (error) {
        console.error('Storage remove operation failed:', error);
        return false;
    }
}

/**
 * Clear all data from specified backend
 * @param {Object} options - Clear options
 * @returns {Promise<boolean>} Success status
 */
async clear(options = {}) {
    const config = {
        backend: this.config.defaultBackend,
        namespace: 'galax',
        ...options
    };

    try {
        const backend = this.getBackend(config.backend);
        
        if (!backend) {
            return false;
        }

        const success = await backend.clear(config.namespace);
        
        if (success) {
            this.emitEvent('dataCleared', { backend: config.backend });
        }
        
        return success;
    } catch (error) {
        console.error('Storage clear operation failed:', error);
        return false;
    }
}

/**
 * Get all keys from specified backend
 * @param {Object} options - Options
 * @returns {Promise<Array>} Array of keys
 */
async keys(options = {}) {
    const config = {
        backend: this.config.defaultBackend,
        namespace: 'galax',
        ...options
    };

    try {
        const backend = this.getBackend(config.backend);
        
        if (!backend) {
            return [];
        }

        return await backend.keys(config.namespace);
    } catch (error) {
        console.error('Storage keys operation failed:', error);
        return [];
    }
}

/**
 * Prepare data for storage with metadata
 * @private
 * @param {*} value - Value to store
 * @param {Object} config - Storage configuration
 * @returns {Object} Prepared storage data
 */
prepareStorageData(value, config) {
    const storageData = {
        value,
        timestamp: Date.now(),
        version: '1.0.0'
    };

    // Add expiration
    if (config.expiration) {
        storageData.expires = Date.now() + config.expiration;
    }

    // Add compression flag
    if (config.compress) {
        storageData.compressed = true;
    }

    // Add encryption flag
    if (config.encrypt) {
        storageData.encrypted = true;
    }

    return storageData;
}

/**
 * Process retrieved storage data
 * @private
 * @param {*} rawData - Raw storage data
 * @returns {Object} Processed storage data
 */
processStorageData(rawData) {
    try {
        if (typeof rawData === 'string') {
            return JSON.parse(rawData);
        }
        return rawData;
    } catch (error) {
        console.warn('Failed to parse storage data:', error);
        return { value: rawData, timestamp: Date.now() };
    }
}

/**
 * Check if stored data has expired
 * @private
 * @param {Object} storageData - Storage data object
 * @returns {boolean} True if expired
 */
isExpired(storageData) {
    if (!this.config.expirationEnabled || !storageData.expires) {
        return false;
    }
    
    return Date.now() > storageData.expires;
}

/**
 * Create namespaced key
 * @private
 * @param {string} key - Original key
 * @param {string} namespace - Namespace
 * @returns {string} Namespaced key
 */
createNamespacedKey(key, namespace) {
    return `${namespace}:${key}`;
}

/**
 * Get storage backend
 * @private
 * @param {string} backendName - Backend name
 * @returns {Object|null} Backend instance
 */
getBackend(backendName) {
    return this.backends.get(backendName) || null;
}

/**
 * Check Local Storage availability
 * @private
 * @returns {boolean} Availability status
 */
isLocalStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Check Session Storage availability
 * @private
 * @returns {boolean} Availability status
 */
isSessionStorageAvailable() {
    try {
        const test = '__session_test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Check IndexedDB availability
 * @private
 * @returns {boolean} Availability status
 */
isIndexedDBAvailable() {
    return 'indexedDB' in window;
}

/**
 * Get storage information
 * @returns {Object} Storage information
 */
getStorageInfo() {
    return {
        availableBackends: Array.from(this.backends.keys()),
        defaultBackend: this.config.defaultBackend,
        config: { ...this.config }
    };
}

/**
 * Emit storage events
 * @private
 * @param {string} eventType - Event type
 * @param {Object} data - Event data
 */
emitEvent(eventType, data) {
    if (typeof window !== 'undefined' && window.stateManager) {
        window.stateManager.setState(`system.storage.${eventType}`, {
            ...data,
            timestamp: Date.now()
        });
    }
}

/**
 * Migrate data between backends
 * @param {string} fromBackend - Source backend
 * @param {string} toBackend - Target backend
 * @param {Object} options - Migration options
 * @returns {Promise<boolean>} Migration success
 */
async migrate(fromBackend, toBackend, options = {}) {
    const config = {
        namespace: 'galax',
        clearSource: false,
        ...options
    };

    try {
        const sourceBackend = this.getBackend(fromBackend);
        const targetBackend = this.getBackend(toBackend);

        if (!sourceBackend || !targetBackend) {
            throw new Error('Invalid backend specified for migration');
        }

        const keys = await sourceBackend.keys(config.namespace);
        let migratedCount = 0;

        for (const key of keys) {
            try {
                const data = await sourceBackend.get(key);
                if (data !== null) {
                    await targetBackend.set(key, data);
                    migratedCount++;
                    
                    if (config.clearSource) {
                        await sourceBackend.remove(key);
                    }
                }
            } catch (error) {
                console.warn(`Failed to migrate key ${key}:`, error);
            }
        }

        this.emitEvent('migrationComplete', {
            fromBackend,
            toBackend,
            migratedCount,
            totalKeys: keys.length
        });

        return true;
    } catch (error) {
        console.error('Storage migration failed:', error);
        return false;
    }
}
```

}

/**

- Local Storage Backend Implementation
  */
  class LocalStorageBackend {
  async set(key, value) {
  try {
  localStorage.setItem(key, JSON.stringify(value));
  return true;
  } catch (error) {
  console.error(‘LocalStorage set failed:’, error);
  return false;
  }
  }
  
  async get(key) {
  try {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
  } catch (error) {
  console.error(‘LocalStorage get failed:’, error);
  return null;
  }
  }
  
  async remove(key) {
  try {
  localStorage.removeItem(key);
  return true;
  } catch (error) {
  console.error(‘LocalStorage remove failed:’, error);
  return false;
  }
  }
  
  async clear(namespace) {
  try {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith(namespace + ‘:’)) {
  keysToRemove.push(key);
  }
  }
  
  ```
       keysToRemove.forEach(key => localStorage.removeItem(key));
       return true;
   } catch (error) {
       console.error('LocalStorage clear failed:', error);
       return false;
   }
  ```
  
  }
  
  async keys(namespace) {
  const keys = [];
  try {
  for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith(namespace + ‘:’)) {
  keys.push(key);
  }
  }
  } catch (error) {
  console.error(‘LocalStorage keys failed:’, error);
  }
  return keys;
  }
  }

/**

- Session Storage Backend Implementation
  */
  class SessionStorageBackend {
  async set(key, value) {
  try {
  sessionStorage.setItem(key, JSON.stringify(value));
  return true;
  } catch (error) {
  console.error(‘SessionStorage set failed:’, error);
  return false;
  }
  }
  
  async get(key) {
  try {
  const value = sessionStorage.getItem(key);
  return value ? JSON.parse(value) : null;
  } catch (error) {
  console.error(‘SessionStorage get failed:’, error);
  return null;
  }
  }
  
  async remove(key) {
  try {
  sessionStorage.removeItem(key);
  return true;
  } catch (error) {
  console.error(‘SessionStorage remove failed:’, error);
  return false;
  }
  }
  
  async clear(namespace) {
  try {
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && key.startsWith(namespace + ‘:’)) {
  keysToRemove.push(key);
  }
  }
  
  ```
       keysToRemove.forEach(key => sessionStorage.removeItem(key));
       return true;
   } catch (error) {
       console.error('SessionStorage clear failed:', error);
       return false;
   }
  ```
  
  }
  
  async keys(namespace) {
  const keys = [];
  try {
  for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && key.startsWith(namespace + ‘:’)) {
  keys.push(key);
  }
  }
  } catch (error) {
  console.error(‘SessionStorage keys failed:’, error);
  }
  return keys;
  }
  }

/**

- IndexedDB Backend Implementation
  */
  class IndexedDBBackend {
  constructor() {
  this.dbName = ‘GalaxStorage’;
  this.dbVersion = 1;
  this.objectStoreName = ‘keyValueStore’;
  this.db = null;
  }
  
  async initDB() {
  if (this.db) return this.db;
  
  ```
   return new Promise((resolve, reject) => {
       const request = indexedDB.open(this.dbName, this.dbVersion);
  
       request.onerror = () => reject(request.error);
       request.onsuccess = () => {
           this.db = request.result;
           resolve(this.db);
       };
  
       request.onupgradeneeded = (event) => {
           const db = event.target.result;
           if (!db.objectStoreNames.contains(this.objectStoreName)) {
               db.createObjectStore(this.objectStoreName);
           }
       };
   });
  ```
  
  }
  
  async set(key, value) {
  try {
  const db = await this.initDB();
  const transaction = db.transaction([this.objectStoreName], ‘readwrite’);
  const store = transaction.objectStore(this.objectStoreName);
  
  ```
       return new Promise((resolve, reject) => {
           const request = store.put(value, key);
           request.onsuccess = () => resolve(true);
           request.onerror = () => reject(request.error);
       });
   } catch (error) {
       console.error('IndexedDB set failed:', error);
       return false;
   }
  ```
  
  }
  
  async get(key) {
  try {
  const db = await this.initDB();
  const transaction = db.transaction([this.objectStoreName], ‘readonly’);
  const store = transaction.objectStore(this.objectStoreName);
  
  ```
       return new Promise((resolve, reject) => {
           const request = store.get(key);
           request.onsuccess = () => resolve(request.result || null);
           request.onerror = () => reject(request.error);
       });
   } catch (error) {
       console.error('IndexedDB get failed:', error);
       return null;
   }
  ```
  
  }
  
  async remove(key) {
  try {
  const db = await this.initDB();
  const transaction = db.transaction([this.objectStoreName], ‘readwrite’);
  const store = transaction.objectStore(this.objectStoreName);
  
  ```
       return new Promise((resolve, reject) => {
           const request = store.delete(key);
           request.onsuccess = () => resolve(true);
           request.onerror = () => reject(request.error);
       });
   } catch (error) {
       console.error('IndexedDB remove failed:', error);
       return false;
   }
  ```
  
  }
  
  async clear(namespace) {
  try {
  const keys = await this.keys(namespace);
  const promises = keys.map(key => this.remove(key));
  await Promise.all(promises);
  return true;
  } catch (error) {
  console.error(‘IndexedDB clear failed:’, error);
  return false;
  }
  }
  
  async keys(namespace) {
  try {
  const db = await this.initDB();
  const transaction = db.transaction([this.objectStoreName], ‘readonly’);
  const store = transaction.objectStore(this.objectStoreName);
  
  ```
       return new Promise((resolve, reject) => {
           const keys = [];
           const request = store.openCursor();
           
           request.onsuccess = (event) => {
               const cursor = event.target.result;
               if (cursor) {
                   if (cursor.key.startsWith(namespace + ':')) {
                       keys.push(cursor.key);
                   }
                   cursor.continue();
               } else {
                   resolve(keys);
               }
           };
           
           request.onerror = () => reject(request.error);
       });
   } catch (error) {
       console.error('IndexedDB keys failed:', error);
       return [];
   }
  ```
  
  }
  }

/**

- Memory Backend Implementation (Fallback)
  */
  class MemoryBackend {
  constructor() {
  this.storage = new Map();
  }
  
  async set(key, value) {
  this.storage.set(key, JSON.stringify(value));
  return true;
  }
  
  async get(key) {
  const value = this.storage.get(key);
  return value ? JSON.parse(value) : null;
  }
  
  async remove(key) {
  return this.storage.delete(key);
  }
  
  async clear(namespace) {
  const keysToDelete = [];
  for (const key of this.storage.keys()) {
  if (key.startsWith(namespace + ‘:’)) {
  keysToDelete.push(key);
  }
  }
  
  ```
   keysToDelete.forEach(key => this.storage.delete(key));
   return true;
  ```
  
  }
  
  async keys(namespace) {
  const keys = [];
  for (const key of this.storage.keys()) {
  if (key.startsWith(namespace + ‘:’)) {
  keys.push(key);
  }
  }
  return keys;
  }
  }

// Create global storage manager instance
const storageManager = new StorageManager();

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { StorageManager, storageManager };
} else if (typeof window !== ‘undefined’) {
window.StorageManager = StorageManager;
window.storageManager = storageManager;
}
