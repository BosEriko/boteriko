const state = require('@global/utilities/state');

const auto_raid = (input) => {
    if (!input) {
        return '⚠️ Please provide an argument: on, off, or a raid destination.';
    }

    const value = input.toLowerCase();

    if (value === 'on') {
        state.autoRaid = true;
        return '✅ Auto raid turned on';
    }

    if (value === 'off') {
        state.autoRaid = false;
        return '⛔ Auto raid turned off';
    }

    const username = input.trim().split(' ')[0].replace(/^@/, '');
    state.raidDestination = username;
    return `🎯 Raid destination set to "${username}"`;
};

module.exports = auto_raid;
