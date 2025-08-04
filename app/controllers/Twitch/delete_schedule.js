const env = require("@config/environments/base");
const axios = require('axios');

const delete_schedule = async (id) => {
  return axios.delete("https://api.twitch.tv/helix/schedule/segment", {
    headers: {
      "Client-ID": env.twitch.channel.clientId,
      Authorization: `Bearer ${env.twitch.channel.accessToken}`,
    },
    params: {
      broadcaster_id: env.twitch.channel.id,
      id
    },
  });
};

module.exports = delete_schedule;