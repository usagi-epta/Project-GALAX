/**
 * Games Tab Component
 * Integrates sprite animation directly into the Games tab
 */

class GamesTabManager {
    constructor() {
        this.spriteManager = null;
        this.currentView = 'list'; // 'list' or 'sprite'
        this.isInitialized = false;
        
        this.initialize();
    }

    /**
     * Initialize the Games tab
     */
    initialize() {
        this.createGamesInterface();
        this.bindEvents();
        this.isInitialized = true;
        
        console.log('Games Tab Manager initialized');
    }

    /**
     * Create the enhanced Games tab interface
     */
    createGamesInterface() {
        const gamesContent = document.getElementById('gamesContent');
        if (!gamesContent) return;

        // Check if we're on desktop or mobile
        const isDesktop = window.ResponsiveUtils?.isDesktop() || window.innerWidth >= 1024;

        if (isDesktop) {
            this.createDesktopGamesInterface(gamesContent);
        } else {
            this.createMobileGamesInterface(gamesContent);
        }
    }

    /**
     * Create desktop optimized Games interface
     */
    createDesktopGamesInterface(container) {
        container.innerHTML = `
            <div class="games-container">
                <div class="games-main">
                    <div class="games-header">
                        <h3>Interactive Sprite Animation</h3>
                        <p>Explore the LPC character animation system with full desktop controls</p>
                    </div>
                    
                    <div class="sprite-viewer" id="desktopSpriteViewer">
                        <div class="sprite-placeholder">
                            <div class="placeholder-icon">🎮</div>
                            <p>Click "Start Animation" to begin</p>
                        </div>
                    </div>
                    
                    <div class="games-info">
                        <h4>Features</h4>
                        <ul>
                            <li>15 different character animations</li>
                            <li>14 layered sprite components</li>
                            <li>Real-time animation control</li>
                            <li>Pixel-perfect rendering</li>
                        </ul>
                    </div>
                </div>
                
                <div class="games-sidebar">
                    <div class="sprite-controls" id="desktopSpriteControls">
                        <div class="control-group">
                            <label for="animationSelect">Animation:</label>
                            <select id="animationSelect" disabled>
                                <option value="">Select animation...</option>
                                <option value="idle">Idle</option>
                                <option value="walk">Walk</option>
                                <option value="run">Run</option>
                                <option value="spellcast">Spellcast</option>
                                <option value="thrust">Thrust</option>
                                <option value="slash">Slash</option>
                                <option value="shoot">Shoot</option>
                                <option value="hurt">Hurt</option>
                                <option value="climb">Climb</option>
                                <option value="jump">Jump</option>
                                <option value="sit">Sit</option>
                                <option value="emote">Emote</option>
                                <option value="combat_idle">Combat Idle</option>
                                <option value="backslash">Backslash</option>
                                <option value="halfslash">Halfslash</option>
                            </select>
                        </div>
                        
                        <div class="control-group">
                            <label for="speedControl">Speed (ms):</label>
                            <input type="range" id="speedControl" min="50" max="500" value="150" disabled>
                            <span id="speedValue">150ms</span>
                        </div>
                        
                        <div class="control-buttons">
                            <button class="control-btn" id="startBtn" onclick="GamesTab.startSprite()">Start Animation</button>
                            <button class="control-btn" id="playBtn" onclick="GamesTab.playPause()" disabled>Play</button>
                            <button class="control-btn" id="resetBtn" onclick="GamesTab.reset()" disabled>Reset</button>
                        </div>
                        
                        <div class="animation-info">
                            <h4>Animation Info</h4>
                            <div id="animationDetails">
                                <p>Frame: <span id="currentFrame">-</span></p>
                                <p>Total Frames: <span id="totalFrames">-</span></p>
                                <p>Status: <span id="animationStatus">Stopped</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create mobile optimized Games interface
     */
    createMobileGamesInterface(container) {
        container.innerHTML = `
            <div class="games-section">
                <h3>Community Games</h3>
                
                <div class="game-item sprite-game-item">
                    <div class="game-icon">🎮</div>
                    <div class="game-info">
                        <div class="game-name">Sprite Animation Demo</div>
                        <div class="game-desc">LPC character animation system • 15 animations</div>
                    </div>
                    <button class="game-btn" onclick="GamesTab.launchMobileSprite()">Play</button>
                </div>
                
                <div class="game-item">
                    <div class="game-icon">🎯</div>
                    <div class="game-info">
                        <div class="game-name">Code Challenge</div>
                        <div class="game-desc">Daily programming puzzles • 45 participants today</div>
                    </div>
                    <button class="game-btn">Coming Soon</button>
                </div>
                
                <div class="game-item">
                    <div class="game-icon">🧩</div>
                    <div class="game-info">
                        <div class="game-name">Pixel Art Creator</div>
                        <div class="game-desc">Create characters using LPC sprites</div>
                    </div>
                    <button class="game-btn">Coming Soon</button>
                </div>
            </div>
        `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for layout changes
        window.addEventListener('layoutChange', (e) => {
            this.handleLayoutChange(e.detail);
        });

        // Listen for tab switches
        document.addEventListener('tabSwitch', (e) => {
            if (e.detail.tab === 'games') {
                this.onTabActivated();
            } else {
                this.onTabDeactivated();
            }
        });
    }

    /**
     * Handle responsive layout changes
     */
    handleLayoutChange(deviceInfo) {
        if (this.isInitialized) {
            this.createGamesInterface();
            
            // Restart sprite if it was active
            if (this.spriteManager && this.currentView === 'sprite') {
                setTimeout(() => this.startSprite(), 100);
            }
        }
    }

    /**
     * Called when Games tab is activated
     */
    onTabActivated() {
        // Update content title for desktop
        const contentTitle = document.getElementById('contentTitle');
        if (contentTitle) {
            contentTitle.textContent = 'Games';
        }
    }

    /**
     * Called when Games tab is deactivated
     */
    onTabDeactivated() {
        // Clean up sprite animation if running
        if (this.spriteManager) {
            this.cleanupSprite();
        }
    }

    /**
     * Start sprite animation (desktop)
     */
    async startSprite() {
        const viewer = document.getElementById('desktopSpriteViewer');
        if (!viewer) return;

        try {
            // Clear placeholder
            viewer.innerHTML = '';
            
            // Create canvas for sprite
            const canvas = document.createElement('canvas');
            canvas.id = 'gamesTabCanvas';
            canvas.width = 256;
            canvas.height = 256;
            canvas.style.cssText = `
                width: 100%;
                height: 100%;
                max-width: 300px;
                max-height: 300px;
                background: #f0f0f0;
                border-radius: 10px;
                image-rendering: pixelated;
                image-rendering: -moz-crisp-edges;
                image-rendering: crisp-edges;
            `;
            
            viewer.appendChild(canvas);

            // Initialize sprite manager
            this.spriteManager = new SpriteAnimationManager();
            this.spriteManager.canvas = canvas;
            this.spriteManager.ctx = canvas.getContext('2d');
            this.spriteManager.ctx.imageSmoothingEnabled = false;
            
            // Load sprites and start
            await this.spriteManager.loadSprites();
            this.spriteManager.startAnimationLoop();
            this.spriteManager.playAnimation('idle');

            // Enable controls
            this.enableControls();
            this.updateAnimationInfo();

            this.currentView = 'sprite';

        } catch (error) {
            console.error('Failed to start sprite animation:', error);
            viewer.innerHTML = `
                <div class="error-message">
                    <div>❌</div>
                    <p>Failed to load sprite animation</p>
                    <button onclick="GamesTab.startSprite()">Try Again</button>
                </div>
            `;
        }
    }

    /**
     * Launch mobile sprite viewer
     */
    launchMobileSprite() {
        // Create fullscreen sprite viewer for mobile
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-sprite';
        overlay.innerHTML = `
            <div class="mobile-sprite-header">
                <h3>Sprite Animation</h3>
                <button onclick="GamesTab.closeMobileSprite()" class="close-btn">✕</button>
            </div>
            
            <div class="sprite-canvas" id="mobileSpriteCanvas">
                <div class="loading">Loading sprites...</div>
            </div>
            
            <div class="mobile-controls">
                <div class="control-row">
                    <label>Animation:</label>
                    <select id="mobileAnimSelect">
                        <option value="idle">Idle</option>
                        <option value="walk">Walk</option>
                        <option value="run">Run</option>
                        <option value="spellcast">Spellcast</option>
                        <option value="thrust">Thrust</option>
                        <option value="slash">Slash</option>
                    </select>
                </div>
                
                <div class="control-row">
                    <button onclick="GamesTab.mobilePlayPause()" id="mobilePlayBtn">Pause</button>
                    <button onclick="GamesTab.mobileReset()">Reset</button>
                    <button onclick="GamesTab.closeMobileSprite()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Initialize mobile sprite
        setTimeout(async () => {
            const canvasContainer = document.getElementById('mobileSpriteCanvas');
            
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                canvas.style.cssText = `
                    width: 100%;
                    height: 100%;
                    background: #f0f0f0;
                    border-radius: 10px;
                    image-rendering: pixelated;
                `;
                
                canvasContainer.innerHTML = '';
                canvasContainer.appendChild(canvas);

                this.spriteManager = new SpriteAnimationManager();
                this.spriteManager.canvas = canvas;
                this.spriteManager.ctx = canvas.getContext('2d');
                this.spriteManager.ctx.imageSmoothingEnabled = false;
                
                await this.spriteManager.loadSprites();
                this.spriteManager.startAnimationLoop();
                this.spriteManager.playAnimation('walk');

                // Bind mobile controls
                document.getElementById('mobileAnimSelect').addEventListener('change', (e) => {
                    this.spriteManager.playAnimation(e.target.value);
                });

            } catch (error) {
                canvasContainer.innerHTML = '<div class="error">Failed to load sprites</div>';
            }
        }, 100);
    }

    /**
     * Close mobile sprite viewer
     */
    closeMobileSprite() {
        const overlay = document.querySelector('.fullscreen-sprite');
        if (overlay) {
            overlay.remove();
        }
        this.cleanupSprite();
    }

    /**
     * Play/pause animation
     */
    playPause() {
        if (!this.spriteManager) return;

        if (this.spriteManager.isPlaying) {
            this.spriteManager.pause();
            document.getElementById('playBtn').textContent = 'Play';
            document.getElementById('animationStatus').textContent = 'Paused';
        } else {
            this.spriteManager.play();
            document.getElementById('playBtn').textContent = 'Pause';
            document.getElementById('animationStatus').textContent = 'Playing';
        }
    }

    /**
     * Mobile play/pause
     */
    mobilePlayPause() {
        if (!this.spriteManager) return;

        const btn = document.getElementById('mobilePlayBtn');
        if (this.spriteManager.isPlaying) {
            this.spriteManager.pause();
            btn.textContent = 'Play';
        } else {
            this.spriteManager.play();
            btn.textContent = 'Pause';
        }
    }

    /**
     * Reset animation
     */
    reset() {
        if (this.spriteManager) {
            this.spriteManager.reset();
            this.updateAnimationInfo();
        }
    }

    /**
     * Mobile reset
     */
    mobileReset() {
        if (this.spriteManager) {
            this.spriteManager.reset();
        }
    }

    /**
     * Enable desktop controls
     */
    enableControls() {
        const animSelect = document.getElementById('animationSelect');
        const speedControl = document.getElementById('speedControl');
        const playBtn = document.getElementById('playBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (animSelect) {
            animSelect.disabled = false;
            animSelect.addEventListener('change', (e) => {
                if (this.spriteManager && e.target.value) {
                    this.spriteManager.playAnimation(e.target.value);
                    this.updateAnimationInfo();
                }
            });
        }

        if (speedControl) {
            speedControl.disabled = false;
            speedControl.addEventListener('input', (e) => {
                if (this.spriteManager) {
                    this.spriteManager.animationSpeed = parseInt(e.target.value);
                    document.getElementById('speedValue').textContent = e.target.value + 'ms';
                }
            });
        }

        if (playBtn) playBtn.disabled = false;
        if (resetBtn) resetBtn.disabled = false;
    }

    /**
     * Update animation info display
     */
    updateAnimationInfo() {
        if (!this.spriteManager) return;

        const currentFrame = document.getElementById('currentFrame');
        const totalFrames = document.getElementById('totalFrames');
        const status = document.getElementById('animationStatus');

        if (currentFrame) {
            currentFrame.textContent = this.spriteManager.animationFrame + 1;
        }

        if (totalFrames && this.spriteManager.currentAnimation) {
            const animData = this.spriteManager.animations[this.spriteManager.currentAnimation];
            totalFrames.textContent = animData ? animData.frames : '-';
        }

        if (status) {
            status.textContent = this.spriteManager.isPlaying ? 'Playing' : 'Paused';
        }

        // Update info periodically
        if (this.spriteManager.isPlaying) {
            setTimeout(() => this.updateAnimationInfo(), 100);
        }
    }

    /**
     * Clean up sprite manager
     */
    cleanupSprite() {
        if (this.spriteManager) {
            this.spriteManager.isPlaying = false;
            this.spriteManager = null;
        }
        this.currentView = 'list';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.GamesTab = new GamesTabManager();
});

// Export for global access
window.GamesTabManager = GamesTabManager;