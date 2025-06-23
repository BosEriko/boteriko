const broadcastToClient = require('@global/utilities/websocket');

let lastTriggerTime = 0;
const COOLDOWN_MS = 10 * 1000;

function handleSoundCommand(soundId) {
  const now = Date.now();
  if (now - lastTriggerTime < COOLDOWN_MS) {
    console.log(`${soundId} Sound Alert is on cooldown.`);
    return;
  }

  lastTriggerTime = now;
  broadcastToClient({ type: 'SOUND_ALERT', id: soundId });
}

module.exports = handleSoundCommand;