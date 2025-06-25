const env = require('@global/utilities/env');
const llmUtility = require('@global/utilities/llm');

async function handleDeezCommand(prompt) {
  if (!prompt || prompt.trim() === "") {
    return "Please provide a topic for the Deez Nuts joke! 🤔";
  }

  try {
    return await llmUtility(
      'You are a friendly and funny deez nut bot for Twitch chat. Your job is to make deez nuts joke.',
      `Create Deez Nuts joke about ${prompt}`
    );
  } catch (err) {
    console.error('❌ OpenRouter Error:', err?.response?.data || err.message);
    return "I couldn't come up with a joke about that. Try something else!";
  }
}

module.exports = handleDeezCommand;