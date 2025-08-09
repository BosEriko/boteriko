const axios = require('axios');

const get_access_token = require("../get_access_token");

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
      return {
        success: false,
        code: 'NO_RESULTS',
        message: `No results found for: "${query}"`,
      };
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

    return {
      success: true,
      code: 'ADDED_TO_QUEUE',
      message: `✅ Added to queue: ${topTrack.name} by ${topTrack.artists.map(a => a.name).join(', ')}`,
    };
  } catch (err) {
    const errorData = err.response?.data;

    if (
      errorData?.error?.reason === 'NO_ACTIVE_DEVICE' ||
      errorData?.error?.message?.includes('No active device')
    ) {
      return {
        success: false,
        code: 'NO_ACTIVE_DEVICE',
        message: '❌ No active Spotify device found. Please open Spotify and start playing something first.',
      };
    }

    await Utility.error_logger('Failed to search and add to queue:', errorData || err.message);

    return {
      success: false,
      code: 'API_ERROR',
      message: 'Failed to search and add to queue',
    };
  }
};

module.exports = add_to_queue;