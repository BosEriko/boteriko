const { broadcastToClient } = require('@global/utilities/websocket');
const { state } = require('@global/utilities/state');
const read_list = require("./read_list");

async function broadcast_todo() {
  try {
    const todos = await read_list();
    broadcastToClient({ type: 'TODO', todos, isVisible: state.isTodoVisible });
  } catch (err) {
    await Utility.error_logger("Failed to broadcast todo state:", err);
  }
}

module.exports = broadcast_todo;
