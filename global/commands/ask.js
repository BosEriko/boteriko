const llmUtility = require('@global/utilities/llm');
const handleErrorUtility = require('@global/utilities/error');

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
    await handleErrorUtility('❌ LLM Error:', err?.response?.data || err.message);
    return "I couldn't find an answer to that.";
  }
}

module.exports = handleAskCommand;
