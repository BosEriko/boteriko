const TWITCH = 'Twitch';
const DISCORD = 'Discord';

const Command = [
  { command: 'attack', parameter: true, availability: [TWITCH], restricted: false, description: 'Attack someone in Stream Avatar.' },
  { command: 'back', parameter: false, availability: [TWITCH], restricted: true, description: 'Go back to streaming.' },
  { command: 'bomb', parameter: true, availability: [TWITCH], restricted: false, description: 'Use Bomb in Stream Avatar' },
  { command: 'brb', parameter: true, availability: [TWITCH], restricted: true, description: 'Set the stream to BRB mode.' },
  { command: 'censor', parameter: false, availability: [TWITCH], restricted: true, description: 'Toggle or manage censorship settings in the overlay.' },
  { command: 'commands', parameter: false, availability: [DISCORD], restricted: false, description: 'Get the list of commands for both Twitch and Discord.' },
  { command: 'date', parameter: false, availability: [TWITCH, DISCORD], restricted: false, description: 'Display today\'s date based on timezone.' },
  { command: 'hug', parameter: true, availability: [TWITCH], restricted: false, description: 'Hug someone in Stream Avatar.' },
  { command: 'jump', parameter: false, availability: [TWITCH], restricted: false, description: 'Jump on Stream Avatar' },
  { command: 'lurk', parameter: false, availability: [TWITCH], restricted: false, description: 'Let the stream know you\'re watching quietly in the background.' },
  { command: 'ping', parameter: false, availability: [TWITCH, DISCORD], restricted: false, description: 'Check if the bot is online.' },
  { command: 'pomodoro', parameter: true, availability: [TWITCH], restricted: true, description: 'Set pomodoro sessions for focused work and break intervals.' },
  { command: 'queue', parameter: false, availability: [TWITCH], restricted: false, description: 'Show a link to the queue.' },
  { command: 'raid', parameter: true, availability: [TWITCH], restricted: false, description: 'Start the raid process or send only the raid message.' },
  { command: 'schedule', parameter: false, availability: [TWITCH, DISCORD], restricted: false, description: 'Show the stream schedule.' },
  { command: 'setgame', parameter: true, availability: [TWITCH], restricted: true, description: 'Set the game/category.' },
  { command: 'steam', parameter: false, availability: [TWITCH, DISCORD], restricted: false, description: 'Get the steam link.' },
  { command: 'time', parameter: false, availability: [TWITCH, DISCORD], restricted: false, description: 'Display the current time based on timezone.' },
  { command: 'todo', parameter: true, availability: [TWITCH], restricted: true, description: 'Set tasks when working.' },
  { command: 'top', parameter: false, availability: [TWITCH], restricted: false, description: 'Get the top players of the Typing Game.' },
  { command: 'wallet', parameter: false, availability: [TWITCH], restricted: false, description: 'Get the amount of Bos Coins that you have.' },
  { command: 'winner', parameter: false, availability: [TWITCH], restricted: false, description: 'Get the winner of the previous Typing Game.' },
];

module.exports = Command;
