const axios = require('axios');
const env = require('@global/utilities/env');

async function handleLinkUtility(user, message) {
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  const links = message.match(urlRegex);

  if (links) {
    console.log(`🔗 Links found from ${user}:`, links);
  }
}

module.exports = handleLinkUtility;
