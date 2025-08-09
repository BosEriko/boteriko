const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const handleTimeCommand = function (type) {
  const timezone = env.app.timeZone;
  const now = dayjs().tz(timezone);

  if (type === 'time') {
    return `🕒 Current time (${timezone}): ${now.format('hh:mm A')}`;
  }

  if (type === 'date') {
    return `📅 Current date (${timezone}): ${now.format('MMMM D, YYYY')}`;
  }

  return `❓ Unknown type "${type}". Use "time" or "date".`;
};

module.exports = handleTimeCommand;
