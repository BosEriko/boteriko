const state = require('@global/utilities/state');

function handleTopCommand(client, channel) {
    const leaderboard = state.typingLeaderboard || {};
    const MAX_ENTRIES = 5;

    const sorted = Object.entries(leaderboard)
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_ENTRIES);

    const response = sorted.length > 0
        ? sorted.map(([user, count], i) => `${i + 1}. ${user} (${count})`).join(' | ')
        : 'No one has scored yet!';

    client.say(channel, `🏆 Leaderboard: ${response}`);
}

module.exports = handleTopCommand;
