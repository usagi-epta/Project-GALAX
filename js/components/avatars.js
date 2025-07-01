/**

- Avatar Management Component
- Handles pixel art avatar creation, selection, and rendering
  */

class AvatarManager {
constructor() {
this.selectedAvatar = 1;
this.avatarColors = [
{ primary: ‘#ff6b47’, secondary: ‘#ff4500’, accent: ‘#ffff00’ },
{ primary: ‘#ff8a80’, secondary: ‘#ff5722’, accent: ‘#ffffff’ },
{ primary: ‘#d4c5a9’, secondary: ‘#8d6e63’, accent: ‘#000000’ },
{ primary: ‘#ffd54f’, secondary: ‘#ff9800’, accent: ‘#000000’ }
];

```
    this.pixelPatterns = this.definePixelPatterns();
    this.avatarLayers = [];
    this.renderingMethod = 'auto';
    
    this.bindEventHandlers();
}

/**
 * Define pixel art patterns for character creation
 * @private
 * @returns {Object} Pixel patterns for different avatar parts
 */
definePixelPatterns() {
    return {
        head: [
            [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,2,1,1,1,1,1,1,2,2,1,1],
            [1,1,2,2,1,1,1,1,1,1,2,2,1,1],
            [1,1,1,1,1,1,2,2,1,1,1,1,1,1],
            [1,1,1,1,1,2,2,2,2,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,0,0]
        ],
        body: [
            [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,1,1,0,0,0,0,1,1,0,0,0],
            [0,0,0,1,1,0,0,0,0,1,1,0,0,0]
        ]
    };
}

/**
 * Bind event handlers for avatar interactions
 * @private
 */
bindEventHandlers() {
    this.selectPixelAvatar = this.selectPixelAvatar.bind(this);
    this.initializeAvatars = this.initializeAvatars.bind(this);
}

/**
 * Initialize avatar system and render avatars
 * @param {HTMLElement} container - Container element for avatars
 */
async initializeAvatars(container) {
    if (!container) {
        console.error('Avatar container not found');
        return;
    }

    container.innerHTML = '';
    
    // Determine optimal rendering method
    this.renderingMethod = this.determineRenderingMethod();
    
    try {
        switch (this.renderingMethod) {
            case 'konva':
                await this.initializeKonvaAvatars(container);
                break;
            case 'canvas':
                this.initializeCanvasAvatars(container);
                break;
            default:
                this.initializeFallbackAvatars(container);
        }
    } catch (error) {
        console.warn('Primary avatar rendering failed, using fallback:', error);
        this.initializeFallbackAvatars(container);
    }
}

/**
 * Determine optimal rendering method based on available capabilities
 * @private
 * @returns {string} Rendering method
 */
determineRenderingMethod() {
    if (window.graphicsManager && window.graphicsManager.availableLibraries.konva) {
        return 'konva';
    }
    
    if (window.graphicsManager && window.graphicsManager.availableLibraries.canvas2D) {
        return 'canvas';
    }
    
    return 'fallback';
}

/**
 * Initialize avatars using Konva.js for enhanced graphics
 * @private
 * @param {HTMLElement} container - Container element
 */
async initializeKonvaAvatars(container) {
    if (!window.Konva) {
        throw new Error('Konva not available');
    }

    this.avatarColors.forEach((colors, index) => {
        const avatarContainer = document.createElement('div');
        avatarContainer.style.display = 'inline-block';
        avatarContainer.style.margin = '0 10px';
        container.appendChild(avatarContainer);

        const stage = new window.Konva.Stage({
            container: avatarContainer,
            width: 60,
            height: 80
        });

        const layer = new window.Konva.Layer();
        stage.add(layer);
        this.avatarLayers.push(layer);

        this.createPixelCharacterKonva(layer, colors, index + 1);
        
        stage.on('click tap', () => this.selectPixelAvatar(index + 1));
        
        // Add hover effects
        stage.container().style.cursor = 'pointer';
        stage.container().style.transition = 'transform 0.3s ease';
        
        stage.container().addEventListener('mouseenter', () => {
            stage.container().style.transform = 'scale(1.1)';
        });
        
        stage.container().addEventListener('mouseleave', () => {
            if (this.selectedAvatar !== index + 1) {
                stage.container().style.transform = 'scale(1)';
            }
        });
    });
}

/**
 * Create pixel art character using Konva
 * @private
 * @param {Object} layer - Konva layer
 * @param {Object} colors - Color scheme
 * @param {number} avatarId - Avatar identifier
 */
createPixelCharacterKonva(layer, colors, avatarId) {
    const pixelSize = 4;
    const colorMap = {
        0: 'transparent',
        1: colors.primary,
        2: colors.accent,
        3: colors.secondary
    };

    // Render head pattern
    this.pixelPatterns.head.forEach((row, y) => {
        row.forEach((pixel, x) => {
            if (pixel !== 0) {
                const rect = new window.Konva.Rect({
                    x: x * pixelSize,
                    y: y * pixelSize,
                    width: pixelSize,
                    height: pixelSize,
                    fill: colorMap[pixel],
                    strokeWidth: 0
                });
                layer.add(rect);
            }
        });
    });

    // Render body pattern with offset
    const bodyOffsetY = 36;
    this.pixelPatterns.body.forEach((row, y) => {
        row.forEach((pixel, x) => {
            if (pixel !== 0) {
                const rect = new window.Konva.Rect({
                    x: x * pixelSize,
                    y: bodyOffsetY + y * pixelSize,
                    width: pixelSize,
                    height: pixelSize,
                    fill: colorMap[pixel],
                    strokeWidth: 0
                });
                layer.add(rect);
            }
        });
    });

    // Add subtle breathing animation
    if (window.Konva.Tween) {
        const breathingAnimation = new window.Konva.Tween({
            node: layer,
            duration: 2,
            scaleY: 0.98,
            yoyo: true,
            repeat: -1,
            easing: window.Konva.Easings.EaseInOut
        });
        breathingAnimation.play();
    }

    layer.draw();
}

/**
 * Initialize avatars using Canvas 2D
 * @private
 * @param {HTMLElement} container - Container element
 */
initializeCanvasAvatars(container) {
    this.avatarColors.forEach((colors, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 80;
        canvas.className = 'pixel-avatar-canvas';
        canvas.id = `avatar-${index + 1}`;
        canvas.style.imageRendering = 'pixelated';
        canvas.style.cursor = 'pointer';
        canvas.style.transition = 'transform 0.3s ease';
        canvas.style.margin = '0 10px';
        
        container.appendChild(canvas);
        
        this.drawPixelCharacterCanvas(canvas, colors);
        
        canvas.addEventListener('click', () => this.selectPixelAvatar(index + 1));
        canvas.addEventListener('mouseenter', () => {
            if (this.selectedAvatar !== index + 1) {
                canvas.style.transform = 'scale(1.1)';
            }
        });
        canvas.addEventListener('mouseleave', () => {
            if (this.selectedAvatar !== index + 1) {
                canvas.style.transform = 'scale(1)';
            }
        });
    });
}

/**
 * Draw pixel character on canvas
 * @private
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} colors - Color scheme
 */
drawPixelCharacterCanvas(canvas, colors) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    const pixelSize = 4;
    const colorMap = {
        0: 'transparent',
        1: colors.primary,
        2: colors.accent,
        3: colors.secondary
    };

    // Draw head
    this.pixelPatterns.head.forEach((row, y) => {
        row.forEach((pixel, x) => {
            if (pixel !== 0) {
                ctx.fillStyle = colorMap[pixel];
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        });
    });

    // Draw body
    const bodyOffsetY = 36;
    this.pixelPatterns.body.forEach((row, y) => {
        row.forEach((pixel, x) => {
            if (pixel !== 0) {
                ctx.fillStyle = colorMap[pixel];
                ctx.fillRect(x * pixelSize, bodyOffsetY + y * pixelSize, pixelSize, pixelSize);
            }
        });
    });
}

/**
 * Initialize fallback avatars using CSS styling
 * @private
 * @param {HTMLElement} container - Container element
 */
initializeFallbackAvatars(container) {
    this.avatarColors.forEach((colors, index) => {
        const avatar = document.createElement('div');
        avatar.className = `pixel-avatar-fallback avatar-${index + 1}`;
        avatar.id = `avatar-${index + 1}`;
        avatar.onclick = () => this.selectPixelAvatar(index + 1);
        
        Object.assign(avatar.style, {
            background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
            width: '60px',
            height: '80px',
            margin: '0 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '2px solid rgba(255,255,255,0.3)',
            position: 'relative',
            display: 'inline-block',
            transition: 'transform 0.3s ease'
        });
        
        // Create simplified face representation
        const face = document.createElement('div');
        Object.assign(face.style, {
            position: 'absolute',
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '20px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '50%'
        });
        
        face.innerHTML = '<div style="position:absolute;top:5px;left:5px;width:3px;height:3px;background:#000;border-radius:50%"></div><div style="position:absolute;top:5px;right:5px;width:3px;height:3px;background:#000;border-radius:50%"></div>';
        
        avatar.appendChild(face);
        container.appendChild(avatar);
        
        avatar.addEventListener('mouseenter', () => {
            if (this.selectedAvatar !== index + 1) {
                avatar.style.transform = 'scale(1.1)';
            }
        });
        
        avatar.addEventListener('mouseleave', () => {
            if (this.selectedAvatar !== index + 1) {
                avatar.style.transform = 'scale(1)';
            }
        });
    });
}

/**
 * Select a pixel avatar and update visual state
 * @param {number} avatarId - Avatar identifier
 */
selectPixelAvatar(avatarId) {
    this.selectedAvatar = avatarId;
    
    // Update visual selection state
    this.updateAvatarSelection();
    
    // Update application state
    if (window.stateManager) {
        window.stateManager.setState('user.avatar', avatarId);
    }
    
    // Emit selection event
    this.emitAvatarSelectionEvent(avatarId);
}

/**
 * Update visual selection state for all avatars
 * @private
 */
updateAvatarSelection() {
    // Handle Konva avatars
    if (this.renderingMethod === 'konva') {
        document.querySelectorAll('.konvajs-content').forEach((canvas, index) => {
            const container = canvas.parentElement;
            if (index + 1 === this.selectedAvatar) {
                container.style.transform = 'scale(1.2)';
                container.style.filter = 'drop-shadow(0 0 20px rgba(255,255,255,0.8))';
            } else {
                container.style.transform = 'scale(1)';
                container.style.filter = 'none';
            }
        });
    }
    
    // Handle Canvas avatars
    if (this.renderingMethod === 'canvas') {
        document.querySelectorAll('.pixel-avatar-canvas').forEach((canvas, index) => {
            if (index + 1 === this.selectedAvatar) {
                canvas.style.transform = 'scale(1.2)';
                canvas.style.boxShadow = '0 0 20px rgba(255,255,255,0.8)';
            } else {
                canvas.style.transform = 'scale(1)';
                canvas.style.boxShadow = 'none';
            }
        });
    }
    
    // Handle fallback avatars
    document.querySelectorAll('.pixel-avatar-fallback').forEach((avatar, index) => {
        if (index + 1 === this.selectedAvatar) {
            avatar.style.transform = 'scale(1.2)';
            avatar.style.boxShadow = '0 0 20px rgba(255,255,255,0.8)';
        } else {
            avatar.style.transform = 'scale(1)';
            avatar.style.boxShadow = 'none';
        }
    });
}

/**
 * Emit avatar selection event
 * @private
 * @param {number} avatarId - Selected avatar ID
 */
emitAvatarSelectionEvent(avatarId) {
    const event = new CustomEvent('avatarSelected', {
        detail: {
            avatarId,
            colors: this.avatarColors[avatarId - 1],
            timestamp: Date.now()
        }
    });
    
    document.dispatchEvent(event);
}

/**
 * Get avatar color scheme by ID
 * @param {number} avatarId - Avatar identifier
 * @returns {Object|null} Color scheme object
 */
getAvatarColors(avatarId) {
    if (avatarId >= 1 && avatarId <= this.avatarColors.length) {
        return this.avatarColors[avatarId - 1];
    }
    return null;
}

/**
 * Update user avatar display elements
 * @param {number} avatarId - Avatar identifier
 */
updateUserAvatarDisplay(avatarId) {
    const colors = this.getAvatarColors(avatarId);
    if (!colors) return;

    // Update current avatar display
    const currentAvatarElement = document.getElementById('currentAvatar');
    if (currentAvatarElement) {
        currentAvatarElement.style.background = `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`;
    }

    // Update profile avatar
    const profileAvatarElement = document.getElementById('profileAvatar');
    if (profileAvatarElement) {
        profileAvatarElement.style.background = `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`;
    }

    // Update chat avatars
    document.querySelectorAll('.user-avatar').forEach(element => {
        element.style.background = `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`;
    });
}

/**
 * Create avatar element for chat or profile display
 * @param {number} avatarId - Avatar identifier
 * @param {Object} options - Creation options
 * @returns {HTMLElement} Avatar element
 */
createAvatarElement(avatarId, options = {}) {
    const config = {
        size: 40,
        className: 'avatar-element',
        showBorder: true,
        ...options
    };

    const colors = this.getAvatarColors(avatarId);
    if (!colors) return null;

    const avatarElement = document.createElement('div');
    avatarElement.className = config.className;
    
    Object.assign(avatarElement.style, {
        width: `${config.size}px`,
        height: `${config.size}px`,
        borderRadius: '50%',
        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
        border: config.showBorder ? '2px solid rgba(255,255,255,0.3)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    });

    return avatarElement;
}

/**
 * Get current selected avatar ID
 * @returns {number} Selected avatar ID
 */
getSelectedAvatar() {
    return this.selectedAvatar;
}

/**
 * Set selected avatar programmatically
 * @param {number} avatarId - Avatar identifier
 */
setSelectedAvatar(avatarId) {
    if (avatarId >= 1 && avatarId <= this.avatarColors.length) {
        this.selectPixelAvatar(avatarId);
    }
}

/**
 * Dispose of avatar resources
 */
dispose() {
    this.avatarLayers.forEach(layer => {
        if (layer.destroy) {
            layer.destroy();
        }
    });
    this.avatarLayers = [];
}
```

}

// Create global avatar manager instance
const avatarManager = new AvatarManager();

// Initialize avatars when DOM is ready
document.addEventListener(‘DOMContentLoaded’, () => {
const avatarContainer = document.getElementById(‘pixelAvatars’);
if (avatarContainer) {
avatarManager.initializeAvatars(avatarContainer);
}
});

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { AvatarManager, avatarManager };
} else if (typeof window !== ‘undefined’) {
window.AvatarManager = AvatarManager;
window.avatarManager = avatarManager;
}
