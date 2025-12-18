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

    state.raidDestination = input;
    return `🎯 Raid destination set to "${input}"`;
};

module.exports = auto_raid;
