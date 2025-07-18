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
  { command: 'raid', restricted: false, description: 'Start the raid process or send only the raid message.' },
  { command: 'schedule', restricted: false, description: 'Show the stream schedule.' },
  { command: 'time', restricted: false, description: 'Display the current time based on timezone.' },
  { command: 'todo', restricted: true, description: 'Set tasks when working' },
  { command: 'top', restricted: false, description: 'Get the top players of the Typing Game.' },
  { command: 'topic', restricted: false, description: 'Suggest a random conversation starter.' },
  { command: 'wallet', restricted: false, description: 'Get the amount of Bos Coins and Bos Gold that you have.' },
  { command: 'winner', restricted: false, description: 'Get the winner of the previous Typing Game.' },
];

module.exports = commandConstant;