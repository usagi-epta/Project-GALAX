/**
 * Sprite Animation System
 * Uses the LPC (Liberated Pixel Cup) sprite system for character animations
 */

class SpriteAnimationManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.sprites = new Map();
        this.currentAnimation = null;
        this.animationFrame = 0;
        this.animationSpeed = 150; // milliseconds per frame
        this.lastFrameTime = 0;
        this.isPlaying = false;
        this.spriteLayers = [];
        this.baseSpritePath = '/assets/sprites/';
        
        // Animation definitions based on the LPC sprite system
        this.animations = {
            // Standard animations with frame counts
            spellcast: { frames: 7, width: 448, height: 256 },
            thrust: { frames: 8, width: 512, height: 256 },
            walk: { frames: 9, width: 576, height: 256 },
            slash: { frames: 6, width: 384, height: 256 },
            shoot: { frames: 13, width: 832, height: 256 },
            hurt: { frames: 6, width: 384, height: 256 },
            climb: { frames: 6, width: 384, height: 256 },
            idle: { frames: 2, width: 128, height: 256 },
            jump: { frames: 5, width: 320, height: 256 },
            sit: { frames: 3, width: 192, height: 256 },
            emote: { frames: 3, width: 192, height: 256 },
            run: { frames: 8, width: 512, height: 256 },
            combat_idle: { frames: 2, width: 128, height: 256 },
            backslash: { frames: 13, width: 832, height: 256 },
            halfslash: { frames: 7, width: 448, height: 256 }
        };

        // Character layer definitions from character.json
        this.characterLayers = [
            { name: 'body', zpos: 10, file: 'body/teen_light.png' },
            { name: 'head', zpos: 100, file: 'head/human_female_small_light.png' },
            { name: 'hair', zpos: 115, file: 'hair/relm_xlong_rose.png' },
            { name: 'eyes', zpos: 120, file: 'eyes/red_neutral.png' },
            { name: 'ears', zpos: 105, file: 'ears/elven_light.png' },
            { name: 'horns', zpos: 110, file: 'horns/backwards_raven.png' },
            { name: 'wings', zpos: 8, file: 'wings/monarch_sky_rose_rose.png' },
            { name: 'shoes', zpos: 15, file: 'shoes/sandals_sky.png' },
            { name: 'clothes', zpos: 35, file: 'clothes/cardigan_blue_gray.png' },
            { name: 'overalls', zpos: 38, file: 'overalls/rose.png' },
            { name: 'bauldron', zpos: 65, file: 'bauldron/leather.png' },
            { name: 'necklace', zpos: 80, file: 'necklace/simple_brass.png' },
            { name: 'earrings', zpos: 81, file: 'earrings/moon_bronze.png' },
            { name: 'weapon', zpos: 145, file: 'weapon/dark_gnarled_staff.png' }
        ];

        this.initialize();
    }

    /**
     * Initialize the sprite animation system
     */
    async initialize() {
        try {
            await this.createCanvas();
            await this.loadSprites();
            this.setupControls();
            this.startAnimationLoop();
            
            console.log('Sprite Animation System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize sprite animation system:', error);
        }
    }

    /**
     * Create canvas element for sprite rendering
     */
    async createCanvas() {
        // Create canvas container
        const container = document.createElement('div');
        container.id = 'sprite-animation-container';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            z-index: 9999;
            border: 2px solid var(--primary);
        `;

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 256;  // 4x scale of 64px sprite
        this.canvas.height = 256;
        this.canvas.style.cssText = `
            background: #f0f0f0;
            border: 1px solid #ccc;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        `;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Preserve pixel art

        container.appendChild(this.canvas);
        document.body.appendChild(container);
    }

    /**
     * Load sprite images
     */
    async loadSprites() {
        const loadPromises = [];

        // Load sprites for each layer and animation
        for (const layer of this.characterLayers) {
            for (const [animName, animData] of Object.entries(this.animations)) {
                const spritePath = `${this.baseSpritePath}standard/${animName}/${layer.file}`;
                const spriteKey = `${layer.name}_${animName}`;

                loadPromises.push(
                    this.loadSpriteImage(spritePath, spriteKey, animData)
                );
            }
        }

        // Load custom oversized thrust animation
        const thrustOversizePath = `${this.baseSpritePath}custom/thrust_oversize/weapon/dark_gnarled_staff.png`;
        loadPromises.push(
            this.loadSpriteImage(thrustOversizePath, 'weapon_thrust_oversize', this.animations.thrust)
        );

        try {
            await Promise.all(loadPromises);
            console.log(`Loaded ${this.sprites.size} sprite images`);
        } catch (error) {
            console.warn('Some sprites failed to load:', error);
        }
    }

    /**
     * Load individual sprite image
     */
    async loadSpriteImage(path, key, animData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(key, {
                    image: img,
                    frameWidth: 64,
                    frameHeight: 64,
                    totalFrames: animData.frames,
                    framesPerRow: animData.frames,
                    directions: 4 // down, left, up, right
                });
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${path}`);
                resolve(); // Continue loading other sprites
            };
            img.src = path;
        });
    }

    /**
     * Setup animation controls
     */
    setupControls() {
        const container = document.getElementById('sprite-animation-container');
        
        // Create control panel
        const controls = document.createElement('div');
        controls.style.cssText = `
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            color: white;
        `;

        // Animation selector
        const animSelect = document.createElement('select');
        animSelect.style.cssText = `
            padding: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
            background: white;
        `;

        // Add animation options
        for (const animName of Object.keys(this.animations)) {
            const option = document.createElement('option');
            option.value = animName;
            option.textContent = animName.charAt(0).toUpperCase() + animName.slice(1);
            animSelect.appendChild(option);
        }

        animSelect.addEventListener('change', (e) => {
            this.playAnimation(e.target.value);
        });

        // Control buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        `;

        const playBtn = this.createButton('Play', () => this.play());
        const pauseBtn = this.createButton('Pause', () => this.pause());
        const resetBtn = this.createButton('Reset', () => this.reset());
        const closeBtn = this.createButton('Close', () => this.close());

        // Speed control
        const speedContainer = document.createElement('div');
        speedContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Speed: ';
        speedLabel.style.color = 'white';

        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '50';
        speedSlider.max = '500';
        speedSlider.value = this.animationSpeed;
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
        });

        // Assemble controls
        controls.appendChild(document.createTextNode('Animation: '));
        controls.appendChild(animSelect);
        controls.appendChild(buttonContainer);
        buttonContainer.appendChild(playBtn);
        buttonContainer.appendChild(pauseBtn);
        buttonContainer.appendChild(resetBtn);
        buttonContainer.appendChild(closeBtn);
        controls.appendChild(speedContainer);
        speedContainer.appendChild(speedLabel);
        speedContainer.appendChild(speedSlider);

        container.appendChild(controls);

        // Start with idle animation
        this.playAnimation('idle');
    }

    /**
     * Create styled button
     */
    createButton(text, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            background: var(--primary);
            color: white;
            cursor: pointer;
            font-size: 12px;
        `;
        btn.addEventListener('click', onClick);
        return btn;
    }

    /**
     * Play specific animation
     */
    playAnimation(animationName) {
        if (!this.animations[animationName]) {
            console.warn(`Animation '${animationName}' not found`);
            return;
        }

        this.currentAnimation = animationName;
        this.animationFrame = 0;
        this.isPlaying = true;
        
        console.log(`Playing animation: ${animationName}`);
    }

    /**
     * Control methods
     */
    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.animationFrame = 0;
    }

    close() {
        const container = document.getElementById('sprite-animation-container');
        if (container) {
            container.remove();
        }
    }

    /**
     * Main animation loop
     */
    startAnimationLoop() {
        const animate = (currentTime) => {
            if (this.isPlaying && this.currentAnimation) {
                if (currentTime - this.lastFrameTime >= this.animationSpeed) {
                    this.updateAnimation();
                    this.render();
                    this.lastFrameTime = currentTime;
                }
            } else if (this.currentAnimation) {
                this.render(); // Still render when paused
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    /**
     * Update animation frame
     */
    updateAnimation() {
        if (!this.currentAnimation) return;

        const animData = this.animations[this.currentAnimation];
        this.animationFrame = (this.animationFrame + 1) % animData.frames;
    }

    /**
     * Render current frame
     */
    render() {
        if (!this.currentAnimation) return;

        // Clear canvas
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sort layers by z-position
        const sortedLayers = [...this.characterLayers].sort((a, b) => a.zpos - b.zpos);

        // Render each layer
        for (const layer of sortedLayers) {
            const spriteKey = `${layer.name}_${this.currentAnimation}`;
            const sprite = this.sprites.get(spriteKey);

            if (sprite) {
                this.renderSprite(sprite, layer.name);
            }
        }

        // Draw frame info
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, 200, 60);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Animation: ${this.currentAnimation}`, 5, 15);
        this.ctx.fillText(`Frame: ${this.animationFrame + 1}/${this.animations[this.currentAnimation].frames}`, 5, 30);
        this.ctx.fillText(`Speed: ${this.animationSpeed}ms`, 5, 45);
    }

    /**
     * Render individual sprite layer
     */
    renderSprite(sprite, layerName) {
        const direction = 0; // Down direction (0=down, 1=left, 2=up, 3=right)
        const scale = 4; // 4x scale for visibility
        
        // Calculate source coordinates
        const srcX = this.animationFrame * sprite.frameWidth;
        const srcY = direction * sprite.frameHeight;
        
        // Calculate destination coordinates (centered)
        const dstX = (this.canvas.width - sprite.frameWidth * scale) / 2;
        const dstY = (this.canvas.height - sprite.frameHeight * scale) / 2;

        // Draw sprite frame
        this.ctx.drawImage(
            sprite.image,
            srcX, srcY, sprite.frameWidth, sprite.frameHeight,
            dstX, dstY, sprite.frameWidth * scale, sprite.frameHeight * scale
        );
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add button to main interface to launch sprite animation demo
    const launchBtn = document.createElement('button');
    launchBtn.textContent = 'Launch Sprite Animation Demo';
    launchBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 15px;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 10000;
        font-size: 14px;
    `;
    
    launchBtn.addEventListener('click', () => {
        // Close existing demo if open
        const existing = document.getElementById('sprite-animation-container');
        if (existing) {
            existing.remove();
        }
        
        // Create new sprite animation demo
        new SpriteAnimationManager();
    });

    document.body.appendChild(launchBtn);
});

// Export for global access
window.SpriteAnimationManager = SpriteAnimationManager;

// Integration helper for main application
window.SpriteDemo = {
    launch() {
        // Close existing demo if open
        const existing = document.getElementById('sprite-animation-container');
        if (existing) {
            existing.remove();
        }
        
        // Create new sprite animation demo
        try {
            new SpriteAnimationManager();
        } catch (error) {
            console.error('Failed to launch sprite demo:', error);
            // Show user-friendly error
            window.Notifications?.show?.('Failed to load sprite animation demo', 'error');
        }
    }
};