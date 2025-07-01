/**

- Graphics Utilities and Abstractions
- Provides unified interface for graphics operations across different libraries
  */

class GraphicsManager {
constructor() {
this.initialized = false;
this.availableLibraries = {};
this.activeRenderers = new Map();
this.canvasPool = new Map();
this.performanceMetrics = {
renderCalls: 0,
averageFrameTime: 0,
memoryUsage: 0
};

```
    this.initialize();
}

/**
 * Initialize graphics manager and detect available libraries
 */
async initialize() {
    try {
        // Wait for graphics loader to complete
        if (window.graphicsLoader) {
            await window.graphicsLoader.loadAll();
            this.availableLibraries = window.graphicsLoader.getCapabilities();
        }

        this.setupPerformanceMonitoring();
        this.initialized = true;
        
        console.log('Graphics Manager initialized with capabilities:', this.availableLibraries);
    } catch (error) {
        console.error('Graphics Manager initialization failed:', error);
    }
}

/**
 * Setup performance monitoring for graphics operations
 * @private
 */
setupPerformanceMonitoring() {
    if (typeof window !== 'undefined' && window.performance) {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000);
    }
}

/**
 * Update performance metrics
 * @private
 */
updatePerformanceMetrics() {
    if (window.performance.memory) {
        this.performanceMetrics.memoryUsage = window.performance.memory.usedJSHeapSize;
    }
    
    // Emit metrics to state manager if available
    if (window.stateManager) {
        window.stateManager.setState('system.graphics.performance', this.performanceMetrics);
    }
}

/**
 * Create a new graphics context based on requirements
 * @param {Object} options - Graphics context options
 * @returns {Object|null} Graphics context
 */
createContext(options = {}) {
    const config = {
        library: 'auto',
        container: null,
        width: 800,
        height: 600,
        transparent: false,
        antialias: true,
        preserveDrawingBuffer: false,
        ...options
    };

    if (config.library === 'auto') {
        config.library = this.selectOptimalLibrary(config);
    }

    switch (config.library) {
        case 'konva':
            return this.createKonvaContext(config);
        case 'pixi':
            return this.createPixiContext(config);
        case 'three':
            return this.createThreeContext(config);
        case 'canvas2d':
            return this.createCanvas2DContext(config);
        default:
            console.warn('No suitable graphics library available');
            return null;
    }
}

/**
 * Select optimal graphics library based on requirements
 * @private
 * @param {Object} config - Configuration object
 * @returns {string} Selected library name
 */
selectOptimalLibrary(config) {
    // For 3D content, prefer Three.js
    if (config.is3D && this.availableLibraries.threeJS) {
        return 'three';
    }

    // For complex 2D scenes with many objects, prefer PIXI
    if (config.complex2D && this.availableLibraries.pixi) {
        return 'pixi';
    }

    // For interactive 2D graphics, prefer Konva
    if (config.interactive && this.availableLibraries.konva) {
        return 'konva';
    }

    // Fallback to Canvas 2D
    return 'canvas2d';
}

/**
 * Create Konva graphics context
 * @private
 * @param {Object} config - Configuration object
 * @returns {Object|null} Konva context
 */
createKonvaContext(config) {
    if (!this.availableLibraries.konva || !window.Konva) {
        return null;
    }

    try {
        const stage = new window.Konva.Stage({
            container: config.container,
            width: config.width,
            height: config.height
        });

        const layer = new window.Konva.Layer();
        stage.add(layer);

        const context = {
            library: 'konva',
            stage,
            layer,
            width: config.width,
            height: config.height,
            
            // Unified interface methods
            clear: () => {
                layer.destroyChildren();
                layer.draw();
            },
            
            drawRect: (x, y, width, height, options = {}) => {
                const rect = new window.Konva.Rect({
                    x, y, width, height,
                    fill: options.fill || '#000000',
                    stroke: options.stroke,
                    strokeWidth: options.strokeWidth || 1
                });
                layer.add(rect);
                layer.draw();
                return rect;
            },
            
            drawCircle: (x, y, radius, options = {}) => {
                const circle = new window.Konva.Circle({
                    x, y, radius,
                    fill: options.fill || '#000000',
                    stroke: options.stroke,
                    strokeWidth: options.strokeWidth || 1
                });
                layer.add(circle);
                layer.draw();
                return circle;
            },
            
            drawText: (text, x, y, options = {}) => {
                const textNode = new window.Konva.Text({
                    x, y, text,
                    fontSize: options.fontSize || 16,
                    fontFamily: options.fontFamily || 'Arial',
                    fill: options.fill || '#000000'
                });
                layer.add(textNode);
                layer.draw();
                return textNode;
            },
            
            animate: (target, properties, duration = 1000) => {
                const tween = new window.Konva.Tween({
                    node: target,
                    duration: duration / 1000,
                    ...properties
                });
                tween.play();
                return tween;
            },
            
            destroy: () => {
                stage.destroy();
                this.activeRenderers.delete(context);
            }
        };

        this.activeRenderers.set(context, 'konva');
        return context;
        
    } catch (error) {
        console.error('Failed to create Konva context:', error);
        return null;
    }
}

/**
 * Create PIXI graphics context
 * @private
 * @param {Object} config - Configuration object
 * @returns {Object|null} PIXI context
 */
createPixiContext(config) {
    if (!this.availableLibraries.pixi || !window.PIXI) {
        return null;
    }

    try {
        const app = new window.PIXI.Application({
            width: config.width,
            height: config.height,
            transparent: config.transparent,
            antialias: config.antialias,
            preserveDrawingBuffer: config.preserveDrawingBuffer
        });

        if (config.container) {
            config.container.appendChild(app.view);
        }

        const context = {
            library: 'pixi',
            app,
            stage: app.stage,
            renderer: app.renderer,
            width: config.width,
            height: config.height,
            
            // Unified interface methods
            clear: () => {
                app.stage.removeChildren();
            },
            
            drawRect: (x, y, width, height, options = {}) => {
                const graphics = new window.PIXI.Graphics();
                if (options.fill) {
                    graphics.beginFill(parseInt(options.fill.replace('#', ''), 16));
                }
                if (options.stroke) {
                    graphics.lineStyle(options.strokeWidth || 1, parseInt(options.stroke.replace('#', ''), 16));
                }
                graphics.drawRect(x, y, width, height);
                graphics.endFill();
                app.stage.addChild(graphics);
                return graphics;
            },
            
            drawCircle: (x, y, radius, options = {}) => {
                const graphics = new window.PIXI.Graphics();
                if (options.fill) {
                    graphics.beginFill(parseInt(options.fill.replace('#', ''), 16));
                }
                if (options.stroke) {
                    graphics.lineStyle(options.strokeWidth || 1, parseInt(options.stroke.replace('#', ''), 16));
                }
                graphics.drawCircle(x, y, radius);
                graphics.endFill();
                app.stage.addChild(graphics);
                return graphics;
            },
            
            drawText: (text, x, y, options = {}) => {
                const textNode = new window.PIXI.Text(text, {
                    fontSize: options.fontSize || 16,
                    fontFamily: options.fontFamily || 'Arial',
                    fill: options.fill || '#000000'
                });
                textNode.x = x;
                textNode.y = y;
                app.stage.addChild(textNode);
                return textNode;
            },
            
            animate: (target, properties, duration = 1000) => {
                // Simple animation implementation
                const startTime = Date.now();
                const startProps = {};
                
                Object.keys(properties).forEach(key => {
                    startProps[key] = target[key];
                });
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    Object.keys(properties).forEach(key => {
                        const start = startProps[key];
                        const end = properties[key];
                        target[key] = start + (end - start) * progress;
                    });
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                
                requestAnimationFrame(animate);
            },
            
            destroy: () => {
                app.destroy(true);
                this.activeRenderers.delete(context);
            }
        };

        this.activeRenderers.set(context, 'pixi');
        return context;
        
    } catch (error) {
        console.error('Failed to create PIXI context:', error);
        return null;
    }
}

/**
 * Create Three.js graphics context
 * @private
 * @param {Object} config - Configuration object
 * @returns {Object|null} Three.js context
 */
createThreeContext(config) {
    if (!this.availableLibraries.threeJS || !window.THREE) {
        return null;
    }

    try {
        const scene = new window.THREE.Scene();
        const camera = new window.THREE.PerspectiveCamera(
            75, 
            config.width / config.height, 
            0.1, 
            1000
        );
        const renderer = new window.THREE.WebGLRenderer({
            antialias: config.antialias,
            alpha: config.transparent,
            preserveDrawingBuffer: config.preserveDrawingBuffer
        });

        renderer.setSize(config.width, config.height);
        
        if (config.container) {
            config.container.appendChild(renderer.domElement);
        }

        const context = {
            library: 'three',
            scene,
            camera,
            renderer,
            width: config.width,
            height: config.height,
            
            // Unified interface methods
            clear: () => {
                while (scene.children.length > 0) {
                    scene.remove(scene.children[0]);
                }
            },
            
            drawBox: (width, height, depth, options = {}) => {
                const geometry = new window.THREE.BoxGeometry(width, height, depth);
                const material = new window.THREE.MeshBasicMaterial({
                    color: options.color || 0x000000,
                    wireframe: options.wireframe || false
                });
                const mesh = new window.THREE.Mesh(geometry, material);
                scene.add(mesh);
                return mesh;
            },
            
            drawSphere: (radius, widthSegments = 32, heightSegments = 16, options = {}) => {
                const geometry = new window.THREE.SphereGeometry(radius, widthSegments, heightSegments);
                const material = new window.THREE.MeshBasicMaterial({
                    color: options.color || 0x000000,
                    wireframe: options.wireframe || false
                });
                const mesh = new window.THREE.Mesh(geometry, material);
                scene.add(mesh);
                return mesh;
            },
            
            addLight: (type = 'directional', options = {}) => {
                let light;
                switch (type) {
                    case 'directional':
                        light = new window.THREE.DirectionalLight(
                            options.color || 0xffffff,
                            options.intensity || 1
                        );
                        break;
                    case 'ambient':
                        light = new window.THREE.AmbientLight(
                            options.color || 0x404040,
                            options.intensity || 0.5
                        );
                        break;
                    default:
                        light = new window.THREE.DirectionalLight();
                }
                scene.add(light);
                return light;
            },
            
            render: () => {
                renderer.render(scene, camera);
            },
            
            animate: (callback) => {
                const animate = () => {
                    requestAnimationFrame(animate);
                    if (callback) callback();
                    renderer.render(scene, camera);
                };
                animate();
            },
            
            destroy: () => {
                renderer.dispose();
                this.activeRenderers.delete(context);
            }
        };

        this.activeRenderers.set(context, 'three');
        return context;
        
    } catch (error) {
        console.error('Failed to create Three.js context:', error);
        return null;
    }
}

/**
 * Create Canvas 2D graphics context
 * @private
 * @param {Object} config - Configuration object
 * @returns {Object|null} Canvas 2D context
 */
createCanvas2DContext(config) {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = config.width;
        canvas.height = config.height;
        
        if (config.container) {
            config.container.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');

        const context = {
            library: 'canvas2d',
            canvas,
            ctx,
            width: config.width,
            height: config.height,
            
            // Unified interface methods
            clear: () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            },
            
            drawRect: (x, y, width, height, options = {}) => {
                if (options.fill) {
                    ctx.fillStyle = options.fill;
                    ctx.fillRect(x, y, width, height);
                }
                if (options.stroke) {
                    ctx.strokeStyle = options.stroke;
                    ctx.lineWidth = options.strokeWidth || 1;
                    ctx.strokeRect(x, y, width, height);
                }
            },
            
            drawCircle: (x, y, radius, options = {}) => {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                
                if (options.fill) {
                    ctx.fillStyle = options.fill;
                    ctx.fill();
                }
                if (options.stroke) {
                    ctx.strokeStyle = options.stroke;
                    ctx.lineWidth = options.strokeWidth || 1;
                    ctx.stroke();
                }
            },
            
            drawText: (text, x, y, options = {}) => {
                ctx.font = `${options.fontSize || 16}px ${options.fontFamily || 'Arial'}`;
                ctx.fillStyle = options.fill || '#000000';
                ctx.fillText(text, x, y);
            },
            
            animate: (callback) => {
                const animate = () => {
                    requestAnimationFrame(animate);
                    if (callback) callback(ctx);
                };
                animate();
            },
            
            destroy: () => {
                if (canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
                this.activeRenderers.delete(context);
            }
        };

        this.activeRenderers.set(context, 'canvas2d');
        return context;
        
    } catch (error) {
        console.error('Failed to create Canvas 2D context:', error);
        return null;
    }
}

/**
 * Create pixel art canvas with enhanced rendering
 * @param {Object} options - Pixel art options
 * @returns {Object|null} Pixel art context
 */
createPixelArtCanvas(options = {}) {
    const config = {
        width: 60,
        height: 80,
        pixelSize: 4,
        container: null,
        ...options
    };

    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = 'crisp-edges';

    if (config.container) {
        config.container.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    return {
        canvas,
        ctx,
        pixelSize: config.pixelSize,
        
        drawPixel: (x, y, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(
                x * config.pixelSize,
                y * config.pixelSize,
                config.pixelSize,
                config.pixelSize
            );
        },
        
        drawPattern: (pattern, colors) => {
            pattern.forEach((row, y) => {
                row.forEach((pixel, x) => {
                    if (pixel !== 0 && colors[pixel]) {
                        this.drawPixel(x, y, colors[pixel]);
                    }
                });
            });
        },
        
        clear: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
}

/**
 * Get optimal canvas size based on device capabilities
 * @param {number} baseWidth - Base width
 * @param {number} baseHeight - Base height
 * @returns {Object} Optimal dimensions
 */
getOptimalCanvasSize(baseWidth, baseHeight) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const maxDimension = 4096; // WebGL limit on many devices
    
    let optimalWidth = baseWidth * devicePixelRatio;
    let optimalHeight = baseHeight * devicePixelRatio;
    
    // Scale down if exceeding limits
    if (optimalWidth > maxDimension || optimalHeight > maxDimension) {
        const scale = Math.min(
            maxDimension / optimalWidth,
            maxDimension / optimalHeight
        );
        optimalWidth *= scale;
        optimalHeight *= scale;
    }
    
    return {
        width: Math.floor(optimalWidth),
        height: Math.floor(optimalHeight),
        scale: devicePixelRatio
    };
}

/**
 * Dispose of all graphics resources
 */
dispose() {
    this.activeRenderers.forEach((library, context) => {
        try {
            context.destroy();
        } catch (error) {
            console.warn('Error disposing graphics context:', error);
        }
    });
    
    this.activeRenderers.clear();
    this.canvasPool.clear();
}

/**
 * Get graphics system status
 * @returns {Object} System status
 */
getStatus() {
    return {
        initialized: this.initialized,
        availableLibraries: this.availableLibraries,
        activeRenderers: this.activeRenderers.size,
        performanceMetrics: this.performanceMetrics
    };
}
```

}

// Create global graphics manager instance
const graphicsManager = new GraphicsManager();

// Export for different module systems
if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { GraphicsManager, graphicsManager };
} else if (typeof window !== ‘undefined’) {
window.GraphicsManager = GraphicsManager;
window.graphicsManager = graphicsManager;
}
