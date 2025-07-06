const llmUtility = require('@global/utilities/llm');
const topicConstant = require('@global/constants/topic');

function getRandomFact(facts) {
  const index = Math.floor(Math.random() * facts.length);
  return facts[index];
}

async function handleFactCommand() {
  const fact = getRandomFact(topicConstant);

  try {
    return await llmUtility(
        'You are a helpful assistant for a Twitch streamer. Your job is to give facts when the chat goes quiet.',
        `Give me a short, stream-friendly fact (1 sentence max) about ${fact}.`
    );
  } catch (err) {
    console.error("Something went wrong with the fact utility:", err);
    return `I can't think of a fact about ${fact}. Please try again later!`;
  }
}

module.exports = handleFactCommand;