// js/gameEngine.js
import { createPixiAvatar }       from './avatarRenderer.js';
import { showMessage,
         updateStartupStatus,
         addChatMessage }         from './uiManager.js';

export const gameState = {
  isLoggedIn: false,
  username: '',
  players: new Map(),
  currentPlayer: null,
  chatExpanded: false,
  customizationVisible: false,
  touchKeys: {},
  selectedPlayer: null
};

let app, playerContainer, gridGraphics;
let resizeTimer;
const keys = {};  // for keyboard input

// Debounce helper for resize
export function debouncedResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 150);
}

// Called from app.js on window.onload
export function initGame() {
  updateStartupStatus('Initializing Pixi.js…');
  app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000814,
    antialias: false,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1
  });
  document.getElementById('gameCanvasContainer').appendChild(app.view);

  // Layers: grid under players
  gridGraphics     = new PIXI.Graphics();
  playerContainer  = new PIXI.Container();
  app.stage.addChild(gridGraphics, playerContainer);

  // Draw initial grid
  drawGrid();

  // Listeners
  window.addEventListener('resize', debouncedResize);
  app.view.addEventListener('wheel', onWheelZoom, { passive: false });
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup',   onKeyUp);

  // Start game loop
  app.ticker.add(gameLoop);

  // Enable join button
  document.getElementById('joinButton').disabled = false;
  updateStartupStatus('Game Ready! Enter your username.');
}

function resizeCanvas() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  drawGrid();
}

let scale = 1;
function onWheelZoom(e) {
  e.preventDefault();
  scale *= e.deltaY > 0 ? 0.9 : 1.1;
  scale = Math.min(Math.max(0.5, scale), 3);
  app.stage.scale.set(scale);
}

function drawGrid() {
  gridGraphics.clear();
  gridGraphics.lineStyle(1, 0x00ffff, 0.05);
  const size = 50;
  for (let x = 0; x <= app.screen.width; x += size) {
    gridGraphics.moveTo(x, 0);
    gridGraphics.lineTo(x, app.screen.height);
  }
  for (let y = 0; y <= app.screen.height; y += size) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(app.screen.width, y);
  }
}

// Main loop
function gameLoop(delta) {
  if (gameState.isLoggedIn) handleMovement();
  gameState.players.forEach(player => {
    if (!player.pixiSprite) return;
    // Base position
    player.pixiSprite.x = player.x;
    player.pixiSprite.y = player.y + (player.isMoving
      ? Math.sin(Date.now() * 0.01) * 0.5
      : 0);
  });
}

/** USER JOINING & PLAYER MANAGEMENT **/

export function joinCommunity() {
  showMessage('Attempting to join community…');
  const input = document.getElementById('usernameInput');
  const username = input.value.trim();

  if (!username) {
    showMessage('Error: Username cannot be empty!', true);
    input.style.border = '2px solid red';
    input.placeholder = 'Username cannot be empty!';
    setTimeout(() => {
      input.style.border = '1px solid #00ffff';
      input.placeholder = 'Enter Username';
    }, 2000);
    return;
  }

  showMessage('Username is valid. Proceeding…');
  gameState.username    = username;
  gameState.isLoggedIn  = true;

  // Spawn current player
  const initialX = Math.random() * (app.screen.width - 100) + 50;
  const initialY = Math.random() * (app.screen.height - 100) + 50;
  gameState.currentPlayer = {
    username,
    x: initialX,
    y: initialY,
    bodyColor: '#4ecdc4',
    hairColor: '#ff6b6b',
    direction: 'down',
    isMoving: false,
    joinTime: new Date()
  };

  showMessage('Adding your avatar to the game…');
  addPlayer(gameState.currentPlayer);

  // Toggle UI
  document.getElementById('loginScreen').style.display     = 'none';
  document.getElementById('onlineCount').style.display     = 'block';
  document.getElementById('controlPanel').style.display    = 'flex';
  document.getElementById('chatContainer').style.display   = 'block';
  document.getElementById('startupStatus').style.display   = 'none';

  addChatMessage('System', `Welcome ${username}!`);
  updateOnlineCount();
  showMessage(`Successfully joined as ${username}!`);

  // Simulate other users joining
  setTimeout(addSimulatedUsers, 2000);
}

