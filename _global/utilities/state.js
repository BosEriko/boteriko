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
  const reset = state.reset;
  const resetSection = state.resetSection;
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
  state.reset = reset;
  state.resetSection = resetSection;
};

state.resetSection = function resetSection(sectionName) {
  const fresh = createInitialState()[sectionName];
  if (fresh === undefined) return;

  if (typeof fresh !== 'object' || fresh === null) {
    state[sectionName] = fresh;
    return;
  }

  if (Array.isArray(fresh)) {
    state[sectionName] = [...fresh];
    return;
  }

  const target = state[sectionName];

  if (!target || typeof target !== 'object') {
    state[sectionName] = fresh;
    return;
  }

  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, fresh);
};

module.exports = state;
