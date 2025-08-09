const axios = require('axios');

const get_access_token = require("../get_access_token");

const pause = async () => {
  const accessToken = await get_access_token();

  try {
    await axios.put(
      'https://api.spotify.com/v1/me/player/pause',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return 'Playback paused';
  } catch (err) {
    await Utility.error_logger('Failed to pause playback:', err.response?.data || err.message);
  }
};

module.exports = pause;