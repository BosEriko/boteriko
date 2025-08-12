const axios = require('axios');
const get_access_token = require("../get_access_token");

const spotifyTrackRegex = /(?:track\/|spotify:track:)([a-zA-Z0-9]{22})/;
const spotifyPlaylistOrAlbumRegex = /(?:playlist\/|album\/|spotify:(?:playlist|album):)([a-zA-Z0-9]{22})/;
const youtubeVideoRegex = /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const youtubePlaylistRegex = /[?&]list=([a-zA-Z0-9_-]+)/;

const getYouTubeTitle = async (videoId) => {
  try {
    const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);
    const match = res.data.match(/<title>(.*?)<\/title>/i);
    if (match && match[1]) {
      return match[1].replace(" - YouTube", "").trim();
    }
  } catch (err) {
    return null;
  }
};

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

const add_to_queue = async (input) => {
  const accessToken = await get_access_token();
  let uri = null;

  if (spotifyPlaylistOrAlbumRegex.test(input) || youtubePlaylistRegex.test(input)) {
    return {
      success: false,
      code: "INVALID_LINK_TYPE",
      message: "❌ Only Spotify/YouTube track links are supported. Playlists and albums are not supported.",
    };
  }

  const spotifyTrackMatch = input.match(spotifyTrackRegex);
  if (spotifyTrackMatch) {
    uri = `spotify:track:${spotifyTrackMatch[1]}`;
  }

  const youtubeMatch = input.match(youtubeVideoRegex);
  if (youtubeMatch) {
    const title = await getYouTubeTitle(youtubeMatch[1]);
    if (!title) {
      return { success: false, code: "YOUTUBE_FETCH_ERROR", message: "❌ Failed to retrieve YouTube title." };
    }
    const track = await searchSpotifyTrack(title, accessToken);
    if (!track) {
      return { success: false, code: "NO_RESULTS", message: `No results found for: "${title}"` };
    }
    uri = track.uri;
  }

  if (!uri) {
    const track = await searchSpotifyTrack(input, accessToken);
    if (!track) {
      return { success: false, code: "NO_RESULTS", message: `No results found for: "${input}"` };
    }
    uri = track.uri;
  }

  try {
    await axios.post(
      `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return { success: true, code: "ADDED_TO_QUEUE", message: `✅ Added to queue: ${uri}` };
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