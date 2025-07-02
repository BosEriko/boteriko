const { broadcastToClient } = require('@global/utilities/websocket');

function handleEventUtility(client) {
  // Raids
  client.on('raided', (channel, username, viewers) => {
    const name = username || 'Someone';
    const message = `🚀 ${name} is raiding with ${viewers} viewer${viewers !== 1 ? 's' : ''}! Thank you!`;
    broadcastToClient({ type: 'FEED', feed_type: 'event', message });
    client.say(channel, message);
  });

  // Cheers
  client.on('cheer', (channel, userstate, msg) => {
    const username = userstate['display-name'] || 'Anonymous';
    const bits = userstate['bits'] || 0;
    const message = `✨ ${username} cheered ${bits} bits: ${msg}`;
    broadcastToClient({ type: 'FEED', feed_type: 'event', message });
    client.say(channel, message);
  });

  // Subscriptions
  client.on('subscription', (channel, username, method, msg, userstate) => {
    const name = username || 'Someone';
    const message = `🎉 ${name} just subscribed! Thank you for the support!`;
    broadcastToClient({ type: 'FEED', feed_type: 'event', message });
    client.say(channel, message);
  });

  // Resubscriptions
  client.on('resub', (channel, username, months, msg, userstate, methods) => {
    const name = username || 'Someone';
    const monthsCount = months || 1;
    const message = `🔁 ${name} resubscribed for ${monthsCount} month${monthsCount !== 1 ? 's' : ''}!`;
    broadcastToClient({ type: 'FEED', feed_type: 'event', message });
    client.say(channel, message);
  });

  // Gifted Subscriptions
  client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
    const gifter = username || 'Someone';
    const giftedTo = recipient || 'someone';
    const message = `🎁 ${gifter} gifted a sub to ${giftedTo}!`;
    broadcastToClient({ type: 'FEED', feed_type: 'event', message });
    client.say(channel, message);
  });

  // Hosts
  client.on('hosted', (channel, username, viewers, autohost) => {
    const name = username || 'Someone';
    const viewerCount = viewers || 0;
    const hostType = autohost ? 'Auto-host' : 'Host';
    const message = `📺 ${hostType} by ${name} with ${viewerCount} viewer${viewerCount !== 1 ? 's' : ''}.`;
    broadcastToClient({ type: 'FEED', feed_type: 'event', message });
    client.say(channel, message);
  });
}

module.exports = handleEventUtility;
