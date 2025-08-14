const axios = require('axios');
const { broadcastToClient } = require('@global/utilities/websocket');
const state = require('@global/utilities/state');
const get_access_token = require("../get_access_token");

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const get_details = async () => {
  if (!state.isStreaming) return;

  try {
    const accessToken = await get_access_token();

    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (response.status === 204 || !response.data) {
      broadcastToClient({ type: 'MUSIC_DETAIL', data: null });
      return;
    }

    const track = response.data.item;

    const lengthMs = track.duration_ms;
    const currentTimeMs = response.data.progress_ms;

    const simplifiedData = {
      title: track.name,
      singer: track.artists.map(artist => artist.name).join(', '),
      length: formatTime(lengthMs),
      currentTime: formatTime(currentTimeMs),
      progress: Math.min((currentTimeMs / lengthMs) * 100, 100),
      isPlaying: response.data.is_playing,
      albumCoverUrl: track.album.images?.[0]?.url || null
    };

    state.musicDetails = simplifiedData;
    broadcastToClient({ type: 'MUSIC_DETAIL', musicDetails: simplifiedData });
  } catch (error) {
    await Utility.error_logger('Error fetching Spotify details:', error.response?.data || error.message);
  }
};

setInterval(get_details, 5000);

module.exports = get_details;