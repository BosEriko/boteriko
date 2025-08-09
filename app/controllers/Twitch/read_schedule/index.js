const axios = require('axios');

const read_schedule = async () => {
  const res = await axios.get("https://api.twitch.tv/helix/schedule", {
    headers: {
      "Client-ID": Config.twitch.channel.clientId,
      Authorization: `Bearer ${Config.twitch.channel.accessToken}`,
    },
    params: {
      broadcaster_id: Config.twitch.channel.id,
    },
  });

  return res.data.data.segments || [];
};

module.exports = read_schedule;