const axios = require('axios');

const create_schedule = async ({ title, categoryId, startDateTime, duration }) => {
  return axios.post(
    "https://api.twitch.tv/helix/schedule/segment",
    {
      broadcaster_id: env.twitch.channel.id,
      start_time: startDateTime,
      timezone: env.app.timeZone,
      is_recurring: true,
      duration: `${duration * 60}`,
      title,
      category_id: categoryId,
    },
    {
      headers: {
        "Client-ID": env.twitch.channel.clientId,
        Authorization: `Bearer ${env.twitch.channel.accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
};

module.exports = create_schedule;