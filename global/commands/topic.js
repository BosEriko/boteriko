const llmUtility = require('@global/utilities/llm');

async function topicCommand(apiKey) {
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
    return await llmUtility(
        apiKey,
        'You are a helpful assistant for a Twitch streamer. Your job is to suggest fun and casual conversation starters when the chat goes quiet.',
        `Give me a short, stream-friendly conversation starter (1 sentence max) based on one of these topics: ${preferredTopics.join(', ')}.`
    );
  } catch (err) {
    console.error("Something went wrong with the conversation utility:", err);
  }
}

module.exports = topicCommand;