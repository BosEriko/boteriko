const axios = require('axios');
const read_label = require("./read_label");

const TODOIST_HEADERS = { Authorization: `Bearer ${Config.other.todoist.apiToken}` };

async function read_list() {
  const labelName = await read_label();

  try {
    const tasks = await axios.get('https://api.todoist.com/api/v1/tasks/filter', {
      params: { query: `today & @${labelName}` },
      headers: TODOIST_HEADERS
    });

    return tasks.data.results;
  } catch (err) {
    await Utility.error_logger("Failed to fetch todos:", err);
    return [];
  }
}

module.exports = read_list;
