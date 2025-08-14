const axios = require('axios');
const get_access_token = require("../get_access_token");

const spotifyTrackRegex = /(?:track\/|spotify:track:)([a-zA-Z0-9]{22})/;
const spotifyPlaylistOrAlbumRegex = /(?:playlist\/|album\/|spotify:(?:playlist|album):)([a-zA-Z0-9]{22})/;

const searchSpotifyTrack = async (query, accessToken) => {
  const res = await axios.get("https://api.spotify.com/v1/search", {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      q: query,
      type: 'track',
      limit: 1,
    },
  });
  return res.data.tracks.items[0] || null;
};

const getSpotifyTrackInfo = async (trackId, accessToken) => {
  const res = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.data;
};

const add_to_queue = async (input, username) => {
  const accessToken = await get_access_token();
  let uri = null;
  let displayName = null;

  if (spotifyPlaylistOrAlbumRegex.test(input)) {
    return {
      success: false,
      code: "INVALID_LINK_TYPE",
      message: "❌ Only Spotify track links are supported. Playlists and albums are not supported.",
    };
  }

  const spotifyTrackMatch = input.match(spotifyTrackRegex);
  if (spotifyTrackMatch) {
    const trackInfo = await getSpotifyTrackInfo(spotifyTrackMatch[1], accessToken);
    uri = trackInfo.uri;
    displayName = `${trackInfo.name} by ${trackInfo.artists.map(a => a.name).join(', ')}`;
  }

  if (!uri) {
    const track = await searchSpotifyTrack(input, accessToken);
    if (!track) {
      return { success: false, code: "NO_RESULTS", message: `No results found for: "${input}"` };
    }
    uri = track.uri;
    displayName = `${track.name} by ${track.artists.map(a => a.name).join(', ')}`;
  }

  try {
    await axios.post(
      `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return { success: true, code: "ADDED_TO_QUEUE", message: `✅ Added to queue: ${displayName}` };
  } catch (err) {
    const errorData = err.response?.data;
    if (
      errorData?.error?.reason === "NO_ACTIVE_DEVICE" ||
      errorData?.error?.message?.includes("No active device")
    ) {
      return {
        success: false,
        code: "NO_ACTIVE_DEVICE",
        message: "❌ No active Spotify device found. Please open Spotify and start playing something first.",
      };
    }
    return { success: false, code: "API_ERROR", message: "Failed to add to queue" };
  }
};

module.exports = add_to_queue;