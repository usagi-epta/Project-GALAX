import { initGame, debouncedResize } from './gameEngine.js';
import { bindUI }                 from './uiManager.js';

// Entry point
(() => {
  window.addEventListener('resize', () => debouncedResize());
  window.onload = () => {
    bindUI();      // wire up buttons, chat, customization, join
    initGame();    // sets up Pixi, grid, ticker, enables Join
  };
})();
