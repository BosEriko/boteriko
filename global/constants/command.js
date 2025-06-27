const commandConstant = [
  { command: 'ask', restricted: false, description: 'Ask a question and get a response.' },
  { command: 'brb', restricted: true, description: 'Set the bot to BRB mode.' },
  { command: 'dn', restricted: false, description: 'Get a deez nuts joke.' },
  { command: 'ping', restricted: false, description: 'Check if the bot is online.' },
  { command: 'pomodoro', restricted: true, description: 'Set pomodoro sessions' },
  { command: 'top', restricted: false, description: 'Get the top players of the Typing Game.' },
  { command: 'topic', restricted: false, description: 'Suggest a random conversation starter.' },
  { command: 'time', restricted: false, description: 'Display the current time based on timezone.' },
  { command: 'date', restricted: false, description: 'Display today\'s date based on timezone.' },
];

module.exports = commandConstant;