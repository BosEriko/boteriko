const client = require('./client');
const { broadcastToClient } = require('../../global/utilities/websocket');

const voiceStates = new Map();

function getVoiceState(discordId) {
  return voiceStates.get(discordId) || {
    isOnCall: false,
    isMuted: false,
    isDeafened: false,
    isSpeaking: false,
  };
}

client.on('voiceStateUpdate', (oldState, newState) => {
  const discordId = newState.member?.id || oldState.member?.id;
  if (!discordId) return;

  const wasOnCall = oldState.channel !== null;
  const isOnCall = newState.channel !== null;

  let state = getVoiceState(discordId);

  if (!wasOnCall && isOnCall) {
    state = { ...state, isOnCall: true, isMuted: newState.mute, isDeafened: newState.deaf };
  } else if (wasOnCall && !isOnCall) {
    state = { isOnCall: false, isMuted: false, isDeafened: false, isSpeaking: false };
  } else if (isOnCall) {
    state = { ...state, isOnCall: true, isMuted: newState.mute, isDeafened: newState.deaf };
  }

  voiceStates.set(discordId, state);
  broadcastToClient({ type: 'voice_status_update', discordId, ...state });
});

client.on('speakingUpdate', (oldState, newState) => {
  const discordId = newState.member?.id;
  if (!discordId) return;

  const state = getVoiceState(discordId);
  voiceStates.set(discordId, { ...state, isSpeaking: newState.speaking });
  broadcastToClient({ type: 'voice_status_update', discordId, ...state });
});

module.exports = { getVoiceState };
