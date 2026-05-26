const createInitialState = () => ({
  // Stream-related state
  isStreaming: false,
  streamDetail: null,
  autoRaid: true,
  raidDestination: "TwisWua",

  // Stream Winners
  winners: {
    firstChat: null,
    typing: null,
  },

  // Steam state
  steam: {
    gameName: null,
    gameId: null,
    gameDescription: null,
    gamePercent: null,
  },

  // Timestamps
  timestamp: {
    message: Date.now(),
  },

  // Todoist display toggle
  isTodoVisible: false,

  // Music state
  music: {
    details: null,
    queue: new Set()
  },

  // Cache references
  caches: [],
});

const state = createInitialState();

state.reset = function reset() {
  const fresh = createInitialState();
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
};

state.resetSection = function resetSection(sectionName) {
  const fresh = createInitialState()[sectionName];
  if (!fresh) return;
  const target = state[sectionName];
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, fresh);
};

module.exports = state;
