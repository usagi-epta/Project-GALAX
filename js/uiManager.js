// js/uiManager.js
import { joinCommunity, gameState } from './gameEngine.js';

let messageTimeout;

/** In-App notifications */
export function showMessage(txt, isError = false) {
  const box = document.getElementById('messageBox');
  box.textContent = txt;
  box.classList.toggle('error', isError);
  box.classList.add('show');
  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => box.classList.remove('show'), 3000);
}

export function updateStartupStatus(txt) {
  const el = document.getElementById('startupStatus');
  if (el) el.textContent = txt;
}

/** Chat history */
export function addChatMessage(username, message) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.innerHTML = `<strong style="color:#00ffff">${username}:</strong> ${message}`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  if (container.children.length > 50) {
    container.removeChild(container.firstChild);
  }
}

/** Wire up all DOM controls */
export function bindUI() {
  document.getElementById('joinButton')
          .addEventListener('click', joinCommunity);

  const chatToggle = document.getElementById('chatToggle');
  chatToggle.addEventListener('click', toggleChat);
  chatToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') toggleChat();
  });

  document.getElementById('chatInput')
          .addEventListener('keypress', handleChatInput);

  document.getElementById('customizeBtn')
          .addEventListener('click', toggleCustomization);

  document.getElementById('helpBtn')
          .addEventListener('click', showHelp);

  document.getElementById('fsBtn')
          .addEventListener('click', toggleFullscreen);

  // Profile & customization panels close/send
  document.querySelectorAll('.profile-btn.secondary')
          .forEach(b => b.addEventListener('click', closeProfile));
  document.querySelectorAll('.profile-btn')
          .forEach(b => {
            if (!b.classList.contains('secondary'))
              b.addEventListener('click', sendFriendRequest);
          });
}

/** UI toggles */
function toggleChat() {
  gameState.chatExpanded = !gameState.chatExpanded;
  const c = document.getElementById('chatContainer');
  const t = document.getElementById('chatToggle');
  c.classList.toggle('expanded', gameState.chatExpanded);
  t.setAttribute('aria-expanded', gameState.chatExpanded);
  if (gameState.chatExpanded) document.getElementById('chatInput').focus();
}

function handleChatInput(e) {
  if (e.key === 'Enter') {
    const input = e.target;
    const msg = input.value.trim();
    if (!msg) return;
    addChatMessage(gameState.username, msg);
    input.value = '';
    // Simulated response
    if (Math.random() < 0.25) {
      const resp = ['Hello!','Nice!','How are you?','Cool!'][Math.floor(Math.random()*4)];
      const others = Array.from(gameState.players.keys())
                          .filter(u => u !== gameState.username);
      if (others.length) {
        const who = others[Math.floor(Math.random()*others.length)];
        setTimeout(() => addChatMessage(who, resp), 1000 + Math.random()*2000);
      }
    }
  }
}

export function toggleCustomization() {
  gameState.customizationVisible = !gameState.customizationVisible;
  document.getElementById('avatarCustomization')
          .style.display = gameState.customizationVisible ? 'block' : 'none';
}

export function showHelp() {
  addChatMessage('System',
    'Controls: WASD/arrows to move, click avatars for profile, pinch to zoom. Press C to customize.');
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

/** Profile modal */
export function showPlayerProfile(player) {
  gameState.selectedPlayer = player;
  document.getElementById('profileName').textContent   = player.username;
  document.getElementById('profileStatus').textContent = 'Online';

  // Calculate join time text
  const diffMs     = Date.now() - new Date(player.joinTime).getTime();
  const mins       = Math.floor(diffMs / 60000);
  const hours      = Math.floor(mins / 60);
  const joinedText = mins < 1
    ? 'Just now'
    : mins < 60
      ? `${mins}m ago`
      : hours < 24
        ? `${hours}h ago`
        : new Date(player.joinTime).toLocaleDateString();
  document.getElementById('profileJoined').textContent = joinedText;

  // Draw avatar on profile canvas
  const cvs = document.getElementById('profileAvatar');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0,0,64,64);
  // scale=2 for larger draw
  window.drawPixelAvatarToContext(player, 16,16,ctx,2);

  document.getElementById('playerProfile').style.display = 'block';
}

export function closeProfile() {
  document.getElementById('playerProfile').style.display = 'none';
  gameState.selectedPlayer = null;
}

export function sendFriendRequest() {
  if (!gameState.selectedPlayer) return;
  addChatMessage('System', `Friend request sent to ${gameState.selectedPlayer.username}`);
  closeProfile();
}
