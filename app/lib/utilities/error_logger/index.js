const env = require('@config/environments/base');
const axios = require('axios');

function serializeError(err) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return err;
}

async function error_logger(message, data = null) {
  try {
    const avatar_url = "https://i.imgur.com/f6FsQJH.png";
    const username = "Error Log";
    const now = new Date().toISOString();

    let content = `[${now}] 🚨 ${message}`;

    if (data && Object.keys(data).length > 0) {
      let jsonBlock = JSON.stringify(serializeError(data), null, 2);
      const maxLength = 1800;

      if (jsonBlock.length > maxLength) {
        jsonBlock = jsonBlock.slice(0, maxLength) + '\n... (truncated)';
      }

      content += `\n\`\`\`json\n${jsonBlock}\n\`\`\``;
    }

    console.error(message, data);

    if (!env?.discord?.webhook?.error) {
      console.warn('⚠️ Discord error webhook URL not defined');
      return;
    }

    await axios.post(env.discord.webhook.error, { username, content, avatar_url });
  } catch (err) {
    console.error('❌ Failed to send log to Discord:', err.message);
  }
}

module.exports = error_logger;
