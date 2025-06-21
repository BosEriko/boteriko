const llmUtility = require('@global/utilities/llm');

async function handleConversationUtility(client, username, aiKey) {
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
    const message = await llmUtility(
        aiKey,
        'You are a helpful assistant for a Twitch streamer. Your job is to suggest fun and casual conversation starters when the chat goes quiet.',
        `Give me a short, stream-friendly conversation starter (1 sentence max) based on one of these topics: ${preferredTopics.join(', ')}.`
    );
    client.say(`#${username}`, `💭 ${message}`);
  } catch (err) {
    console.error("Something went wrong with the conversation utility:", err);
  }
}

module.exports = handleConversationUtility;