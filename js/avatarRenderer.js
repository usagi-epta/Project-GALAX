// js/avatarRenderer.js
import { showPlayerProfile } from './uiManager.js';

export function createPixiAvatar(player) {
  const container = new PIXI.Container();
  container.name = `player_${player.username}`;

  // Graphic & text
  const g = new PIXI.Graphics();
  const txt = new PIXI.Text(player.username, {
    fontFamily: 'Courier New',
    fontSize: 11,
    fill: 0x00ffff,
    align: 'center'
  });
  txt.anchor.set(0.5);
  txt.x = 16; txt.y = -5;
  container.addChild(g, txt);

  // Store refs
  player._avatarGraphics = g;
  player._usernameText   = txt;
  updatePixiAvatar(player);

  // Make interactive
  container.eventMode = 'static';
  container.hitArea   = new PIXI.Rectangle(0,-20,32,50);
  container.cursor    = 'pointer';
  container.on('pointerdown', () => {
    if (player !== player._avatarGraphics.gameState?.currentPlayer) {
      showPlayerProfile(player);
    }
  });

  return container;
}

export function updatePixiAvatar(player) {
  const g = player._avatarGraphics;
  if (!g) return;
  g.clear();

  const toHex = c => parseInt(c.replace('#','0x'));

  // Body
  g.beginFill(toHex(player.bodyColor));
  g.drawRect(8,12,16,20);
  g.endFill();
  // Head
  g.beginFill(toHex(player.bodyColor));
  g.drawRect(6,4,20,16);
  g.endFill();
  // Hair
  g.beginFill(toHex(player.hairColor));
  g.drawRect(4,2,24,8);
  g.endFill();
  // Eyes
  g.beginFill(0x000000);
  g.drawRect(10,8,2,2);
  g.drawRect(20,8,2,2);
  g.endFill();
}

export function drawPixelAvatarToContext(player, x,y,ctx,scale=1) {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = player.bodyColor;
  ctx.fillRect(x + 8*scale, y + 12*scale, 16*scale,20*scale);
  ctx.fillRect(x + 6*scale, y + 4*scale, 20*scale,16*scale);
  ctx.fillStyle = player.hairColor;
  ctx.fillRect(x + 4*scale, y + 2*scale, 24*scale,8*scale);
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 10*scale, y + 8*scale, 2*scale,2*scale);
  ctx.fillRect(x + 20*scale, y + 8*scale, 2*scale,2*scale);
}
