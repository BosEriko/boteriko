const read_category_id_by_name = require("./read_category_id_by_name");
const read_schedule = require("./read_schedule");
const delete_schedule = require("./delete_schedule");
const create_schedule = require("./create_schedule");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const env = require("@config/environments/base");
const scheduleConstant = require("@twitch/constants/schedule");

// 🧠 Calculate next weekday at given hour (local to UTC using dayjs)
const getNextWeekdayDateTime = (weekdayName, hour, timeZone) => {
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


// 🧩 Main entry
const update_schedule = async () => {
  const timeZone = env.app.timeZone;
  const startHour = parseInt(env.stream.start, 10);
  const duration = parseInt(env.stream.duration, 10);
  const allowedDays = env.stream.days;
  const days = Object.keys(scheduleConstant).filter((day) =>
    allowedDays.includes(day.toLowerCase().slice(0, 3))
  );

  try {
    const existingSegments = await read_schedule();
    for (const segment of existingSegments) {
      await delete_schedule(segment.id);
    }
  } catch {}

  for (const day of days) {
    const { title, category } = scheduleConstant[day];

    const categoryId = await read_category_id_by_name(category);
    if (!categoryId) {
      continue;
    }

    try {
      const startDateTime = getNextWeekdayDateTime(day, startHour, timeZone);
      await create_schedule({ title, categoryId, startDateTime, duration });
    } catch (err) {
      console.error(`❌ Failed to schedule ${day}:`, err.response?.data || err.message);
    }
  }
};

module.exports = update_schedule;
