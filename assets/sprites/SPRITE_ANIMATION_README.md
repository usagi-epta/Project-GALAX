# Sprite Animation System

This document describes the sprite animation system added to Project-GALAX using the LPC (Liberated Pixel Cup) character sprites.

## Files Created

### 1. `js/components/sprite-animation.js`
The main sprite animation component that handles:
- Loading and managing LPC character sprites
- Layer-based character composition (14 sprite layers)
- Animation playback with 15 different animations
- Interactive controls for animation selection and playback
- Canvas rendering with pixel-perfect scaling

### 2. `sprite-demo.html`
A standalone demo page showcasing the sprite animation system with:
- Detailed information about the LPC sprite system
- Interactive animation viewer
- Feature explanations and credits

### 3. Integration with Main App
- Added sprite animation demo to the Games tab in `index.html`
- Integrated with the existing component loading system
- Added `SpriteDemo.launch()` function for easy access

## Available Animations

The system supports 15 different character animations:

1. **spellcast** - Magic casting (7 frames)
2. **thrust** - Thrust/stab attack (8 frames)
3. **walk** - Walking cycle (9 frames)
4. **slash** - Slash attack (6 frames)
5. **shoot** - Ranged attack/bow (13 frames)
6. **hurt** - Taking damage (6 frames)
7. **climb** - Climbing animation (6 frames)
8. **idle** - Standing idle (2 frames)
9. **jump** - Jumping (5 frames)
10. **sit** - Sitting position (3 frames)
11. **emote** - Emotional expression (3 frames)
12. **run** - Running cycle (8 frames)
13. **combat_idle** - Combat stance idle (2 frames)
14. **backslash** - Backhand slash (13 frames)
15. **halfslash** - Half slash attack (7 frames)

## Character Layers

The character is composed of 14 layered sprites with proper z-ordering:

- **Body** (z:10): Teen body with light skin
- **Head** (z:100): Human female small head
- **Hair** (z:115): Relm XLong style in rose color
- **Eyes** (z:120): Red eyes with neutral expression
- **Ears** (z:105): Elven ears
- **Horns** (z:110): Backwards horns in raven color
- **Wings** (z:8): Monarch wings in sky blue
- **Shoes** (z:15): Sky blue sandals
- **Clothes** (z:35): Blue-gray cardigan
- **Overalls** (z:38): Rose colored overalls
- **Bauldron** (z:65): Leather armor
- **Necklace** (z:80): Simple brass necklace
- **Earrings** (z:81): Bronze moon earrings
- **Weapon** (z:145): Dark gnarled staff

## How to Use

### From Main Application
1. Navigate to the Games tab
2. Click "Launch" on the "Sprite Animation Demo" item
3. Use the interactive controls to explore animations

### Standalone Demo
1. Open `sprite-demo.html` in a web browser
2. Click "Launch Animation Demo"
3. Explore the various animations and controls

### Programmatic Usage
```javascript
// Create sprite animation manager
const spriteManager = new SpriteAnimationManager();

// Play specific animation
spriteManager.playAnimation('walk');

// Control playback
spriteManager.play();
spriteManager.pause();
spriteManager.reset();
```

## Controls

- **Animation Dropdown**: Select different character animations
- **Play/Pause**: Control animation playback
- **Speed Slider**: Adjust animation speed (50-500ms per frame)
- **Reset**: Return to first frame of current animation
- **Close**: Close the animation viewer

## Technical Details

- **Frame Size**: 64x64 pixels per frame
- **Scaling**: 4x scaling for better visibility (256x256 display)
- **Rendering**: Canvas 2D with pixel-perfect rendering
- **Animation Speed**: Configurable from 50ms to 500ms per frame
- **Layer System**: Z-ordered sprite composition
- **File Format**: PNG with RGBA transparency

## Browser Compatibility

The sprite animation system works in all modern browsers that support:
- Canvas 2D API
- ES6 Classes
- Async/await
- Promise API

## Credits

The sprite artwork is based on the Universal LPC Character Generator and includes work by:
- bluecarrot16 (weapons, jewelry, clothing)
- JaidynReiman (animation expansions)
- ElizaWy (character revisions)
- Stephen Challener (Redshrike) - original base assets
- The Foreman (fairy wings)
- Nila122 (horns, armor)
- Many other LPC community contributors

Licensed under various open source licenses: OGA-BY, CC-BY-SA, GPL, and CC0.

## Future Enhancements

Potential improvements for the sprite animation system:
1. Character customization interface
2. Animation blending and transitions
3. Multiple character support
4. Export to animated GIF/WebM
5. Integration with chat system for animated avatars
6. Performance optimization for mobile devices