const axios = require('axios');

const create_schedule = async ({ title, categoryId, startDateTime, duration }) => {
  return axios.post(
    "https://api.twitch.tv/helix/schedule/segment",
    {
      broadcaster_id: Config.twitch.channel.id,
      start_time: startDateTime,
      timezone: Config.app.timeZone,
      is_recurring: true,
      duration: `${duration * 60}`,
      title,
      category_id: categoryId,
    },
    {
      headers: {
        "Client-ID": Config.twitch.channel.clientId,
        Authorization: `Bearer ${Config.twitch.channel.accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
};

module.exports = create_schedule;