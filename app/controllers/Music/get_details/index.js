const { broadcastToClient } = require('@global/utilities/websocket');
const get_access_token = require("../get_access_token");

const get_details = async () => {
  const accessToken = await get_access_token();
  console.log(accessToken);

  broadcastToClient({ type: 'MUSIC_DETAIL', data: null });
};

module.exports = get_details;