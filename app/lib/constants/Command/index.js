const TWITCH = 'Twitch';
const DISCORD = 'Discord';

const StreamAvatarCommand = [
  { command: 'attack',          parameter: true,  availability: [TWITCH],           restricted: false,  streaming: false, description: 'Attack someone in Stream Avatar.' },
  { command: 'battleroyale ',   parameter: false, availability: [TWITCH],           restricted: false,  streaming: false, description: 'Starts a battleroyale with all active avatars on Stream Avatar.' },
  { command: 'bomb',            parameter: true,  availability: [TWITCH],           restricted: false,  streaming: false, description: 'Use Bomb in Stream Avatar.' },
  { command: 'fart',            parameter: false, availability: [TWITCH],           restricted: false,  streaming: false, description: 'Fart on Stream Avatar.' },
  { command: 'hug',             parameter: true,  availability: [TWITCH],           restricted: false,  streaming: false, description: 'Hug someone in Stream Avatar.' },
  { command: 'jump',            parameter: false, availability: [TWITCH],           restricted: false,  streaming: false, description: 'Jump on Stream Avatar.' },
];

const GlobalCommand = [
  { command: 'autoraid',        parameter: true,  availability: [TWITCH],           restricted: true,   streaming: true,  description: 'Toggle auto raid on/off or set the destination.' },
  { command: 'back',            parameter: false, availability: [TWITCH],           restricted: true,   streaming: true,  description: 'Go back to streaming.' },
  { command: 'brb',             parameter: true,  availability: [TWITCH],           restricted: true,   streaming: true,  description: 'Set the stream to BRB mode.' },
  { command: 'censor',          parameter: false, availability: [TWITCH],           restricted: true,   streaming: true,  description: 'Toggle or manage censorship settings in the overlay.' },
  { command: 'commands',        parameter: false, availability: [DISCORD],          restricted: false,  streaming: false, description: 'Get the list of commands for both Twitch and Discord.' },
  { command: 'date',            parameter: false, availability: [TWITCH, DISCORD],  restricted: false,  streaming: false, description: 'Display today\'s date based on timezone.' },
  { command: 'discord',         parameter: false, availability: [TWITCH, DISCORD],  restricted: false,  streaming: false, description: 'Show the Discord link.' },
  { command: 'lurk',            parameter: false, availability: [TWITCH],           restricted: false,  streaming: false, description: 'Let the stream know you\'re watching quietly in the background.' },
  { command: 'ping',            parameter: false, availability: [TWITCH, DISCORD],  restricted: false,  streaming: false, description: 'Check if the bot is online.' },
  { command: 'pomodoro',        parameter: true,  availability: [TWITCH],           restricted: true,   streaming: true,  description: 'Set pomodoro sessions for focused work and break intervals.' },
  { command: 'profile',         parameter: true,  availability: [TWITCH, DISCORD],  restricted: false,  streaming: false, description: 'Show the BosEriko+ Profile link.' },
  { command: 'queue',           parameter: false, availability: [TWITCH],           restricted: false,  streaming: true,  description: 'Show a link to the song queue.' },
  { command: 'raid',            parameter: true,  availability: [TWITCH],           restricted: false,  streaming: false, description: 'Start the raid process or send only the raid message.' },
  { command: 'schedule',        parameter: false, availability: [TWITCH, DISCORD],  restricted: false,  streaming: false, description: 'Show the stream schedule.' },
  { command: 'setgame',         parameter: true,  availability: [TWITCH],           restricted: true,   streaming: false, description: 'Set the game/category.' },
  { command: 'settitle',        parameter: true,  availability: [TWITCH],           restricted: true,   streaming: false, description: 'Set the title.' },
  { command: 'song',            parameter: false, availability: [TWITCH],           restricted: false,  streaming: true,  description: 'Show information on the currently playing song.' },
  { command: 'steam',           parameter: false, availability: [TWITCH, DISCORD],  restricted: false,  streaming: false, description: 'Get the steam link.' },
  { command: 'time',            parameter: false, availability: [TWITCH, DISCORD],  restricted: false,  streaming: false, description: 'Display the current time based on timezone.' },
  { command: 'todo',            parameter: true,  availability: [TWITCH],           restricted: true,   streaming: true,  description: 'Set tasks when working.' },
  { command: 'top',             parameter: false, availability: [TWITCH],           restricted: false,  streaming: false, description: 'Get the top players of the Typing Game.' },
  { command: 'winner',          parameter: false, availability: [TWITCH],           restricted: false,  streaming: false, description: 'Get the winner of the previous Typing Game.' },
];

const Command = [
  ...StreamAvatarCommand,
  ...GlobalCommand,
];

module.exports = Command;
