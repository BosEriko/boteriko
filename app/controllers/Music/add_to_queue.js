const handleErrorUtility = require('@global/utilities/error');
const axios = require('axios');

const get_access_token = require("./get_access_token");

const add_to_queue = async (query) => {
  const accessToken = await get_access_token();

  try {
    const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
        limit: 1,
      },
    });

    const tracks = searchResponse.data.tracks.items;
    if (tracks.length === 0) {
      return `No results found for: "${query}"`;
    }

    const topTrack = tracks[0];
    const uri = topTrack.uri;

    await axios.post(
      `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return `✅ Added to queue: ${topTrack.name} by ${topTrack.artists.map(a => a.name).join(', ')}`;
  } catch (err) {
    await handleErrorUtility('Failed to search and add to queue:', err.response?.data || err.message);
  }
};

module.exports = add_to_queue;