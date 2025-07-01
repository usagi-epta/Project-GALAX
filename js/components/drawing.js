/**

- Drawing Component
- Handles drawing canvas functionality for sketch sharing in chats
  */

class DrawingManager {
constructor() {
this.isDrawing = false;
this.lastX = 0;
this.lastY = 0;
this.canvas = null;
this.ctx = null;
this.currentColor = ‘#4ecdc4’;
this.currentBrushSize = 2;
this.drawingHistory = [];
this.maxHistorySize = 20;

```
    this.bindEventHandlers();
}

/**
 * Bind event handlers to maintain context
 * @private
 */
bindEventHandlers() {
    this.toggle = this.toggle.bind(this);
    this.close = this.close.bind(this);
    this.send = this.send.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
}

/**
 * Toggle drawing modal visibility
 */
toggle() {
    const modal = document.getElementById('drawingModal');
    if (!modal) {
        console.error('Drawing modal not found');
        return;
    }

    if (modal.style.display === 'none' || !modal.style.display) {
        this.show();
    } else {
        this.close();
    }
}

/**
 * Show drawing modal and initialize canvas
 * @private
 */
show() {
    const modal = document.getElementById('drawingModal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.add('modal-enter');
    
    // Initialize canvas after modal is shown
    setTimeout(() => {
        this.initializeCanvas();
        modal.classList.remove('modal-enter');
    }, 50);

    // Update state
    if (window.stateManager) {
        window.stateManager.setState('ui.modals.drawing', true);
    }
}

/**
 * Close drawing modal
 */
close() {
    const modal = document.getElementById('drawingModal');
    if (!modal) return;

    modal.classList.add('modal-exit');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('modal-exit');
        this.cleanup();
    }, 300);

    // Update state
    if (window.stateManager) {
        window.stateManager.setState('ui.modals.drawing', false);
    }
}

/**
 * Initialize drawing canvas
 * @private
 */
initializeCanvas() {
    this.canvas = document.getElementById('drawingCanvas');
    if (!this.canvas) {
        console.error('Drawing canvas not found');
        return;
    }

    // Set canvas size
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight || 250;
    
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvasProperties();
    this.setupEventListeners();
    this.setupDrawingTools();
}

/**
 * Setup canvas rendering properties
 * @private
 */
setupCanvasProperties() {
    if (!this.ctx) return;

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentBrushSize;
    
    // Clear canvas with white background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

/**
 * Setup canvas event listeners
 * @private
 */
setupEventListeners() {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseout', this.handleMouseUp);

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd);
}

/**
 * Setup drawing tools event listeners
 * @private
 */
setupDrawingTools() {
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');

    if (colorPicker) {
        colorPicker.value = this.currentColor;
        colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
            if (this.ctx) {
                this.ctx.strokeStyle = this.currentColor;
            }
        });
    }

    if (brushSize) {
        brushSize.value = this.currentBrushSize;
        brushSize.addEventListener('change', (e) => {
            this.currentBrushSize = parseInt(e.target.value);
            if (this.ctx) {
                this.ctx.lineWidth = this.currentBrushSize;
            }
        });
    }
}

/**
 * Handle mouse down event
 * @private
 * @param {MouseEvent} e - Mouse event
 */
handleMouseDown(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
    
    this.saveDrawingState();
}

/**
 * Handle mouse move event
 * @private
 * @param {MouseEvent} e - Mouse event
 */
handleMouseMove(e) {
    if (!this.isDrawing || !this.ctx) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    this.drawLine(this.lastX, this.lastY, currentX, currentY);
    
    this.lastX = currentX;
    this.lastY = currentY;
}

/**
 * Handle mouse up event
 * @private
 */
handleMouseUp() {
    this.isDrawing = false;
}

/**
 * Handle touch start event
 * @private
 * @param {TouchEvent} e - Touch event
 */
handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    
    this.isDrawing = true;
    this.lastX = touch.clientX - rect.left;
    this.lastY = touch.clientY - rect.top;
    
    this.saveDrawingState();
}

/**
 * Handle touch move event
 * @private
 * @param {TouchEvent} e - Touch event
 */
handleTouchMove(e) {
    e.preventDefault();
    if (!this.isDrawing || !this.ctx) return;

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    this.drawLine(this.lastX, this.lastY, currentX, currentY);
    
    this.lastX = currentX;
    this.lastY = currentY;
}

/**
 * Handle touch end event
 * @private
 */
handleTouchEnd(e) {
    e.preventDefault();
    this.isDrawing = false;
}

/**
 * Draw line between two points
 * @private
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 */
drawLine(x1, y1, x2, y2) {
    if (!this.ctx) return;

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
}

/**
 * Clear the entire canvas
 */
clearCanvas() {
    if (!this.ctx || !this.canvas) return;

    this.saveDrawingState();
    
    // Clear with white background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Reset stroke style
    this.ctx.strokeStyle = this.currentColor;
}

/**
 * Save current drawing state for undo functionality
 * @private
 */
saveDrawingState() {
    if (!this.canvas) return;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.drawingHistory.push(imageData);

    // Limit history size
    if (this.drawingHistory.length > this.maxHistorySize) {
        this.drawingHistory.shift();
    }
}

/**
 * Undo last drawing action
 */
undo() {
    if (this.drawingHistory.length > 0 && this.ctx) {
        const previousState = this.drawingHistory.pop();
        this.ctx.putImageData(previousState, 0, 0);
    }
}

/**
 * Send drawing as message
 */
send() {
    if (!this.canvas) {
        console.error('Canvas not available');
        return;
    }

    try {
        // Convert canvas to data URL
        const dataURL = this.canvas.toDataURL('image/png');
        
        // Create image message
        this.sendDrawingMessage(dataURL);
        
        // Close modal
        this.close();
        
    } catch (error) {
        console.error('Failed to send drawing:', error);
        this.showError('Failed to send drawing. Please try again.');
    }
}

/**
 * Send drawing as chat message
 * @private
 * @param {string} dataURL - Canvas data URL
 */
sendDrawingMessage(dataURL) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message own';
    messageDiv.innerHTML = `
        <div class="message-bubble">
            🎨 Quick sketch
            <div style="margin-top: 10px;">
                <img src="${dataURL}" style="max-width: 200px; border-radius: 8px; cursor: pointer;" onclick="this.style.maxWidth = this.style.maxWidth === '200px' ? '100%' : '200px'">
            </div>
            <div class="message-status">✓</div>
        </div>
    `;
    
    // Add animation
    messageDiv.classList.add('message-send');
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Update chat state if available
    if (window.chatManager) {
        const message = {
            id: `draw_${Date.now()}`,
            sender: this.getCurrentUser(),
            recipient: window.chatManager.currentChat,
            content: dataURL,
            timestamp: Date.now(),
            type: 'drawing',
            status: 'sent'
        };
        
        window.chatManager.updateChatState(message);
    }
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
 * Show error message
 * @private
 * @param {string} message - Error message
 */
showError(message) {
    // Create simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

/**
 * Save drawing to device (download)
 */
saveDrawing() {
    if (!this.canvas) return;

    try {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `galax-sketch-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    } catch (error) {
        console.error('Failed to save drawing:', error);
        this.showError('Failed to save drawing');
    }
}

/**
 * Load drawing from file
 */
loadDrawing() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    if (this.ctx && this.canvas) {
                        this.clearCanvas();
                        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

/**
 * Cleanup drawing resources
 * @private
 */
cleanup() {
    if (this.canvas) {
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseout', this.handleMouseUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }
    
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
}

/**
 * Get drawing manager status
 * @returns {Object} Status information
 */
getStatus() {
    return {
        isActive: this.canvas !== null,
        isDrawing: this.isDrawing,
        historyLength: this.drawingHistory.length,
        currentColor: this.currentColor,
        currentBrushSize: this.currentBrushSize
    };
}
```

}

// Create global drawing manager instance
const drawingManager = new DrawingManager();

// Create Drawing namespace for global access
window.Drawing = {
toggle: drawingManager.toggle,
close: drawingManager.close,
send: drawingManager.send,
clearCanvas: drawingManager.clearCanvas,
undo: () => drawingManager.undo(),
save: () => drawingManager.saveDrawing(),
load: () => drawingManager.loadDrawing()
};

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { DrawingManager, drawingManager };
} else if (typeof window !== ‘undefined’) {
window.DrawingManager = DrawingManager;
window.drawingManager = drawingManager;
}
