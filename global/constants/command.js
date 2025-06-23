const commandConstant = [
  { command: 'topic', restricted: false, description: 'Suggest a random conversation starter.' },
  { command: 'ask', restricted: false, description: 'Ask a question and get a response.' },
  { command: 'ping', restricted: false, description: 'Check if the bot is online.' },
  { command: 'brb', restricted: true, description: 'Set the bot to BRB mode.' },
];

module.exports = commandConstant;