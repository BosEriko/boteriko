const axios = require('axios');

const get_access_token = require("../get_access_token");

const get_current_song = async () => {
  const accessToken = await get_access_token();

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.data || response.status === 204) {
      return "❌ No song is currently playing.";
    }

    const item = response.data.item;

    if (!response.data.is_playing) {
      return "⏸️ Playback is paused.";
    }

    const title = item.name;
    const artists = item.artists.map(artist => artist.name).join(', ');
    const url = item.external_urls.spotify;

    return `🎵 ${title} by ${artists} — ${url}`;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return "⚠️ No active Spotify device detected.";
    }

    await Utility.error_logger('Failed to get current song:', err.response?.data || err.message);
    return "❌ Unable to fetch the current song at the moment.";
  }
};

module.exports = get_current_song;
