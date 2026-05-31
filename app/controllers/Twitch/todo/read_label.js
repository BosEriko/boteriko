const axios = require('axios');
const { kebabCase } = require('change-case');
const cacheUtility = require('@global/utilities/cache');
const { state } = require('@global/utilities/state');

const TODOIST_HEADERS = { Authorization: `Bearer ${Config.other.todoist.apiToken}` };
const labelNameCache = cacheUtility();

async function read_label() {
  const labelName = kebabCase(state.streamDetail?.game_name || "general");

  const cachedLabel = labelNameCache.get(labelName, 'label-name');
  if (cachedLabel) return cachedLabel;

  try {
    const searchLabel = await axios.get(`https://api.todoist.com/api/v1/labels/search?query=${labelName}&limit=1`, { headers: TODOIST_HEADERS });
    const existing = searchLabel.data.results?.[0]?.name;

    if (existing) {
      labelNameCache.set(labelName, labelName, 'label-name');
      return labelName;
    }

    const createLabel = await axios.post(`https://api.todoist.com/api/v1/labels`, { name: labelName }, { headers: TODOIST_HEADERS });
    if (createLabel.statusText === "OK") {
      labelNameCache.set(labelName, labelName, 'label-name');
      return labelName;
    }

    return null;
  } catch (err) {
    await Utility.error_logger("Failed to get/create label:", err);
    return null;
  }
}

module.exports = read_label;
