const { broadcastToClient } = require('@global/utilities/websocket');
const state = require('@global/utilities/state');

let pomodoroTimer = null;
let pomodoroTime = 20 * 60;
let breakTime = 10 * 60;
let currentTime = pomodoroTime;

let isPomodoroActive = false;
let isBreakTime = false;
let isPaused = false;
let isVisible = false;

const channelName = `#${env.twitch.channel.username}`;

function broadcastState() {
  broadcastToClient({
    type: 'TIMER_STATE',
    time: currentTime,
    isBreakTime,
    isPomodoroActive,
    isPaused,
    isVisible,
  });
}

function tick(client) {
  if (!state.isStreaming || isPaused || !isPomodoroActive) return;

  currentTime--;
  broadcastState();

  if (currentTime <= 0) {
    clearInterval(pomodoroTimer);
    if (isBreakTime) {
      client.say(channelName, 'Break time is over! Back to work! 💪');
      currentTime = pomodoroTime;
      isBreakTime = false;
    } else {
      client.say(channelName, 'Pomodoro complete! Time for a break! 🍅');
      currentTime = breakTime;
      isBreakTime = true;
    }
    startPomodoro(client);
  }
}

function startPomodoro(client) {
  if (!state.isStreaming) return;

  if (pomodoroTimer) clearInterval(pomodoroTimer);

  isPomodoroActive = true;
  isPaused = false;
  isVisible = true;

  pomodoroTimer = setInterval(() => tick(client), 1000);

  const breakMessage = `Starting break! You have ${Math.ceil(currentTime / 60)} minutes to relax! 🧘‍♂️`;
  const startMessage = `Starting Pomodoro! Focus for ${Math.ceil(currentTime / 60)} minutes! 🍅`;

  const statusMsg = isBreakTime ? breakMessage : startMessage;

  client.say(channelName, statusMsg);
}

function pausePomodoro(client) {
  if (!state.isStreaming) return;

  isPaused = true;
  isVisible = true;
  broadcastState();
  client.say(channelName, 'Pomodoro paused ⏸️');
}

function restartPomodoro(client) {
  if (!state.isStreaming) return;

  isPaused = false;
  isVisible = true;
  clearInterval(pomodoroTimer);
  currentTime = isBreakTime ? breakTime : pomodoroTime;
  startPomodoro(client);
  client.say(channelName, 'Timer restarted 🔄');
}

function startBreak(client) {
  if (!state.isStreaming) return;

  clearInterval(pomodoroTimer);
  isPomodoroActive = true;
  isBreakTime = true;
  isPaused = false;
  isVisible = true;
  currentTime = breakTime;
  startPomodoro(client);
  client.say(channelName, 'Starting a 10-minute break! ☕');
}

function hidePomodoro(client) {
  if (!state.isStreaming) return;

  isPaused = true;
  isVisible = false;
  broadcastState();
  client.say(channelName, 'Pomodoro hidden 👀️');
}

function handlePomodoroCommand(client, subcommand) {
  if (!state.isStreaming) {
    client.say(channelName, 'Pomodoro commands are only available while streaming 📺');
    return;
  }

  switch (subcommand) {
    case 'start':
      startPomodoro(client);
      break;
    case 'pause':
      pausePomodoro(client);
      break;
    case 'restart':
      restartPomodoro(client);
      break;
    case 'break':
      startBreak(client);
      break;
    case 'hide':
      hidePomodoro(client);
      break;
    default:
      client.say(channelName, 'Usage: !pomodoro [start|pause|restart|break|hide]');
  }
}

module.exports = handlePomodoroCommand;
