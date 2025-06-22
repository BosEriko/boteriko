function handleEventUtility(client) {
  // Raids
  client.on('raided', (channel, username, viewers) => {
    const name = username || 'Someone';
    client.say(channel, `🚀 ${name} is raiding with ${viewers} viewer${viewers !== 1 ? 's' : ''}! Thank you!`);
  });

  // Cheers
  client.on('cheer', (channel, userstate, message) => {
    const username = userstate['display-name'] || 'Anonymous';
    const bits = userstate['bits'] || 0;
    client.say(channel, `✨ ${username} cheered ${bits} bits: ${message}`);
  });

  // Subscriptions
  client.on('subscription', (channel, username, method, message, userstate) => {
    const name = username || 'Someone';
    client.say(channel, `🎉 ${name} just subscribed! Thank you for the support!`);
  });

  // Resubscriptions
  client.on('resub', (channel, username, months, message, userstate, methods) => {
    const name = username || 'Someone';
    const monthsCount = months || 1;
    client.say(channel, `🔁 ${name} resubscribed for ${monthsCount} month${monthsCount !== 1 ? 's' : ''}!`);
  });

  // Gifted Subscriptions
  client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
    const gifter = username || 'Someone';
    const giftedTo = recipient || 'someone';
    client.say(channel, `🎁 ${gifter} gifted a sub to ${giftedTo}!`);
  });

  // Hosts
  client.on('hosted', (channel, username, viewers, autohost) => {
    const name = username || 'Someone';
    const viewerCount = viewers || 0;
    const hostType = autohost ? 'Auto-host' : 'Host';
    client.say(channel, `📺 ${hostType} by ${name} with ${viewerCount} viewer${viewerCount !== 1 ? 's' : ''}.`);
  });
}

module.exports = handleEventUtility;
