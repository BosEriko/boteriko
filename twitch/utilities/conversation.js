const axios = require('axios');

async function handleConversationUtility(client, username, ai_key) {
  const preferredTopics = [
    'Tetris',
    'Programming',
    'Fortnite',
    'Anime',
    'Game development',
    'Streaming',
    'Japan',
    'Food'
  ];

  try {
    const aiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for a Twitch streamer. Your job is to suggest fun and casual conversation starters when the chat goes quiet.',
          },
          {
            role: 'user',
            content: `Give me a short, stream-friendly conversation starter (1 sentence max) based on one of these topics: ${preferredTopics.join(', ')}.`,
          }
        ],
        max_tokens: 60,
      },
      {
        headers: {
          Authorization: `Bearer ${ai_key}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const message = aiResponse.data.choices[0].message.content.trim();
    client.say(`#${username}`, `💭 ${message}`);
  } catch (err) {
    console.error("Something went wrong with the conversation utility:", err);
  }
}

module.exports = handleConversationUtility;