const llmUtility = require('@global/utilities/llm');
const topicConstant = require('@global/constants/topics');

async function topicCommand(apiKey) {
  try {
    return await llmUtility(
        apiKey,
        'You are a helpful assistant for a Twitch streamer. Your job is to suggest fun and casual conversation starters when the chat goes quiet.',
        `Give me a short, stream-friendly conversation starter (1 sentence max) based on one of these topics: ${topicConstant.join(', ')}.`
    );
  } catch (err) {
    console.error("Something went wrong with the conversation utility:", err);
  }
}

module.exports = topicCommand;