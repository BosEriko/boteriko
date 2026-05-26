const cron = require('node-cron');
const state = require('@global/utilities/state');

// Utilities
const { broadcastToClient } = require('@global/utilities/websocket');
const { handleTypingWords } = require('@twitch/games/typing');
const handleClipUtility = require('@twitch/utilities/clip');
const handleInformationUtility = require('@twitch/utilities/information');
const handleRaidUtility = require('@twitch/utilities/raid');
const handleSetupUtility = require('@twitch/utilities/setup');
const handleStreamDetailUtility = require("@global/utilities/streamDetail");

// Data
const getLastTypingWinner = require('@twitch/utilities/typingWinner');

function handleCronUtility(client) {
  const timezone = Config.app.timeZone;
  // ------------------------------------------- Functions -------------------------------------------

  // Check Stream Availability Function
  async function loadStreamDetails() {
    try {
      const streamDetail = await handleStreamDetailUtility();
      const typingWinner = await getLastTypingWinner();
      state.streamDetail = streamDetail || null;
      state.isStreaming = !!streamDetail;
      state.winners.typing = typingWinner;
      broadcastToClient({
        type: 'STREAM_DETAIL',
        streamDetail: streamDetail || null,
        isStreaming: !!streamDetail,
        winners: {
          firstChat: state.winners.firstChat,
          typing: typingWinner,
        },
        steam: state.steam,
      });
    } catch (error) {
      state.streamDetail = null;
      state.isStreaming = false;
      await Utility.error_logger("Error checking stream availability:", error.message);
    }
  }

  // Cooldown Function
  function retryWhenOffline(callback) {
    if (state.isStreaming) {
      setTimeout(() => {
        retryWhenOffline(callback);
      }, 60 * 60 * 1000);
    } else {
      callback();
    }
  }

  // Top Typer Function
  async function topTyper() {
    const topTyper = await Controller.Typing.top_typer();
    const noScoreMessage = `No one has scored yet! Snatch the top spot and be the first! ⌨️`;

    if (!topTyper) {
      client.say(`#${Config.twitch.channel.username}`, noScoreMessage);
      return;
    }

    const leaderMessage = `${topTyper.username} is currently leading the typing game with a score of ${topTyper.score}! 🔥`;
    client.say(`#${Config.twitch.channel.username}`, leaderMessage);
  }

  // Announce Achievement Function
  async function announceAchievement() {
    if (!state.steam.gamePercent) return;

    const progress = state.steam.gamePercent;
    const message = `${Config.twitch.channel.username} has ${progress}% progress on ${state.steam.gameName}. Check more details at https://steamcommunity.com/id/${Config.twitch.channel.username}/stats/${state.steam.gameId}/achievements`;

    client.say(`#${Config.twitch.channel.username}`, message);
  }

  // ------------------------------------------- Cron Jobs -------------------------------------------

  // Every 1 minute
  cron.schedule('* * * * *', async () => {
    if (state.isStreaming) await Controller.Steam.update_twitch(client);
    await loadStreamDetails();
    if (state.isStreaming) handleTypingWords();
  }, { timezone });

  // Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    if (state.isStreaming) handleInformationUtility(client);
    await handleClipUtility();
  }, { timezone });

  // Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    if (state.isStreaming) await topTyper();
    if (state.isStreaming) await announceAchievement();
  }, { timezone });

  // Every day 1 hour before stream start
  const streamStartHour = parseInt(Config.stream.start, 10);
  const oneHourBeforeStream = (streamStartHour + 23) % 24;
  cron.schedule(`0 ${oneHourBeforeStream} * * *`, () => {
    retryWhenOffline(() => {
      state.reset();
      handleSetupUtility(client);
    });
  }, { timezone });

  // Every end of stream
  const streamEndHour = parseInt(Config.stream.start, 10) + parseInt(Config.stream.duration, 10);
  cron.schedule(`0 ${streamEndHour} * * *`, () => {
    if (state.isStreaming && state.autoRaid) handleRaidUtility(client, state.raidDestination, true);
  }, { timezone });
}

module.exports = handleCronUtility;
