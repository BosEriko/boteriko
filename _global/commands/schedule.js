const env = require('@config/environments/base');

const handleScheduleCommand = function() {
  const start = env.stream.start;
  const duration = env.stream.duration;
  const days = env.stream.days;
  const timeZone = env.app.timeZone;
  const end = (start + duration) % 24;

  // Convert 24-hour time to 12-hour format
  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:00 ${period}`;
  };

  const formattedStart = formatHour(start);
  const formattedEnd = formatHour(end);

  // Capitalize weekdays
  const formattedDays = days.map(d => {
    const map = {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday'
    };
    return map[d] || d;
  });

  const dayList = formattedDays.join(', ').replace(/, ([^,]*)$/, ' and $1');

  return `I stream from ${formattedStart} to ${formattedEnd} (${timeZone}) on ${dayList}.`;
};

module.exports = handleScheduleCommand;
