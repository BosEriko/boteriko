const format_time = require("./format_time");
const sync_firebase_user = require("./sync_firebase_user");
const title_generator = require("./title_generator");

const Concern = {
  format_time,
  sync_firebase_user,
  title_generator,
}

module.exports = Concern;