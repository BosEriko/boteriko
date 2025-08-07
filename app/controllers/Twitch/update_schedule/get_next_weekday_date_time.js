const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const get_next_weekday_date_time = (weekdayName, hour, timeZone) => {
  const daysMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDay = daysMap[weekdayName];
  if (targetDay === undefined) throw new Error(`Invalid weekday: ${weekdayName}`);

  const now = dayjs().tz(timeZone);
  const currentDay = now.day();
  const daysUntil = (targetDay - currentDay + 7) % 7 || 7;

  const target = now.add(daysUntil, "day").set("hour", hour).set("minute", 0).set("second", 0).set("millisecond", 0);

  return target.tz("UTC").toISOString();
};

module.exports = get_next_weekday_date_time;