const llmUtility = require('@global/utilities/llm');
const topicConstant = require('@global/constants/topic');

function getRandomTopic(topics) {
  const index = Math.floor(Math.random() * topics.length);
  return topics[index];
}

async function handleTopicCommand() {
  const topic = getRandomTopic(topicConstant);

  try {
    return await llmUtility(
        'You are a helpful assistant for a Twitch streamer. Your job is to suggest fun and casual conversation starters when the chat goes quiet.',
        `Give me a short, stream-friendly conversation starter (1 sentence max) about ${topic}.`
    );
  } catch (err) {
    console.error("Something went wrong with the conversation utility:", err);
    return `Let's talk about something fun like ${topic}!`;
  }
}

module.exports = handleTopicCommand;