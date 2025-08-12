const String = require("../String");

const CustomReward = [
  {
    is_enabled: true,
    title: String.ADD_TO_QUEUE,
    prompt: "Add something to the music player — Spotify links supported!",
    is_user_input_required: true,
    cost: 50,
    background_color: "#1DB954",
    should_redemptions_skip_request_queue: false,
    is_max_per_stream_enabled: false,
    is_max_per_user_per_stream_enabled: false,
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 60,
    icon: {
      size_28: "https://i.imgur.com/CweZChK.png",
      size_56: "https://i.imgur.com/4S6Xrfl.png",
      size_112: "https://i.imgur.com/cc9H5pV.png"
    }
  },
];

module.exports = CustomReward;
