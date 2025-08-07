const Constant = require("@constant");

const handleErrorUtility = require('@global/utilities/error');

const create_schedule = require("../create_schedule");
const delete_schedule = require("../delete_schedule");
const read_category_id_by_name = require("../read_category_id_by_name");
const read_schedule = require("../read_schedule");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const env = require("@config/environments/base");

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
  const days = Object.keys(Constant.Schedule).filter((day) => allowedDays.includes(day.toLowerCase().slice(0, 3)));

  let existingSegments = [];

  try {
    existingSegments = await read_schedule();
  } catch (err) {
    if (err.response?.status !== 404) {
      await handleErrorUtility("❌ Failed to read schedule:", err.message);
    }
  }

  for (const segment of existingSegments) {
    try {
      await delete_schedule(segment.id);
    } catch (err) {
      if (err.response?.status !== 404) {
        await handleErrorUtility(`Unexpected error on ${segment.id}:`, err.message);
      }
    }
  }

  for (const day of days) {
    const { title, category } = Constant.Schedule[day];

    const categoryId = await read_category_id_by_name(category);
    if (!categoryId) continue;

    try {
      const startDateTime = getNextWeekdayDateTime(day, startHour, timeZone);
      await create_schedule({ title, categoryId, startDateTime, duration });
    } catch (err) {
      console.error(`❌ Failed to schedule ${day}:`, err.response?.data || err.message);
    }
  }
};

module.exports = update_schedule;
