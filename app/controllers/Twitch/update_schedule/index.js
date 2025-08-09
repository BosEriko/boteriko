const create_schedule = require("../create_schedule");
const delete_schedule = require("../delete_schedule");
const read_category_id_by_name = require("../read_category_id_by_name");
const read_schedule = require("../read_schedule");

const get_next_weekday_date_time = require("./get_next_weekday_date_time");

// 🧩 Main entry
const update_schedule = async () => {
  const timeZone = Config.app.timeZone;
  const startHour = parseInt(Config.stream.start, 10);
  const duration = parseInt(Config.stream.duration, 10);
  const allowedDays = Config.stream.days;
  const days = Object.keys(Constant.Schedule).filter((day) => allowedDays.includes(day.toLowerCase().slice(0, 3)));

  let existingSegments = [];

  try {
    existingSegments = await read_schedule();
  } catch (err) {
    if (err.response?.status !== 404) {
      await Utility.error_logger("❌ Failed to read schedule:", err.message);
    }
  }

  for (const segment of existingSegments) {
    try {
      await delete_schedule(segment.id);
    } catch (err) {
      if (err.response?.status !== 404) {
        await Utility.error_logger(`Unexpected error on ${segment.id}:`, err.message);
      }
    }
  }

  for (const day of days) {
    const { title, category } = Constant.Schedule[day];

    const categoryId = await read_category_id_by_name(category);
    if (!categoryId) continue;

    try {
      const startDateTime = get_next_weekday_date_time(day, startHour, timeZone);
      await create_schedule({ title, categoryId, startDateTime, duration });
    } catch (err) {
      console.error(`❌ Failed to schedule ${day}:`, err.response?.data || err.message);
    }
  }
};

module.exports = update_schedule;
