const axios = require('axios');
const { broadcastToClient } = require('@global/utilities/websocket');
const state = require('@global/utilities/state');
const get_access_token = require("../get_access_token");

const updateQueue = (currentId) => {
  const queueArray = Array.from(state.music.queue).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  let playingAssigned = false;

  const updatedArray = queueArray.map(item => {
    if (item.status === "COMPLETED") return item;

    if (item.id === currentId) {
      if (!playingAssigned) {
        playingAssigned = true;
        return { ...item, status: "PLAYING" };
      } else {
        return { ...item, status: "QUEUED" };
      }
    }

    if (item.status === "PLAYING") return { ...item, status: "COMPLETED" };

    return item;
  });

  state.music.queue = new Set(updatedArray);
};

const polling = async () => {
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
      username: Array.from(state.music.queue).find(t => t.status === "PLAYING" && t.id === track.id)?.username || "",
      title: track.name,
      singer: track.artists.map(artist => artist.name).join(', '),
      length: Controller.Concern.format_time(lengthMs),
      currentTime: Controller.Concern.format_time(currentTimeMs),
      progress: Math.min((currentTimeMs / lengthMs) * 100, 100),
      isPlaying: response.data.is_playing,
      albumCoverUrl: track.album.images?.[0]?.url || null,
      spotifyUrl: track.external_urls?.spotify || null
    };

    updateQueue(track.id);

    state.music.details = simplifiedData;
    broadcastToClient({ type: 'MUSIC_DETAIL', musicDetails: simplifiedData });
    broadcastToClient({ type: 'MUSIC_QUEUE', musicQueue: Array.from(state.music.queue) });
  } catch (error) {
    await Utility.error_logger('Error fetching Spotify details:', error.response?.data || error.message);
  }
};

setInterval(polling, 5000);

module.exports = polling;