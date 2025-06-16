let messageIndex = 0;

const messages = [
  "Join me on Discord (http://discord.boseriko.com)! Maybe we can watch Anime there after my stream?",
  "Follow me on TikTok (http://tiktok.boseriko.com) and YouTube (http://youtube.boseriko.com)!",
  "If you're interested here's my Anime list (http://anime.boseriko.com) and my Manga list (http://anime.boseriko.com)!",
  'Type the words falling down on the screen and have fun! Do "!top" to see the top typers of the current stream!',
  'Need a deez nuts joke? Type "!dn" followed by a topic, like "!dn tetris" or "!dn anime"',
  'Want to know your points? Type "!points" to see how many points you have!'
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(messages);

function handleInformationUtility(client) {
  const message = messages[messageIndex];
  client.say(`#${process.env.CHANNEL_USERNAME}`, `📢 ${message}`);

  messageIndex = (messageIndex + 1) % messages.length;
}

module.exports = handleInformationUtility;