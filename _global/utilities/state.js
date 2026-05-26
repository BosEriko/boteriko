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

function resetState() {
  const fresh = createInitialState();
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
}

function resetSection(sectionName) {
  const fresh = createInitialState()[sectionName];
  if (fresh === undefined) return;

  const current = state[sectionName];

  if (!current || typeof current !== "object") {
    state[sectionName] = fresh;
    return;
  }

  if (Array.isArray(fresh)) {
    state[sectionName] = [...fresh];
    return;
  }

  Object.keys(current).forEach((key) => delete current[key]);
  Object.assign(current, fresh);
}

module.exports = { state, resetState, resetSection };
