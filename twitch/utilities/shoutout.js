const axios = require('axios');
const broadcastToClient = require('@global/utilities/websocket');

const shoutedOutUsers = new Set();

async function handleShoutoutUtility(client, channel, tags, user, apiKey) {
  const username = tags.username;
  const displayName = tags['display-name'];

  const isMod = tags.badges?.moderator === '1';
  const isBroadcaster = tags.badges?.broadcaster === '1';

  if (isMod || isBroadcaster) {
    console.log(`Skipping shoutout for ${username} — user is a ${isMod ? 'moderator' : 'broadcaster'}.`);
    return;
  }

  if (shoutedOutUsers.has(username)) return;
  shoutedOutUsers.add(username);

  try {
    const isStreamer = ['affiliate', 'partner'].includes(user?.broadcaster_type);
    if (!isStreamer) {
      console.log(`Skipping shoutout for ${username} — not a streamer.`);
      return;
    }

    const description = user?.description || "a mysterious guest with no description";
    const profileImageUrl = user?.profile_image_url || null;

    const aiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly and funny shoutout bot for Twitch chat. Your job is to make viewers feel welcome based on their bio.',
          },
          {
            role: 'user',
            content: `Create a Twitch shoutout message for a streamer named ${displayName}. Their about section says: "${description}". Make it engaging but short — maximum 350 characters. End the message cleanly.`,
          }
        ],
        max_tokens: 60,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const shoutoutMessage = aiResponse.data.choices[0].message.content.trim();
    broadcastToClient({ type: 'SHOUTOUT_DETAILS', url: profileImageUrl || null, username: username });

    client.say(channel, `🤖 ${shoutoutMessage}`);
  } catch (err) {
    console.error('❌ Shoutout error:', err?.response?.data || err.message);
    client.say(channel, `Shoutout to @${username}! Thanks for dropping by!`);
  }
}

module.exports = handleShoutoutUtility;