export function addPlayer(player) {
  gameState.players.set(player.username, player);
  player.pixiSprite = createPixiAvatar(player);
  player.pixiSprite.x = player.x;
  player.pixiSprite.y = player.y;
  playerContainer.addChild(player.pixiSprite);
}

/** SIMULATED USERS **/

function addSimulatedUsers() {
  const names = ['Alice','Bob','Charlie','Diana'];
  names.forEach((name, i) => {
    setTimeout(() => {
      const user = {
        username: name,
        x: Math.random() * (app.screen.width - 100) + 50,
        y: Math.random() * (app.screen.height - 100) + 50,
        bodyColor: ['#ff6b6b','#4ecdc4','#45b7d1','#96ceb4'][Math.floor(Math.random()*4)],
        hairColor: ['#ffeaa7','#dda0dd','#98d8c8','#f7dc6f'][Math.floor(Math.random()*4)],
        direction: 'down',
        isMoving: false,
        joinTime: new Date(Date.now() - Math.random()*3600000)
      };
      addPlayer(user);
      updateOnlineCount();

      // random movement
      setInterval(() => {
        if (Math.random() < 0.08) moveSimulatedUser(user);
      }, 2000);
    }, i * 800);
  });
}

function moveSimulatedUser(user) {
  const dirs = ['up','down','left','right'];
  const dir  = dirs[Math.floor(Math.random()*4)];
  const speed = 2;
  user.direction = dir;
  user.isMoving  = true;

  switch (dir) {
    case 'up':    user.y = Math.max(20, user.y - speed*8); break;
    case 'down':  user.y = Math.min(app.screen.height - 40, user.y + speed*8); break;
    case 'left':  user.x = Math.max(20, user.x - speed*8); break;
    case 'right': user.x = Math.min(app.screen.width - 40, user.x + speed*8); break;
  }
  setTimeout(() => user.isMoving = false, 400);
}

export function updateOnlineCount() {
  document.getElementById('onlineNumber').textContent =
    gameState.players.size;
}

/** INPUT HANDLING **/

function onKeyDown(e) {
  keys[e.key.toLowerCase()] = true;
  if (e.key === 'Tab') {
    e.preventDefault();
    document.getElementById('chatToggle').click();
  }
  if (e.key.toLowerCase() === 'c') {
    document.getElementById('customizeBtn').click();
  }
}

function onKeyUp(e) {
  keys[e.key.toLowerCase()] = false;
}

function handleMovement() {
  if (!gameState.currentPlayer) return;
  const speed = 3;
  let moved = false;

  const up    = keys['w'] || keys['arrowup']   || gameState.touchKeys.up;
  const down  = keys['s'] || keys['arrowdown'] || gameState.touchKeys.down;
  const left  = keys['a'] || keys['arrowleft'] || gameState.touchKeys.left;
  const right = keys['d'] || keys['arrowright']|| gameState.touchKeys.right;

  if (up)    { gameState.currentPlayer.y = Math.max(20, gameState.currentPlayer.y - speed); gameState.currentPlayer.direction = 'up';    moved = true; }
  if (down)  { gameState.currentPlayer.y = Math.min(app.screen.height - 40, gameState.currentPlayer.y + speed); gameState.currentPlayer.direction = 'down';  moved = true; }
  if (left)  { gameState.currentPlayer.x = Math.max(20, gameState.currentPlayer.x - speed); gameState.currentPlayer.direction = 'left';  moved = true; }
  if (right) { gameState.currentPlayer.x = Math.min(app.screen.width - 40, gameState.currentPlayer.x + speed); gameState.currentPlayer.direction = 'right'; moved = true; }

  gameState.currentPlayer.isMoving = moved;
}

// Expose these for inline HTML handlers
export function startTouch(dir) { gameState.touchKeys[dir] = true; }
export function endTouch(dir)   { gameState.touchKeys[dir] = false; }
