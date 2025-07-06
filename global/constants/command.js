const commandConstant = [
  { command: 'ask', restricted: false, description: 'Ask a question and get a response.' },
  { command: 'brb', restricted: true, description: 'Set the bot to BRB mode.' },
  { command: 'censor', restricted: true, description: 'Toggle or manage censorship settings in the overlay.' },
  { command: 'date', restricted: false, description: 'Display today\'s date based on timezone.' },
  { command: 'dn', restricted: false, description: 'Get a deez nuts joke.' },
  { command: 'fact', restricted: false, description: 'Receive a random fun or interesting fact.' },
  { command: 'lurk', restricted: false, description: 'Let the stream know you\'re watching quietly in the background.' },
  { command: 'ping', restricted: false, description: 'Check if the bot is online.' },
  { command: 'pomodoro', restricted: true, description: 'Set pomodoro sessions for focused work and break intervals.' },
  { command: 'schedule', restricted: false, description: 'Show the stream schedule.' },
  { command: 'time', restricted: false, description: 'Display the current time based on timezone.' },
  { command: 'top', restricted: false, description: 'Get the top players of the Typing Game.' },
  { command: 'topic', restricted: false, description: 'Suggest a random conversation starter.' },
];

module.exports = commandConstant;