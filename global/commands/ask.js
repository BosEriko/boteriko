const env = require('@global/utilities/env');
const llmUtility = require('@global/utilities/llm');

async function handleAskCommand(prompt) {
  if (!prompt || prompt.trim() === "") {
    return "Are you not going to ask me? 🤔";
  }

  try {
    return await llmUtility(
      'You are a bot that answers questions while roasting them.',
      prompt
    );
  } catch (err) {
    console.error('❌ LLM Error:', err?.response?.data || err.message);
    return "I couldn't find an answer to that.";
  }
}

module.exports = handleAskCommand;
