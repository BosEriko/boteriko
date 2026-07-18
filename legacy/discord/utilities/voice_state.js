const client = require('./client');

const voiceStates = new Map();
const subscribers = new Map();

function getVoiceState(discordId) {
  return voiceStates.get(discordId) || {
    isOnCall: false,
    isMuted: false,
    isDeafened: false,
    isSpeaking: false,
  };
}

function subscribe(discordId, callback) {
  if (!subscribers.has(discordId)) {
    subscribers.set(discordId, new Set());
  }
  subscribers.get(discordId).add(callback);

  return () => {
    const subs = subscribers.get(discordId);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        subscribers.delete(discordId);
      }
    }
  };
}

function notifySubscribers(discordId) {
  const subs = subscribers.get(discordId);
  if (!subs) return;

  const state = getVoiceState(discordId);
  subs.forEach(callback => callback(state));
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
  notifySubscribers(discordId);
});

client.on('speakingUpdate', (oldState, newState) => {
  const discordId = newState.member?.id;
  if (!discordId) return;

  const isSpeaking = newState.speaking;
  const state = getVoiceState(discordId);

  voiceStates.set(discordId, { ...state, isSpeaking });
  notifySubscribers(discordId);
});

module.exports = { getVoiceState, subscribe };
