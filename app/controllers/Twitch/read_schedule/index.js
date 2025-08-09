const axios = require('axios');

const read_schedule = async () => {
  const res = await axios.get("https://api.twitch.tv/helix/schedule", {
    headers: {
      "Client-ID": env.twitch.channel.clientId,
      Authorization: `Bearer ${env.twitch.channel.accessToken}`,
    },
    params: {
      broadcaster_id: env.twitch.channel.id,
    },
  });

  return res.data.data.segments || [];
};

module.exports = read_schedule;