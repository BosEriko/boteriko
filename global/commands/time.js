const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const env = require('@global/utilities/env');

dayjs.extend(utc);
dayjs.extend(timezone);

const handleTimeCommand = function (type) {
  const tz = env.tz || 'Asia/Manila';
  const now = dayjs().tz(tz);

  if (type === 'time') {
    return `🕒 Current time (${tz}): ${now.format('hh:mm A')}`;
  }

  if (type === 'date') {
    return `📅 Current date (${tz}): ${now.format('MMMM D, YYYY')}`;
  }

  return `❓ Unknown type "${type}". Use "time" or "date".`;
};

module.exports = handleTimeCommand;
