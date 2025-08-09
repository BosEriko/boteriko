const axios = require('axios');

const delete_schedule = async (id) => {
  return axios.delete("https://api.twitch.tv/helix/schedule/segment", {
    headers: {
      "Client-ID": Config.twitch.channel.clientId,
      Authorization: `Bearer ${Config.twitch.channel.accessToken}`,
    },
    params: {
      broadcaster_id: Config.twitch.channel.id,
      id
    },
  });
};

module.exports = delete_schedule;