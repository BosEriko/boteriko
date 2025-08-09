const axios = require('axios');

const get_access_token = require("../get_access_token");

const play = async () => {
  const accessToken = await get_access_token();

  try {
    await axios.put(
      'https://api.spotify.com/v1/me/player/play',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return 'Playback resumed';
  } catch (err) {
    await Utility.error_logger('Failed to resume playback:', err.response?.data || err.message);
  }
};

module.exports = play;